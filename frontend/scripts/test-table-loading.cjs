const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../src/scenes/Preload.js'), 'utf8');
const code = source.slice(source.indexOf('export default class Preload')).replace('export default ', '');
function setup(theme = 'riverboat-lounge-scene') {
    const timers = [], callbacks = {}, loaded = new Set(), requests = [];
    let started = false, retryClick;
    class Scene {
        constructor() {
            this.load = { on: (event, callback) => { callbacks[event] = callback; }, image: (key, url) => requests.push({ key, url }), start() {} };
            this.scene = { start: () => { started = true; } };
            this.events = { once() {} };
            this.cameras = { main: { fadeOut() {} } };
            this.textures = { exists: key => loaded.has(key) };
            const text = { setOrigin() { return this; }, setDepth() { return this; }, setInteractive() { return this; }, on(event, handler) { retryClick = handler; }, destroy() {} };
            this.add = { text: () => text };
        }
    }
    const context = { Phaser: { Scene, Scenes: { Events: { SHUTDOWN: 'shutdown' } }, Loader: { Events: { LOAD_ERROR: 'error', COMPLETE: 'complete', FILE_COMPLETE: 'filecomplete' } } }, config: { centerX: 300, centerY: 500 }, portrait_table_png: '/classic.png', setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; }, clearTimeout() {}, console };
    vm.createContext(context);
    vm.runInContext(code + '; globalThis.Preload = Preload;', context);
    const preload = new context.Preload();
    preload.editorCreate = () => {};
    preload.editorPreload = () => { preload.bRequestedTheme = Boolean(theme); };
    preload.init({ sTableTheme: theme });
    preload.preload();
    return { loaded, requests, callbacks, timers, retry: () => retryClick(), started: () => started,
        finish: () => timers.filter(timer => timer.delay === 400).forEach(timer => timer.fn()) };
}
const failed = setup();
failed.callbacks.complete();
failed.finish();
assert.equal(failed.started(), false, 'COMPLETE must not start with missing textures');
assert.equal(failed.requests.length, 3);
assert.ok(failed.requests.some(r => r.key === 'equipped_table' && r.url.startsWith('/images/shop/riverboat-lounge-table.png?retry=')));
failed.callbacks.complete();
failed.finish();
assert.equal(failed.started(), false, 'Failed PNG must not silently switch to classic or missing texture');
failed.retry();
assert.equal(failed.requests.length, 6, 'Visible retry must request missing artwork again');
['table', 'private_table', 'equipped_table'].forEach(key => failed.loaded.add(key));
failed.callbacks.complete();
failed.finish();
assert.equal(failed.started(), true);
const slow = setup();
slow.timers.find(timer => timer.delay === 12000).fn();
slow.finish();
assert.equal(slow.started(), false);
['table', 'private_table', 'equipped_table'].forEach(key => slow.loaded.add(key));
slow.callbacks.filecomplete(); slow.finish();
assert.equal(slow.started(), true);
const classic = setup('');
classic.loaded.add('table'); classic.loaded.add('private_table');
classic.callbacks.complete(); classic.finish();
assert.equal(classic.started(), true);
assert.equal(classic.requests.length, 0);
console.log('PASS: missing textures block startup, PNG preserves equipped theme, retry recovers, slow downloads wait, classic loads normally.');
