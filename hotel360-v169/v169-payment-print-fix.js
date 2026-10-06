/* Hotel360 v169 — balance color semantics + clean arrivals print */
(function(){
'use strict';
const VERSION=169;
function S(){return state.v166||{};}
function V(){if(!state.v169||typeof state.v169!=='object')state.v169={};return state.v169;}
function n(v){const x=Number(v||0);return Number.isFinite(x)?x:0;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function today(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function money(v){return n(v).toLocaleString('ar-SA',{minimumFractionDigits:2,maximumFractionDigits:2})+' ريال';}
function guestBy(id){return (S().guestProfiles||[]).find(g=>g.id===id)||null;}
function companyBy(id){return (S().companies||[]).find(x=>x.id===id)||null;}
function groupBy(id){return (S().groups||[]).find(x=>x.id===id)||null;}
function guestName(r){return guestBy(r?.guestProfileId)?.fullName||r?.guestName||'نزيل';}
function unitTotal(u){return (u?.dailyRates||[]).reduce((s,d)=>s+n(d.amount)+n(d.tax)-n(d.discount),0);}
function total(r){const t=n(r?.finalTotal);return t>0?t:(r?.units||[]).reduce((s,u)=>s+unitTotal(u),0);}
function paid(r){const ps=r?.payments||[];const good=ps.filter(p=>!['refunded','void'].includes(p.status)).reduce((s,p)=>s+n(p.amount),0);const refunds=ps.filter(p=>p.status==='refunded').reduce((s,p)=>s+n(p.amount),0);return Math.max(0,good-refunds);}
function balance(r){return Math.max(0,total(r)-paid(r));}
function currentHotelId(){try{return String(typeof currentHotel==='function'&&currentHotel()?currentHotel().id:state.currentHotelId||'')}catch(e){return String(state.currentHotelId||'')}}
function hotelName(id){return (state.hotels||[]).find(h=>String(h.id)===String(id))?.name||String(id||'-');}
function typeLabel(r){if(r?.bookingType==='company'||r?.companyId)return 'شركة'+(companyBy(r.companyId)?.name?' — '+companyBy(r.companyId).name:'');if(r?.bookingType==='group'||r?.groupId)return 'قروب / مجموعة'+(groupBy(r.groupId)?.name?' — '+groupBy(r.groupId).name:'');return 'فردي';}
function payerLabel(r){if(r?.payerType==='company')return companyBy(r.companyId)?.name||r.payerName||'الشركة';if(r?.payerType==='group_master')return groupBy(r.groupId)?.name||r.payerName||'الحساب الرئيسي للقروب';return guestName(r);}
function findReservation(conf){return (S().reservations||[]).find(r=>String(r.confirmationNo||'').trim()===String(conf||'').trim())||null;}
function applyPaymentColors(){
  document.querySelectorAll('.v167-arrival').forEach(card=>{
    const conf=card.querySelector('h4 .v166-mono')?.textContent?.trim();
    const r=findReservation(conf);if(!r)return;
    const infos=[...card.querySelectorAll('.v167-info')];
    const remain=infos.find(x=>x.querySelector('small')?.textContent?.trim()==='المتبقي');
    if(!remain)return;
    const b=remain.querySelector('b');if(!b)return;
    const bal=balance(r);
    b.innerHTML=bal>0.009?`<span class="v169-balance-due">${esc(money(bal))}</span>`:`<span class="v169-balance-paid">✓ مدفوع بالكامل</span>`;
  });
}
function arrivals(){
  const date=state.v167?.arrivalDate||today(),hid=currentHotelId();
  return (S().reservations||[]).filter(r=>String(r.hotelId)===hid&&r.arrival===date&&['confirmed','due_in','checked_in'].includes(r.status));
}
function roomText(r){const rooms=(r.units||[]).map(u=>u.assignment?.roomNo).filter(Boolean);const qty=(r.units||[]).length||1;return rooms.length?rooms.join('، '):(qty+' بدون تخصيص');}
function printHtml(){
  const rows=arrivals(),date=state.v167?.arrivalDate||today(),hid=currentHotelId();
  const sumTotal=rows.reduce((s,r)=>s+total(r),0),sumPaid=rows.reduce((s,r)=>s+paid(r),0),sumBal=Math.max(0,sumTotal-sumPaid);
  const body=rows.map((r,i)=>{const b=balance(r),p=paid(r);return `<tr><td>${i+1}</td><td class="mono">${esc(r.confirmationNo||'-')}</td><td>${esc(guestName(r))}</td><td>${esc(typeLabel(r))}</td><td>${esc(roomText(r))}</td><td>${esc(money(total(r)))}</td><td>${esc(money(p))}</td><td class="${b>0.009?'due':'paid'}">${b>0.009?esc(money(b)):'مدفوع بالكامل'}</td><td>${esc(payerLabel(r))}</td></tr>`}).join('');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>دخول اليوم - ${esc(hotelName(hid))}</title><style>
  @page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;color:#18251f;margin:0;background:#fff}.head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:2px solid #173d32;padding-bottom:10px;margin-bottom:12px}.head h1{font-size:22px;margin:0 0 5px}.muted{color:#68756f;font-size:12px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 14px}.k{border:1px solid #d7dfdb;border-radius:10px;padding:8px}.k small{display:block;color:#68756f;margin-bottom:3px}.k b{font-size:16px}.red{color:#b42318}.green{color:#117a48}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #cfd8d3;padding:7px 6px;vertical-align:top}th{background:#eef5f1;font-weight:800}.due{color:#b42318;font-weight:900;background:#fff2f2}.paid{color:#117a48;font-weight:900;background:#edf9f1}.mono{font-family:Consolas,monospace}.foot{margin-top:10px;font-size:10px;color:#7a8781;text-align:left}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="head"><div><h1>Hotel360 — تقرير دخول اليوم</h1><div class="muted">الفندق: ${esc(hotelName(hid))} · تاريخ الوصول: ${esc(date)}</div></div><div class="muted">تمت الطباعة: ${esc(new Date().toLocaleString('ar-SA'))}</div></div><div class="kpis"><div class="k"><small>إجمالي الحجوزات</small><b>${rows.length}</b></div><div class="k"><small>إجمالي القيمة</small><b>${esc(money(sumTotal))}</b></div><div class="k"><small>المدفوع</small><b class="green">${esc(money(sumPaid))}</b></div><div class="k"><small>المتبقي</small><b class="${sumBal>0?'red':'green'}">${sumBal>0?esc(money(sumBal)):'مدفوع بالكامل'}</b></div></div><table><thead><tr><th>#</th><th>رقم الحجز</th><th>النزيل</th><th>نوع الحجز</th><th>الغرف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي / الحالة</th><th>جهة الدفع</th></tr></thead><tbody>${body||'<tr><td colspan="9" style="text-align:center;padding:24px">لا توجد حجوزات وصول لهذا التاريخ.</td></tr>'}</tbody></table><div class="foot">Hotel360 v169 — تقرير تشغيل داخلي</div></body></html>`;
}
window.v169PrintArrivals=function(){
  const w=window.open('','hotel360-v169-print','width=1200,height=800');
  if(!w)return alert('المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.');
  w.document.open();w.document.write(printHtml());w.document.close();
  w.addEventListener('load',()=>setTimeout(()=>{w.focus();w.print();},250),{once:true});
};
function injectPrintButton(){
  if(state.page!=='reception'||state.receptionTab!=='arrivals167')return;
  const bar=document.querySelector('.v167-filterbar');if(!bar||document.getElementById('v169PrintArrivalsBtn'))return;
  const btn=document.createElement('button');btn.type='button';btn.id='v169PrintArrivalsBtn';btn.className='v167-btn v169-print-btn';btn.textContent='🖨️ طباعة دخول اليوم';btn.onclick=window.v169PrintArrivals;bar.appendChild(btn);
  const hint=document.createElement('span');hint.className='v169-print-hint';hint.textContent='للطباعة استخدم هذا الزر بدل طباعة المتصفح';bar.appendChild(hint);
}
function refresh(){try{applyPaymentColors();injectPrintButton();}catch(e){console.warn('v169 refresh',e)}}
let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(refresh,30)}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__v169wrapped){const wrapped=function(){const out=oldRender.apply(this,arguments);schedule();return out};wrapped.__v169wrapped=true;window.render=wrapped;}
try{new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='p'&&state.page==='reception'&&state.receptionTab==='arrivals167'){e.preventDefault();window.v169PrintArrivals();}});
V().version=VERSION;schedule();
})();
