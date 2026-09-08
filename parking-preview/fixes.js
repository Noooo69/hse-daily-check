// Diyar Parking hotfixes: share only the short URL.
window.sharePermit = async function(){
  const url = await createGuestLink();
  if(!url) return;
  if(navigator.share){
    try{
      await navigator.share({url});
      return;
    }catch(e){
      if(e && e.name === 'AbortError') return;
    }
  }
  try{ await navigator.clipboard.writeText(url); }catch(_){ }
  alert('تم نسخ رابط التصريح');
};
