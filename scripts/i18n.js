(function (global) {
  "use strict";

  const STORAGE_KEY = "site_lang";
  const DEFAULT_LANG = "en";
  const SWITCH_FADE_MS = 240;
  const FORCE_DEFAULT_ON_LOAD = true;

  const DICT = Object.freeze({
    en: {
      doc_title: "System Interface",
      intro_hint: "Move to initialize",
      status_system: "SYSTEM",
      status_node: "NODE",
      status_time: "TIME",
      mode_idle: "IDLE",
      nav_about: "01_ABOUT",
      nav_projects: "02_DETAILS",
      nav_payment: "03_PAYMENT",
      nav_contact: "04_CONTACT",
      about_role: "role: Python-JS Developer / Full Stack",
      about_focus: "focus: Automation / Infrastructure / Backend / Frontend",
      about_stack: "Areas: Bots / Parsers / Checkers / Integrations / websites and much more",
      about_approach: "approach: Open-source enthusiast / Continuous learner / Sociable person",
      about_status: "status: 3+ years experience / Available for complex projects",
      project_01_title: "Payment",
      project_01_meta:
        "50% prepayment, remaining 50% after completion of work\n100% prepayment is possible when using collateral or a guarantor\nYou choose the guarantor",
      project_02_title: "Deadlines",
      project_02_meta:
        "Completion — from 4 hours to 1 month\nTerms are determined by the scope and complexity of the task\nExpedited implementation is possible",
      project_03_title: "Support",
      project_03_meta:
        "Support for 14 days after project delivery\nUp to 2 revisions at no additional cost\nSupport at all stages of development",
      project_04_title: "Quality",
      project_04_meta:
        "Adherence to high standards of execution\nUse of current technologies and non-standard solutions",
      project_05_title: "Prices",
      project_05_meta:
        "Cost — from $20 USDT\nPrice is based on the complexity of the project\nWork on small projects to improve reputation is possible",
      project_06_title: "Restrictions",
      project_06_meta:
        "Projects of a “black” nature in the CIS countries are not accepted\nWhen using geoblocking, the source code is not transferred",
      contact_title: "Contacts and Forums",
      contact_lolz: "Lolz",
      contact_lolz_meta:
        "Topic discussions and useful guides\nAnnouncements, services, and experience exchange\nChat with community members",
      contact_github: "GitHub",
      contact_github_meta:
        "Repositories with projects and code examples\nUpdates, fixes, and open work-in-progress\nShowcase of skills and project structure",
      contact_telegram: "Telegram",
      contact_telegram_meta:
        "News and real-time updates\nProject and change announcements\nFast communication and support",
      contact_tg_channel: "Tg Channel",
      contact_tg_channel_meta:
        "Exclusive content and materials\nLeaks of private software and courses, pranks, and behind-the-scenes project info\nDiscount system for regular customers",
      payment_sbp_meta:
        "Global payment system for international transfers\nSupport for fast and secure transactions\nConvenient for different regions and currencies",
      payment_lolzpay_meta:
        "Acceptance and processing of bank card payments\nStable and secure transactions\nSuitable for online services and digital goods",
      payment_cryptobot_meta:
        "Payment tool for working with cryptocurrency\nFast transfers with increased privacy\nTelegram integration and convenient management",
      payment_usdt_meta:
        "Payments using the USDT stablecoin\nFast transactions with minimal delays\nSuitable for mobile and online payments",
      intro_particle_text: "Code as interface",
      lang_toggle_aria: "Switch language",
    },
    ru: {
      doc_title: "Системный интерфейс",
      intro_hint: "Двигай мышью для запуска",
      status_system: "СИСТЕМА",
      status_node: "УЗЕЛ",
      status_time: "ВРЕМЯ",
      mode_idle: "ОЖИДАНИЕ",
      nav_about: "01_ОБО_МНЕ",
      nav_projects: "02_ДЕТАЛИ",
      nav_payment: "03_ОПЛАТА",
      nav_contact: "04_КОНТАКТЫ",
      about_role: "роль: Python-JS разработчик / Full Stack",
      about_focus: "фокус: Автоматизация / Инфраструктура / Бэкенд / Фронтенд",
      about_stack: "Области: Боты / Парсеры / Чекеры / Интеграции / Сайты и многое другое",
      about_approach: "подход: Open-source / Постоянно учусь / Легко общаюсь",
      about_status: "статус: 3+ года опыта / Доступен для сложных проектов",
      project_01_title: "Оплата",
      project_01_meta:
        "Предоплата 50%, оставшиеся 50% после завершения работы\nВозможна 100% предоплата при использовании залога или гаранта\nГаранта выбираете вы",
      project_02_title: "Сроки",
      project_02_meta:
        "Выполнение — от 4 часов до 1 месяца\nСроки зависят от объёма и сложности задачи\nВозможна ускоренная реализация",
      project_03_title: "Поддержка",
      project_03_meta:
        "Поддержка 14 дней после сдачи проекта\nДо 2 правок бесплатно\nПоддержка на всех этапах разработки",
      project_04_title: "Качество",
      project_04_meta:
        "Соблюдение высоких стандартов исполнения\nИспользование актуальных технологий и нестандартных решений",
      project_05_title: "Цены",
      project_05_meta:
        "Стоимость — от $20 USDT\nЦена зависит от сложности проекта\nВозможна работа над небольшими проектами для репутации",
      project_06_title: "Ограничения",
      project_06_meta:
        "Проекты “чёрного” характера в странах СНГ не принимаются\nПри использовании геоблокировки исходный код не передаётся",
      contact_title: "Контакты и форумы",
      contact_lolz: "Lolz",
      contact_lolz_meta:
        "Тематические обсуждения и полезные гайды\nОбъявления, услуги и обмен опытом\nОбщение с участниками сообщества",
      contact_github: "GitHub",
      contact_github_meta:
        "Репозитории с проектами и примерами кода\nОбновления, фиксы и открытые наработки\nДемонстрация навыков и структуры проектов",
      contact_telegram: "Telegram",
      contact_telegram_meta:
        "Новости и апдейты в реальном времени\nАнонсы проектов и изменений\nБыстрая связь и поддержка",
      contact_tg_channel: "ТГ канал",
      contact_tg_channel_meta:
        "Эксклюзивный контент и материалы\nСливы приватных софтов и курсов, розыгрыши и закулисье проектов\nСистема скидок для постоянных клиентов",
      payment_sbp_meta:
        "Глобальная платёжная система для международных переводов\nПоддержка быстрых и безопасных транзакций\nУдобство использования для разных регионов и валют",
      payment_lolzpay_meta:
        "Приём и обработка платежей банковскими картами\nСтабильные и защищённые транзакции\nПодходит для онлайн-сервисов и цифровых услуг",
      payment_cryptobot_meta:
        "Платёжный инструмент для работы с криптовалютой\nБыстрые переводы с повышенной конфиденциальностью\nИнтеграция с Telegram и удобное управление",
      payment_usdt_meta:
        "Расчёты с использованием стейблкоина USDT\nБыстрые транзакции с минимальными задержками\nПодходит для мобильных и онлайн-платежей",
      intro_particle_text: "Код как интерфейс",
      lang_toggle_aria: "Переключить язык",
    },
  });

  function normalizeLang(lang) {
    return lang === "ru" ? "ru" : "en";
  }

  let currentLang = null;
  let switchTimer = null;

  function getLang() {
    if (currentLang) return currentLang;
    const saved = (() => {
      if (FORCE_DEFAULT_ON_LOAD) return null;
      try {
        return global.localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();
    currentLang = normalizeLang(saved || DEFAULT_LANG);
    return currentLang;
  }

  function t(key) {
    const lang = getLang();
    return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  }

  function modeForSection(sectionId) {
    const lang = getLang();
    const map = {
      about: lang === "ru" ? "ОБО_МНЕ" : "ABOUT",
      projects: lang === "ru" ? "ДЕТАЛИ" : "DETAILS",
      payment: lang === "ru" ? "ОПЛАТА" : "PAYMENT",
      contact: lang === "ru" ? "КОНТАКТЫ" : "CONTACT",
    };
    return map[sectionId] || String(sectionId || "").toUpperCase();
  }

  function applyI18nToDom() {
    const lang = getLang();
    document.documentElement.setAttribute("lang", lang);
    document.title = t("doc_title");

    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    const listNodes = document.querySelectorAll("[data-i18n-list]");
    listNodes.forEach((el) => {
      const key = el.getAttribute("data-i18n-list");
      if (!key) return;
      const raw = String(t(key) ?? "");
      const items = raw
        .split("\n")
        .map((s) => s.replace(/^\s*•\s*/, "").trim())
        .filter(Boolean);

      el.textContent = "";
      for (const item of items) {
        const li = document.createElement("li");
        li.textContent = item;
        el.appendChild(li);
      }
    });

    const toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.setAttribute("aria-label", t("lang_toggle_aria"));
      toggle.innerHTML =
        lang === "ru"
          ? '<span class="lang-pill is-active">RU</span><span class="lang-pill">EN</span>'
          : '<span class="lang-pill">RU</span><span class="lang-pill is-active">EN</span>';
    }
  }

  function setLang(lang) {
    const next = normalizeLang(lang);
    if (switchTimer) {
      clearTimeout(switchTimer);
      switchTimer = null;
    }

    const prev = getLang();
    currentLang = next;

    try {
      global.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }

    if (document.body) {
      document.body.classList.add("is-lang-switching");
    }

    // If language didn't change, just refresh DOM without animation.
    if (prev === next) {
      applyI18nToDom();
      if (document.body) document.body.classList.remove("is-lang-switching");
      return;
    }

    switchTimer = setTimeout(() => {
      applyI18nToDom();
      // Let the new text render, then fade it in.
      requestAnimationFrame(() => {
        if (document.body) document.body.classList.remove("is-lang-switching");
      });
      switchTimer = null;
    }, SWITCH_FADE_MS);
  }

  function toggleLang() {
    const next = getLang() === "ru" ? "en" : "ru";
    setLang(next);
  }

  function init() {
    const toggle = document.getElementById("langToggle");
    if (toggle) toggle.addEventListener("click", toggleLang);
    applyI18nToDom();
  }

  global.SystemI18n = Object.freeze({
    t,
    getLang,
    setLang,
    toggleLang,
    modeForSection,
    init,
  });
})(window);


