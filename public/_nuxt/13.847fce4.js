/*! For license information please see LICENSES */
(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{318:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(82),o=n(109),c=function(){function e(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY"}return e.prototype.setInstantiationMode=function(e){return this.instantiationMode=e,this},e.prototype.setMultipleInstances=function(e){return this.multipleInstances=e,this},e.prototype.setServiceProps=function(e){return this.serviceProps=e,this},e}(),l=function(){function e(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map}return e.prototype.get=function(e){void 0===e&&(e="[DEFAULT]");var t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){var n=new o.Deferred;this.instancesDeferred.set(t,n);try{var r=this.getOrInitializeService(t);r&&n.resolve(r)}catch(e){}}return this.instancesDeferred.get(t).promise},e.prototype.getImmediate=function(e){var t=r.__assign({identifier:"[DEFAULT]",optional:!1},e),n=t.identifier,o=t.optional,c=this.normalizeInstanceIdentifier(n);try{var l=this.getOrInitializeService(c);if(!l){if(o)return null;throw Error("Service "+this.name+" is not available")}return l}catch(e){if(o)return null;throw e}},e.prototype.getComponent=function(){return this.component},e.prototype.setComponent=function(component){var e,t;if(component.name!==this.name)throw Error("Mismatching Component "+component.name+" for Provider "+this.name+".");if(this.component)throw Error("Component for "+this.name+" has already been provided");if(this.component=component,function(component){return"EAGER"===component.instantiationMode}(component))try{this.getOrInitializeService("[DEFAULT]")}catch(e){}try{for(var n=r.__values(this.instancesDeferred.entries()),o=n.next();!o.done;o=n.next()){var c=r.__read(o.value,2),l=c[0],f=c[1],d=this.normalizeInstanceIdentifier(l);try{var h=this.getOrInitializeService(d);f.resolve(h)}catch(e){}}}catch(t){e={error:t}}finally{try{o&&!o.done&&(t=n.return)&&t.call(n)}finally{if(e)throw e.error}}},e.prototype.clearInstance=function(e){void 0===e&&(e="[DEFAULT]"),this.instancesDeferred.delete(e),this.instances.delete(e)},e.prototype.delete=function(){return r.__awaiter(this,void 0,void 0,(function(){var e;return r.__generator(this,(function(t){switch(t.label){case 0:return e=Array.from(this.instances.values()),[4,Promise.all(e.filter((function(e){return"INTERNAL"in e})).map((function(e){return e.INTERNAL.delete()})))];case 1:return t.sent(),[2]}}))}))},e.prototype.isComponentSet=function(){return null!=this.component},e.prototype.getOrInitializeService=function(e){var t=this.instances.get(e);return!t&&this.component&&(t=this.component.instanceFactory(this.container,function(e){return"[DEFAULT]"===e?void 0:e}(e)),this.instances.set(e,t)),t||null},e.prototype.normalizeInstanceIdentifier=function(e){return this.component?this.component.multipleInstances?e:"[DEFAULT]":e},e}();var f=function(){function e(e){this.name=e,this.providers=new Map}return e.prototype.addComponent=function(component){var e=this.getProvider(component.name);if(e.isComponentSet())throw new Error("Component "+component.name+" has already been registered with "+this.name);e.setComponent(component)},e.prototype.addOrOverwriteComponent=function(component){this.getProvider(component.name).isComponentSet()&&this.providers.delete(component.name),this.addComponent(component)},e.prototype.getProvider=function(e){if(this.providers.has(e))return this.providers.get(e);var t=new l(e,this);return this.providers.set(e,t),t},e.prototype.getProviders=function(){return Array.from(this.providers.values())},e}();t.Component=c,t.ComponentContainer=f,t.Provider=l},319:function(e,t,n){!function(e){"use strict";function t(e){return Array.prototype.slice.call(e)}function n(e){return new Promise((function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}}))}function r(e,t,r){var o,p=new Promise((function(c,l){n(o=e[t].apply(e,r)).then(c,l)}));return p.request=o,p}function o(e,t,n){var p=r(e,t,n);return p.then((function(e){if(e)return new v(e,p.request)}))}function c(e,t,n){n.forEach((function(n){Object.defineProperty(e.prototype,n,{get:function(){return this[t][n]},set:function(e){this[t][n]=e}})}))}function l(e,t,n,o){o.forEach((function(o){o in n.prototype&&(e.prototype[o]=function(){return r(this[t],o,arguments)})}))}function f(e,t,n,r){r.forEach((function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})}))}function d(e,t,n,r){r.forEach((function(r){r in n.prototype&&(e.prototype[r]=function(){return o(this[t],r,arguments)})}))}function h(e){this._index=e}function v(cursor,e){this._cursor=cursor,this._request=e}function _(e){this._store=e}function m(e){this._tx=e,this.complete=new Promise((function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)},e.onabort=function(){n(e.error)}}))}function y(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new m(n)}function w(e){this._db=e}c(h,"_index",["name","keyPath","multiEntry","unique"]),l(h,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),d(h,"_index",IDBIndex,["openCursor","openKeyCursor"]),c(v,"_cursor",["direction","key","primaryKey","value"]),l(v,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach((function(e){e in IDBCursor.prototype&&(v.prototype[e]=function(){var cursor=this,t=arguments;return Promise.resolve().then((function(){return cursor._cursor[e].apply(cursor._cursor,t),n(cursor._request).then((function(e){if(e)return new v(e,cursor._request)}))}))})})),_.prototype.createIndex=function(){return new h(this._store.createIndex.apply(this._store,arguments))},_.prototype.index=function(){return new h(this._store.index.apply(this._store,arguments))},c(_,"_store",["name","keyPath","indexNames","autoIncrement"]),l(_,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),d(_,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),f(_,"_store",IDBObjectStore,["deleteIndex"]),m.prototype.objectStore=function(){return new _(this._tx.objectStore.apply(this._tx,arguments))},c(m,"_tx",["objectStoreNames","mode"]),f(m,"_tx",IDBTransaction,["abort"]),y.prototype.createObjectStore=function(){return new _(this._db.createObjectStore.apply(this._db,arguments))},c(y,"_db",["name","version","objectStoreNames"]),f(y,"_db",IDBDatabase,["deleteObjectStore","close"]),w.prototype.transaction=function(){return new m(this._db.transaction.apply(this._db,arguments))},c(w,"_db",["name","version","objectStoreNames"]),f(w,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach((function(e){[_,h].forEach((function(n){e in n.prototype&&(n.prototype[e.replace("open","iterate")]=function(){var n=t(arguments),r=n[n.length-1],o=this._store||this._index,c=o[e].apply(o,n.slice(0,-1));c.onsuccess=function(){r(c.result)}})}))})),[h,_].forEach((function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var n=this,r=[];return new Promise((function(o){n.iterateCursor(e,(function(cursor){cursor?(r.push(cursor.value),void 0===t||r.length!=t?cursor.continue():o(r)):o(r)}))}))})})),e.openDb=function(e,t,n){var p=r(indexedDB,"open",[e,t]),o=p.request;return o&&(o.onupgradeneeded=function(e){n&&n(new y(o.result,e.oldVersion,o.transaction))}),p.then((function(e){return new w(e)}))},e.deleteDb=function(e){return r(indexedDB,"deleteDatabase",[e])},Object.defineProperty(e,"__esModule",{value:!0})}(t)},320:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(82),o=n(109),c=function(){function e(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY"}return e.prototype.setInstantiationMode=function(e){return this.instantiationMode=e,this},e.prototype.setMultipleInstances=function(e){return this.multipleInstances=e,this},e.prototype.setServiceProps=function(e){return this.serviceProps=e,this},e}(),l=function(){function e(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map}return e.prototype.get=function(e){void 0===e&&(e="[DEFAULT]");var t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){var n=new o.Deferred;this.instancesDeferred.set(t,n);try{var r=this.getOrInitializeService(t);r&&n.resolve(r)}catch(e){}}return this.instancesDeferred.get(t).promise},e.prototype.getImmediate=function(e){var t=r.__assign({identifier:"[DEFAULT]",optional:!1},e),n=t.identifier,o=t.optional,c=this.normalizeInstanceIdentifier(n);try{var l=this.getOrInitializeService(c);if(!l){if(o)return null;throw Error("Service "+this.name+" is not available")}return l}catch(e){if(o)return null;throw e}},e.prototype.getComponent=function(){return this.component},e.prototype.setComponent=function(component){var e,t;if(component.name!==this.name)throw Error("Mismatching Component "+component.name+" for Provider "+this.name+".");if(this.component)throw Error("Component for "+this.name+" has already been provided");if(this.component=component,function(component){return"EAGER"===component.instantiationMode}(component))try{this.getOrInitializeService("[DEFAULT]")}catch(e){}try{for(var n=r.__values(this.instancesDeferred.entries()),o=n.next();!o.done;o=n.next()){var c=r.__read(o.value,2),l=c[0],f=c[1],d=this.normalizeInstanceIdentifier(l);try{var h=this.getOrInitializeService(d);f.resolve(h)}catch(e){}}}catch(t){e={error:t}}finally{try{o&&!o.done&&(t=n.return)&&t.call(n)}finally{if(e)throw e.error}}},e.prototype.clearInstance=function(e){void 0===e&&(e="[DEFAULT]"),this.instancesDeferred.delete(e),this.instances.delete(e)},e.prototype.delete=function(){return r.__awaiter(this,void 0,void 0,(function(){var e;return r.__generator(this,(function(t){switch(t.label){case 0:return e=Array.from(this.instances.values()),[4,Promise.all(e.filter((function(e){return"INTERNAL"in e})).map((function(e){return e.INTERNAL.delete()})))];case 1:return t.sent(),[2]}}))}))},e.prototype.isComponentSet=function(){return null!=this.component},e.prototype.getOrInitializeService=function(e){var t=this.instances.get(e);return!t&&this.component&&(t=this.component.instanceFactory(this.container,function(e){return"[DEFAULT]"===e?void 0:e}(e)),this.instances.set(e,t)),t||null},e.prototype.normalizeInstanceIdentifier=function(e){return this.component?this.component.multipleInstances?e:"[DEFAULT]":e},e}();var f=function(){function e(e){this.name=e,this.providers=new Map}return e.prototype.addComponent=function(component){var e=this.getProvider(component.name);if(e.isComponentSet())throw new Error("Component "+component.name+" has already been registered with "+this.name);e.setComponent(component)},e.prototype.addOrOverwriteComponent=function(component){this.getProvider(component.name).isComponentSet()&&this.providers.delete(component.name),this.addComponent(component)},e.prototype.getProvider=function(e){if(this.providers.has(e))return this.providers.get(e);var t=new l(e,this);return this.providers.set(e,t),t},e.prototype.getProviders=function(){return Array.from(this.providers.values())},e}();t.Component=c,t.ComponentContainer=f,t.Provider=l},329:function(e,t,n){"use strict";n.r(t);var r,o=n(146),c=n.n(o),l=n(318),f=n(82),d=n(109),h=n(319),v=((r={})["missing-app-config-values"]='Missing App configuration value: "{$valueName}"',r["not-registered"]="Firebase Installation is not registered.",r["installation-not-found"]="Firebase Installation not found.",r["request-failed"]='{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',r["app-offline"]="Could not process request. Application offline.",r["delete-pending-registration"]="Can't delete installation while there is a pending registration request.",r),_=new d.ErrorFactory("installations","Installations",v);function m(e){return e instanceof d.FirebaseError&&e.code.includes("request-failed")}function y(e){return"https://firebaseinstallations.googleapis.com/v1/projects/"+e.projectId+"/installations"}function w(e){return{token:e.token,requestStatus:2,expiresIn:(t=e.expiresIn,Number(t.replace("s","000"))),creationTime:Date.now()};var t}function E(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return[4,t.json()];case 1:return n=o.sent(),r=n.error,[2,_.create("request-failed",{requestName:e,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})]}}))}))}function I(e){var t=e.apiKey;return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function O(e,t){var n=t.refreshToken,r=I(e);return r.append("Authorization",function(e){return"FIS_v2 "+e}(n)),r}function C(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t;return Object(f.__generator)(this,(function(n){switch(n.label){case 0:return[4,e()];case 1:return(t=n.sent()).status>=500&&t.status<600?[2,e()]:[2,t]}}))}))}function S(e,t){var n=t.fid;return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,r,body,o,c,l;return Object(f.__generator)(this,(function(f){switch(f.label){case 0:return t=y(e),r=I(e),body={fid:n,authVersion:"FIS_v2",appId:e.appId,sdkVersion:"w:0.4.14"},o={method:"POST",headers:r,body:JSON.stringify(body)},[4,C((function(){return fetch(t,o)}))];case 1:return(c=f.sent()).ok?[4,c.json()]:[3,3];case 2:return l=f.sent(),[2,{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:w(l.authToken)}];case 3:return[4,E("Create Installation",c)];case 4:throw f.sent()}}))}))}function T(e){return new Promise((function(t){setTimeout(t,e)}))}var j=/^[cdef][\w-]{21}$/;function A(){try{var e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;var t=function(e){return(t=e,btoa(String.fromCharCode.apply(String,Object(f.__spread)(t))).replace(/\+/g,"-").replace(/\//g,"_")).substr(0,22);var t}(e);return j.test(t)?t:""}catch(e){return""}}function N(e){return e.appName+"!"+e.appId}var D=new Map;function P(e,t){var n=N(e);L(n,t),function(e,t){var n=F();n&&n.postMessage({key:e,fid:t});k()}(n,t)}function L(e,t){var n,r,o=D.get(e);if(o)try{for(var c=Object(f.__values)(o),l=c.next();!l.done;l=c.next()){(0,l.value)(t)}}catch(e){n={error:e}}finally{try{l&&!l.done&&(r=c.return)&&r.call(c)}finally{if(n)throw n.error}}}var R=null;function F(){return!R&&"BroadcastChannel"in self&&((R=new BroadcastChannel("[Firebase] FID Change")).onmessage=function(e){L(e.data.key,e.data.fid)}),R}function k(){0===D.size&&R&&(R.close(),R=null)}var x,M,H="firebase-installations-store",B=null;function U(){return B||(B=Object(h.openDb)("firebase-installations-database",1,(function(e){switch(e.oldVersion){case 0:e.createObjectStore(H)}}))),B}function V(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r,o,c,l;return Object(f.__generator)(this,(function(f){switch(f.label){case 0:return n=N(e),[4,U()];case 1:return r=f.sent(),o=r.transaction(H,"readwrite"),[4,(c=o.objectStore(H)).get(n)];case 2:return l=f.sent(),[4,c.put(t,n)];case 3:return f.sent(),[4,o.complete];case 4:return f.sent(),l&&l.fid===t.fid||P(e,t.fid),[2,t]}}))}))}function G(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return t=N(e),[4,U()];case 1:return n=o.sent(),[4,(r=n.transaction(H,"readwrite")).objectStore(H).delete(t)];case 2:return o.sent(),[4,r.complete];case 3:return o.sent(),[2]}}))}))}function z(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r,o,c,l,d;return Object(f.__generator)(this,(function(f){switch(f.label){case 0:return n=N(e),[4,U()];case 1:return r=f.sent(),o=r.transaction(H,"readwrite"),[4,(c=o.objectStore(H)).get(n)];case 2:return l=f.sent(),void 0!==(d=t(l))?[3,4]:[4,c.delete(n)];case 3:return f.sent(),[3,6];case 4:return[4,c.put(d,n)];case 5:f.sent(),f.label=6;case 6:return[4,o.complete];case 7:return f.sent(),!d||l&&l.fid===d.fid||P(e,d.fid),[2,d]}}))}))}function K(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return[4,z(e,(function(n){var r=function(e){return J(e||{fid:A(),registrationStatus:0})}(n),o=function(e,t){if(0===t.registrationStatus){if(!navigator.onLine){var n=Promise.reject(_.create("app-offline"));return{installationEntry:t,registrationPromise:n}}var r={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},o=function(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return o.trys.push([0,2,,7]),[4,S(e,t)];case 1:return n=o.sent(),[2,V(e,n)];case 2:return m(r=o.sent())&&409===r.serverCode?[4,G(e)]:[3,4];case 3:return o.sent(),[3,6];case 4:return[4,V(e,{fid:t.fid,registrationStatus:0})];case 5:o.sent(),o.label=6;case 6:throw r;case 7:return[2]}}))}))}(e,r);return{installationEntry:r,registrationPromise:o}}return 1===t.registrationStatus?{installationEntry:t,registrationPromise:W(e)}:{installationEntry:t}}(e,r);return t=o.registrationPromise,o.installationEntry}))];case 1:return""!==(n=o.sent()).fid?[3,3]:(r={},[4,t]);case 2:return[2,(r.installationEntry=o.sent(),r)];case 3:return[2,{installationEntry:n,registrationPromise:t}]}}))}))}function W(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,n,r,o;return Object(f.__generator)(this,(function(c){switch(c.label){case 0:return[4,$(e)];case 1:t=c.sent(),c.label=2;case 2:return 1!==t.registrationStatus?[3,5]:[4,T(100)];case 3:return c.sent(),[4,$(e)];case 4:return t=c.sent(),[3,2];case 5:return 0!==t.registrationStatus?[3,7]:[4,K(e)];case 6:return n=c.sent(),r=n.installationEntry,(o=n.registrationPromise)?[2,o]:[2,r];case 7:return[2,t]}}))}))}function $(e){return z(e,(function(e){if(!e)throw _.create("installation-not-found");return J(e)}))}function J(e){return 1===(t=e).registrationStatus&&t.registrationTime+1e4<Date.now()?{fid:e.fid,registrationStatus:0}:e;var t}function Y(e,t){var n=e.appConfig,r=e.platformLoggerProvider;return Object(f.__awaiter)(this,void 0,void 0,(function(){var e,o,c,body,l,d,h;return Object(f.__generator)(this,(function(f){switch(f.label){case 0:return e=function(e,t){var n=t.fid;return y(e)+"/"+n+"/authTokens:generate"}(n,t),o=O(n,t),(c=r.getImmediate({optional:!0}))&&o.append("x-firebase-client",c.getPlatformInfoString()),body={installation:{sdkVersion:"w:0.4.14"}},l={method:"POST",headers:o,body:JSON.stringify(body)},[4,C((function(){return fetch(e,l)}))];case 1:return(d=f.sent()).ok?[4,d.json()]:[3,3];case 2:return h=f.sent(),[2,w(h)];case 3:return[4,E("Generate Auth Token",d)];case 4:throw f.sent()}}))}))}function Z(e,t){return void 0===t&&(t=!1),Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r,o;return Object(f.__generator)(this,(function(c){switch(c.label){case 0:return[4,z(e.appConfig,(function(r){if(!Q(r))throw _.create("not-registered");var o=r.authToken;if(!t&&function(e){return 2===e.requestStatus&&!function(e){var t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+36e5}(e)}(o))return r;if(1===o.requestStatus)return n=function(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return[4,X(e.appConfig)];case 1:n=o.sent(),o.label=2;case 2:return 1!==n.authToken.requestStatus?[3,5]:[4,T(100)];case 3:return o.sent(),[4,X(e.appConfig)];case 4:return n=o.sent(),[3,2];case 5:return 0===(r=n.authToken).requestStatus?[2,Z(e,t)]:[2,r]}}))}))}(e,t),r;if(!navigator.onLine)throw _.create("app-offline");var c=function(e){var t={requestStatus:1,requestTime:Date.now()};return Object(f.__assign)(Object(f.__assign)({},e),{authToken:t})}(r);return n=function(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r,o;return Object(f.__generator)(this,(function(c){switch(c.label){case 0:return c.trys.push([0,3,,8]),[4,Y(e,t)];case 1:return n=c.sent(),o=Object(f.__assign)(Object(f.__assign)({},t),{authToken:n}),[4,V(e.appConfig,o)];case 2:return c.sent(),[2,n];case 3:return!m(r=c.sent())||401!==r.serverCode&&404!==r.serverCode?[3,5]:[4,G(e.appConfig)];case 4:return c.sent(),[3,7];case 5:return o=Object(f.__assign)(Object(f.__assign)({},t),{authToken:{requestStatus:0}}),[4,V(e.appConfig,o)];case 6:c.sent(),c.label=7;case 7:throw r;case 8:return[2]}}))}))}(e,c),c}))];case 1:return r=c.sent(),n?[4,n]:[3,3];case 2:return o=c.sent(),[3,4];case 3:o=r.authToken,c.label=4;case 4:return[2,o]}}))}))}function X(e){return z(e,(function(e){if(!Q(e))throw _.create("not-registered");var t,n=e.authToken;return 1===(t=n).requestStatus&&t.requestTime+1e4<Date.now()?Object(f.__assign)(Object(f.__assign)({},e),{authToken:{requestStatus:0}}):e}))}function Q(e){return void 0!==e&&2===e.registrationStatus}function ee(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t;return Object(f.__generator)(this,(function(n){switch(n.label){case 0:return[4,K(e)];case 1:return(t=n.sent().registrationPromise)?[4,t]:[3,3];case 2:n.sent(),n.label=3;case 3:return[2]}}))}))}function te(e,t){return Object(f.__awaiter)(this,void 0,void 0,(function(){var n,r,o,c;return Object(f.__generator)(this,(function(l){switch(l.label){case 0:return n=function(e,t){var n=t.fid;return y(e)+"/"+n}(e,t),r=O(e,t),o={method:"DELETE",headers:r},[4,C((function(){return fetch(n,o)}))];case 1:return(c=l.sent()).ok?[3,3]:[4,E("Delete Installation",c)];case 2:throw l.sent();case 3:return[2]}}))}))}function ne(e,t){var n=e.appConfig;return function(e,t){F();var n=N(e),r=D.get(n);r||(r=new Set,D.set(n,r)),r.add(t)}(n,t),function(){!function(e,t){var n=N(e),r=D.get(n);r&&(r.delete(t),0===r.size&&D.delete(n),k())}(n,t)}}function re(e){return _.create("missing-app-config-values",{valueName:e})}function ie(){for(var s=0,i=0,e=arguments.length;i<e;i++)s+=arguments[i].length;var t=Array(s),n=0;for(i=0;i<e;i++)for(var a=arguments[i],r=0,o=a.length;r<o;r++,n++)t[n]=a[r];return t}(x=c.a).INTERNAL.registerComponent(new l.Component("installations",(function(e){var t=e.getProvider("app").getImmediate(),n={appConfig:function(e){var t,n;if(!e||!e.options)throw re("App Configuration");if(!e.name)throw re("App Name");try{for(var r=Object(f.__values)(["projectId","apiKey","appId"]),o=r.next();!o.done;o=r.next()){var c=o.value;if(!e.options[c])throw re(c)}}catch(e){t={error:e}}finally{try{o&&!o.done&&(n=r.return)&&n.call(r)}finally{if(t)throw t.error}}return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}(t),platformLoggerProvider:e.getProvider("platform-logger")};return{app:t,getId:function(){return function(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,n,r;return Object(f.__generator)(this,(function(o){switch(o.label){case 0:return[4,K(e.appConfig)];case 1:return t=o.sent(),n=t.installationEntry,(r=t.registrationPromise)?r.catch(console.error):Z(e).catch(console.error),[2,n.fid]}}))}))}(n)},getToken:function(e){return function(e,t){return void 0===t&&(t=!1),Object(f.__awaiter)(this,void 0,void 0,(function(){return Object(f.__generator)(this,(function(n){switch(n.label){case 0:return[4,ee(e.appConfig)];case 1:return n.sent(),[4,Z(e,t)];case 2:return[2,n.sent().token]}}))}))}(n,e)},delete:function(){return function(e){return Object(f.__awaiter)(this,void 0,void 0,(function(){var t,n;return Object(f.__generator)(this,(function(r){switch(r.label){case 0:return[4,z(t=e.appConfig,(function(e){if(!e||0!==e.registrationStatus)return e}))];case 1:if(!(n=r.sent()))return[3,6];if(1!==n.registrationStatus)return[3,2];throw _.create("delete-pending-registration");case 2:if(2!==n.registrationStatus)return[3,6];if(navigator.onLine)return[3,3];throw _.create("app-offline");case 3:return[4,te(t,n)];case 4:return r.sent(),[4,G(t)];case 5:r.sent(),r.label=6;case 6:return[2]}}))}))}(n)},onIdChange:function(e){return ne(n,e)}}}),"PUBLIC")),x.registerVersion("@firebase/installations","0.4.14");var oe,ae=[];!function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"}(oe||(oe={}));var se={debug:oe.DEBUG,verbose:oe.VERBOSE,info:oe.INFO,warn:oe.WARN,error:oe.ERROR,silent:oe.SILENT},ce=oe.INFO,ue=((M={})[oe.DEBUG]="log",M[oe.VERBOSE]="log",M[oe.INFO]="info",M[oe.WARN]="warn",M[oe.ERROR]="error",M),le=function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];if(!(t<e.logLevel)){var o=(new Date).toISOString(),c=ue[t];if(!c)throw new Error("Attempted to log a message with an invalid logType (value: "+t+")");console[c].apply(console,ie(["["+o+"]  "+e.name+":"],n))}},fe=function(){function e(e){this.name=e,this._logLevel=ce,this._logHandler=le,this._userLogHandler=null,ae.push(this)}return Object.defineProperty(e.prototype,"logLevel",{get:function(){return this._logLevel},set:function(e){if(!(e in oe))throw new TypeError('Invalid value "'+e+'" assigned to `logLevel`');this._logLevel=e},enumerable:!1,configurable:!0}),e.prototype.setLogLevel=function(e){this._logLevel="string"==typeof e?se[e]:e},Object.defineProperty(e.prototype,"logHandler",{get:function(){return this._logHandler},set:function(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"userLogHandler",{get:function(){return this._userLogHandler},set:function(e){this._userLogHandler=e},enumerable:!1,configurable:!0}),e.prototype.debug=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._userLogHandler&&this._userLogHandler.apply(this,ie([this,oe.DEBUG],e)),this._logHandler.apply(this,ie([this,oe.DEBUG],e))},e.prototype.log=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._userLogHandler&&this._userLogHandler.apply(this,ie([this,oe.VERBOSE],e)),this._logHandler.apply(this,ie([this,oe.VERBOSE],e))},e.prototype.info=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._userLogHandler&&this._userLogHandler.apply(this,ie([this,oe.INFO],e)),this._logHandler.apply(this,ie([this,oe.INFO],e))},e.prototype.warn=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._userLogHandler&&this._userLogHandler.apply(this,ie([this,oe.WARN],e)),this._logHandler.apply(this,ie([this,oe.WARN],e))},e.prototype.error=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._userLogHandler&&this._userLogHandler.apply(this,ie([this,oe.ERROR],e)),this._logHandler.apply(this,ie([this,oe.ERROR],e))},e}();var pe,de,he=n(320),ve="https://www.googletagmanager.com/gtag/js";!function(e){e.EVENT="event",e.SET="set",e.CONFIG="config"}(pe||(pe={})),function(e){e.ADD_SHIPPING_INFO="add_shipping_info",e.ADD_PAYMENT_INFO="add_payment_info",e.ADD_TO_CART="add_to_cart",e.ADD_TO_WISHLIST="add_to_wishlist",e.BEGIN_CHECKOUT="begin_checkout",e.CHECKOUT_PROGRESS="checkout_progress",e.EXCEPTION="exception",e.GENERATE_LEAD="generate_lead",e.LOGIN="login",e.PAGE_VIEW="page_view",e.PURCHASE="purchase",e.REFUND="refund",e.REMOVE_FROM_CART="remove_from_cart",e.SCREEN_VIEW="screen_view",e.SEARCH="search",e.SELECT_CONTENT="select_content",e.SELECT_ITEM="select_item",e.SELECT_PROMOTION="select_promotion",e.SET_CHECKOUT_OPTION="set_checkout_option",e.SHARE="share",e.SIGN_UP="sign_up",e.TIMING_COMPLETE="timing_complete",e.VIEW_CART="view_cart",e.VIEW_ITEM="view_item",e.VIEW_ITEM_LIST="view_item_list",e.VIEW_PROMOTION="view_promotion",e.VIEW_SEARCH_RESULTS="view_search_results"}(de||(de={}));var ge,_e=new fe("@firebase/analytics");function me(e,t,n){var r=function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];window[t].push(arguments)};return window[n]&&"function"==typeof window[n]&&(r=window[n]),window[n]=function(e,t){return function(n,r,o){if(n===pe.EVENT){var c=[];if(o&&o.send_to){var l=o.send_to;Array.isArray(l)||(l=[l]);for(var f=0,d=l;f<d.length;f++){var h=d[f],v=t[h];if(!v){c=[];break}c.push(v)}}if(0===c.length)for(var _=0,m=Object.values(t);_<m.length;_++){var y=m[_];c.push(y)}Promise.all(c).then((function(){return e(pe.EVENT,r,o||{})})).catch((function(e){return _e.error(e)}))}else if(n===pe.CONFIG){(t[r]||Promise.resolve()).then((function(){e(pe.CONFIG,r,o)})).catch((function(e){return _e.error(e)}))}else e(pe.SET,r)}}(r,e),{gtagCore:r,wrappedGtag:window[n]}}var ye,we,be=((ge={})["no-ga-id"]='"measurementId" field is empty in Firebase config. Firebase Analytics requires this field to contain a valid measurement ID.',ge["already-exists"]="A Firebase Analytics instance with the measurement ID ${id}  already exists. Only one Firebase Analytics instance can be created for each measurement ID.",ge["already-initialized"]="Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",ge["interop-component-reg-failed"]="Firebase Analytics Interop Component failed to instantiate",ge),Ee=new d.ErrorFactory("analytics","Analytics",be),Ie={},Oe="dataLayer",Ce="gtag",Se=!1;function Te(e){if(Se)throw Ee.create("already-initialized");e.dataLayerName&&(Oe=e.dataLayerName),e.gtagName&&(Ce=e.gtagName)}function je(e,t){var n=e.options.measurementId;if(!n)throw Ee.create("no-ga-id");if(null!=Ie[n])throw Ee.create("already-exists",{id:n});if(!Se){(function(){for(var e=window.document.getElementsByTagName("script"),t=0,n=Object.values(e);t<n.length;t++){var r=n[t];if(r.src&&r.src.includes(ve))return r}return null})()||function(e){var script=document.createElement("script");script.src=ve+"?l="+e,script.async=!0,document.head.appendChild(script)}(Oe),function(e){var t=[];Array.isArray(window[e])?t=window[e]:window[e]=t}(Oe);var r=me(Ie,Oe,Ce),o=r.wrappedGtag,c=r.gtagCore;we=o,ye=c,Se=!0}return Ie[n]=function(e,t,n){return Object(f.__awaiter)(this,void 0,void 0,(function(){var r,o;return Object(f.__generator)(this,(function(c){switch(c.label){case 0:return[4,t.getId()];case 1:return r=c.sent(),n("js",new Date),n(pe.CONFIG,e.options.measurementId,((o={}).firebase_id=r,o.origin="firebase",o.update=!0,o)),[2]}}))}))}(e,t,ye),{app:e,logEvent:function(e,t,r){return function(e,t,n,r,o){var c=r||{};o&&o.global||(c=Object(f.__assign)(Object(f.__assign)({},r),{send_to:t})),e(pe.EVENT,n,c||{})}(we,n,e,t,r)},setCurrentScreen:function(e,t){return function(e,t,n,r){r&&r.global?e(pe.SET,{screen_name:n}):e(pe.CONFIG,t,{update:!0,screen_name:n})}(we,n,e,t)},setUserId:function(e,t){return function(e,t,n,r){r&&r.global?e(pe.SET,{user_id:n}):e(pe.CONFIG,t,{update:!0,user_id:n})}(we,n,e,t)},setUserProperties:function(e,t){return function(e,t,n,r){if(r&&r.global){for(var o={},c=0,l=Object.keys(n);c<l.length;c++){var f=l[c];o["user_properties."+f]=n[f]}e(pe.SET,o)}else e(pe.CONFIG,t,{update:!0,user_properties:n})}(we,n,e,t)},setAnalyticsCollectionEnabled:function(e){return function(e,t){window["ga-disable-"+e]=!t}(n,e)}}}!function(e){e.INTERNAL.registerComponent(new he.Component("analytics",(function(e){return je(e.getProvider("app").getImmediate(),e.getProvider("installations").getImmediate())}),"PUBLIC").setServiceProps({settings:Te,EventName:de})),e.INTERNAL.registerComponent(new he.Component("analytics-internal",(function(e){try{return{logEvent:e.getProvider("analytics").getImmediate().logEvent}}catch(e){throw Ee.create("interop-component-reg-failed",{reason:e})}}),"PRIVATE")),e.registerVersion("@firebase/analytics","0.3.9")}(c.a)}}]);