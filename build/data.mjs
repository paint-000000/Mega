/**
 * Modelo de conteúdo — Magah Minerale
 *
 * Duas fontes, nenhuma inventada:
 *
 *  1. O quadro de produtos da Magah (planilha do cliente) — é o que a empresa
 *     vende. Nome, tipologia, cor, tamanho, espessura e unidade de venda vêm
 *     dele, literalmente. Nada fora do quadro entra no site.
 *
 *  2. As pastas de fotografia deste diretório — 41 fotografias de obra. Cada
 *     arquivo começa por um número, e é por esse número que a foto encontra a
 *     sua linha no quadro.
 *
 * O arquivo Figma ainda dá a identidade (logo, paleta, tipografia) e o
 * manifesto. Os dados de exemplo dele — telefone, CNPJ, praças, "desde 1998",
 * prazo de 48h, garantia, as quatro coleções — não são reais e foram retirados.
 * Campo de contato em `null` aparece na página como pendente.
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
  overline: 'PEDRA NATURAL',
  assinatura: 'Pedra natural para arquitetura.',
  manifesto: 'A pedra não reveste. Ela define o lugar.',
  intro:
    'Moledos, lajões, granitos, paralelepípedos e pedras para muro: 33 pedras naturais para ' +
    'revestimentos, pisos, muros e muretas, escadas, caminhos e praças e calçamentos.',
  // WhatsApp só dígitos, com DDI; `whatsappExibicao` é como o número aparece na página.
  whatsapp: '5511930319070',
  whatsappExibicao: '(11) 93031-9070',
  whatsappMensagem: 'Olá! Vim pelo site da Magah Minerale e gostaria de falar sobre um projeto.',
  instagram: 'https://www.instagram.com/magah.minerale/',
  instagramUsuario: '@magah.minerale',
  /* Canais reais passados pela Magah. Campo em null some da página (ou
     aparece como "a definir" na página de contato). */
  telefone: '(11) 93031-9070',
  telefoneLink: '+5511930319070',
  email: 'contato@magahminerale.com',
  endereco: null,
  horario: null,
  cnpj: null,
  /* Endereço onde o site está no ar — canonical, sitemap e a pré-visualização
     do link (og:image precisa de URL absoluta que responda). Trocar quando
     houver domínio próprio. */
  dominio: 'https://magah-minerale.vercel.app',
};

export const nav = [
  { label: 'Aplicações', href: 'aplicacoes.html' },
  { label: 'Acervo', href: 'acervo.html' },
  { label: 'Sobre', href: 'sobre.html' },
];

export const aplicacoesCopy = {
  overline: 'APLICAÇÕES',
  titulo: 'Do muro de divisa à parede da sala.',
  texto:
    'Seis tipologias, do revestimento ao calçamento. Cada pedra traz a cor, o tamanho, a ' +
    'espessura e a unidade de venda de cada aplicação.',
};

export const orcamento = {
  overline: 'ORÇAMENTO',
  titulo: ['Solicite um orçamento.'],
  texto: 'Diga a pedra, a aplicação e a metragem.',
  botao: 'Pedir por e-mail',
  /* Sem servidor, o pedido sai do e-mail do próprio visitante: a nota diz o
     que o botão faz antes do clique (ADR-002 no vault). */
  nota: 'Abre seu e-mail com o pedido pronto.',
  pendente: 'Canal de atendimento a definir.',
  assunto: 'Solicitação de orçamento — Magah Minerale',
  corpo: ['Olá,', '', 'Gostaria de um orçamento.'],
  campos: ['Pedra', 'Aplicação', 'Metragem ou quantidade', 'Cidade da obra'],
};

/* ------------------------------------------------ quadro de produtos (literal) */

/**
 * Uma linha por pedra × aplicação, na ordem e na grafia da planilha.
 * `ref` é o número que abre o nome do arquivo de foto. `nome` é o PRODUTO da
 * planilha em caixa alta e baixa. Espessura `null` = célula marcada "x".
 */
const QUADRO = [
  // Revestimentos
  { ref: '00', tipologia: 'Revestimentos', nome: 'Moledo Branca', cor: 'Branco', tamanho: 'Variados', espessura: '4 a 8 cm', unidade: 'm²' },
  { ref: '01', tipologia: 'Revestimentos', nome: 'Moledo Campestre', cor: 'Cinza com tons de amarelo', tamanho: 'Variados', espessura: '4 a 8 cm', unidade: 'm²' },
  { ref: '02', tipologia: 'Revestimentos', nome: 'Moledo Natural Champagne', cor: 'Champagne Mesclado', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '03', tipologia: 'Revestimentos', nome: 'Moledo Natural Daterra', cor: 'Amarelo Terroso', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '04', tipologia: 'Revestimentos', nome: 'Moledo Natural Pampas', cor: 'Terroso Mesclado', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '05', tipologia: 'Revestimentos', nome: 'Moledo Raízes Flocus', cor: 'Branco e Palha', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '06', tipologia: 'Revestimentos', nome: 'Moledo Raízes Gold', cor: 'Amarelo', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '07', tipologia: 'Revestimentos', nome: 'Moledo Raízes Névoa', cor: 'Cinza Mesclado', tamanho: 'Variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '08', tipologia: 'Revestimentos', nome: 'Moledo Ornado', cor: 'Champagne Rosé', tamanho: 'Variados', espessura: '6 a 10 cm', unidade: 'm²' },
  { ref: '09', tipologia: 'Revestimentos', nome: 'Moledo Filete Mosaico', cor: 'Champagne Mesclado', tamanho: 'Filetes de tamanhos variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '10', tipologia: 'Revestimentos', nome: 'Moledo Mosaico', cor: 'Amarelo', tamanho: 'Corte Mosaico - Tamanhos variados', espessura: '10 a 12 cm', unidade: 'm²' },
  { ref: '11', tipologia: 'Revestimentos', nome: 'Moledo Talhada Natural', cor: 'Amarelo Terra', tamanho: 'Corte Mosaico - Tamanhos variados', espessura: '4 a 6 cm', unidade: 'm²' },
  { ref: '12', tipologia: 'Revestimentos', nome: 'Pedra Atacama Branca', cor: 'Branca acinzentada', tamanho: 'Tamanhos diversos', espessura: '3 cm', unidade: 'm²' },
  { ref: '13', tipologia: 'Revestimentos', nome: 'Pedra Atacama Bege', cor: 'Bege', tamanho: 'Tamanhos diversos', espessura: '3 cm', unidade: 'm²' },
  { ref: '14', tipologia: 'Revestimentos', nome: 'Pedra Granito Mosaico', cor: 'Cinza Azulado ou Cinza Rosado', tamanho: 'Corte Mosaico - Tamanhos variados', espessura: '10 a 12 cm', unidade: 'm²' },
  { ref: '15', tipologia: 'Revestimentos', nome: 'Pedra Granito Rústico', cor: 'Palha e Areia', tamanho: 'Variados', espessura: 'Aproximadamente 2 cm', unidade: 'm²' },
  { ref: '16', tipologia: 'Revestimentos', nome: 'Pedra Madeira Branca Especial (Bossa Nova)', cor: 'Branco', tamanho: 'Variados', espessura: '3 cm', unidade: 'm²' },
  { ref: '17', tipologia: 'Revestimentos', nome: 'Pedra Madeira Cinza', cor: 'Cinza Mesclado', tamanho: 'Variados', espessura: '3 cm', unidade: 'm²' },
  { ref: '18', tipologia: 'Revestimentos', nome: 'Pedra Miracema Laje', cor: 'Cinza ou Preto', tamanho: 'Variados', espessura: '3 a 5 cm', unidade: 'm²' },
  // Calçamentos e Estradas
  { ref: '036', tipologia: 'Calçamentos e Estradas', nome: 'Pedra Folheta', cor: 'Cinza Rosado, Cinza Azulado ou Vermelho', tamanho: '25 x 40 cm', espessura: '12 cm', unidade: 'Unidade' },
  { ref: '039', tipologia: 'Calçamentos e Estradas', nome: 'Paralelepípedo', cor: 'Cinza Rosado, Cinza Azulado ou Vermelho', tamanho: '18 a 24 cm x 10 a 12 cm', espessura: '10 a 12 cm', unidade: 'Unidade e milheiro' },
  { ref: '041', tipologia: 'Calçamentos e Estradas', nome: 'Paralelepípedo 10x10', cor: 'Cinza Rosado, Cinza Azulado ou Vermelho', tamanho: '10 x 10', espessura: '10 a 12 cm', unidade: 'Unidade e milheiro' },
  // Pisos
  { ref: '044', tipologia: 'Pisos', nome: 'Pedra Basalto Lajão', cor: 'Marrom Mesclado, Cinza e Preto', tamanho: 'Tamanhos diversos', espessura: '5 a 7 cm', unidade: 'm²' },
  { ref: '045', tipologia: 'Pisos', nome: 'Pedra Granito Mosaico', cor: 'Cinza Azulado, Cinza Rosado ou Vermelho', tamanho: 'Corte Mosaico - Tamanhos variados', espessura: '10 a 12 cm', unidade: 'm²' },
  { ref: '046', tipologia: 'Pisos', nome: 'Pedra Granito Rústico', cor: 'Palha e Areia', tamanho: 'Tamanhos diversos', espessura: 'Aproximadamente 2 cm', unidade: 'm²' },
  { ref: '048', tipologia: 'Pisos', nome: 'Pedra Quartzito Verde Lajão', cor: 'Verde Acinzentado', tamanho: 'Tamanhos diversos', espessura: '2 a 3 cm', unidade: 'm²' },
  { ref: '049', tipologia: 'Pisos', nome: 'Pedra São Tomé Lajão', cor: 'Branco ou Amarelo Mesclado', tamanho: 'Tamanhos diversos', espessura: '4 a 7 cm', unidade: 'm²' },
  { ref: '050', tipologia: 'Pisos', nome: 'Pedra Vermelha do Sul Lajão', cor: 'Vermelho Rosado', tamanho: 'Tamanhos diversos', espessura: 'Variadas', unidade: 'm² e unidade' },
  // Caminhos e Praças
  { ref: '053', tipologia: 'Caminhos e Praças', nome: 'Pedra São Tomé Lajão', cor: 'Amarelo Mesclado ou Branco', tamanho: 'Tamanhos diversos', espessura: '4 a 7 cm', unidade: 'm²' },
  { ref: '055', tipologia: 'Caminhos e Praças', nome: 'Pedra Vermelha do Sul Lajão', cor: 'Vermelho Rosado', tamanho: 'Tamanhos diversos', espessura: 'Variadas', unidade: 'Unidade' },
  { ref: '057', tipologia: 'Caminhos e Praças', nome: 'Pedra Goiás Lajão', cor: 'Verde ou Ouro Velho', tamanho: 'Tamanhos diversos', espessura: '4 a 7 cm', unidade: 'm²' },
  // Escadas
  { ref: '060', tipologia: 'Escadas', nome: 'Pedra Granito', cor: 'Cinza Azulado, Cinza Rosado ou Vermelho', tamanho: 'Sob medida conforme projeto', espessura: 'Sob medida', unidade: 'Unidade' },
  { ref: '062', tipologia: 'Escadas', nome: 'Pedra Granito Rústico', cor: 'Palha e Areia', tamanho: 'Tamanhos diversos', espessura: null, unidade: 'Unidade' },
  { ref: '064', tipologia: 'Escadas', nome: 'Pedra Moledo', cor: 'Bege Mesclado ou Marrom', tamanho: 'Variados', espessura: 'Variadas', unidade: 'Unidade' },
  { ref: '066', tipologia: 'Escadas', nome: 'Pedra São Tomé', cor: 'Amarelo Mesclado ou Branco', tamanho: 'Variados', espessura: '3 cm', unidade: 'm²' },
  { ref: '067', tipologia: 'Escadas', nome: 'Pedra São Tomé Lajão', cor: 'Amarelo Mesclado ou Branco', tamanho: 'Variados', espessura: '4 a 7 cm', unidade: 'm²' },
  { ref: '069', tipologia: 'Escadas', nome: 'Pedra Vermelha do Sul Lajão', cor: 'Vermelho Rosado', tamanho: 'Variados', espessura: 'Variadas', unidade: 'Unidade' },
  // Muros e Muretas
  { ref: '071', tipologia: 'Muros e Muretas', nome: 'Pedra Madeira', cor: 'Amarelo Mesclado', tamanho: 'Variados', espessura: 'Variadas', unidade: 'm² ou tonelada' },
  { ref: '073', tipologia: 'Muros e Muretas', nome: 'Pedra Moledo', cor: 'Várias tonalidades', tamanho: 'Variados', espessura: 'Variadas', unidade: 'm²' },
  { ref: '075', tipologia: 'Muros e Muretas', nome: 'Pedra Rachão Cortada', cor: 'Cinza', tamanho: 'Variados', espessura: 'Até 25 cm', unidade: 'Caminhão' },
  { ref: '078', tipologia: 'Muros e Muretas', nome: 'Pedra Rachão Natural', cor: 'Cinza', tamanho: 'Variados', espessura: 'Até 25 cm', unidade: 'Caminhão' },
];

/* ------------------------------------------------------------ tipologias */

/** As seis tipologias do quadro, com o texto de apresentação de cada uma. */
const CATEGORIAS = [
  {
    nome: 'Revestimentos',
    linha: 'Paredes internas, fachadas, colunas e painéis de lareira.',
    chamada: 'A pedra como pele do edifício.',
  },
  {
    nome: 'Pisos',
    linha: 'Terraços, varandas, bordas de piscina e pisos internos.',
    chamada: 'Superfície que recebe o passo.',
  },
  {
    nome: 'Muros e Muretas',
    linha: 'Muros de divisa, arrimos e muretas de jardim.',
    chamada: 'O primeiro plano da casa.',
  },
  {
    nome: 'Escadas',
    linha: 'Degraus e lances externos assentados no terreno.',
    chamada: 'A pedra que organiza o desnível.',
  },
  {
    nome: 'Caminhos e Praças',
    linha: 'Percursos em lajão irregular sobre grama e brita.',
    chamada: 'O traço que atravessa o jardim.',
  },
  {
    nome: 'Calçamentos e Estradas',
    linha: 'Acessos, entradas de veículo e calçamento em paralelepípedo.',
    chamada: 'Onde o terreno encontra a rua.',
  },
];

const ORDEM = (nome) => CATEGORIAS.findIndex((c) => c.nome === nome);

/* ---------------------------------------------- pedras (quadro + fotografias) */

const fotoPorRef = new Map();
for (const [key, meta] of Object.entries(img)) {
  if (!key.startsWith('acervo/') || !meta.source) continue;
  const ref = meta.source.split('/').pop().match(/^(\d+)_/)?.[1];
  if (ref) fotoPorRef.set(ref, key);
}

/* Uma mesma pedra aparece em mais de uma tipologia — não são produtos
   diferentes: as linhas viram a ficha e as fotos, a galeria da página. */
const porPedra = new Map();

for (const linha of QUADRO) {
  const key = fotoPorRef.get(linha.ref);
  if (!key) throw new Error(`linha do quadro sem fotografia: ${linha.ref} ${linha.nome}`);
  const s = slug(linha.nome);
  if (!porPedra.has(s)) porPedra.set(s, { slug: s, nome: linha.nome, aplicacoes: [], linhas: [], fotos: [] });
  const p = porPedra.get(s);
  if (!p.aplicacoes.includes(linha.tipologia)) p.aplicacoes.push(linha.tipologia);
  p.linhas.push(linha);
  p.fotos.push({
    key,
    aplicacao: linha.tipologia,
    aplicacaoSlug: slug(linha.tipologia),
    alt: `${linha.nome} aplicada em ${linha.tipologia.toLowerCase()}`,
  });
}

for (const ref of fotoPorRef.keys()) {
  if (!QUADRO.some((l) => l.ref === ref)) throw new Error(`fotografia fora do quadro: ${ref}`);
}

export const pedras = [...porPedra.values()]
  .map((p) => {
    const porOrdem = (a, b) => ORDEM(a) - ORDEM(b);
    p.linhas.sort((a, b) => porOrdem(a.tipologia, b.tipologia));
    p.fotos.sort((a, b) => porOrdem(a.aplicacao, b.aplicacao));
    p.aplicacoes.sort(porOrdem);
    p.capa = p.fotos[0].key;
    p.href = `acervo/${p.slug}.html`;
    return p;
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export const aplicacoes = CATEGORIAS.map((c) => {
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

/* ------------------------------------------------------------------ cubas */

/**
 * Cubas esculpidas em pedra natural e cristal. Não entram no quadro de obras:
 * cada foto de <raiz>/CUBAS/ é uma peça, e o nome do arquivo é o material
 * ("Ametista Rosa (2).jpg" é a segunda foto da mesma peça). No acervo, as
 * cubas ganham o filtro "Cubas" e uma página cada.
 */
export const cubasFicha = {
  padrao: '48 cm comprimento × 38 cm largura × 15 cm altura',
  sobMedida: 'Analisamos caso a caso, peças de até 90 cm',
  unidade: 'Peça',
};

const MINUSCULAS = new Set(['e', 'em', 'na', 'no', 'do', 'da', 'de', 'com']);
const nomeCuba = (arquivo) =>
  arquivo.replace(/\.[^.]+$/, '').replace(/\s*\(\d+\)$/, '').trim()
    .split(/\s+/)
    .map((p, i) => (i && MINUSCULAS.has(p.toLowerCase()) ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1)))
    .join(' ')
    .replace(/\((\p{L})/gu, (_, l) => `(${l.toUpperCase()})`);

const porCuba = new Map();
for (const [key, meta] of Object.entries(img)) {
  if (!key.startsWith('cubas/')) continue;
  const arquivo = meta.source.split('/').pop();
  const nome = nomeCuba(arquivo);
  const s = slug(nome);
  if (!porCuba.has(s)) porCuba.set(s, { slug: s, nome, fotos: [] });
  porCuba.get(s).fotos.push({ key, ordem: Number(arquivo.match(/\((\d+)\)\.[^.]+$/)?.[1] ?? 1) });
}

export const cubas = [...porCuba.values()]
  .map((c) => {
    c.fotos.sort((a, b) => a.ordem - b.ordem);
    c.capa = c.fotos[0].key;
    c.titulo = `Cuba ${c.nome}`;
    c.href = `acervo/cuba-${c.slug}.html`;
    return c;
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

/** Indicadores — todos contados a partir do quadro e do acervo. */
export const indicadores = [
  { valor: String(pedras.length), rotulo: 'Pedras no quadro' },
  { valor: String(aplicacoes.length), rotulo: 'Tipologias' },
  { valor: String(QUADRO.length), rotulo: 'Obras registradas' },
];
