const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector("[data-search-form]");
const searchTrigger = document.querySelector("[data-search-trigger]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

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

function postUrl(post) {
  return tecnewsPostUrl(post);
}

function byline(post) {
  return `${escapeHtml(post.author)} · ${escapeHtml(post.date)}`;
}

function paragraphsFor(post) {
  return String(post.body || post.summary)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function renderSearchResults(posts, query) {
  if (!searchResults) return;
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    searchResults.innerHTML = "";
    searchResults.classList.remove("is-open");
    return;
  }

  const matches = posts
    .filter((post) => `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 5);

  searchResults.innerHTML = matches.length
    ? matches
        .map(
          (post) => `<a href="${postUrl(post)}">
            <span>${escapeHtml(post.category)}</span>
            <strong>${escapeHtml(post.title)}</strong>
          </a>`,
        )
        .join("")
    : `<p>Sem resultados para "${escapeHtml(query)}".</p>`;
  searchResults.classList.add("is-open");
}

function setupSearch(posts) {
  if (!searchForm || !searchInput || !searchTrigger) return;

  searchTrigger.addEventListener("click", () => {
    searchForm.classList.add("is-open");
    searchInput.focus();
  });

  searchInput.addEventListener("input", () => renderSearchResults(posts, searchInput.value));

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchForm.classList.add("is-open");
    searchInput.focus();
    renderSearchResults(posts, searchInput.value);
  });
}

async function renderArticle() {
  const root = document.querySelector("[data-article-root]");
  const content = await tecnewsLoadContentAsync();
  const posts = content.posts.filter((post) => post.published);
  const params = new URLSearchParams(window.location.search);
  const post = posts.find((item) => item.id === params.get("id")) || posts[0];

  if (!post) {
    root.innerHTML = `<section class="article-shell"><h1>Artigo indisponível</h1><p>Volta à homepage para veres as últimas notícias.</p></section>`;
    return;
  }

  document.title = `${post.title} - Tecnews.pt`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", post.summary);
  tecnewsTrackPage("article");
  tecnewsTrackClick("article-view", post.id);

  const related = posts.filter((item) => item.id !== post.id).slice(0, 3);

  root.innerHTML = `<article class="article-shell">
    <a class="back-link" href="index.html">Voltar ao início</a>
    <header class="article-header">
      <span class="tag tag-blue">${escapeHtml(post.category)}</span>
      <h1>${escapeHtml(post.title)}</h1>
      <p>${escapeHtml(post.summary)}</p>
      <span class="byline">${byline(post)}</span>
    </header>
    <figure class="article-figure">
      <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
    </figure>
    <div class="article-body">
      ${paragraphsFor(post)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("")}
    </div>
    <aside class="related-posts">
      <h2>Continuar a ler</h2>
      <div>
        ${related
          .map(
            (item) => `<a href="${postUrl(item)}">
              <span>${escapeHtml(item.category)}</span>
              <strong>${escapeHtml(item.title)}</strong>
            </a>`,
          )
          .join("")}
      </div>
    </aside>
  </article>`;

  setupSearch(posts);
}

renderArticle();

if (window.lucide) {
  window.lucide.createIcons();
}
