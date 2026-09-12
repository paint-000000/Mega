/**
 * Esqueleto das páginas: <head>, cabeçalho, menu, rodapé e os auxiliares de
 * imagem responsiva. Nada aqui inventa conteúdo — só organiza o que data.mjs
 * traz do Figma e das pastas de fotografia.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { brand, nav, img, aplicacoes, colecoes } from './data.mjs';
import { arrow } from './icons.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..', 'site');

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Sobe o SVG do logotipo para dentro do HTML, herdando a cor do contexto. */
function logo(nome) {
  let svg = readFileSync(join(SITE, 'assets', 'brand', `${nome}.svg`), 'utf8');
  return svg
    .replace(/\sid="[^"]*"/g, '')
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/\spreserveAspectRatio="none"/g, '')
    .replace(/\soverflow="visible"/g, '')
    .replace(/\sstyle="[^"]*"/g, '')
    .replace(/fill="#F7F4EF"/g, 'fill="currentColor"')
    .replace(/<svg /, '<svg aria-hidden="true" focusable="false" ');
}

const LOGO_H = logo('logo-horizontal');
const LOGO_V = logo('logo-empilhado');

/* --------------------------------------------------------------- imagem */

/**
 * <picture> responsivo em WebP. O <img> aponta para o JPEG do cartão de
 * compartilhamento, que só navegador sem WebP chega a baixar. O LQIP embutido
 * no fundo da placa aparece antes do arquivo grande chegar (ADR-007 no vault).
 */
export function plate(key, opts = {}) {
  const {
    alt = '', sizes = '100vw', ratio = '4x5', eager = false,
    cls = '', base = '', inner = '', parallax = null,
  } = opts;

  const m = img[key];
  if (!m) throw new Error(`imagem ausente no manifesto: ${key}`);

  const srcset = m.widths.map((w) => `${base}${m.base}-${w}.webp ${w}w`).join(', ');
  const classes = ['plate', ratio && `plate--${ratio}`, cls].filter(Boolean).join(' ');

  return `<div class="${classes}" style="background-image:url(${m.lqip})">${inner}
      <picture>
        <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
        <img src="${base}${m.base}-og.jpg" width="${m.w}" height="${m.h}"
             alt="${esc(alt)}"${parallax ? ` data-parallax="${parallax}"` : ''}
             ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </picture>
    </div>`;
}

/**
 * Título em linhas. Por padrão cada linha sobe por baixo de uma máscara ao
 * entrar na tela; na primeira dobra use `revelar: false` — o que se lê ao
 * abrir a página não espera animação (ADR-003 no vault).
 */
export function lines(arr, { revelar = true } = {}) {
  if (!revelar) {
    return `<span class="lines">${arr.map((l) => `<span class="ln">${l}</span>`).join('')}</span>`;
  }
  return `<span class="reveal-lines">${arr
    .map((l, i) => `<span class="ln"><span style="--i:${i}">${l}</span></span>`)
    .join('')}</span>`;
}

export function btn(label, href, variant = 'secondary', extra = '') {
  return `<a class="btn btn--${variant}" href="${href}"${extra}>${label}${arrow}</a>`;
}

/* -------------------------------------------------------- cabeçalho/rodapé */

function header(base, active) {
  const links = nav
    .map((n) => {
      const cur = n.href === active ? ' aria-current="page"' : '';
      return `<a href="${base}${n.href}"${cur}>${n.label}</a>`;
    })
    .join('');

  // O acervo já está na navegação: o cabeçalho guarda só a ação principal.
  return `
  <div class="progress" aria-hidden="true"></div>
  <header class="header">
    <div class="header__inner">
      <a class="brand" href="${base}index.html" aria-label="${esc(brand.nome)} — página inicial">${LOGO_H}</a>
      <nav class="nav" aria-label="Principal">${links}</nav>
      <div class="header__actions">
        <a class="btn btn--primary" href="${base}contato.html">Solicitar orçamento${arrow}</a>
      </div>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu">
        <span></span><span class="visually-hidden">Abrir menu</span>
      </button>
    </div>
  </header>

  <div class="menu" id="menu" hidden>
    <nav class="menu__nav" aria-label="Menu">
      ${nav.map((n, i) => `<a href="${base}${n.href}" style="--i:${i}">${n.label}</a>`).join('')}
      <a href="${base}contato.html" style="--i:${nav.length}">Contato</a>
    </nav>
    <div class="menu__foot">
      <a href="tel:${brand.telefoneLink}">${brand.telefone}</a>
      <a href="mailto:${brand.email}">${brand.email}</a>
      <span>${brand.pracas} · ${brand.horario}</span>
    </div>
  </div>`;
}

function footer(base) {
  const colecoesLinks = colecoes
    .map((c) => `<li><a href="${base}colecoes/${c.slug}.html">${c.nome}</a></li>`)
    .join('');
  const aplicacoesLinks = aplicacoes
    .slice(0, 4)
    .map((a) => `<li><a href="${base}${a.href}">${a.nome}</a></li>`)
    .join('');

  return `
  <footer class="footer">
    <div class="shell">
      <div class="footer__cols">
        <div class="footer__brand">
          ${LOGO_V}
          <p>${brand.assinatura}</p>
        </div>
        <div>
          <h2>Coleções</h2>
          <ul>${colecoesLinks}</ul>
        </div>
        <div>
          <h2>Aplicações</h2>
          <ul>${aplicacoesLinks}<li><a href="${base}aplicacoes.html">Ver todas</a></li></ul>
        </div>
        <div>
          <h2>Contato</h2>
          <ul>
            <li><a href="tel:${brand.telefoneLink}">${brand.telefone}</a></li>
            <li><a href="mailto:${brand.email}">${brand.email}</a></li>
            <li><span>${brand.pracas}</span></li>
            <li><span>${brand.horario}</span></li>
          </ul>
        </div>
      </div>
      <div class="footer__legal">
        <span>© <span data-ano>2026</span> ${brand.nomeCompleto} · ${brand.cnpj}</span>
        <ul>
          <li><a href="${base}sobre.html">Sobre</a></li>
          <li><a href="${base}processo.html">Processo</a></li>
          <li><a href="${base}contato.html">Contato</a></li>
        </ul>
      </div>
    </div>
  </footer>`;
}

/* ------------------------------------------------------------- documento */

export function page({
  title, description, path, active = '', depth = 0, body,
  ogImage = 'marca/residencia-encosta', preload = null, schema = null, bodyClass = '',
}) {
  const base = '../'.repeat(depth);
  const canonical = `${brand.dominio}/${path}`;
  // O cartão de compartilhamento é JPEG: o LinkedIn não lê WebP no og:image.
  const cartao = img[ogImage];
  const ogUrl = `${brand.dominio}/${cartao.base}-og.jpg`;

  const preloadTag = preload
    ? (() => {
        const m = img[preload];
        const set = m.widths.map((w) => `${base}${m.base}-${w}.webp ${w}w`).join(', ');
        return `<link rel="preload" as="image" type="image/webp" imagesrcset="${set}" imagesizes="(max-width: 900px) 100vw, 48vw" fetchpriority="high">`;
      })()
    : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#121110">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(brand.nome)}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogUrl}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${cartao.social.w}">
<meta property="og:image:height" content="${cartao.social.h}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogUrl}">

<link rel="preload" as="font" type="font/woff2" href="${base}assets/fonts/bodoni-normal-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="${base}assets/fonts/inter-normal-latin.woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/fonts/fonts.css">
<link rel="stylesheet" href="${base}assets/css/site.css">
${preloadTag}
<script>document.documentElement.classList.add('js')</script>
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
${header(base, active)}
<main id="conteudo">
${body}
</main>
${footer(base)}
<script src="${base}assets/js/site.js" defer></script>
</body>
</html>`;
}

export function crumbs(items, base) {
  return `<nav aria-label="Trilha"><ol class="crumbs">${items
    .map((i, n) =>
      n === items.length - 1
        ? `<li><span aria-current="page">${i.label}</span></li>`
        : `<li><a href="${base}${i.href}">${i.label}</a></li>`
    )
    .join('')}</ol></nav>`;
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      name: i.label,
      item: `${brand.dominio}/${i.path}`,
    })),
  };
}
