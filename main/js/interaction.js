(function () {
  const CONFIGS = window.DRINK_UI_CONFIG || {};
  const controls = document.querySelectorAll(".js-drink-control");

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function toNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function resolveSettings(control, root, range) {
    const variant = control.dataset.variant || root?.dataset.variant || "1200";
    const config = CONFIGS[variant] || {};
    const max = toNumber(config.max, toNumber(control.dataset.max, toNumber(range.max, 100)));
    const initial = clamp(
      toNumber(config.initial, toNumber(control.dataset.value, toNumber(range.value, 0))),
      0,
      max,
    );
    const scale = Array.isArray(config.scale) && config.scale.length === 3
      ? config.scale
      : [max, Math.round(max / 2), 0];
    const thresholds = {
      bottom: clamp(
        toNumber(config.thresholds?.bottom, max * 0.18),
        0,
        max,
      ),
      top: clamp(
        toNumber(config.thresholds?.top, max * 0.55),
        0,
        max,
      ),
    };
    const unit = control.dataset.unit || "ml";

    return { variant, max, initial, scale, thresholds, unit };
  }

  function setArrowToRow(rowEl, arrow) {
    const meta = rowEl.closest(".t-meta");
    if (!meta || !arrow) return;

    const metaRect = meta.getBoundingClientRect();
    const main = rowEl.querySelector(".t-rowMain");
    if (!main) return;

    const mainRect = main.getBoundingClientRect();
    const centerY = (mainRect.top + mainRect.bottom) / 2 - metaRect.top;
    arrow.style.transform = `translateY(${centerY - 7}px)`;
  }

  controls.forEach((control) => {
    const root = control.closest(".t-drinkUI") || control.parentElement;
    const range = control.querySelector(".js-drink-range");
    const liquidMask = root?.querySelector(".js-liquid-mask");
    const mlValue = root?.querySelector(".js-ml-value");
    const mlUnit = root?.querySelector(".js-ml-unit");
    const rowTop = root?.querySelector('.t-row[data-row="top"]');
    const rowBottom = root?.querySelector('.t-row[data-row="bottom"]');
    const arrow = root?.querySelector(".js-meta-arrow");
    const scaleTop = control.querySelector(".js-scale-top");
    const scaleMid = control.querySelector(".js-scale-mid");
    const scaleBottom = control.querySelector(".js-scale-bottom");
    const scaleUnit = control.querySelector(".js-scale-unit");
    const liquidSurface = liquidMask?.querySelector(".t-liquidSurface");

    if (!root || !range || !liquidMask) return;

    const settings = resolveSettings(control, root, range);
    root.dataset.variant = settings.variant;
    control.dataset.variant = settings.variant;
    control.dataset.max = String(settings.max);
    control.dataset.value = String(settings.initial);

    range.max = String(settings.max);
    range.value = String(settings.initial);

    if (scaleTop) scaleTop.textContent = String(settings.scale[0]);
    if (scaleMid) scaleMid.textContent = String(settings.scale[1]);
    if (scaleBottom) scaleBottom.textContent = String(settings.scale[2]);
    if (scaleUnit) scaleUnit.textContent = settings.unit;
    if (mlUnit) mlUnit.textContent = ` ${settings.unit}`;

    function updateFill(value) {
      const fillRatio = clamp(value / settings.max, 0, 1);
      liquidMask.style.setProperty("--fill", `${(fillRatio * 100).toFixed(2)}%`);

      if (liquidSurface) {
        liquidSurface.style.opacity = fillRatio <= 0.01 ? "0" : "0.55";
      }
    }

    function updateText(value) {
      const showBottom = value >= settings.thresholds.bottom;
      const showTop = value >= settings.thresholds.top;

      rowBottom?.classList.toggle("is-visible", showBottom);
      rowTop?.classList.toggle("is-visible", showTop);

      const activeRow = showTop ? rowTop : rowBottom;
      if (activeRow) setArrowToRow(activeRow, arrow);
    }

    function updateUI() {
      const value = clamp(toNumber(range.value, settings.initial), 0, settings.max);
      range.value = String(value);
      control.dataset.value = String(value);

      if (mlValue) mlValue.textContent = String(value);

      updateFill(value);
      updateText(value);
    }

    range.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
      },
      { passive: false },
    );

    let dragging = false;

    function setValueFromPointer(clientY) {
      const rect = range.getBoundingClientRect();
      const progress = clamp((clientY - rect.top) / rect.height, 0, 1);
      const mapped = 1 - progress;
      const min = toNumber(range.min, 0);
      const max = toNumber(range.max, settings.max);
      const value = Math.round(min + mapped * (max - min));

      range.value = String(value);
      updateUI();
    }

    range.addEventListener(
      "pointerdown",
      (event) => {
        dragging = true;
        range.setPointerCapture?.(event.pointerId);
        setValueFromPointer(event.clientY);
        event.preventDefault();
      },
      { passive: false },
    );

    range.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging) return;
        setValueFromPointer(event.clientY);
        event.preventDefault();
      },
      { passive: false },
    );

    function endDrag() {
      dragging = false;
    }

    range.addEventListener("pointerup", endDrag, { passive: true });
    range.addEventListener("pointercancel", endDrag, { passive: true });
    range.addEventListener("lostpointercapture", endDrag, { passive: true });
    range.addEventListener("input", updateUI);
    window.addEventListener("resize", updateUI);

    updateUI();
  });
})();
