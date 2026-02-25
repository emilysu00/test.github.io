(function () {
  const range = document.getElementById("drinkRange");
  const mlValue = document.getElementById("mlValue");
  const liquidMask = document.getElementById("liquidMask");
  const liquidSvg = document.getElementById("liquidSvg");

  const rowTop = document.querySelector('.t-row[data-row="top"]');
  const rowBottom = document.querySelector('.t-row[data-row="bottom"]');
  const arrow = document.getElementById("metaArrow");

  if (!range || !liquidMask || !liquidSvg) return;

  // ✅ 查一次就好
  const liquidSurface = liquidMask.querySelector(".t-liquidSurface");

  // ----- helpers -----
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function setArrowToRow(rowEl) {
    const meta = rowEl.closest(".t-meta");
    if (!meta) return;

    const metaRect = meta.getBoundingClientRect();
    const main = rowEl.querySelector(".t-rowMain");
    if (!main) return;

    const mainRect = main.getBoundingClientRect();
    const centerY = (mainRect.top + mainRect.bottom) / 2 - metaRect.top;
    if (arrow) arrow.style.transform = `translateY(${centerY - 7}px)`;
  }

  // ✅ 修正：真正更新 fill + surface
  function updateFill(ml) {
    const t = clamp(ml / 1200, 0, 1);
    liquidMask.style.setProperty("--fill", `${(t * 100).toFixed(2)}%`);

    // 空杯就不顯示波浪
    if (liquidSurface) {
      liquidSurface.style.opacity = t <= 0.01 ? "0" : "0.55";
    }
  }

  function updateText(ml) {
    const t = ml / 1200;
    const showBottom = t >= 0.18;
    const showTop = t >= 0.55;

    rowBottom?.classList.toggle("is-visible", showBottom);
    rowTop?.classList.toggle("is-visible", showTop);

    const active = t >= 0.55 ? rowTop : rowBottom;
    if (active) setArrowToRow(active);
  }

  function updateUI() {
    const ml = Number(range.value);
    if (mlValue) mlValue.textContent = ml;

    updateFill(ml);
    updateText(ml);
  }

  // ----- prevent scroll fighting (only while interacting) -----
  range.addEventListener("wheel", (e) => e.preventDefault(), {
    passive: false,
  });

  // ----- custom vertical drag mapping -----
  let dragging = false;

  function setValueFromPointer(clientY) {
    const rect = range.getBoundingClientRect();
    const p = clamp((clientY - rect.top) / rect.height, 0, 1);

    // 上方 max、下方 min
    const tt = 1 - p;
    const min = Number(range.min || 0);
    const max = Number(range.max || 1200);
    const v = Math.round(min + tt * (max - min));

    range.value = String(v);
    updateUI();
  }

  range.addEventListener(
    "pointerdown",
    (e) => {
      dragging = true;
      range.setPointerCapture?.(e.pointerId);

      setValueFromPointer(e.clientY);
      e.preventDefault();
    },
    { passive: false },
  );

  range.addEventListener(
    "pointermove",
    (e) => {
      if (!dragging) return;
      setValueFromPointer(e.clientY);
      e.preventDefault();
    },
    { passive: false },
  );

  function endDrag() {
    dragging = false;
  }

  range.addEventListener("pointerup", endDrag, { passive: true });
  range.addEventListener("pointercancel", endDrag, { passive: true });
  range.addEventListener("lostpointercapture", endDrag, { passive: true });

  // init
  window.addEventListener("load", () => {
    updateUI();
    window.addEventListener("resize", updateUI);
  });

  // keyboard / click jump still works
  range.addEventListener("input", updateUI);
})();
