/* Swap emoji placeholders for Professor logo icons */
(function () {
  function apply() {
    var headerIcon = document.querySelector('.header .logo-icon');
    if (headerIcon && headerIcon.tagName !== 'IMG') {
      var img = document.createElement('img');
      img.className = 'logo-icon';
      img.src = './icon-192.svg';
      img.width = 36;
      img.height = 36;
      img.alt = 'Professor Bio Hub';
      img.style.cssText = 'border-radius:10px;object-fit:cover;display:block;background:rgba(255,255,255,0.15);';
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
      img2.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      installIcon.appendChild(img2);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
