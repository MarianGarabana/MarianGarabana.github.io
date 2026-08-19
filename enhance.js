/* ============================================================================
   enhance.js — ADDITIVE LAYER. Loads after main.js.

   Adds eight things to index.html and changes none of the behavior already
   there. main.js keeps the nav, the .reveal observer, the floating pill and the
   photo carousel; the rails, the education cards and the typewriter keep their
   own scripts in the page.

     1. Lenis            momentum scroll, synced to ScrollTrigger
     2. Hero parallax    video, collage and glass panel on three depths
     3. Split headings   .sec-title and .hero-h1 rise line by line
     4. Eyebrow wipe     clip-path, drawn left to right
     5. Counters         the three About stats count up once
     6. Card tilt        .proj-main follows the pointer in 3D
     7. Cursor + magnets a difference-blend cursor and pull on the CTAs
     8. Progress bar     scroll position in the nav underline

   ============================================================================
   HOW THE LIBRARIES LOAD, AND WHY NOT WITH <script src> IN THE HEAD

   The first version of this file put four <script defer src="cdn..."> tags in
   index.html. That is the normal way and it is wrong here. A deferred script
   delays the document load event, so a CDN that HANGS rather than 404s takes
   the whole page down with it: the page never finishes loading, and enhance.js,
   queued behind all four, never runs at all. The guards in each block below
   protect against a library that is MISSING. Nothing protects against one that
   never answers. It happened in review, so it will happen to a visitor.

   Injecting them from a script is NOT on its own enough, and the first attempt
   at this got it wrong. A classic script with the async flag still sets the
   "delay the load event" flag while it is fetching, and that is the default for
   a dynamically created script element. Dynamic injection only escapes the load
   event if it happens AFTER that event has already fired.

   So boot() is gated on window load. Nothing can delay an event that is already
   over. The layer arrives a beat after the page is interactive, which for
   decoration is the correct trade: the 5s ceiling then only governs how long
   this file waits before giving up on a library, not whether the page loads.

   Blocks 6, 7 and 8 need no library and still run at DOMContentLoaded, so the
   cursor, the card tilt and the progress bar are up immediately.

   SELF-HOSTING. DONE Aug 17 2026. All four libraries are vendored under
   assets/vendor/ and USE_VENDOR is on, so a normal page view touches no third
   party at all. That is what the rest of this repo does with its fonts and its
   Simple Icons, and CLAUDE.md requires it.

     gsap.min.js           gsap 3.12.5          72,214 bytes
     ScrollTrigger.min.js  gsap 3.12.5          43,380 bytes
     split-type.min.js     split-type 0.3.4     11,804 bytes
     lenis.min.js          lenis 1.1.13         13,485 bytes

   Fetched once from cdn.jsdelivr.net at those exact pinned versions. Those URLs
   are kept in the loadOne() calls below as the RECORD OF PROVENANCE and as the
   path USE_VENDOR:false would take. With USE_VENDOR on they are never
   requested: there is deliberately NO fallback behind the local copy.

   Why no fallback, decided Aug 17 2026. A fallback would mean that the day
   assets/vendor/ does not make it into the deploy, the page still looks
   perfect and silently requests a third party, breaking CLAUDE.md's no-third-
   party-hosts rule with nothing to announce it. Deploy here is a manual copy,
   so that day is plausible. Without the fallback the same mistake costs the
   parallax and the split headings on index and is obvious immediately. This
   layer is decoration: every block is guarded, real values are already in the
   DOM, and reduced motion skips the whole thing, so losing it is cheap and
   losing it loudly is the point.

   Versions are pinned. An unpinned CDN path is a third party with commit access
   to the site.

   REDUCED MOTION SKIPS THE NETWORK ENTIRELY. Nothing below has anything to do
   under reduce, so there is no reason to fetch 90kb to find that out.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var USE_VENDOR = true;             /* assets/vendor/ holds all four, Aug 17 2026 */
  var VENDOR = 'assets/vendor/';
  var TIMEOUT = 5000;

  var GS = null, ST = null, HAS_GSAP = false;

  /* ==========================================================================
     LOADER
     ========================================================================== */
  function loadOne(local, cdn, isReady) {
    return new Promise(function (resolve) {
      if (isReady()) return resolve(true);

      var settled = false;
      function done(ok) { if (!settled) { settled = true; resolve(ok); } }
      var timer = setTimeout(function () { done(isReady()); }, TIMEOUT);

      function attempt(src, onFail) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = function () { clearTimeout(timer); done(isReady()); };
        s.onerror = onFail;
        document.head.appendChild(s);
      }
      var giveUp = function () { clearTimeout(timer); done(false); };
      /* No CDN fallback behind the vendored copy, on purpose. See the header:
         a fallback would mean a missing vendor file still renders correctly
         while quietly requesting a third party, which is the failure this
         project is least able to notice. A missing file kills the layer
         instead, which is visible in five seconds. */
      if (USE_VENDOR) attempt(VENDOR + local, giveUp);
      else attempt(cdn, giveUp);
    });
  }

  function boot() {
    /* gsap must exist before ScrollTrigger registers against it, so those two
       are sequential. SplitType and Lenis depend on nothing and race. */
    var core = loadOne('gsap.min.js', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
      function () { return !!window.gsap; }
    ).then(function (ok) {
      if (!ok) return false;
      return loadOne('ScrollTrigger.min.js', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
        function () { return !!window.ScrollTrigger; });
    });

    var split = loadOne('split-type.min.js', 'https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js',
      function () { return !!window.SplitType; });

    var lenis = loadOne('lenis.min.js', 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js',
      function () { return !!window.Lenis; });

    Promise.all([core, split, lenis]).then(function () {
      GS = window.gsap;
      ST = window.ScrollTrigger;
      HAS_GSAP = !!(GS && ST);
      if (HAS_GSAP) GS.registerPlugin(ST);
      run();
    });
  }

  /* Blocks 6, 7 and 8 need no library at all, so they should not wait on the
     network. Blocks that do need one are inside run(). */
  function runLocalOnly() { tilt(); cursor(); progress(); }

  function run() {
    smoothScroll();
    heroParallax();
    splitHeadings();
    eyebrows();
    counters();
    if (HAS_GSAP) progressGsap();
  }

  /* ==========================================================================
     1 · LENIS
     lerp .085 rather than the default .1: this page is long and the slightly
     heavier setting keeps the hero parallax from feeling twitchy at the top.
     Touch stays on native scroll, which is what Lenis itself recommends.

     ON RE-ADDING LENIS AT ALL. main.js line 9 records why it came out: it
     virtualises scroll position, which desyncs CSS scroll-driven animations,
     and it runs a permanent rAF loop. Both still true, neither applies here.
     Nothing on this page uses animation-timeline; ScrollTrigger reads position
     from Lenis through the sync below, which is the supported pairing. The rAF
     loop is real and is the price. To drop it, delete this function from run().
     ========================================================================== */
  function smoothScroll() {
    if (!window.Lenis) return;
    var l = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, smoothTouch: false });

    if (HAS_GSAP) {
      l.on('scroll', ST.update);
      GS.ticker.add(function (t) { l.raf(t * 1000); });
      GS.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(t) { l.raf(t); requestAnimationFrame(raf); });
    }

    /* Lenis owns the scroll position now, so anchor clicks go through it rather
       than letting two systems animate the same value.

       EXCEPTION: the project pages' section rail. Those pages compute an
       absolute pixel target from the sticky rail's measured height, and this
       document-level listener used to retarget the same Lenis instance a beat
       later with element-plus-offset(-88), throwing that away and parking the
       section heading behind the rail on every upward jump. The rail is the
       single owner of its own scroll targets. */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.closest('.secnav')) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
      l.scrollTo(target, { offset: -(navH + 12), duration: 1.1 });
    });

    window.lenis = l;
  }

  /* ==========================================================================
     2 · HERO PARALLAX
     Three depths against one scrub. The video moves least because it is the
     furthest thing in the frame; the glass panel moves most and fades, so the
     handoff to 01 Selected work happens before the section edge arrives.

     matchMedia rather than a width test: .hero-collage is display:none below
     1000px, and animating three boxes that are not laid out costs frames and
     produces nothing.
     ========================================================================== */
  function heroParallax() {
    if (!HAS_GSAP) return;
    var hero = document.getElementById('hero');
    if (!hero) return;
    var mm = GS.matchMedia();

    mm.add('(min-width: 1px)', function () {
      var tl = GS.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
      var vid = hero.querySelector('.vhero-bg video, .vhero-still');
      if (vid) tl.to(vid, { yPercent: 14, scale: 1.1, ease: 'none' }, 0);
      var panel = hero.querySelector('.hero-panel');
      if (panel) tl.to(panel, { y: -70, opacity: 0.25, ease: 'none' }, 0);
    });

    /* One collage frame since Aug 17 2026, not three, so one depth instead of
       three. The middle value of the old set: the box now spans the whole
       collage area, so the travel that suited a 39% box would read as a slab
       sliding behind the panel. */
    mm.add('(min-width: 1000px)', function () {
      [['.hcol', -46]].forEach(function (d) {
        var el = hero.querySelector(d[0]);
        if (!el) return;
        GS.to(el, {
          y: d[1], ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 }
        });
      });
    });
  }

  /* ==========================================================================
     3 · SPLIT HEADINGS
     SplitType writes .line and .word; enhance.css clips .line so the words can
     travel from below their own baseline. html.split-on gates that clip and is
     only added here, after the library is confirmed present, so a heading is
     never left clipped with nothing to reveal it.

     Re-split on ScrollTrigger's own debounced refresh, because a line box is a
     layout fact: a heading that wraps over two lines at 1440 wraps over three
     at 900 and the old .line divs would hold the old break points.
     ========================================================================== */
  function splitHeadings() {
    if (!HAS_GSAP || !window.SplitType) return;
    /* .h-sec h2 is the project pages' section heading. The pages' own hero h1
       (.pd-title) is deliberately NOT in this list: it carries the
       view-transition-name the homepage card morphs into, and it is already in
       view at load, so splitting it would re-animate a heading the transition
       had just finished placing. */
    var nodes = [].slice.call(document.querySelectorAll('.sec-title, .hero-h1, .h-sec h2'));
    if (!nodes.length) return;

    document.documentElement.classList.add('split-on');

    nodes.forEach(function (node) {
      node.classList.add('split');
      var split = null, trig = null;

      function build() {
        if (split) split.revert();
        split = new window.SplitType(node, { types: 'lines,words', lineClass: 'line', wordClass: 'word' });
        GS.set(split.words, { yPercent: 112, opacity: 0 });
        if (trig) trig.kill();
        trig = ST.create({
          trigger: node, start: 'top 88%', once: true,
          onEnter: function () {
            GS.to(split.words, { yPercent: 0, opacity: 1, duration: 0.95, ease: 'expo.out', stagger: 0.032 });
          }
        });
      }

      build();
      ST.addEventListener('refreshInit', build);
    });
  }

  /* ==========================================================================
     4 · EYEBROW WIPE
     ========================================================================== */
  function eyebrows() {
    if (!HAS_GSAP) return;
    [].forEach.call(document.querySelectorAll('.eyebrow'), function (el) {
      GS.to(el, {
        clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  /* ==========================================================================
     5 · COUNTERS
     The three About stats ship their real values in the markup, which is the
     rule the page comment sets: a counter that animates from 0 can freeze at 0.
     So this reads the value out of the DOM, counts to it, and writes the
     original string back at the end rather than reconstructing it.

     "600K+" is not a number. Only the leading digits move and the suffix is
     preserved, so the plus never disappears mid-count.
     ========================================================================== */
  function counters() {
    if (!HAS_GSAP) return;
    /* .m-kpi .v and .kc .v are the project pages' KPI figures. Those carry a
       currency prefix ("€1,400"), which the original two-group pattern could
       not match at all, so the counters silently did nothing there. Three
       groups now: anything before the digits, the digits, anything after. */
    [].forEach.call(document.querySelectorAll('.about-stat .st b, .m-kpi .v, .kc .v'), function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!m) return;
      var prefix = m[1];
      var target = parseFloat(m[2].replace(/,/g, ''));
      if (!isFinite(target)) return;
      var suffix = m[3];
      var decimals = (m[2].split('.')[1] || '').length;
      var box = { v: 0 };

      ST.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          GS.to(box, {
            v: target, duration: 1.4, ease: 'power2.out',
            onUpdate: function () {
              el.textContent = prefix + box.v.toLocaleString('en-US', {
                minimumFractionDigits: decimals, maximumFractionDigits: decimals
              }) + suffix;
            },
            onComplete: function () { el.textContent = raw; }
          });
        }
      });
    });
  }

  /* ==========================================================================
     6 · PROJECT CARD TILT
     Rotation is capped at 5 degrees and the thumbnail scales 1.04. Anything
     more and the card stops reading as a card. Applied to .proj-main, never to
     .proj, so the hover lift already in styles.css keeps its own transform.
     ========================================================================== */
  function tilt() {
    if (!FINE) return;
    [].forEach.call(document.querySelectorAll('.proj'), function (card) {
      var main = card.querySelector('.proj-main');
      var img = card.querySelector('.proj-thumb img');
      if (!main) return;

      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5;
        var py = (e.clientY - b.top) / b.height - 0.5;
        card.classList.add('is-tilting');
        main.style.transform = 'rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg)';
        if (img) img.style.transform = 'scale(1.04) translate(' + (-px * 10).toFixed(1) + 'px,' + (-py * 10).toFixed(1) + 'px)';
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        main.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     7 · CURSOR AND MAGNETS
     One rAF loop drives both nodes. The ring lags the dot by a lerp of .17,
     which is what makes it read as a trailing object rather than as a second
     cursor; the dot is written straight from the event, so the point of contact
     is never late.
     ========================================================================== */
  function cursor() {
    if (!FINE) return;

    var ring = document.createElement('div');
    ring.className = 'cur-ring';
    var label = document.createElement('span');
    label.className = 'cur-label';
    ring.appendChild(label);
    var dot = document.createElement('div');
    dot.className = 'cur-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.documentElement.classList.add('cur-on');

    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, s = 1, ts = 1;
    var running = false;

    /* The loop parks itself once the ring has caught up and the scale has
       settled, and any pointer event wakes it. A cursor rAF that never stops is
       a frame of work every 16ms for the whole session, including while the
       reader is just reading. */
    function wake() { if (!running) { running = true; requestAnimationFrame(loop); } }

    function loop() {
      rx += (x - rx) * 0.17;
      ry += (y - ry) * 0.17;
      s += (ts - s) * 0.15;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
      if (Math.abs(x - rx) < 0.12 && Math.abs(y - ry) < 0.12 && Math.abs(ts - s) < 0.002) {
        running = false;
        return;
      }
      requestAnimationFrame(loop);
    }

    addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      ring.style.opacity = '1'; dot.style.opacity = '1';
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      wake();
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      ring.style.opacity = '0'; dot.style.opacity = '0';
    });

    function grow(el, size, text) {
      el.addEventListener('pointerenter', function () {
        ts = size;
        label.textContent = text || '';
        ring.classList.toggle('is-lg', !!text);
        wake();
      });
      el.addEventListener('pointerleave', function () {
        ts = 1; ring.classList.remove('is-lg'); wake();
      });
    }
    [].forEach.call(document.querySelectorAll('.proj-main'), function (el) { grow(el, 2.6, 'View'); });
    [].forEach.call(document.querySelectorAll('.edu2'), function (el) { grow(el, 2.2, 'More'); });
    [].forEach.call(document.querySelectorAll('a:not(.proj-main), button'), function (el) {
      if (el.closest('.proj-main') || el.closest('.edu2')) return;
      grow(el, 1.9, '');
    });

    /* ---- magnets ----
       0.28 of the distance from center, released on a .6s expo. Strong enough
       to notice on a 44px control, weak enough that the pointer never loses the
       target it is aiming at. */
    [].forEach.call(document.querySelectorAll(
      '.btn, .nav-cta, .rail-nav, .edu2-plus, .float-pill .fp-ico, .nav-ava'
    ), function (el) {
      el.setAttribute('data-mag', '');
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        el.style.transition = 'transform .1s linear';
        el.style.transform = 'translate3d(' +
          ((e.clientX - b.left - b.width / 2) * 0.28).toFixed(1) + 'px,' +
          ((e.clientY - b.top - b.height / 2) * 0.28).toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1)';
        el.style.transform = '';
      });
    });

    wake();
  }

  /* ==========================================================================
     8 · SCROLL PROGRESS
     Written into .nav-outer rather than the page, so it inherits the nav's own
     stacking context. Runs on a plain scroll listener immediately; if gsap
     turns up later, progressGsap() hands it to a scrubbed ScrollTrigger, which
     stays in step with Lenis where the raw listener would not.
     ========================================================================== */
  var progBar = null, progHandler = null;

  function progress() {
    var host = document.getElementById('navOuter');
    if (!host) return;
    progBar = document.createElement('div');
    progBar.className = 'scroll-prog';
    host.appendChild(progBar);

    progHandler = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      progBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    };
    addEventListener('scroll', progHandler, { passive: true });
    progHandler();
  }

  function progressGsap() {
    if (!progBar) return;
    removeEventListener('scroll', progHandler);
    GS.to(progBar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 }
    });
  }

  /* ==========================================================================
     GO
     ========================================================================== */
  if (REDUCED) return;
  runLocalOnly();
  /* boot() must not run before window load: see the header comment. */
  if (document.readyState === 'complete') boot();
  else addEventListener('load', boot, { once: true });
})();
