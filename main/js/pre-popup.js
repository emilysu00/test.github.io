(() => {
  const root = document.querySelector('[data-pre-popup-root]');
  if (!root) return;

  const triggers = Array.from(root.querySelectorAll('[data-popup-target]'));
  const popups = Array.from(root.querySelectorAll('[data-popup]'));
  const mapPopup = root.querySelector('[data-popup="map"]');
  const insPopup = root.querySelector('[data-popup="ins"]');
  const qrImage = root.querySelector('[data-ig-qr]');
  const igLink = root.querySelector('[data-ig-link]');

  let current = null;

  function closeAll() {
    popups.forEach((popup) => popup.classList.remove('is-open'));
    triggers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    current = null;
  }

  function openPopup(name) {
    popups.forEach((popup) => {
      popup.classList.toggle('is-open', popup.dataset.popup === name);
    });

    triggers.forEach((btn) => {
      const expanded = btn.dataset.popupTarget === name ? 'true' : 'false';
      btn.setAttribute('aria-expanded', expanded);
    });

    current = name;
  }

  function togglePopup(name) {
    if (current === name) {
      closeAll();
      return;
    }
    openPopup(name);
  }

  triggers.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePopup(btn.dataset.popupTarget);
    });
  });

  popups.forEach((popup) => {
    popup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', () => {
    closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAll();
    }
  });

  if (insPopup && qrImage && igLink) {
    const igUrl = insPopup.dataset.igUrl?.trim();

    if (igUrl) {
      igLink.href = igUrl;

      const qrApi = 'https://api.qrserver.com/v1/create-qr-code/';
      const qrSrc = `${qrApi}?size=340x340&data=${encodeURIComponent(igUrl)}`;

      qrImage.src = qrSrc;
      qrImage.alt = 'Instagram QR code';
    }
  }
})();
