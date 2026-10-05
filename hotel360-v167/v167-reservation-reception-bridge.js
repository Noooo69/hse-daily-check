/* Hotel360 v167 bridge loader — loads validated source parts in order */
(async function(){
  try{
    const base=new URL('./',document.currentScript?.src||location.href);
    const names=['v167-bridge.part1.txt','v167-bridge.part2.txt','v167-bridge.part3.txt','v167-bridge.part4.txt','v167-bridge.part5.txt'];
    let source='';
    for(const name of names){
      const r=await fetch(new URL(name,base).href+'?v=167',{cache:'no-store'});
      if(!r.ok)throw new Error(name+' HTTP '+r.status);
      source+=await r.text();
    }
    (0,eval)(source+'\n//# sourceURL=hotel360-v167-reservation-reception-bridge.js');
    window.__hotel360V167BridgeLoaded=true;
  }catch(err){
    console.error('Hotel360 v167 bridge load failed',err);
    window.__hotel360V167BridgeLoaded=false;
    try{alert('تعذر تحميل ربط Hotel360 v167. حدّث الصفحة بعد قليل.');}catch(e){}
  }
})();
