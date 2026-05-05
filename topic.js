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

function byline(post) {
  return `${escapeHtml(post.author)} · ${escapeHtml(post.date)}`;
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
          (post) => `<a href="${tecnewsPostUrl(post)}">
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

function attachCardNavigation() {
  document.querySelectorAll("[data-card-url]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      window.location.href = card.dataset.cardUrl;
    });
  });
}

async function renderTopic() {
  const content = await tecnewsLoadContentAsync();
  const posts = content.posts.filter((post) => post.published);
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("topic") || "guias";
  const topic = tecnewsTopicForSlug(slug);
  const topicPosts = tecnewsPostsForTopic(posts, slug);
  const root = document.querySelector("[data-topic-root]");

  document.title = `${topic.label} - Tecnews.pt`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", topic.description);
  document.querySelector(`[data-topic-nav="${slug}"]`)?.classList.add("is-current");
  tecnewsTrackPage(`topic:${slug}`);

  const lead = topicPosts[0];
  const remaining = topicPosts.slice(1);

  root.innerHTML = `<section class="topic-shell">
    <header class="topic-hero">
      <p class="eyebrow">Secção</p>
      <h1>${escapeHtml(topic.label)}</h1>
      <p>${escapeHtml(topic.description)}</p>
    </header>

    ${
      lead
        ? `<article class="topic-lead">
            <a href="${tecnewsPostUrl(lead)}">
              <img src="${escapeHtml(lead.image)}" alt="${escapeHtml(lead.imageAlt || lead.title)}" />
              <div>
                <span class="tag tag-blue">${escapeHtml(lead.category)}</span>
                <h2>${escapeHtml(lead.title)}</h2>
                <p>${escapeHtml(lead.summary)}</p>
                <span class="byline">${byline(lead)}</span>
              </div>
            </a>
          </article>`
        : ""
    }

    <div class="topic-results">
      ${remaining
        .map(
          (post) => `<article class="topic-result-card clickable-card" data-card-url="${tecnewsPostUrl(post)}">
            <a class="card-image-link" href="${tecnewsPostUrl(post)}">
              <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
            </a>
            <div>
              <span class="tag tag-green">${escapeHtml(post.category)}</span>
              <h2><a href="${tecnewsPostUrl(post)}">${escapeHtml(post.title)}</a></h2>
              <p>${escapeHtml(post.summary)}</p>
              <span class="byline">${byline(post)}</span>
            </div>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;

  setupSearch(posts);
  attachCardNavigation();
}

renderTopic();

if (window.lucide) {
  window.lucide.createIcons();
}
