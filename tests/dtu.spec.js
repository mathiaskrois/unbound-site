const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-10-08T12:00:00Z')});});
test('overview exposes current week, next obligation, all routes and accessible navigation',async({page,request})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/dtu/12106/');
 await expect(page.locator('[data-semester]')).toHaveText('Week 06 of 13');await expect(page.locator('[data-next-title]')).toHaveText('Task 2 · Quantification');
 await expect(page.locator('[data-calendar]')).toContainText('Calendar week 41');await expect(page.locator('[data-week-panel="6"]')).toBeVisible();
 await expect(page.locator('[data-week-panel="5"]')).toBeHidden();await page.locator('#week-select').selectOption('9');await expect(page.locator('[data-week-panel="9"]')).toBeVisible();
 await expect(page.locator('[data-past-count]')).toContainText('3 past deadlines');
 const paths=['/dtu/','/dtu/12106/','/dtu/12106/deadlines/','/dtu/12106/materials/',...Array.from({length:13},(_,i)=>`/dtu/12106/weeks/${i+1}/`)];
 for(const path of paths){const res=await request.get(path);expect(res.status(),path).toBe(200);const html=await res.text();expect(html).toContain('<h1>');const internal=[...html.matchAll(/(?:href|src)="(\/dtu\/[^"#]*)(?:#[^"]*)?"/g)].map(m=>m[1]);for(const url of new Set(internal)){expect((await request.get(url)).status(),url).toBe(200);}}
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('mandatory checklist persists and updates next deadline without inventing submission status',async({page})=>{
 await page.goto('/dtu/12106/deadlines/');await expect(page.locator('#peer1 [data-status]')).toHaveText('Deadline passed');
 await page.locator('#task2 [data-complete]').check();await expect(page.locator('[data-completed-count]')).toHaveText('1 of 7 complete');await page.reload();await expect(page.locator('#task2 [data-complete]')).toBeChecked();
 await page.goto('/dtu/12106/');await expect(page.locator('[data-next-title]')).toHaveText('Task 2 · Give peer feedback');
 await page.goto('/dtu/12106/deadlines/');await page.locator('#task3 summary').click();await expect(page.locator('#task3')).toContainText('Attach both Task 1 and Task 2');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});
test('library filters by case, type and search and can recover from no results',async({page})=>{
 await page.goto('/dtu/12106/materials/');await expect(page.locator('[data-resource]')).toHaveCount(362);
 await page.locator('#resource-group').selectOption('Microfabrication');expect(await page.locator('[data-resource]:visible').count()).toBeGreaterThan(0);
 await page.locator('#resource-search').fill('case study description');await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await page.locator('#resource-search').fill('no-such-resource-xyz');await expect(page.locator('[data-empty]')).toBeVisible();await page.getByRole('button',{name:'Clear filters'}).click();await expect(page.locator('[data-resource]:visible')).toHaveCount(362);
 await page.locator('#resource-type').selectOption('Spreadsheet');expect(await page.locator('[data-resource]:visible').count()).toBeGreaterThan(0);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});
test('weekly pages provide essential analysis, practice, mandatory tasks and source links',async({page})=>{
 await page.goto('/dtu/12106/weeks/6/');await expect(page.getByRole('heading',{name:'What matters this week'})).toBeVisible();await expect(page.locator('.analysis-list article')).toHaveCount(4);await expect(page.locator('#practice')).toContainText('baseline and alternative scenario');await expect(page.locator('#peer1')).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.goto('/dtu/12106/weeks/9/');await expect(page.locator('main')).toContainText('three progress slides');await page.goto('/dtu/12106/weeks/13/');await expect(page.locator('main')).toContainText('Teaching ends before the final submission');
});
test('tracker changes at Copenhagen midnight and shows autumn break without incrementing teaching week',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-11T21:59:59Z'));await page.goto('/dtu/12106/');await expect(page.locator('[data-semester]')).toHaveText('Week 06 of 13');
 await page.clock.setFixedTime(new Date('2026-10-11T22:00:01Z'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('[data-semester]')).toHaveText('Autumn break');await expect(page.locator('[data-current-week]')).toHaveAttribute('href','/dtu/12106/weeks/7/');
 await page.clock.setFixedTime(new Date('2026-10-18T22:00:01Z'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.locator('[data-semester]')).toHaveText('Week 07 of 13');
});
test('content remains readable without JavaScript or usable storage',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:8080/dtu/12106/deadlines/');await expect(page.locator('#task3')).toContainText('13 December');await page.locator('#task2 summary').click();await expect(page.locator('#task2')).toContainText('Attach Task 1 as an annex');await context.close();
 const ctx=await browser.newContext();const p=await ctx.newPage();await p.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled');}}));await p.goto('http://127.0.0.1:8080/dtu/12106/deadlines/');await p.locator('#task1 [data-complete]').check();await expect(p.locator('#task1 [data-status]')).toHaveText('Marked complete');await ctx.close();
});
