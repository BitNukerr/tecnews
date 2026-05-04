const content = tecnewsLoadContent();
const ADMIN_PASSWORD = "tecnews2026";
const ADMIN_SESSION_KEY = "tecnews-admin-session-v1";
const postForm = document.querySelector("[data-post-form]");
const settingsForm = document.querySelector("[data-settings-form]");
const postList = document.querySelector("[data-post-list]");
const formTitle = document.querySelector("[data-form-title]");
const loginScreen = document.querySelector("[data-login-screen]");
const loginForm = document.querySelector("[data-login-form]");
const adminApp = document.querySelector("[data-admin-app]");

function adminEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function blankPost() {
  return {
    id: "",
    title: "",
    summary: "",
    category: "",
    author: "",
    date: "Hoje",
    image: "",
    imageAlt: "",
    section: "hero",
    score: "",
    store: "",
    price: "",
    oldPrice: "",
    featured: false,
    published: true,
  };
}

function fillPostForm(post) {
  postForm.elements.id.value = post.id;
  postForm.elements.title.value = post.title;
  postForm.elements.summary.value = post.summary;
  postForm.elements.category.value = post.category;
  postForm.elements.author.value = post.author;
  postForm.elements.date.value = post.date;
  postForm.elements.image.value = post.image;
  postForm.elements.imageAlt.value = post.imageAlt;
  postForm.elements.section.value = post.section;
  postForm.elements.score.value = post.score;
  postForm.elements.store.value = post.store;
  postForm.elements.price.value = post.price;
  postForm.elements.oldPrice.value = post.oldPrice;
  postForm.elements.featured.checked = post.featured;
  postForm.elements.published.checked = post.published;
  formTitle.textContent = post.id ? "Editar post" : "Novo post";
}

function readPostForm() {
  const title = postForm.elements.title.value.trim();
  const existingId = postForm.elements.id.value;

  return {
    id: existingId || `post-${Date.now()}-${tecnewsSlugFromTitle(title)}`,
    title,
    summary: postForm.elements.summary.value.trim(),
    category: postForm.elements.category.value.trim(),
    author: postForm.elements.author.value.trim(),
    date: postForm.elements.date.value.trim(),
    image: postForm.elements.image.value.trim(),
    imageAlt: postForm.elements.imageAlt.value.trim(),
    section: postForm.elements.section.value,
    score: postForm.elements.score.value.trim(),
    store: postForm.elements.store.value.trim(),
    price: postForm.elements.price.value.trim(),
    oldPrice: postForm.elements.oldPrice.value.trim(),
    featured: postForm.elements.featured.checked,
    published: postForm.elements.published.checked,
  };
}

function saveContent() {
  tecnewsSaveContent(content);
  renderAdmin();
}

function renderPostList() {
  postList.innerHTML = content.posts
    .map(
      (post) => `<article class="post-item">
        <img src="${adminEscape(post.image)}" alt="" />
        <div>
          <h3>${adminEscape(post.title)}</h3>
          <p>${adminEscape(post.category)} / ${adminEscape(post.section)} / ${adminEscape(post.author)}</p>
          <span class="status-pill ${post.published ? "" : "draft"}">${post.published ? "Publicado" : "Rascunho"}</span>
        </div>
        <button type="button" data-edit-post="${adminEscape(post.id)}">Editar</button>
      </article>`,
    )
    .join("");

  document.querySelectorAll("[data-edit-post]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = content.posts.find((item) => item.id === button.dataset.editPost);
      if (post) fillPostForm(post);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderSettingsForm() {
  settingsForm.elements.newsletterTitle.value = content.settings.newsletterTitle;
  settingsForm.elements.newsletterText.value = content.settings.newsletterText;
  settingsForm.elements.trends.value = content.settings.trends.join(", ");
}

function renderAnalytics() {
  const analytics = tecnewsLoadAnalytics();
  const postClickTotal = Object.values(analytics.postClicks).reduce((sum, value) => sum + value, 0);

  document.querySelector('[data-metric="pageViews"]').textContent = analytics.pageViews;
  document.querySelector('[data-metric="adminViews"]').textContent = analytics.adminViews;
  document.querySelector('[data-metric="postClicks"]').textContent = postClickTotal;
  document.querySelector('[data-metric="newsletterSignups"]').textContent = analytics.newsletterSignups;
  document.querySelector("[data-last-visit]").textContent = analytics.lastVisit
    ? `Última visita registada: ${analytics.lastVisit}`
    : "Ainda não há visitas registadas.";

  const rows = content.posts
    .map((post) => ({ post, clicks: analytics.postClicks[post.id] || 0 }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 6);

  const max = Math.max(...rows.map((row) => row.clicks), 1);
  document.querySelector("[data-click-chart]").innerHTML = rows
    .map(
      ({ post, clicks }) => `<div class="bar-row">
        <span><span>${adminEscape(post.title)}</span><strong>${clicks}</strong></span>
        <div class="bar-track"><div class="bar-fill" style="width: ${(clicks / max) * 100}%"></div></div>
      </div>`,
    )
    .join("");
}

function renderAdmin() {
  renderPostList();
  renderSettingsForm();
  renderAnalytics();
}

postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const post = readPostForm();

  if (post.featured) {
    content.posts.forEach((item) => {
      item.featured = false;
    });
  }

  const existingIndex = content.posts.findIndex((item) => item.id === post.id);
  if (existingIndex >= 0) {
    content.posts[existingIndex] = post;
  } else {
    content.posts.unshift(post);
  }

  saveContent();
  fillPostForm(post);
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  content.settings.newsletterTitle = settingsForm.elements.newsletterTitle.value.trim();
  content.settings.newsletterText = settingsForm.elements.newsletterText.value.trim();
  content.settings.trends = settingsForm.elements.trends.value
    .split(",")
    .map((trend) => trend.trim())
    .filter(Boolean)
    .slice(0, 8);
  saveContent();
});

document.querySelector("[data-new-post]").addEventListener("click", () => fillPostForm(blankPost()));

document.querySelector("[data-delete-post]").addEventListener("click", () => {
  const id = postForm.elements.id.value;
  if (!id) return;
  const index = content.posts.findIndex((post) => post.id === id);
  if (index >= 0) {
    content.posts.splice(index, 1);
    saveContent();
    fillPostForm(blankPost());
  }
});

document.querySelector("[data-reset-demo]").addEventListener("click", () => {
  tecnewsRemoveStorageItem(TECNEWS_STORAGE_KEY);
  tecnewsRemoveStorageItem(TECNEWS_ANALYTICS_KEY);
  window.location.reload();
});

document.querySelector("[data-logout]").addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.reload();
});

document.querySelectorAll(".admin-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".admin-nav a").forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});

function unlockAdmin() {
  loginScreen.classList.add("is-hidden");
  adminApp.classList.remove("is-locked");
  tecnewsTrackPage("admin");
  fillPostForm(blankPost());
  renderAdmin();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = loginForm.elements.password.value;

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    unlockAdmin();
    return;
  }

  document.querySelector("[data-login-error]").textContent = "Password incorreta.";
});

if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") {
  unlockAdmin();
}
