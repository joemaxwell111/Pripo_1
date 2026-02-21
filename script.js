const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const form = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const yearNode = document.querySelector('#year');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

if (form && formStatus) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      formStatus.textContent = 'Please complete all required fields.';
      formStatus.style.color = '#b42318';
      return;
    }

    formStatus.textContent = 'Thank you. Your request has been received.';
    formStatus.style.color = '#027a48';
    form.reset();
  });
}
