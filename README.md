# Tecnews.pt

Site editorial estatico para tecnologia em Portugal, com homepage, artigos, topicos, admin e integracao opcional com Supabase.

## Local

Abre `index.html` diretamente no browser.

## Admin

Abre `admin.html`.

Sem Supabase configurado, o admin usa o modo demo com a password `tecnews2026` e guarda conteudo no `localStorage`.

Com Supabase configurado, o admin usa email/password do Supabase Auth e guarda posts/configuracoes na base de dados.

## Supabase

1. Cria um projeto em Supabase.
2. Abre o SQL Editor e executa `supabase-schema.sql`.
3. Em Authentication, cria o utilizador admin por email/password.
4. Em Project Settings -> API, copia o Project URL e a anon/public key.
5. Cola os valores em `config.js`:

```js
window.TECNEWS_SUPABASE_URL = "https://PROJECT.supabase.co";
window.TECNEWS_SUPABASE_ANON_KEY = "PUBLIC_ANON_KEY";
```

Nunca coloques a service role key no browser.

## Vercel e dominio

O projeto esta ligado ao Vercel e os dominios `tecnews.pt` e `www.tecnews.pt` foram adicionados ao projeto. O Vercel indicou estes DNS no momento da configuracao:

- `A tecnews.pt 76.76.21.21`
- `A www.tecnews.pt 76.76.21.21`

Alternativa: trocar nameservers para `ns1.vercel-dns.com` e `ns2.vercel-dns.com`. Depois confirma o dominio em Vercel.
