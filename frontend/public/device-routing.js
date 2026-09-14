(function () {
    'use strict';
    var key = '21holdem:site-version';
    var url = new URL(window.location.href);
    var path = url.pathname.replace(/\/+$/, '') || '/';
    var landing = path === '/' || path === '/lobby' || path === '/mobile';
    // Never interrupt live tables, payments, authentication callbacks or other deep links.
    if (!landing || url.searchParams.has('hubToken')) return;
    var requested = url.searchParams.get('view');
    var preference = 'auto';
    try { preference = localStorage.getItem(key) || 'auto'; } catch (error) { /* Storage may be blocked. */ }
    if (['auto', 'mobile', 'desktop'].indexOf(requested) !== -1) {
        preference = requested;
        try { localStorage.setItem(key, preference); } catch (error) { /* The current choice still works. */ }
    }
    var agent = navigator.userAgent || '';
    var touch = navigator.maxTouchPoints || 0;
    var handheld = /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle/i.test(agent)
        || (/Macintosh|MacIntel/i.test(agent + ' ' + navigator.platform) && touch > 1)
        || (touch > 0 && window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024 && !/Windows|CrOS/i.test(agent));
    var mobile = preference === 'mobile' || (preference !== 'desktop' && handheld);
    // An explicit /mobile link is a preview choice, even when visited from a computer.
    if (path === '/mobile' && !requested) return;
    var target = mobile ? '/mobile' : '/lobby';
    if ((path === '/' && !mobile && !requested) || path === target) return;
    url.pathname = target;
    window.location.replace(url.pathname + url.search + url.hash);
}());
