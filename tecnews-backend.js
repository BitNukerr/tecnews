let tecnewsSupabaseClient = null;

function tecnewsHasSupabaseConfig() {
  return Boolean(
    window.TECNEWS_SUPABASE_URL &&
      window.TECNEWS_SUPABASE_ANON_KEY &&
      !window.TECNEWS_SUPABASE_URL.includes("your-project") &&
      !window.TECNEWS_SUPABASE_ANON_KEY.includes("your-anon-key"),
  );
}

function tecnewsGetSupabaseClient() {
  if (!tecnewsHasSupabaseConfig() || !window.supabase?.createClient) return null;
  if (!tecnewsSupabaseClient) {
    tecnewsSupabaseClient = window.supabase.createClient(window.TECNEWS_SUPABASE_URL, window.TECNEWS_SUPABASE_ANON_KEY);
  }
  return tecnewsSupabaseClient;
}

function tecnewsPostFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body || "",
    category: row.category,
    author: row.author,
    date: row.published_at_text,
    image: row.image_url,
    imageAlt: row.image_alt || "",
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    section: row.section,
    score: row.score || "",
    store: row.store || "",
    price: row.price || "",
    oldPrice: row.old_price || "",
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    sortOrder: row.sort_order ?? 0,
  };
}

function tecnewsRowFromPost(post) {
  return {
    id: post.id,
    title: post.title,
    summary: post.summary,
    body: post.body || "",
    category: post.category,
    author: post.author,
    published_at_text: post.date,
    image_url: post.image,
    image_alt: post.imageAlt || "",
    gallery_images: Array.isArray(post.galleryImages) ? post.galleryImages : [],
    section: post.section,
    score: post.score || "",
    store: post.store || "",
    price: post.price || "",
    old_price: post.oldPrice || "",
    featured: Boolean(post.featured),
    published: Boolean(post.published),
    sort_order: post.sortOrder ?? 0,
  };
}

async function tecnewsLoadContentAsync(options = {}) {
  const client = tecnewsGetSupabaseClient();
  if (!client) return tecnewsLoadContent();

  try {
    const settingsRequest = client.from("site_settings").select("value").eq("key", "content").maybeSingle();
    let postsRequest = client.from("posts").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });

    if (!options.includeDrafts) {
      postsRequest = postsRequest.eq("published", true);
    }

    const [{ data: settingsRow, error: settingsError }, { data: rows, error: postsError }] = await Promise.all([settingsRequest, postsRequest]);
    if (settingsError || postsError) throw settingsError || postsError;

    const settings = { ...tecnewsDefaultContent.settings, ...(settingsRow?.value || {}) };
    const posts = Array.isArray(rows) && rows.length ? rows.map(tecnewsPostFromRow) : tecnewsLoadContent().posts;

    return tecnewsNormalizeContent({ settings, posts });
  } catch (error) {
    console.warn("Tecnews backend unavailable, using local content.", error);
    return tecnewsLoadContent();
  }
}

async function tecnewsSaveSettingsAsync(settings) {
  const client = tecnewsGetSupabaseClient();
  if (!client) {
    const localContent = tecnewsLoadContent();
    localContent.settings = settings;
    tecnewsSaveContent(localContent);
    return;
  }

  const { error } = await client.from("site_settings").upsert({ key: "content", value: settings });
  if (error) throw error;
}

async function tecnewsSavePostAsync(post, options = {}) {
  const client = tecnewsGetSupabaseClient();
  if (!client) {
    const localContent = tecnewsLoadContent();
    if (post.featured) {
      localContent.posts.forEach((item) => {
        item.featured = false;
      });
    }
    const existingIndex = localContent.posts.findIndex((item) => item.id === post.id);
    if (existingIndex >= 0) localContent.posts[existingIndex] = post;
    else localContent.posts.unshift(post);
    tecnewsSaveContent(localContent);
    return post;
  }

  if (options.clearFeatured) {
    const { error } = await client.from("posts").update({ featured: false }).eq("featured", true);
    if (error) throw error;
  }

  if (post.sortOrder === undefined || post.sortOrder === null) {
    const { data } = await client.from("posts").select("sort_order").order("sort_order", { ascending: true }).limit(1);
    post.sortOrder = data?.length ? Number(data[0].sort_order) - 10 : 10;
  }

  const { error } = await client.from("posts").upsert(tecnewsRowFromPost(post));
  if (error) throw error;
  return post;
}

async function tecnewsDeletePostAsync(id) {
  const client = tecnewsGetSupabaseClient();
  if (!client) {
    const localContent = tecnewsLoadContent();
    localContent.posts = localContent.posts.filter((post) => post.id !== id);
    tecnewsSaveContent(localContent);
    return;
  }

  const { error } = await client.from("posts").delete().eq("id", id);
  if (error) throw error;
}

async function tecnewsSignInAdmin(email, password) {
  const client = tecnewsGetSupabaseClient();
  if (!client) throw new Error("Supabase is not configured yet.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function tecnewsSignOutAdmin() {
  const client = tecnewsGetSupabaseClient();
  if (client) await client.auth.signOut();
}

async function tecnewsGetAdminSession() {
  const client = tecnewsGetSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}
