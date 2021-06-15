#include "homekit.h"

hap_acc_t* accessory;
hap_serv_t* service;

const int kPosStateMin = 0; // ”Going to the minimum value specified in metadata” (UP, target < pos)
const int kPosStateMax = 1; // ”Going to the maximum value specified in metadata” (DOWN, target > pos)
const int kPosStateStopped = 2; // ”Stopped” (STOP, target == pos)

/**
 * @brief Moves blinds down and up slightly to identify one from another.
 *
 * @todo impl
 *
 * @param ha
 * @return int
 */
static int identify(hap_acc_t* ha) {
	WLOG_I(TAG, "Accessory identified");
	return HAP_SUCCESS;
}

/**
 * @brief Called when a Homekit controller requests reading of some characteristic
 *
 * @param hc
 * @param status_code
 * @param serv_priv
 * @param read_priv
 * @return int
 */
static int read_cb(hap_char_t* hc, hap_status_t* status_code, void* serv_priv, void* read_priv) {
	if (hap_req_get_ctrl_id(read_priv)) {
		WLOG_D(TAG, "Received read from %s", hap_req_get_ctrl_id(read_priv));
	}
	auto state = State::getInstance();
	auto typeName = hap_char_get_type_uuid(hc);
	WLOG_I(TAG, "READ - UUID: %s", typeName);
	// HAP_CHAR_UUID_CURRENT_POSITION 		6D
	// HAP_CHAR_UUID_TARGET_POSITION 		7C
	// HAP_CHAR_UUID_POSITION_STATE 		72
	// HAP_CHAR_UUID_OBSTRUCTION_DETECTED 	24
	// HAP_CHAR_UUID_NAME					23
	if (!strcmp(typeName, HAP_CHAR_UUID_CURRENT_POSITION)) {
		WLOG_I(TAG, "READ current position");

		const hap_val_t* cur_val = hap_char_get_val(hc);
		// NOTE: WBlinds uses 0 as fully open, 100 as fully closed
		// Homekit uses the opposite, so...
		auto pos = 100 - state->getPosition();
		if (cur_val->i != pos) {
			WLOG_D(TAG, "cPos: %i", pos);
			hap_val_t new_val;
			new_val.i = pos;
			hap_char_update_val(hc, &new_val);
		}
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_TARGET_POSITION)) {
		WLOG_I(TAG, "READ target position");

		const hap_val_t* cur_val = hap_char_get_val(hc);
		auto pos = 100 - state->getTargetPosition();
		if (cur_val->i != pos) {
			WLOG_D(TAG, "tPos: %i", pos);

			hap_val_t new_val;
			new_val.i = pos;
			hap_char_update_val(hc, &new_val);
		}
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_POSITION_STATE)) {
		WLOG_I(TAG, "READ position state");

		// TODO: whether it's moving, and up or down
		const hap_val_t* cur_val = hap_char_get_val(hc);
		auto p = state->getPosition();
		auto tp = state->getTargetPosition();
		int newPosState = p == tp ? kPosStateStopped : p > tp ? kPosStateMin : kPosStateMax;
		if (cur_val->i != newPosState) {
			WLOG_D(TAG, "pos state: %i", newPosState);

			hap_val_t new_val;
			new_val.i = newPosState;
			hap_char_update_val(hc, &new_val);
		}
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_OBSTRUCTION_DETECTED)) {
		WLOG_I(TAG, "READ obstruction");
		*status_code = HAP_STATUS_RES_ABSENT;
		return HAP_FAIL;
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_NAME)) {
		WLOG_I(TAG, "READ name");

	}
	else {
		*status_code = HAP_STATUS_RES_ABSENT;
		return HAP_FAIL;
	}

	*status_code = HAP_STATUS_SUCCESS;
	return HAP_SUCCESS;
}

/* A dummy callback for handling a write on the "On" characteristic of Fan.
 * In an actual accessory, this should control the hardware
 */
static int write_cb(hap_write_data_t write_data[], int count, void* serv_priv, void* write_priv) {
	if (hap_req_get_ctrl_id(write_priv)) {
		WLOG_D(TAG, "Received write from %s", hap_req_get_ctrl_id(write_priv));
	}

	auto state = State::getInstance();
	EventFlags toNotify;

	int i, ret = HAP_SUCCESS;
	hap_write_data_t* write;
	for (i = 0; i < count; i++) {
		write = &write_data[i];
		auto typeName = hap_char_get_type_uuid(write->hc);
		WLOG_D(TAG, "WRITE - UUID: %s", typeName);
		// HAP_CHAR_UUID_CURRENT_POSITION 		6D
		// HAP_CHAR_UUID_TARGET_POSITION 		7C
		// HAP_CHAR_UUID_POSITION_STATE 		72
		// HAP_CHAR_UUID_OBSTRUCTION_DETECTED 	24
		// HAP_CHAR_UUID_NAME					23
		if (!strcmp(typeName, HAP_CHAR_UUID_TARGET_POSITION)) {
			WLOG_I(TAG, "WRITE - targetPos: %i", write->val.i);

			toNotify.targetPos_ = true;
			state->setTargetPosition(100 - write->val.i);
			*(write->status) = HAP_STATUS_SUCCESS;
		}
		else {
			*(write->status) = HAP_STATUS_RES_ABSENT;
		}
	}

	state->Notify(nullptr, toNotify);
	return ret;
}

hap_serv_t* createWindowCovering(hap_char_t* targPosChar, hap_char_t* currPosChar, hap_char_t* posStateChar) {
	hap_serv_t* hs = hap_serv_create(const_cast<char*>(HAP_SERV_UUID_WINDOW_COVERING));
	if (!hs) {
		return NULL;
	}
	if (hap_serv_add_char(hs, targPosChar) != HAP_SUCCESS) {
		goto err;
	}
	if (hap_serv_add_char(hs, currPosChar) != HAP_SUCCESS) {
		goto err;
	}
	if (hap_serv_add_char(hs, posStateChar) != HAP_SUCCESS) {
		goto err;
	}
	return hs;
err:
	hap_serv_delete(hs);
	return NULL;
}

void Homekit::init() {
	WLOG_I(TAG);

	/**
	 * Configure HomeKit core to make the Accessory name (and thus the WAC SSID) unique,
	 * instead of the default configuration wherein only the WAC SSID is made unique.
	 */
	hap_cfg_t hap_cfg;
	hap_get_config(&hap_cfg);
	hap_cfg.unique_param = UNIQUE_NAME;
	hap_set_config(&hap_cfg);

	/* Initialize the HAP core */
	hap_init(HAP_TRANSPORT_WIFI);

	/**
	 * Initialise the mandatory parameters for Accessory which will be added as
	 * the mandatory services internally
	 */
	auto state = State::getInstance();

	WLOG_I(TAG, "state->getDeviceName(): %s", state->getDeviceName());
	WLOG_I(TAG, "VERSION: %s", VERSION);

	hap_acc_cfg_t cfg = {
		.name = state->getDeviceName(),
		.model = state->getDeviceName(),
		.manufacturer = state->getDeviceName(),
		.serial_num = const_cast<char*>("001122334455"),
		.fw_rev = VERSION,
		.hw_rev = NULL,
		.pv = VERSION,
		.cid = HAP_CID_WINDOW_COVERING,
		.identify_routine = identify,
	};

	accessory = hap_acc_create(&cfg);

	uint8_t product_data[] = { 'E', 'S', 'P', '3', '2', 'K', 'I', 'T' };
	hap_acc_add_product_data(accessory, product_data, sizeof(product_data));

	charName_ = hap_char_name_create(state->getDeviceName());
	charTargPos_ = hap_char_target_position_create(state->getTargetPosition());
	charPos_ = hap_char_current_position_create(state->getPosition());
	charPosState_ = hap_char_position_state_create(kPosStateStopped);
	service = createWindowCovering(charTargPos_, charPos_, charPosState_);
	hap_serv_add_char(service, charName_);

	/* Set the write callback for the service */
	hap_serv_set_write_cb(service, write_cb);

	/* Set the read callback for the service (optional) */
	hap_serv_set_read_cb(service, read_cb);

	/* Add the Fan Service to the Accessory Object */
	hap_acc_add_serv(accessory, service);

	/* Add the Accessory to the HomeKit Database */
	hap_add_accessory(accessory);

	/* Query the controller count (just for information) */
	WLOG_D(TAG, "Accessory is paired with %d controllers",
		hap_get_paired_controller_count());

	/* Unique Setup code of the format xxx-xx-xxx. Default: 111-22-333 */
	hap_set_setup_code("111-22-333");
	/* Unique four character Setup Id. Default: ES32 */
	hap_set_setup_id("ES32");

	/* After all the initializations are done, start the HAP core */
	hap_start();

	// ...as needed
	// resetToFactory();
}

void Homekit::handleEvent(const StateEvent& event) {
	WLOG_I(TAG);

	// TODO: add more flags, custom handlers for custom characteristics
	EventFlags interestingEvents;
	interestingEvents.pos_ = true;
	interestingEvents.targetPos_ = true;

	if (!(event.flags_.mask_ & interestingEvents.mask_)) {
		return;
	}

	int p = state_.getPosition();
	int tp = state_.getTargetPosition();
	if (event.flags_.pos_) {
		hap_val_t newPos;
		newPos.i = 100 - p;
		WLOG_I(TAG, "handle event cpos: %i", newPos.i);

		hap_char_update_val(charPos_, &newPos);
	}
	if (event.flags_.targetPos_) {
		hap_val_t newTargPos;
		newTargPos.i = 100 - tp;
		WLOG_I(TAG, "handle event tpos: %i", newTargPos.i);

		hap_char_update_val(charTargPos_, &newTargPos);
	}

	int newPosState = p == tp ? kPosStateStopped : p > tp ? kPosStateMin : kPosStateMax;
	WLOG_I(TAG, "newPosState: %i", newPosState);
	hap_val_t nS;
	nS.i = newPosState;
	hap_char_update_val(charPosState_, &nS);
}

void Homekit::resetToFactory() {
	hap_reset_to_factory();
	// DO_REBOOT();
}

void Homekit::resetPairings() {
	hap_reset_pairings();
	DO_REBOOT();
}

void Homekit::resetNetwork() {
	hap_reset_network();
	DO_REBOOT();
}
