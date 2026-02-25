document.addEventListener("keydown", function (e) {
  // Avoid toggling while typing in form fields
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key.toLowerCase() === "g") {
    document.body.classList.toggle("debug");
    console.log(
      "Grid Debug:",
      document.body.classList.contains("debug") ? "ON" : "OFF"
    );
  }
});
