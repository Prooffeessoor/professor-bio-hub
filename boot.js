/* Load nav, search, efficiency modules after app.js */
(function () {
  var scripts = ['./nav.js', './search.js', './efficiency.js'];
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
  // Sequential so nav can override showPage after app init
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
