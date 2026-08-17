const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");

const DEFAULT_LANG = "English";
const STORAGE_KEY = "selectedLanguage";
let translations = {};
let landscapeAlertShown = false;

function checkScreenSize() {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isMobile && window.innerWidth < 768) {
    if (!landscapeAlertShown) {
      landscapeAlertShown = true;
      alert("Please use Landscape!");
    }
  } else {
    landscapeAlertShown = false;
  }
}

window.addEventListener("load", checkScreenSize);
window.addEventListener("resize", checkScreenSize);


// audio files for each language
const langAudio = {
  English: new Audio("./assets/audio/Eng.mpeg"),
  Hindi: new Audio("./assets/audio/Hin.mpeg"),
  Gujarati: new Audio("./assets/audio/Guj.mpeg"),
};

// preload so play() fires without delay
Object.values(langAudio).forEach((audio) => {
  audio.preload = "auto";
  audio.load();
});

// play the audio for a given language (stops any currently playing one first)
function playLangAudio(lang) {
  Object.values(langAudio).forEach((audio) => {
    audio.pause();
    // only safe to reset currentTime once metadata is loaded
    if (audio.readyState > 0) {
      audio.currentTime = 0;
    }
  });

  const audio = langAudio[lang];
  if (audio) {
    audio.play().catch((err) => console.error("Audio play error:", err));
  }
}

// set active button
function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// apply language
function applyLanguage(lang, playAudio = true) {
  const langData = translations[lang];
  if (!langData) return;

  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");
    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(/\n/g, "<br>");
    }
  });

  localStorage.setItem(STORAGE_KEY, lang);

  if (playAudio) {
    playLangAudio(lang);
  }
}

// detect refresh
function isPageRefresh() {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0) {
    return navEntries[0].type === "reload";
  }
  return performance.navigation.type === 1;
}

// load language
window.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/json/data.json")
    .then((res) => res.json())
    .then((data) => {
      translations = data;

      let langToApply = DEFAULT_LANG;
      const savedLang = localStorage.getItem(STORAGE_KEY);

      if (isPageRefresh()) {
        langToApply = DEFAULT_LANG;
        localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
      } else {
        langToApply = savedLang || DEFAULT_LANG;
      }

      // don't play audio on initial page load, only on manual button clicks
      applyLanguage(langToApply, false);
    })
    .catch((err) => console.error("Error loading translations:", err));
});

// button clicks — each explicitly triggers its own language audio
if (btnEn) {
  btnEn.addEventListener("click", () => {
    applyLanguage("English"); // plays Eng.mpeg
  });
}
if (btnHi) {
  btnHi.addEventListener("click", () => {
    applyLanguage("Hindi"); // plays Hin.mpeg
  });
}
if (btnGu) {
  btnGu.addEventListener("click", () => {
    applyLanguage("Gujarati"); // plays Guj.mpeg
  });
}