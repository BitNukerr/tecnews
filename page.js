const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

const pages = {
  sobre: {
    title: "Sobre",
    eyebrow: "Tecnews.pt",
    body: [
      "A Tecnews.pt é uma publicação portuguesa dedicada a tecnologia útil: smartphones, inteligência artificial, gaming, reviews, promoções e guias de compra.",
      "O objetivo editorial é simples: explicar o que interessa, cortar ruído e ajudar leitores a tomar melhores decisões.",
    ],
  },
  contactos: {
    title: "Contactos",
    eyebrow: "Fala connosco",
    body: [
      "Para sugestões editoriais, correções ou novidades de produto, usa editorial@tecnews.pt.",
      "Para assuntos gerais, parcerias e pedidos comerciais, a equipa responde através de parcerias@tecnews.pt.",
    ],
  },
  publicidade: {
    title: "Publicidade",
    eyebrow: "Parcerias",
    body: [
      "A Tecnews.pt aceita propostas comerciais alinhadas com tecnologia, consumo, mobilidade, gaming e serviços digitais.",
      "Todos os formatos patrocinados devem ser identificados de forma clara para preservar a confiança dos leitores.",
    ],
  },
  privacidade: {
    title: "Privacidade",
    eyebrow: "Política",
    body: [
      "Esta versão inicial usa apenas armazenamento local do navegador para guardar preferências, posts da demo e métricas simples.",
      "Numa versão final com backend, a política será atualizada com detalhes sobre cookies, analytics, newsletter e direitos dos utilizadores.",
    ],
  },
};

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPage() {
  const slug = new URLSearchParams(window.location.search).get("page") || "sobre";
  const page = pages[slug] || pages.sobre;
  const root = document.querySelector("[data-info-root]");

  document.title = `${page.title} - Tecnews.pt`;
  tecnewsTrackPage(`page:${slug}`);

  root.innerHTML = `<section class="info-shell">
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.title)}</h1>
    <div>
      ${page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>
    <a class="back-link" href="index.html">Voltar ao início</a>
  </section>`;
}

renderPage();

if (window.lucide) {
  window.lucide.createIcons();
}
