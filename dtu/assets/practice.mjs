const prefix='krois.dtu.12106.fall2026.practice.';
const format=(n,d=2)=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:d}).format(n);
function readDraft(week){try{const value=JSON.parse(localStorage.getItem(prefix+week)||'null');return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch{return null;}}
function refreshPracticeMarks(){
 for(const link of document.querySelectorAll('[data-week-nav]')){
  const done=readDraft(link.dataset.weekNav)?.complete===true;
  link.classList.toggle('practice-finished',done);
  let badge=link.querySelector('.practice-done');
  if(done&&!badge){badge=document.createElement('span');badge.className='practice-done';badge.textContent='✓';badge.setAttribute('aria-label','Practice marked complete');badge.title='Practice marked complete on this device';link.append(badge);}
  if(!done)badge?.remove();
 }
}
refreshPracticeMarks();
window.addEventListener('storage',event=>{if(event.key?.startsWith(prefix))refreshPracticeMarks();});
for(const workspace of document.querySelectorAll('[data-exercise-week]')){
 const week=workspace.dataset.exerciseWeek,kind=workspace.dataset.calculator;
 const fields=[...workspace.querySelectorAll('[data-answer]')];
 const completion=workspace.querySelector('[data-practice-complete]');
 const status=workspace.querySelector('[data-exercise-save]');
 const result=workspace.querySelector('[data-exercise-results]');
 const saved=readDraft(week);
 if(saved){for(const field of fields)if(typeof saved.answers?.[field.dataset.answer]==='string')field.value=saved.answers[field.dataset.answer];completion.checked=saved.complete===true;status.textContent='Restored from this browser';}
 function calculate(){
  if(!result)return;
  const v={};let issue='';
  for(const field of fields.filter(f=>f.type==='number')){
   const value=field.valueAsNumber;
   field.removeAttribute('aria-invalid');
   if(field.value.trim()===''||!Number.isFinite(value)||!field.validity.valid){issue=`${workspace.querySelector('label[for="'+field.id+'"]').textContent}: enter a number of at least ${field.min}.`;field.setAttribute('aria-invalid','true');}
   v[field.dataset.answer]=value;
  }
  let rows=[];
  if(!issue){
   if(kind==='carbon'){
    const a=(v.productionA/v.distance+v.fuel*v.fuelFactor)*1000,b=(v.productionB/v.distance+v.electricity*v.grid)*1000;
    rows=[['Gasoline vehicle',a,'g CO₂e / vehicle-km'],['Electric vehicle',b,'g CO₂e / vehicle-km'],['Difference (gasoline − electric)',a-b,'g CO₂e / vehicle-km']];
   }else if(kind==='health'){
    rows=[['Driving: net burden',v.carProduction+v.carUse-v.carBenefit,'fictional points / 1,000 person-km'],['Cycling: net burden',v.bikeProduction+v.bikeUse-v.bikeBenefit,'fictional points / 1,000 person-km']];
   }else if(kind==='lcc'){
    const a=v.purchaseA+v.distance*v.fuel*v.fuelPrice,b=v.purchaseB+v.distance*v.electricity*v.electricityPrice;
    rows=[['Gasoline: lifetime cost',a,'DKK'],['Electric: lifetime cost',b,'DKK'],['Gasoline: cost per km',a/v.distance,'DKK/km'],['Electric: cost per km',b/v.distance,'DKK/km']];
   }else if(kind==='absolute'){
    rows=[['Option A: boundary ratio',v.impactA/v.budget,'× allocated budget'],['Option B: boundary ratio',v.impactB/v.budget,'× allocated budget']];
   }else if(kind==='inventory'){
    if(v.low>v.quantity||v.high<v.quantity)issue='Set the lower estimate ≤ baseline quantity ≤ upper estimate.';
    rows=[['Baseline impact',v.quantity*v.factor,'kg CO₂e'],['Lower-quantity scenario',v.low*v.factor,'kg CO₂e'],['Upper-quantity scenario',v.high*v.factor,'kg CO₂e']];
   }else if(kind==='energy'){
    const total=v.shareA+v.shareB+v.shareC;
    if(Math.abs(total-100)>0.000001)issue=`The shares total ${format(total)}%. Adjust them to total 100% before interpreting results.`;
    const intensity=(v.shareA*v.factorA+v.shareB*v.factorB+v.shareC*v.factorC)/100;
    rows=[['Weighted electricity intensity',intensity,'g CO₂e/kWh'],['Total emissions',intensity*v.demand/1000,'kg CO₂e']];
   }
   if(rows.some(([,n])=>!Number.isFinite(n)))issue='These inputs produce a result outside the supported numeric range. Use smaller values.';
  }
  result.replaceChildren();result.classList.toggle('invalid-results',Boolean(issue));
  if(issue){result.textContent=issue;return;}
  for(const [label,value,unit] of rows){const card=document.createElement('div');card.className='result-cell';const name=document.createElement('span');name.textContent=label;const amount=document.createElement('strong');amount.textContent=format(value);const suffix=document.createElement('small');suffix.textContent=unit;card.append(name,amount,suffix);result.append(card);}
 }
 function save(){
  const draft={version:1,answers:Object.fromEntries(fields.map(f=>[f.dataset.answer,f.value])),complete:completion.checked};
  try{localStorage.setItem(prefix+week,JSON.stringify(draft));if(status.textContent!=='Saved in this browser')status.textContent='Saved in this browser';refreshPracticeMarks();}
  catch{status.textContent='Saving is unavailable. Download your answers before leaving.';}
 }
 workspace.addEventListener('input',event=>{if(event.target.matches('[data-answer]')){calculate();save();}});
 completion.addEventListener('change',save);
 workspace.querySelector('[data-download-answers]').addEventListener('click',()=>{
  const lines=[`DTU 12106 · Fall 2026 · Week ${week}`,document.querySelector('h1').textContent,'Personal practice answers — not a DTU submission','',...fields.flatMap(f=>{const label=workspace.querySelector(`label[for="${f.id}"]`).textContent;const unit=f.type==='number'?f.parentElement.querySelector('span').textContent:'';return [label,f.value+(unit?' '+unit:''),''];}),...(result?['Current calculation results',result.innerText,'']:[]),`Practice marked complete: ${completion.checked?'Yes':'No'}`];
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`12106-week-${week}-practice.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 calculate();
}
