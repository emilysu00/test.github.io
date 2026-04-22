document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const printSet = body.dataset.printSet;
  const video = document.querySelector("video");

  if (!video) {
    console.warn("[print] no video found");
    return;
  }

  if (!printSet) {
    console.warn("[print] missing data-print-set on body");
    return;
  }

  let hasTriggered = false;

  async function triggerPrint() {
    if (hasTriggered) return;
    hasTriggered = true;

    try {
      const res = await fetch("http://raspberrypi.local:5000/print", {
        method: "POST",
      });

      const data = await res.json();
      console.log("[print] result:", data);

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "print failed");
      }
    } catch (err) {
      console.error("[print] failed:", err);
    }
  }

  video.addEventListener("timeupdate", () => {
    if (!video.duration || !isFinite(video.duration)) return;

    const remaining = video.duration - video.currentTime;
    if (remaining <= 3) {
      triggerPrint();
    }
  });

  video.addEventListener("ended", triggerPrint);

  video.addEventListener("error", () => {
    console.warn("[print] video error, skipping print trigger");
  });
});
