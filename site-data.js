const TECNEWS_STORAGE_KEY = "tecnews-content-v1";
const TECNEWS_ANALYTICS_KEY = "tecnews-analytics-v1";
const tecnewsMemoryStore = {};
const tecnewsTopics = {
  smartphones: {
    label: "Smartphones",
    description: "Telemóveis, acessórios, atualizações, operadores e conselhos de compra.",
    matcher: (post) => post.category === "Smartphones" || /telem[oó]veis?|android|iphone|smartphone/i.test(`${post.title} ${post.summary}`),
  },
  ia: {
    label: "IA",
    description: "Inteligência artificial aplicada ao trabalho, produtividade, segurança e vida digital.",
    matcher: (post) => post.category === "IA" || /intelig[eê]ncia artificial|chatgpt|assistentes|modelos/i.test(`${post.title} ${post.summary}`),
  },
  reviews: {
    label: "Reviews",
    description: "Produtos testados pela equipa Tecnews, com pontos fortes, limites e recomendação prática.",
    matcher: (post) => post.section === "reviews" || post.category === "Reviews",
  },
  gaming: {
    label: "Gaming",
    description: "Jogos, consolas, PC gaming, serviços, promoções e novidades para jogadores.",
    matcher: (post) => post.category === "Gaming" || /playstation|gaming|jogos?|consola|steam|xbox/i.test(`${post.title} ${post.summary}`),
  },
  promocoes: {
    label: "Promoções",
    description: "Descontos de tecnologia, gadgets, acessórios e bons negócios encontrados pela equipa.",
    matcher: (post) => post.section === "promocoes" || Boolean(post.price),
  },
  guias: {
    label: "Guias",
    description: "Guias de compra, explicadores e escolhas simples para decidir melhor.",
    matcher: (post) => /como|guia|escolher|compra|compensam|vale a pena|preço/i.test(`${post.title} ${post.summary}`),
  },
};

const tecnewsDefaultContent = {
  settings: {
    siteTitle: "Tecnews.pt",
    heroTitle: "A tecnologia que mexe com o teu dia",
    newsletterTitle: "Resumo Tecnews",
    newsletterText: "As novidades úteis de tecnologia, promoções e guias de compra numa newsletter semanal.",
    showTrends: false,
    trends: ["iPhone 18", "Galaxy S27", "ChatGPT", "Digi Portugal", "Carros elétricos"],
  },
  posts: [
    {
      id: "post-ia-assistentes",
      title: "Nova geração de assistentes promete organizar trabalho, casa e compras num só lugar",
      summary: "O que muda para os utilizadores portugueses e onde ainda convém manter cautela.",
      category: "IA",
      author: "Rafael Matos",
      date: "Hoje, 09:20",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Pessoa a usar um portátil com gráficos tecnológicos no ecrã",
      section: "hero",
      score: "",
      store: "",
      price: "",
      oldPrice: "",
      featured: true,
      published: true,
    },
    {
      id: "post-android-compra",
      title: "Estes são os telemóveis Android que mais compensam comprar esta semana",
      summary: "Modelos equilibrados para fotografia, autonomia e atualizações longas.",
      category: "Smartphones",
      author: "Mariana Lopes",
      date: "Hoje",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Smartphone moderno sobre uma mesa",
      section: "hero",
      score: "",
      store: "",
      price: "",
      oldPrice: "",
      featured: false,
      published: true,
    },
    {
      id: "post-playstation",
      title: "PlayStation prepara atualização com uma função pedida há anos",
      summary: "A novidade começa a chegar primeiro aos utilizadores beta.",
      category: "Gaming",
      author: "Diogo Reis",
      date: "Ontem",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Consola retro e comandos numa secretária",
      section: "hero",
      score: "",
      store: "",
      price: "",
      oldPrice: "",
      featured: false,
      published: true,
    },
    {
      id: "post-auriculares",
      title: "5 auriculares com bom som e descontos fortes para levar já",
      summary: "Modelos para chamadas, ginásio e viagens, com preços abaixo do normal.",
      category: "Oferta",
      author: "Inês Gomes",
      date: "3 maio 2026",
      image: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?auto=format&fit=crop&w=700&q=80",
      imageAlt: "Auscultadores sem fios numa secretária",
      section: "promocoes",
      score: "",
      store: "Amazon",
      price: "54,00 €",
      oldPrice: "69,99 €",
      featured: false,
      published: true,
    },
    {
      id: "post-portatil",
      title: "O portátil leve que caiu de preço e faz sentido para estudar ou trabalhar",
      summary: "Autonomia, ecrã e teclado são os pontos fortes deste modelo em promoção.",
      category: "Portáteis",
      author: "João Esteves",
      date: "3 maio 2026",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80",
      imageAlt: "Portátil aberto sobre uma mesa",
      section: "promocoes",
      score: "",
      store: "Worten",
      price: "219,00 €",
      oldPrice: "329,00 €",
      featured: false,
      published: true,
    },
    {
      id: "post-dobravel",
      title: "Dobrável premium: incrível no ecrã, exigente no bolso",
      summary: "Um ecrã grande e câmaras fortes, mas ainda há compromissos no preço.",
      category: "Reviews",
      author: "Rafael Matos",
      date: "2 maio 2026",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=80",
      imageAlt: "Telemóvel dobrável aberto",
      section: "reviews",
      score: "8.6",
      store: "",
      price: "",
      oldPrice: "",
      featured: false,
      published: true,
    },
    {
      id: "post-tablet",
      title: "Tablet para trabalho: quando substitui mesmo o portátil?",
      summary: "Testámos teclado, caneta, multitarefa e autonomia numa semana de uso real.",
      category: "Reviews",
      author: "Mariana Lopes",
      date: "1 maio 2026",
      image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=700&q=80",
      imageAlt: "Tablet com caneta digital",
      section: "reviews",
      score: "8.1",
      store: "",
      price: "",
      oldPrice: "",
      featured: false,
      published: true,
    },
    {
      id: "post-headphones",
      title: "Headphones ANC que surpreendem abaixo dos 100 euros",
      summary: "Cancelamento de ruído competente e bateria para vários dias.",
      category: "Reviews",
      author: "Diogo Reis",
      date: "30 abril 2026",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80",
      imageAlt: "Headphones pretos sobre fundo claro",
      section: "reviews",
      score: "8.8",
      store: "",
      price: "",
      oldPrice: "",
      featured: false,
      published: true,
    },
  ],
};

function tecnewsClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function tecnewsBodyForPost(post) {
  if (post.body) return post.body;
  return [
    post.summary,
    `A categoria ${post.category} continua a mudar a forma como compramos, trabalhamos e usamos tecnologia todos os dias.`,
    "A Tecnews acompanha o essencial, explica o que mudou e junta os pontos que deves confirmar antes de tomar uma decisao.",
    "Compara preco, garantia, suporte e utilidade real antes de escolher. A melhor novidade e a que resolve um problema concreto.",
  ].join("\n\n");
}

function tecnewsNormalizePost(post, index = 0) {
  return {
    score: "",
    store: "",
    price: "",
    oldPrice: "",
    featured: false,
    published: true,
    sortOrder: index * 10,
    ...post,
    body: tecnewsBodyForPost(post),
  };
}

function tecnewsNormalizeContent(content) {
  return {
    settings: { ...tecnewsDefaultContent.settings, ...(content.settings || {}) },
    posts: Array.isArray(content.posts) ? content.posts.map(tecnewsNormalizePost) : tecnewsDefaultContent.posts.map(tecnewsNormalizePost),
  };
}

function tecnewsGetStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return tecnewsMemoryStore[key] || null;
  }
}

function tecnewsSetStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    tecnewsMemoryStore[key] = value;
  }
}

function tecnewsRemoveStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    delete tecnewsMemoryStore[key];
  }
}

function tecnewsLoadContent() {
  const saved = tecnewsGetStorageItem(TECNEWS_STORAGE_KEY);

  if (!saved) {
    return tecnewsNormalizeContent(tecnewsClone(tecnewsDefaultContent));
  }

  try {
    const parsed = JSON.parse(saved);
    return tecnewsNormalizeContent(parsed);
  } catch {
    return tecnewsNormalizeContent(tecnewsClone(tecnewsDefaultContent));
  }
}

function tecnewsSaveContent(content) {
  tecnewsSetStorageItem(TECNEWS_STORAGE_KEY, JSON.stringify(content));
}

function tecnewsLoadAnalytics() {
  const saved = tecnewsGetStorageItem(TECNEWS_ANALYTICS_KEY);

  if (!saved) {
    return { pageViews: 0, adminViews: 0, clicks: {}, postClicks: {}, newsletterSignups: 0, lastVisit: "" };
  }

  try {
    return {
      pageViews: 0,
      adminViews: 0,
      clicks: {},
      postClicks: {},
      newsletterSignups: 0,
      lastVisit: "",
      ...JSON.parse(saved),
    };
  } catch {
    return { pageViews: 0, adminViews: 0, clicks: {}, postClicks: {}, newsletterSignups: 0, lastVisit: "" };
  }
}

function tecnewsSaveAnalytics(analytics) {
  tecnewsSetStorageItem(TECNEWS_ANALYTICS_KEY, JSON.stringify(analytics));
}

function tecnewsTrackPage(pageName) {
  const analytics = tecnewsLoadAnalytics();
  if (pageName === "admin") {
    analytics.adminViews += 1;
  } else {
    analytics.pageViews += 1;
  }
  analytics.lastVisit = new Date().toLocaleString("pt-PT");
  tecnewsSaveAnalytics(analytics);
}

function tecnewsTrackClick(name, postId = "") {
  const analytics = tecnewsLoadAnalytics();
  analytics.clicks[name] = (analytics.clicks[name] || 0) + 1;
  if (postId) {
    analytics.postClicks[postId] = (analytics.postClicks[postId] || 0) + 1;
  }
  tecnewsSaveAnalytics(analytics);
}

function tecnewsSlugFromTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function tecnewsPostUrl(post) {
  return `article.html?id=${encodeURIComponent(post.id)}`;
}

function tecnewsTopicUrl(topic) {
  return `topic.html?topic=${encodeURIComponent(topic)}`;
}

function tecnewsTopicForSlug(slug) {
  return tecnewsTopics[slug] || tecnewsTopics.guias;
}

function tecnewsPostsForTopic(posts, slug) {
  const topic = tecnewsTopicForSlug(slug);
  const matches = posts.filter((post) => topic.matcher(post));
  return matches.length ? matches : posts;
}
