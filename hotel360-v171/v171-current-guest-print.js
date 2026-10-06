/* Hotel360 v171 — Current guest / stay print */
(function(){
'use strict';
const VERSION=171;
function n(v){const x=Number(v||0);return Number.isFinite(x)?x:0;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v){return n(v).toLocaleString('ar-SA',{minimumFractionDigits:2,maximumFractionDigits:2})+' ريال';}
function findCheckin(id){return (state.checkins||[]).find(c=>String(c.id)===String(id))||null;}
function currentHotelName(c){return (state.hotels||[]).find(h=>String(h.id)===String(c?.hotelId))?.name||((typeof currentHotel==='function'&&currentHotel())?.name)||'الفندق';}
function stayStatus(c){if(c?.status==='out')return 'غادر';if(c?.status==='in')return 'نزيل حالي';return c?.status||'-';}
function paymentInfo(c){const total=n(c?.total),paid=Math.max(0,n(c?.paidAmount)),bal=Math.max(0,total-paid);return {total,paid,bal,label:bal<=0.009?'مدفوع بالكامل':paid>0?'دفع جزئي':'غير مدفوع'};}
function fmtDate(v){if(!v)return '-';return String(v).replace('T',' ').slice(0,16);}
function printHtml(c){
 const p=paymentInfo(c), rooms=(c.rooms||[]).join('، ')||'-', hotel=currentHotelName(c);
 const idLine=[c.id,c.contractNo,c.invoiceNo].filter(Boolean).join(' · ');
 return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>بطاقة إقامة - ${esc(c.guestName||'النزيل')}</title><style>
 @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;color:#14241e;background:#fff}.sheet{border:1px solid #cfd9d3;border-radius:14px;padding:14px}.head{display:flex;justify-content:space-between;gap:18px;border-bottom:2px solid #18483a;padding-bottom:10px;margin-bottom:12px}.head h1{margin:0 0 5px;font-size:22px}.sub{font-size:11px;color:#6c7973}.badge{display:inline-block;padding:5px 10px;border-radius:999px;background:#edf7f2;color:#145c43;font-weight:800;font-size:11px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px}.box{border:1px solid #d9e1dc;border-radius:10px;padding:9px;min-height:58px}.box small{display:block;color:#77837d;font-size:10px;margin-bottom:4px}.box b{font-size:13px;line-height:1.55}.moneygrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.money{border:1px solid #d9e1dc;border-radius:10px;padding:9px;text-align:center}.money small{display:block;color:#77837d;font-size:10px}.money b{display:block;font-size:16px;margin-top:4px}.red{color:#b42318}.green{color:#117a48}.notes{border:1px solid #d9e1dc;border-radius:10px;padding:10px;min-height:70px;margin-top:8px;white-space:pre-wrap}.section{font-size:14px;font-weight:900;margin:13px 0 7px;color:#18483a}.sign{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin-top:28px}.sign div{border-top:1px solid #7f8b85;padding-top:7px;text-align:center;font-size:11px;color:#5f6b65}.foot{margin-top:14px;font-size:9px;color:#8a958f;text-align:left}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{border:0;padding:0}}
 </style></head><body><div class="sheet"><div class="head"><div><h1>Hotel360 — بطاقة إقامة النزيل</h1><div class="sub">${esc(hotel)} · ${esc(idLine||'')}</div></div><div><span class="badge">${esc(stayStatus(c))}</span></div></div>
 <div class="section">بيانات النزيل</div><div class="grid">
 <div class="box"><small>اسم النزيل</small><b>${esc(c.guestName||'-')}</b></div><div class="box"><small>الجوال</small><b dir="ltr">${esc(c.mobile||c.phoneLocal||'-')}</b></div>
 <div class="box"><small>الجنسية</small><b>${esc(c.nationality||'-')}</b></div><div class="box"><small>نوع / رقم الهوية</small><b>${esc([c.idType,c.idNo].filter(Boolean).join(' — ')||'-')}</b></div>
 <div class="box"><small>عدد الأشخاص</small><b>${esc(c.guestCount||1)}</b></div><div class="box"><small>VIP</small><b>${esc(c.vipLevel||c.vipNote||'-')}</b></div></div>
 <div class="section">الإقامة والغرف</div><div class="grid">
 <div class="box"><small>الغرف</small><b>${esc(rooms)}</b></div><div class="box"><small>عدد الغرف</small><b>${esc(c.roomCount||(c.rooms||[]).length||1)}</b></div>
 <div class="box"><small>تاريخ / وقت الدخول</small><b>${esc(fmtDate(c.checkInTime))}</b></div><div class="box"><small>المغادرة المتوقعة</small><b>${esc(fmtDate(c.expectedCheckOut))}</b></div>
 <div class="box"><small>عدد الليالي</small><b>${esc(c.nights||'-')}</b></div><div class="box"><small>موظف التسكين</small><b>${esc(c.receptionist||'-')}</b></div></div>
 <div class="section">الدفع</div><div class="moneygrid"><div class="money"><small>الإجمالي</small><b>${esc(money(p.total))}</b></div><div class="money"><small>المدفوع</small><b class="green">${esc(money(p.paid))}</b></div><div class="money"><small>المتبقي / الحالة</small><b class="${p.bal>0.009?'red':'green'}">${p.bal>0.009?esc(money(p.bal)):'✓ مدفوع بالكامل'}</b></div></div>
 <div class="grid"><div class="box"><small>طريقة الدفع</small><b>${esc(c.paymentMethod||'-')}</b></div><div class="box"><small>حالة الدفع</small><b class="${p.bal>0.009?'red':'green'}">${esc(p.label)}</b></div><div class="box"><small>رقم الفاتورة</small><b>${esc(c.invoiceNo||'-')}</b></div><div class="box"><small>رقم العقد</small><b>${esc(c.contractNo||'-')}</b></div></div>
 <div class="section">ملاحظات</div><div class="notes">${esc(c.notes||'لا توجد ملاحظات')}</div>
 <div class="sign"><div>توقيع موظف الاستقبال</div><div>توقيع النزيل</div></div><div class="foot">Hotel360 v171 — تمت الطباعة ${esc(new Date().toLocaleString('ar-SA'))}</div></div></body></html>`;
}
window.v171PrintStay=function(id){
 const c=findCheckin(id);if(!c)return alert('تعذر العثور على بيانات النزيل.');
 const w=window.open('','hotel360-v171-stay-print','width=1000,height=850');
 if(!w)return alert('المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.');
 w.document.open();w.document.write(printHtml(c));w.document.close();
 setTimeout(()=>{try{w.focus();w.print();}catch(e){}},350);
};
function checkinIdFromNode(node){
 let cur=node;for(let i=0;i<9&&cur;i++,cur=cur.parentElement){const txt=cur.textContent||'';const m=txt.match(/CHK-[A-Z0-9-]+/i);if(m&&findCheckin(m[0]))return m[0];const oc=cur.getAttribute?.('onclick')||'';const mo=oc.match(/CHK-[A-Z0-9-]+/i);if(mo&&findCheckin(mo[0]))return mo[0];}return '';
}
function addButtonAfter(ref,id,kind){if(!ref||!id)return;if(ref.parentElement?.querySelector(`[data-v171-print="${CSS.escape(id)}"]`))return;const b=document.createElement('button');b.type='button';b.className=ref.className||'btn';b.dataset.v171Print=id;b.textContent='🖨️ طباعة';b.onclick=()=>window.v171PrintStay(id);b.title=kind==='detail'?'طباعة بطاقة إقامة وبيانات النزيل':'طباعة بيانات هذا النزيل';ref.insertAdjacentElement('afterend',b);}
function inject(){
 if(state.page!=='reception')return;
 [...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='بطاقة إقامة').forEach(b=>{const id=checkinIdFromNode(b);if(id)addButtonAfter(b,id,'row');});
 [...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='إغلاق التفاصيل').forEach(b=>{const id=(state.v74DetailId&&findCheckin(state.v74DetailId))?state.v74DetailId:checkinIdFromNode(b);if(id)addButtonAfter(b,id,'detail');});
}
let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(()=>{try{inject()}catch(e){console.warn('v171 inject',e)}},25)}
try{new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__v171wrapped){const wrapped=function(){const out=oldRender.apply(this,arguments);schedule();return out};wrapped.__v171wrapped=true;window.render=wrapped;}
state.v171=Object.assign({},state.v171,{version:VERSION});schedule();
})();
