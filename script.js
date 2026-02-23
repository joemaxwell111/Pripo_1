const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const form = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const yearNode = document.querySelector('#year');
const languageSwitcher = document.querySelector('#language-switcher');

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'it', 'de'];
const TRANSLATION_CACHE = new Map();
let currentLanguage = DEFAULT_LANGUAGE;

const getNestedValue = (object, path) => path.split('.').reduce((value, segment) => value?.[segment], object);

const applyTranslations = (translations) => {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      node.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      node.setAttribute('placeholder', value);
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      node.setAttribute('aria-label', value);
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    const key = node.dataset.i18nTitle;
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      document.title = value;
    }
  });

  document.querySelectorAll('[data-i18n-meta-description]').forEach((node) => {
    const key = node.dataset.i18nMetaDescription;
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      node.setAttribute('content', value);
    }
  });
};

const updateMenuToggleLabel = (isOpen, translations) => {
  if (!menuToggle) {
    return;
  }

  const openLabelKey = menuToggle.dataset.i18nOpenLabel;
  const closeLabelKey = menuToggle.dataset.i18nCloseLabel;
  const openLabel = getNestedValue(translations, openLabelKey) || 'Open menu';
  const closeLabel = getNestedValue(translations, closeLabelKey) || 'Close menu';

  menuToggle.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
};

const getTranslations = async (language) => {
  if (TRANSLATION_CACHE.has(language)) {
    return TRANSLATION_CACHE.get(language);
  }

  const response = await fetch(`./lang/${language}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load translations for ${language}.`);
  }

  const translations = await response.json();
  TRANSLATION_CACHE.set(language, translations);
  return translations;
};

const setLanguage = async (language) => {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

  try {
    const translations = await getTranslations(safeLanguage);
    applyTranslations(translations);
    updateMenuToggleLabel(primaryNav?.classList.contains('open') ?? false, translations);

    document.documentElement.lang = safeLanguage;
    currentLanguage = safeLanguage;
    localStorage.setItem('preferredLanguage', safeLanguage);

    if (languageSwitcher) {
      languageSwitcher.value = safeLanguage;
    }
  } catch (error) {
    if (safeLanguage !== DEFAULT_LANGUAGE) {
      await setLanguage(DEFAULT_LANGUAGE);
    }
  }
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));

    const cachedTranslations = TRANSLATION_CACHE.get(currentLanguage) || TRANSLATION_CACHE.get(DEFAULT_LANGUAGE) || {};
    updateMenuToggleLabel(isOpen, cachedTranslations);
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');

      const cachedTranslations = TRANSLATION_CACHE.get(currentLanguage) || TRANSLATION_CACHE.get(DEFAULT_LANGUAGE) || {};
      updateMenuToggleLabel(false, cachedTranslations);
    });
  });
}

if (languageSwitcher) {
  languageSwitcher.addEventListener('change', (event) => {
    setLanguage(event.target.value);
  });
}

if (form && formStatus) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const translations = TRANSLATION_CACHE.get(currentLanguage) || TRANSLATION_CACHE.get(DEFAULT_LANGUAGE) || {};

    if (!form.checkValidity()) {
      formStatus.textContent = getNestedValue(translations, 'form.requiredError') || 'Please complete all required fields.';
      formStatus.style.color = '#b42318';
      return;
    }

    formStatus.textContent = getNestedValue(translations, 'form.success') || 'Thank you. Your request has been received.';
    formStatus.style.color = '#027a48';
    form.reset();
  });
}

const savedLanguage = localStorage.getItem('preferredLanguage') || DEFAULT_LANGUAGE;
setLanguage(savedLanguage);
