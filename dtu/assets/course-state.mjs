// Calendar arithmetic uses ISO civil dates, not the visitor's local timezone.
export function civilDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value = key => parts.find(p=>p.type===key).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function semesterState(day, weeks, breakStart, breakEnd) {
  if (day < weeks[0].start) return {kind:'before'};
  if (day >= breakStart && day <= breakEnd) return {kind:'break'};
  const week = weeks.find(w=>day >= w.start && day <= w.end);
  return week ? {kind:'week',week} : {kind:'after'};
}
export function obligationState(item, now, completed = false) {
  if (completed) return 'complete';
  if (item.dateOnly) {
    const today = civilDate(now);
    return today > item.dateOnly ? 'passed' : today === item.dateOnly ? 'today' : 'upcoming';
  }
  const ms = Date.parse(item.due) - now.getTime();
  return ms < 0 ? 'passed' : ms <= 7 * 86400000 ? 'soon' : 'upcoming';
}
export function nextObligation(items, now, completed = {}) {
  return items.find(item=>!completed[item.id] && !['passed','complete'].includes(obligationState(item,now))) || null;
}
export function calendarWeek(day) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  return Math.ceil((((d-new Date(Date.UTC(d.getUTCFullYear(),0,1)))/86400000)+1)/7);
}
