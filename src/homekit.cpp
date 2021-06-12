#include "homekit.h"

hap_acc_t* accessory;
hap_serv_t* service;

const int kPosStateMin = 0; // ”Going to the minimum value specified in metadata”
const int kPosStateMax = 1; // ”Going to the maximum value specified in metadata”
const int kPosStateStopped = 2; // ”Stopped”

/* Mandatory identify routine for the accessory.
 * In a real accessory, something like LED blink should be implemented
 * got visual identification
 */
static int identify(hap_acc_t* ha) {
	ESP_LOGI(TAG, "Accessory identified");
	return HAP_SUCCESS;
}

Homekit::Homekit(State& state) {
	state.Attach(this);
}

/* A dummy callback for handling a read on the "Direction" characteristic of Fan.
 * In an actual accessory, this should read from hardware.
 * Read routines are generally not required as the value is available with th HAP core
 * when it is updated from write routines. For external triggers (like fan switched on/off
 * using physical button), accessories should explicitly call hap_char_update_val()
 * instead of waiting for a read request.
 */
static int read_cb(hap_char_t* hc, hap_status_t* status_code, void* serv_priv, void* read_priv) {
	if (hap_req_get_ctrl_id(read_priv)) {
		ESP_LOGI(TAG, "Received read from %s", hap_req_get_ctrl_id(read_priv));
	}
	ESP_LOGI(TAG, "hap_char_get_type_uuid(hc):%s", hap_char_get_type_uuid(hc));
	// HAP_CHAR_UUID_CURRENT_POSITION 		6D
	// HAP_CHAR_UUID_TARGET_POSITION 		7C
	// HAP_CHAR_UUID_POSITION_STATE 		72
	// HAP_CHAR_UUID_OBSTRUCTION_DETECTED 	24
	// HAP_CHAR_UUID_NAME					23
	auto state = State::getInstance();
	auto typeName = hap_char_get_type_uuid(hc);
	if (!strcmp(typeName, HAP_CHAR_UUID_CURRENT_POSITION)) {
		ESP_LOGI(TAG, "read current position");

		const hap_val_t* cur_val = hap_char_get_val(hc);
		auto pos = state->getPosition();
		if (cur_val->i != pos) {
			hap_val_t new_val;
			new_val.i = pos;
			ESP_LOGI(TAG, "new current pos %i", pos);
			hap_char_update_val(hc, &new_val);
		}
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_TARGET_POSITION)) {
		// TODO: target position, add to state
		// const hap_val_t* cur_val = hap_char_get_val(hc);

		ESP_LOGI(TAG, "read target position");

		const hap_val_t* cur_val = hap_char_get_val(hc);
		auto pos = state->getTargetPosition();
		if (cur_val->i != pos) {
			hap_val_t new_val;
			new_val.i = pos;
			ESP_LOGI(TAG, "new current pos %i", pos);
			hap_char_update_val(hc, &new_val);
		}
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_POSITION_STATE)) {
		ESP_LOGI(TAG, "read position state");

		// TODO: whether it's moving, and up or down
		// const hap_val_t* cur_val = hap_char_get_val(hc);

		// if (cur_val->i != state->getTargetPosition()) {
		// 	hap_val_t new_val;
		// 	hap_char_update_val(hc, &new_val);
		// 	new_val.i = 0;
		// }
	}
	else if (!strcmp(typeName, HAP_CHAR_UUID_OBSTRUCTION_DETECTED)) {
		ESP_LOGI(TAG, "read obstruction detected");

		// TODO: obstruction detection
		// const hap_val_t* cur_val = hap_char_get_val(hc);

		// if (cur_val->i != state->getTargetPosition()) {
		// 	hap_val_t new_val;
		// 	hap_char_update_val(hc, &new_val);
		// 	new_val.i = 0;
		// }
	} else if(!strcmp(typeName, HAP_CHAR_UUID_NAME)) {
		ESP_LOGI(TAG, "read name");

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
		ESP_LOGI(TAG, "Received write from %s", hap_req_get_ctrl_id(write_priv));
	}

	ESP_LOGI(TAG, "Fan Write called with %d chars", count);
	int i, ret = HAP_SUCCESS;
	hap_write_data_t* write;
	for (i = 0; i < count; i++) {
		write = &write_data[i];
		if (!strcmp(hap_char_get_type_uuid(write->hc), HAP_CHAR_UUID_ON)) {
			ESP_LOGI(TAG, "Received Write. Fan %s", write->val.b ? "On" : "Off");

			/* TODO: Control Actual Hardware */
			hap_char_update_val(write->hc, &(write->val));
			*(write->status) = HAP_STATUS_SUCCESS;
		}
		else if (!strcmp(hap_char_get_type_uuid(write->hc), HAP_CHAR_UUID_ROTATION_DIRECTION)) {
			if (write->val.i > 1) {
				*(write->status) = HAP_STATUS_VAL_INVALID;
				ret = HAP_FAIL;
			}
			else {
				ESP_LOGI(TAG, "Received Write. Fan %s", write->val.i ? "AntiClockwise" : "Clockwise");
				hap_char_update_val(write->hc, &(write->val));
				*(write->status) = HAP_STATUS_SUCCESS;
			}
		}
		else {
			*(write->status) = HAP_STATUS_RES_ABSENT;
		}
	}
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
	ESP_LOGI(TAG);

	/* Configure HomeKit core to make the Accessory name (and thus the WAC SSID) unique,
	 * instead of the default configuration wherein only the WAC SSID is made unique.
	 */
	hap_cfg_t hap_cfg;
	hap_get_config(&hap_cfg);
	hap_cfg.unique_param = UNIQUE_NAME;
	hap_set_config(&hap_cfg);

	/* Initialize the HAP core */
	hap_init(HAP_TRANSPORT_WIFI);

	/* Initialise the mandatory parameters for Accessory which will be added as
	 * the mandatory services internally
	 */
	auto state = State::getInstance();
	hap_acc_cfg_t cfg = {
		.name = state->getDeviceName(),
		.model = state->getDeviceName(),
		.manufacturer = state->getDeviceName(),
		.serial_num = const_cast<char*>("001122334455"),
		.fw_rev = const_cast<char*>(VERSION),
		.hw_rev = NULL,
		.pv = const_cast<char*>(VERSION),
		.cid = HAP_CID_WINDOW_COVERING,
		.identify_routine = identify,
	};

	/* Create accessory object */
	accessory = hap_acc_create(&cfg);

	/* Add a dummy Product Data */
	uint8_t product_data[] = { 'E', 'S', 'P', '3', '2', 'K', 'I', 'T' };
	hap_acc_add_product_data(accessory, product_data, sizeof(product_data));

	/* Create the Fan Service. Include the "name" since this is a user visible service  */
	charName = hap_char_name_create(const_cast<char*>("WBlinds"));

	charTargPos = hap_char_target_position_create(0);
	charPos = hap_char_current_position_create(0);
	charPosState = hap_char_position_state_create(kPosStateStopped);
	// service = hap_serv_window_covering_create(0, 0, kPosStateStopped);
	service = createWindowCovering(charTargPos, charPos, charPosState);

	// hap_serv_add_char(service, charPos);
	// hap_serv_add_char(service, charTargPos);
	// hap_serv_add_char(service, charPosState);
	hap_serv_add_char(service, charName);

	/* Set the write callback for the service */
	hap_serv_set_write_cb(service, write_cb);

	/* Set the read callback for the service (optional) */
	hap_serv_set_read_cb(service, read_cb);

	/* Add the Fan Service to the Accessory Object */
	hap_acc_add_serv(accessory, service);

	/* Add the Accessory to the HomeKit Database */
	hap_add_accessory(accessory);

	/* Query the controller count (just for information) */
	ESP_LOGI(TAG, "Accessory is paired with %d controllers",
		hap_get_paired_controller_count());

	/* Unique Setup code of the format xxx-xx-xxx. Default: 111-22-333 */
	hap_set_setup_code("111-22-333");
	/* Unique four character Setup Id. Default: ES32 */
	hap_set_setup_id("ES32");

	/* After all the initializations are done, start the HAP core */
	hap_start();

	// int hap_update_config_number();
	// bool is_hap_loop_started();
	// void hap_report_event(hap_event_t event, void *data, size_t data_size);
	// int hap_enable_hw_auth(void);
	// int hap_enable_sw_auth(void);
}

void Homekit::handleStateChange(const StateData& newState) {
	// TODO: notify homekit of state change
	ESP_LOGI(TAG);
	hap_val_t newPos;
	newPos.i = newState.pos;
	hap_char_update_val(charPos, &newPos);

	hap_val_t nS;
	nS.i = 1;
	hap_char_update_val(charPosState, &nS);
}