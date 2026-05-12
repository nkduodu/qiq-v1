async function loadComparison() {
  const products = await fetch("./data/curated/insurance-products.json").then(r => r.json());
  const insurers = products.filter(p => (p.role || "insurer") !== "broker");
  const brokers = products.filter(p => p.role === "broker");

  const insurerEl = document.getElementById("insurer-list");
  const brokerEl = document.getElementById("broker-list");

  insurers.forEach(p => {
    const div = document.createElement("div");
    div.className = "message bot";
    div.innerHTML = `<strong>${p.insurer}</strong> – ${p.product} (${p.type})`;
    insurerEl.appendChild(div);
  });

  brokers.forEach(p => {
    const div = document.createElement("div");
    div.className = "message bot";
    div.innerHTML = `<strong>${p.insurer}</strong> – ${p.product} (${p.type})`;
    brokerEl.appendChild(div);
  });
}

loadComparison();
