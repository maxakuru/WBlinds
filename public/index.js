function k(a){return(...b)=>{var c={};b=a.call(c,...b);b=(new DOMParser).parseFromString(b,"text/html").getElementsByTagName("body").item(0).firstChild;c=c.init(b);c.node=b;return c}}
function n(a,b){void 0===b&&(b={});b=b.insertAt;if(a&&"undefined"!==typeof document){var c=document.head||document.getElementsByTagName("head")[0],d=document.createElement("style");d.type="text/css";"top"===b?c.firstChild?c.insertBefore(d,c.firstChild):c.appendChild(d):c.appendChild(d);d.styleSheet?d.styleSheet.cssText=a:d.appendChild(document.createTextNode(a))}}n("#nav{background:rgba(0,0,0,.5019607843137255);height:63px;display:flex}.navc{justify-content:space-evenly;align-self:center}.navc .sel{color:#db8b1d}");
function p(a,...b){a.classList.add(...b)}function q(a,...b){a.classList.remove(...b)}let r=setTimeout,t=document.createElement.bind(document),v=document.createElement.bind(document,"div"),w=document.getElementById.bind(document),x=(a,b=document)=>b.querySelector.call(b,a),z=a=>a.stopPropagation(),C=(a,b)=>A.call(a,b),A=document.appendChild;function D(a){return a&&"object"===typeof a&&!Array.isArray(a)}
function E(a,...b){if(!b.length)return a;let c=b.shift();if(D(a)&&D(c))for(let b in c)D(c[b])?(a[b]||Object.assign(a,{[b]:{}}),E(a[b],c[b])):Object.assign(a,{[b]:c[b]});return E(a,...b)}function F(a){let b={};for(let c in a)null!=a[c]&&(b[c]=a[c]);return b}
let G=k(function(){let a=0,b=[];this.init=c=>{const d=c.querySelectorAll("li");d.forEach((c,e)=>{c.addEventListener("click",()=>{a=e;d.forEach((b,c)=>{c===a?p(b,"sel"):q(b,"sel")});b.map(a=>a.call(void 0,e))})});return{onClick:a=>{b.push(a)},currentIndex:()=>a,destroy:()=>{b=[]}}};return'<ul class="fw navc"><li class="sel">Home</li><li>Routines</li><li>Settings</li></ul>'});n(".sc{padding:20px}.slider{background:linear-gradient(90deg,#db8b1d 0,#db8b1d 50%,#606060 0,#606060);border-radius:8px;height:7px;width:75%;border-radius:15px;height:6px;-webkit-appearance:none;-moz-appearance:none;appearance:none;width:100%;outline:none}.slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;background:#fff;box-shadow:#000;border-radius:50%;cursor:pointer}");
let H=k(function({label:a,value:b,id:c}){this.init=d=>{d.id=c;x("h4",d).innerText=a;const f=x("input",d);f.onmousedown=z;f.ontouchstart=z;f.oninput=()=>{const a=(parseInt(f.value)-parseInt(f.min))/(parseInt(f.max)-parseInt(f.min))*100;f.style.background=`linear-gradient(to right, #DB8B1D 0%, #DB8B1D ${a}%, #606060 ${a}%, #606060 100%`};f.value=b;return{destroy:()=>{}}};return'<div class="sc"><div class="fR fSB"><h4>Title</h4><h4>Value</h4></div><input class="slider" type="range" min="0" max="100"></div>'});
n("#card{height:100%;position:fixed;width:100%;top:100%;background:rgba(83,83,83,.47058823529411764)}#card.an{transition:top .2s ease-in-out}");
let I=k(function(){let a=!1,b=0,c=0,d=!1,f={};this.init=e=>{function h(a=!1){a!==d&&(a?p(e,"an"):q(e,"an"),d=a)}h(!0);const l=H({id:"position",label:"Position",value:"50"});A.call(e,l.node);const g=()=>{e.remove()},u=a=>{let {x:b,y:c}=a;null==b&&(b=a.touches[0].clientX,c=a.touches[0].clientY);return{x:b,y:c}};e.onmousedown=e.ontouchstart=b=>{f=b=u(b);c=b.y;a=!0;h(!1)};e.onmouseup=e.onmouseout=e.ontouchend=()=>{if(a){a=!1;h(!0);var d=0;b>e.clientHeight/2&&(d=e.clientHeight,e.ontransitionend=g);e.style.top=
`${d}px`;b=c=0}};e.onmousemove=e.ontouchmove=d=>{d=u(d);a&&(0>d.y-c?f=d:(b+=d.y-f.y,f=d,e.style.top=`${b}px`))};return{destroy:g,show:()=>{e.style.top="0px"}}};return'<div id="card" class="an"></div>'});n(":root{--wid:min(calc(33.33333vw - 20px),110px)}.tile{background:rgba(0,0,0,.30196078431372547);border-radius:12px;display:flex}.tile.sq{width:var(--wid);height:var(--wid);margin:5px 0;position:relative}.tile.sq>span{width:calc(var(--wid) - 1px);max-height:90px;top:10px;position:absolute;right:0;border-right:1px groove #fff}.tile.sq p{font-size:11px;margin:auto 21px 10px 9px;font-weight:500}");
let K=k(function({name:a,id:b}){let c=[];this.init=d=>{d.id=b;d.onclick=()=>{c.forEach(c=>c({id:b,name:a}))};x("p",d).innerText=a;return{onClick:a=>{c.push(a)},destroy:()=>{c=[]}}};return'<div class="tile sq"><span></span><p>Bedroom Left</p></div>'});n(':root{--bord:1px solid rgba(0,0,0,0.034)}#pas{border-radius:7px;justify-content:center;background:rgba(118,118,128,.23921568627450981);border:2px solid transparent}#pas>div{padding:2px 0;flex-grow:1;text-align:center;font-size:14px;border:1px solid hsla(0,0%,100%,0)}#pas>div.sel{background-color:rgba(103,103,105,.6392156862745098);border-radius:7px;border:1px solid rgba(0,0,0,.1411764705882353)}#pas>div:after{height:13px;content:"";display:block;position:absolute;border-left:1px solid rgba(142,142,147,.45098039215686275);border-radius:.5px;transform:translate(-1px,-110%)}#pas>div:first-child:after{border-left:none}');
let L=k(function({items:a}){let b=0,c=[],d=[];this.init=f=>{a.map((a,h)=>{const e=v();e.innerText=a;h===b&&p(e,"sel");e.onclick=()=>{q(d[b],"sel");b=h;p(e,"sel");c.map(a=>a(h))};d.push(e);A.call(f,e)});return{destroy:()=>{c=[];b=0;d=[]},index:()=>b,onChange:a=>{c.push(a)}}};return'<div id="pas" class="fw flex fR"></div>'});n(".toast{background-color:rgba(0,0,0,.4392156862745098);box-shadow:1px 1px 8px rgba(84,84,84,.45098039215686275);border-radius:10px;font-size:13px;margin:10px;height:60px;display:flex;min-width:250px;max-width:500px;position:relative;transition:bottom .5s ease-in-out;pointer-events:all;align-self:center}.tom{margin:auto}");
let M=k(function({message:a,id:b}){let c=[];this.init=d=>{d.onclick=()=>{c.forEach(a=>a({id:b}))};x("p",d).innerText=a;return{onClick:a=>{c.push(a)},destroy:()=>{c=[]}}};return'<div class="toast"><p class="tom"></p></div>'});n('.in{justify-content:space-between;height:50px;align-items:center;background:rgba(0,0,0,.5607843137254902);padding:0 15px;margin-top:10px;border-radius:15px;min-width:300px}.in>label{font-weight:700;font-size:14px}.igroup>.in{margin-top:0;border-radius:0;border-bottom:1px solid hsla(0,0%,100%,.30196078431372547)}.igroup>.in:first-child{border-radius:15px 15px 0 0}.igroup>.in:last-child{border-radius:0 0 15px 15px;margin-bottom:10px;border-bottom:none}.in>input{background-color:transparent;border:none;text-align:right;color:#db8b1d}[type=checkbox]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:51px;height:31px;border-radius:50px;background-color:rgba(148,148,154,.2)!important}[type=checkbox]:after{content:"";width:50%;border-radius:100%;height:80%;display:block;position:relative;background-color:#fff;top:12%;left:3%;transition:left .2s ease-in-out}[type=checkbox].on{background-color:#34c759!important}[type=checkbox].on:after{left:45%}');
let N={1:"text",2:"checkbox",0:"number",3:"select"},O=k(function({label:a,type:b,value:c}){let d=[];this.init=f=>{function e(a){console.log("_onChange: ",a);d.map(b=>b(a.target.value))}const h=`cb-${a.split(" ").join("-")}`,l=f.firstChild;l.innerText=a;l.htmlFor=h;const g=t("input");g.type=N[b];g.placeholder="placeholder";g.id=h;(g.value=c)&&p(g,"on");2===b?(g.checked=c,g.onchange=a=>{g.classList.toggle("on");e(a)}):g.oninput=e;console.log("input: ",g);A.call(f,g);return{onChange:a=>{d.push(a)},
setDisabled:a=>{g.disabled=a},destroy:()=>{d=[]}}};return'<div class="fR in"><label></label></div>'});n(".tc{display:flex;position:absolute;top:0;flex-flow:column-reverse;pointer-events:none;height:calc(100% - 63px);padding-bottom:63px}");
let P=k(function(){let a=0,b=[];this.init=c=>({destroy:()=>{b.map(a=>a.destroy());b=[];a=0},pushToast:function(d,f,e,h=2500){function l(){g.node.style.bottom=`-${63+200*(b.length+1)}px`;setTimeout(()=>{g.node.remove()},500)}const g=M({message:d,isError:f,id:a++});g.node.style.bottom=`-${63+200*(b.length+1)}px`;g.onClick(l);b.push(g);A.call(c,g.node);setTimeout(()=>{g.node.style.bottom="0px";!e&&setTimeout(l,h)})}});return'<div id="toc" class="fw tc"></div>'}),Q={gen:{deviceName:"WBlinds",mdnsName:"WBlinds",
emitSync:!1},hw:{pStep:19,pDir:18,pEn:13,pSleep:21,pReset:3,pMs1:1,pMs2:5,pMs3:17,pHome:4,cLen:1650,cDia:.1,axDia:15,stepsPerRev:200,res:16},mqtt:{enabled:!1,host:"192.168.0.99",port:1833,topic:"wblinds",user:"user"}},R={state:{pos:0,tPos:0,accel:0,speed:0},settings:E({},Q),pendingState:E({},Q),devices:{},presets:{}};
class S{constructor(){this._loadedKeys={devices:!1,presets:!1,pendingState:!1,settings:!1,state:!1};this._observers={};this._state=E({},R)}get(a){a=a.split(".");let b=this._state;for(;0<a.length;){if("object"!==typeof b)return;b=b[a.shift()]}return b}set(a,b){a=a.split(".");let c=a.pop(),d=this._state;for(;0<a.length;){if("object"!==typeof d)return;d=d[a.shift()]}d[c]=b}isLoaded(a){return this._loadedKeys[a]}update(a,b){var c,d;null!==(c=(d=this._observers)[a])&&void 0!==c?c:d[a]=[];let f=this._state[a];
this._state[a]=E({},f,F(b));this._loadedKeys[a]=!0;this._observers[a].forEach(a=>{a({value:{...b},prev:f})})}observe(a,b){var c,d;null!==(c=(d=this._observers)[a])&&void 0!==c?c:d[a]=[];this._observers[a].push(b);this._loadedKeys[a]&&b({value:E({},this._state[a]),prev:void 0})}}let T=new S;n(".dt{justify-content:space-between}.pt>.sq{height:50px;width:auto;min-width:150px}.pt>.sq>span{display:none}");
let U=k(function(){let a=!0,b=[],c=[];this.init=()=>{function d(a,b){"device"===a&&c.forEach(a=>a(b))}const f=()=>{if(a){var b=w("hl"),c=w("hlc");b.style.display="none";q(c,"hide");a=!1}},e=a=>{a=w(`${a}-tiles`);return{container:a,tiles:a.querySelectorAll("div")}},h=a=>{const {container:b,tiles:c}=e(a);a=Math.floor(b.clientWidth/110);let d=c.length;for(;0!==d%a;){const a=v();p(a,"tile","sq","em");A.call(b,a);d++}},l=(a,c)=>{const {container:f,tiles:g}=e(a);g.forEach(a=>{a.id in c&&(c[a.id]=void 0)});
for(const [B,e]of Object.entries(c)){if(!e)continue;const c=K({id:`tile-${B}`,name:e.name||B,...e});c.onClick(b=>d(a,b));b.push(c);A.call(f,c.node)}h(a)};r(()=>{T.observe("presets",({value:a})=>{f();l("preset",a)});T.observe("devices",({value:a})=>{f();l("device",a)})});return{onDeviceClick:a=>{c.push(a)},destroy:()=>{c=[];b.forEach(a=>a.destroy());b=[]}}};return'<div id="h" class="f flex"><div id="hl" class="loader"></div><div id="hlc" class="hide fw" style="text-align: left;"><h1 id="ht">WBlinds</h1><h4 class="hst">Presets</h4><div id="preset-tiles" class="pt fw flex wrap"></div><h4 class="hst">Devices</h4><div id="device-tiles" class="dt fw flex wrap"></div></div></div>'});
n("#pas{margin-bottom:20px}#stcc{display:flex}#stcc>span{margin:auto}#stcc>div{justify-content:center}#slc-act{position:fixed;bottom:70px;justify-content:space-evenly;width:100%;left:0}#slc-act>*{border-radius:25px;width:120px;height:41px;text-align:center;display:flex;justify-content:space-around;align-items:center}#s-save{background:#007aff}#s-can{background:tomato}");
let V={gen:{deviceName:{t:1,l:"Device name"},mdnsName:{t:1,l:"mDNS Name"},emitSync:{t:2,l:"Emit sync data"}},mqtt:{enabled:{t:2,l:"Enabled",g:2},host:{t:1,l:"Host",g:2},port:{l:"Port",g:2},topic:{t:1,l:"Topic",g:2},user:{t:1,l:"Username",g:2}},hw:{axDia:{l:"Axis diameter",g:1},cDia:{l:"Cord diameter",g:1},cLen:{l:"Cord length",g:1},pDir:{l:"Direction pin",g:0},pEn:{l:"Enable pin",g:0},pHome:{l:"Home switch pin",g:0},pMs1:{l:"Microstep pin 1",g:0},pMs2:{l:"Microstep pin 2",g:0},pMs3:{l:"Microstep pin 3",
g:0},pReset:{l:"Reset pin",g:0},pSleep:{l:"Sleep pin",g:0},pStep:{l:"Step pin",g:0},stepsPerRev:{l:"Steps/revolution",g:1},res:{t:3,l:"Resolution",g:1,o:[1,4,8,16]}}},aa=k(function(){function a(a){console.log("makeTab: ",V);const b=t("span"),c=[],d=a=>{if(null==a)return b;if(null==c[a]){const d=v();p(d,"igroup");c[a]=d;A.call(b,d)}return c[a]};console.log("SETTING_INPUT_MAP[key]: ",V[a]);for(const b in V[a]){const {g:c,l:f,t:B,o:g}=V[a][b];var e=`${"settings"}.${a}.${b}`;const J=`${"pendingState"}.${a}.${b}`;
console.log("stateKey: ",e);console.log("State.get(stateKey): ",T.get(e));e=O({label:f,type:B||0,enumOpts:g,value:T.get(e)});e.onChange(a=>{y(!0);console.log("pendingKey: ",J,a);T.set(J,a)});h.push(e);C(d(c),e.node)}return b}let b=!0,c=!1,d=!1,f=[],e=[],h=[];const l=L({items:["General","Hardware","MQTT"]});let g,u,m;this.init=()=>{function d(a){const b=w("stcc");let c;0===a?c=g:1===a?c=u:2===a&&(c=m);b.innerHTML="";A.call(b,c)}l.onChange(d);r(()=>{T.observe("settings",()=>{if(b||c){var e=w("sl"),
f=w("slc");e.style.display="none";q(f,"hide");f.prepend(l.node);b=!1;c&&y(!1);e=w("stcc");e||(e=v(),e.id="stcc",A.call(f,e));g=a("gen");u=a("hw");m=a("mqtt");d(l.index())}})});return{destroy:()=>{h.forEach(a=>a.destroy());h=[];f=[];e=[]},onCancel:a=>{e.push(a)},onSave:a=>{f.push(a)}}};const y=a=>{a!==d&&(c=!1,d=a,a=w("slc-act"),d?(w("s-save").onclick=()=>{c=!0;f.map(a=>a())},w("s-can").onclick=()=>{e.map(a=>a())},q(a,"hide")):p(a,"hide"))};return'<div id="ps" class="f fC"><div id="sl" class="loader"></div><div id="slc" class="hide fw" style="text-align: left;"><div id="slc-act" class="fR fw hide"><div id="s-can">Cancel</div><div id="s-save">Save</div></div></div></div>'});
console.log("use mocks: ",!1,"boolean");function ba(a,b,c={}){return W(a,b,c)}function W(a,b,c={},d=0){return fetch(`${"http://192.168.1.17"}${a}`,{method:b}).then(f=>{if(!f.ok){d+=1;if(8<d){let c=Error(`Failed with ${f.status} on fetch [${b}] ${a}`);c.response=f;throw c;}setTimeout(W.bind(a,b,c,d),5E3*d)}return f.json()})}let ca=[4,5,22,24],X="pos tPos speed accel deviceName mdnsName emitSyncData pinStep pinDir pinEn pinSleep pinReset pinMs1 pinMs2 pinMs3 pinHomeSw cordLength cordDiameter axisDiameter stepsPerRev resolution mqttEnabled mqttHost mqttPort mqttTopic moveUp moveDown moveStop tick".split(" ");
var Y,Z=Y||(Y={});Z[Z.UpdateSettings=0]="UpdateSettings";Z[Z.UpdateState=1]="UpdateState";
let da=(a={})=>{function b(){d=new WebSocket("ws://192.168.1.17/ws");d.onopen=b=>{f=!0;e=0;a.onConnect&&a.onConnect(b,e)};d.onclose=c=>{f=!1;a.onDisconnect&&a.onDisconnect(c,e);setTimeout(b,Math.min(5E3*++e,6E4))};d.onmessage=b=>{b=c(b.data);a.onMessage&&b.map(b=>a.onMessage(b))};d.onerror=b=>{f=!1;a.onError&&a.onError(b,e)}}function c(a){var b=a.split("/");a=b.shift();const c=parseInt(b.shift()),d={},e={};let f=1;for(let a=0,g=X.length;a<g&&0<b.length;a++){if(f&c){const c=X[a],f=b.shift();4>a?d[c]=
parseInt(f):e[c]=a in ca?f:parseInt(f)}f<<=1}b=[];0<Object.keys(d).length&&b.push({type:1,mac:a,data:d});0<Object.keys(e).length&&b.push({type:0,mac:a,data:e});return b}let d,f=!1,e=0;b();return{ws:d,push:()=>{f&&d.send("")}}};
var ea=a=>{function b(){console.log("saveSettings: ",T._state);T.update("settings",T._state.pendingState)}function c(){console.log("cancelSettings: ",T._state);T.update("pendingState",T._state.settings)}function d(){let a=I({});A.call(h,a.node);setTimeout(a.show)}function f(a,b=[a]){return ba(`/${a}`).then(a=>{b.map(b=>T.update(b,a));return a}).catch(e)}function e(a){console.error(a);a=D(a)?(null===a||void 0===a?void 0:a.message)||"Error encountered, check console":a;g.pushToast(a,!0)}let h=x("body"),
l=w("app");a.state=T;let g=P({});A.call(h,g.node);window.onerror=e;let u=-1,m;a=a=>{var e;if(u!==a){u=a;null===(e=null===m||void 0===m?void 0:m.destroy)||void 0===e?void 0:e.call(m);null===m||void 0===m?void 0:m.node.remove();switch(a){case 0:a=U();a.onDeviceClick(d);m=a;break;case 1:m=null;break;case 2:a=aa(),a.onSave(b),a.onCancel(c),m=a,T.isLoaded("settings")||f("settings",["pendingState","settings"])}m&&A.call(l,m.node)}};a(0);f("state");f("presets");f("devices");da({onMessage(a){0===a.type&&
T.update("settings",{...T.get("settings"),...a.data})},onError(a,b){b||g.pushToast("Websocket disconnected!",!0,!1,5E3)},onConnect(a,b){b&&g.pushToast("Websocket connected!")},onDisconnect(){}});let y=G();C(w("nav"),y.node);y.onClick(a)};n('html{touch-action:manipulation}body{margin:0;background-color:#111;font-family:-apple-system,BlinkMacSystemFont,helvetica,sans-serif;font-size:17px;font-weight:400;color:#fff;text-align:center;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;scrollbar-width:6px;scrollbar-color:var(--c-sb) transparent}body,html{height:100%;width:100%;position:fixed;-ms-scroll-chaining:none;overscroll-behavior:none}:focus{outline:none}h1,h4{font-weight:400}h1{font-size:32px}h4{-webkit-margin-after:.3em;margin-block-end:.3em;font-size:14px;padding-left:5px}.hide{display:none!important}.loader,.loader:after,.loader:before{border-radius:50%;width:2.5em;height:2.5em;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation:load7 1.8s ease-in-out infinite;animation:load7 1.8s ease-in-out infinite}.loader{margin:auto;color:#fff;font-size:10px;text-indent:-9999em;transform:translate3d(0,-100px,0);-webkit-animation-delay:-.16s;animation-delay:-.16s;align-self:center}.loader:after,.loader:before{content:"";position:absolute;top:0}.loader:before{left:-3.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:3.5em}@-webkit-keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}@keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}.em{opacity:0}ul{display:flex;list-style-type:none;-webkit-margin-before:0;margin-block-start:0;-webkit-margin-after:0;margin-block-end:0;-webkit-padding-start:0;padding-inline-start:0}li{display:list-item;text-align:-webkit-match-parent;color:hsla(0,0%,100%,.4)}li.s{color:#db8b1d}.f{width:100%;height:100%}.fC,.flex{display:flex}.fC{flex-direction:column}.fR{display:flex;flex-direction:row}.fSB{justify-content:space-between}.wrap{flex-wrap:wrap}.fw{width:100%}#bg{height:100vh;width:100vw;position:fixed;z-index:-10;background-position:30%;background-repeat:no-repeat;background-size:cover;opacity:1;transition:opacity 2s;background-image:url(https://github.com/maxakuru/WBlinds/blob/main/public/bg.jpg?raw=true),linear-gradient(40deg,#1d0143,#293b7c,#300a52)}#app{display:flex;flex-direction:column;padding:23px 23px 0;height:calc(100% - 86px);overflow-y:scroll}.overlay{position:fixed;height:100%;width:100%;top:0;left:0;background-color:#333;font-size:24px;display:flex;align-items:center;justify-content:center;z-index:11;opacity:.95;transition:.7s;pointer-events:none}');
let fa=window.wblinds={};window.onload=()=>ea(fa)
