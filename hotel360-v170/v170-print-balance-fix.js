/* Hotel360 v170 — reliable reservations printing + global balance colors */
(function(){
'use strict';
const VERSION=170;
function S(){return state.v166||{};}
function n(v){const x=Number(v||0);return Number.isFinite(x)?x:0;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v){return n(v).toLocaleString('ar-SA',{minimumFractionDigits:2,maximumFractionDigits:2})+' ر.س';}
function guestBy(id){return (S().guestProfiles||[]).find(g=>g.id===id)||null;}
function companyBy(id){return (S().companies||[]).find(x=>x.id===id)||null;}
function groupBy(id){return (S().groups||[]).find(x=>x.id===id)||null;}
function guestName(r){return guestBy(r?.guestProfileId)?.fullName||r?.guestName||'نزيل';}
function unitTotal(u){return (u?.dailyRates||[]).reduce((s,d)=>s+n(d.amount)+n(d.tax)-n(d.discount),0);}
function total(r){const t=n(r?.finalTotal);return t>0?t:(r?.units||[]).reduce((s,u)=>s+unitTotal(u),0);}
function paid(r){const ps=r?.payments||[];let s=0;for(const p of ps){if(p.status==='void')continue;if(p.status==='refunded')s-=n(p.amount);else s+=n(p.amount);}return Math.max(0,s);}
function balance(r){return Math.max(0,total(r)-paid(r));}
function hotelName(id){return (state.hotels||[]).find(h=>String(h.id)===String(id))?.name||String(id||'-');}
function typeLabel(r){if(r?.bookingType==='company'||r?.companyId)return 'شركة'+(companyBy(r.companyId)?.name?' — '+companyBy(r.companyId).name:'');if(r?.bookingType==='group'||r?.groupId)return 'قروب / مجموعة'+(groupBy(r.groupId)?.name?' — '+groupBy(r.groupId).name:'');return 'فردي';}
function roomsLabel(r){const rooms=(r.units||[]).map(u=>u.assignment?.roomNo).filter(Boolean);return rooms.length?rooms.join('، '):String((r.units||[]).length||1)+' غير مخصصة';}
function statusLabel(r){const m={confirmed:'مؤكد',due_in:'جاهز للوصول',checked_in:'تم التسكين',checked_out:'غادر',cancelled:'ملغي',no_show:'No-show',waitlist:'قائمة انتظار',tentative:'مبدئي'};return m[r?.status]||r?.status||'-';}
function normalizeNumber(txt){return String(txt||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬,]/g,'').replace(/٫/g,'.').replace(/[^0-9.\-]/g,'');}
function colorBalances(){
  if(state.page!=='reservationsCenter'&&state.page!=='reception')return;
  const labels=[...document.querySelectorAll('small,label,span,div')].filter(el=>el.children.length===0&&el.textContent.trim()==='المتبقي');
  for(const lab of labels){
    const box=lab.parentElement;if(!box)continue;
    let val=box.querySelector('b,strong,.value,.v166-value,.v167-value');
    if(!val){const kids=[...box.children].filter(x=>x!==lab);val=kids.find(x=>/ر\.?س|ريال|[0-9٠-٩]/.test(x.textContent||''));}
    if(!val)continue;
    const raw=val.textContent.trim();
    if(/مدفوع بالكامل/.test(raw)){val.classList.add('v170-paid');val.classList.remove('v170-due');continue;}
    const num=Number(normalizeNumber(raw));if(!Number.isFinite(num))continue;
    if(num<=0.009){val.textContent='✓ مدفوع بالكامل';val.classList.add('v170-paid');val.classList.remove('v170-due');}
    else{val.classList.add('v170-due');val.classList.remove('v170-paid');}
  }
}
function reservationsForPrint(){
  const all=(S().reservations||[]).slice();
  /* Prefer confirmations currently rendered in the All Reservations view, so active filters are respected. */
  const visible=new Set();
  const text=document.querySelector('.v166-res')?.innerText||'';
  for(const r of all){if(r.confirmationNo&&text.includes(String(r.confirmationNo)))visible.add(r.id);}
  const filtered=visible.size?all.filter(r=>visible.has(r.id)):all;
  return filtered.sort((a,b)=>String(a.arrival||'').localeCompare(String(b.arrival||''))||String(a.confirmationNo||'').localeCompare(String(b.confirmationNo||'')));
}
function reservationsPrintHtml(){
  const rows=reservationsForPrint();
  const sumT=rows.reduce((s,r)=>s+total(r),0),sumP=rows.reduce((s,r)=>s+paid(r),0),sumB=Math.max(0,sumT-sumP);
  const body=rows.map((r,i)=>{const b=balance(r);return `<tr><td>${i+1}</td><td class="mono">${esc(r.confirmationNo||'-')}</td><td>${esc(guestName(r))}</td><td>${esc(hotelName(r.hotelId))}</td><td>${esc(r.arrival||'-')}</td><td>${esc(r.departure||'-')}</td><td>${esc(typeLabel(r))}</td><td>${esc(roomsLabel(r))}</td><td>${esc(money(total(r)))}</td><td class="green">${esc(money(paid(r)))}</td><td class="${b>0.009?'due':'paid'}">${b>0.009?esc(money(b)):'✓ مدفوع بالكامل'}</td><td>${esc(statusLabel(r))}</td></tr>`}).join('');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Hotel360 - تقرير الحجوزات</title><style>@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}html,body{margin:0;background:#fff;color:#18251f;font-family:Tahoma,Arial,sans-serif}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #173d32;padding-bottom:9px;margin-bottom:10px}.head h1{font-size:21px;margin:0 0 4px}.muted{font-size:11px;color:#6c7973}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:9px 0 12px}.k{border:1px solid #d7dfdb;border-radius:9px;padding:7px}.k small{display:block;color:#6c7973}.k b{font-size:15px}.red,.due{color:#b42318}.green,.paid{color:#117a48}.due,.paid{font-weight:900}table{width:100%;border-collapse:collapse;font-size:9.6px}th,td{border:1px solid #cfd8d3;padding:5px 4px;vertical-align:top}th{background:#eef5f1;font-weight:800;white-space:nowrap}.mono{font-family:Consolas,monospace;direction:ltr}.due{background:#fff2f2}.paid{background:#edf9f1}.foot{margin-top:8px;font-size:9px;color:#7a8781}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}tr{break-inside:avoid}}</style></head><body><div class="head"><div><h1>Hotel360 — تقرير الحجوزات</h1><div class="muted">الحجوزات الظاهرة حاليًا في شاشة «كل الحجوزات»</div></div><div class="muted">${esc(new Date().toLocaleString('ar-SA'))}</div></div><div class="kpis"><div class="k"><small>عدد الحجوزات</small><b>${rows.length}</b></div><div class="k"><small>الإجمالي</small><b>${esc(money(sumT))}</b></div><div class="k"><small>المدفوع</small><b class="green">${esc(money(sumP))}</b></div><div class="k"><small>المتبقي</small><b class="${sumB>0.009?'red':'green'}">${sumB>0.009?esc(money(sumB)):'✓ مدفوع بالكامل'}</b></div></div><table><thead><tr><th>#</th><th>رقم الحجز</th><th>النزيل</th><th>الفندق</th><th>الدخول</th><th>الخروج</th><th>النوع</th><th>الغرف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>${body||'<tr><td colspan="12" style="text-align:center;padding:25px">لا توجد حجوزات للطباعة.</td></tr>'}</tbody></table><div class="foot">Hotel360 v170 — تقرير تشغيل داخلي</div></body></html>`;
}
function printIsolated(html){
  const old=document.getElementById('v170PrintFrame');if(old)old.remove();
  const f=document.createElement('iframe');f.id='v170PrintFrame';f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;left:-10000px;top:0;width:1200px;height:800px;border:0;opacity:0;pointer-events:none;';document.body.appendChild(f);
  const d=f.contentWindow.document;d.open();d.write(html);d.close();
  let done=false;const go=()=>{if(done)return;done=true;setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(e){console.error(e);alert('تعذر فتح الطباعة.');}setTimeout(()=>{try{f.remove()}catch(e){}},2500);},250);};
  f.onload=go;setTimeout(go,650);
}
window.v170PrintReservations=function(){printIsolated(reservationsPrintHtml());};
function isReservationsPrintButton(btn){if(!btn||state.page!=='reservationsCenter')return false;const t=(btn.textContent||'').replace(/\s+/g,' ').trim();return t==='طباعة'||t==='🖨️ طباعة'||/^(🖨️\s*)?طباعة$/.test(t);}
document.addEventListener('click',function(e){const btn=e.target.closest?.('button');if(!isReservationsPrintButton(btn))return;e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();window.v170PrintReservations();},true);
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='p'&&state.page==='reservationsCenter'){e.preventDefault();window.v170PrintReservations();}},true);
let timer=0;function refresh(){clearTimeout(timer);timer=setTimeout(colorBalances,25);}try{new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch(e){}refresh();
window.__hotel360V170Loaded=true;
})();
