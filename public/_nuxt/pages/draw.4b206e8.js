(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{246:function(t,e,r){"use strict";r.r(e);r(49),r(17),r(18),r(10),r(37);var n=r(19),o=(r(16),r(2)),c=(r(148),r(110)),l=r(250),d=r(50);function f(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}function m(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?f(Object(source),!0).forEach((function(e){Object(n.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):f(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var h={name:"Canvas",components:{CanvasMeta:r(249).default},props:{id:{type:String,required:!0},mode:{type:String,required:!0},section:Object},data:function(){return{canvas:null,ctx:null}},mounted:function(){var canvas=this.$refs.canvas,t=canvas.getContext("2d");this.highDPI(canvas,t),this.canvas=canvas,this.ctx=t,t.fillStyle="#ffffff",t.fillRect(0,0,canvas.width,canvas.height),"draw"===this.mode?(this.$store.dispatch("modules/drawing/setCanvas",canvas),this.$store.dispatch("modules/drawing/setCtx",t)):"display"===this.mode?this.makeDrawing(this.drawing.paths,500):"pixelate"===this.mode&&(this.makeDrawing(this.drawing.paths),this.pixelateDrawing(this.canvas,this.ctx,75))},methods:{highDPI:function(canvas,t){var rect=canvas.getBoundingClientRect();canvas.width=rect.width*devicePixelRatio,canvas.height=rect.height*devicePixelRatio,t.scale(devicePixelRatio,devicePixelRatio),canvas.style.width=rect.width+"px",canvas.style.height=rect.height+"px"},mousedown:function(t){this.$store.dispatch("modules/mouse/setMousePosition",t),"fill"!==this.mouseMode?(this.$store.dispatch("modules/mouse/setIsDrawing",!0),this.handleDraw(t),this.$store.dispatch("modules/drawing/logPathToCurrentPath",t)):(this.handleDraw(t),this.$store.dispatch("modules/drawing/logPathToCurrentPath",t))},mousemove:function(t){this.isDrawing&&"fill"!==this.mouseMode&&(this.handleDraw(t),this.$store.dispatch("modules/drawing/logPathToCurrentPath",t),this.$store.dispatch("modules/mouse/setMousePosition",t))},mouseup:function(){this.$store.dispatch("modules/mouse/setIsDrawing",!1),this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory"),this.$store.dispatch("modules/drawing/incrementHistory")},mouseleave:function(){this.isDrawing&&(this.$store.dispatch("modules/mouse/setIsDrawing",!1),this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory"),this.$store.dispatch("modules/drawing/incrementHistory"))},handleDraw:function(t){var e,r=this.ctx;switch("draw"===this.mode?e={mode:this.mouseMode,color:this.palette.current,size:this.size.current,x1:this.x,y1:this.y,x2:t.offsetX,y2:t.offsetY}:"display"!==this.mode&&"pixelate"!==this.mode||(e=t),e.mode){case"draw":case"erase":this.drawPath(r,e);break;case"fill":this.drawFill(r,e);break;case"clear":this.clearCanvas(r)}},drawPath:function(t,e){t.lineCap="round",t.lineJoin="round",t.strokeStyle=e.color,t.lineWidth=2*e.size,"erase"===e.mode&&(t.globalCompositeOperation="destination-out"),t.beginPath(),t.moveTo(e.x1,e.y1),t.lineTo(e.x2,e.y2),t.stroke(),t.closePath(),"erase"===e.mode&&(t.globalCompositeOperation="source-over")},drawFill:function(t,e){t.fillStyle=e.color;var r={x2:e.x2*devicePixelRatio,y2:e.y2*devicePixelRatio};c.a.fill(r.x2,r.y2,100,t)},clearCanvas:function(t){t.clearRect(0,0,t.canvas.width,t.canvas.height)},makeDrawing:function(t,e){var r=this;if(e){var n=function(){var r=Object(o.a)(regeneratorRuntime.mark((function r(){return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,Object(l.a)(t,function(){var r=Object(o.a)(regeneratorRuntime.mark((function r(path,i){var n;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return n=i>0?e/t[i-1].length/100:e,r.next=3,Object(l.b)(n);case 3:return r.next=5,c(path,i);case 5:case"end":return r.stop()}}),r)})));return function(t,e){return r.apply(this,arguments)}}());case 2:case"end":return r.stop()}}),r)})));return function(){return r.apply(this,arguments)}}(),c=function(){var t=Object(o.a)(regeneratorRuntime.mark((function t(path,i){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Object(l.a)(path,function(){var t=Object(o.a)(regeneratorRuntime.mark((function t(e,i){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Object(l.b)(5);case 2:r.handleDraw(e);case 3:case"end":return t.stop()}}),t)})));return function(e,r){return t.apply(this,arguments)}}());case 2:case"end":return t.stop()}}),t)})));return function(e,r){return t.apply(this,arguments)}}();n()}else t.forEach((function(path,i){path.forEach((function(t){r.handleDraw(t)}))}))},pixelateDrawing:function(canvas,t,e){var r=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,img,c,l,d,f;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return t.filter="opacity(50%)",o=t.getImageData(0,0,t.canvas.width*devicePixelRatio,t.canvas.height*devicePixelRatio),n.next=4,createImageBitmap(o);case 4:return img=n.sent,c=img.width/e|0,l=img.height/e|0,t.imageSmoothingEnabled=t.mozImageSmoothingEnabled=t.msImageSmoothingEnabled=t.webkitImageSmoothingEnabled=!1,t.drawImage(img,0,0,c,l),d=t.getImageData(0,0,t.canvas.width,t.canvas.height),n.next=11,createImageBitmap(d);case 11:f=n.sent,r.clearCanvas(t),t.drawImage(f,0,0,c,l,0,0,f.width/devicePixelRatio,f.height/devicePixelRatio),r.$refs.notAllowed.bg();case 15:case"end":return n.stop()}}),n)})))()}},computed:m(m(m(m({},Object(d.c)("modules/mouse",["palette","size","x","y","isDrawing"])),Object(d.c)("modules/mouse",{mouseMode:function(t){return t.mode}})),Object(d.c)("modules/drawing",["sections"])),{},{drawing:function(){return"display"===this.mode?this.section:"pixelate"===this.mode?this.sections[this.id]:void 0}})},v=(r(256),r(7)),component=Object(v.a)(h,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"border",attrs:{id:t.id}},[r("div",{staticClass:"canvas-wrap"},["display"===t.mode?r("CanvasMeta",{staticClass:"drawing-meta",attrs:{title:t.section.title,artist:t.section.artist,docId:t.section.docId}}):t._e(),t._v(" "),"pixelate"===t.mode?r("CanvasMeta",{ref:"notAllowed",staticClass:"drawing-meta not-allowed",attrs:{title:t.drawing.title,artist:t.drawing.artist}}):t._e(),t._v(" "),r("canvas",t._g({ref:"canvas"},"draw"===t.mode?{mousemove:t.mousemove,mousedown:t.mousedown,mouseup:t.mouseup,mouseleave:t.mouseleave}:{}))],1)])}),[],!1,null,null,null);e.default=component.exports;installComponents(component,{CanvasMeta:r(249).default,Canvas:r(246).default})},247:function(t,e,r){var content=r(255);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(23).default)("7ffe6944",content,!0,{sourceMap:!1})},248:function(t,e,r){var content=r(257);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(23).default)("562a4561",content,!0,{sourceMap:!1})},249:function(t,e,r){"use strict";r.r(e);r(147);var n={props:{title:{type:String,required:!0},artist:{type:String,required:!0},docId:String},computed:{isInstagram:function(){return this.artist.startsWith("@")}},methods:{bg:function(){this.$refs.bg.style.backgroundColor="transparent"}}},o=(r(254),r(7)),component=Object(o.a)(n,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{ref:"bg"},[r("div",{staticClass:"info"},[t.docId?r("nuxt-link",{attrs:{to:"/gallery/section/"+t.docId}},[t._v("\n      "+t._s(t.title)+"\n    ")]):t._e(),t._v(" "),t.docId?t._e():r("span",[t._v(t._s(t.title))]),t._v(" "),r("span",[t._v(" ")]),t._v(" "),r("span",[t._v("by")]),t._v(" "),r("span",[t._v(" ")]),t._v(" "),t.isInstagram?r("a",{attrs:{href:"https://www.instagram.com/"+t.artist.substr(1)+"/",target:"_blank",rel:"noopener noreferrer"}},[t._v("\n      "+t._s(t.artist)+"\n    ")]):r("span",[t._v(t._s(t.artist))])],1)])}),[],!1,null,"765a267d",null);e.default=component.exports},250:function(t,e,r){"use strict";r.d(e,"b",(function(){return c}));r(10),r(16);var n=r(2),o=function(){var t=Object(n.a)(regeneratorRuntime.mark((function t(e,r){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:n=0;case 1:if(!(n<e.length)){t.next=7;break}return t.next=4,r(e[n],n,e);case 4:n++,t.next=1;break;case 7:case"end":return t.stop()}}),t)})));return function(e,r){return t.apply(this,arguments)}}(),c=function(t){return new Promise((function(e){return setTimeout(e,t)}))};e.a=o},252:function(t,e,r){var n=r(5),o=r(253)(!1);n(n.S,"Object",{values:function(t){return o(t)}})},253:function(t,e,r){var n=r(8),o=r(38),c=r(31),l=r(58).f;t.exports=function(t){return function(e){for(var r,d=c(e),f=o(d),m=f.length,i=0,h=[];m>i;)r=f[i++],n&&!l.call(d,r)||h.push(t?[r,d[r]]:d[r]);return h}}},254:function(t,e,r){"use strict";var n=r(247);r.n(n).a},255:function(t,e,r){(e=r(22)(!1)).push([t.i,".drawing-meta[data-v-765a267d]{display:none;position:absolute;z-index:100;top:0;left:0;width:100%;height:100%;background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC) repeat}.drawing-meta .info[data-v-765a267d]{position:absolute;display:flex;align-items:center;justify-content:center;z-index:101;top:50%;left:50%;transform:translate3d(-50%,-50%,0);background:var(--white);height:60px;min-width:33%;width:100%;max-width:-webkit-max-content;max-width:-moz-max-content;max-width:max-content;border:2px solid var(--orange);padding:0 1rem}a[data-v-765a267d]{text-decoration:underline}a[data-v-765a267d]:hover{color:var(--blue)}.drawing-meta.not-allowed[data-v-765a267d]{display:block;background-color:var(--white)}.drawing-meta.not-allowed .info[data-v-765a267d]{display:none}.drawing-meta.not-allowed:hover .info[data-v-765a267d]{display:flex}",""]),t.exports=e},256:function(t,e,r){"use strict";var n=r(248);r.n(n).a},257:function(t,e,r){(e=r(22)(!1)).push([t.i,"#mid,#top{border-bottom:none}#bot,#mid{border-top:none}.canvas-wrap{position:relative;overflow:hidden;width:100%;max-width:540px;height:0;padding-top:33.33333%}.canvas-wrap:hover .drawing-meta{display:block}canvas{position:absolute;top:0;left:0;width:100%;height:100%}",""]),t.exports=e},262:function(t,e,r){var content=r(290);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(23).default)("c5c092bc",content,!0,{sourceMap:!1})},263:function(t,e,r){var content=r(292);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(23).default)("dd8e3330",content,!0,{sourceMap:!1})},264:function(t,e,r){var content=r(294);"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(23).default)("4a6fdffb",content,!0,{sourceMap:!1})},276:function(t,e,r){"use strict";r.r(e);r(49),r(17),r(18),r(10),r(37),r(111),r(16);var n=r(2),o=r(19),c=r(246);r(39),r(40),r(26),r(32),r(33),r(139),r(41);function l(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}function d(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?l(Object(source),!0).forEach((function(e){Object(o.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):l(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}function f(t,e){var r;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(r=function(t,e){if(!t)return;if("string"==typeof t)return m(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return m(t,e)}(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var i=0,n=function(){};return{s:n,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,l=!1;return{s:function(){r=t[Symbol.iterator]()},n:function(){var t=r.next();return c=t.done,t},e:function(t){l=!0,o=t},f:function(){try{c||null==r.return||r.return()}finally{if(l)throw o}}}}function m(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r}function h(){return v.apply(this,arguments)}function v(){return(v=Object(n.a)(regeneratorRuntime.mark((function t(){var e,r,o,c,l,m,h,v,x,O,j,k,img,C=arguments;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e=C.length>0&&void 0!==C[0]?C[0]:[],r=C.length>1&&void 0!==C[1]?C[1]:{},o=d({quality:1},r),o.quality,t.next=5,Promise.all(e.map(function(){var t=Object(n.a)(regeneratorRuntime.mark((function t(e){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,w(e);case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()));case 5:c=t.sent,l=y(c),m=l.width,h=l.height,(v=document.createElement("canvas")).width=m,v.height=h,x=0,(O=v.getContext("2d")).imageSmoothingEnabled=O.mozImageSmoothingEnabled=O.msImageSmoothingEnabled=O.webkitImageSmoothingEnabled=!1,O.fillStyle="#ffffff",O.fillRect(0,0,v.width,v.height),j=f(c);try{for(j.s();!(k=j.n()).done;)img=k.value,O.drawImage(img,0,x),x+=img.height}catch(t){j.e(t)}finally{j.f()}return t.abrupt("return",v.toDataURL("image/png"));case 18:case"end":return t.stop()}}),t)})))).apply(this,arguments)}function w(t){return new Promise((function(e,r){var img=new Image;img.onload=function(){return e(img)},img.onerror=function(t){return r(t)},img.src=t}))}function y(){var t,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],r=0,n=0,o=f(e);try{for(o.s();!(t=o.n()).done;){var img=t.value;r=Math.max(r,img.width),n+=img.height}}catch(t){o.e(t)}finally{o.f()}return{width:r,height:n}}var x=r(50);function O(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}function j(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?O(Object(source),!0).forEach((function(e){Object(o.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):O(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var k={name:"SaveModal",components:{Canvas:c.default},data:function(){return{title:"",artist:"",isTemp:!0}},computed:j(j(j({},Object(x.c)(["baseURL"])),Object(x.c)("modules/drawing",["type","paths","sections","words"])),{},{section:function(){return{paths:this.paths,title:this.title,artist:this.artist}}}),mounted:function(){this.title=this.words.join(" "),document.addEventListener("keydown",this.handleShortcuts)},beforeDestroy:function(){document.removeEventListener("keydown",this.handleShortcuts)},methods:{handleShortcuts:function(t){27===t.keyCode&&this.$emit("close-save")},closeMe:function(t){"save-modal"===t.target.className&&this.$emit("close-save")},saveDrawing:function(){var t=this;return Object(n.a)(regeneratorRuntime.mark((function e(){var r,n,o,c,l,d,f,m,v,w,y,x,O;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return d=function(title){var t=title.split(" ");return t[Math.floor(Math.random()*t.length)]},r=t.$fireStoreObj.Timestamp.fromDate(new Date),n=t.$fireStore.collection("completed").doc(),o=n.id,c=t.$fireStore.collection("sections").doc(),l=c.id,f={},m=[d(t.title)],(v=Object.keys(t.sections)).forEach((function(e){e!==t.type&&(m.push(d(t.sections[e].title)),f[e]=t.sections[e].thumb)})),w=t.$refs.previewCanvas.$refs.canvas.toDataURL(),f[t.type]=w,e.next=14,h([f.top,f.mid,f.bot]);case 14:y=e.sent,x={title:m.join(" "),date:r,likes:0,sections:{top:t.$fireStore.doc("sections/".concat("top"===t.type?l:t.sections.top.docId)),mid:t.$fireStore.doc("sections/".concat("mid"===t.type?l:t.sections.mid.docId)),bot:t.$fireStore.doc("sections/".concat("bot"===t.type?l:t.sections.bot.docId))},thumb:y},n.set(x),O={artist:t.artist||"anonymous",date:r,drawing:j({},t.paths),featuredIn:[t.$fireStore.doc("completed/".concat(o))],likes:0,thumb:w,title:t.title||"untitled",type:t.type},c.set(O).then((function(){alert("You did it! Ur drawing was saved!"),t.$emit("close-save",o)})).catch((function(t){alert("Oops, there was an error.. try again?"),console.error("Error writing document: ",t)})),v.forEach((function(e){if(e!==t.type){var r=t.sections[e].docId;t.$fireStore.collection("sections").doc(r).update({featuredIn:t.$fireStoreObj.FieldValue.arrayUnion(t.$fireStore.doc("completed/".concat(o)))})}}));case 20:case"end":return e.stop()}}),e)})))()}}},C=(r(289),r(7)),component=Object(C.a)(k,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"save-modal",on:{click:t.closeMe}},[r("div",[r("Canvas",{ref:"previewCanvas",attrs:{id:"save-preview",section:t.section,mode:"display"}}),t._v(" "),r("form",{staticClass:"border yellow"},[r("div",[r("label",{attrs:{for:"title"}},[t._v("your section's title:")]),t._v(" "),r("input",{directives:[{name:"model",rawName:"v-model",value:t.title,expression:"title"}],class:{temp:t.isTemp},attrs:{type:"text",id:"title",placeholder:t.title,maxlength:"17"},domProps:{value:t.title},on:{focus:function(e){t.isTemp=!1},input:function(e){e.target.composing||(t.title=e.target.value)}}})]),t._v(" "),r("div",[t._m(0),t._v(" "),r("input",{directives:[{name:"model",rawName:"v-model",value:t.artist,expression:"artist"}],attrs:{type:"text",id:"artist",maxlength:"30"},domProps:{value:t.artist},on:{input:function(e){e.target.composing||(t.artist=e.target.value)}}})]),t._v(" "),r("div",[r("input",{attrs:{type:"submit",value:"save & show me our masterpiece!"},on:{click:function(e){return e.preventDefault(),t.saveDrawing(e)}}})]),t._v(" "),r("div",[r("button",{on:{click:function(e){return e.preventDefault(),t.$emit("close-save")}}},[t._v("\n          wait, i'm not done drawing\n        ")])])])],1)])}),[function(){var t=this.$createElement,e=this._self._c||t;return e("label",{attrs:{for:"artist"}},[this._v("\n          your *ahem* artist name:\n          "),e("span",[this._v("(@s will link to your instagram)")])])}],!1,null,"0a8ec45f",null);e.default=component.exports;installComponents(component,{Canvas:r(246).default})},277:function(t,e,r){"use strict";r.r(e);r(49),r(17),r(18),r(10),r(37);var n=r(19),o=r(279),c=r(246),l=r(50);function d(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}var f={name:"Draw",components:{ToolBar:o.default,Canvas:c.default},computed:function(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?d(Object(source),!0).forEach((function(e){Object(n.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):d(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}({},Object(l.c)("modules/drawing",["type","sections"]))},m=r(7),component=Object(m.a)(f,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"mw-canvas"},[r("tool-bar"),t._v(" "),r("Canvas",{attrs:{id:"top",mode:t.sections.top.type===t.type?"draw":"pixelate"}}),t._v(" "),r("Canvas",{attrs:{id:"mid",mode:t.sections.mid.type===t.type?"draw":"pixelate"}}),t._v(" "),r("Canvas",{attrs:{id:"bot",mode:t.sections.bot.type===t.type?"draw":"pixelate"}})],1)}),[],!1,null,"4a10d932",null);e.default=component.exports;installComponents(component,{ToolBar:r(279).default,Canvas:r(246).default})},278:function(t,e,r){"use strict";r.r(e);var n=[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"icon interactive"},[e("img",{attrs:{src:r(149)}})])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"meta-box"},[e("div",{staticClass:"info"},[this._v("top")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"meta-box"},[e("div",{staticClass:"info"},[this._v("middle")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"meta-box"},[e("div",{staticClass:"info"},[this._v("bottom")])])}],o={name:"PickSection",methods:{openHelp:function(){this.$store.dispatch("setIsHelping",!0)}}},c=(r(293),r(7)),component=Object(c.a)(o,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("div",{staticClass:"border yellow info-panel"},[r("span",[t._v("pick a section to start drawing!")]),t._v(" "),r("button",{on:{click:function(e){return e.preventDefault(),t.openHelp(e)}}},[t._m(0)])]),t._v(" "),r("div",{staticClass:"section-template border pointer",on:{click:function(e){return t.$emit("picked-type","top")}}},[t._m(1)]),t._v(" "),r("div",{staticClass:"section-template border pointer",on:{click:function(e){return t.$emit("picked-type","mid")}}},[t._m(2)]),t._v(" "),r("div",{staticClass:"section-template border pointer",on:{click:function(e){return t.$emit("picked-type","bot")}}},[t._m(3)])])}),n,!1,null,"fc23e2f4",null);e.default=component.exports},279:function(t,e,r){"use strict";r.r(e);var n=[function(){var t=this.$createElement,e=this._self._c||t;return e("label",{attrs:{for:"draw"}},[e("img",{attrs:{src:r(113)}})])},function(){var t=this.$createElement,e=this._self._c||t;return e("label",{attrs:{for:"erase"}},[e("img",{attrs:{src:r(287)}})])},function(){var t=this.$createElement,e=this._self._c||t;return e("label",{attrs:{for:"fill"}},[e("img",{attrs:{src:r(288)}})])}],o=(r(49),r(17),r(18),r(10),r(37),r(19)),c=r(50);function l(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}function d(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?l(Object(source),!0).forEach((function(e){Object(o.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):l(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var f={name:"ToolBar",components:{SaveModal:r(276).default},data:function(){return{isSaving:!1}},mounted:function(){document.addEventListener("keydown",this.handleShortcuts)},beforeDestroy:function(){document.removeEventListener("keydown",this.handleShortcuts)},computed:d(d(d({mode:{get:function(){return this.$store.state.modules.mouse.mode},set:function(t){this.$store.dispatch("modules/mouse/setMode",t)}}},Object(c.c)("modules/mouse",["palette","size"])),Object(c.b)("modules/mouse",["currentSizeLessThanMax","currentSizeMoreThanMin"])),Object(c.b)("modules/drawing",["cantUndo","cantRedo","isDrawingEmpty"])),methods:{handleShortcuts:function(t){if(!this.isSaving)switch(isNaN(t.key)||this.setColor(this.palette.colors[t.key-1]),t.keyCode){case 68:this.mode="draw";break;case 69:this.mode="erase";break;case 70:this.mode="fill";break;case 219:this.decrementSize();break;case 221:this.incrementSize();break;case 90:this.undoCanvas();break;case 88:this.redoCanvas();break;case 67:case 8:this.clearCanvas(t);break;case 83:this.startSave()}},addColor:function(t){this.$store.dispatch("modules/mouse/addColor",t.target.value)},setColor:function(t){this.$store.dispatch("modules/mouse/setColor",t)},decrementSize:function(){this.$store.dispatch("modules/mouse/decrementSize")},incrementSize:function(){this.$store.dispatch("modules/mouse/incrementSize")},undoCanvas:function(){this.$store.dispatch("modules/drawing/undoCanvas")},redoCanvas:function(){this.$store.dispatch("modules/drawing/redoCanvas")},clearCanvas:function(t){this.$store.dispatch("modules/drawing/clearCanvas",t)},startSave:function(){this.isSaving=!0},closeSave:function(t){this.isSaving=!1,t&&this.$router.push({path:"/gallery/".concat(t)})}}},m=(r(291),r(7)),component=Object(m.a)(f,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("div",{staticClass:"toolbar border yellow mw-canvas canvas-tools"},[n("div",{staticClass:"tool-group mode"},[n("div",{staticClass:"tool draw",class:{active:"draw"===t.mode},attrs:{"data-tooltip":"draw"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.mode,expression:"mode"}],attrs:{type:"radio",name:"mode",id:"draw",value:"draw"},domProps:{checked:t._q(t.mode,"draw")},on:{change:function(e){t.mode="draw"}}}),t._v(" "),t._m(0)]),t._v(" "),n("div",{staticClass:"tool erase",class:{active:"erase"===t.mode},attrs:{"data-tooltip":"erase"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.mode,expression:"mode"}],attrs:{type:"radio",name:"mode",id:"erase",value:"erase"},domProps:{checked:t._q(t.mode,"erase")},on:{change:function(e){t.mode="erase"}}}),t._v(" "),t._m(1)]),t._v(" "),n("div",{staticClass:"tool fill",class:{active:"fill"===t.mode},attrs:{"data-tooltip":"fill"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.mode,expression:"mode"}],attrs:{type:"radio",name:"mode",id:"fill",value:"fill"},domProps:{checked:t._q(t.mode,"fill")},on:{change:function(e){t.mode="fill"}}}),t._v(" "),t._m(2)])]),t._v(" "),n("div",{staticClass:"tool-group size"},[n("button",{staticClass:"tool size-down",attrs:{disabled:!t.currentSizeMoreThanMin,"data-tooltip":"smaller"},on:{click:t.decrementSize}},[n("img",{attrs:{src:r(281),alt:""}})]),t._v(" "),n("span",[t._v(t._s(t.size.current)+"px")]),t._v(" "),n("button",{staticClass:"tool size-up",attrs:{disabled:!t.currentSizeLessThanMax,"data-tooltip":"bigger"},on:{click:t.incrementSize}},[n("img",{attrs:{src:r(282),alt:""}})])]),t._v(" "),n("div",{staticClass:"tool-group edits"},[n("button",{staticClass:"tool undo",attrs:{disabled:t.cantUndo,"data-tooltip":"undo"},on:{click:t.undoCanvas}},[n("img",{attrs:{src:r(283),alt:""}})]),t._v(" "),n("button",{staticClass:"tool redo",attrs:{disabled:t.cantRedo,"data-tooltip":"redo"},on:{click:t.redoCanvas}},[n("img",{attrs:{src:r(284),alt:""}})]),t._v(" "),n("button",{staticClass:"tool clear",attrs:{disabled:t.isDrawingEmpty,"data-tooltip":"clear"},on:{click:t.clearCanvas}},[n("img",{attrs:{src:r(285),alt:""}})]),t._v(" "),n("button",{staticClass:"tool save",attrs:{disabled:t.isDrawingEmpty,"data-tooltip":"save"},on:{click:t.startSave}},[n("img",{attrs:{src:r(286),alt:""}})])])]),t._v(" "),n("div",{staticClass:"toolbar border yellow color-palette"},[n("div",{staticClass:"tool-group palette"},[t._l(t.palette.colors,(function(e,r){return n("button",{key:r,staticClass:"swatch",class:{active:e===t.palette.current},style:{backgroundColor:e},on:{click:function(r){return t.setColor(e)}}})})),t._v(" "),n("input",{staticStyle:{display:"none"},attrs:{type:"color",id:"addColor"},on:{change:function(e){return t.addColor(e)}}}),t._v(" "),n("label",{staticClass:"add-color",attrs:{for:"addColor"}},[t._v("+")])],2)]),t._v(" "),t.isSaving?n("SaveModal",{on:{"close-save":t.closeSave}}):t._e()],1)}),n,!1,null,"04972556",null);e.default=component.exports;installComponents(component,{SaveModal:r(276).default})},281:function(t,e,r){t.exports=r.p+"d0c18fa7ab59c0e0c0148c878320dce5.svg"},282:function(t,e,r){t.exports=r.p+"16b68447aab5e85801211b44f9fbfb70.svg"},283:function(t,e,r){t.exports=r.p+"888be4083a37aa779b5017806022e012.svg"},284:function(t,e,r){t.exports=r.p+"90844d98a86ddefbac7f833dbdc8e85c.svg"},285:function(t,e,r){t.exports=r.p+"423082b635599268f57afac63fdad1e5.svg"},286:function(t,e,r){t.exports=r.p+"1c1671b1d0795e5d58451dfaebce0cfc.svg"},287:function(t,e,r){t.exports=r.p+"7e452ec42e9c466803cac6eebc82da1c.svg"},288:function(t,e,r){t.exports=r.p+"bf2b15da672bfcd313078e31040bca33.svg"},289:function(t,e,r){"use strict";var n=r(262);r.n(n).a},290:function(t,e,r){(e=r(22)(!1)).push([t.i,".save-modal[data-v-0a8ec45f]{position:absolute;z-index:951;top:0;left:0;width:100vw;height:100vh;background:var(--lighter-blue) url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC) repeat;background-blend-mode:overlay;display:flex;align-items:center;justify-content:center}.canvas-wrap[data-v-0a8ec45f]:after{display:none}form[data-v-0a8ec45f]{margin-top:40px;padding:1rem;width:544px}form>div[data-v-0a8ec45f]{display:flex;align-items:baseline}form>div[data-v-0a8ec45f]:not(:first-child){margin-top:13.33333px}form input[data-v-0a8ec45f],form label[data-v-0a8ec45f]{position:relative;width:100%;padding:.5rem 0;font-size:inherit;font-family:inherit;border:none;border-radius:0;background:none;border-bottom:1px dotted var(--orange)}form[data-v-0a8ec45f] ::-moz-placeholder{color:#7f7f7f;opacity:1}form[data-v-0a8ec45f] :-ms-input-placeholder{color:#7f7f7f;opacity:1}form[data-v-0a8ec45f] ::-ms-input-placeholder{color:#7f7f7f;opacity:1}form[data-v-0a8ec45f] ::placeholder,form input.temp[data-v-0a8ec45f]{color:#7f7f7f;opacity:1}form label span[data-v-0a8ec45f]{width:100%;display:block;position:absolute;right:0;bottom:0;transform:translate3d(100%,100%,0);font-size:10px;text-align:center}form button[data-v-0a8ec45f],form input[type=submit][data-v-0a8ec45f]{margin-top:26.66667px;background:var(--light-yellow);border-left:2px solid var(--yellow);border-top:2px solid var(--yellow);border-color:var(--lighter-yellow) var(--yellow) var(--yellow) var(--lighter-yellow);border-style:solid;border-width:2px}form button[data-v-0a8ec45f]:active,form input[type=submit][data-v-0a8ec45f]:active{border-left:2px solid var(--lighter-yellow);border-top:2px solid var(--lighter-yellow);border-color:var(--yellow) var(--lighter-yellow) var(--lighter-yellow) var(--yellow);border-style:solid;border-width:2px;transform:translate3d(2px,2px,0)}form button[data-v-0a8ec45f]{margin-top:0;padding:.5rem;width:100%;text-align:center;background:none;border:2px solid var(--light-yellow);color:var(--orange)}",""]),t.exports=e},291:function(t,e,r){"use strict";var n=r(263);r.n(n).a},292:function(t,e,r){(e=r(22)(!1)).push([t.i,".toolbar[data-v-04972556]{height:60px;display:flex;padding:1rem;flex-wrap:wrap;justify-content:space-between;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.toolbar[data-v-04972556]:not(:first-child){margin:13.33333px 0}.toolbar img[data-v-04972556],.toolbar label[data-v-04972556]{pointer-events:none}.canvas-tools[data-v-04972556]{padding:calc(1rem - 4px) 1rem}.tool-group[data-v-04972556]{display:flex;align-items:center}.tool-group[data-v-04972556]>:not(:first-child){margin-left:.5rem}.tool[data-v-04972556]{width:25px;height:25px;box-sizing:content-box;border:2px solid transparent;display:flex;align-items:center;justify-content:center}.tool input[data-v-04972556]{display:none}.tool label[data-v-04972556]{width:100%}.tool img[data-v-04972556],.tool svg[data-v-04972556]{width:100%;display:block}.palette label[data-v-04972556]:not([disabled]):active,.tool[data-v-04972556]:not([disabled]):active{border-left:2px solid var(--lighter-blue);border-top:2px solid var(--lighter-blue);border-color:var(--light-blue) var(--lighter-blue) var(--lighter-blue) var(--light-blue);border-style:solid;border-width:2px;transform:translate3d(2px,2px,0)}.mode .tool.active[data-v-04972556]{border-left:2px solid var(--light-blue);border-top:2px solid var(--light-blue);border-color:var(--lighter-blue) var(--light-blue) var(--light-blue) var(--lighter-blue);border-style:solid;border-width:2px}.mode .tool.active[data-v-04972556]:active{border-left:2px solid var(--lighter-blue);border-top:2px solid var(--lighter-blue);border-color:var(--light-blue) var(--lighter-blue) var(--lighter-blue) var(--light-blue);border-style:solid;border-width:2px;transform:translate3d(2px,2px,0)}.mode .tool[data-v-04972556]:not(.active){-webkit-filter:grayscale(1);filter:grayscale(1);opacity:.6}.fill[data-v-04972556]{margin-left:.6rem!important}.size span[data-v-04972556]{width:4ch;text-align:center;pointer-events:none}.palette[data-v-04972556]{width:100%}.palette[data-v-04972556]>:not(:first-child){margin-left:0}.add-color[data-v-04972556],.swatch[data-v-04972556]{width:1.25rem;height:1.25rem;border:2px solid transparent}.swatch.active[data-v-04972556]{border:2px solid hsla(0,0%,100%,.75)}.add-color[data-v-04972556]{display:flex;align-items:center;justify-content:center}",""]),t.exports=e},293:function(t,e,r){"use strict";var n=r(264);r.n(n).a},294:function(t,e,r){(e=r(22)(!1)).push([t.i,".info-panel[data-v-fc23e2f4]{justify-content:center}.info-panel span[data-v-fc23e2f4]{margin-right:.5rem}.section-template[data-v-fc23e2f4]{position:relative;width:544px;height:180px;margin:13.33333px 0;transition:transform .1s ease,box-shadow .1s ease,border .1s ease}.section-template[data-v-fc23e2f4]:hover{--border-color:var(--light-yellow);--box-shadow-color:var(--orange);--box-shadow-size:6px;transform:translate3d(-4px,-4px,0)}.section-template:hover .meta-box[data-v-fc23e2f4]{display:block}.meta-box[data-v-fc23e2f4]{display:none;position:absolute;z-index:100;top:0;left:0;width:100%;height:100%;background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC) repeat}.meta-box .info[data-v-fc23e2f4]{position:absolute;display:flex;align-items:center;justify-content:center;z-index:101;top:50%;left:50%;transform:translate3d(-50%,-50%,0);background:var(--white);height:60px;min-width:33%;border:2px solid var(--orange);padding:0 1rem}",""]),t.exports=e},324:function(t,e,r){"use strict";r.r(e);r(49),r(17);var n=r(19),o=(r(252),r(18),r(10),r(37),r(16),r(2)),c=r(277),l=r(278),d=r(50),f=r(250);function m(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,r)}return e}var h={name:"draw",head:function(){return{title:"exquisite corpse club • draw"}},components:{Draw:c.default,PickSection:l.default},data:function(){return{isFetching:"not yet"}},fetch:function(t){return Object(o.a)(regeneratorRuntime.mark((function e(){var r,n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.store,n=t.$axios,o=[],e.prev=2,e.next=5,n.$get("/randomWords",{params:{hasDictionaryDef:!0,includePartOfSpeech:"adjective,noun",maxCorpusCount:-1,minDictionaryCount:1,maxDictionaryCount:-1,minLength:5,maxLength:8,limit:2,api_key:"fpti903j2soh7wgmcqp4t00kg0vn924nk8hvouyx4o49k4ylf"}});case 5:e.sent.forEach((function(t){return o.push(t.word.toLowerCase())})),e.next=13;break;case 9:e.prev=9,e.t0=e.catch(2),console.error(e.t0),o.push("untitled");case 13:r.dispatch("modules/drawing/setWords",o);case 14:case"end":return e.stop()}}),e,null,[[2,9]])})))()},mounted:function(){this.$store.dispatch("modules/drawing/clearDrawing"),this.$store.dispatch("modules/mouse/resetMouse")},methods:{handlePickedType:function(t){var e=this;return Object(o.a)(regeneratorRuntime.mark((function r(){var n,c,l;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return e.isFetching="yes",n=e.$fireStore.collection("sections"),c=Object.keys(e.sections),l=function(){var r=Object(o.a)(regeneratorRuntime.mark((function r(){return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,Object(f.a)(c,function(){var r=Object(o.a)(regeneratorRuntime.mark((function r(o){var c,l,d,f;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(o!==t){r.next=4;break}e.$store.dispatch("modules/drawing/setSections",{type:t,isTemp:!0}),r.next=18;break;case 4:return c=n.doc().id,l=n.where(e.$fireStoreObj.FieldPath.documentId(),">=",c).where("type","==",o).limit(1),r.next=8,l.get();case 8:if(!((d=r.sent).size>0)){r.next=13;break}d.forEach((function(t){var r={docId:t.id,paths:Object.values(t.data().drawing),type:t.data().type,thumb:t.data().thumb,artist:t.data().artist,title:t.data().title};e.$store.dispatch("modules/drawing/setSections",r)})),r.next=18;break;case 13:return f=n.where(e.$fireStoreObj.FieldPath.documentId(),"<",c).where("type","==",o).limit(1),r.next=16,f.get();case 16:r.sent.forEach((function(t){var r={docId:t.id,paths:Object.values(t.data().drawing),type:t.data().type,thumb:t.data().thumb,artist:t.data().artist,title:t.data().title};e.$store.dispatch("modules/drawing/setSections",r)}));case 18:case"end":return r.stop()}}),r)})));return function(t){return r.apply(this,arguments)}}());case 2:case"end":return r.stop()}}),r)})));return function(){return r.apply(this,arguments)}}(),r.next=6,l();case 6:e.$store.dispatch("modules/drawing/setType",t),e.isFetching="done";case 8:case"end":return r.stop()}}),r)})))()}},computed:function(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?m(Object(source),!0).forEach((function(e){Object(n.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):m(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}({},Object(d.c)("modules/drawing",["sections"]))},v=r(7),component=Object(v.a)(h,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"wrap"},["not yet"===t.isFetching?r("PickSection",{on:{"picked-type":t.handlePickedType}}):t._e(),t._v(" "),"yes"===t.isFetching?r("div",[t._v("we r loadings")]):t._e(),t._v(" "),"done"===t.isFetching?r("Draw"):t._e()],1)}),[],!1,null,null,null);e.default=component.exports;installComponents(component,{PickSection:r(278).default,Draw:r(277).default})}}]);