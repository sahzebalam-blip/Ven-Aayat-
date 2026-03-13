document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const introScreen = document.getElementById("introScreen");
  const introVideo = document.getElementById("introVideo");
  const skipIntroBtn = document.getElementById("skipIntroBtn");

  if (!introScreen) return;

  body.classList.add("intro-active");

  let introClosed = false;

  function closeIntro() {
    if (introClosed) return;
    introClosed = true;

    introScreen.classList.add("hidden");
    body.classList.remove("intro-active");

    setTimeout(() => {
      introScreen.style.display = "none";
    }, 800);
  }

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener("click", closeIntro);
  }

  if (introVideo) {
    introVideo.addEventListener("ended", closeIntro);
    introVideo.addEventListener("error", closeIntro);

    setTimeout(closeIntro, 10000);
  } else {
    closeIntro();
  }
});