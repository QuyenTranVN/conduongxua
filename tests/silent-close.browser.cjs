const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
;(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true})
 const page = await browser.newPage(process.env.TEST_MOBILE ? {viewport:{width:390,height:844},isMobile:true,hasTouch:true} : {})
 const errors=[]; page.on('pageerror', e=>errors.push(e.message))
 try {
  await page.addInitScript(()=>{
   window.sources=[]; window.ramps=[]
   const original=AudioContext.prototype.createBufferSource
   AudioContext.prototype.createBufferSource=function(...args){
    const source=original.apply(this,args), record={active:false}; window.sources.push(record)
    const start=source.start.bind(source), stop=source.stop.bind(source)
    source.start=(...a)=>{record.active=true;return start(...a)}
    source.stop=(...a)=>{record.active=false;return stop(...a)}
    return source
   }
   const ramp=AudioParam.prototype.linearRampToValueAtTime
   AudioParam.prototype.linearRampToValueAtTime=function(value,...args){window.ramps.push(value);return ramp.call(this,value,...args)}
  })
  await page.route('**/v1/meditation/sessions*', r=>r.fulfill({json:{data:[]}}))
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:5174')
  const nav=name=>page.getByRole('navigation', {name:'Điều hướng chính'}).getByRole('button',{name,exact:true}).click()
  const close=()=>page.locator('.meditation-player .player-top button').click()
  const record=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('con-duong-xua:practice-history')).find(x=>x.sessionId.startsWith('custom-silent:')))
  const active=()=>page.evaluate(()=>window.sources.filter(s=>s.active).length)
  await nav('Thiền')
  await page.getByRole('button',{name:'8 phút',exact:true}).click()
  await page.locator('.quick-guidance__option').nth(1).click()
  await page.locator('.ambient-options button').nth(1).click()
  await page.locator('.ambient-volume input').fill('63')
  await page.locator('.quick-practice-sheet__actions .btn-primary').click()
  await page.waitForFunction(()=>window.sources.some(s=>s.active))
  await page.waitForTimeout(1300)
  await close()
  let saved=await record()
  assert.equal(saved.guidanceType,'silent'); assert.equal(saved.durationSeconds,480)
  assert.equal(saved.selectedDurationSeconds,480); assert.equal(saved.paused,true);assert.equal(saved.completed,false)
  assert.ok(saved.progressSeconds>=1); assert.deepEqual(saved.ambience,{backgroundSound:'rain',backgroundVolume:.63})
  assert.equal(await active(),0)
  await page.locator('.continue-practice__main').click()
  assert.equal(await page.locator('.transport .primary').getAttribute('aria-pressed'),'false')
  const time=await page.locator('[role=timer]').innerText()
  await page.waitForTimeout(1100);assert.equal(await page.locator('[role=timer]').innerText(),time)
  await close();assert.equal((await record()).progressSeconds,saved.progressSeconds)
  await page.reload();await nav('Thiền');await page.locator('.continue-practice__main').click()
  assert.equal(await page.locator('[role=timer]').innerText(),time)
  assert.equal(await active(),0)
  assert.equal(await page.locator('.transport .primary').getAttribute('aria-pressed'),'false')
  await page.locator('.transport .primary').click()
  await page.waitForFunction(()=>window.sources.some(s=>s.active))
  assert.ok(await page.evaluate(()=>window.ramps.includes(.63)))
  await page.waitForTimeout(1100);await close()
  assert.ok((await record()).progressSeconds>saved.progressSeconds+1)
  assert.equal(await active(),0)
  console.log('PASS: silent Close saves duration/elapsed/rain/volume, freezes timer and ambience, restores paused after refresh, resumes accurately')
  await nav('Nghe');await page.locator('.audio-row__play').first().click()
  await page.waitForFunction(()=>[...document.querySelectorAll('audio')].some(a=>!a.paused))
  await nav('Thiền');await page.locator('.continue-practice__main').click();await close()
  assert.equal(await page.locator('audio').evaluateAll(els=>els.filter(e=>!e.paused).length),1)
  await page.locator('.continue-practice__toggle').click()
  await page.waitForFunction(()=>window.sources.some(s=>s.active))
  assert.ok(await page.locator('audio').evaluateAll(els=>els.every(e=>e.paused)))
  await page.locator('.continue-practice__main').click();await close()
  assert.equal(await active(),0)
  console.log('PASS: paused silent continuation leaves Nghe independent; explicit Continue play hands ownership back')
  assert.deepEqual(errors,[])
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
