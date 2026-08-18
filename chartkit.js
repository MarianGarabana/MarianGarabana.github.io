/* chartkit.js — shared chart layer for the portfolio project pages.
   No dependencies, no build step, ~4 KB.

   Three things it fixes that the per-page charts get wrong:
   1. Geometry is generated at TRUE pixel size and redrawn on resize, so
      preserveAspectRatio="none" is never needed and nothing is distorted.
   2. Ticks come from niceTicks(), so the gridlines ARE the labelled values.
      No more 5 evenly-spaced lines with 4 hand-picked labels that miss them.
   3. One type scale, defined once, in real px. */

(function (global) {
  'use strict';

  var TYPE = {
    tick:  { size: 11,   weight: 400, fill: 'var(--ck-muted, #6b6b64)' },
    axis:  { size: 11,   weight: 500, fill: 'var(--ck-muted, #6b6b64)' },
    value: { size: 12.5, weight: 600, fill: 'var(--ck-ink, #2b2b27)' }
  };

  var reduced = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nice ticks: round values a human would choose ------------------ */
  function niceTicks(min, max, target) {
    target = target || 5;
    var span = max - min;
    if (span <= 0) return [min];
    var raw = span / target;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    var out = [], v = Math.ceil(min / step) * step;
    for (; v <= max + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function text(x, y, str, role, opts) {
    opts = opts || {};
    var t = TYPE[role] || TYPE.tick;
    var a = ['x="' + x.toFixed(1) + '"', 'y="' + y.toFixed(1) + '"',
      'font-size="' + (opts.size || t.size) + '"',
      'font-weight="' + (opts.weight || t.weight) + '"',
      'fill="' + (opts.fill || t.fill) + '"'];
    if (opts.anchor) a.push('text-anchor="' + opts.anchor + '"');
    if (opts.tabular !== false) a.push('style="font-variant-numeric:tabular-nums"');
    return '<text ' + a.join(' ') + '>' + esc(str) + '</text>';
  }

  /* ---- the chart host -------------------------------------------------- */
  function mount(svg, opts) {
    var draw = opts.draw;
    var height = opts.height || 300;
    var mobileHeight = opts.mobileHeight || height;
    var pad = opts.pad || { l: 44, r: 64, t: 18, b: 30 };

    svg.removeAttribute('preserveAspectRatio');   // the distortion, gone
    svg.style.display = 'block';
    svg.style.width = '100%';

    function render() {
      var w = Math.round(svg.getBoundingClientRect().width);
      if (!w) return;
      // heightOf() lets a chart fill a container whose height it does not set
      var h = typeof opts.heightOf === 'function'
        ? Math.round(opts.heightOf(w))
        : (w < 520 ? mobileHeight : height);
      var p = { l: pad.l, r: w < 560 ? Math.min(pad.r, 22) : pad.r, t: pad.t, b: pad.b };

      // viewBox matches the CSS box 1:1, so one user unit is one CSS pixel
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.style.height = h + 'px';

      svg.innerHTML = draw({
        w: w, h: h, pad: p,
        plotW: w - p.l - p.r,
        plotH: h - p.t - p.b,
        narrow: w < 470,
        niceTicks: niceTicks, text: text, reduced: reduced
      });
    }

    render();
    if (global.ResizeObserver) {
      var raf = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
      }).observe(svg);
    } else {
      global.addEventListener('resize', render);
    }
    return { render: render };
  }

  global.chartkit = { mount: mount, niceTicks: niceTicks, text: text, TYPE: TYPE };
})(window);
