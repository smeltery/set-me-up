function setMenu(open, immediate = false) {
  const activeRevision = ++menuRevision;
  menuContentAnimation?.cancel();
  menuClosing = false;
  const animated = compact.matches && !reducedMotion.matches && !immediate;
  if (open && menuIsOpen()) return Promise.resolve();
  if (!open && !menuIsOpen()) return Promise.resolve();
  if (open) applyMenu(true);
  if (!animated) {
    if (!open) applyMenu(false);
    return Promise.resolve();
  }
  menuClosing = !open;
  const hidden = { opacity: 0, transform: 'translateY(-8px) scale(.95)' };
  const visible = { opacity: 1, transform: 'translateY(0) scale(1)' };
  // Match asciicn's Radix popover: animate the panel, never the header.
  menuContentAnimation = nav.animate(open ? [hidden, visible] : [visible, hidden], {
    duration: 100,
    easing: open ? 'ease-out' : 'ease-in',
    fill: 'both',
  });
  return menuContentAnimation.finished.then(() => {
    if (activeRevision !== menuRevision) return;
    if (!open) applyMenu(false);
    menuContentAnimation.cancel();
    menuClosing = false;
  }).catch(error => {
    if (error.name !== 'AbortError') console.error('Could not animate the docs menu.', error);
  });
}
