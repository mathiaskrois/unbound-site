import test from 'node:test';
import assert from 'node:assert/strict';
import {civilDate,semesterState,obligationState,nextObligation,calendarWeek} from '../dtu/assets/course-state.mjs';
import {course,weeks,obligations} from '../dtu-source/course.mjs';
const state=day=>semesterState(day,weeks,course.breakStart,course.breakEnd);
test('13 complete Monday-to-Sunday weeks, with exactly one autumn break',()=>{
 assert.equal(weeks.length,13);assert.equal(state('2026-08-30').kind,'before');assert.equal(state('2026-08-31').week.number,1);
 assert.equal(state('2026-10-08').week.number,6);assert.equal(state('2026-10-11').week.number,6);
 assert.equal(state('2026-10-12').kind,'break');assert.equal(state('2026-10-18').kind,'break');
 assert.equal(state('2026-10-19').week.number,7);assert.equal(state('2026-12-06').week.number,13);assert.equal(state('2026-12-07').kind,'after');
 for(const w of weeks){assert.equal(new Date(w.start+'T12:00Z').getUTCDay(),1);assert.equal(new Date(w.end+'T12:00Z').getUTCDay(),0);assert.ok(w.takeaways.length>=3);assert.ok(w.practice.result);}
});
test('Copenhagen dates change at the proper midnight in summer and winter',()=>{
 assert.equal(civilDate(new Date('2026-10-11T21:59:59Z')),'2026-10-11');assert.equal(civilDate(new Date('2026-10-11T22:00:00Z')),'2026-10-12');
 assert.equal(civilDate(new Date('2026-11-01T22:59:59Z')),'2026-11-01');assert.equal(civilDate(new Date('2026-11-01T23:00:00Z')),'2026-11-02');
 assert.equal(civilDate(new Date('2026-10-25T00:30Z')),'2026-10-25');assert.equal(civilDate(new Date('2026-10-25T01:30Z')),'2026-10-25');
});
test('calendar week and semester week remain distinct around the break',()=>{
 assert.equal(calendarWeek('2026-10-08'),41);assert.equal(calendarWeek('2026-10-12'),42);assert.equal(calendarWeek('2026-10-19'),43);
});
test('authoritative deadlines include both feedback rounds and post-teaching dates',()=>{
 assert.deepEqual(obligations.map(o=>o.due?.slice(0,10)||o.dateOnly),['2026-09-11','2026-09-30','2026-10-07','2026-11-18','2026-11-25','2026-12-13','2026-12-19']);
 assert.equal(Date.parse(obligations[2].due),Date.parse('2026-10-07T21:59Z'));assert.equal(Date.parse(obligations[3].due),Date.parse('2026-11-18T22:59Z'));
});
test('a passed date is not evidence of completion',()=>{
 const task=obligations[3];assert.equal(obligationState(task,new Date('2026-11-18T22:58:59Z')),'soon');assert.equal(obligationState(task,new Date('2026-11-18T22:59:01Z')),'passed');assert.equal(obligationState(task,new Date('2026-11-19T12:00Z'),true),'complete');
});
test('date-only exam never invents a deadline time',()=>{
 const exam=obligations.at(-1);assert.equal(obligationState(exam,new Date('2026-12-18T23:30Z')),'today');assert.equal(obligationState(exam,new Date('2026-12-19T22:59Z')),'today');assert.equal(obligationState(exam,new Date('2026-12-19T23:01Z')),'passed');
});
test('next obligation skips completed work but keeps deadlines after teaching',()=>{
 const now=new Date('2026-10-08T12:00Z');assert.equal(nextObligation(obligations,now).id,'task2');assert.equal(nextObligation(obligations,now,{task2:true}).id,'peer2');
 assert.equal(nextObligation(obligations,new Date('2026-12-07T12:00Z')).id,'task3');assert.equal(nextObligation(obligations,new Date('2026-12-20T12:00Z')),null);
});
