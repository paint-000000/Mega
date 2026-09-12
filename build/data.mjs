/**
 * Modelo de conteúdo — Magah Minerale
 *
 * Duas fontes, nenhuma inventada:
 *
 *  1. O arquivo Figma (phhwxTc201bO9i1FCHBRVS) — identidade, tokens, as quatro
 *     coleções assinadas, o processo em quatro etapas, contato e textos
 *     institucionais. Copiados literalmente.
 *
 *  2. As pastas de fotografia deste diretório — 41 fotografias de obra,
 *     organizadas nas seis aplicações reais. Os nomes das pedras vêm dos
 *     próprios arquivos; o sufixo de aplicação repetido no nome do arquivo
 *     vira o campo `aplicacoes`, não é descartado.
 *
 * Onde o material não informa (espessura, dimensão, acabamento das pedras do
 * acervo), o site diz "sob consulta". Nada é preenchido por suposição.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const img = JSON.parse(readFileSync(join(HERE, 'images.json'), 'utf8'));

export const slug = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

/* ------------------------------------------------------------------ marca */

export const brand = {
  nome: 'Magah Minerale',
  nomeCompleto: 'Magah Minerale Pedras Naturais',
  overline: 'PEDRA NATURAL · DESDE 1998',
  desde: 1998,
  assinatura: 'Pedra natural para arquitetura. Extração, corte e instalação própria.',
  manifesto: 'A pedra não reveste. Ela define o lugar.',
  intro:
    'Blocos brutos, alvenaria seca e superfícies minerais selecionadas bloco a bloco. ' +
    'Fornecemos e instalamos para arquitetura residencial de alto padrão em todo o Brasil.',
  telefone: '+55 11 4000-0000',
  telefoneLink: '+551140000000',
  email: 'contato@magahminerale.com.br',
  pracas: 'São Paulo · Vitória',
  horario: 'Seg a sex, 8h–18h',
  cnpj: 'CNPJ 00.000.000/0001-00',
  dominio: 'https://www.magahminerale.com.br',
};

export const nav = [
  { label: 'Coleções', href: 'colecoes.html' },
  { label: 'Aplicações', href: 'aplicacoes.html' },
  { label: 'Acervo', href: 'acervo.html' },
  { label: 'Processo', href: 'processo.html' },
  { label: 'Sobre', href: 'sobre.html' },
];

/* --------------------------------------------------- coleções (do Figma) */
/* Textos, preços e etiquetas transcritos do arquivo. A quarta família é
   nomeada no rodapé do Figma, sem card — por isso não recebe descrição. */

export const colecoes = [
  {
    slug: 'alvenaria-seca',
    nome: 'Alvenaria seca',
    etiqueta: 'Alvenaria',
    descricao: 'Bloco irregular assentado sem argamassa aparente. Para muros, fachadas e bases.',
    preco: 'a partir de R$ 380 / m²',
    imagem: 'marca/alvenaria-seca',
    ambiente: 'marca/estar-alvenaria',
    alt: 'Parede de alvenaria seca em bloco irregular, junta fechada, em luz rasante',
    altAmbiente: 'Estar com parede de alvenaria seca de piso a teto, poltrona e ripado de madeira',
  },
  {
    slug: 'travertino-romano',
    nome: 'Travertino Romano',
    etiqueta: 'Travertino',
    descricao: 'Veio contínuo, acabamento escovado ou bruto. Espessuras de 20 e 30 mm.',
    preco: 'a partir de R$ 480 / m²',
    imagem: 'marca/travertino-romano',
    ambiente: null,
    especime: true, // fotografia de amostra sobre fundo claro
    alt: 'Exemplar de travertino romano sobre fundo claro, mostrando o veio e a quebra natural',
  },
  {
    slug: 'marmore-grafite',
    nome: 'Mármore Grafite',
    etiqueta: 'Mármore',
    descricao: 'Chapa de veio fechado para painéis internos e bancadas de grande vão.',
    preco: 'sob consulta',
    imagem: 'marca/marmore-grafite',
    ambiente: null,
    alt: 'Painel de mármore grafite de veio fechado ao lado de ripado de madeira iluminado',
  },
  {
    slug: 'calcario-escovado',
    nome: 'Calcário escovado',
    etiqueta: 'Calcário',
    descricao: null, // o Figma nomeia a família no rodapé, sem descrição
    preco: 'sob consulta',
    imagem: 'marca/muro-noturno',
    ambiente: null,
    alt: 'Muro de pedra em luz rasante noturna, revelando o relevo da superfície',
  },
];

/* ------------------------------------------- processo (do Figma, literal) */

export const processo = [
  {
    n: '01',
    titulo: 'Leitura de projeto',
    texto: 'Recebemos a prancha e o memorial. Mapeamos área, espessura e tipo de assentamento.',
    icone: 'search',
  },
  {
    n: '02',
    titulo: 'Seleção de bloco',
    texto: 'Você aprova o bloco na pedreira, por foto ou presencialmente. Nada é cortado antes disso.',
    icone: 'layers',
  },
  {
    n: '03',
    titulo: 'Corte e numeração',
    texto: 'Chapas cortadas sob medida, numeradas e paginadas conforme o mapa de assentamento.',
    icone: 'calendar',
  },
  {
    n: '04',
    titulo: 'Instalação e entrega',
    texto: 'Equipe própria assenta e entrega com garantia de 5 anos sobre fixação e rejunte.',
    icone: 'check',
  },
];

/* Etiquetas de aplicação listadas na seção "Aplicações" do Figma. */
export const usos = [
  'Fachada ventilada', 'Muro de arrimo', 'Parede interna',
  'Bancada', 'Piso externo', 'Lareira',
];

export const aplicacoesCopy = {
  overline: 'APLICAÇÕES',
  titulo: 'Do muro de divisa à parede da sala.',
  texto:
    'Cada bloco é selecionado na pedreira pela nossa equipe e chega numerado, com mapa de ' +
    'assentamento. O que sai do caminhão é exatamente o que foi aprovado na prancheta — sem ' +
    'surpresa de tom, veio ou espessura.',
};

export const orcamento = {
  overline: 'ORÇAMENTO',
  titulo: ['Mande a prancha.', 'Devolvemos em 48h.'],
  texto:
    'Orçamento fechado, com metragem conferida, tipo de bloco e prazo de instalação. ' +
    'Sem taxa e sem compromisso.',
  botao: 'Enviar prancha',
  ajuda: 'Respondemos em até um dia útil',
  /* Nada daqui para baixo vem do Figma. Sem servidor, o pedido sai do e-mail
     do próprio visitante: a nota diz o que o botão faz antes do clique e os
     canais diretos atendem quem não usa programa de e-mail (ADR-002 no vault). */
  nota: 'Abre seu e-mail com o pedido pronto — é só anexar a prancha.',
  direto: 'Ou fale direto:',
  assunto: 'Solicitação de orçamento — Magah Minerale',
  corpo: ['Olá,', '', 'Gostaria de um orçamento. Segue a prancha em anexo.'],
  campos: ['Obra', 'Metragem aproximada', 'Prazo desejado'],
};

/* -------------------------------------------------- acervo (das pastas) */

/** Como cada pasta se chama, e o que as fotografias dela mostram. */
const CATEGORIAS = {
  'REVESTIMENTOS': {
    nome: 'Revestimentos',
    ordem: 1,
    sufixos: [],
    linha: 'Paredes internas, fachadas, colunas e painéis de lareira.',
    chamada: 'A pedra como pele do edifício.',
  },
  'PISOS': {
    nome: 'Pisos',
    ordem: 2,
    sufixos: ['Piso'],
    linha: 'Terraços, varandas, bordas de piscina e pisos internos.',
    chamada: 'Superfície que recebe o passo.',
  },
  'MUROS E MURETAS': {
    nome: 'Muros e Muretas',
    ordem: 3,
    sufixos: ['Muros e Muretas'],
    linha: 'Muros de divisa, arrimos e muretas de jardim.',
    chamada: 'O primeiro plano da casa.',
  },
  'ESCADAS': {
    nome: 'Escadas',
    ordem: 4,
    sufixos: ['Escadas'],
    linha: 'Degraus e lances externos assentados no terreno.',
    chamada: 'A pedra que organiza o desnível.',
  },
  'CAMINHOS': {
    nome: 'Caminhos',
    ordem: 5,
    sufixos: ['Caminhos e Praças'],
    linha: 'Percursos em lajão irregular sobre grama e brita.',
    chamada: 'O traço que atravessa o jardim.',
  },
  'CALÇAMENTOS E ESCADAS': {
    nome: 'Calçamentos e Escadas',
    ordem: 6,
    sufixos: [],
    linha: 'Acessos, entradas de veículo e calçamento em paralelepípedo.',
    chamada: 'Onde o terreno encontra a rua.',
  },
};

function limparNome(nome, sufixos) {
  for (const s of sufixos) {
    if (nome.toLowerCase().endsWith(' ' + s.toLowerCase())) {
      return nome.slice(0, -(s.length + 1)).trim();
    }
  }
  return nome;
}

/* Deriva pedras e aplicações a partir do manifesto de imagens. Uma mesma pedra
   aparece em mais de uma pasta — isso não são produtos diferentes, é a mesma
   pedra em aplicações diferentes, e vira a galeria da página do produto. */
const porPedra = new Map();

for (const [key, meta] of Object.entries(img)) {
  if (!key.startsWith('acervo/') || !meta.source) continue;
  const [pasta, arquivo] = meta.source.split('/');
  const cat = CATEGORIAS[pasta];
  if (!cat) continue;

  const stem = arquivo.replace(/\.(jpe?g|png|webp)$/i, '');
  const m = stem.match(/^(\d+)_(.+?)_(\d+)$/);
  const ref = m ? m[1] : '';
  const bruto = (m ? m[2] : stem).replace(/_/g, ' ');
  const nome = limparNome(bruto, cat.sufixos);
  const s = slug(nome);

  if (!porPedra.has(s)) {
    porPedra.set(s, { slug: s, nome, refs: [], aplicacoes: [], fotos: [] });
  }
  const p = porPedra.get(s);
  if (ref && !p.refs.includes(ref)) p.refs.push(ref);
  if (!p.aplicacoes.includes(cat.nome)) p.aplicacoes.push(cat.nome);
  p.fotos.push({
    key,
    aplicacao: cat.nome,
    aplicacaoSlug: slug(cat.nome),
    alt: `${nome} aplicada em ${cat.nome.toLowerCase()}`,
  });
}

export const pedras = [...porPedra.values()]
  .map((p) => {
    p.refs.sort();
    p.fotos.sort(
      (a, b) => CATEGORIAS_ORDEM(a.aplicacao) - CATEGORIAS_ORDEM(b.aplicacao)
    );
    p.aplicacoes.sort((a, b) => CATEGORIAS_ORDEM(a) - CATEGORIAS_ORDEM(b));
    p.capa = p.fotos[0].key;
    p.href = `acervo/${p.slug}.html`;
    return p;
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

function CATEGORIAS_ORDEM(nome) {
  for (const c of Object.values(CATEGORIAS)) if (c.nome === nome) return c.ordem;
  return 99;
}

export const aplicacoes = Object.values(CATEGORIAS)
  .sort((a, b) => a.ordem - b.ordem)
  .map((c) => {
    const fotos = [];
    for (const p of pedras) {
      for (const f of p.fotos) if (f.aplicacao === c.nome) fotos.push({ ...f, pedra: p });
    }
    return {
      slug: slug(c.nome),
      nome: c.nome,
      linha: c.linha,
      chamada: c.chamada,
      fotos,
      capa: fotos[0].key,
      href: `aplicacoes/${slug(c.nome)}.html`,
    };
  });

/** Indicadores institucionais — todos contados a partir do material fornecido. */
export const indicadores = [
  { valor: String(brand.desde), rotulo: 'Em atividade desde' },
  { valor: String(pedras.length), rotulo: 'Pedras em acervo' },
  { valor: String(aplicacoes.length), rotulo: 'Aplicações' },
  { valor: '48h', rotulo: 'Retorno de orçamento' },
];
