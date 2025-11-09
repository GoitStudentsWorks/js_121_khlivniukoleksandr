(() => {
  const menu = document.querySelector('.js-menu-container');
  const btn  = document.querySelector('.js-open-menu');
  if (!menu || !btn) return;

  // Іконки з icons.svg
  const ICON_CLOSED = 'icon-menu';
  const ICON_OPENED = 'icon-close';

  const iconUse = btn.querySelector('use');
  const getSpriteBase = () => {
    if (!iconUse) return null;
    const href = iconUse.getAttribute('href') || iconUse.getAttribute('xlink:href');
    return href ? href.split('#')[0] : null;
  };
  const setIcon = id => {
    const base = getSpriteBase();
    if (!base || !iconUse) return;
    iconUse.setAttribute('href', `${base}#${id}`);
    iconUse.setAttribute('xlink:href', `${base}#${id}`); // сумісність
  };

  // Пошук фокусованих елементів у меню для focus trap
  const focusablesSelector = [
    'a[href]', 'button:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');
  const firstFocusable = () => menu.querySelector(focusablesSelector);
  const focusables = () => Array.from(menu.querySelectorAll(focusablesSelector));

  // Приховати фон для скрінрідерів
  const setSiblingsAriaHidden = (hidden) => {
    const skip = new Set([menu, btn.closest('.header')]);
    Array.from(document.body.children).forEach(el => {
      if (!skip.has(el)) el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  };

  // Компенсація зникнення скролбара
  const applyScrollbarCompensation = (on) => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = on && sbw ? `${sbw}px` : '';
  };

  let onDocKeydown = null;
  let onDocClickOutside = null;

  const addDynamicListeners = () => {
    if (!onDocKeydown) {
      onDocKeydown = (e) => {
        // Escape
        if (e.key === 'Escape') { closeMenu(); return; }

        // Focus trap по Tab
        if (e.key === 'Tab' && menu.classList.contains('is-open')) {
          const nodes = focusables();
          if (!nodes.length) return;
          const first = nodes[0];
          const last  = nodes[nodes.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      };
      document.addEventListener('keydown', onDocKeydown);
    }
    if (!onDocClickOutside) {
      onDocClickOutside = (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
      };
      document.addEventListener('click', onDocClickOutside);
    }
  };

  const removeDynamicListeners = () => {
    if (onDocKeydown) document.removeEventListener('keydown', onDocKeydown);
    if (onDocClickOutside) document.removeEventListener('click', onDocClickOutside);
    onDocKeydown = onDocClickOutside = null;
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Закрити мобільне меню');
    menu.setAttribute('aria-hidden', 'false');
    setSiblingsAriaHidden(true);
    setIcon(ICON_OPENED);

    document.body.classList.add('no-scroll');
    applyScrollbarCompensation(true);

    // Переносимо фокус усередину меню
    setTimeout(() => (firstFocusable() || menu).focus(), 0);

    addDynamicListeners();
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Відкрити мобільне меню');
    menu.setAttribute('aria-hidden', 'true');
    setSiblingsAriaHidden(false);
    setIcon(ICON_CLOSED);

    document.body.classList.remove('no-scroll');
    applyScrollbarCompensation(false);

    removeDynamicListeners();
    btn.focus();
  };

  const toggleMenu = () => (
    menu.classList.contains('is-open') ? closeMenu() : openMenu()
  );

  btn.addEventListener('click', toggleMenu);
  menu.querySelectorAll('.nav-link, .mobile-order-btn')
      .forEach(a => a.addEventListener('click', () => {
        if (menu.classList.contains('is-open')) closeMenu();
      }));

  // Закриття при переході на десктоп
  const mq = window.matchMedia('(min-width: 1440px)');
  const handleMq = e => e.matches && menu.classList.contains('is-open') && closeMenu();
  mq.addEventListener?.('change', handleMq);
  mq.addListener?.(handleMq); // для старих Safari

  window.addEventListener('beforeunload', () => {
    removeDynamicListeners();
    mq.removeEventListener?.('change', handleMq);
    mq.removeListener?.(handleMq);
  });
})();
