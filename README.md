# Magah Minerale — site

Site institucional e catálogo editorial para a **Magah Minerale**, gerado a
partir do arquivo Figma da marca e do acervo fotográfico deste diretório.

Abrir: sirva a pasta `site/` (`python -m http.server 4173 --directory site`).

> Abrir `site/index.html` com duplo clique funciona, mas os navegadores bloqueiam
> o carregamento de fontes a partir de `file://` — os títulos caem para a
> serifada do sistema. Servindo por HTTP, a tipografia da marca aparece.

---

## 1. De onde vem cada coisa

**A Magah vende só o que está no quadro de produtos.** Tudo o que o site diz
sobre pedra sai de duas fontes:

**Quadro de produtos** (planilha do cliente) — transcrito literalmente em
`build/data.mjs` → `QUADRO`: tipologia, produto, cor/tonalidade, tamanho,
espessura e unidade de venda. São 41 linhas, 33 pedras e 6 tipologias. A grafia
dos nomes é a do quadro ("Moledo Natural Daterra", "Pedra Atacama Branca",
"Calçamentos e Estradas", "Caminhos e Praças"), mesmo quando o nome do arquivo
de foto diverge.

**Pastas de fotografia deste diretório**: 41 fotografias de obra, uma por linha
do quadro. A foto encontra a sua linha pelo número que abre o nome do arquivo
(`060_Pedra_Granito_Escadas_1.jpeg` → `ref: '060'`). O build falha se sobrar
foto sem linha ou linha sem foto. A mesma pedra em várias tipologias é um só
produto: as linhas viram a ficha e as fotos, a galeria.

**Arquivo Figma** (`phhwxTc201bO9i1FCHBRVS`): só identidade (logotipos, paleta,
tipografia, ícones), o manifesto "A pedra não reveste. Ela define o lugar." e
as 6 fotografias de ambiente em `site/assets/img/marca/`.

### O que foi retirado

O Figma trazia dados de exemplo que não são reais, e nenhum deles está no site:
as quatro coleções (Alvenaria seca, Travertino Romano, Mármore Grafite, Calcário
escovado) e seus preços, o processo em 4 etapas, a garantia de 5 anos, o prazo
de 48h, "desde 1998", as praças São Paulo · Vitória, o telefone
`+55 11 4000-0000`, o CNPJ `00.000.000/0001-00` e o e-mail. `build/audit.mjs`
falha se algum desses voltar.

### O que está pendente

Os canais de contato estão em `null` em `build/data.mjs` → `brand`: `telefone`,
`telefoneLink`, `whatsapp`, `email`, `endereco`, `horario`, `cnpj`. Enquanto
estiverem vazios, a página de contato mostra "a definir", o botão de pedido por
e-mail e o botão flutuante do WhatsApp não aparecem. Preenchido o campo, o
canal volta sozinho no próximo build.

Na tabela, a espessura do **Pedra Granito Rústico** em Escadas está marcada
"x"; o site mostra "não informada". O `dominio` (canonical, og:image, sitemap)
também é o de exemplo.

---

## 2. Direção

O Figma entrega uma home em cards. O site é uma releitura editorial da mesma
marca — mesma paleta, mesmos textos, outra arquitetura de experiência.

**Tipografia.** O logotipo é um lettering geométrico desenhado sobre o símbolo
(bloco com o M recortado), conforme o brand book no Figma. O site usa
**Bodoni Moda** nos títulos e **Inter** — a sans do Figma — em interface e texto
corrido. Só duas famílias, com hierarquia declarada em `--t-*`.

**Cor.** Estritamente a do Figma. Nenhum tom novo. As variáveis pedidas existem
com esses nomes (`--color-primary`, `--color-secondary`, `--color-background`,
`--color-surface`, `--color-text`, `--color-muted`, `--color-accent`), cada uma
comentada com o token `--mt-*` de origem.

**Fotografia decide o layout.** O acervo foi fotografado a ~630 × 790 px.
Nenhuma placa passa de ~640 px de largura — esticar o arquivo custaria peso e
entregaria borrão. Daí o partido: retratos em composição assimétrica com muito
espaço negativo, e não fotos sangradas de ponta a ponta. O hero usa a única
imagem grande (1023 × 1537) numa placa alta que sangra à direita.

**Narrativa.** `marca → matéria → aplicações → acervo → contato`, com a faixa
de orçamento fechando toda página.

**Regras do vault.** O projeto segue as leis gerais do vault Obsidian (Bíblia de
UI, Bíblia do Diretor de Arte, Motion Premium e os componentes do template
`Vault-Projeto-Web`). Onde elas conflitam com o Figma ou entre si, a decisão
está registrada no ADR Log da pasta `magah/` do vault:

- **ADR-002 · Pedido por e-mail.** Sem servidor, não há formulário. O botão
  "Enviar prancha" abre o e-mail do visitante com assunto e corpo prontos —
  incluindo a pedra, coleção ou aplicação de onde ele saiu —, uma nota diz isso
  antes do clique e o e-mail e o telefone ficam à vista para quem usa webmail.
- **ADR-003 · Movimento.** A primeira dobra não anima e texto corrido nunca
  espera animação. Revelação só em títulos, fotografias e cartões abaixo da
  dobra, terminando em até 1 s; hover em 240 ms. O hero tem apenas uma
  aproximação de 3% em 20 s na foto, com o texto parado.
- **ADR-004 · Um só CTA principal por tela.** O "Solicitar orçamento" do
  cabeçalho recolhe enquanto outro CTA primário está à vista.
- **ADR-005 · Pisos.** Nada abaixo de 12 px, texto em 1.5, títulos entre 1.1 e
  1.25, espaçamento só na escala 4–128 e alvo de toque de 44 px.
- **ADR-007 · Imagens em WebP.** Toda foto das páginas é WebP. Um JPEG por foto
  (`-og.jpg`) existe só para o cartão de compartilhamento — o LinkedIn não lê
  WebP no og:image — e como fallback de navegador sem WebP.

---

## 3. Páginas (45)

```
index.html                    home
aplicacoes.html               as 6 tipologias do quadro
aplicacoes/<slug>.html        6 páginas de aplicação
acervo.html                   33 pedras, com filtro por aplicação
acervo/<slug>.html            33 páginas de pedra, com a ficha do quadro
sobre.html  contato.html  404.html
sitemap.xml  robots.txt
```

---

## 4. Acessibilidade e performance

- Contraste conferido: o tom mais discreto (`#8e8071` sobre `#121110`) fica em
  **4,93:1**, acima do mínimo AA, e é usado só em rótulos e metadados. Sobre a
  foto da faixa de orçamento, o pior ponto medido sob o texto passa de 9:1.
- Navegação por teclado completa, `:focus-visible` visível, skip link, foco
  preso no menu mobile e devolvido ao fechar, `Esc` fecha.
- Um `<h1>` por página, hierarquia de títulos sem saltos, `alt` em toda imagem,
  `aria-current` na navegação.
- Alvos de toque de 44 px em botões, filtros, etiquetas-link, migalhas e rodapé;
  hover só em dispositivo com ponteiro fino, para não "grudar" no toque.
- `prefers-reduced-motion: reduce` desliga revelações, máscaras, parallax e a
  aproximação lenta do hero.
- **Sem JavaScript a página continua completa** — os estados iniciais de
  animação só existem sob `html.js`, marcado por um script inline no `<head>`.
- Fotos em WebP com `srcset`/`sizes`, `width`/`height` em todo `<img>`, LQIP
  embutido, `lazy` fora da dobra e preload só da imagem principal. O JPEG de
  fallback (`-og.jpg`) não é baixado por navegador com WebP.
- Fontes próprias (subconjuntos latin/latin-ext), ~94 KB no caminho crítico.
- Home em 1440 px: 19 requisições e ~1,7 MB com todas as fotografias
  carregadas (1,5 MB delas em WebP).

O pedido de orçamento não finge enviar nada: sem servidor, o botão abre um
e-mail real no programa do visitante, endereçado a
`contato@magahminerale.com.br`, e os canais diretos ficam ao lado para quem não
usa programa de e-mail.

---

## 5. Build

```bash
node build/build.mjs    # gera as 45 páginas em site/
node build/audit.mjs    # links, alt, títulos, ids, aria, movimento, imagens e conteúdo de exemplo — sai 1 se houver erro
python build/images.py  # reprocessa as imagens (só se as fotos mudarem)
```

Servir localmente:

```bash
python -m http.server 4173 --directory site
```

### Imagens

`images.py` gera, para cada foto, a escada de larguras em WebP (q76), um LQIP
embutido e um JPEG de cartão (`-og.jpg`, até 1200 px). A pasta
`site/assets/img/` é refeita do zero a cada execução.

As fotos-matriz das pastas de aplicação continuam em JPEG: já vêm comprimidas e,
em WebP de qualidade equivalente, ficariam 73% maiores. Os renders do Figma
(`build/figma/`) e os arquivos de `_assets/` estão em WebP q90.

### Arquivos

```
build/
  data.mjs      conteúdo: Figma + acervo derivado das pastas
  layout.mjs    <head>, cabeçalho, rodapé, <picture> responsivo
  build.mjs     templates de página e escrita
  icons.mjs     ícones exportados do Figma
  images.py     pipeline WebP + LQIP + cartão JPEG → images.json
  audit.mjs     auditoria do HTML gerado
  figma/        as 6 fotografias do Figma (fonte do pipeline)
site/           o site pronto
```

Para mudar texto, pedra ou contato, edite `build/data.mjs` e rode `build.mjs` —
nunca o HTML gerado. O build não apaga páginas antigas: ao renomear ou remover
uma pedra, apague o `.html` que sobrou em `site/`.
