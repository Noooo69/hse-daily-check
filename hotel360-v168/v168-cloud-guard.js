/* Hotel360 v168 — keep demo records local */
(function(){
'use strict';
function hasDemo(){try{return typeof window.v168DemoCount==='function'&&window.v168DemoCount()>0}catch(e){return false}}
const old166=window.v166SyncNow;
if(typeof old166==='function')window.v166SyncNow=async function(){if(hasDemo())return alert('يوجد بيانات تجريبية v168. حفاظًا على قاعدة البيانات، احذف بيانات التجربة أولًا ثم نفّذ المزامنة السحابية.');return old166.apply(this,arguments)};
const old167=window.v167SyncReceptionCloud;
if(typeof old167==='function')window.v167SyncReceptionCloud=async function(){if(hasDemo())return alert('يوجد بيانات تجريبية v168. لن يتم رفعها إلى Supabase. احذف بيانات التجربة أولًا ثم أعد المزامنة.');return old167.apply(this,arguments)};
})();
