/*!
 * DeflectAI support widget
 * Usage:
 *   <script defer src="https://YOUR-APP.vercel.app/widget.js" data-store-id="STORE_UUID"></script>
 */
(function () {
  "use strict";

  var script =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      return all[all.length - 1];
    })();

  if (!script) return;

  var storeId = script.getAttribute("data-store-id");
  if (!storeId) {
    console.warn("[DeflectAI] Missing data-store-id on the widget script tag.");
    return;
  }
  if (window.__deflectaiWidgetLoaded) return;
  window.__deflectaiWidgetLoaded = true;

  var apiBase =
    script.getAttribute("data-api-base") ||
    (function () {
      try {
        return new URL(script.src, window.location.href).origin;
      } catch {
        return window.location.origin;
      }
    })();

  var config = {
    storeName: "Support",
    brandColor: "#2563eb",
    widgetTitle: "Support & Order Tracking",
    greeting: "Hi! How can I help you today?",
  };

  var history = [];
  var open = false;
  var busy = false;
  var root;
  var els;

  getVisitorId();
  loadConfig();

  function getVisitorId() {
    var key = "deflectai_visitor_" + storeId;
    try {
      var existing = window.localStorage.getItem(key);
      if (existing) {
        config.visitorId = existing;
        return;
      }
      var created =
        "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(key, created);
      config.visitorId = created;
    } catch {
      config.visitorId = "v_anon_" + Date.now().toString(36);
    }
  }

  function loadConfig() {
    fetch(apiBase + "/api/widget/" + encodeURIComponent(storeId))
      .then(function (res) {
        if (!res.ok) throw new Error("config " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && data.storeName) {
          config.storeName = data.storeName;
          config.brandColor = data.brandColor || config.brandColor;
          config.widgetTitle = data.widgetTitle || config.widgetTitle;
          config.greeting = data.greeting || config.greeting;
        }
        build();
      })
      .catch(function () {
        build();
      });
  }

  function build() {
    if (root) return;

    root = document.createElement("div");
    root.setAttribute("data-deflectai-root", "");
    var shadow = root.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = styles(config.brandColor);

    var wrap = document.createElement("div");
    wrap.innerHTML = markup(config);
    shadow.appendChild(style);
    shadow.appendChild(wrap);
    document.body.appendChild(root);

    els = {
      launcher: shadow.querySelector(".dl-launcher"),
      panel: shadow.querySelector(".dl-panel"),
      close: shadow.querySelector(".dl-close"),
      messages: shadow.querySelector(".dl-messages"),
      form: shadow.querySelector(".dl-form"),
      input: shadow.querySelector(".dl-input"),
      send: shadow.querySelector(".dl-send"),
      suggestions: shadow.querySelector(".dl-suggestions"),
    };

    els.launcher.addEventListener("click", toggle);
    els.close.addEventListener("click", function () {
      setOpen(false);
    });
    els.form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = els.input.value;
      els.input.value = "";
      sendMessage(value);
    });

    Array.prototype.forEach.call(
      shadow.querySelectorAll(".dl-chip"),
      function (chip) {
        chip.addEventListener("click", function () {
          sendMessage(chip.getAttribute("data-prompt") || chip.textContent);
        });
      }
    );

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    addAssistantMessage(config.greeting);
  }

  function toggle() {
    setOpen(!open);
  }

  function setOpen(next) {
    open = next;
    if (!els) return;
    if (open) {
      els.panel.classList.add("dl-open");
      els.launcher.classList.add("dl-hidden");
      if (els.suggestions) els.suggestions.classList.remove("dl-hidden");
      window.setTimeout(function () {
        els.input.focus();
      }, 150);
    } else {
      els.panel.classList.remove("dl-open");
      els.launcher.classList.remove("dl-hidden");
    }
  }

  function addUserMessage(text) {
    appendBubble("user", text);
  }

  function addAssistantMessage(text) {
    appendBubble("assistant", text);
  }

  function appendBubble(role, text) {
    if (!els) return;
    var row = document.createElement("div");
    row.className = "dl-row dl-" + role;
    var bubble = document.createElement("div");
    bubble.className = "dl-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    els.messages.appendChild(row);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function showTyping(show) {
    if (!els) return;
    var existing = els.messages.querySelector(".dl-typing");
    if (show) {
      if (existing) return;
      var row = document.createElement("div");
      row.className = "dl-row dl-assistant dl-typing";
      row.innerHTML =
        '<div class="dl-bubble dl-dots"><span class="dl-dot"></span><span class="dl-dot"></span><span class="dl-dot"></span></div>';
      els.messages.appendChild(row);
      els.messages.scrollTop = els.messages.scrollHeight;
    } else if (existing) {
      existing.parentNode.removeChild(existing);
    }
  }

  function sendMessage(rawText) {
    var text = (rawText || "").trim();
    if (!text || busy) return;

    busy = true;
    if (els.send) els.send.disabled = true;
    if (els.suggestions) els.suggestions.classList.add("dl-hidden");

    addUserMessage(text);
    history.push({ role: "user", content: text });
    showTyping(true);

    fetch(apiBase + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: storeId,
        visitorId: config.visitorId,
        messages: history,
      }),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        });
      })
      .then(function (data) {
        showTyping(false);
        var reply =
          (data && data.reply) ||
          "Sorry, I couldn't answer that. Please contact our support team.";
        addAssistantMessage(reply);
        history.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        showTyping(false);
        addAssistantMessage(
          "I'm having trouble connecting right now. Please try again in a moment."
        );
      })
      .then(function () {
        busy = false;
        if (els.send) els.send.disabled = false;
        if (els.input) els.input.focus();
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function markup(cfg) {
    return (
      '<button class="dl-launcher" aria-label="Open support chat">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      "</button>" +
      '<div class="dl-panel" role="dialog" aria-label="Support chat">' +
      '<div class="dl-header">' +
      '<div><div class="dl-title">' +
      escapeHtml(cfg.widgetTitle) +
      '</div><div class="dl-subtitle">' +
      escapeHtml(cfg.storeName) +
      '</div></div>' +
      '<button class="dl-close" aria-label="Close chat">&times;</button>' +
      "</div>" +
      '<div class="dl-messages"></div>' +
      '<div class="dl-suggestions">' +
      '<button class="dl-chip" data-prompt="Where is my order?">Where is my order?</button>' +
      '<button class="dl-chip" data-prompt="What is your return policy?">Return policy</button>' +
      '<button class="dl-chip" data-prompt="How long does shipping take?">Shipping times</button>' +
      "</div>" +
      '<form class="dl-form">' +
      '<input class="dl-input" type="text" placeholder="Type your message…" autocomplete="off" />' +
      '<button class="dl-send" type="submit" aria-label="Send">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
      "</button>" +
      "</form>" +
      "</div>"
    );
  }

  function styles(brand) {
    return (
      ":host{all:initial;}" +
      ".dl-launcher{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border:none;border-radius:50%;background:" +
      brand +
      ";color:#fff;cursor:pointer;box-shadow:0 10px 30px rgba(2,6,23,.28);display:flex;align-items:center;justify-content:center;z-index:2147483000;transition:transform .15s ease;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
      ".dl-launcher:hover{transform:scale(1.06);}" +
      ".dl-launcher.dl-hidden{display:none;}" +
      ".dl-panel{position:fixed;right:20px;bottom:20px;width:378px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 40px);background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(2,6,23,.28);display:none;flex-direction:column;overflow:hidden;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
      ".dl-panel.dl-open{display:flex;}" +
      ".dl-header{background:" +
      brand +
      ";color:#fff;padding:16px 18px;display:flex;align-items:flex-start;justify-content:space-between;}" +
      ".dl-title{font-size:15px;font-weight:600;}" +
      ".dl-subtitle{font-size:12px;opacity:.85;margin-top:2px;}" +
      ".dl-close{background:transparent;border:none;color:#fff;font-size:24px;line-height:1;cursor:pointer;opacity:.85;padding:0 4px;}" +
      ".dl-close:hover{opacity:1;}" +
      ".dl-messages{flex:1;overflow-y:auto;padding:16px;background:#f8fafc;display:flex;flex-direction:column;gap:10px;}" +
      ".dl-row{display:flex;}" +
      ".dl-user{justify-content:flex-end;}" +
      ".dl-assistant{justify-content:flex-start;}" +
      ".dl-bubble{max-width:82%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-word;}" +
      ".dl-user .dl-bubble{background:" +
      brand +
      ";color:#fff;border-bottom-right-radius:4px;}" +
      ".dl-assistant .dl-bubble{background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-bottom-left-radius:4px;}" +
      ".dl-suggestions{display:flex;gap:8px;padding:10px 12px 0;flex-wrap:wrap;background:#f8fafc;}" +
      ".dl-suggestions.dl-hidden{display:none;}" +
      ".dl-chip{background:#fff;border:1px solid #cbd5e1;color:#334155;font-size:12px;padding:6px 10px;border-radius:999px;cursor:pointer;}" +
      ".dl-chip:hover{border-color:" +
      brand +
      ";color:" +
      brand +
      ";}" +
      ".dl-form{display:flex;gap:8px;padding:12px;background:#f8fafc;border-top:1px solid #e2e8f0;}" +
      ".dl-input{flex:1;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;color:#0f172a;background:#fff;}" +
      ".dl-input:focus{border-color:" +
      brand +
      ";}" +
      ".dl-send{width:42px;border:none;border-radius:10px;background:" +
      brand +
      ";color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;}" +
      ".dl-send:disabled{opacity:.6;cursor:default;}" +
      ".dl-dots{display:flex;gap:4px;align-items:center;padding:12px 14px;}" +
      ".dl-dot{width:6px;height:6px;border-radius:50%;background:#94a3b8;display:inline-block;animation:dl-bounce 1.2s infinite ease-in-out;}" +
      ".dl-dot:nth-child(2){animation-delay:.15s;}" +
      ".dl-dot:nth-child(3){animation-delay:.3s;}" +
      "@keyframes dl-bounce{0%,80%,100%{transform:translateY(0);opacity:.5;}40%{transform:translateY(-4px);opacity:1;}}" +
      "@media (max-width:480px){.dl-panel{right:0;bottom:0;width:100vw;height:100vh;max-width:100vw;max-height:100vh;border-radius:0;}}"
    );
  }
})();
