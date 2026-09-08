// Run against a local Vite server. PLAYWRIGHT_MODULE may point to an existing tool installation.
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5174'

;(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true })
  const page = await browser.newPage(process.env.TEST_MOBILE ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {})
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.addInitScript(() => {
      window.testSources = []
      window.testMediaActions = {}
      const originalAction = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession)
      navigator.mediaSession.setActionHandler = (name, handler) => { window.testMediaActions[name] = handler; originalAction(name, handler) }
      const originalSource = AudioContext.prototype.createBufferSource
      AudioContext.prototype.createBufferSource = function (...args) {
        const source = originalSource.apply(this, args)
        const record = { active: false }
        window.testSources.push(record)
        const start = source.start.bind(source), stop = source.stop.bind(source), disconnect = source.disconnect.bind(source)
        source.start = (...args) => { record.active = true; return start(...args) }
        source.stop = (...args) => { record.active = false; return stop(...args) }
        source.disconnect = (...args) => { record.active = false; return disconnect(...args) }
        return source
      }
    })
    await page.route('**/v1/meditation/sessions*', route => route.fulfill({ json: { data: [{ id: 'guided-basic-8', slug: 'guided-basic-8', methodId: 'vipassana', titleVi: 'Thiền định 8 phút', durationSeconds: 480, guidanceType: 'guided', language: 'vi', audioUrl: '/audio/Meditation/8%20phut%20HUONG-DAN-THIEN-CAN-BAN.mp3' }] } }))
    await page.goto(base)
    await page.evaluate(async () => { window.testOwnership = (await import('/src/services/playbackOwnership.js')).playbackOwnership })
    const nav = name => page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('button', { name, exact: true }).click()
    const owner = mode => page.waitForFunction(mode => window.testOwnership.getSnapshot().mode === mode, mode)
    const media = () => page.locator('audio').evaluateAll(els => els.map(el => ({ id: el.dataset.id, time: el.currentTime, paused: el.paused, src: el.currentSrc })))
    const checkSingle = async () => assert.ok((await media()).filter(el => !el.paused).length <= 1)
    const seek = seconds => page.locator('audio').evaluateAll((els, seconds) => { els.find(el => !el.paused).currentTime = seconds }, seconds)
    const choose = async (silent) => {
      await nav('Thiền')
      await page.getByRole('button', { name: '8 phút', exact: true }).click()
      await page.locator('.quick-guidance__option').nth(silent ? 1 : 0).click()
    }
    const start = () => page.locator('.quick-practice-sheet__actions .btn-primary').click()
    await nav('Nghe')
    await page.locator('.audio-row__play').first().click()
    await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(el => el.currentTime > .2 && !el.paused))
    const firstId = (await media()).find(el => !el.paused).id
    await seek(12.25)
    await choose(false); await start(); await owner('guidedMeditation')
    await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(el => el.dataset.id === 'guided-basic-8' && el.currentTime > .2 && !el.paused))
    await checkSingle()
    assert.ok(await page.evaluate(id => JSON.parse(localStorage.getItem('con-duong-xua:audio-progress'))[id].currentTime >= 12, firstId))
    await seek(18.5)
    await page.getByRole('button', { name: 'Đóng buổi thiền' }).click()
    await nav('Nghe'); await page.locator('.audio-row__play').nth(1).click(); await owner('listening')
    await checkSingle()
    assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('con-duong-xua:practice-history')).find(x => x.sessionId === 'guided-basic-8').progressSeconds >= 18))
    await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(el => !el.paused && el.currentTime > .1))
    const secondId = (await media()).find(el => !el.paused).id
    await seek(34.25)
    await page.locator('.audio-row__play').first().click()
    await page.waitForFunction(id => [...document.querySelectorAll('audio')].some(el => el.dataset.id === id && el.currentTime >= 12 && !el.paused), firstId)
    assert.ok(await page.evaluate(id => JSON.parse(localStorage.getItem('con-duong-xua:audio-progress'))[id].currentTime >= 34, secondId))
    await page.locator('.audio-row__play').evaluateAll(buttons => { buttons[1].click(); buttons[0].click(); buttons[1].click() })
    await page.waitForFunction(id => [...document.querySelectorAll('audio')].some(el => el.dataset.id === id && !el.paused), secondId)
    await checkSingle()
    console.log('PASS: Nghe → guided → Nghe, track A/B progress, rapid switching')

    await nav('Thiền'); await page.locator('.supporting-practice').first().click(); await page.locator('.support-start').click()
    await owner('supportPractice'); await checkSingle()
    assert.ok((await media()).every(el => el.paused))
    await page.waitForTimeout(1200)
    await page.evaluate(() => window.testOwnership.acquire('listening'))
    const supportSaved = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('con-duong-xua:support-practice-progress')))[0].progressSeconds)
    assert.ok(supportSaved >= 1)
    await page.waitForTimeout(1100)
    assert.equal(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('con-duong-xua:support-practice-progress')))[0].progressSeconds), supportSaved)
    await page.locator('.support-player__controls .primary').click(); await owner('supportPractice')
    await page.locator('.support-player .player-top button').click()
    await choose(true)
    await page.locator('.ambient-options button').filter({ hasText: 'Mưa nhẹ' }).click()
    await start(); await owner('silentMeditation')
    await page.waitForFunction(() => window.testSources.some(x => x.active))
    await page.waitForTimeout(1200)
    await page.evaluate(() => window.testOwnership.acquire('listening'))
    assert.equal(await page.evaluate(() => window.testSources.filter(x => x.active).length), 0)
    const silentSaved = await page.evaluate(() => JSON.parse(localStorage.getItem('con-duong-xua:practice-history')).find(x => x.sessionId.startsWith('custom-silent:')))
    assert.ok(silentSaved.progressSeconds >= 1)
    assert.equal(silentSaved.ambience.backgroundSound, 'rain')
    await page.locator('.transport .primary').click(); await owner('silentMeditation')
    await page.waitForFunction(() => window.testSources.some(x => x.active))
    // OS play/pause must target the current mode, not the last Nghe recording.
    await page.evaluate(() => window.testMediaActions.pause())
    await owner('none')
    await page.evaluate(() => window.testMediaActions.play())
    await owner('silentMeditation')
    assert.ok((await media()).every(el => el.paused))
    await page.getByRole('button', { name: 'Kết thúc buổi thiền' }).click()
    await owner('none')
    assert.equal(await page.evaluate(() => window.testSources.filter(x => x.active).length), 0)
    console.log('PASS: support handoff/resume, silent handoff/progress/ambience, media controls')
    // A browser play promise may reject after a different mode has already started.
    await nav('Nghe')
    await page.evaluate(() => {
      const original = HTMLMediaElement.prototype.play
      let first = true
      HTMLMediaElement.prototype.play = function (...args) {
        const actual = original.apply(this, args)
        if (!first) return actual
        first = false
        actual.catch(() => {})
        return new Promise((resolve, reject) => { window.rejectOldPlay = () => reject(new DOMException('superseded', 'AbortError')) })
      }
    })
    await page.locator('.audio-row__play').first().click()
    await choose(false); await start(); await owner('guidedMeditation')
    await page.evaluate(() => window.rejectOldPlay())
    await page.waitForTimeout(200)
    await owner('guidedMeditation'); await checkSingle()
    assert.equal(await page.locator('.audio-error').count(), 0)
    // Finish guided audio, then switch during its delayed closing-bell window.
    await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(el => el.dataset.id === 'guided-basic-8' && el.readyState >= 2 && !el.paused))
    await page.locator('audio').evaluateAll(els => { const el = els.find(el => el.dataset.id === 'guided-basic-8'); el.currentTime = el.duration - .15 })
    await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(el => el.dataset.id === 'guided-basic-8' && el.ended))
    await page.getByRole('button', { name: 'Đóng buổi thiền' }).click()
    await nav('Nghe'); await page.locator('.audio-row__play').first().click(); await owner('listening')
    await page.evaluate(() => {
      window.unexpectedBellCount = 0
      const original = AudioContext.prototype.createOscillator
      AudioContext.prototype.createOscillator = function (...args) { window.unexpectedBellCount++; return original.apply(this, args) }
    })
    await page.waitForTimeout(11000)
    assert.equal(await page.evaluate(() => window.unexpectedBellCount), 0)
    await checkSingle()
    console.log('PASS: late play rejection and delayed closing bells cannot interrupt the next mode')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
