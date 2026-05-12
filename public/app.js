let lang = localStorage.getItem("qiq-lang") || "en";
let dict = {};
let session = { step: "chooseType", details: {} };

async function loadLang() {
  dict = await fetch(`./i18n/${lang}.json`).then(r => r.json());
  applyTranslations();
}

function t(key) { return dict[key] || key; }

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

const langSelect = document.getElementById("lang-toggle");
if (langSelect) {
  langSelect.value = lang;
  langSelect.onchange = async e => {
    lang = e.target.value;
    localStorage.setItem("qiq-lang", lang);
    await loadLang();
  };
}

const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, from) {
  const div = document.createElement("div");
  div.className = `message ${from}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  if (!input.value.trim()) return;
  const msg = input.value.trim();
  addMessage(msg, "user");
  input.value = "";

  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, session, lang })
  });
  const data = await res.json();
  session = data.session;

  if (Array.isArray(data.quotes)) {
    renderQuotes(data.quotes);
  }
  if (data.reply) addMessage(data.reply, "bot");
}

function renderQuotes(quotes) {
  const container = document.getElementById("quotes");
  container.innerHTML = "";
  quotes.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote-card";
    div.innerHTML = `
      <strong>${q.insurer}</strong> – ${q.product}<br/>
      <small>${q.type}</small><br/>
      <span>${q.price}</span>
    `;
    container.appendChild(div);
  });
}

if (sendBtn) {
  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
}

loadLang().then(() => {
  if (chatWindow) {
    addMessage(
      t("welcome") || "Welcome to QiQ! Auto, Home, Life or Health?",
      "bot"
    );
  }
});
