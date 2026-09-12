/**
 * Auditoria do site gerado — estrutura, links, imagens e acessibilidade.
 *   node build/audit.mjs
 * Sai com código 1 se encontrar erro (avisos não derrubam o build).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, posix } from 'node:path';
import { brand } from './data.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..', 'site');

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** og:image e schema usam URL absoluta do próprio domínio: o arquivo tem de existir aqui. */
const URL_DO_SITE = new RegExp(`${escapar(brand.dominio)}/(assets/[^"\\s<]+)`, 'g');

const erros = [];
const avisos = [];
const erro = (p, m) => erros.push(`${p}: ${m}`);
const aviso = (p, m) => avisos.push(`${p}: ${m}`);

function paginas(dir = SITE, pref = '') {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const cheio = join(dir, nome);
    if (statSync(cheio).isDirectory()) {
      if (nome === 'assets') continue;
      saida.push(...paginas(cheio, posix.join(pref, nome)));
    } else if (nome.endsWith('.html')) {
      saida.push(posix.join(pref, nome));
    }
  }
  return saida;
}

const lista = paginas();
const titulos = new Map();
const descricoes = new Map();

for (const rel of lista) {
  const html = readFileSync(join(SITE, rel), 'utf8');
  const dirRel = posix.dirname(rel);

  /* ---- title / description ------------------------------------------- */
  const t = html.match(/<title>([^<]*)<\/title>/);
  if (!t || !t[1].trim()) erro(rel, 'sem <title>');
  else {
    if (t[1].length > 70) aviso(rel, `title com ${t[1].length} caracteres`);
    if (titulos.has(t[1])) erro(rel, `title repetido de ${titulos.get(t[1])}`);
    titulos.set(t[1], rel);
  }

  const d = html.match(/<meta name="description" content="([^"]*)"/);
  if (!d || !d[1].trim()) erro(rel, 'sem meta description');
  else {
    if (d[1].length > 165) aviso(rel, `description com ${d[1].length} caracteres`);
    if (descricoes.has(d[1])) erro(rel, `description repetida de ${descricoes.get(d[1])}`);
    descricoes.set(d[1], rel);
  }

  if (!/<html lang="pt-BR">/.test(html)) erro(rel, 'sem lang no <html>');

  /* ---- hierarquia de títulos ----------------------------------------- */
  const hs = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1 = hs.filter((n) => n === 1).length;
  if (h1 !== 1) erro(rel, `${h1} elementos <h1> (esperado 1)`);
  let anterior = 0;
  for (const n of hs) {
    if (anterior && n > anterior + 1) {
      aviso(rel, `salto de h${anterior} para h${n}`);
      break;
    }
    anterior = n;
  }

  /* ---- imagens -------------------------------------------------------- */
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="/.test(tag)) erro(rel, `<img> sem alt: ${tag.slice(0, 90)}`);
    else if (/\salt=""/.test(tag)) aviso(rel, '<img> com alt vazio');
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
      aviso(rel, '<img> sem width/height (risco de layout shift)');
    }
  }

  /* Formato: a página só referencia WebP; JPEG existe apenas como cartão de
     compartilhamento (-og.jpg), que também é o fallback do <img> (ADR-007). */
  for (const m of html.matchAll(/[\w./-]+\.(?:jpe?g|png|avif|gif)\b/gi)) {
    if (!/-og\.jpg$/i.test(m[0])) erro(rel, `imagem fora de WebP: ${m[0]}`);
  }
  for (const m of html.matchAll(URL_DO_SITE)) {
    if (!existsSync(join(SITE, m[1]))) erro(rel, `URL absoluta sem arquivo: ${m[1]}`);
  }

  /* ---- recursos e links ---------------------------------------------- */
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0];
      if (u) refs.add(u);
    }
  }
  for (const m of html.matchAll(/imagesrcset="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0];
      if (u) refs.add(u);
    }
  }

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
    const limpo = ref.split('#')[0].split('?')[0];
    if (!limpo) continue;
    const alvo = resolve(SITE, dirRel === '.' ? '' : dirRel, limpo);
    if (!existsSync(alvo)) erro(rel, `referência quebrada → ${ref}`);
  }

  /* ---- ids duplicados e aria ------------------------------------------ */
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const vistos = new Set();
  for (const id of ids) {
    if (vistos.has(id)) erro(rel, `id duplicado: ${id}`);
    vistos.add(id);
  }
  for (const m of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
    for (const alvo of m[1].split(/\s+/)) {
      if (!vistos.has(alvo)) erro(rel, `aria aponta para id inexistente: ${alvo}`);
    }
  }

  /* ---- botões e links sem nome acessível ------------------------------ */
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = m[1];
    const texto = m[2].replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
    if (!texto && !/aria-label=/.test(attrs) && !/aria-hidden="true"/.test(attrs)) {
      erro(rel, `<a> sem nome acessível: ${attrs.slice(0, 80)}`);
    }
  }

  /* ---- movimento: o que se lê não espera animação (ADR-003 no vault) --- */
  const primeiraDobra = html.match(/<section class="(?:shell )?(?:hero|prod-hero)"[\s\S]*?<\/section>/);
  if (primeiraDobra && /data-reveal|reveal-lines/.test(primeiraDobra[0])) {
    erro(rel, 'animação de entrada na primeira dobra');
  }
  for (const m of html.matchAll(/<(?:p|dl|div|a)\b[^>]*\sclass="([^"]*)"[^>]*\sdata-reveal\b/g)) {
    if (/(?:^|\s)(?:lead|body|ficha|figures|tag-row|hero__ctas|prod-hero__ctas|pedido|btn)(?:\s|$)/.test(m[1])) {
      erro(rel, `texto ou ação com animação de entrada: .${m[1].split(' ')[0]}`);
    }
  }
}

/* ---- cobertura do acervo ---------------------------------------------- */
const manifesto = JSON.parse(readFileSync(join(HERE, 'images.json'), 'utf8'));
const todoHtml = lista.map((r) => readFileSync(join(SITE, r), 'utf8')).join('\n');
for (const [chave, meta] of Object.entries(manifesto)) {
  const nome = meta.base.split('/').pop();
  if (!todoHtml.includes(nome)) aviso('manifesto', `imagem nunca usada: ${chave}`);
}

console.log(`${lista.length} páginas auditadas`);
if (avisos.length) {
  console.log(`\n${avisos.length} aviso(s):`);
  for (const a of avisos.slice(0, 25)) console.log('  · ' + a);
  if (avisos.length > 25) console.log(`  … e mais ${avisos.length - 25}`);
}
if (erros.length) {
  console.log(`\n${erros.length} ERRO(s):`);
  for (const e of erros.slice(0, 40)) console.log('  ✗ ' + e);
  if (erros.length > 40) console.log(`  … e mais ${erros.length - 40}`);
  process.exit(1);
}
console.log('\nsem erros.');
