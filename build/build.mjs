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
  brand, aplicacoes, pedras, cubas, cubasFicha,
  aplicacoesCopy, orcamento, indicadores, img,
} from './data.mjs';
import { arrow, icons, whatsapp, instagram } from './icons.mjs';
import { page, plate, lines, btn, esc, crumbs, breadcrumbSchema, canais, pendente, whatsappHref } from './layout.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..', 'site');

const escreve = (rel, html) => {
  const destino = join(SITE, rel);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
};

const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;

/* SEO: título com o que se procura + região, e a marca no fim. O Google corta
   perto de 60–70 caracteres; se a marca não couber, sai ela, não a busca. */
const titulo = (principal) => {
  const cheio = `${principal} | ${brand.nome}`;
  return cheio.length <= 70 ? cheio : principal;
};
/** Descrição até 160 caracteres, cortada em palavra inteira. */
const resumo = (texto) => {
  if (texto.length <= 160) return texto;
  const corte = texto.slice(0, 157);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
};

/* ============================================================ texto de SEO */

/* O ramo é o de pedras decorativas (pedra natural rústica, vendida por m², unidade ou
   caminhão), não o de rochas ornamentais em chapa das marmorarias. O que está no
   topo do Google para "pedras decorativas" tem texto corrido,
   perguntas frequentes e H1 que diz o que se vende. Aqui o texto sai só do
   quadro de produtos e da ficha das cubas — nada inventado. */
const listaNatural = (itens) =>
  itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
const unidadeTexto = (u) => (u === 'm²' ? 'm²' : u.toLowerCase());
const linkPedra = (p, base) => `<a href="${base}${p.href}">${p.nome}</a>`;
const pedrasDe = (tipologia) => pedras.filter((p) => p.aplicacoes.includes(tipologia));

function perguntasFrequentes() {
  const unidades = [...new Set(pedras.flatMap((p) => p.linhas.map((l) => unidadeTexto(l.unidade))))];
  const nomes = (t) => listaNatural(pedrasDe(t).map((p) => p.nome));
  return [
    ['Quais pedras decorativas a Magah Minerale vende?',
      `São ${pedras.length} pedras naturais — moledos, lajões, granitos, São Tomé, Miracema, Atacama, pedra madeira, ` +
      `rachão, folheta e paralelepípedos —${cubas.length ? ` e ${cubas.length} cubas esculpidas em pedra` : ''}. ` +
      `Todas estão no acervo, com cor, tamanho, espessura e unidade de venda.`],
    ['Como pedir um orçamento de pedra decorativa?',
      `Pelo WhatsApp ${brand.whatsappExibicao}. Diga a pedra, a aplicação, a metragem ou quantidade e a cidade da obra.`],
    ['Quais pedras servem para piso?', `No quadro de pisos estão ${nomes('Pisos')}.`],
    ['Quais pedras servem para muro e mureta?', `Para muros e muretas: ${nomes('Muros e Muretas')}.`],
    ['Quais pedras servem para revestir parede e fachada?', `Para revestimentos: ${nomes('Revestimentos')}.`],
    ['Como as pedras são vendidas?',
      `Depende da pedra e da aplicação: por ${listaNatural(unidades)}. A ficha de cada pedra mostra a unidade.`],
    ...(cubas.length ? [['Qual o tamanho das cubas de pedra?',
      `O padrão é ${cubasFicha.padrao}. Fora do padrão, analisamos caso a caso peças de até 90 cm.`]] : []),
    [`A Magah Minerale atende em ${brand.regiao}?`,
      `Sim. O atendimento é em ${brand.regiao}, pelo WhatsApp ${brand.whatsappExibicao}` +
      `${brand.email ? ` ou pelo e-mail ${brand.email}` : ''}.`],
  ];
}

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
  // WhatsApp é o canal principal do pedido; o e-mail fica nos canais diretos.
  if (brand.whatsapp) {
    return `
          <div class="pedido">
            <a class="btn btn--primary btn--lg" href="${esc(whatsappHref())}" target="_blank" rel="noopener"
               aria-describedby="${id}-nota">Chamar no WhatsApp${arrow}</a>
            <p class="pedido__nota" id="${id}-nota">Abre o WhatsApp com a mensagem pronta, em nova aba.</p>
          </div>`;
  }
  // Sem canal nenhum, o botão não tem para onde mandar: a página diz que falta.
  if (!brand.email) {
    return `
          <div class="pedido">
            <p class="pedido__nota">${pendente(orcamento.pendente)}</p>
          </div>`;
  }
  return `
          <div class="pedido">
            <a class="btn btn--primary btn--lg" href="${esc(pedidoPorEmail(interesse))}"
               aria-describedby="${id}-nota">${orcamento.botao}${arrow}</a>
            <p class="pedido__nota" id="${id}-nota">${orcamento.nota}</p>
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
          ${canais().length
            ? `<p class="cta__canais">Ou fale direto: ${canais().map((c) => c.html).join(' <span aria-hidden="true">·</span> ')}</p>`
            : ''}
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

/**
 * Cartão de pedra usado no acervo e nas listas relacionadas. A foto tem de ser
 * da aplicação em que o cartão aparece: sob o filtro Escadas, a foto da escada,
 * não a do revestimento. Com `aplicacao`, o cartão leva só essa foto; sem ela
 * (acervo), leva uma por aplicação e o filtro em site.js mostra a que bate.
 */
function cartaoPedra(p, base, i = 0, nivel = 3, aplicacao = null) {
  const fotos = aplicacao ? p.fotos.filter((f) => f.aplicacao === aplicacao) : p.fotos;
  const capas = fotos.map((f, n) => `
    <div class="pedra-card__capa" data-capa="${f.aplicacaoSlug}"${n ? ' hidden' : ''}>
    ${plate(f.key, {
      base, alt: `${p.nome} — ${f.aplicacao.toLowerCase()}`, ratio: '4x5',
      sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 23vw',
    })}
    </div>`).join('');
  return `
  <a class="pedra-card" href="${base}${p.href}" data-reveal style="--i:${i % 4}"
     data-aplicacoes="${p.aplicacoes.map((a) => slugSimples(a)).join(' ')}">
    ${capas}
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

/** Cartão de cuba — mesmo desenho do cartão de pedra, filtro "cubas". */
function cartaoCuba(c, base, i = 0, nivel = 3) {
  return `
  <a class="pedra-card" href="${base}${c.href}" data-reveal style="--i:${i % 4}"
     data-aplicacoes="cubas">
    <div class="pedra-card__capa" data-capa="cubas">
    ${plate(c.capa, {
      base, alt: c.titulo, ratio: '4x5', cls: 'plate--cuba',
      sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 23vw',
    })}
    </div>
    <h${nivel} class="pedra-card__name">${c.titulo}</h${nivel}>
    <p class="pedra-card__meta">
      <span>Cubas</span>
      ${c.fotos.length > 1 ? `<span class="accent-italic">${c.fotos.length} fotos</span>` : ''}
    </p>
  </a>`;
}

/** WhatsApp com a peça já escrita na mensagem. */
const whatsappPeca = (peca) =>
  `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
    `Olá! Vim pelo site da ${brand.nome} e tenho interesse na ${peca}. Pode me passar medidas e valor?`)}`;

/** Anterior / próximo dentro de uma lista. */
function prevNext(lista, idx, base, rotulo) {
  const ant = lista[(idx - 1 + lista.length) % lista.length];
  const prox = lista[(idx + 1) % lista.length];
  const href = (x) => base + x.href;
  return `
  <nav class="prevnext" aria-label="${rotulo}">
    <a href="${href(ant)}"><span class="caption">Anterior</span><span class="h4">${ant.titulo ?? ant.nome}</span></a>
    <a href="${href(prox)}"><span class="caption">Próxima</span><span class="h4">${prox.titulo ?? prox.nome}</span></a>
  </nav>`;
}

/* ================================================================== HOME */

function home() {
  const base = '';

  const hero = `
  <section class="hero" aria-labelledby="hero-t">
    <div class="hero__glow" aria-hidden="true"></div>
    <div class="hero__copy">
      <h1 class="overline" id="hero-t">${brand.overline}</h1>
      <p class="display">${lines(['A pedra não reveste.', 'Ela define o lugar.'], { revelar: false })}</p>
      <p class="lead">${brand.intro}</p>
      <div class="hero__ctas">
        <a class="btn btn--primary btn--lg" href="#orcamento">Solicitar orçamento${arrow}</a>
        <a class="btn btn--secondary btn--lg" href="acervo.html">Ver as pedras${arrow}</a>
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
            ${brand.assinatura} <span class="accent-italic">${aplicacoes.length} tipologias, ${pedras.length} pedras.</span>
          </h2>
          <dl class="figures">
            ${indicadores.map((n) => `<div><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join('')}
          </dl>
        </div>
        <figure class="intro__media">
          <div data-reveal="mask">
            ${plate('marca/alvenaria-seca', {
              base, ratio: 'tall', parallax: '0.05',
              alt: 'Detalhe de parede em pedra natural: blocos irregulares encaixados',
              sizes: '(max-width: 860px) 92vw, 40vw',
            })}
          </div>
        </figure>
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
            alt: 'Sala de estar com parede inteira em pedra natural, poltrona e ripado de madeira',
            sizes: '(max-width: 900px) 100vw, 50vw',
          })}
        </div>
        <div class="split__body">
          <p class="overline" data-reveal>${aplicacoesCopy.overline}</p>
          <h2 class="h2" id="apl-t" data-reveal style="--i:1">${aplicacoesCopy.titulo}</h2>
          <p class="body">${aplicacoesCopy.texto}</p>
          <div class="tag-row">
            ${aplicacoes.map((a) => `<a class="tag" href="${a.href}">${a.nome}</a>`).join('')}
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
          <h2 class="h2" id="acv-t" data-reveal style="--i:1">Seis aplicações, ${pedras.length} pedras${cubas.length ? ` e ${cubas.length} cubas` : ''}.</h2>
        </div>
        <a class="btn btn--ghost" href="acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      ${gradeCategorias(base)}
    </div>
  </section>`;

  const faq = perguntasFrequentes();
  const secGuia = `
  <section class="section" aria-labelledby="guia-t">
    <div class="shell guia">
      <div>
        <p class="overline" data-reveal>Guia</p>
        <h2 class="h2 mt-lg" id="guia-t" data-reveal style="--i:1">Pedras decorativas em ${brand.regiao}.</h2>
        <p class="body mt-xl">A ${brand.nome} vende pedras decorativas naturais em ${brand.regiao} para
          ${listaNatural(aplicacoes.map((a) => `<a href="${a.href}">${a.nome.toLowerCase()}</a>`))}.
          Cada pedra do acervo traz cor, tamanho, espessura e unidade de venda por aplicação.</p>
        <p class="body">Para revestir paredes e fachadas, há moledos, pedra madeira, Atacama, Miracema e granito
          mosaico. Para pisos, varandas e bordas de piscina, lajões como ${listaNatural(pedrasDe('Pisos').filter((p) => /Lajão/.test(p.nome)).map((p) => linkPedra(p, base)))}.
          Para muros e muretas, ${listaNatural(pedrasDe('Muros e Muretas').map((p) => linkPedra(p, base)))}.
          Para calçamento, ${listaNatural(pedrasDe('Calçamentos e Estradas').map((p) => linkPedra(p, base)))}.</p>
        ${cubas.length ? `<p class="body">E ${cubas.length} <a href="acervo.html?a=cubas">cubas de pedra</a> para banheiro e lavabo,
          esculpidas em peças únicas de ametista, quartzo, fluorita, sodalita, ônix, basalto, mármore e outras pedras.
          Padrão ${cubasFicha.padrao}; sob medida até 90 cm.</p>` : ''}
      </div>
      <div class="faq">
        <h2 class="h3" id="faq-t">Perguntas frequentes</h2>
        ${faq.map(([q, r]) => `
        <details>
          <summary>${q}</summary>
          <p>${r}</p>
        </details>`).join('')}
      </div>
    </div>
  </section>`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(([q, r]) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: r.replace(/<[^>]+>/g, '') },
        })),
      },
      {
        // Negócio local: o Google usa areaServed e o telefone para buscas "perto de mim" / "em SP".
        '@type': ['Organization', 'HomeAndConstructionBusiness'],
        '@id': `${brand.dominio}/#org`,
        name: brand.nomeCompleto,
        alternateName: brand.nome,
        url: brand.dominio,
        logo: `${brand.dominio}/assets/brand/logo-empilhado.svg`,
        description: brand.assinatura,
        ...(brand.email ? { email: brand.email } : {}),
        ...(brand.telefone ? { telephone: brand.telefone } : {}),
        image: `${brand.dominio}/${img['marca/residencia-encosta'].base}-og.jpg`,
        areaServed: { '@type': 'State', name: brand.regiao, containedInPlace: { '@type': 'Country', name: 'Brasil' } },
        ...(brand.instagram ? { sameAs: [brand.instagram] } : {}),
        knowsAbout: ['Pedras decorativas', 'Pedras ornamentais', 'Pedra natural', 'Revestimento de pedra', 'Piso de pedra', 'Muro de pedra', 'Cuba de pedra', 'Paralelepípedo'],
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
    title: titulo(`Pedras Decorativas e Cubas de Pedra em ${brand.regiao}`),
    description: resumo(`Pedras decorativas e naturais em ${brand.regiao}: moledo, lajão, granito, São Tomé, ` +
      `paralelepípedo, pedras para muro e cubas de pedra. Orçamento pelo WhatsApp.`),
    path: 'index.html',
    active: '',
    depth: 0,
    preload: 'marca/residencia-encosta',
    schema,
    body: hero + materia + secAplicacoes + secAcervo + secGuia + faixaOrcamento(base),
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
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: titulo(`Pedras Decorativas para Revestimento, Piso e Muro em ${brand.regiaoCurta}`),
    description: resumo(`Pedras decorativas para revestimentos, pisos, muros e muretas, escadas, caminhos e praças e ` +
      `calçamentos em ${brand.regiao}. Veja as obras e peça orçamento.`),
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
      <p class="body max-45 mt-xl">${a.nome} em pedra decorativa natural, em ${brand.regiao}. ${a.linha}
        Pedras do acervo para ${a.nome.toLowerCase()}: ${listaNatural(pedrasDe(a.nome).map((p) => linkPedra(p, base)))}.</p>
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
    title: titulo(`${a.nome} em Pedra Decorativa em ${brand.regiaoCurta}`),
    description: resumo(`${a.nome} em pedra decorativa natural em ${brand.regiao}: ${a.linha.toLowerCase().replace(/\.$/, '')}. ` +
      `${plural(a.fotos.length, 'obra', 'obras')} com a pedra usada em cada uma.`),
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
    ...(cubas.length ? ['<button class="filtro" type="button" data-filtro="cubas" aria-pressed="false">Cubas</button>'] : []),
  ].join('');

  const body = `
  <section class="section" aria-labelledby="t">
    <div class="shell">
      ${crumbs([{ label: 'Início', href: 'index.html' }, { label: 'Acervo' }], base)}
      <div class="section-head mt-xl">
        <div class="section-head__txt">
          <p class="overline">Acervo</p>
          <h1 class="h1" id="t">${cubas.length
            ? `${pedras.length} pedras, ${cubas.length} cubas.`
            : `${pedras.length} pedras, ${aplicacoes.reduce((s, a) => s + a.fotos.length, 0)} obras.`}</h1>
        </div>
        <div>
          <p class="body max-45">Cada pedra registrada na obra em que foi assentada, com cor,
            tamanho, espessura e unidade de venda por aplicação${cubas.length ? '. E as cubas esculpidas em pedra, peça a peça' : ''}.</p>
          <p class="caption mt-lg" role="status" data-contagem>${cubas.length
            ? plural(pedras.length + cubas.length, 'peça', 'peças')
            : plural(pedras.length, 'pedra', 'pedras')}</p>
        </div>
      </div>

      <div class="filtros" role="group" aria-label="Filtrar por aplicação">${filtros}</div>
      <div class="acervo-grid">${pedras.map((p, i) => cartaoPedra(p, base, i, 2)).join('')}${cubas.map((c, i) => cartaoCuba(c, base, i, 2)).join('')}</div>
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: titulo(`Pedras Decorativas e Cubas de Pedra em ${brand.regiaoCurta}: Acervo`),
    description: `${pedras.length} pedras decorativas registradas em obra${cubas.length ? ` e ${cubas.length} cubas esculpidas em pedra` : ''}: revestimentos, pisos, muros e muretas, escadas, caminhos e praças, calçamentos e estradas.`,
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
        numberOfItems: pedras.length + cubas.length,
        itemListElement: [...pedras.map((p) => [p.nome, p.href]), ...cubas.map((c) => [c.titulo, c.href])]
          .map(([name, href], i) => ({
            '@type': 'ListItem', position: i + 1, name,
            url: `${brand.dominio}/${href}`,
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
    .filter((o) => o.slug !== p.slug && o.aplicacoes.includes(p.aplicacoes[0]))
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
      <p class="overline mt-xl">Acervo</p>
      <h1 class="h1" id="t">${p.nome}</h1>
      <div class="tag-row mt-lg">
        ${p.aplicacoes.map((a) => `<a class="tag tag--dot" href="${base}aplicacoes/${slugSimples(a)}.html">${a}</a>`).join('')}
      </div>
      <p class="body mt-lg muted">
        ${p.linhas.length > 1
          ? `Vendida em ${p.aplicacoes.length} aplicações. A ficha abaixo traz cor, tamanho, espessura e unidade de cada uma.`
          : `${p.linhas[0].cor} · ${p.linhas[0].tamanho} · vendida por ${p.linhas[0].unidade.toLowerCase() === 'm²' ? 'm²' : p.linhas[0].unidade.toLowerCase()}.`}
      </p>
      <div class="prod-hero__ctas">
        <a class="btn btn--primary btn--lg" href="${base}contato.html">Solicitar orçamento${arrow}</a>
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
      <p class="body max-45 mt-lg">${p.nome} é uma pedra decorativa natural para
        ${listaNatural(p.aplicacoes.map((a) => a.toLowerCase()))}, vendida pela ${brand.nome} em ${brand.regiao}.
        ${p.linhas.map((l) => `Em ${l.tipologia.toLowerCase()}: ${l.cor.toLowerCase()}, ${l.tamanho.toLowerCase()}` +
          `${l.espessura ? `, espessura ${l.espessura}` : ''}, vendida por ${unidadeTexto(l.unidade)}.`).join(' ')}
        Para orçamento, diga a aplicação e a metragem pelo WhatsApp.</p>
      ${p.linhas.map((l) => `
      <div class="ficha-grupo mt-lg">
        <h3 class="h4">${l.tipologia}</h3>
        <dl class="ficha">
          <div><dt>Cor / tonalidade</dt><dd>${l.cor}</dd></div>
          <div><dt>Tamanho</dt><dd>${l.tamanho}</dd></div>
          <div><dt>Espessura</dt>${l.espessura ? `<dd>${l.espessura}</dd>` : '<dd class="is-open">não informada</dd>'}</div>
          <div><dt>Unidade de venda</dt><dd>${l.unidade}</dd></div>
        </dl>
      </div>`).join('')}
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
      <div class="acervo-grid">${relacionadas.map((o, i) => cartaoPedra(o, base, i, 3, p.aplicacoes[0])).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section section--tight">
    <div class="shell">${prevNext(pedras, idx, base, 'Outras pedras')}</div>
  </section>
  ${faixaOrcamento(base, { interesse: `Pedra de interesse: ${p.nome}` })}`;

  return page({
    title: titulo(`${p.nome} para ${p.aplicacoes[0]} em ${brand.regiaoCurta}`),
    description: resumo(`${p.nome}: pedra decorativa para ${p.aplicacoes.join(', ').toLowerCase()} em ${brand.regiao}. ` +
      `${p.linhas[0].cor}, ${p.linhas[0].tamanho.toLowerCase()}, vendida por ${p.linhas[0].unidade === 'm²' ? 'm²' : p.linhas[0].unidade.toLowerCase()}. Orçamento pelo WhatsApp.`),
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
          color: [...new Set(p.linhas.map((l) => l.cor))].join('; '),
        },
        breadcrumbSchema(trilha),
      ],
    },
    body,
  });
}

/* ================================================================== CUBA */

function paginaCuba(c, idx) {
  const base = '../';
  const trilha = [
    { label: 'Início', href: 'index.html', path: 'index.html' },
    { label: 'Acervo', href: 'acervo.html', path: 'acervo.html' },
    { label: c.titulo, path: c.href },
  ];
  const outras = [1, 2, 3, 4].map((k) => cubas[(idx + k) % cubas.length]).filter((o) => o !== c);

  const galeria = c.fotos.length > 1
    ? `
  <section class="section section--tight" aria-labelledby="gal">
    <div class="shell">
      <h2 class="overline" id="gal" data-reveal>A mesma peça, ${plural(c.fotos.length, 'foto', 'fotos')}</h2>
      <div class="galeria mt-xl">
        ${c.fotos.map((f, i) => `
        <figure data-reveal="mask" style="--i:${i}">
          ${plate(f.key, {
            base, alt: `${c.titulo}, foto ${i + 1}`, ratio: '4x5', cls: 'plate--cuba',
            sizes: '(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 31vw',
          })}
        </figure>`).join('')}
      </div>
    </div>
  </section>`
    : '';

  const body = `
  <section class="shell prod-hero" aria-labelledby="t">
    <div>
      ${crumbs(trilha, base)}
      <p class="overline mt-xl">Acervo · Cubas</p>
      <h1 class="h1" id="t">${c.titulo}</h1>
      <div class="tag-row mt-lg">
        <a class="tag tag--dot" href="${base}acervo.html?a=cubas">Cubas</a>
      </div>
      <p class="body mt-lg muted">Cuba de pedra natural para banheiro e lavabo: peça única, esculpida em ${c.nome}. Medidas a consultar.</p>
      <div class="prod-hero__ctas">
        <a class="btn btn--primary btn--lg" href="${esc(whatsappPeca(`cuba ${c.nome}`))}" target="_blank" rel="noopener">Pedir orçamento${arrow}</a>
        <a class="btn btn--secondary btn--lg" href="${base}acervo.html?a=cubas">Ver todas as cubas${arrow}</a>
      </div>
    </div>
    <div class="prod-hero__media">
      ${plate(c.capa, {
        base, alt: c.titulo, ratio: '4x5', cls: 'plate--cuba', eager: true,
        sizes: '(max-width: 860px) 92vw, 42vw',
      })}
    </div>
  </section>
  ${galeria}

  <section class="section section--tight" aria-labelledby="ficha">
    <div class="shell">
      <h2 class="overline" id="ficha" data-reveal>Ficha</h2>
      <p class="body max-45 mt-lg">A cuba ${c.nome} é uma cuba de pedra natural para banheiro
        e lavabo, esculpida numa peça única de ${c.nome}: cor, veios e formato mudam de uma cuba para outra.
        O tamanho padrão é ${cubasFicha.padrao}; fora do padrão, analisamos caso a caso peças de até 90 cm.
        Atendimento em ${brand.regiao}, com orçamento pelo WhatsApp.</p>
      <div class="ficha-grupo mt-lg">
        <h3 class="h4">Medidas a consultar</h3>
        <dl class="ficha">
          <div><dt>Padrão</dt><dd>${cubasFicha.padrao}</dd></div>
          <div><dt>Sob medida</dt><dd>${cubasFicha.sobMedida}</dd></div>
          <div><dt>Material</dt><dd>${c.nome}</dd></div>
          <div><dt>Unidade de venda</dt><dd>${cubasFicha.unidade}</dd></div>
        </dl>
      </div>
    </div>
  </section>

  ${outras.length ? `
  <section class="section section--sunken section--tight" aria-labelledby="rel">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Também no acervo</p>
          <h2 class="h2" id="rel" data-reveal style="--i:1">Outras cubas.</h2>
        </div>
        <a class="btn btn--ghost" href="${base}acervo.html?a=cubas">Ver todas as cubas${arrow}</a>
      </div>
      <div class="acervo-grid">${outras.map((o, i) => cartaoCuba(o, base, i, 3)).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section section--tight">
    <div class="shell">${prevNext(cubas, idx, base, 'Outras cubas')}</div>
  </section>
  ${faixaOrcamento(base, { interesse: `Cuba de interesse: ${c.nome}` })}`;

  return page({
    title: titulo(`Cuba de Pedra ${c.nome} em ${brand.regiaoCurta}`),
    description: resumo(`Cuba de pedra ${c.nome} para banheiro e lavabo, peça única. ` +
      `Padrão 48 × 38 × 15 cm, sob medida até 90 cm. ${brand.regiao}.`),
    path: c.href,
    active: 'acervo.html',
    depth: 1,
    ogImage: c.capa,
    preload: c.capa,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: c.titulo,
          category: 'Cubas',
          brand: { '@type': 'Brand', name: brand.nome },
          image: c.fotos.map((f) => `${brand.dominio}/${img[f.key].base}-${img[f.key].widths.at(-1)}.webp`),
          material: c.nome,
        },
        breadcrumbSchema(trilha),
      ],
    },
    body,
  });
}

/* ================================================================= SOBRE */

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

  <section class="section section--sunken section--tight" aria-labelledby="ap">
    <div class="shell">
      <div class="section-head">
        <div class="section-head__txt">
          <p class="overline" data-reveal>Acervo</p>
          <h2 class="h2" id="ap" data-reveal style="--i:1">Seis aplicações, ${pedras.length} pedras.</h2>
        </div>
        <a class="btn btn--ghost" href="acervo.html">Percorrer o acervo${arrow}</a>
      </div>
      ${gradeCategorias(base)}
    </div>
  </section>
  ${faixaOrcamento(base)}`;

  return page({
    title: titulo(`Sobre — Pedras Decorativas em ${brand.regiaoCurta}`),
    description: resumo(`${brand.nome}: pedras decorativas e naturais para arquitetura em ${brand.regiao}. ${pedras.length} pedras em ` +
      `${aplicacoes.length} tipologias${cubas.length ? ` e ${cubas.length} cubas esculpidas em pedra` : ''}.`),
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
            ${[
              ['WhatsApp', brand.whatsapp && `<a class="link-simple canal" href="${esc(whatsappHref())}" target="_blank" rel="noopener">${whatsapp}${brand.whatsappExibicao}</a>`],
              ['Instagram', brand.instagram && `<a class="link-simple canal" href="${brand.instagram}" target="_blank" rel="noopener">${instagram}${brand.instagramUsuario}</a>`],
              ['Telefone', brand.telefone && `<a class="link-simple canal" href="tel:${brand.telefoneLink}">${icons.telefone}${brand.telefone}</a>`],
              ['E-mail', brand.email && `<a class="link-simple canal" href="mailto:${brand.email}">${icons.email}${brand.email}</a>`],
            ].map(([dt, dd]) => `<div><dt>${dt}</dt>${dd ? `<dd>${dd}</dd>` : '<dd class="is-open">a definir</dd>'}</div>`).join('')}
          </dl>
        </div>
        <figure class="intro__media">
          ${plate('marca/estar-alvenaria', {
            base, ratio: 'tall', parallax: '0.05',
            alt: 'Sala de estar com parede inteira em pedra natural',
            sizes: '(max-width: 860px) 92vw, 40vw',
          })}
          <figcaption class="caption">${aplicacoesCopy.titulo}</figcaption>
        </figure>
      </div>
    </div>
  </section>`;

  return page({
    title: titulo(`Contato e Orçamento — Pedras Decorativas em ${brand.regiaoCurta}`),
    description: resumo(`Peça orçamento de pedras decorativas ou cuba de pedra em ${brand.regiao}: WhatsApp ` +
      `${brand.whatsappExibicao}, Instagram ${brand.instagramUsuario} e e-mail.`),
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
        ...(brand.email ? { email: brand.email } : {}),
        ...(brand.telefone ? { telephone: brand.telefone } : {}),
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
  emitir('aplicacoes.html', paginaAplicacoes());
  aplicacoes.forEach((a, i) => emitir(a.href, paginaAplicacao(a, i)));
  emitir('acervo.html', paginaAcervo());
  pedras.forEach((p, i) => emitir(p.href, paginaPedra(p, i)));
  cubas.forEach((c, i) => emitir(c.href, paginaCuba(c, i)));
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
