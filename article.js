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

function paragraphsFor(post) {
  return String(post.body || post.summary)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function readingTimeFor(post, paragraphs) {
  const words = [post.title, post.summary, ...paragraphs].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

function updateMeta(name, content, attribute = "name") {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.append(tag);
  }
  tag.setAttribute("content", content);
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

async function copyCurrentUrl(button) {
  await navigator.clipboard?.writeText(window.location.href);
  const label = button.querySelector("span");
  if (label) label.textContent = "Copiado";
}

async function renderArticle() {
  const root = document.querySelector("[data-article-root]");
  const content = await tecnewsLoadContentAsync();
  const posts = content.posts.filter((post) => post.published);
  const params = new URLSearchParams(window.location.search);
  const post = posts.find((item) => item.id === params.get("id")) || posts[0];

  if (!post) {
    root.innerHTML = `<section class="article-shell"><h1>Artigo indisponivel</h1><p>Volta a homepage para veres as ultimas noticias.</p></section>`;
    return;
  }

  document.title = `${post.title} - Tecnews.pt`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", post.summary);
  updateMeta("og:title", `${post.title} - Tecnews.pt`, "property");
  updateMeta("og:description", post.summary, "property");
  updateMeta("og:image", post.image, "property");
  updateMeta("twitter:card", "summary_large_image");
  tecnewsTrackPage("article");
  tecnewsTrackClick("article-view", post.id);

  const postIndex = posts.findIndex((item) => item.id === post.id);
  const articleParagraphs = paragraphsFor(post);
  const readingTime = readingTimeFor(post, articleParagraphs);
  const related = posts
    .filter((item) => item.id !== post.id && item.category === post.category)
    .concat(posts.filter((item) => item.id !== post.id && item.category !== post.category))
    .slice(0, 3);
  const nextPost = posts[(postIndex + 1) % posts.length];

  root.innerHTML = `<article class="article-shell article-premium">
    <a class="back-link" href="index.html"><i data-lucide="arrow-left"></i>Voltar ao inicio</a>
    <header class="article-header">
      <div class="article-kicker">
        <span class="tag tag-blue">${escapeHtml(post.category)}</span>
        <span>${readingTime} min de leitura</span>
      </div>
      <h1>${escapeHtml(post.title)}</h1>
      <p>${escapeHtml(post.summary)}</p>
      <div class="article-meta">
        <span class="author-mark">${escapeHtml(post.author.slice(0, 1))}</span>
        <span><strong>${escapeHtml(post.author)}</strong><small>${escapeHtml(post.date)}</small></span>
      </div>
    </header>
    <figure class="article-figure">
      <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
      ${post.imageAlt ? `<figcaption>${escapeHtml(post.imageAlt)}</figcaption>` : ""}
    </figure>
    <div class="article-reading-layout">
      <aside class="article-tools" aria-label="Ferramentas do artigo">
        <button type="button" data-share-article><i data-lucide="share-2"></i><span>Partilhar</span></button>
        <button type="button" data-copy-link><i data-lucide="link"></i><span>Copiar link</span></button>
      </aside>
      <div class="article-body">
        ${articleParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
    </div>
    <aside class="related-posts">
      <h2>Continuar a ler</h2>
      <div>
        ${related
          .map(
            (item) => `<a class="related-card" href="${postUrl(item)}">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}" />
              <span>${escapeHtml(item.category)}</span>
              <strong>${escapeHtml(item.title)}</strong>
            </a>`,
          )
          .join("")}
      </div>
    </aside>
    ${
      nextPost && nextPost.id !== post.id
        ? `<a class="next-article" href="${postUrl(nextPost)}">
            <span>Proximo artigo</span>
            <strong>${escapeHtml(nextPost.title)}</strong>
          </a>`
        : ""
    }
  </article>`;

  setupSearch(posts);
  document.querySelector("[data-copy-link]")?.addEventListener("click", (event) => copyCurrentUrl(event.currentTarget));
  document.querySelector("[data-share-article]")?.addEventListener("click", async (event) => {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.summary, url: window.location.href });
    } else {
      await copyCurrentUrl(event.currentTarget);
    }
  });
  window.lucide?.createIcons();
}

renderArticle();
