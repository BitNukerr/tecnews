const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function postUrl(post) {
  return `#${tecnewsSlugFromTitle(post.title || post.id)}`;
}

function tagClass(index) {
  return tagClasses[index % tagClasses.length];
}

function byline(post) {
  return `${escapeHtml(post.author)} · ${escapeHtml(post.date)}`;
}

function attachPostTracking() {
  document.querySelectorAll("[data-track-post]").forEach((link) => {
    link.addEventListener("click", () => {
      tecnewsTrackClick("post", link.dataset.trackPost);
    });
  });

  document.querySelectorAll("[data-track]").forEach((item) => {
    item.addEventListener("click", () => tecnewsTrackClick(item.dataset.track));
  });
}

function renderHome() {
  const content = tecnewsLoadContent();
  const posts = content.posts.filter((post) => post.published);
  const heroPosts = posts.filter((post) => post.section === "hero");
  const leadPost = posts.find((post) => post.featured) || heroPosts[0] || posts[0];

  document.querySelector("[data-hero-title]").textContent = content.settings.heroTitle;
  document.querySelector("[data-newsletter-title]").textContent = content.settings.newsletterTitle;
  document.querySelector("[data-newsletter-text]").textContent = content.settings.newsletterText;

  const trends = document.querySelector("[data-trends]");
  trends.innerHTML = `<span>Em destaque</span>${content.settings.trends
    .filter(Boolean)
    .map((trend) => `<a href="#" data-track="trend:${escapeHtml(trend)}">${escapeHtml(trend)}</a>`)
    .join("")}`;

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
  sideStories.innerHTML = heroPosts
    .filter((post) => post.id !== leadPost?.id)
    .slice(0, 2)
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

  document.querySelector("[data-promo-posts]").innerHTML = posts
    .filter((post) => post.section === "promocoes")
    .slice(0, 3)
    .map(
      (post, index) => `<article class="horizontal-card">
        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
        <div>
          <span class="tag ${tagClass(index + 3)}">${escapeHtml(post.category)}</span>
          <h3><a href="${postUrl(post)}" data-track-post="${escapeHtml(post.id)}">${escapeHtml(post.title)}</a></h3>
          <p>${escapeHtml(post.summary)}</p>
          <span class="byline">${byline(post)}</span>
        </div>
      </article>`,
    )
    .join("");

  document.querySelector("[data-review-posts]").innerHTML = posts
    .filter((post) => post.section === "reviews")
    .slice(0, 3)
    .map(
      (post) => `<article class="compact-card">
        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" />
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
      (post) => `<article class="deal">
        <div>
          <strong>${escapeHtml(post.title)}</strong>
          <span>${escapeHtml(post.store || post.category)}</span>
        </div>
        <p>${escapeHtml(post.price)} ${post.oldPrice ? `<s>${escapeHtml(post.oldPrice)}</s>` : ""}</p>
      </article>`,
    )
    .join("");

  document.querySelector(".newsletter form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const analytics = tecnewsLoadAnalytics();
    analytics.newsletterSignups += 1;
    tecnewsSaveAnalytics(analytics);
    event.currentTarget.reset();
  });

  attachPostTracking();
}

tecnewsTrackPage("home");
renderHome();

if (window.lucide) {
  window.lucide.createIcons();
}
