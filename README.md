# Tecnews.pt

Primeira versão estática do site Tecnews.pt, inspirada no ritmo editorial de portais portugueses de tecnologia: manchete principal, categorias, notícias recentes, reviews, promoções, guias, newsletter e painel admin.

## Como ver localmente

Abre `index.html` diretamente no navegador.

## Admin

Abre `admin.html` para gerir a demo:

- Criar, editar, publicar e apagar posts.
- Escolher a manchete principal.
- Atualizar o título da homepage, newsletter e temas em destaque.
- Ver analítica simples com visitas, cliques em posts e subscrições.

Password da demo: `tecnews2026`.

Nesta fase os dados ficam guardados no `localStorage` do navegador e o login é uma proteção visual de protótipo. Isto é ótimo para testar o fluxo, mas para um site real com login seguro, vários dispositivos e conteúdo persistente vais precisar de um backend/CMS, por exemplo WordPress, Strapi, Directus, Sanity, Supabase ou Firebase.

## Publicar no GitHub Pages

1. Cria um repositório novo no GitHub chamado `tecnews.pt`.
2. Envia estes ficheiros para o repositório.
3. No GitHub, abre `Settings` -> `Pages`.
4. Em `Build and deployment`, escolhe `Deploy from a branch`.
5. Seleciona a branch principal e a pasta `/root`.
6. Quando tiveres o domínio pronto, adiciona `tecnews.pt` em `Custom domain`.

## Ligar o domínio

No painel onde compraste o domínio, aponta os DNS para o serviço de alojamento que escolheres. Para GitHub Pages, normalmente vais precisar de:

- Registos `A` para os IPs do GitHub Pages.
- Registo `CNAME` para `www` apontar para o teu endereço GitHub Pages.

Confirma sempre os valores atuais na documentação do GitHub antes de alterar DNS.
