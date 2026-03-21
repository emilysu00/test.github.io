window.addEventListener("load", () => {
  console.log("motion page loaded");

  setTimeout(async () => {
    console.log("start printing...");

    try {
      const res = await fetch("http://192.168.1.129:5000/print", {
        method: "POST",
      });

      const data = await res.json();
      console.log("print result:", data);

      if (data.ok) {
        console.log("列印成功");
      } else {
        console.error("列印失敗", data);
      }
    } catch (err) {
      console.error("列印失敗（連不到 Pi）", err);
    }
  }, 30000); // ✅ 30秒
});
