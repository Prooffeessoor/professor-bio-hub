/* Swap emoji placeholders for Professor logo icons (retina-ready SVG) */
(function () {
  function apply() {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var headerIcon = document.querySelector('.header .logo-icon');
    if (headerIcon && headerIcon.tagName !== 'IMG') {
      var img = document.createElement('img');
      img.className = 'logo-icon';
      img.src = './icon-192.svg';
      img.width = 36;
      img.height = 36;
      img.alt = 'Professor Bio Hub';
      // Hint browser to pick sharp rasterization on high-DPI screens
      img.setAttribute('decoding', 'async');
      img.style.cssText = 'width:36px;height:36px;border-radius:10px;object-fit:cover;display:block;background:rgba(255,255,255,0.15);image-rendering:-webkit-optimize-contrast;';
      headerIcon.replaceWith(img);
    }
    var installIcon = document.querySelector('#installBanner .install-icon');
    if (installIcon && !installIcon.querySelector('img')) {
      installIcon.innerHTML = '';
      installIcon.style.padding = '0';
      installIcon.style.overflow = 'hidden';
      var img2 = document.createElement('img');
      img2.src = './icon-192.svg';
      img2.alt = '';
      img2.width = 48;
      img2.height = 48;
      img2.setAttribute('decoding', 'async');
      img2.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;image-rendering:-webkit-optimize-contrast;';
      installIcon.appendChild(img2);
    }
    // Prefer 512 for large contexts if needed later
    window.BioHubLogo = { src192: './icon-192.svg', src512: './icon-512.svg', dpr: dpr };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
