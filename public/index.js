function m(a){return(...b)=>{var c={};b=a.call(c,...b);b=(new DOMParser).parseFromString(b,"text/html").getElementsByTagName("body").item(0).firstChild;c=c.init.call(c,b);c.node=b;return c}}
function n(a,b){void 0===b&&(b={});b=b.insertAt;if(a&&"undefined"!==typeof document){var c=document.head||document.getElementsByTagName("head")[0],d=document.createElement("style");d.type="text/css";"top"===b?c.firstChild?c.insertBefore(d,c.firstChild):c.appendChild(d):c.appendChild(d);d.styleSheet?d.styleSheet.cssText=a:d.appendChild(document.createTextNode(a))}}n("#nav{background:rgba(0,0,0,.5019607843137255);height:63px;display:flex}.navc{justify-content:space-evenly;align-self:center}.navc .sel{color:#db8b1d}");
function p(a,...b){a.classList.add(...b)}function q(a,...b){a.classList.remove(...b)}let r=setTimeout,t=document.createElement.bind(document),u=document.createElement.bind(document,"div"),w=document.getElementById.bind(document),x=(a,b=document)=>b.querySelector.call(b,a),y=a=>a.stopPropagation(),z=(a,b)=>a.appendChild(b);function A(a){return a&&"object"===typeof a&&!Array.isArray(a)}
function B(a,...b){if(!b.length)return a;let c=b.shift();if(A(a)&&A(c))for(let b in c)A(c[b])?(a[b]||Object.assign(a,{[b]:{}}),B(a[b],c[b])):Object.assign(a,{[b]:c[b]});return B(a,...b)}function C(a){let b={};for(let c in a)null!=a[c]&&(b[c]=a[c]);return b}
let D=m(function(){let a=0,b=[];this.init=function(c){const d=c.querySelectorAll("li");d.forEach((c,e)=>{c.addEventListener("click",()=>{a=e;d.forEach((b,c)=>{c===a?p(b,"sel"):q(b,"sel")});b.map(a=>a.call(void 0,e))})});return{onClick:a=>{b.push(a)},currentIndex:()=>a,destroy:()=>{b=[]}}};return'<ul class="fw navc"><li class="sel">Home</li><li>Routines</li><li>Settings</li></ul>'});n("#card{height:100%;position:fixed;width:100%;top:100%;background:rgba(83,83,83,.47058823529411764)}#card.an{transition:top .2s ease-in-out}");
let F=m(function(){let a=!1,b=0,c=0,d=!1,f={};this.init=function(e){function h(a=!1){a!==d&&(a?p(e,"an"):q(e,"an"),d=a)}function g(){e.remove()}function l(a){let {x:b,y:c}=a;null==b&&(b=a.touches[0].clientX,c=a.touches[0].clientY);return{x:b,y:c}}h(!0);const k=E({id:"position",label:"Position",value:"50"});e.appendChild(k.node);e.onmousedown=e.ontouchstart=b=>{f=b=l(b);c=b.y;a=!0;h(!1)};e.onmouseup=e.onmouseout=e.ontouchend=()=>{if(a){a=!1;h(!0);var d=0;b>e.clientHeight/2&&(d=e.clientHeight,e.ontransitionend=
g);e.style.top=`${d}px`;b=c=0}};e.onmousemove=e.ontouchmove=d=>{d=l(d);a&&(0>d.y-c?f=d:(b+=d.y-f.y,f=d,e.style.top=`${b}px`))};return{destroy:g,show:()=>{e.style.top="0px"}}};return'<div id="card" class="an"></div>'});n(":root{--wid:min(calc(33.33333vw - 20px),110px)}.tile{background:rgba(0,0,0,.30196078431372547);border-radius:12px;display:flex}.tile.sq{width:var(--wid);height:var(--wid);margin:5px 0;position:relative}.tile.sq>span{width:calc(var(--wid) - 1px);max-height:90px;top:10px;position:absolute;right:0;border-right:1px groove #fff}.pt>.sq{height:50px;width:auto;min-width:150px}.pt>.sq>span{display:none}.tile.sq p{font-size:11px;margin:auto 21px 10px 9px;font-weight:500}");
let G=m(function({name:a,id:b}){let c=[];this.init=function(d){d.id=b;d.onclick=()=>{c.forEach(c=>c({id:b,name:a}))};x("p",d).innerText=a;return{onClick:a=>{c.push(a)},destroy:()=>{c=[]}}};return'<div class="tile sq"><span></span><p>Bedroom Left</p></div>'});n(".sc{padding:20px}.slider{background:linear-gradient(90deg,#db8b1d 0,#db8b1d 50%,#606060 0,#606060);border-radius:8px;height:7px;width:75%;border-radius:15px;height:6px;-webkit-appearance:none;-moz-appearance:none;appearance:none;width:100%;outline:none}.slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;background:#fff;box-shadow:#000;border-radius:50%;cursor:pointer}");
let E=m(function({label:a,value:b,id:c}){this.init=function(d){d.id=c;x("h4",d).innerText=a;const f=x("input",d);f.onmousedown=y;f.ontouchstart=y;f.oninput=function(){const a=(parseInt(f.value)-parseInt(f.min))/(parseInt(f.max)-parseInt(f.min))*100;f.style.background=`linear-gradient(to right, #DB8B1D 0%, #DB8B1D ${a}%, #606060 ${a}%, #606060 100%`};f.value=b;return{destroy:()=>{}}};return'<div class="sc"><div class="fR fSB"><h4>Title</h4><h4>Value</h4></div><input class="slider" type="range" min="0" max="100"></div>'});
n(':root{--bord:1px solid rgba(0,0,0,0.034)}#pas{border-radius:7px;justify-content:center;background:rgba(118,118,128,.23921568627450981);border:2px solid transparent}#pas>div{padding:2px 0;flex-grow:1;text-align:center;font-size:14px;border:1px solid hsla(0,0%,100%,0)}#pas>div.sel{background-color:rgba(103,103,105,.6392156862745098);border-radius:7px;border:1px solid rgba(0,0,0,.1411764705882353)}#pas>div:after{height:13px;content:"";display:block;position:absolute;border-left:1px solid rgba(142,142,147,.45098039215686275);border-radius:.5px;transform:translate(-1px,-110%)}#pas>div:first-child:after{border-left:none}');
let H=m(function({items:a}){let b=0,c=[],d=[];this.init=function(f){a.map((a,h)=>{const e=u();e.innerText=a;h===b&&p(e,"sel");e.onclick=()=>{q(d[b],"sel");b=h;p(e,"sel");c.map(a=>a(h))};d.push(e);f.appendChild(e)});return{destroy:()=>{c=[];b=0;d=[]},index:()=>b,onChange:function(a){c.push(a)}}};return'<div id="pas" class="fw flex fR"></div>'});n(".toast{background-color:rgba(0,0,0,.4392156862745098);box-shadow:1px 1px 8px rgba(84,84,84,.45098039215686275);border-radius:10px;font-size:13px;margin:10px;height:60px;display:flex;min-width:250px;max-width:500px;position:relative;transition:bottom .5s ease-in-out;pointer-events:all;align-self:center}.tom{margin:auto}");
let I=m(function({message:a,id:b}){let c=[];this.init=function(d){d.onclick=()=>{c.forEach(a=>a({id:b}))};x("p",d).innerText=a;return{onClick:a=>{c.push(a)},destroy:()=>{c=[]}}};return'<div class="toast"><p class="tom"></p></div>'});n('.in{justify-content:space-between;height:50px;align-items:center;background:rgba(0,0,0,.5607843137254902);padding:0 15px;margin-top:10px;border-radius:15px;min-width:300px}.in>label{font-weight:700;font-size:14px}.igroup>.in{margin-top:0;border-radius:0;border-bottom:1px solid hsla(0,0%,100%,.30196078431372547)}.igroup>.in:first-child{border-radius:15px 15px 0 0}.igroup>.in:last-child{border-radius:0 0 15px 15px;margin-bottom:10px;border-bottom:none}.in>input{background-color:transparent;border:none;text-align:right;color:#db8b1d}[type=checkbox]{-webkit-appearance:none;-moz-appearance:none;appearance:none;width:51px;height:31px;border-radius:50px;background-color:rgba(148,148,154,.2)!important}[type=checkbox]:after{content:"";width:50%;border-radius:100%;height:80%;display:block;position:relative;background-color:#fff;top:12%;left:3%;transition:left .2s ease-in-out}[type=checkbox].on{background-color:#34c759!important}[type=checkbox].on:after{left:45%}');
var J,K=J||(J={});K[K.String=0]="String";K[K.Boolean=1]="Boolean";K[K.Number=2]="Number";K[K.Enum=3]="Enum";
let L={0:"text",1:"checkbox",2:"number",3:"select"},M=m(function({label:a,type:b,value:c}){let d=[];this.init=function(f){const e=`cb-${a.split(" ").join("-")}`,h=f.firstChild;h.innerText=a;h.htmlFor=e;const g=t("input");g.type=L[b];g.placeholder="placeholder";g.id=e;1===b&&((g.checked=c)&&p(g,"on"),g.onchange=()=>{g.classList.toggle("on")});f.appendChild(g);return{onClick:a=>{d.push(a)},destroy:()=>{d=[]}}};return'<div class="fR in"><label></label></div>'});n(".tc{display:flex;position:absolute;top:0;flex-flow:column-reverse;pointer-events:none;height:calc(100% - 63px);padding-bottom:63px}");
let N=m(function(){let a=0,b=[];this.init=function(c){return{destroy:()=>{b.map(a=>a.destroy());b=[];a=0},pushToast:function(d,f,e,h=2500){function g(){l.node.style.bottom=`-${63+200*(b.length+1)}px`;setTimeout(()=>{l.node.remove()},500)}const l=I({message:d,isError:f,id:a++});l.node.style.bottom=`-${63+200*(b.length+1)}px`;l.onClick(g);b.push(l);c.appendChild(l.node);setTimeout(()=>{l.node.style.bottom="0px";!e&&setTimeout(g,h)})}}};return'<div id="toc" class="fw tc"></div>'}),O={gen:{deviceName:"WBlinds",
mdnsName:"WBlinds",emitSync:!1},hw:{pStep:19,pDir:18,pEn:13,pSleep:21,pReset:3,pMs1:1,pMs2:5,pMs3:17,pHome:4,cLen:1650,cDia:.1,axDia:15,stepsPerRev:200,res:16},mqtt:{enabled:!1,host:"192.168.0.99",port:1833,topic:"wblinds",user:"user"}},P={state:{pos:0,tPos:0,accel:0,speed:0},settings:B({},O),pendingState:B({},O),devices:{},presets:{}};
class aa{constructor(){this._loadedKeys={devices:!1,presets:!1,pendingState:!1,settings:!1,state:!1};this._observers={};this._state=B({},P)}get(a){a=a.split(".");let b=this._state;for(;0<a.length;){if("object"!==typeof b)return;b=b[a.shift()]}return b}isLoaded(a){return this._loadedKeys[a]}update(a,b){var c,d;null!==(c=(d=this._observers)[a])&&void 0!==c?c:d[a]=[];let f=this._state[a];this._state[a]=B({},f,C(b));this._loadedKeys[a]=!0;this._observers[a].forEach(a=>{a({value:{...b},prev:f})})}observe(a,
b){var c,d;null!==(c=(d=this._observers)[a])&&void 0!==c?c:d[a]=[];this._observers[a].push(b);this._loadedKeys[a]&&b({value:B({},this._state[a]),prev:void 0})}}let Q=new aa;n(".dt{justify-content:space-between}");
let ba=m(function(){let a=!0,b=[],c=[];this.init=function(){function d(){if(a){var b=w("hl"),c=w("hlc");b.style.display="none";q(c,"hide");a=!1}}function f(a){a=w(`${a}-tiles`);return{container:a,tiles:a.querySelectorAll("div")}}function e(a){const {container:b,tiles:c}=f(a);a=Math.floor(b.clientWidth/110);let d=c.length;for(;0!==d%a;){const a=u();p(a,"tile","sq","em");b.appendChild(a);d++}}function h(a,c){const {container:d,tiles:l}=f(a);l.forEach(a=>{a.id in c&&(c[a.id]=void 0)});for(const [e,v]of Object.entries(c)){if(!v)continue;
const c=G({id:`tile-${e}`,name:v.name||e,...v});c.onClick(b=>g(a,b));b.push(c);d.appendChild(c.node)}e(a)}function g(a,b){"device"===a&&c.forEach(a=>a(b))}r(()=>{Q.observe("presets",({value:a})=>{d();h("preset",a)});Q.observe("devices",({value:a})=>{d();h("device",a)})});return{onDeviceClick:a=>{c.push(a)},destroy:()=>{c=[];b.forEach(a=>a.destroy());b=[]}}};return'<div id="h" class="f flex"><div id="hl" class="loader"></div><div id="hlc" class="hide fw" style="text-align: left;"><h1 id="ht">WBlinds</h1><h4 class="hst">Presets</h4><div id="preset-tiles" class="pt fw flex wrap"></div><h4 class="hst">Devices</h4><div id="device-tiles" class="dt fw flex wrap"></div></div></div>'});
n("#pas{margin-bottom:20px}#stcc{display:flex}#stcc>span{margin:auto}#stcc>div{justify-content:center}");var R,S=R||(R={});S[S.Pins=0]="Pins";S[S.Physical=1]="Physical";S[S.MQTT=2]="MQTT";
let T={gen:{deviceName:{type:0,label:"Device name"},mdnsName:{type:0,label:"mDNS Name"},emitSync:{type:1,label:"Emit sync data"}},mqtt:{enabled:{type:1,label:"Enabled",group:2},host:{type:0,label:"Host",group:2},port:{type:2,label:"Port",group:2},topic:{type:0,label:"Topic",group:2},user:{type:0,label:"Username",group:2}},hw:{axDia:{type:2,label:"Axis diameter",group:1},cDia:{type:2,label:"Cord diameter",group:1},cLen:{type:2,label:"Cord length",group:1},pDir:{type:2,label:"Direction pin",group:0},
pEn:{type:2,label:"Enable pin",group:0},pHome:{type:2,label:"Home switch pin",group:0},pMs1:{type:2,label:"Microstep pin 1",group:0},pMs2:{type:2,label:"Microstep pin 2",group:0},pMs3:{type:2,label:"Microstep pin 3",group:0},pReset:{type:2,label:"Reset pin",group:0},pSleep:{type:2,label:"Sleep pin",group:0},pStep:{type:2,label:"Step pin",group:0},stepsPerRev:{type:2,label:"Steps/revolution",group:1},res:{type:3,label:"Resolution",group:1,enumOpts:[1,4,8,16]}}},ca=m(function(){function a(a){const b=
t("span"),c=[];for(const e in T[a]){const {group:f,label:v,type:h,enumOpts:g}=T[a][e],l=M({label:v,type:h,enumOpts:g,value:Q.get(`${"settings"}.${a}.${e}`)});var d=f;if(null==d)d=b;else{if(null==c[d]){const a=u();p(a,"igroup");c[d]=a;b.appendChild(a)}d=c[d]}d.appendChild(l.node)}return b}let b=!0,c=[];const d=H({items:["General","Hardware","MQTT"]});let f,e,h;this.init=function(){function g(a){const b=w("stcc");let c;0===a?c=f:1===a?c=e:2===a&&(c=h);b.innerHTML="";b.appendChild(c)}d.onChange(g);r(()=>
{Q.observe("settings",()=>{if(b){var c=w("sl"),k=w("slc");c.style.display="none";q(k,"hide");k.prepend(d.node);b=!1;c=u();c.id="stcc";k.appendChild(c);f=a("gen");e=a("hw");h=a("mqtt");g(d.index())}})});return{destroy:()=>{c.forEach(a=>a.destroy());c=[]}}};return'<div id="ps" class="f flex"><div id="sl" class="loader"></div><div id="slc" class="hide fw" style="text-align: left;"></div></div>'});console.log("use mocks: ",!1,"boolean");var U,V=U||(U={});V.GET="GET";V.POST="POST";
function da(a,b,c={}){return W(a,b,c)}function W(a,b,c={},d=0){return fetch(`${""}${a}`,{method:b}).then(f=>{if(!f.ok){d+=1;if(8<d){let c=Error(`Failed with ${f.status} on fetch [${b}] ${a}`);c.response=f;throw c;}setTimeout(W.bind(a,b,c,d),5E3*d)}return f.json()})}let ea=[4,5,22,24],X="pos tPos speed accel deviceName mdnsName emitSyncData pinStep pinDir pinEn pinSleep pinReset pinMs1 pinMs2 pinMs3 pinHomeSw cordLength cordDiameter axisDiameter stepsPerRev resolution mqttEnabled mqttHost mqttPort mqttTopic moveUp moveDown moveStop tick".split(" ");
var Y,Z=Y||(Y={});Z[Z.UpdateSettings=0]="UpdateSettings";Z[Z.UpdateState=1]="UpdateState";
function fa(a={}){function b(){d=new WebSocket(`ws://${window.location.hostname}/ws`);d.onopen=b=>{f=!0;e=0;a.onConnect&&a.onConnect(b,e)};d.onclose=c=>{f=!1;a.onDisconnect&&a.onDisconnect(c,e);setTimeout(b,Math.min(5E3*++e,6E4))};d.onmessage=b=>{b=c(b.data);a.onMessage&&b.map(b=>a.onMessage(b))};d.onerror=b=>{f=!1;a.onError&&a.onError(b,e)}}function c(a){var b=a.split("/");a=b.shift();let c=parseInt(b.shift()),d={},e={},f=1;for(let a=0,v=X.length;a<v&&0<b.length;a++){if(f&c){let c=X[a],f=b.shift();
4>a?d[c]=parseInt(f):e[c]=a in ea?f:parseInt(f)}f<<=1}b=[];0<Object.keys(d).length&&b.push({type:1,mac:a,data:d});0<Object.keys(e).length&&b.push({type:0,mac:a,data:e});return b}let d,f=!1,e=0;b();return{ws:d,push:()=>{f&&d.send("")}}}
function ha(a){function b(a){var b;if(l!==a){l=a;null===(b=null===k||void 0===k?void 0:k.destroy)||void 0===b?void 0:b.call(k);null===k||void 0===k?void 0:k.node.remove();switch(a){case 0:a=ba();a.onDeviceClick(c);k=a;break;case 1:k=null;break;case 2:k=ca(),Q.isLoaded("settings")||d("settings").then(a=>a&&Q.update("pendingState",a))}k&&h.appendChild(k.node)}}function c(){let a=F({});e.appendChild(a.node);setTimeout(a.show)}function d(a){return da(`/${a}`).then(b=>{Q.update(a,b);return b}).catch(f)}
function f(a){console.error(a);a=A(a)?(null===a||void 0===a?void 0:a.message)||"Error encountered, check console":a;g.pushToast(a,!0)}let e=x("body"),h=w("app");a.state=Q;let g=N({});e.appendChild(g.node);window.onerror=f;let l=-1,k;b(0);d("state");d("presets");d("devices");fa({onMessage(a){0===a.type&&Q.update("settings",{...Q.get("settings"),...a.data})},onError(a,b){b||g.pushToast("Websocket disconnected!",!0,!1,5E3)},onConnect(a,b){b&&g.pushToast("Websocket connected!")},onDisconnect(){}});a=
D();z(w("nav"),a.node);a.onClick(b)}n('html{touch-action:manipulation}body{margin:0;background-color:#111;font-family:-apple-system,BlinkMacSystemFont,helvetica,sans-serif;font-size:17px;font-weight:400;color:#fff;text-align:center;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;scrollbar-width:6px;scrollbar-color:var(--c-sb) transparent}body,html{height:100%;width:100%;position:fixed;-ms-scroll-chaining:none;overscroll-behavior:none}:focus{outline:none}h1,h4{font-weight:400}h1{font-size:32px}h4{-webkit-margin-after:.3em;margin-block-end:.3em;font-size:14px;padding-left:5px}.hide{display:none}.loader,.loader:after,.loader:before{border-radius:50%;width:2.5em;height:2.5em;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation:load7 1.8s ease-in-out infinite;animation:load7 1.8s ease-in-out infinite}.loader{margin:auto;color:#fff;font-size:10px;text-indent:-9999em;transform:translate3d(0,-100px,0);-webkit-animation-delay:-.16s;animation-delay:-.16s;align-self:center}.loader:after,.loader:before{content:"";position:absolute;top:0}.loader:before{left:-3.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:3.5em}@-webkit-keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}@keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}.em{opacity:0}ul{display:flex;list-style-type:none;-webkit-margin-before:0;margin-block-start:0;-webkit-margin-after:0;margin-block-end:0;-webkit-padding-start:0;padding-inline-start:0}li{display:list-item;text-align:-webkit-match-parent;color:hsla(0,0%,100%,.4)}li.s{color:#db8b1d}.f{width:100%;height:100%}.fC,.flex{display:flex}.fC{flex-direction:column}.fR{display:flex;flex-direction:row}.fSB{justify-content:space-between}.wrap{flex-wrap:wrap}.fh{height:100%}.fw{width:100%}#bg{height:100vh;width:100vw;position:fixed;z-index:-10;background-position:30%;background-repeat:no-repeat;background-size:cover;opacity:1;transition:opacity 2s;background-image:url(https://github.com/maxakuru/WBlinds/blob/main/public/bg.jpg?raw=true),linear-gradient(40deg,#1d0143,#293b7c,#300a52)}#app{display:flex;flex-direction:column;padding:23px 23px 0;height:calc(100% - 86px);overflow-y:scroll}.overlay{position:fixed;height:100%;width:100%;top:0;left:0;background-color:#333;font-size:24px;display:flex;align-items:center;justify-content:center;z-index:11;opacity:.95;transition:.7s;pointer-events:none}');
let ia=window.wblinds={};window.onload=()=>ha(ia)
