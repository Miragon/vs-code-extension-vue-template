(function(){"use strict";var e={6507:function(e,n,t){t(6992),t(8674),t(9601),t(7727);var o=t(8935),r=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{attrs:{id:"app"}},[t("json-editor")],1)},u=[],i=t(1709),a=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[t("h1",[e._v("My Json-Editor")]),t("textarea",{ref:"textEditor",attrs:{id:"editor"},on:{keydown:function(n){return!n.type.indexOf("key")&&e._k(n.keyCode,"tab",9,n.key,"Tab")?null:(n.preventDefault(),e.enableTab.apply(null,arguments))},input:function(n){return n.preventDefault(),e.sendData.apply(null,arguments)}}})])},l=[],v=(t(8862),(0,i.aZ)({name:"JsonEditor",setup:function(){var e=(0,i.iH)(null),n=(0,i.iH)(0),t=(0,i.f3)("vscode");function o(){var n,t,o,r,u,i,a=null!==(n=null===(t=e.value)||void 0===t?void 0:t.selectionStart)&&void 0!==n?n:0,l=null!==(o=null===(r=e.value)||void 0===r?void 0:r.selectionEnd)&&void 0!==o?o:0;e.value.value=(null===(u=e.value)||void 0===u?void 0:u.value.substring(0,a))+"\t"+(null===(i=e.value)||void 0===i?void 0:i.value.substring(l)),e.value.selectionStart=e.value.selectionEnd=a+1}function r(e){try{JSON.parse(e)}catch(n){return!1}return!0}function u(e){switch(e.data.type){case"vuejsoneditor.update":var n=e.data.text;l(n),t.setState({text:n})}}function a(){var o;(n.value=e.value.selectionEnd,r(e.value.value))&&t.postMessage({type:"vuejsoneditor.edit",content:null===(o=e.value)||void 0===o?void 0:o.value})}function l(t){var o;try{var r;t||(t="{}"),o=JSON.parse(t),e.value.value=JSON.stringify(o,void 0,4),null===(r=e.value)||void 0===r||r.focus(),console.log("updateContent()",n.value),e.value.selectionEnd=n.value+4}catch(u){console.error("No valid json.")}}var v=t.getState();return v&&l(v.text),(0,i.bv)((function(){window.addEventListener("message",u)})),(0,i.Ah)((function(){window.removeEventListener("message",u)})),{textEditor:e,enableTab:o,sendData:a}}})),c=v,s=t(1001),f=(0,s.Z)(c,a,l,!1,null,"798f0045",null),d=f.exports,p=(0,i.aZ)({name:"App",components:{JsonEditor:d},setup:function(){(0,i.JJ)("vscode",vscode)}}),b=p,h=(0,s.Z)(b,r,u,!1,null,null,null),y=h.exports;o.Z.config.productionTip=!1,o.Z.use(i.ZP),new o.Z({render:function(e){return e(y)}}).$mount("#app")}},n={};function t(o){var r=n[o];if(void 0!==r)return r.exports;var u=n[o]={exports:{}};return e[o](u,u.exports,t),u.exports}t.m=e,function(){var e=[];t.O=function(n,o,r,u){if(!o){var i=1/0;for(c=0;c<e.length;c++){o=e[c][0],r=e[c][1],u=e[c][2];for(var a=!0,l=0;l<o.length;l++)(!1&u||i>=u)&&Object.keys(t.O).every((function(e){return t.O[e](o[l])}))?o.splice(l--,1):(a=!1,u<i&&(i=u));if(a){e.splice(c--,1);var v=r();void 0!==v&&(n=v)}}return n}u=u||0;for(var c=e.length;c>0&&e[c-1][2]>u;c--)e[c]=e[c-1];e[c]=[o,r,u]}}(),function(){t.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return t.d(n,{a:n}),n}}(),function(){t.d=function(e,n){for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})}}(),function(){t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)}}(),function(){var e={143:0};t.O.j=function(n){return 0===e[n]};var n=function(n,o){var r,u,i=o[0],a=o[1],l=o[2],v=0;if(i.some((function(n){return 0!==e[n]}))){for(r in a)t.o(a,r)&&(t.m[r]=a[r]);if(l)var c=l(t)}for(n&&n(o);v<i.length;v++)u=i[v],t.o(e,u)&&e[u]&&e[u][0](),e[u]=0;return t.O(c)},o=self["webpackChunkvue"]=self["webpackChunkvue"]||[];o.forEach(n.bind(null,0)),o.push=n.bind(null,o.push.bind(o))}();var o=t.O(void 0,[998],(function(){return t(6507)}));o=t.O(o)})();
//# sourceMappingURL=app-legacy.js.map