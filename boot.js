/* Load feature modules after app.js */
(function () {
  var scripts = [
    './nav.js',
    './search.js',
    './efficiency.js',
    './cache-update.js',
    './srs.js'
  ];
  function load(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    });
  }
  var i = 0;
  function next() {
    if (i >= scripts.length) return;
    load(scripts[i++]).then(next);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', next);
  } else {
    next();
  }
})();
