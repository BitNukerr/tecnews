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
const postPagination = document.querySelector("[data-post-pagination]");
const homepageLayout = document.querySelector("[data-homepage-layout]");
const POSTS_PER_PAGE = 20;
let currentPostPage = 1;

function adminEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sectionLabel(section) {
  return {
    hero: "Topo",
    promocoes: "Feed principal",
    reviews: "Reviews",
  }[section] || section;
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

function getHomepageLayout() {
  const publishedPosts = content.posts.filter((post) => post.published);
  const heroPosts = publishedPosts.filter((post) => post.section === "hero");
  const leadPost = publishedPosts.find((post) => post.featured) || heroPosts[0] || publishedPosts[0];
  const sideHeroPosts = heroPosts.filter((post) => post.id !== leadPost?.id).slice(0, 2);
  const usedHeroPostIds = new Set([leadPost, ...sideHeroPosts].filter(Boolean).map((post) => post.id));
  const feedPosts = publishedPosts.filter((post) => !usedHeroPostIds.has(post.id));
  const dealPosts = publishedPosts.filter((post) => post.price).slice(0, 3);

  return {
    hero: [leadPost, ...sideHeroPosts].filter(Boolean),
    feed: feedPosts.slice(0, 8),
    deals: dealPosts,
  };
}

function showAdminView(viewName) {
  const resolvedView = document.querySelector(`[data-admin-view="${viewName}"]`) ? viewName : "overview";

  document.querySelectorAll("[data-admin-view]").forEach((view) => {
    view.classList.toggle("is-active", view.dataset.adminView === resolvedView);
  });

  document.querySelectorAll("[data-admin-view-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.adminViewLink === resolvedView);
  });

  if (window.location.hash !== `#${resolvedView}`) {
    history.replaceState(null, "", `#${resolvedView}`);
  }
}

function renderOverview() {
  const published = content.posts.filter((post) => post.published).length;
  const drafts = content.posts.length - published;
  const featured = content.posts.find((post) => post.featured);
  const latest = content.posts[0];

  document.querySelector("[data-overview-list]").innerHTML = `<article class="overview-item">
      <span>Total de posts</span>
      <strong>${content.posts.length}</strong>
    </article>
    <article class="overview-item">
      <span>Publicados</span>
      <strong>${published}</strong>
    </article>
    <article class="overview-item">
      <span>Rascunhos</span>
      <strong>${drafts}</strong>
    </article>
    <article class="overview-item">
      <span>Manchete</span>
      <strong>${adminEscape(featured?.title || "Sem manchete")}</strong>
    </article>
    <article class="overview-item">
      <span>Último post</span>
      <strong>${adminEscape(latest?.title || "Sem posts")}</strong>
    </article>
    <article class="overview-item">
      <span>Destaques</span>
      <strong>${content.settings.showTrends ? "Ativos" : "Ocultos"}</strong>
    </article>`;
}

function renderPostList() {
  const totalPages = Math.max(1, Math.ceil(content.posts.length / POSTS_PER_PAGE));
  currentPostPage = Math.min(currentPostPage, totalPages);
  const start = (currentPostPage - 1) * POSTS_PER_PAGE;
  const pagePosts = content.posts.slice(start, start + POSTS_PER_PAGE);

  postList.innerHTML = `<p class="post-list-meta">A mostrar ${pagePosts.length ? start + 1 : 0}-${Math.min(
    start + POSTS_PER_PAGE,
    content.posts.length,
  )} de ${content.posts.length} posts</p>${pagePosts
    .map(
      (post) => `<article class="post-item">
        <img src="${adminEscape(post.image)}" alt="" />
        <div>
          <h3>${adminEscape(post.title)}</h3>
          <p>${adminEscape(post.category)} / ${adminEscape(sectionLabel(post.section))} / ${adminEscape(post.author)}</p>
          <span class="status-pill ${post.published ? "" : "draft"}">${post.published ? "Publicado" : "Rascunho"}</span>
        </div>
        <button type="button" data-edit-post="${adminEscape(post.id)}">Editar</button>
      </article>`,
    )
    .join("")}`;

  postPagination.innerHTML =
    totalPages > 1
      ? Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return `<button type="button" class="${page === currentPostPage ? "is-active" : ""}" data-post-page="${page}">${page}</button>`;
        }).join("")
      : "";

  document.querySelectorAll("[data-post-page]").forEach((button) => {
    button.addEventListener("click", () => {
      currentPostPage = Number(button.dataset.postPage);
      renderPostList();
    });
  });

  document.querySelectorAll("[data-edit-post]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = content.posts.find((item) => item.id === button.dataset.editPost);
      if (post) fillPostForm(post);
      showAdminView("editor");
    });
  });
}

function renderSettingsForm() {
  settingsForm.elements.newsletterTitle.value = content.settings.newsletterTitle;
  settingsForm.elements.newsletterText.value = content.settings.newsletterText;
  settingsForm.elements.trends.value = content.settings.trends.join(", ");
  settingsForm.elements.showTrends.checked = Boolean(content.settings.showTrends);
}

function renderHomepageLayout() {
  const layout = getHomepageLayout();
  const renderRows = (posts, emptyText, startAt = 1) =>
    posts.length
      ? posts
          .map(
            (post, index) => `<article class="homepage-preview-row">
              <span>${startAt + index}</span>
              <img src="${adminEscape(post.image)}" alt="" />
              <div>
                <strong>${adminEscape(post.title)}</strong>
                <small>${adminEscape(post.category)} / ${adminEscape(post.date)}</small>
              </div>
              <button type="button" data-edit-post="${adminEscape(post.id)}">Editar</button>
            </article>`,
          )
          .join("")
      : `<p class="muted-small">${emptyText}</p>`;

  homepageLayout.innerHTML = `<div class="homepage-preview-block">
      <h3>3 caixas grandes</h3>
      ${renderRows(layout.hero, "Ainda não há posts publicados para o topo.")}
    </div>
    <div class="homepage-preview-block">
      <h3>Continuação dos posts</h3>
      ${renderRows(layout.feed, "A continuação aparece quando existirem mais posts publicados.", 4)}
    </div>
    <div class="homepage-preview-block">
      <h3>Sidebar de promoções</h3>
      ${renderRows(layout.deals, "Adiciona preço a um post para aparecer na sidebar de promoções.")}
    </div>`;

  homepageLayout.querySelectorAll("[data-edit-post]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = content.posts.find((item) => item.id === button.dataset.editPost);
      if (post) fillPostForm(post);
      showAdminView("editor");
    });
  });
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
  renderOverview();
  renderPostList();
  renderSettingsForm();
  renderHomepageLayout();
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
    currentPostPage = 1;
  }

  saveContent();
  fillPostForm(post);
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  content.settings.newsletterTitle = settingsForm.elements.newsletterTitle.value.trim();
  content.settings.newsletterText = settingsForm.elements.newsletterText.value.trim();
  content.settings.showTrends = settingsForm.elements.showTrends.checked;
  content.settings.trends = settingsForm.elements.trends.value
    .split(",")
    .map((trend) => trend.trim())
    .filter(Boolean)
    .slice(0, 8);
  saveContent();
});

document.querySelector("[data-new-post]").addEventListener("click", () => {
  fillPostForm(blankPost());
  showAdminView("editor");
});

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

document.querySelectorAll("[data-admin-view-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showAdminView(link.dataset.adminViewLink);
  });
});

function unlockAdmin() {
  loginScreen.classList.add("is-hidden");
  adminApp.classList.remove("is-locked");
  tecnewsTrackPage("admin");
  fillPostForm(blankPost());
  renderAdmin();
  showAdminView((window.location.hash || "#overview").replace("#", "") || "overview");
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
