/* Professor Bio Hub – Install prompt (Add to Home Screen) */
(function () {
  var deferredPrompt = null;
  var DISMISS_KEY = 'profBioInstallDismissed';
  var DISMISS_DAYS = 14;

  function wasDismissedRecently() {
    try {
      var t = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      if (!t) return false;
      return (Date.now() - t) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function getBanner() {
    return document.getElementById('installBanner');
  }

  function showBanner() {
    var el = getBanner();
    if (!el || isStandalone() || wasDismissedRecently()) return;
    el.classList.add('show');
  }

  function hideBanner() {
    var el = getBanner();
    if (el) el.classList.remove('show');
  }

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    hideBanner();
  }

  async function promptInstall() {
    if (!deferredPrompt) {
      showIosHint();
      return;
    }
    deferredPrompt.prompt();
    var choice = await deferredPrompt.userChoice;
    console.log('[Install] outcome:', choice.outcome);
    deferredPrompt = null;
    hideBanner();
    if (choice.outcome === 'dismissed') dismiss();
  }

  function showIosHint() {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS || isStandalone()) return;
    var el = getBanner();
    if (!el) return;
    var title = el.querySelector('.install-title');
    var sub = el.querySelector('.install-sub');
    if (title) title.textContent = 'Install on iPhone';
    if (sub) sub.innerHTML = 'Tap <strong>Share</strong> \u2192 <strong>Add to Home Screen</strong>';
    var btn = el.querySelector('#installBtn');
    if (btn) { btn.textContent = 'Got it'; btn.onclick = function () { dismiss(); }; }
    el.classList.add('show');
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(showBanner, 2500);
  });

  window.addEventListener('appinstalled', function () {
    console.log('[Install] App installed');
    deferredPrompt = null;
    hideBanner();
    try { localStorage.removeItem(DISMISS_KEY); } catch (e) {}
  });

  function wire() {
    var installBtn = document.getElementById('installBtn');
    var dismissBtn = document.getElementById('installDismissBtn');
    if (installBtn) installBtn.addEventListener('click', promptInstall);
    if (dismissBtn) dismissBtn.addEventListener('click', dismiss);

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && !isStandalone() && !wasDismissedRecently()) {
      setTimeout(showIosHint, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
