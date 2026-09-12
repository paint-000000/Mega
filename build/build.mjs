/**
 * Gerador estático — Magah Minerale.
 *   node build/build.mjs
 *
 * Escreve site/ inteiro a partir de data.mjs (Figma + pastas de fotografia).
 *
 * Movimento (ADR-003 no vault): a primeira dobra de cada página não anima e
 * texto corrido nunca entra com animação. `data-reveal` fica para títulos,
 * fotografias e cartões abaixo da dobra; build/audit.mjs recusa o resto.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  brand, colecoes, aplicacoes, pedras, processo, usos,
  aplicacoesCopy, orcamento, indicadores, img,
} from './data.mjs';
import { icons, arrow } from './icons.mjs';
import { page, plate, lines, btn, esc, crumbs, breadcrumbSchema } from './layout.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..', 'site');

const escreve = (rel, html) => {
  const destino = join(SITE, rel);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
};

const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;

/* ===================================================== blocos reutilizáveis */

/** mailto com o pedido já escrito; `interesse` registra de qual página ele saiu. */
function pedidoPorEmail(interesse) {
  const corpo = [
    ...orcamento.corpo,
    '',
    ...(interesse ? [interesse] : []),
    ...orcamento.campos.map((c) => `${c}:`),
  ].join('\r\n');
  return `mailto:${brand.email}?subject=${encodeURIComponent(orcamento.assunto)}` +
    `&body=${encodeURIComponent(`${corpo}\r\n`)}`;
}

/**
 * O pedido de orçamento. Não há servidor: o botão abre o e-mail do visitante
 * com a mensagem pronta, e a nota diz isso antes do clique. O antigo campo
 * "Seu e-mail" pedia o endereço de quem já estava escrevendo um e-mail
 * (ADR-002 no vault).
 */
function acaoPedido(id, interesse = null) {
  return `
          <div class="pedido">
            <a class="btn btn--primary btn--lg" href="${esc(pedidoPorEmail(interesse))}"
               aria-describedby="${id}-nota">${orcamento.botao}${arrow}</a>
            <p class="pedido__nota" id="${id}-nota">${orcamento.nota} ${orcamento.ajuda}.</p>
          </div>`;
}

/** Faixa de orçamento — a mesma conversa em todas as páginas. */
function faixaOrcamento(base, { id = 'orcamento', interesse = null } = {}) {
  return `
  <section class="section" id="${id}" aria-labelledby="${id}-t">
    <div class="shell">
      <div class="cta">
        ${plate('marca/muro-noturno', {
          base, alt: 'Muro de pedra em luz rasante noturna', ratio: '',
          sizes: '(min-width: 1680px) 1488px, 92vw',
          inner: '<div class="cta__veil"></div>',
        })}
        <div class="cta__body">
          <p class="overline overline--accent" data-reveal>${orcamento.overline}</p>
          <h2 class="h2" id="${id}-t">${lines(orcamento.titulo)}</h2>
          <p class="lead">${orcamento.texto}</p>
          ${acaoPedido(id, interesse)}
          <p class="cta__canais">${orcamento.direto}
            <a class="link-simple" href="mailto:${brand.email}">${brand.email}</a>
            <span aria-hidden="true">·</span>
            <a class="link-simple" href="tel:${brand.telefoneLink}">${brand.telefone}</a></p>
        </div>
      </div>
    </div>
  </section>`;
}

/** Grade das seis aplicações reais, com contagem verdadeira. */
function gradeCategorias(base, { destaque = null, nivel = 3 } = {}) {
  return `<div class="cats">${aplicacoes
    .filter((a) => a.slug !== destaque)
    .map(
      (a, i) => `
      <a class="cat" href="${base}${a.href}" data-reveal style="--i:${i % 3}">
        ${plate(a.capa, {
          base, alt: `${a.nome} — ${a.linha}`, ratio: '4x5',
          sizes: '(max-width: 560px) 92vw, (max-width: 900px) 46vw, 31vw',
        })}
        <div class="cat__body">
          <p class="cat__count">${plural(a.fotos.length, 'obra', 'obras')}</p>
          <h${nivel} class="cat__name">${a.nome}${arrow}</h${nivel}>
          <div class="cat__mais"><p class="cat__line">${a.linha}</p></div>
        </div>
      </a>`
    )
    .join('')}</div>`;
}

/** As quatro etapas do processo, em cartões. */
function passos() {
  return `
      <div class="steps">
        ${processo.map((e) => `
        <article class="step">
          <span class="step__icon">${icons[e.icone]}</span>
          <span class="step__n">${e.n}</span>
          <h3 class="h4">${e.titulo}</h3>
          <p>${e.texto}</p>
        </article>`).join('')}
      </div>`;
}

/** Cartão de pedra usado no acervo e nas listas relacionadas. */
function cartaoPedra(p, base, i = 0, nivel = 3) {
  return `
  <a class="pedra-card" href="${base}${p.href}" data-reveal style="--i:${i % 4}"
     data-aplicacoes="${p.aplicacoes.map((a) => slugSimples(a)).join(' ')}">
    ${plate(p.capa, {
      base, alt: `${p.nome} — ${p.fotos[0].aplicacao.toLowerCase()}`, ratio: '4x5',
      sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 23vw',
    })}
    <h${nivel} class="pedra-card__name">${p.nome}</h${nivel}>
    <p class="pedra-card__meta">
      <span>${p.aplicacoes.join(' · ')}</span>
      ${p.fotos.length > 1 ? `<span class="accent-italic">${p.fotos.length} obras</span>` : ''}
    </p>
  </a>`;
}

const slugSimples = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

/** Anterior / próximo dentro de uma lista. */
function prevNext(lista, idx, base, rotulo) {
  const ant = lista[(idx - 1 + lista.length) % lista.length];
  const prox = lista[(idx + 1) % lista.length];
  const href = (x) => base + (x.href || `colecoes/${x.slug}.html`);
  return `
  <nav class="prevnext" aria-label="${rotulo}">
    <a href="${href(ant)}"><span class="caption">Anterior</span><span class="h4">${ant.nome}</span></a>
    <a href="${href(prox)}"><span class="caption">Próxima</span><span class="h4">${prox.nome}</span></a>
  </nav>`;
}

/* ================================================================== HOME */

function home() {
  const base = '';

  const hero = `
  <section class="hero" aria-labelledby="hero-t">
    <div class="hero__glow" aria-hidden="true"></div>
    <div class="hero__copy">
      <p class="overline">${brand.overline}</p>
      <h1 class="display" id="hero-t">${lines(['A pedra não reveste.', 'Ela define o lugar.'], { revelar: false })}</h1>
      <p class="lead">${brand.intro}</p>
      <div class="hero__ctas">
        <a class="btn btn--primary btn--lg" href="#orcamento">Solicitar orçamento${arrow}</a>
        <a class="btn btn--secondary btn--lg" href="colecoes.html">Ver coleções${arrow}</a>
      </div>
    </div>
    <div class="hero__media">
      ${plate('marca/residencia-encosta', {
        base, ratio: '', eager: true,
        alt: 'Residência em encosta ao entardecer, com base e muros em pedra natural e caminho de acesso iluminado',
        sizes: '(max-width: 900px) 100vw, 48vw',
      })}
    </div>
    <p class="hero__scroll caption" aria-hidden="true"><span class="bar"></span> Role para descobrir</p>
  </section>`;

  const materia = `
  <section class="section" aria-labelledby="materia-t">
    <div class="shell">
      <div class="intro">
        <div>
          <p class="overline" data-reveal>A matéria</p>
          <h2 class="intro__lede mt-lg" id="materia-t" data-reveal style="--i:1">
            ${brand.assinatura.replace('Extração, corte e instalação própria.',
              '<span class="accent-italic">Extração, corte e instalação própria.</span>')}
          </h2>
          <dl class="figures">
            ${indicadores.map((n) => `<div><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join('')}
          </dl>
        </div>
        <figure class="intro__media">
          <div data-reveal="mask">
            ${plate('marca/alvenaria-seca', {
              base, ratio: 'tall', parallax: '0.05',
              alt: 'Detalhe de parede em alvenaria seca: blocos irregulares encaixados, junta fechada',
              sizes: '(max-width: 860px) 92vw, 40vw',
            })}
          </div>
          <figcaption class="caption">Alvenaria seca — bloco irregular, junta fechada.</figcaption>
        </figure>
      </div>
    </div>
  </section>`;

  const secColecoes = `
  <section class="section section--sunken" aria-labelledby="col-t">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Coleções</p>
          <h2 class="h2" id="col-t" data-reveal style="--i:1">Quatro famílias, uma mesma exigência de bloco.</h2>
        </div>
        <a class="btn btn--ghost" href="colecoes.html">Ver coleções${arrow}</a>
      </div>
      <div>
        ${colecoes.map((c, i) => blocoColecao(c, i, base)).join('')}
      </div>
    </div>
  </section>`;

  const secAplicacoes = `
  <section class="section" aria-labelledby="apl-t">
    <div class="shell">
      <div class="split">
        <div class="split__media" data-reveal="mask">
          ${plate('marca/estar-alvenaria', {
            base, ratio: '', parallax: '0.04',
            alt: 'Sala de estar com parede inteira em alvenaria seca, poltrona e ripado de madeira',
            sizes: '(max-width: 900px) 100vw, 50vw',
          })}
        </div>
        <div class="split__body">
          <p class="overline" data-reveal>${aplicacoesCopy.overline}</p>
          <h2 class="h2" id="apl-t" data-reveal style="--i:1">${aplicacoesCopy.titulo}</h2>
          <p class="body">${aplicacoesCopy.texto}</p>
          <div class="tag-row">
            ${usos.map((u) => `<span class="tag">${u}</span>`).join('')}
          </div>
          ${btn('Ver aplicações', 'aplicacoes.html')}
        </div>
      </div>
    </div>
  </section>`;

  const secAcervo = `
  <section class="section section--tight" aria-labelledby="acv-t">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Acervo</p>
          <h2 class="h2" id="acv-t" data-reveal style="--i:1">Seis aplicações, ${pedras.length} pedras.</h2>
        </div>
        <a class="btn btn--ghost" href="acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      ${gradeCategorias(base)}
    </div>
  </section>`;

  const secProcesso = `
  <section class="section section--sunken" aria-labelledby="pro-t">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Processo</p>
          <h2 class="h2" id="pro-t" data-reveal style="--i:1">Quatro etapas entre o projeto e a pedra assentada.</h2>
        </div>
        <a class="btn btn--ghost" href="processo.html">Ver o processo${arrow}</a>
      </div>
      ${passos()}
    </div>
  </section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${brand.dominio}/#org`,
        name: brand.nomeCompleto,
        alternateName: brand.nome,
        url: brand.dominio,
        logo: `${brand.dominio}/assets/brand/logo-empilhado.svg`,
        foundingDate: String(brand.desde),
        description: brand.assinatura,
        email: brand.email,
        telephone: brand.telefone,
        areaServed: 'BR',
        address: ['São Paulo', 'Vitória'].map((c) => ({
          '@type': 'PostalAddress', addressLocality: c, addressCountry: 'BR',
        })),
      },
      {
        '@type': 'WebSite',
        '@id': `${brand.dominio}/#site`,
        url: brand.dominio,
        name: brand.nome,
        inLanguage: 'pt-BR',
        publisher: { '@id': `${brand.dominio}/#org` },
      },
    ],
  };

  return page({
    title: `${brand.nome} — Pedra natural para arquitetura`,
    description:
      'Blocos brutos, alvenaria seca e superfícies minerais selecionadas bloco a bloco, ' +
      'com fornecimento e instalação próprios para arquitetura residencial.',
    path: 'index.html',
    active: '',
    depth: 0,
    preload: 'marca/residencia-encosta',
    schema,
    body: hero + materia + secColecoes + secAplicacoes + secAcervo + secProcesso + faixaOrcamento(base),
  });
}

/** Bloco editorial de uma coleção — o CSS alterna lado e largura. */
function blocoColecao(c, i, base, nivel = 3) {
  const n = String(i + 1).padStart(2, '0');
  const ritmo = i % 3;
  const ratio = c.especime ? '1x1' : ritmo === 2 ? '4x5' : '3x2';
  return `
  <article class="colecao plate-hover" data-ritmo="${ritmo}">
    <div class="colecao__media" data-reveal="mask">
      <a href="${base}colecoes/${c.slug}.html" tabindex="-1" aria-hidden="true">
        ${plate(c.imagem, {
          base, alt: c.alt, ratio, cls: c.especime ? 'plate--especime' : '',
          sizes: '(max-width: 860px) 92vw, 52vw',
        })}
      </a>
    </div>
    <div class="colecao__body">
      <p class="colecao__index" data-reveal>Coleção ${n}</p>
      <h${nivel} class="h3" data-reveal style="--i:1"><a href="${base}colecoes/${c.slug}.html">${c.nome}</a></h${nivel}>
      ${c.descricao ? `<p class="body">${c.descricao}</p>` : ''}
      <p class="colecao__price mt-lg">${c.preco}</p>
      ${btn('Conhecer coleção', `${base}colecoes/${c.slug}.html`, 'ghost')}
    </div>
  </article>`;
}

/* ============================================================== COLEÇÕES */

function paginaColecoes() {
  const base = '';
  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Coleções' }], base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">Coleções</p>
          <h1 class="h1" id="t">Quatro famílias, uma mesma exigência de bloco.</h1>
        </div>
        <p class="body max-45">${aplicacoesCopy.texto}</p>
      </div>
      ${colecoes.map((c, i) => blocoColecao(c, i, base, 2)).join('')}
    </div>
  </section>

  <section class="section section--sunken section--tight" aria-labelledby="ac">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Acervo</p>
          <h2 class="h2" id="ac" data-reveal style="--i:1">Além das quatro famílias, ${pedras.length} pedras em obra.</h2>
        </div>
        <a class="btn btn--ghost" href="acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      ${gradeCategorias(base)}
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: `Coleções — ${brand.nome}`,
    description: 'Alvenaria seca, Travertino Romano, Mármore Grafite e Calcário escovado: as quatro famílias de pedra natural da Magah Minerale.',
    path: 'colecoes.html',
    active: 'colecoes.html',
    depth: 0,
    ogImage: 'marca/alvenaria-seca',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Coleções',
      inLanguage: 'pt-BR',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: colecoes.length,
        itemListElement: colecoes.map((c, i) => ({
          '@type': 'ListItem', position: i + 1, name: c.nome,
          url: `${brand.dominio}/colecoes/${c.slug}.html`,
        })),
      },
    },
    body,
  });
}

function paginaColecao(c, idx) {
  const base = '../';
  const trilha = [
    { label: 'Início', href: 'index.html', path: 'index.html' },
    { label: 'Coleções', href: 'colecoes.html', path: 'colecoes.html' },
    { label: c.nome, path: `colecoes/${c.slug}.html` },
  ];

  const preco = c.preco.match(/R\$\s*([\d.]+)/);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: c.nome,
        category: c.etiqueta,
        brand: { '@type': 'Brand', name: brand.nome },
        image: `${brand.dominio}/${img[c.imagem].base}-${img[c.imagem].widths.at(-1)}.webp`,
        ...(c.descricao ? { description: c.descricao } : {}),
        ...(preco
          ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'BRL',
                        lowPrice: Number(preco[1].replace('.', '')),
                        availability: 'https://schema.org/InStock' } }
          : {}),
      },
      breadcrumbSchema(trilha),
    ],
  };

  const ambiente = c.ambiente
    ? `
  <section class="section section--tight" aria-labelledby="amb">
    <div class="shell">
      <div class="split">
        <div class="split__media" data-reveal="mask">
          ${plate(c.ambiente, {
            base, ratio: '', parallax: '0.04', alt: c.altAmbiente,
            sizes: '(max-width: 900px) 100vw, 50vw',
          })}
        </div>
        <div class="split__body">
          <p class="overline" data-reveal>Em obra</p>
          <h2 class="h2" id="amb" data-reveal style="--i:1">${aplicacoesCopy.titulo}</h2>
          <p class="body">${aplicacoesCopy.texto}</p>
          <div class="tag-row">
            ${usos.map((u) => `<span class="tag">${u}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`
    : '';

  const body = `
  <section class="shell prod-hero" aria-labelledby="t">
    <div>
      ${crumbs(trilha, base)}
      <p class="overline mt-xl">${c.etiqueta}</p>
      <h1 class="h1" id="t">${c.nome}</h1>
      ${c.descricao
        ? `<p class="lead">${c.descricao}</p>`
        : `<p class="lead muted">Família nomeada no catálogo. Descrição e ficha técnica sob consulta.</p>`}
      <p class="colecao__price mt-lg">${c.preco}</p>
      <div class="prod-hero__ctas">
        <a class="btn btn--primary btn--lg" href="${base}contato.html">Solicitar informações${arrow}</a>
        <a class="btn btn--secondary btn--lg" href="${base}acervo.html">Percorrer o acervo${arrow}</a>
      </div>
    </div>
    <div class="prod-hero__media">
      ${plate(c.imagem, {
        base, alt: c.alt, ratio: c.especime ? '1x1' : '4x5', eager: true,
        cls: c.especime ? 'plate--especime' : '',
        sizes: '(max-width: 860px) 92vw, 42vw',
      })}
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="ficha-t">
    <div class="shell">
      <h2 class="overline" id="ficha-t" data-reveal>Ficha</h2>
      <dl class="ficha mt-lg">
        <div><dt>Família</dt><dd>${c.nome}</dd></div>
        <div><dt>Classificação</dt><dd>${c.etiqueta}</dd></div>
        <div><dt>Referência</dt><dd>${c.preco}</dd></div>
        <div><dt>Dimensões e acabamento</dt><dd class="is-open">sob consulta</dd></div>
      </dl>
      <p class="caption mt-lg max-52">Espessuras, formatos e acabamentos são definidos na leitura de projeto —
        veja o <a class="link-simple" href="${base}processo.html">processo</a>.</p>
    </div>
  </section>
  ${ambiente}

  <section class="section section--tight">
    <div class="shell">${prevNext(colecoes, idx, base, 'Outras coleções')}</div>
  </section>
  ${faixaOrcamento(base, { interesse: `Coleção de interesse: ${c.nome}` })}`;

  return page({
    title: `${c.nome} — Coleções — ${brand.nome}`,
    description: c.descricao || `${c.nome}: família de pedra natural da ${brand.nome}. ${c.preco}.`,
    path: `colecoes/${c.slug}.html`,
    active: 'colecoes.html',
    depth: 1,
    ogImage: c.imagem,
    preload: c.imagem,
    schema,
    body,
  });
}

/* ============================================================ APLICAÇÕES */

function paginaAplicacoes() {
  const base = '';
  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Aplicações' }], base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">${aplicacoesCopy.overline}</p>
          <h1 class="h1" id="t">${aplicacoesCopy.titulo}</h1>
        </div>
        <p class="body max-45">${aplicacoesCopy.texto}</p>
      </div>
      ${gradeCategorias(base, { nivel: 2 })}
      <div class="tag-row mt-2xl">
        ${usos.map((u) => `<span class="tag tag--dot">${u}</span>`).join('')}
      </div>
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: `Aplicações — ${brand.nome}`,
    description: `${aplicacoesCopy.titulo} Revestimentos, pisos, muros, escadas, caminhos e calçamentos em pedra natural.`,
    path: 'aplicacoes.html',
    active: 'aplicacoes.html',
    depth: 0,
    ogImage: 'marca/estar-alvenaria',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Aplicações',
      inLanguage: 'pt-BR',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: aplicacoes.length,
        itemListElement: aplicacoes.map((a, i) => ({
          '@type': 'ListItem', position: i + 1, name: a.nome,
          url: `${brand.dominio}/${a.href}`,
        })),
      },
    },
    body,
  });
}

function paginaAplicacao(a, idx) {
  const base = '../';
  const trilha = [
    { label: 'Início', href: 'index.html', path: 'index.html' },
    { label: 'Aplicações', href: 'aplicacoes.html', path: 'aplicacoes.html' },
    { label: a.nome, path: a.href },
  ];

  /* Ritmo editorial: a primeira obra ocupa a largura toda, as seguintes
     alternam entre larga e estreita para que nenhuma fileira se repita. */
  const obras = a.fotos
    .map((f, i) => {
      const sizes = '(max-width: 860px) 92vw, (max-width: 1280px) 40vw, 34vw';
      return `
      <article class="obra" data-reveal="mask">
        <a href="${base}${f.pedra.href}" class="plate-hover">
          ${plate(f.key, { base, alt: f.alt, ratio: '4x5', sizes })}
          <div class="obra__body">
            <span class="caption">Obra ${String(i + 1).padStart(2, '0')}</span>
            <h2 class="h3">${f.pedra.nome}</h2>
            <span class="link">Conhecer a pedra${arrow}</span>
          </div>
        </a>
      </article>`;
    })
    .join('');

  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs(trilha, base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">Aplicação</p>
          <h1 class="h1" id="t">${a.chamada}</h1>
        </div>
        <div>
          <p class="body max-45">${a.linha}</p>
          <p class="caption mt-lg">${a.nome} · ${plural(a.fotos.length, 'obra registrada', 'obras registradas')}</p>
        </div>
      </div>
      <div class="obras">${obras}</div>
    </div>
  </section>

  <section class="section section--sunken section--tight" aria-labelledby="out">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Outras aplicações</p>
          <h2 class="h2" id="out" data-reveal style="--i:1">A mesma pedra, outro lugar.</h2>
        </div>
        <a class="btn btn--ghost" href="${base}acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      ${gradeCategorias(base, { destaque: a.slug })}
    </div>
  </section>
  ${faixaOrcamento(base, { interesse: `Aplicação: ${a.nome}` })}`;

  return page({
    title: `${a.nome} — Aplicações — ${brand.nome}`,
    description: `${a.chamada} ${a.linha} ${plural(a.fotos.length, 'obra', 'obras')} em pedra natural.`,
    path: a.href,
    active: 'aplicacoes.html',
    depth: 1,
    ogImage: a.capa,
    preload: a.capa,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: a.nome,
          numberOfItems: a.fotos.length,
          itemListElement: a.fotos.map((f, i) => ({
            '@type': 'ListItem', position: i + 1, name: f.pedra.nome,
            url: `${brand.dominio}/${f.pedra.href}`,
          })),
        },
        breadcrumbSchema(trilha),
      ],
    },
    body,
  });
}

/* ================================================================ ACERVO */

function paginaAcervo() {
  const base = '';
  const filtros = [
    `<button class="filtro" type="button" data-filtro="todas" aria-pressed="true">Todas</button>`,
    ...aplicacoes.map(
      (a) => `<button class="filtro" type="button" data-filtro="${a.slug}" aria-pressed="false">${a.nome}</button>`
    ),
  ].join('');

  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Acervo' }], base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">Acervo</p>
          <h1 class="h1" id="t">${pedras.length} pedras, ${aplicacoes.reduce((s, a) => s + a.fotos.length, 0)} obras.</h1>
        </div>
        <div>
          <p class="body max-45">Cada pedra do acervo registrada na obra em que foi assentada.
            Espessuras, formatos e acabamentos são definidos por projeto.</p>
          <p class="caption mt-lg" role="status" data-contagem>${plural(pedras.length, 'pedra', 'pedras')}</p>
        </div>
      </div>

      <div class="filtros" role="group" aria-label="Filtrar por aplicação">${filtros}</div>
      <div class="acervo-grid">${pedras.map((p, i) => cartaoPedra(p, base, i, 2)).join('')}</div>
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: `Acervo — ${brand.nome}`,
    description: `${pedras.length} pedras naturais registradas em obra: revestimentos, pisos, muros e muretas, escadas, caminhos e calçamentos.`,
    path: 'acervo.html',
    active: 'acervo.html',
    depth: 0,
    ogImage: pedras[0].capa,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Acervo',
      inLanguage: 'pt-BR',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: pedras.length,
        itemListElement: pedras.map((p, i) => ({
          '@type': 'ListItem', position: i + 1, name: p.nome,
          url: `${brand.dominio}/${p.href}`,
        })),
      },
    },
    body,
  });
}

function paginaPedra(p, idx) {
  const base = '../';
  const trilha = [
    { label: 'Início', href: 'index.html', path: 'index.html' },
    { label: 'Acervo', href: 'acervo.html', path: 'acervo.html' },
    { label: p.nome, path: p.href },
  ];

  const relacionadas = pedras
    .filter((o) => o.slug !== p.slug && o.aplicacoes.some((a) => p.aplicacoes.includes(a)))
    .slice(0, 4);

  const galeria = p.fotos.length > 1
    ? `
  <section class="section section--tight" aria-labelledby="gal">
    <div class="shell">
      <h2 class="overline" id="gal" data-reveal>A mesma pedra, ${plural(p.fotos.length, 'aplicação', 'aplicações')}</h2>
      <div class="galeria mt-xl">
        ${p.fotos.map((f, i) => `
        <figure data-reveal="mask" style="--i:${i}">
          ${plate(f.key, {
            base, alt: f.alt, ratio: '4x5',
            sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 31vw',
          })}
          <figcaption>${f.aplicacao}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </section>`
    : '';

  const body = `
  <section class="shell prod-hero" aria-labelledby="t">
    <div>
      ${crumbs(trilha, base)}
      <p class="overline mt-xl">Acervo · ref. ${p.refs.join(' / ')}</p>
      <h1 class="h1" id="t">${p.nome}</h1>
      <div class="tag-row mt-lg">
        ${p.aplicacoes.map((a) => `<a class="tag tag--dot" href="${base}aplicacoes/${slugSimples(a)}.html">${a}</a>`).join('')}
      </div>
      <p class="body mt-lg muted">
        ${p.fotos.length > 1
          ? `Registrada em ${plural(p.fotos.length, 'obra', 'obras')}, em ${p.aplicacoes.length} aplicações diferentes.`
          : `Registrada em obra na aplicação ${p.aplicacoes[0].toLowerCase()}.`}
        Dimensões, espessura e acabamento sob consulta.
      </p>
      <div class="prod-hero__ctas">
        <a class="btn btn--primary btn--lg" href="${base}contato.html">Solicitar ficha técnica${arrow}</a>
        <a class="btn btn--secondary btn--lg" href="${base}acervo.html">Percorrer o acervo${arrow}</a>
      </div>
    </div>
    <div class="prod-hero__media">
      ${plate(p.capa, {
        base, alt: `${p.nome} — ${p.fotos[0].aplicacao.toLowerCase()}`, ratio: '4x5', eager: true,
        sizes: '(max-width: 860px) 92vw, 42vw',
      })}
    </div>
  </section>
  ${galeria}

  <section class="section section--tight" aria-labelledby="ficha">
    <div class="shell">
      <h2 class="overline" id="ficha" data-reveal>Ficha</h2>
      <dl class="ficha mt-lg">
        <div><dt>Pedra</dt><dd>${p.nome}</dd></div>
        <div><dt>Aplicações</dt><dd>${p.aplicacoes.join(', ')}</dd></div>
        <div><dt>Referência</dt><dd>${p.refs.join(' / ')}</dd></div>
        <div><dt>Obras registradas</dt><dd>${p.fotos.length}</dd></div>
        <div><dt>Material</dt><dd class="is-open">sob consulta</dd></div>
        <div><dt>Dimensões</dt><dd class="is-open">sob consulta</dd></div>
        <div><dt>Espessura</dt><dd class="is-open">sob consulta</dd></div>
        <div><dt>Acabamento</dt><dd class="is-open">sob consulta</dd></div>
      </dl>
      <p class="caption mt-lg max-52">A especificação é fechada na leitura de projeto, antes do corte —
        veja o <a class="link-simple" href="${base}processo.html">processo</a>.</p>
    </div>
  </section>

  ${relacionadas.length ? `
  <section class="section section--sunken section--tight" aria-labelledby="rel">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Também em ${p.aplicacoes[0].toLowerCase()}</p>
          <h2 class="h2" id="rel" data-reveal style="--i:1">Pedras próximas.</h2>
        </div>
        <a class="btn btn--ghost" href="${base}acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      <div class="acervo-grid">${relacionadas.map((o, i) => cartaoPedra(o, base, i)).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section section--tight">
    <div class="shell">${prevNext(pedras, idx, base, 'Outras pedras')}</div>
  </section>
  ${faixaOrcamento(base, { interesse: `Pedra de interesse: ${p.nome}` })}`;

  return page({
    title: `${p.nome} — Acervo — ${brand.nome}`,
    description: `${p.nome} em ${p.aplicacoes.join(', ').toLowerCase()}. ${plural(p.fotos.length, 'obra registrada', 'obras registradas')} no acervo da ${brand.nome}.`,
    path: p.href,
    active: 'acervo.html',
    depth: 1,
    ogImage: p.capa,
    preload: p.capa,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: p.nome,
          category: p.aplicacoes.join(', '),
          brand: { '@type': 'Brand', name: brand.nome },
          image: p.fotos.map((f) => `${brand.dominio}/${img[f.key].base}-${img[f.key].widths.at(-1)}.webp`),
          sku: p.refs.join('/'),
        },
        breadcrumbSchema(trilha),
      ],
    },
    body,
  });
}

/* ======================================================= PROCESSO / SOBRE */

function paginaProcesso() {
  const base = '';
  const etapas = processo
    .map((e) => `
    <article class="etapa">
      <div class="etapa__n" aria-hidden="true"><span>${e.n}</span></div>
      <div class="etapa__txt">
        <span class="step__icon">${icons[e.icone]}</span>
        <h2 class="h3">${e.titulo}</h2>
        <p class="lead">${e.texto}</p>
      </div>
    </article>`)
    .join('');

  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Processo' }], base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">Processo</p>
          <h1 class="h1" id="t">Quatro etapas entre o projeto e a pedra assentada.</h1>
        </div>
        <p class="body max-45">${aplicacoesCopy.texto}</p>
      </div>
      <div class="etapas">${etapas}</div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="gar">
    <div class="shell">
      <div class="split">
        <div class="split__media" data-reveal="mask">
          ${plate('marca/muro-noturno', {
            base, ratio: '', parallax: '0.04',
            alt: 'Muro de pedra iluminado por luz rasante, revelando o relevo de cada bloco',
            sizes: '(max-width: 900px) 100vw, 50vw',
          })}
        </div>
        <div class="split__body">
          <p class="overline" data-reveal>Garantia</p>
          <h2 class="h2" id="gar" data-reveal style="--i:1">Cinco anos sobre fixação e rejunte.</h2>
          <p class="body">${processo[3].texto}</p>
        </div>
      </div>
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: `Processo — ${brand.nome}`,
    description: 'Leitura de projeto, seleção de bloco na pedreira, corte numerado e instalação com equipe própria e cinco anos de garantia.',
    path: 'processo.html',
    active: 'processo.html',
    depth: 0,
    ogImage: 'marca/muro-noturno',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Do projeto à pedra assentada',
      inLanguage: 'pt-BR',
      step: processo.map((e, i) => ({
        '@type': 'HowToStep', position: i + 1, name: e.titulo, text: e.texto,
      })),
    },
    body,
  });
}

function paginaSobre() {
  const base = '';
  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Sobre' }], base)}
      <div class="intro mt-2xl">
        <div>
          <p class="overline">${brand.overline}</p>
          <h1 class="h1 mt-lg" id="t">${lines(['A pedra não reveste.', 'Ela define o lugar.'], { revelar: false })}</h1>
          <p class="lead mt-xl">${brand.intro}</p>
          <p class="body mt-lg">${aplicacoesCopy.texto}</p>
          <dl class="figures">
            ${indicadores.map((n) => `<div><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join('')}
          </dl>
        </div>
        <figure class="intro__media">
          ${plate('marca/residencia-encosta', {
            base, ratio: 'tall', parallax: '0.05',
            alt: 'Residência em encosta ao entardecer, com base e muros em pedra natural',
            sizes: '(max-width: 860px) 92vw, 40vw',
          })}
          <figcaption class="caption">Residência com base, muros e caminho em pedra natural.</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="section section--sunken section--tight" aria-labelledby="pr">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Processo</p>
          <h2 class="h2" id="pr" data-reveal style="--i:1">Quatro etapas entre o projeto e a pedra assentada.</h2>
        </div>
        <a class="btn btn--ghost" href="processo.html">Ver o processo${arrow}</a>
      </div>
      ${passos()}
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="pc">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Praças</p>
          <h2 class="h2" id="pc" data-reveal style="--i:1">${brand.pracas}</h2>
        </div>
        <p class="body max-45">${brand.assinatura}
          Atendimento ${brand.horario.toLowerCase()}.</p>
      </div>
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: `Sobre — ${brand.nome}`,
    description: `${brand.assinatura} Em atividade desde ${brand.desde}, com praças em São Paulo e Vitória.`,
    path: 'sobre.html',
    active: 'sobre.html',
    depth: 0,
    body,
  });
}

/* A página de contato já é o pedido: a ação vem logo abaixo do título, junto
   dos canais diretos, e a faixa de orçamento não se repete no fim. */
function paginaContato() {
  const base = '';
  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Contato' }], base)}
      <div class="intro mt-2xl">
        <div>
          <p class="overline">${orcamento.overline}</p>
          <h1 class="h1 mt-lg" id="t">${lines(orcamento.titulo, { revelar: false })}</h1>
          <p class="lead mt-xl">${orcamento.texto}</p>
          ${acaoPedido('contato')}

          <dl class="ficha ficha--contato mt-2xl">
            <div><dt>Telefone</dt><dd><a class="link-simple" href="tel:${brand.telefoneLink}">${brand.telefone}</a></dd></div>
            <div><dt>E-mail</dt><dd><a class="link-simple" href="mailto:${brand.email}">${brand.email}</a></dd></div>
            <div><dt>Praças</dt><dd>${brand.pracas}</dd></div>
            <div><dt>Atendimento</dt><dd>${brand.horario}</dd></div>
          </dl>
        </div>
        <figure class="intro__media">
          ${plate('marca/estar-alvenaria', {
            base, ratio: 'tall', parallax: '0.05',
            alt: 'Sala de estar com parede inteira em alvenaria seca',
            sizes: '(max-width: 860px) 92vw, 40vw',
          })}
          <figcaption class="caption">${aplicacoesCopy.titulo}</figcaption>
        </figure>
      </div>
    </div>
  </section>`;

  return page({
    title: `Contato — ${brand.nome}`,
    description: `${orcamento.texto} ${brand.telefone} · ${brand.email}`,
    path: 'contato.html',
    active: '',
    depth: 0,
    ogImage: 'marca/estar-alvenaria',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      inLanguage: 'pt-BR',
      mainEntity: {
        '@type': 'Organization',
        name: brand.nomeCompleto,
        email: brand.email,
        telephone: brand.telefone,
      },
    },
    body,
  });
}

function pagina404() {
  const base = '';
  return page({
    title: `Página não encontrada — ${brand.nome}`,
    description: 'A página procurada não existe.',
    path: '404.html',
    depth: 0,
    body: `
    <section class="section section--erro">
      <div class="shell">
        <p class="overline">Erro 404</p>
        <h1 class="h1 mt-lg">${lines(['Esta página', 'saiu do mapa.'], { revelar: false })}</h1>
        <p class="lead mt-xl">O endereço não corresponde a nenhuma página do site.</p>
        <div class="hero__ctas">
          <a class="btn btn--primary btn--lg" href="${base}index.html">Voltar ao início${arrow}</a>
          <a class="btn btn--secondary btn--lg" href="${base}acervo.html">Percorrer o acervo${arrow}</a>
        </div>
      </div>
    </section>`,
  });
}

/* ================================================================= saída */

function main() {
  const rotas = [];
  const emitir = (rel, html) => { escreve(rel, html); rotas.push(rel); };

  emitir('index.html', home());
  emitir('colecoes.html', paginaColecoes());
  colecoes.forEach((c, i) => emitir(`colecoes/${c.slug}.html`, paginaColecao(c, i)));
  emitir('aplicacoes.html', paginaAplicacoes());
  aplicacoes.forEach((a, i) => emitir(a.href, paginaAplicacao(a, i)));
  emitir('acervo.html', paginaAcervo());
  pedras.forEach((p, i) => emitir(p.href, paginaPedra(p, i)));
  emitir('processo.html', paginaProcesso());
  emitir('sobre.html', paginaSobre());
  emitir('contato.html', paginaContato());
  escreve('404.html', pagina404());

  const hoje = new Date().toISOString().slice(0, 10);
  escreve(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      rotas.map((r) => `\n  <url><loc>${brand.dominio}/${r}</loc><lastmod>${hoje}</lastmod></url>`).join('') +
      `\n</urlset>\n`
  );
  escreve('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${brand.dominio}/sitemap.xml\n`);

  console.log(`${rotas.length} páginas geradas em site/`);
}

main();
