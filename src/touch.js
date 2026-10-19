// v0.4.4 mobile: touch buttons over the game (DOM overlay), feeding the same Input as the keys; canvas fit to the screen.
// Data-driven: GAME_DATA.touchUI.buttons (position/size/art/pressed art). art null -> placeholder shape.
const TU = "assets/style2/ui/touch/"; // Game Artist art (ui/touch/touch.json). Files are full opacity; opacity is applied here.
GAME_DATA.touchUI = {
  opacity: 0.35,
  // anchor: bl / br / tr (screen corners), x/y = offset from that corner in CSS px. art/pressed: image paths (null -> placeholder shape).
  buttons: [
    { id: "dpad", type: "dpad", anchor: "bl", x: 12, y: 12, w: 144, h: 144, art: TU + "dpad.png",
      pressed: { up: TU + "dpad_pressed_up.png", down: TU + "dpad_pressed_down.png", left: TU + "dpad_pressed_left.png", right: TU + "dpad_pressed_right.png" } },
    { id: "z",    key: "a",    anchor: "br", x: 12, y: 76, w: 72, h: 72, art: TU + "btn_z.png", pressed: TU + "btn_z_pressed.png", label: "Z", round: true },
    { id: "x",    key: "b",    anchor: "br", x: 92, y: 12, w: 72, h: 72, art: TU + "btn_x.png", pressed: TU + "btn_x_pressed.png", label: "X", round: true },
    { id: "menu", key: "menu", anchor: "tr", x: 12, y: 12, w: 48, h: 48, art: TU + "btn_menu.png", pressed: TU + "btn_menu_pressed.png", label: "☰" }
  ]
};
const Touch = {
  enabled: false, els: {},
  isTouch() { try { return (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || "ontouchstart" in window || (navigator.maxTouchPoints | 0) > 0; } catch (e) { return false; } },
  // Fit the 720x528 canvas inside the window, keeping the aspect ratio (portrait and landscape).
  fit(canvas) { if (!canvas || !canvas.style || typeof innerWidth === "undefined") return; const k = Math.min(innerWidth / canvas.width, innerHeight / canvas.height);
    canvas.style.width = Math.floor(canvas.width * k) + "px"; canvas.style.height = Math.floor(canvas.height * k) + "px"; this.scale = k; },
  init(canvas) {
    if (typeof document === "undefined" || !document.createElement) return;
    const fit = () => this.fit(canvas); fit(); window.addEventListener("resize", fit); window.addEventListener("orientationchange", fit);
    // no scroll / pinch zoom / double-tap zoom
    for (const ev of ["touchmove", "gesturestart", "dblclick"]) document.addEventListener(ev, e => { if (!(Input.textSink && e.target && e.target.tagName === "INPUT")) e.preventDefault(); }, { passive: false });
    if (!this.isTouch()) return;
    this.enabled = true; const U = GAME_DATA.touchUI, root = document.createElement("div"); root.id = "touch-ui";
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;touch-action:none;z-index:10;user-select:none;-webkit-user-select:none";
    const bg = src => src ? "url('" + src + "') center/100% 100% no-repeat" : "";
    for (const b of U.buttons) { const el = document.createElement("div"); el.id = "btn-" + b.id;
      for (const src of [b.art].concat(typeof b.pressed === "string" ? [b.pressed] : Object.values(b.pressed || {}))) if (src) { const im = new Image(); im.src = src; } // preload
      const pos = (b.anchor.includes("b") ? "bottom:" : "top:") + b.y + "px;" + (b.anchor.includes("l") ? "left:" : "right:") + b.x + "px;";
      el.style.cssText = "position:absolute;" + pos + "width:" + b.w + "px;height:" + b.h + "px;opacity:" + U.opacity + ";pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;font:bold 22px monospace;color:#1a1423;box-sizing:border-box;" +
        (b.art ? "background:" + bg(b.art) + ";" : "background:#f6f1e4;border:3px solid #1a1423;border-radius:" + (b.round ? "50%" : "10px") + ";");
      if (!b.art) el.textContent = b.type === "dpad" ? "✚" : b.label;
      const show = src => { if (b.art) el.style.background = bg(src || b.art); };
      if (b.type === "dpad") { // one 144px cross: the touch point picks the arm; sliding switches direction, holding keeps walking
        let cur = null; const dirAt = e => { const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          return Math.max(Math.abs(dx), Math.abs(dy)) < r.width / 8 ? null : Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down"); };
        const set = d => { if (d === cur) return; if (cur) Input.release(cur); cur = d; if (d) Input.press(d); show(d && b.pressed ? b.pressed[d] : null); this.dpadDir = d; };
        el.addEventListener("pointerdown", e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} set(dirAt(e)); });
        el.addEventListener("pointermove", e => { if (cur !== null || e.buttons) { e.preventDefault(); set(dirAt(e)); } });
        for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) el.addEventListener(ev, e => { e.preventDefault(); set(null); });
      } else {
        el.addEventListener("pointerdown", e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} Input.press(b.key); show(b.pressed); });
        for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) el.addEventListener(ev, e => { e.preventDefault(); Input.release(b.key); show(null); });
      }
      el.addEventListener("contextmenu", e => e.preventDefault());
      root.appendChild(el); this.els[b.id] = el;
    }
    document.body.appendChild(root);
  }
};
window.Touch = Touch;
