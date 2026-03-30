document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("video");
  if (!video) {
    console.warn("[motion-return] No <video> found on this page.");
    return;
  }

  let redirectTimer = null;
  let hasScheduledRedirect = false;

  function scheduleReturn() {
    if (hasScheduledRedirect) return;
    hasScheduledRedirect = true;

    console.log("[motion-return] Video ended. Returning to pre.html in 30 seconds...");

    redirectTimer = window.setTimeout(() => {
      window.location.href = "../pre.html";
    }, 30000);
  }

  video.addEventListener("ended", scheduleReturn);

  window.addEventListener("beforeunload", () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
  });
});
