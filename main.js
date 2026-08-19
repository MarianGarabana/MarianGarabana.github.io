/* shared behavior for all pages: smooth scroll, nav, reveals, floating pill */
(function(){
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // year
  var yr = document.getElementById('yr'); if(yr) yr.textContent = new Date().getFullYear();

  // Smooth scrolling is native now: CSS scroll-behavior for anchors, the browser's own
  // wheel handling everywhere else. Lenis was removed because it virtualises scroll
  // position, which desyncs CSS scroll-driven animations (P5-3), and it ran a permanent
  // rAF loop to reimplement something the platform does.

  // nav + floating pill on scroll (pill hides while the footer/CTA is on screen)
  var nav = document.getElementById('nav');
  var navOuter = document.getElementById('navOuter');
  var floatPill = document.getElementById('floatPill');
  var footerInView = false;
  /* Watch the contact section as well as the footer. On a 390 viewport the pill
     was measured sitting on top of the contact CTA, an interactive target, and
     a pill that says "Get in touch" covering the actual Get in touch button is
     both redundant and an obstruction. */
  var hideZones = [document.querySelector('footer'), document.getElementById('contact')].filter(Boolean);
  if(hideZones.length && 'IntersectionObserver' in window){
    var seen = new WeakMap();
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ seen.set(e.target, e.isIntersecting); });
      footerInView = hideZones.some(function(el){ return seen.get(el); });
      onScroll(window.scrollY);
    }, {threshold: 0});
    hideZones.forEach(function(el){ io.observe(el); });
  }
  /* Direction-aware chrome. Both the nav and the pill are fixed elements that
     sit on top of running text, and blurring them did not fix that: it left
     gray letter ghosts that read as a rendering fault, and at 834 the nav cut
     across the "1ST PLACE" badge. Reading happens while scrolling down, so
     both leave on the way down and come back on the way up, where you are
     looking for navigation rather than reading. One behavior, two problems.

     UP_SLACK exists so a trackpad's jitter around zero cannot flicker the nav
     back in mid-sentence: it takes a deliberate 6px upward move. */
  /* HIDE_AFTER is 88, not a round 150. The nav occupies 18px to 76px of the
     viewport, so at 1440 the hero h1 (document top 178) first touches it at
     scrollY 102. A threshold above that leaves a band where the nav is still
     shown and already overlapping, which is the exact collision this change
     exists to remove. 88 clears the nav's own 76px footprint and nothing more. */
  var lastY = window.scrollY, UP_SLACK = 6, HIDE_AFTER = 88;
  function onScroll(y){
    var dy = y - lastY;
    if(Math.abs(dy) > 1) lastY = y;
    if(nav) nav.classList.toggle('scrolled', y > 20);
    if(navOuter){
      /* Menu open is a hard override, not a slack case: hiding the bar that
         owns an open menu would take the menu with it. */
      var menuOpen = nav && nav.classList.contains('open');
      var hideChrome = y > HIDE_AFTER && dy > 0 && !menuOpen;
      if(hideChrome) navOuter.classList.add('nav-hidden');
      else if(dy < -UP_SLACK || y <= HIDE_AFTER || menuOpen) navOuter.classList.remove('nav-hidden');
    }
    if(floatPill){
      /* Wide: the pill lives in the right margin and occludes nothing, so the
         old fixed 700px trigger is fine. Narrow: there is no margin to hide in,
         so hold it back to ~70% depth, which is also where a contact prompt
         stops being an interruption. */
      var deep = window.innerWidth >= 821
        ? y > 700
        : y + window.innerHeight > document.body.scrollHeight * 0.7;
      /* Same direction rule as the nav. At 1440 the pill occluded nothing and
         this costs nothing; at 834 and 390 it is the whole fix, because there
         is no margin for it to sit in. Keep it up while it holds focus. */
      var scrollingDown = y > HIDE_AFTER && dy > 0;
      var keepForFocus = floatPill.contains(document.activeElement);
      floatPill.classList.toggle('show', deep && !footerInView && (!scrollingDown || keepForFocus));
    }
    if(window.onPageScroll) window.onPageScroll(y);
  }
  window.addEventListener('scroll', function(){ onScroll(window.scrollY); });
  onScroll(window.scrollY);

  // smooth anchor links (skip link also moves focus for keyboard users)
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length>1){
        var t=document.querySelector(id);
        if(t){
          e.preventDefault();
          t.scrollIntoView({behavior: REDUCED ? 'auto' : 'smooth'});
          if(a.classList.contains('skip-link')){ t.setAttribute('tabindex','-1'); t.focus({preventScroll:true}); }
        }
      }
    });
  });

  // burger -> toggle the mobile nav menu
  var burger = document.getElementById('burger');
  if(burger && nav){
    function setMenu(open){
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }
    burger.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
    nav.querySelectorAll('.nav-links a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  }

  // Reveal on scroll with per-parent stagger.
  // The markup is visible by default; html.js-anim is what opts into the hidden
  // pre-reveal state, and it is only added here, once we know an observer is
  // actually going to attach. Skipped entirely for reduced motion and for any
  // browser without IntersectionObserver, so those users just get the content.
  // js-anim is set whenever motion is allowed and an observer exists, not only when
  // this page has .reveal elements: several project pages key their own entrance
  // rules (.ph-card, .tl-item, .layer, .op, .st) off the same class.
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window && !REDUCED){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var el = en.target;
          var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > .reveal'));
          var idx = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = (idx * 0.08) + 's';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, {threshold:0.14});
    // Anything already on screen is marked revealed before we hide anything, so
    // above-the-fold content never flashes out and back in.
    reveals.forEach(function(el){
      if(el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
    document.documentElement.classList.add('js-anim');
    try{
      reveals.forEach(function(el){ io.observe(el); });
    }catch(e){
      // if the observer never attached, un-hide everything rather than leave a blank page
      document.documentElement.classList.remove('js-anim');
    }
  }

  // Click-to-load PDF facades, P2-3. The markup is a real link to the PDF, so with
  // JS off the poster still opens the document in a new tab. With JS on we cancel
  // the navigation and inject the viewer in place instead, which is why the trailing
  // .sr-only sentence is rewritten here: without it the link would keep promising a
  // new tab while doing something else. The accessible name stays content-derived,
  // so it always contains the visible "Load the deck 1.9 MB" text (WCAG 2.5.3).
  // Below 900px nothing is injected: an iframe at a phone's width is ~197px tall for
  // a 16:9 slide, which is worse than the device's own PDF viewer. There the link is
  // simply left alone, and the sentence below says so.
  var INLINE = window.matchMedia('(min-width: 901px)');
  var facades = Array.prototype.slice.call(document.querySelectorAll('.pdf-fac'));
  function facadeNote(fac){
    var note = fac.querySelector('.pdf-fac-note');
    if(note) note.textContent = INLINE.matches ? ', loads in place on this page' : ', opens in a new tab';
  }
  facades.forEach(facadeNote);
  if(INLINE.addEventListener) INLINE.addEventListener('change', function(){ facades.forEach(facadeNote); });
  facades.forEach(function(fac){
    fac.addEventListener('click', function(e){
      // let modified clicks (new tab, download) and narrow viewports use the real href
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if(!INLINE.matches) return;
      e.preventDefault();
      var poster = fac.querySelector('img');
      var frame = document.createElement('iframe');
      frame.src = fac.getAttribute('href') + '#view=FitH';
      frame.title = fac.getAttribute('data-frame-title') || 'PDF document';
      // carry the poster's measured height onto the frame so the swap shifts nothing,
      // and paint the poster as the frame's own background so the panel is not a blank
      // white slab while a 3.3MB deck downloads. The PDF paints over it on arrival.
      frame.style.height = fac.getBoundingClientRect().height + 'px';
      if(poster) frame.style.background = 'var(--surface2) url("' + poster.getAttribute('src') + '") center/contain no-repeat';
      fac.parentNode.replaceChild(frame, fac);
      frame.focus({preventScroll:true});
    });
  });

  // Persisted motion pause, P1-6. Hover-pause is unreachable by keyboard and screen
  // reader users, so every page gets one real control in the footer. The preference is
  // stored, so it survives navigation across the multi-page site.
  (function(){
    var root = document.documentElement, KEY = 'motionPaused';
    var stored = null;
    try{ stored = localStorage.getItem(KEY); }catch(e){}
    var paused = stored === '1';
    if(paused) root.classList.add('motion-paused');

    var host = document.querySelector('footer .foot-copy') || document.querySelector('footer');
    if(!host) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'motion-toggle';
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    function label(){
      btn.innerHTML = '<span class="mt-dot" aria-hidden="true"></span>' +
        (REDUCED ? 'Motion off, system setting' : (paused ? 'Motion paused' : 'Pause motion'));
    }
    label();
    if(REDUCED){
      // the OS already suppresses animation; keep the state visible but do not offer
      // a control that would claim to turn motion back on
      btn.disabled = true;
    } else {
      btn.addEventListener('click', function(){
        paused = !paused;
        root.classList.toggle('motion-paused', paused);
        btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        try{ localStorage.setItem(KEY, paused ? '1' : '0'); }catch(e){}
        label();
      });
    }
    host.appendChild(btn);
  })();
})();

/* ---------- liquid glass: inject the shared displacement filter once ----------
   The .lg-edge strips reference url(#distortion), which must exist in the
   document. Injecting here means every page that loads main.js gets it without
   pasting SVG into each template. No JS means no refraction, not broken glass. */
(function(){
  if(document.getElementById('distortion')) return;
  if(!document.querySelector('.lg-edge')) return;
  var ns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('width','0'); svg.setAttribute('height','0');
  svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
  svg.style.cssText='position:absolute;width:0;height:0';
  svg.innerHTML='<filter id="distortion">'+
    '<feTurbulence type="turbulence" baseFrequency="0.01 0.1" numOctaves="1" result="turbulence"/>'+
    '<feDisplacementMap in2="turbulence" in="SourceGraphic" scale="8" '+
    'xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);
})();

/* ---------- hero video: never autoplay under reduced motion ---------- */
(function(){
  var v=document.querySelector('.vhero-bg video'); if(!v) return;
  var still=document.querySelector('.vhero-still');
  var mq=matchMedia('(prefers-reduced-motion: reduce)');
  function sync(){
    if(mq.matches){ v.pause(); v.removeAttribute('autoplay'); if(still) still.hidden=false; v.style.display='none'; }
    else { v.style.display=''; if(still) still.hidden=true; v.play().catch(function(){ if(still) still.hidden=false; }); }
  }
  mq.addEventListener ? mq.addEventListener('change',sync) : mq.addListener(sync);
  sync();
})();

/* ---------- KPI card cursor spotlight ----------
   One delegated pointermove for the whole page, not one listener per card, and
   it writes two custom properties the CSS reads. Pointer devices only: on touch
   there is no hover state to light up, and under reduced motion the CSS hides
   the glow entirely, so we never bother tracking. Writing a custom property does
   not invalidate layout, only paint of the card's own ::before. */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!matchMedia('(hover: hover)').matches) return;
  if(!document.querySelector('.kc,.kpicard')) return;
  document.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch') return;
    var card=e.target.closest && e.target.closest('.kc,.kpicard'); if(!card) return;
    var r=card.getBoundingClientRect();
    card.style.setProperty('--kpi-mx',(e.clientX-r.left)+'px');
    card.style.setProperty('--kpi-my',(e.clientY-r.top)+'px');
  },{passive:true});
})();

/* ---------- tool marquee: clone the list once for a seamless loop ----------
   The source list stays the single place to edit. The clone is aria-hidden so
   assistive tech and find-in-page see each tool once, not twice. */
(function(){
  document.querySelectorAll('.marq-track').forEach(function(track){
    var src=track.querySelector('ul'); if(!src||track.children.length>1) return;
    var copy=src.cloneNode(true);
    copy.setAttribute('aria-hidden','true');
    copy.removeAttribute('aria-label');
    copy.querySelectorAll('a,button').forEach(function(el){ el.tabIndex=-1; });
    track.appendChild(copy);
  });
})();

/* ---------- automatic photo carousel ----------
   Dots are built from the slide count so the markup stays the single source of
   truth. Paused whenever it is not actually being looked at: hover, focus,
   hidden tab, or scrolled out of view. */
(function(){
  var REDUCE=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.pcar').forEach(function(car){
    var slides=[].slice.call(car.querySelectorAll('.pslide'));
    if(slides.length<2) return;
    var dots=car.querySelector('.pcar-dots');
    var wait=+car.dataset.interval||4500, i=0, timer=null, inView=true, held=false;

    slides.forEach(function(s,n){
      var b=document.createElement('button');
      b.type='button';
      b.setAttribute('aria-label','Show photo '+(n+1)+' of '+slides.length);
      b.setAttribute('aria-current', n===0?'true':'false');
      b.addEventListener('click',function(){ go(n); restart(); });
      dots.appendChild(b);
    });
    var btns=[].slice.call(dots.children);

    function go(n){
      i=(n+slides.length)%slides.length;
      slides.forEach(function(s,k){ s.classList.toggle('is-on',k===i); });
      btns.forEach(function(b,k){ b.setAttribute('aria-current', k===i?'true':'false'); });
    }
    function stop(){ clearInterval(timer); timer=null; }
    function start(){
      if(timer||REDUCE.matches||!inView||held||document.hidden) return;
      timer=setInterval(function(){ go(i+1); }, wait);
    }
    function restart(){ stop(); start(); }

    car.addEventListener('mouseenter',function(){ held=true; stop(); });
    car.addEventListener('mouseleave',function(){ held=false; start(); });
    car.addEventListener('focusin',function(){ held=true; stop(); });
    car.addEventListener('focusout',function(){ held=false; start(); });
    document.addEventListener('visibilitychange',function(){ document.hidden?stop():start(); });
    if(REDUCE.addEventListener) REDUCE.addEventListener('change',function(){ stop(); start(); });
    if(window.IntersectionObserver){
      new IntersectionObserver(function(e){ inView=e[0].isIntersecting; if(inView){start();}else{stop();} },
        {threshold:.25}).observe(car);
    }
    start();
  });
})();

/* ApexCharts is 164.6 KB gzipped, which is 6.5 times the rest of the site's
   CSS and JS put together. It loads on the three pages that use it, and only
   when the panel holding its chart is actually opened, so a reader who never
   opens that tab never pays for it. Resolves immediately once loaded. */
window.loadApex = (function () {
  var p = null;
  return function () {
    if (p) return p;
    p = new Promise(function (res, rej) {
      if (window.ApexCharts) return res(window.ApexCharts);
      var s = document.createElement('script');
      s.src = 'assets/apexcharts.min.js';
      s.onload = function () { res(window.ApexCharts); };
      s.onerror = function () { rej(new Error('ApexCharts failed to load')); };
      document.head.appendChild(s);
    });
    return p;
  };
})();

/* ================= SECTION TABS =================
   APG tabs pattern with automatic activation, shared by every project page.
   The panel id doubles as the URL hash so a tab is linkable and the back
   button works. A chart or diagram inside a hidden panel measures zero width,
   so showing a panel re-fires resize and everything re-measures at its real
   size. Panels carry hidden in the markup, so the right panel is already
   showing at first paint and this script only takes over from there. */
(function(){
  function initRail(rail){
    var tabs=[].slice.call(rail.querySelectorAll('[role=tab]'));
    if(!tabs.length) return;
    var panels=tabs.map(function(t){
      return document.getElementById(t.getAttribute('aria-controls'));
    });

    /* scroll is opt-in, never automatic on load. show() used to call
       scrollIntoView unconditionally, and because fromHash() runs show(0) on
       every page load, every tabbed page scrolled itself down far enough to
       bring the tab rail into view before the reader had touched anything.
       Measured 2026-08-10 at 390px: trading scrolled 155px, hospital 122px,
       datathon 284px, and the scroll handler then hid the nav, so a phone
       arrived mid-hero with no navigation. Scroll now only when the reader
       asked for it: a click, a key, or a deep link that names a real panel. */
    function show(i,focus,push,scroll){
      tabs.forEach(function(t,j){
        var on=j===i;
        t.setAttribute('aria-selected',String(on));
        t.tabIndex = on ? 0 : -1;
        if(panels[j]) panels[j].hidden = !on;
      });
      if(focus) tabs[i].focus();
      if(push) history.replaceState(null,'','#'+tabs[i].getAttribute('aria-controls'));
      if(scroll && tabs[i].scrollIntoView) tabs[i].scrollIntoView({block:'nearest',inline:'nearest'});
      dispatchEvent(new Event('resize'));
    }

    rail.addEventListener('click',function(e){
      var t=e.target.closest('[role=tab]'); if(!t) return;
      show(tabs.indexOf(t),false,true,true);
    });
    rail.addEventListener('keydown',function(e){
      var i=tabs.indexOf(document.activeElement); if(i<0) return;
      var n=null;
      if(e.key==='ArrowRight') n=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft') n=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home') n=0;
      else if(e.key==='End') n=tabs.length-1;
      if(n===null) return;
      e.preventDefault(); show(n,true,true,true);
    });

    /* deep link: #p-performance opens that tab rather than resolving to nothing */
    function fromHash(){
      var h=location.hash.replace('#',''), i=-1;
      tabs.forEach(function(t,j){ if(t.getAttribute('aria-controls')===h) i=j; });
      /* a hash that names a real panel is a deep link and should land on it;
         no hash at all means a plain page load and must not move the page */
      show(i<0?0:i,false,false,i>=0);
    }
    addEventListener('hashchange',fromHash);
    fromHash();
  }
  [].slice.call(document.querySelectorAll('[role=tablist].secnav')).forEach(initRail);
})();
