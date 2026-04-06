// Birds start hidden, fade in after first click
document.querySelectorAll(".sky-birds").forEach(el => {
  el.style.opacity = "0";
  el.style.transition = "opacity 3s ease";
});

// ================================
// AUDIO HELPERS
// ================================

function fadeOut(audio, duration = 1500) {
  if (!audio) return;
  const step = audio.volume / (duration / 50);
  const fade = setInterval(() => {
    if (audio.volume > step) {
      audio.volume -= step;
    } else {
      audio.volume = 0;
      audio.pause();
      audio.currentTime = 0;
      clearInterval(fade);
    }
  }, 50);
}

function fadeIn(audio, targetVolume = 0.5, duration = 1500) {
  if (!audio) return;
  audio.volume = 0;
  audio.play().catch(() => {});
  const step = targetVolume / (duration / 50);
  const fade = setInterval(() => {
    if (audio.volume + step < targetVolume) {
      audio.volume += step;
    } else {
      audio.volume = targetVolume;
      clearInterval(fade);
    }
  }, 50);
}

// ================================
// MISC SOUNDS
// ================================

const bubble = document.getElementById("bubbleSound");

if (bubble) {
  bubble.volume = 0.25;

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      bubble.currentTime = 0;
      bubble.play().catch(() => {});
    });
  });
}

// ================================
// ELEMENT REFS
// ================================

const body = document.body;
const isMainPage = body.classList.contains("home-page");
const toggleButton = document.getElementById("dayNightToggle");
const morningSound = document.getElementById("morningSound");
const nightSound = document.getElementById("nightSound");

// ================================
// INTRO OVERLAY
// ================================

if (isMainPage) {
  const introOverlay = document.getElementById("introOverlay");
  const hasSeenIntro = sessionStorage.getItem("hasSeenIntro") === "true";

  if (hasSeenIntro) {
  body.classList.add("intro-seen");

  document.querySelectorAll(".sky-birds").forEach(el => {
    el.style.opacity = "";
  });

  if (introOverlay) introOverlay.remove();
}

  if (introOverlay && !hasSeenIntro) {
    introOverlay.addEventListener("click", () => {
      introOverlay.classList.add("cleared");
      sessionStorage.setItem("hasSeenIntro", "true");
      body.classList.add("intro-seen");

      const notifSound = document.getElementById("notificationSound");
      if (notifSound) {
        notifSound.currentTime = 0;
        notifSound.play().catch(() => {});
      }

      setTimeout(() => {
        document.querySelectorAll(".sky-birds").forEach(el => {
          el.style.opacity = "";
        });
      }, 400);

      if (!body.classList.contains("night")) {
        fadeIn(morningSound, 0.5, 1500);
      }

      setTimeout(() => {
        introOverlay.remove();
      }, 800);
    }, { once: true });
  }
}


// ================================
// DAY / NIGHT TOGGLE
// ================================

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    body.classList.add("ready");

    const sound = document.getElementById("toggleSound");
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    const isNightNow = body.classList.contains("night");

    if (isNightNow) {
      body.classList.remove("night");
      localStorage.setItem("theme", "day");

      toggleButton.textContent = "Night Mode";
      toggleButton.setAttribute("aria-pressed", "false");

      if (isMainPage) {
        if (nightSound) fadeOut(nightSound, 1500);
        if (morningSound) fadeIn(morningSound, 0.5, 4000);
      }
    } else {
      body.classList.add("night");
      localStorage.setItem("theme", "night");

      toggleButton.textContent = "Day Mode";
      toggleButton.setAttribute("aria-pressed", "true");

      if (isMainPage) {
        randomizeBalloonStart();
        if (morningSound) fadeOut(morningSound, 1500);
        if (nightSound) fadeIn(nightSound, 0.5, 4000);
      }
    }
  });
}

// ================================
// BIRDS
// ================================

function animateBird(selector, speed = 120) {
  const bird = document.querySelector(selector);
  if (!bird) return;

  const frames = bird.querySelectorAll("img");
  if (!frames.length) return;

  let current = 0;

  const interval = setInterval(() => {
    // stop if element is gone
    if (!document.body.contains(bird)) {
      clearInterval(interval);
      return;
    }

    frames[current].classList.remove("active");
    current = (current + 1) % frames.length;
    frames[current].classList.add("active");
  }, speed);
}

function randomizeFlockStart() {
  const flock = document.querySelector(".bird-flock");
  if (!flock) return;
  flock.style.top = (250 + Math.random() * 450) + "px";
}

function randomizeCloseBirdStart() {
  const bird = document.querySelector(".bird-close");
  if (!bird) return;
  bird.style.top = (80 + Math.random() * 350) + "px";
}

const flock = document.querySelector(".bird-flock");
if (flock) {
  randomizeFlockStart();
  flock.addEventListener("animationiteration", randomizeFlockStart);
}

animateBird(".bird-close", 120);
const closeBird = document.querySelector(".bird-close");
if (closeBird) {
  randomizeCloseBirdStart();
  closeBird.addEventListener("animationiteration", randomizeCloseBirdStart);
}

animateBird(".bird-far-1", 260);
animateBird(".bird-far-2", 280);
animateBird(".bird-far-3", 270);
animateBird(".bird-far2-1", 360);
animateBird(".bird-far2-2", 380);
animateBird(".bird-far2-3", 370);


// ================================
// BALLOON RANDOM START
// ================================

let lastBalloonIndex = -1;

function randomizeBalloonStart() {
  const balloon = document.querySelector(".night-balloon-wrap");
  if (!balloon) return;

  const positions = ["8%", "22%", "38%", "56%", "74%", "88%"];
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * positions.length);
  } while (randomIndex === lastBalloonIndex && positions.length > 1);

  lastBalloonIndex = randomIndex;
  balloon.style.left = positions[randomIndex];
}

// ================================
// SCROLL PROMPT
// ================================

const scrollPrompt = document.getElementById("scrollPrompt");

if (scrollPrompt) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      scrollPrompt.classList.add("hidden");
    } else {
      scrollPrompt.classList.remove("hidden");
    }
  }, { passive: true });
}
