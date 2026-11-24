/* Thiệp mời tốt nghiệp · Quỳnh Hương */
(function () {
  'use strict';

  var CFG = window.INVITE_CONFIG || {};
  // 2 Apps Script riêng: RSVP và Lời nhắn. URL nào để trống thì phần đó chạy chế độ demo.
  var RSVP_URL = String(CFG.rsvpUrl || '').trim();
  var NOTES_URL = String(CFG.notesUrl || '').trim();
  var root = document.documentElement;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Cá nhân hoá: ?to=Tên khách ---------- */
  var params = new URLSearchParams(location.search);
  var guest = (params.get('to') || params.get('ten') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  if (guest) {
    $$('[data-to]').forEach(function (el) { el.textContent = guest; });
    $$('[data-to-input]').forEach(function (el) { if (!el.value) el.value = guest; });
  }

  /* ---------- Ca dự lễ: ?r=<mã ca> (xem config.js) ---------- */
  var SESSIONS = CFG.sessions || {};
  var sessionCode = params.get('r') || '';
  if (!SESSIONS[sessionCode]) sessionCode = CFG.defaultSession;
  var EV = SESSIONS[sessionCode] || { label: '', date: '2026-11-27', start: '15:00', end: '16:00' };

  var dp = EV.date.split('-').map(Number);           // [yyyy, mm, dd]
  var EVENT_START = new Date(EV.date + 'T' + EV.start + ':00+07:00');
  var EVENT_END = new Date(EV.date + 'T' + EV.end + ':00+07:00');
  var PLACE = 'Trường Đại học Bách Khoa – ĐHQG TP.HCM, 268 Lý Thường Kiệt, TP. Hồ Chí Minh';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function to12(t) {
    var h = +t.split(':')[0], m = t.split(':')[1];
    return ((h % 12) || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
  }
  function utcStamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
  }
  var DOW = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  var EV_TEXT = {
    'short': pad(dp[2]) + '.' + pad(dp[1]),
    'postmark': pad(dp[2]) + '·' + pad(dp[1]) + '·' + dp[0],
    'dow': DOW[new Date(Date.UTC(dp[0], dp[1] - 1, dp[2])).getUTCDay()],
    'day': pad(dp[2]),
    'month-year': 'Tháng ' + dp[1] + ' · ' + dp[0],
    'start': EV.start,
    'time': EV.start + ' – ' + EV.end,
    'time12': to12(EV.start) + ' – ' + to12(EV.end)
  };
  $$('[data-ev]').forEach(function (el) {
    var v = EV_TEXT[el.getAttribute('data-ev')];
    if (v) el.textContent = v;
  });

  var cal = $('[data-cal]');
  if (cal) {
    cal.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Lễ tốt nghiệp của Quỳnh Hương 🎓') +
      '&dates=' + utcStamp(EVENT_START) + '/' + utcStamp(EVENT_END) +
      '&details=' + encodeURIComponent('Cùng Hương chung vui ngày tốt nghiệp nhé!') +
      '&location=' + encodeURIComponent(PLACE);
  }

  var cd = $('[data-countdown]');
  if (cd) {
    var now = new Date();
    var vn = new Date(now.getTime() + 7 * 3600e3);
    var days = Math.round((Date.UTC(dp[0], dp[1] - 1, dp[2]) - Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate())) / 864e5);
    var txt;
    if (now > EVENT_END) txt = 'Cảm ơn mọi người đã đến chung vui!';
    else if (days <= 0) txt = 'Hôm nay nè! Hẹn gặp bạn lúc ' + EV.start;
    else if (days === 1) txt = 'Ngày mai là tới rồi!';
    else txt = 'Còn ' + days + ' ngày nữa thôi!';
    cd.textContent = txt;
  }

  /* ---------- Hiện dần khi cuộn ---------- */
  function setupReveal() {
    var items = $$('[data-pop]');
    if (!root.classList.contains('anim') || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    // trễ nhẹ theo thứ tự trong cùng khối
    var groups = new Map();
    items.forEach(function (el) {
      var g = el.closest('section') || document.body;
      var i = groups.get(g) || 0;
      el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
      el.style.setProperty('--pop-rot', (i % 2 ? 1.5 : -1.5) + 'deg');
      groups.set(g, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Phong bì + postcard (GSAP ScrollTrigger) ---------- */
  function setupMotion() {
    if (!root.classList.contains('anim')) return false;
    if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return false; }
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    if (window.ScrollToPlugin) gsap.registerPlugin(window.ScrollToPlugin);
    ST.config({ ignoreMobileResize: true });

    var stage = $('.stage'), scene = $('.scene'), strip = $('.strip');
    var flap = $('.env-flap'), back = $('.env-back'), front = $('.env-front');
    var hero = $('.hero'), kicker = $('.stage-copy'), openBtn = $('.open-btn');
    var h2 = $('.h2'), h3 = $('.h3'), h4 = $('.h4');
    var conf = $('.confetti');

    // confetti
    var palette = ['#FFE07A', '#A9D6FA', '#FFFFFF', '#8EC9F5', '#FFD54D', '#3E63E0'];
    var bits = [];
    for (var i = 0; i < 22; i++) {
      var b = document.createElement('i');
      if (i % 3 === 0) b.className = 'c';
      b.style.background = palette[i % palette.length];
      conf.appendChild(b);
      var a = (i / 22) * Math.PI * 2 + (i % 2 ? .2 : -.15);
      var d = 120 + (i * 37) % 120;
      bits.push({ el: b, x: Math.cos(a) * d * 1.4, y: Math.sin(a) * d - 60, r: (i * 47) % 360 });
    }

    var M = {};
    function measure() {
      var vw = stage.clientWidth, vh = stage.clientHeight;
      var EW = Math.round(Math.min(vw * 0.86, 480, (vh * 0.5) / 0.68));
      var EH = Math.round(EW * 0.68), CW = Math.round(EW * 0.9), CH = Math.round(CW * 0.62);
      var top0 = EH * 0.1;
      var sceneTop = Math.round(vh * 0.55 - EH / 2);
      scene.style.setProperty('--ew', EW + 'px');
      scene.style.setProperty('--eh', EH + 'px');
      scene.style.setProperty('--cw', CW + 'px');
      scene.style.setProperty('--ch', CH + 'px');
      scene.style.top = sceneTop + 'px';
      var C = vh / 2 - sceneTop;
      var sFit = Math.min(1.08, (vh * 0.86) / (4 * CH), (vw * 0.92) / CW);
      M = {
        vh: vh,
        yRise: -CH * 0.95,
        yCenter: C - top0 - CH / 2,
        sCenter: Math.min(1.15, (vw * 0.92) / CW),
        yFit: C - 1.5 * sFit * CH - top0 - CH / 2,
        sFit: sFit,
        sBig: Math.max(vw / CW, vh / CH) * 1.2,
        envDrop: vh - sceneTop + 60
      };
    }
    measure();
    ST.addEventListener('refreshInit', measure);

    gsap.set(h2, { rotationX: -179.5 });
    gsap.set(h3, { rotationX: 179.5 });
    gsap.set(h4, { rotationX: -179.5 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: function () { return '+=' + Math.round(M.vh * 2.8); },
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to([kicker, openBtn], { autoAlpha: 0, y: -16, duration: 0.6 }, 0)
      // mở nắp phong bì
      .to(flap, { rotationX: 180, duration: 1.6, ease: 'power1.inOut' }, 0.2)
      .set(flap, { zIndex: 0 }, 1.05)
      // confetti bung ra
      .fromTo(bits.map(function (b) { return b.el; }),
        { x: 0, y: 0, rotation: 0, scale: 0.3, autoAlpha: 0 },
        {
          x: function (i) { return bits[i].x; }, y: function (i) { return bits[i].y; },
          rotation: function (i) { return bits[i].r; }, scale: 1, autoAlpha: 1,
          duration: 1.6, ease: 'power2.out', stagger: 0.015
        }, 0.9)
      .to(conf, { autoAlpha: 0, duration: 0.8 }, 3.2)
      // postcard trượt ra
      .to(strip, { y: function () { return M.yRise; }, duration: 1.4, ease: 'power1.inOut' }, 1.6)
      // phong bì rơi xuống, postcard ra giữa
      .to([back, front, flap], { y: function () { return M.envDrop; }, duration: 1.4, ease: 'power2.in' }, 3.0)
      .to(strip, { y: function () { return M.yCenter; }, scale: function () { return M.sCenter; }, duration: 1.4, ease: 'power1.inOut' }, 3.0)
      // mở các vếp gấp
      .to(strip, { y: function () { return M.yFit; }, scale: function () { return M.sFit; }, duration: 2.4, ease: 'power1.inOut' }, 4.4)
      .to(h2, { rotationX: 0, duration: 1.4, ease: 'power1.inOut' }, 4.4)
      .to(h3, { rotationX: 0, duration: 1.4, ease: 'power1.inOut' }, 4.9)
      .to(h4, { rotationX: 0, duration: 1.4, ease: 'power1.inOut' }, 5.4)
      // zoom vào tấm postcard → chiếm toàn màn hình
      .to(strip, { y: function () { return M.yCenter; }, scale: function () { return M.sBig; }, duration: 2, ease: 'power2.in' }, 7.3)
      .to(strip, { autoAlpha: 0, duration: 0.6 }, 8.7)
      .fromTo(hero, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power1.out' }, 8.5)
      .fromTo('.hero .name span', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(2)' }, 9.0)
      .to({}, { duration: 0.3 });

    // chạm = tự chạy tới khi mở xong
    function autoOpen() {
      var st = tl.scrollTrigger;
      if (!st) return;
      var y = st.end + 2;
      if (window.ScrollToPlugin) gsap.to(window, { scrollTo: y, duration: 3.8, ease: 'power1.inOut' });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
    openBtn.addEventListener('click', autoOpen);
    scene.addEventListener('click', autoOpen);
    scene.style.cursor = 'pointer';
    scene.style.pointerEvents = 'auto';

    /* ---------- Outro: gấp postcard, lộ lời cảm ơn ---------- */
    var outro = $('.outro'), tailWrap = $('.tail-wrap'), tail = $('.tail');
    var layers = $$('.fold-layer');
    var O = {};
    function measureOutro() {
      var vh = outro.clientHeight, vw = outro.clientWidth;
      var H = tailWrap.offsetHeight;
      var s = vw < 700 ? 0.6 : 0.52;
      O = { vh: vh, s: s, y: 0 };
    }
    measureOutro();
    ST.addEventListener('refreshInit', measureOutro);

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: outro,
        start: 'top top',
        end: function () { return '+=' + Math.round(O.vh * 1.4); },
        pin: true,
        scrub: 0.9,
        invalidateOnRefresh: true
      }
    })
      .to({}, { duration: 0.6 })
      .to(tailWrap, { y: function () { return O.y; }, scale: function () { return O.s; }, rotation: -3, duration: 2, ease: 'power2.inOut' }, 0.6)
      .to(tail, { borderRadius: 28, duration: 0.6 }, 0.6)
      .to(layers[0], { autoAlpha: 1, x: 22, y: 26, rotation: 3, duration: 1.2 }, 1.3)
      .to(layers[1], { autoAlpha: 1, x: 44, y: 50, rotation: 6, duration: 1.2 }, 1.5)
      .to({}, { duration: 0.5 });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener('load', function () { ST.refresh(); });
    return true;
  }

  /* ---------- Gửi dữ liệu lên Apps Script ---------- */
  function post(url, data) {
    return fetch(url, { method: 'POST', body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'send failed'); return j; });
  }
  function localList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function localPush(key, item) {
    try { var l = localList(key); l.unshift(item); localStorage.setItem(key, JSON.stringify(l.slice(0, 200))); } catch (e) { /* bỏ qua */ }
  }
  function showErr(input, errEl, show) {
    errEl.hidden = !show;
    if (show) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', errEl.id); }
    else { input.removeAttribute('aria-invalid'); }
  }

  /* ---------- RSVP ---------- */
  function setupRsvp() {
    var form = $('#rsvp');
    if (!form) return;
    var nameI = $('#rsvp-name'), nameErr = $('#rsvp-name-err');
    var status = $('.form-status', form), btn = $('button[type="submit"]', form);
    // có ?to= thì lấy tên từ link, không hiện ô nhập tên
    var nameField = $('[data-rsvp-name]', form);
    if (guest && nameField) nameField.hidden = true;
    nameI.addEventListener('input', function () { if (nameI.value.trim()) showErr(nameI, nameErr, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = guest || nameI.value.trim();
      if (!name) { showErr(nameI, nameErr, true); nameI.focus(); return; }
      var attend = form.attend.value;
      var data = { type: 'rsvp', name: name, attend: attend, to: guest, session: EV.label || '' };
      btn.disabled = true; status.className = 'form-status'; status.textContent = 'Đang gửi…';
      var done = function () {
        status.className = 'form-status ok';
        status.textContent = attend === 'yes'
          ? 'Đã nhận! Hẹn gặp bạn lúc ' + EV.start + ' ngày ' + EV_TEXT.short + ' nha ☀️'
          : 'Mình nhận được rồi, tiếc ghê! Cảm ơn bạn đã báo nha 💛';
        if (!RSVP_URL) status.textContent += ' (bản demo: chưa nối Google Sheet)';
        btn.disabled = false;
      };
      if (!RSVP_URL) { localPush('qh-rsvp', data); setTimeout(done, 400); return; }
      post(RSVP_URL, data).then(done).catch(function () {
        btn.disabled = false;
        status.className = 'form-status bad';
        status.textContent = 'Chưa gửi được, bạn kiểm tra mạng rồi thử lại giúp mình nhé.';
      });
    });
  }

  /* ---------- Bảng lời nhắn ---------- */
  function setupGuestbook() {
    var form = $('#composer');
    if (!form) return;
    var COLORS = ['butter', 'sky', 'sunny', 'cloud', 'cream'];
    var notesEl = $('[data-notes]'), emptyEl = $('[data-empty]'), countEl = $('[data-count]');
    var board = $('#board'), boardWrap = $('.board-wrap');
    var edit = $('.note-edit'), msg = $('#note-msg'), nameI = $('#note-name');
    var msgErr = $('#note-msg-err'), nameErr = $('#note-name-err'), lenEl = $('[data-len]');
    var status = $('.form-status', form), btn = $('button[type="submit"]', form);
    var sws = $$('.sw', form);
    var color = 'butter';

    function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
    function makeNote(n) {
      var el = document.createElement('article');
      el.className = 'note';
      el.dataset.color = COLORS.indexOf(n.color) > -1 ? n.color : 'butter';
      var h = hash((n.name || '') + (n.message || '') + (n.time || ''));
      el.style.setProperty('--rot', (((h % 9) - 4) * 0.8).toFixed(1) + 'deg');
      el.style.setProperty('--tape', (((h >> 3) % 7) - 3) * 2 + 'deg');
      var tape = document.createElement('span'); tape.className = 'tape'; tape.setAttribute('aria-hidden', 'true');
      var p = document.createElement('p'); p.className = 'note-msg'; p.textContent = n.message || '';
      var by = document.createElement('p'); by.className = 'note-by'; by.textContent = '— ' + (n.name || 'Một người bạn');
      el.append(tape, p, by);
      return el;
    }
    function updateCount() {
      var n = notesEl.children.length;
      countEl.textContent = n + ' lời nhắn';
      emptyEl.hidden = n > 0;
    }
    function render(list) {
      notesEl.replaceChildren.apply(notesEl, list.map(makeNote));
      emptyEl.textContent = 'Chưa có lời nhắn nào. Bạn dán tờ đầu tiên nhé!';
      updateCount();
    }

    // tải lời nhắn
    if (!NOTES_URL) render(localList('qh-notes'));
    else {
      fetch(NOTES_URL + (NOTES_URL.indexOf('?') > -1 ? '&' : '?') + 'action=notes', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { render((j && j.notes) || []); })
        .catch(function () { emptyEl.textContent = 'Chưa tải được lời nhắn, bạn tải lại trang thử nhé.'; });
    }

    // đổi màu giấy
    function pick(sw, focus) {
      sws.forEach(function (s) {
        var on = s === sw;
        s.setAttribute('aria-checked', on ? 'true' : 'false');
        s.tabIndex = on ? 0 : -1;
      });
      color = sw.dataset.sw;
      edit.dataset.color = color;
      if (focus) sw.focus();
    }
    sws.forEach(function (s, i) {
      s.tabIndex = i === 0 ? 0 : -1;
      s.addEventListener('click', function () { pick(s); });
      s.addEventListener('keydown', function (e) {
        var k = e.key, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % sws.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + sws.length) % sws.length;
        if (j > -1) { e.preventDefault(); pick(sws[j], true); }
      });
    });

    // textarea dài theo nội dung
    function grow() {
      msg.style.height = 'auto';
      msg.style.height = msg.scrollHeight + 'px';
      lenEl.textContent = msg.value.length + '/500';
    }
    msg.addEventListener('input', function () { grow(); if (msg.value.trim()) showErr(msg, msgErr, false); });
    nameI.addEventListener('input', function () { if (nameI.value.trim()) showErr(nameI, nameErr, false); });
    grow();

    function scrollToBoard() {
      return new Promise(function (res) {
        var r = boardWrap.getBoundingClientRect();
        var fits = r.top >= 0 && r.top < window.innerHeight * 0.5;
        if (fits) return res();
        var y = window.scrollY + r.top - 70;
        if (window.gsap && window.ScrollToPlugin) window.gsap.to(window, { scrollTo: y, duration: 0.7, ease: 'power2.inOut', onComplete: res });
        else { window.scrollTo({ top: y, behavior: 'smooth' }); setTimeout(res, 650); }
      });
    }

    function burst(x, y) {
      var cols = ['#FFE07A', '#A9D6FA', '#FFFFFF', '#3E63E0'];
      for (var i = 0; i < 14; i++) {
        var b = document.createElement('i');
        b.className = 'burst';
        var a = (i / 14) * Math.PI * 2;
        b.style.left = x + 'px'; b.style.top = y + 'px';
        b.style.background = cols[i % cols.length];
        b.style.setProperty('--x', Math.cos(a) * 70 + 'px');
        b.style.setProperty('--y', Math.sin(a) * 70 + 'px');
        b.style.setProperty('--r', i * 40 + 'deg');
        document.body.appendChild(b);
        setTimeout(b.remove.bind(b), 950);
      }
    }

    function fly(note) {
      var reduce = !root.classList.contains('anim') || !Element.prototype.animate;
      board.scrollTop = 0;
      if (reduce) { note.classList.add('is-new'); return Promise.resolve(); }
      return scrollToBoard().then(function () {
        var from = edit.getBoundingClientRect();
        var to = note.getBoundingClientRect();
        var ghost = note.cloneNode(true);
        ghost.classList.add('flying');
        ghost.style.left = from.left + 'px';
        ghost.style.top = from.top + 'px';
        ghost.style.width = from.width + 'px';
        ghost.style.visibility = 'visible';
        document.body.appendChild(ghost);
        var dx = to.left - from.left + (to.width - from.width) / 2;
        var dy = to.top - from.top + (to.height - ghost.offsetHeight) / 2;
        var sc = to.width / from.width;
        var anim = ghost.animate([
          { transform: 'translate(0,0) rotate(-1.2deg) scale(1)', offset: 0 },
          { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 60) + 'px) rotate(8deg) scale(' + (1 + sc) / 2 * 1.05 + ')', offset: 0.55 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(0deg) scale(' + sc + ')', offset: 1 }
        ], { duration: 780, easing: 'cubic-bezier(.55,.1,.35,1)', fill: 'forwards' });
        return new Promise(function (res) {
          anim.onfinish = function () {
            ghost.remove();
            note.style.visibility = '';
            note.classList.add('is-new');
            var r = note.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + 10);
            res();
          };
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = msg.value.trim(), n = nameI.value.trim();
      showErr(msg, msgErr, !m);
      showErr(nameI, nameErr, !n);
      if (!m) { msg.focus(); return; }
      if (!n) { nameI.focus(); return; }
      var data = { type: 'note', name: n.slice(0, 40), message: m.slice(0, 500), color: color, to: guest, time: new Date().toISOString() };
      btn.disabled = true; status.className = 'form-status'; status.textContent = 'Đang dán…';

      var send = !NOTES_URL ? new Promise(function (res) { localPush('qh-notes', data); setTimeout(res, 300); }) : post(NOTES_URL, data);
      send.then(function () {
        var note = makeNote(data);
        note.style.visibility = 'hidden';
        notesEl.prepend(note);
        updateCount();
        return fly(note);
      }).then(function () {
        msg.value = ''; grow();
        btn.disabled = false;
        status.className = 'form-status ok';
        status.textContent = !NOTES_URL ? 'Đã dán thử lên bảng (bản demo: chưa nối Google Sheet).' : 'Đã dán lên bảng! Cảm ơn bạn nhiều 💛';
      }).catch(function () {
        btn.disabled = false;
        status.className = 'form-status bad';
        status.textContent = 'Chưa dán được, bạn kiểm tra mạng rồi thử lại nhé.';
      });
    });
  }

  setupMotion();
  setupReveal();
  setupRsvp();
  setupGuestbook();
})();
