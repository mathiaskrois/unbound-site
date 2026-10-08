import './practice.mjs';
import {civilDate,semesterState,obligationState,nextObligation,calendarWeek} from './course-state.mjs';
const all = selector => [...document.querySelectorAll(selector)];
const set = (selector,text) => all(selector).forEach(el=>el.textContent=text);
const storageKey='krois.dtu.12106.fall2026.completed';
let completed={};
try {const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))completed=saved;}catch {}
const dateFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Copenhagen',day:'numeric',month:'long',year:'numeric'});
let data,selectedWeek=null,weeklyNavPositioned=false;
function showWeek(number) {
  all('[data-week-panel]').forEach(panel=>panel.hidden=Number(panel.dataset.weekPanel)!==number);
  all('[data-select-week]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.selectWeek)===number)));
  const select=document.querySelector('#week-select');if(select)select.value=String(number);
}
function refresh() {
  const now=new Date(),day=civilDate(now);
  set('[data-date]',dateFormat.format(now)+' · Copenhagen');
  if(!data)return;
  const {course,weeks,obligations}=data;
  const state=semesterState(day,weeks,course.breakStart,course.breakEnd);
  const week=state.kind==='week'?state.week:null;
  const label=week?`Week ${String(week.number).padStart(2,'0')} of 13`:state.kind==='break'?'Autumn break':state.kind==='before'?'Semester ahead':'Teaching complete';
  set('[data-semester]',label);
  set('[data-week-dates]',week?`${dateFormat.format(new Date(week.start+'T12:00:00+01:00'))} – ${dateFormat.format(new Date(week.end+'T12:00:00+01:00'))}`:state.kind==='break'?'12–18 October · No teaching week':state.kind==='before'?'Week 1 starts 31 August 2026':'Week 13 ended 6 December 2026');
  set('[data-calendar]',`Calendar week ${calendarWeek(day)} · ${state.kind==='break'?'Week 7 starts 19 October':week?.number===6?'Autumn break next week':week?.number===7?'Back after the autumn break':state.kind==='after'?'Submission and exam dates remain below':'13 teaching weeks, with a break in week 42'}`);
  const currentLink=document.querySelector('[data-current-week]');
  if(currentLink){const target=week?.number||(state.kind==='before'?1:state.kind==='break'?7:13);currentLink.href=`/dtu/12106/weeks/${target}/`;currentLink.textContent=state.kind==='break'?'Preview week 7 →':state.kind==='after'?'Review week 13 →':'Open the weekly plan →';}
  all('[data-track]').forEach(el=>{const w=weeks.find(w=>w.number===Number(el.dataset.track));el.classList.toggle('elapsed',day>w.end);el.classList.toggle('current',week?.number===w.number);});
  if(!weeklyNavPositioned&&matchMedia('(max-width:760px)').matches){const nav=document.querySelector('.rail-weeks nav');const active=nav?.querySelector('[aria-current="page"]')||nav?.querySelector(`[data-week-nav="${week?.number}"]`);if(nav&&active){nav.scrollLeft+=active.getBoundingClientRect().left-nav.getBoundingClientRect().left-nav.clientWidth/2+active.offsetWidth/2;weeklyNavPositioned=true;}}
  all('[data-week-nav]').forEach(el=>el.classList.toggle('is-current-week',Number(el.dataset.weekNav)===week?.number));
  all('[data-current-marker]').forEach(el=>{el.classList.toggle('is-now',Number(el.dataset.currentMarker)===week?.number);el.parentElement.classList.toggle('is-now',Number(el.dataset.currentMarker)===week?.number);});
  all('[data-tile]').forEach(el=>el.classList.toggle('is-current',Number(el.dataset.tile)===week?.number));
  if(selectedWeek===null)showWeek(week?.number||(state.kind==='break'?7:state.kind==='before'?1:13));
  for(const item of obligations){
    const status=obligationState(item,now,completed[item.id]===true);
    const text={passed:'Deadline passed',complete:'Marked complete',soon:'Due within 7 days',today:'Exam today · check time',upcoming:'Upcoming'}[status];
    all(`[data-obligation="${item.id}"]`).forEach(card=>{
      card.classList.toggle('is-complete',status==='complete');
      const badge=card.querySelector('[data-status]');badge.textContent=text;badge.className='status '+status;
    });
    all(`[data-complete="${item.id}"]`).forEach(input=>input.checked=completed[item.id]===true);
  }
  const count=obligations.filter(o=>completed[o.id]===true).length;
  set('[data-completed-count]',`${count} of ${obligations.length} complete`);
  const passed=obligations.filter(o=>obligationState(o,now,completed[o.id]===true)==='passed').length;
  set('[data-past-count]',passed?`${passed} past deadline${passed===1?'':'s'} not marked complete. Check your actual submission status in Learn.`:'Completion reflects your checkboxes, not DTU submission records.');
  set('[data-deadline-summary]',`${count} of ${obligations.length} marked complete${passed?` · ${passed} past dates to check`:''}. All timed deadlines use Copenhagen time.`);
  const next=nextObligation(obligations,now,completed);
  const link=document.querySelector('[data-next-link]');
  if(next){
    set('[data-next-title]',next.title);set('[data-next-description]',`${next.audience} · ${next.description}`);
    set('[data-next-date]',`${next.date} · ${next.time}`);
    const days=next.dateOnly?Math.round((Date.parse(next.dateOnly+'T12:00:00Z')-Date.parse(day+'T12:00:00Z'))/86400000):Math.ceil((Date.parse(next.due)-now.getTime())/86400000);
    set('[data-countdown]',next.dateOnly&&day===next.dateOnly?'Today · time unconfirmed':days===0?'Due today':days===1?'Within 1 day':`In ${days} days`);
    if(link){link.href=`/dtu/12106/deadlines/#${next.id}`;link.textContent='View requirements →';}
  }else{
    set('[data-next-title]',count===obligations.length?'All obligations marked complete':'No future deadline listed');
    set('[data-next-description]',passed?'Review the past dates and confirm your submission status in DTU Learn.':'Keep an eye on official course announcements for any changes.');
    set('[data-next-date]','Fall 2026');set('[data-countdown]','Review your checklist');
    if(link){link.href='/dtu/12106/deadlines/';link.textContent='Review checklist →';}
  }
}
// Run the date label even on the course directory. Resource filtering does not
// depend on loading the date/completion data.
refresh();
const search=document.querySelector('#resource-search'),group=document.querySelector('#resource-group'),kind=document.querySelector('#resource-type');
function filterResources(){
  if(!search)return;const words=search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
  all('[data-resource]').forEach(row=>{const visible=words.every(w=>row.dataset.search.includes(w))&&(!group.value||row.dataset.group===group.value)&&(!kind.value||row.dataset.kind===kind.value);row.hidden=!visible;if(visible)count++;});
  set('[data-resource-count]',`${count} of ${all('[data-resource]').length} materials`);
  const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count!==0;
}
if(search){
  [search,group,kind].forEach(el=>el.addEventListener('input',filterResources));
  document.querySelector('[data-clear-filters]').addEventListener('click',()=>{search.value='';group.value='';kind.value='';filterResources();search.focus();});
}
all('[data-select-week]').forEach(button=>button.addEventListener('click',()=>{selectedWeek=Number(button.dataset.selectWeek);showWeek(selectedWeek);}));
document.querySelector('[data-return-current]')?.addEventListener('click',()=>{selectedWeek=null;refresh();});
document.querySelector('#week-select')?.addEventListener('change',event=>{selectedWeek=Number(event.target.value);showWeek(selectedWeek);});
try{
  const response=await fetch('/dtu/12106/runtime.json');if(!response.ok)throw new Error('Course data unavailable');data=await response.json();
  all('[data-complete]').forEach(input=>{
    input.disabled=false;
    input.addEventListener('change',()=>{
      completed[input.dataset.complete]=input.checked;
      try{localStorage.setItem(storageKey,JSON.stringify(completed));}catch{
        let notice=document.querySelector('[data-storage-notice]');
        if(!notice){notice=document.createElement('p');notice.className='notice';notice.dataset.storageNotice='';notice.setAttribute('role','status');document.querySelector('main').append(notice);}
        notice.textContent='Browser storage is unavailable. Completion will last only while this page is open.';
      }
      refresh();
    });
  });
  refresh();setInterval(refresh,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('storage',event=>{if(event.key!==storageKey)return;try{const value=JSON.parse(event.newValue||'{}');completed=value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{completed={};}refresh();});
}catch{set('[data-semester]','Browse all 13 weeks');set('[data-countdown]','All dates below');set('[data-next-description]','The live tracker could not load. All official dates and weekly plans remain available below.');}
