(function () {
  const dict = {
    fa: {
      lang: "fa",
      dir: "rtl",
      app_title: "بخت",
      tab_wheel: "گردونه",
      tab_number: "عدد",
      textarea_label: "گزینه‌ها (هر خط یک گزینه)",
      textarea_placeholder: "برای مثال:\nپیتزا\nکباب\nبرگر",
      spin: "چرخش",
      pick: "انتخاب",
      min_label: "کمینه",
      max_label: "بیشینه",
      send_to_chat: "ارسال نتیجه در گپ",
      result_title: "نتیجه",
      close: "بستن",
      try_these: "آزمودن این گزینه‌ها",
      try_this_range: "آزمودن این بازه",
      shared_title: "نتیجه به اشتراک گذاشته شده",
      winner_label: "برنده",
      options_label: "گزینه‌ها",
      range_label: "بازه",
      need_more: "برای چرخش دست‌کم دو گزینه وارد کنید.",
      invalid_range: "بازه معتبر وارد کنید (کمینه کوچکتر از بیشینه).",
      info_winner: "برنده: {name}",
      info_number: "عدد شانسی: {name}",
      html_title: "بخت — انتخاب شانسی",
      lang_title: "زبان",
    },
    en: {
      lang: "en",
      dir: "ltr",
      app_title: "Bakht",
      tab_wheel: "Wheel",
      tab_number: "Number",
      textarea_label: "Options (one per line)",
      textarea_placeholder: "e.g.\nPizza\nKebab\nBurger",
      spin: "Spin",
      pick: "Pick",
      min_label: "Min",
      max_label: "Max",
      send_to_chat: "Send result to chat",
      result_title: "Result",
      close: "Close",
      try_these: "Try these options",
      try_this_range: "Try this range",
      shared_title: "Shared result",
      winner_label: "Winner",
      options_label: "Options",
      range_label: "Range",
      need_more: "Enter at least two options to spin.",
      invalid_range: "Enter a valid range (min < max).",
      info_winner: "Winner: {name}",
      info_number: "Lucky number: {name}",
      html_title: "Bakht — Lucky Pick",
      lang_title: "Language",
    },
  };

  const STORAGE_KEY = "bakht_language";

  function detectLanguage() {
    // 1. Check saved preference
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && dict[savedLang]) {
      return savedLang;
    }

    // 2. Auto-detect from browser
    const navLang = (navigator.language || "fa").toLowerCase();
    for (const code in dict) {
      if (navLang.startsWith(code) || navLang === code) {
        return code;
      }
    }

    // 3. Default fallback
    return "fa";
  }

  let currentLang = detectLanguage();

  function getI18N() {
    return {
      lang: currentLang,
      dir: dict[currentLang]?.dir || "ltr",
      t: function (key, vars) {
        const langDict = dict[currentLang] || dict.en || {};
        let s = langDict[key] || (dict.en && dict.en[key]) || key;
        if (vars) {
          for (const k in vars) {
            s = s.replace("{" + k + "}", vars[k]);
          }
        }
        return s;
      },
    };
  }

  window.__I18N__ = getI18N();

  // Switch language + save to localStorage
  window.switchLanguage = function (newLang) {
    if (!dict[newLang]) return false;
    
    currentLang = newLang;
    localStorage.setItem(STORAGE_KEY, newLang); // ← Persist choice
    
    window.__I18N__ = getI18N();
    window.location.reload();
    return true;
  };

  // Expose available languages
  window.availableLanguages = Object.keys(dict);
})();
