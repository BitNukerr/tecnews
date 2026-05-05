const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector("[data-search-form]");
const searchTrigger = document.querySelector("[data-search-trigger]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
const tagClasses = ["tag-blue", "tag-green", "tag-red", "tag-yellow", "tag-purple"];

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    event.preventDefault();
    window.location.href = href;
  });
});

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

function tagClass(index) {
  return tagClasses[index % tagClasses.length];
}

function byline(post) {
  return `${escapeHtml(post.author)} · ${escapeHtml(post.date)}`;
}

function attachPostTracking() {
  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.dataset.boundNavigation === "true") return;
    link.dataset.boundNavigation = "true";
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      event.preventDefault();
      window.location.href = href;
    });
  });

  document.querySelectorAll("[data-track-post]").forEach((link) => {
    link.addEventListener("click", () => {
      tecnewsTrackClick("post", link.dataset.trackPost);
    });
  });

  document.querySelectorAll("[data-track]").forEach((item) => {
    item.addEventListener("click", () => tecnewsTrackClick(item.dataset.track));
  });

  document.querySelectorAll("[data-card-url]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      window.location.href = card.dataset.cardUrl;
    });
  });
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
          (post) => `<a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">
            <span>${escapeHtml(post.category)}</span>
            <strong>${escapeHtml(post.title)}</strong>
          </a>`,
        )
        .join("")
    : `<p>Sem resultados para "${escapeHtml(query)}".</p>`;
  searchResults.classList.add("is-open");
  attachPostTracking();
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

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target) && !searchInput.value.trim()) {
      searchForm.classList.remove("is-open");
      searchResults?.classList.remove("is-open");
    }
  });
}

async function renderHome() {
  const content = await tecnewsLoadContentAsync();
  const posts = content.posts.filter((post) => post.published);
  const heroPosts = posts.filter((post) => post.section === "hero");
  const leadPost = posts.find((post) => post.featured) || heroPosts[0] || posts[0];
  const sideHeroPosts = heroPosts.filter((post) => post.id !== leadPost?.id).slice(0, 2);
  const usedHeroPostIds = new Set([leadPost, ...sideHeroPosts].filter(Boolean).map((post) => post.id));
  const feedPosts = posts.filter((post) => !usedHeroPostIds.has(post.id));

  document.querySelector("[data-newsletter-title]").textContent = content.settings.newsletterTitle;
  document.querySelector("[data-newsletter-text]").textContent = content.settings.newsletterText;

  const trends = document.querySelector("[data-trends]");
  if (content.settings.showTrends) {
    trends.innerHTML = `<span>Em destaque</span>${content.settings.trends
      .filter(Boolean)
      .map((trend) => `<a href="index.html?search=${encodeURIComponent(trend)}" data-track="trend:${escapeHtml(trend)}">${escapeHtml(trend)}</a>`)
      .join("")}`;
    trends.classList.remove("is-hidden");
  } else {
    trends.innerHTML = "";
    trends.classList.add("is-hidden");
  }

  const lead = document.querySelector("[data-lead-story]");
  lead.innerHTML = leadPost
    ? `<a href="${postUrl(leadPost)}" data-track-post="${escapeHtml(leadPost.id)}">
        <img src="${escapeHtml(leadPost.image)}" alt="${escapeHtml(leadPost.imageAlt || leadPost.title)}" />
        <div class="story-overlay">
          <span class="tag tag-blue">${escapeHtml(leadPost.category)}</span>
          <h2>${escapeHtml(leadPost.title)}</h2>
          <p>${escapeHtml(leadPost.summary)}</p>
          <span class="byline">${byline(leadPost)}</span>
        </div>
      </a>`
    : "";

  const sideStories = document.querySelector("[data-side-stories]");
  sideStories.innerHTML = sideHeroPosts
    .map(
      (post, index) => `<article class="story-card">
        <a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
          <span class="tag ${tagClass(index + 1)}">${escapeHtml(post.category)}</span>
          <h2>${escapeHtml(post.title)}</h2>
          <span class="byline">${byline(post)}</span>
        </a>
      </article>`,
    )
    .join("");

  document.querySelector("[data-main-latest-posts]").innerHTML = feedPosts
    .slice(0, 4)
    .map(
      (post, index) => `<a class="horizontal-card latest-post-card" href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">
        <span class="card-image-link">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
        </span>
        <span>
          <span class="tag ${tagClass(index + 2)}">${escapeHtml(post.category)}</span>
          <strong>${escapeHtml(post.title)}</strong>
          <em>${escapeHtml(post.summary)}</em>
          <span class="byline">${byline(post)}</span>
        </span>
      </a>`,
    )
    .join("");

  document.querySelector("[data-review-posts]").innerHTML = posts
    .filter((post) => post.section === "reviews")
    .slice(0, 3)
    .map(
      (post) => `<article class="compact-card clickable-card" data-card-url="${postUrl(post)}">
        <a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
        </a>
        <h3><a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">${escapeHtml(post.title)}</a></h3>
        ${post.score ? `<span class="score">${escapeHtml(post.score)}</span>` : ""}
      </article>`,
    )
    .join("");

  document.querySelector("[data-latest-posts]").innerHTML = posts
    .slice(0, 5)
    .map((post) => `<li><a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">${escapeHtml(post.title)}</a></li>`)
    .join("");

  document.querySelector("[data-deal-posts]").innerHTML = posts
    .filter((post) => post.price)
    .slice(0, 3)
    .map(
      (post) => `<a class="deal" href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">
        <span>
          <strong>${escapeHtml(post.title)}</strong>
          <small>${escapeHtml(post.store || post.category)}</small>
        </span>
        <span>${escapeHtml(post.price)} ${post.oldPrice ? `<s>${escapeHtml(post.oldPrice)}</s>` : ""}</span>
      </a>`,
    )
    .join("");

  document.querySelectorAll("[data-topic-links]").forEach((block) => {
    const category = block.dataset.topicLinks;
    const topicSlug = category === "IA" ? "ia" : category.toLowerCase();
    const matches = tecnewsPostsForTopic(posts, topicSlug).slice(0, 3);

    block.innerHTML = matches
      .map((post) => `<a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">${escapeHtml(post.title)}</a>`)
      .join("");
  });

  document.querySelector(".newsletter form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const analytics = tecnewsLoadAnalytics();
    analytics.newsletterSignups += 1;
    tecnewsSaveAnalytics(analytics);
    event.currentTarget.reset();
    const button = event.currentTarget.querySelector("button");
    button.textContent = "Subscrito";
    window.setTimeout(() => {
      button.textContent = "Subscrever";
    }, 2200);
  });

  attachPostTracking();
  setupSearch(posts);

  const initialSearch = new URLSearchParams(window.location.search).get("search");
  if (initialSearch && searchForm && searchInput) {
    searchForm.classList.add("is-open");
    searchInput.value = initialSearch;
    renderSearchResults(posts, initialSearch);
  }
}

tecnewsTrackPage("home");
renderHome();

if (window.lucide) {
  window.lucide.createIcons();
}
