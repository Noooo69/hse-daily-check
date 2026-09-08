(() => {
'use strict';

const SUPABASE_URL='https://xqoutasygbtuplqvvuyq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_QEZ_5qrV6dGBve6gg0xGkg_o0ABCAS9';
const PUBLIC_PERMIT_BASE='https://noooo69.github.io/hse-daily-check/p/';
let db=null;

function loadSupabase(){
  return new Promise((resolve,reject)=>{
    if(window.supabase){resolve();return;}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('Supabase library failed to load'));
    document.head.appendChild(s);
  });
}
function el(id){return document.getElementById(id)}
function ensureAuthUI(){
  if(!document.getElementById('parkingAuthBtn')){
    const tabs=document.querySelector('.tabs');
    if(tabs){
      const b=document.createElement('button');
      b.id='parkingAuthBtn';
      b.className='tab';
      b.textContent='دخول الاستقبال';
      b.onclick=openAuthModal;
      tabs.appendChild(b);
    }
  }
  if(!document.getElementById('parkingAuthModal')){
    const d=document.createElement('div');
    d.className='modal';
    d.id='parkingAuthModal';
    d.innerHTML=`<div class="sheet"><div class="sheethead"><div><div class="sectionTitle">دخول موظف الاستقبال</div><div class="sub">مطلوب فقط لإنشاء الروابط القصيرة الآمنة.</div></div><button class="close" id="parkingAuthClose">×</button></div><div class="form" style="margin-top:12px"><div class="field"><label>البريد الإلكتروني</label><input id="parkingAuthEmail" type="email" autocomplete="username"></div><div class="field"><label>كلمة المرور</label><input id="parkingAuthPassword" type="password" autocomplete="current-password"></div></div><div class="actions"><button class="btn primary" id="parkingAuthLogin">تسجيل الدخول</button><button class="btn secondary" id="parkingAuthLogout">تسجيل الخروج</button><button class="btn secondary" id="parkingAuthCancel">إلغاء</button></div><div class="mini" id="parkingAuthMsg"></div></div>`;
    document.body.appendChild(d);
    el('parkingAuthClose').onclick=closeAuthModal;
    el('parkingAuthCancel').onclick=closeAuthModal;
    el('parkingAuthLogin').onclick=signInReception;
    el('parkingAuthLogout').onclick=signOutReception;
  }
}
function openAuthModal(){ensureAuthUI();el('parkingAuthModal').classList.add('show');el('parkingAuthMsg').textContent=''}
function closeAuthModal(){el('parkingAuthModal')?.classList.remove('show')}
async function refreshAuthUI(){
  if(!db)return;
  const {data}=await db.auth.getSession();
  const user=data?.session?.user;
  const b=el('parkingAuthBtn');
  if(b){b.textContent=user?'متصل ✓':'دخول الاستقبال';b.classList.toggle('active',!!user)}
}
async function signInReception(){
  if(!db)return;
  const msg=el('parkingAuthMsg');
  const email=el('parkingAuthEmail').value.trim();
  const password=el('parkingAuthPassword').value;
  if(!email||!password){msg.textContent='أدخل البريد وكلمة المرور.';return}
  msg.textContent='جاري تسجيل الدخول...';
  const {error}=await db.auth.signInWithPassword({email,password});
  if(error){msg.textContent='تعذر تسجيل الدخول: '+error.message;return}
  msg.textContent='تم تسجيل الدخول بنجاح ✓';
  el('parkingAuthPassword').value='';
  await refreshAuthUI();
  setTimeout(closeAuthModal,500);
}
async function signOutReception(){
  if(!db)return;
  await db.auth.signOut();
  el('parkingAuthMsg').textContent='تم تسجيل الخروج.';
  await refreshAuthUI();
}
async function ensureReceptionAuth(){
  if(!db){alert('تعذر الاتصال بخدمة الروابط القصيرة.');return null}
  const {data}=await db.auth.getSession();
  if(data?.session)return data.session;
  openAuthModal();
  el('parkingAuthMsg').textContent='سجّل دخول الاستقبال أولاً ثم اضغط مشاركة مرة ثانية.';
  return null;
}
function validGuestData(data){
  if(!data?.spots?.length){alert('اختر موقفاً');return false}
  if(!data.room){alert('أدخل رقم الغرفة');return false}
  if(new Date(data.end)<=new Date(data.start)||new Date(data.end)<=new Date()){
    alert('تأكد أن نهاية التصريح بعد البداية وفي المستقبل');return false;
  }
  return true;
}
function makeShareText(data){
  const spotText=(data.spots||[]).map(n=>{
    const f=Number(n)<=11?'B1':'B2';
    return `${f}-${String(n).padStart(2,'0')}`;
  }).join('، ');
  return `تصريح موقف ديار المدينة\nالغرفة: ${data.room||'-'}\nالموقف: ${spotText||'-'}\nرقم التصريح: ${data.code||'-'}\nصالح حتى: ${typeof fmt==='function'?fmt(data.end):data.end}\n\nفتح التصريح:`;
}
async function createShortLink(){
  const data=permitDataFromCurrent();
  if(!validGuestData(data))return null;
  const session=await ensureReceptionAuth();
  if(!session)return null;
  const msg=el('linkMsg');
  if(msg)msg.textContent='جاري إنشاء الرابط القصير...';
  const {data:token,error}=await db.rpc('create_parking_permit_share',{
    p_room_no:data.room,
    p_permit_code:data.code,
    p_valid_from:new Date(data.start).toISOString(),
    p_valid_until:new Date(data.end).toISOString(),
    p_spots:data.spots,
    p_plates:data.plates||{}
  });
  if(error){
    if(msg)msg.textContent='تعذر إنشاء الرابط: '+error.message;
    if(/Not allowed|Authentication required/i.test(error.message))openAuthModal();
    return null;
  }
  const url=PUBLIC_PERMIT_BASE+'?p='+encodeURIComponent(token);
  if(msg)msg.textContent='الرابط القصير: '+url;
  navigator.clipboard?.writeText(url).catch(()=>{});
  if(typeof renderPermitWithQR==='function')renderPermitWithQR(data,url);
  try{
    if(typeof currentEditId!=='undefined'&&currentEditId){
      const b=bookings.find(x=>x.id===currentEditId);
      if(b){b.shareToken=token;b.shareUrl=url;saveState();}
    }
  }catch(_){}
  return url;
}
async function shareShortPermit(){
  const data=permitDataFromCurrent();
  const url=await createShortLink();
  if(!url)return;
  const text=makeShareText(data);
  if(navigator.share){
    try{await navigator.share({title:'تصريح موقف ديار المدينة',text,url});return}
    catch(e){if(e?.name==='AbortError')return}
  }
  await navigator.clipboard?.writeText(text+'\n'+url).catch(()=>{});
  alert('تم نسخ رسالة التصريح والرابط القصير');
}
async function shortGuestOnMain(){
  const token=new URLSearchParams(location.search).get('p');
  if(!token)return;
  const staff=document.getElementById('staffView');
  const top=document.querySelector('.topbar');
  const guest=document.getElementById('guestView');
  if(staff)staff.classList.add('hidden');
  if(top)top.classList.add('hidden');
  if(guest){guest.classList.remove('hidden');guest.innerHTML='<div class="panel"><div class="title">جاري التحقق من التصريح...</div></div>';}
  const {data,error}=await db.rpc('get_parking_permit_share',{p_token:token});
  if(error||!data||!data.length){
    if(guest)guest.innerHTML='<div class="panel"><div class="title">التصريح غير صالح أو انتهت صلاحيته</div></div>';
    return;
  }
  const r=data[0];
  const d={room:r.room_no,code:r.permit_code,start:r.valid_from,end:r.valid_until,spots:(r.spots||[]).map(Number),plates:r.plates||{}};
  if(guest&&typeof permitHTML==='function'){
    guest.innerHTML=permitHTML(d,location.href);
    setTimeout(()=>{
      const q=document.getElementById('permitQR');
      if(q&&window.QRCode){q.innerHTML='';new QRCode(q,{text:location.href,width:128,height:128})}
    },50);
  }
}
async function init(){
  try{
    await loadSupabase();
    db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    ensureAuthUI();
    await refreshAuthUI();
    window.createGuestLink=createShortLink;
    window.sharePermit=shareShortPermit;
    await shortGuestOnMain();
  }catch(e){
    console.error('Parking short-link integration:',e);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();