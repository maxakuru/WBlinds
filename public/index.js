function e(b){return(...c)=>{var a={};c=b.call(a,...c);c=(new DOMParser).parseFromString(c,"text/html");console.log("ctx: ",a);c=c.getElementsByTagName("body").item(0).firstChild;a=a.init.call(a,c);a.node=c;return a}}
var g=e(function(){const b=[];let c=0;this.init=function(a){console.log("elem: ",a);const d=a.querySelectorAll("li");console.log("buttons: ",d);d.forEach((a,l)=>{a.addEventListener("click",()=>{c=l;d.forEach((a,b)=>{b===c?a.classList.add("sel"):a.classList.remove("sel")});b.map(a=>a.call(void 0,l))})});return{onClick:a=>{b.push(a)},currentIndex:()=>c}};return'<ul class="fw navc"><li class="sel">Home</li><li>Routines</li><li>Settings</li></ul>'});let h=document.getElementById.bind(document);
class k{constructor(){this._observers={};this._state={}}update(b,c){var a,d;null!==(a=(d=this._observers)[b])&&void 0!==a?a:d[b]=[];let f=this._state[b];this._state[b]=c;this._observers[b].forEach(a=>{a({value:Object.assign({},c),prev:f})})}observe(b,c){var a,d;null!==(a=(d=this._observers)[b])&&void 0!==a?a:d[b]=[];this._observers[b].push(c);this._state[b]&&c({value:Object.assign({},this._state[b]),prev:void 0})}}let m=new k;
var n=e(function({name:b,id:c}){this.init=function(a){a.id=c;a.querySelector("p").innerText=b;return{onClick:()=>{}}};return'<div class="tile sq"><span></span><p>Bedroom Left</p></div>'}),p=e(function(){this.init=function(){function b(){h("hl").style.display="none";h("hlc").classList.remove("hide")}function c(a){a=h(`${a}-tiles`);return{container:a,tiles:a.querySelectorAll("div")}}function a(a){const {container:b,tiles:d}=c(a);a=Math.floor(b.clientWidth/110);let f=d.length;for(;0!==f%a;){const a=
document.createElement("div");a.classList.add("tile","sq","em");b.appendChild(a);f++}}function d(b,d){const {container:f,tiles:l}=c(b);l.forEach(a=>{a.id in d&&(d[a.id]=void 0)});for(const [a,b]of Object.entries(d)){if(!b)continue;const d=n(Object.assign({id:`tile-${a}`},b));f.appendChild(d.node)}a(b)}m.observe("presets",({value:a,prev:c})=>{console.log("presets updated: ",a,c);b();d("preset",a)});m.observe("devices",({value:a,prev:c})=>{console.log("devices updated: ",a,c);b();d("device",a)});return{temp:!0}};
return'<div class="f flex" id="h"><div class="loader" id="hl"></div><div id="hlc" class="hide" style="text-align: left;"><h1 id="ht">WBlinds</h1><h4 class="hst">Presets</h4><div id="preset-tiles" class="pt fw flex wrap"></div><h4 class="hst">Devices</h4><div id="device-tiles" class="dt fw flex wrap"></div></div></div>'});console.log("use mocks: ","false","string");var q,r=q||(q={});r.GET="GET";r.POST="POST";
function t(b,c){console.log("this: ",this);return fetch(b,{method:c}).then(a=>{if(!a.ok)throw a;return a.json()})}
function u(){function b(a){console.log("on click! ",a);if(c!==a)switch(c=a,a){case 0:{a=p();console.log("node: ",a.node);let b=h("app");b.firstChild.remove();b.appendChild(a.node)}}}window.wblinds.State=m;t("/presets").then(a=>{console.log("presets res: ",a);m.update("presets",a)});t("/devices").then(a=>{console.log("devices res: ",a);m.update("devices",a)});let c=-1;b(0);let a=g();console.log("node: ",a.node);h("nav").appendChild(a.node);console.log("nav: ",a.currentIndex());a.onClick(b)}var v=void 0;
void 0===v&&(v={});var w=v.insertAt;
if("undefined"!==typeof document){var x=document.head||document.getElementsByTagName("head")[0],y=document.createElement("style");y.type="text/css";"top"===w?x.firstChild?x.insertBefore(y,x.firstChild):x.appendChild(y):x.appendChild(y);y.styleSheet?y.styleSheet.cssText=':root{--blue:#06c;--green:#32d74b;--input:#db8b1d}html{touch-action:manipulation}body{margin:0;background-color:#111;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:17px;font-weight:400;color:#fff;text-align:center;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;scrollbar-width:6px;scrollbar-color:var(--c-sb) transparent}body,html{height:100%;width:100%;position:fixed;-ms-scroll-chaining:none;overscroll-behavior:none}h1,h4{font-weight:400}h1{font-size:32px}h4{-webkit-margin-after:.3em;margin-block-end:.3em;font-size:14px;padding-left:5px}.hide{display:none}.loader,.loader:after,.loader:before{border-radius:50%;width:2.5em;height:2.5em;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation:load7 1.8s ease-in-out infinite;animation:load7 1.8s ease-in-out infinite}.loader{margin:auto;color:#fff;font-size:10px;text-indent:-9999em;transform:translate3d(0,-100px,0);-webkit-animation-delay:-.16s;animation-delay:-.16s;align-self:center}.loader:after,.loader:before{content:"";position:absolute;top:0}.loader:before{left:-3.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:3.5em}@-webkit-keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}@keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}.dt{justify-content:space-between}.tile{background:rgba(0,0,0,.30196078431372547);border-radius:12px;display:flex}.tile.sq{width:110px;height:110px;margin:5px 0;position:relative}.tile.sq>span{width:109px;max-height:90px;top:10px;position:absolute;right:0;border-right:1px groove #fff}.tile.sq p{font-size:11px;margin:auto 21px 10px 9px;font-weight:500}ul{display:flex;list-style-type:none;-webkit-margin-before:0;margin-block-start:0;-webkit-margin-after:0;margin-block-end:0;-webkit-padding-start:0;padding-inline-start:0}li{display:list-item;text-align:-webkit-match-parent;color:hsla(0,0%,100%,.4)}.f{width:100%;height:100%}.flex{display:flex}.wrap{flex-wrap:wrap}.fw{width:100%}#bg{height:100vh;width:100vw;position:fixed;z-index:-10;background-position:30%;background-repeat:no-repeat;background-size:cover;opacity:1;transition:opacity 2s;background-image:url(bg.jpeg)}#nav{background:rgba(0,0,0,.5019607843137255);height:63px;display:flex}.navc{justify-content:space-evenly;align-self:center}.navc .sel{color:#db8b1d}#app{display:flex;flex-direction:column;padding:23px 23px 0;height:calc(100% - 86px);overflow-y:scroll}.overlay{position:fixed;height:100%;width:100%;top:0;left:0;background-color:#333;font-size:24px;display:flex;align-items:center;justify-content:center;z-index:11;opacity:.95;transition:.7s;pointer-events:none}':y.appendChild(document.createTextNode(':root{--blue:#06c;--green:#32d74b;--input:#db8b1d}html{touch-action:manipulation}body{margin:0;background-color:#111;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:17px;font-weight:400;color:#fff;text-align:center;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;scrollbar-width:6px;scrollbar-color:var(--c-sb) transparent}body,html{height:100%;width:100%;position:fixed;-ms-scroll-chaining:none;overscroll-behavior:none}h1,h4{font-weight:400}h1{font-size:32px}h4{-webkit-margin-after:.3em;margin-block-end:.3em;font-size:14px;padding-left:5px}.hide{display:none}.loader,.loader:after,.loader:before{border-radius:50%;width:2.5em;height:2.5em;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation:load7 1.8s ease-in-out infinite;animation:load7 1.8s ease-in-out infinite}.loader{margin:auto;color:#fff;font-size:10px;text-indent:-9999em;transform:translate3d(0,-100px,0);-webkit-animation-delay:-.16s;animation-delay:-.16s;align-self:center}.loader:after,.loader:before{content:"";position:absolute;top:0}.loader:before{left:-3.5em;-webkit-animation-delay:-.32s;animation-delay:-.32s}.loader:after{left:3.5em}@-webkit-keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}@keyframes load7{0%,80%,to{box-shadow:0 2.5em 0 -1.3em}40%{box-shadow:0 2.5em 0 0}}.dt{justify-content:space-between}.tile{background:rgba(0,0,0,.30196078431372547);border-radius:12px;display:flex}.tile.sq{width:110px;height:110px;margin:5px 0;position:relative}.tile.sq>span{width:109px;max-height:90px;top:10px;position:absolute;right:0;border-right:1px groove #fff}.tile.sq p{font-size:11px;margin:auto 21px 10px 9px;font-weight:500}ul{display:flex;list-style-type:none;-webkit-margin-before:0;margin-block-start:0;-webkit-margin-after:0;margin-block-end:0;-webkit-padding-start:0;padding-inline-start:0}li{display:list-item;text-align:-webkit-match-parent;color:hsla(0,0%,100%,.4)}.f{width:100%;height:100%}.flex{display:flex}.wrap{flex-wrap:wrap}.fw{width:100%}#bg{height:100vh;width:100vw;position:fixed;z-index:-10;background-position:30%;background-repeat:no-repeat;background-size:cover;opacity:1;transition:opacity 2s;background-image:url(bg.jpeg)}#nav{background:rgba(0,0,0,.5019607843137255);height:63px;display:flex}.navc{justify-content:space-evenly;align-self:center}.navc .sel{color:#db8b1d}#app{display:flex;flex-direction:column;padding:23px 23px 0;height:calc(100% - 86px);overflow-y:scroll}.overlay{position:fixed;height:100%;width:100%;top:0;left:0;background-color:#333;font-size:24px;display:flex;align-items:center;justify-content:center;z-index:11;opacity:.95;transition:.7s;pointer-events:none}'))}
window.wblinds={test:!0};window.onload=()=>u()