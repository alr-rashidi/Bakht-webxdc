(function() {
  const { t, lang, dir } = window.__I18N__;

  // Apply language/dir + all i18n text
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.title = t("html_title");
  const setText = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  setText("t-title", "app_title");
  setText("t-tab-wheel", "tab_wheel");
  setText("t-tab-number", "tab_number");
  setText("t-textarea-label", "textarea_label");
  setText("t-spin", "spin");
  setText("t-pick", "pick");
  setText("t-min-label", "min_label");
  setText("t-max-label", "max_label");
  setText("t-send-chat", "send_to_chat");
  setText("t-result-title", "result_title");
  setText("t-close-1", "close");
  setText("t-close-2", "close");
  setText("t-shared-title", "shared_title");
  document.getElementById("options").placeholder = t("textarea_placeholder");

  const MAX_NUMBER = 1000000000;

  // Tabs
  const tabWheel = document.getElementById("tab-wheel");
  const tabNumber = document.getElementById("tab-number");
  const modeWheel = document.getElementById("mode-wheel");
  const modeNumber = document.getElementById("mode-number");
  const modesContainer = document.getElementById("modes");
  let currentMode = "wheel"; // "wheel" | "number"
  function setMode(m) {
    currentMode = m;
    const isWheel = m === "wheel";
    tabWheel.classList.toggle("active", isWheel);
    tabNumber.classList.toggle("active", !isWheel);
    changePage(isWheel);
    if (isWheel) {
      modeWheel.classList.remove("hide");
      modeNumber.classList.add("hide");
    } else {
      modeWheel.classList.add("hide");
      modeNumber.classList.remove("hide");
    }
  }
  tabWheel.addEventListener("click", () => setMode("wheel"));
  tabNumber.addEventListener("click", () => setMode("number"));

  function changePage(isWheel) {
    modesContainer.style.transform = `translateX(${isWheel ? "25%" : "-25%"})`;
  }

  // Colors
  const COLORS = ["#e5484d", "#3b82f6", "#f5c518", "#22c55e"];

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const SIZE = canvas.width;
  const CX = SIZE / 2,
    CY = SIZE / 2,
    R = SIZE / 2 - 8;

  const textarea = document.getElementById("options");
  const spinBtn = document.getElementById("spin-btn");
  const arrowPoly = document.getElementById("arrow-poly");
  const hint = document.getElementById("hint");
  const sendChat = document.getElementById("send-chat");
  const sendRow = document.getElementById("send-row");

  let options = [];
  let angle = 0;
  let spinning = false;

  function parseOptions() {
    return textarea.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const n = options.length;
    if (n === 0) {
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = "#232732";
      ctx.fill();
      return;
    }
    const slice = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const start = angle + i * slice;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.stroke();

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(start + slice / 2);
      ctx.rotate(Math.PI);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0b0d12";
      const fontSize = Math.max(18, Math.min(34, 260 / Math.max(4, n)));
      ctx.font =
        "700 " +
        fontSize +
        "px -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, 'Vazirmatn', sans-serif";
      const OUTER_PAD = 20;
      const INNER_PAD = 90;
      const startX = -R + OUTER_PAD;
      const maxLen = R - OUTER_PAD - INNER_PAD;
      let label = options[i];
      let m = ctx.measureText(label);
      if (m.width > maxLen) {
        while (
          label.length > 1 &&
          ctx.measureText(label + "…").width > maxLen
        ) {
          label = label.slice(0, -1);
        }
        {
          label = label.slice(0, -1);
        }
        label += "…";
      }
      ctx.fillText(label, startX, 0);
      ctx.restore();
    }
    const twoPi = Math.PI * 2;
    let a = ((-angle % twoPi) + twoPi) % twoPi;
    const idx = Math.floor(a / slice) % n;
    arrowPoly.setAttribute("fill", COLORS[idx % COLORS.length]);
  }

  function updateSpinEnabled() {
    const ok = options.length >= 2 && !spinning;
    spinBtn.disabled = !ok;
    if (options.length < 2 && !spinning) hint.textContent = t("need_more");
    else hint.textContent = "";
  }

  function onOptionsChanged() {
    options = parseOptions();
    draw();
    updateSpinEnabled();
  }

  textarea.addEventListener("input", onOptionsChanged);

  function spin() {
    if (spinning || options.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    textarea.disabled = true;
    sendChat.disabled = true;
    sendRow.classList.add("disabled");
    hint.textContent = "";

    const n = options.length;
    const slice = (Math.PI * 2) / n;
    const targetIdx = Math.floor(Math.random() * n);
    const rand = Math.random() * (slice * 0.7) - slice * 0.35;
    const targetFinal = -(targetIdx * slice + slice / 2) + rand;

    const accelDur = 800,
      peakDur = 1200,
      decelDur = 3000;
    const totalDur = accelDur + peakDur + decelDur;
    const vPeak = 0.022;
    const accelAngle = (vPeak * accelDur) / 2;
    const peakAngle = vPeak * peakDur;
    const decelAngle = (vPeak * decelDur) / 2;
    const baseAngle = accelAngle + peakAngle + decelAngle;
    const startAngle = angle;
    let deltaNeeded = (targetFinal - startAngle) % (Math.PI * 2);
    if (deltaNeeded < 0) deltaNeeded += Math.PI * 2;
    let total = deltaNeeded;
    while (total < baseAngle) total += Math.PI * 2;
    const t0 = performance.now();

    function frame(now) {
      const elapsed = now - t0;
      if (elapsed >= totalDur) {
        angle = startAngle + total;
        draw();
        finishSpin(targetIdx);
        return;
      }
      let traveled;
      if (elapsed < accelDur) {
        traveled = (vPeak * elapsed * elapsed) / (2 * accelDur);
      } else if (elapsed < accelDur + peakDur) {
        const dt = elapsed - accelDur;
        traveled = accelAngle + vPeak * dt;
      } else {
        const dt = elapsed - accelDur - peakDur;
        traveled =
          accelAngle + peakAngle + vPeak * (dt - (dt * dt) / (2 * decelDur));
      }
      const scale = total / baseAngle;
      angle = startAngle + traveled * scale;
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function finishSpin(idx) {
    spinning = false;
    textarea.disabled = false;
    sendChat.disabled = false;
    sendRow.classList.remove("disabled");
    updateSpinEnabled();
    const winner = options[idx];
    showResult(winner);
    if (
      sendChat.checked &&
      window.webxdc &&
      typeof window.webxdc.sendUpdate === "function"
    ) {
      try {
        const payload = { kind: "wheel", options: options.slice(), winner };
        const encoded = encodeURIComponent(
          btoa(unescape(encodeURIComponent(JSON.stringify(payload)))),
        );
        const info = t("info_winner", { name: winner });
        window.webxdc.sendUpdate(
          { payload, info, href: "index.html#result?data=" + encoded },
          info,
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  spinBtn.addEventListener("click", spin);

  // ============ NUMBER MODE ============
  const numMin = document.getElementById("num-min");
  const numMax = document.getElementById("num-max");
  const numDisplay = document.getElementById("number-display");
  const pickBtn = document.getElementById("pick-btn");
  const numHint = document.getElementById("num-hint");
  let picking = false;

  function validRange() {
    const a = parseInt(numMin.value, 10);
    const b = parseInt(numMax.value, 10);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    if (a >= b) return null;
    if (b >= MAX_NUMBER) return null;
    return [a, b];
  }
  function randInt(a, b, current) {
    const cur = Number(current);
    let rand;
    do {
      rand = Math.floor(Math.random() * (b - a + 1)) + a;
    } while (rand === cur);
    return rand;
  }
  function updatePickEnabled() {
    if (numMax.value >= MAX_NUMBER) {
      numMax.value = MAX_NUMBER;
      return;
    }
    const r = validRange();
    pickBtn.disabled = !r || picking;
    if (!r && !picking) numHint.textContent = t("invalid_range");
    else numHint.textContent = "";
  }
  numMin.addEventListener("input", updatePickEnabled);
  numMax.addEventListener("input", updatePickEnabled);

  function pickNumber() {
    const r = validRange();
    if (!r || picking) return;
    picking = true;
    pickBtn.disabled = true;
    numMin.disabled = true;
    numMax.disabled = true;
    sendChat.disabled = true;
    sendRow.classList.add("disabled");
    numHint.textContent = "";

    const [a, b] = r;
    const finalValue = String(randInt(a, b, Number(numDisplay.innerText))).padStart(
      numMax.value.length,
      "0",
    );
    const totalDur = 3200;
    const t0 = performance.now();
    // interval starts fast (~60ms) then slows to ~500ms
    const startInterval = 20;
    const endInterval = 520;
    let last = t0;
    let currentInterval = startInterval;

    numDisplay.style.opacity = "0.35";

    function tick(now) {
      const elapsed = now - t0;
      const p = Math.min(1, elapsed / totalDur);
      // ease-out for interval growth
      const eased = 1 - Math.pow(1 - p, 2.2);
      currentInterval = startInterval + (endInterval - startInterval) * eased;
      // opacity ramps from 0.35 → 1
      numDisplay.style.opacity = String(0.35 + 0.65 * eased);

      if (elapsed >= totalDur) {
        numDisplay.textContent = String(finalValue);
        numDisplay.style.opacity = "1";
        finishPick(finalValue, a, b);
        return;
      }
      if (now - last >= currentInterval) {
        last = now;
        // avoid showing the final value early
        let v = String(randInt(a, b, Number(numDisplay.innerText))).padStart(
          numMax.value.length,
          "0",
        )
        if (v === finalValue && b - a > 0) v = v === a ? b : a;
        numDisplay.textContent = String(v);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  pickBtn.addEventListener("click", pickNumber);

  function finishPick(value, a, b) {
    picking = false;
    numMin.disabled = false;
    numMax.disabled = false;
    sendChat.disabled = false;
    sendRow.classList.remove("disabled");
    updatePickEnabled();
    if (
      sendChat.checked &&
      window.webxdc &&
      typeof window.webxdc.sendUpdate === "function"
    ) {
      try {
        const payload = { kind: "number", min: a, max: b, winner: value };
        const encoded = encodeURIComponent(
          btoa(unescape(encodeURIComponent(JSON.stringify(payload)))),
        );
        const info = t("info_number", { name: String(value) });
        window.webxdc.sendUpdate(
          { payload, info, href: "index.html#result?data=" + encoded },
          info,
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

  // ============ Result modal ============
  const resultModal = document.getElementById("result-modal");
  const resultWinner = document.getElementById("result-winner");
  document
    .getElementById("result-close")
    .addEventListener("click", () => resultModal.classList.remove("open"));
  resultModal.addEventListener("click", (e) => {
    if (e.target === resultModal) resultModal.classList.remove("open");
  });
  function showResult(winner) {
    resultWinner.textContent = winner;
    resultModal.classList.add("open");
  }

  // ============ Shared modal ============
  const sharedModal = document.getElementById("shared-modal");
  const sharedWinner = document.getElementById("shared-winner");
  const sharedOptionsEl = document.getElementById("shared-options");
  const sharedListLabel = document.getElementById("shared-list-label");
  const sharedTryLabel = document.getElementById("t-shared-try");
  document
    .getElementById("shared-close")
    .addEventListener("click", () => closeShared());
  document.getElementById("shared-try").addEventListener("click", () => {
    if (!sharedPayload) return;
    if (sharedPayload.kind === "number") {
      numMin.value = String(sharedPayload.min);
      numMax.value = String(sharedPayload.max);
      setMode("number");
      updatePickEnabled();
    } else {
      textarea.value = sharedPayload.options.join("\n");
      setMode("wheel");
      onOptionsChanged();
    }
    closeShared();
  });
  sharedModal.addEventListener("click", (e) => {
    if (e.target === sharedModal) closeShared();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      resultModal.classList.remove("open");
      closeShared();
    }
  });

  let sharedPayload = null;
  function closeShared() {
    sharedModal.classList.remove("open");
    if (location.hash)
      history.replaceState(null, "", location.pathname + location.search);
  }
  function tryOpenShared() {
    const h = location.hash || "";
    const m = h.match(/^#result\?data=(.+)$/);
    if (!m) return;
    try {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))));
      const data = JSON.parse(json);
      if (!data || typeof data.winner === "undefined") return;
      sharedPayload = data;
      sharedWinner.textContent = String(data.winner);
      sharedOptionsEl.innerHTML = "";
      if (data.kind === "number") {
        sharedListLabel.textContent = t("range_label");
        sharedTryLabel.textContent = t("try_this_range");
        const div = document.createElement("div");
        div.textContent = data.min + " – " + data.max;
        div.setAttribute("dir", "auto");
        sharedOptionsEl.appendChild(div);
      } else if (Array.isArray(data.options)) {
        sharedListLabel.textContent = t("options_label");
        sharedTryLabel.textContent = t("try_these");
        data.options.forEach((o) => {
          const div = document.createElement("div");
          div.textContent = o;
          div.setAttribute("dir", "auto");
          sharedOptionsEl.appendChild(div);
        });
      } else {
        return;
      }
      sharedModal.classList.add("open");
    } catch (e) {
      console.warn("bad shared payload", e);
    }
  }

  // Language selector
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const currentLang = window.__I18N__.lang;
      const options = [
        { code: "fa", name: "فارسی" },
        { code: "en", name: "English" }
      ];
      let html = '<select id="lang-select" class="select">';
      options.forEach(opt => {
        const selected = opt.code === currentLang ? ' selected' : '';
        html += `<option value="${opt.code}"${selected}>${opt.name}</option>`;
      });
      html += '</select>';

      const langModal = document.createElement("div");
      langModal.classList.add("lang-modal")
      langModal.innerHTML = t("lang_title") + ":" + html;

      document.body.appendChild(langModal);

      const selectEl = langModal.querySelector("#lang-select");
      selectEl.focus();

      const handleChange = () => {
        const newLang = selectEl.value;
        if (window.switchLanguage && newLang !== currentLang) {
          window.switchLanguage(newLang);
        }
        document.body.removeChild(langModal);
      };

      selectEl.addEventListener("change", handleChange);

      setTimeout(() => {
        document.addEventListener("click", function closeListener(e) {
          if (!langModal.contains(e.target)) {
            document.body.removeChild(langModal);
            document.removeEventListener("click", closeListener);
          }
        });
      }, 10);
    });
  }

  // Initial
  onOptionsChanged();
  updatePickEnabled();
  tryOpenShared();
  window.addEventListener("hashchange", tryOpenShared);
})();
