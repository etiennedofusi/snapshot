(function () {
  var shopId = document.currentScript.getAttribute("data-shop-id");
  if (!shopId) return;

  var baseUrl =
    document.currentScript.getAttribute("data-base-url") ||
    "https://snapshop.app";

  // Button
  var btn = document.createElement("button");
  btn.innerHTML = "Commander";
  btn.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:9999;background:#22c55e;color:#fff;border:none;border-radius:50px;padding:14px 28px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.15);font-family:system-ui,sans-serif;transition:transform 0.15s";
  btn.onmouseenter = function () {
    btn.style.transform = "scale(1.05)";
  };
  btn.onmouseleave = function () {
    btn.style.transform = "scale(1)";
  };
  document.body.appendChild(btn);

  // Overlay
  var overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:10000;display:none;background:rgba(0,0,0,0.4)";

  // Iframe container
  var container = document.createElement("div");
  container.style.cssText =
    "position:fixed;bottom:0;right:0;z-index:10001;width:100%;max-width:420px;height:90vh;max-height:700px;display:none;border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -4px 20px rgba(0,0,0,0.2)";

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/widget/" + shopId;
  iframe.style.cssText = "width:100%;height:100%;border:none";
  container.appendChild(iframe);

  document.body.appendChild(overlay);
  document.body.appendChild(container);

  var open = false;
  function toggle() {
    open = !open;
    container.style.display = open ? "block" : "none";
    overlay.style.display = open ? "block" : "none";
    btn.innerHTML = open ? "✕ Fermer" : "Commander";
  }

  btn.onclick = toggle;
  overlay.onclick = toggle;
})();
