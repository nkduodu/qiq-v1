const { estimatePrice } = require("./pricing");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
    }

  const { message, session, lang } = JSON.parse(event.body || "{}");
  const s = session || { step: "chooseType", details: {} };
  const m = (message || "").toLowerCase();

  // Step 1: Choose insurance type
  if (s.step === "chooseType") {
    if (["auto","car","motor"].includes(m)) s.type = "auto";
    else if (["home","house"].includes(m)) s.type = "home";
    else if (["life","vie"].includes(m)) s.type = "life";
    else if (["health","santé","sante"].includes(m)) s.type = "health";
    else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: lang === "fr"
            ? "Choisissez: Auto, Maison, Vie ou Santé."
            : "Please choose: Auto, Home, Life or Health.",
          session: s
        })
      };
    }

    s.step = "collect1";

    const q = {
      auto: { en: "What is the vehicle value in GHS?", fr: "Quelle est la valeur du véhicule en GHS ?" },
      home: { en: "What is the property value in GHS?", fr: "Quelle est la valeur du bien en GHS ?" },
      life: { en: "What coverage amount do you want in GHS?", fr: "Quel montant de couverture souhaitez-vous en GHS ?" },
      health: { en: "How many people do you want to cover?", fr: "Combien de personnes souhaitez-vous couvrir ?" }
    }[s.type];

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: q[lang] || q.en, session: s })
    };
  }

  // Step 2: Collect first detail
  if (s.step === "collect1") {
    s.details.first = message;
    s.step = "collect2";

    let q;
    if (s.type === "auto") q = { en: "Is it private or commercial use?", fr: "Usage privé ou commercial ?" };
    else if (s.type === "home") q = { en: "Is this your primary residence?", fr: "Est-ce votre résidence principale ?" };
    else if (s.type === "life") q = { en: "What is your age?", fr: "Quel est votre âge ?" };
    else if (s.type === "health") q = { en: "Do you prefer OPD only or OPD + inpatient?", fr: "Préférez-vous seulement OPD ou OPD + hospitalisation ?" };

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: q[lang] || q.en, session: s })
    };
  }

  // Step 3: Collect second detail
  if (s.step === "collect2") {
    s.details.second = message;
    s.step = "done";

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: lang === "fr"
          ? "Merci. Je calcule vos devis..."
          : "Thanks. Let me calculate your quotes...",
        session: s
      })
    };
  }

  // Step 4: Reset
  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: lang === "fr"
        ? "Tapez un nouveau type d’assurance pour recommencer."
        : "Type a new insurance type to start again.",
      session: { step: "chooseType", details: {} }
    })
  };
};
