/* ==========================================================================
   MAGAH MINERALE — comportamento
   Progressivo: sem JS a página continua completa e legível (o <html class="js">
   é quem liga os estados iniciais de animação). Tudo respeita
   prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Mesma duração do clip-path do menu em site.css (--dur). */
  const DURACAO_MENU = 400;

  /* ------------------------------------------------ fotografia progressiva */
  // O LQIP fica no background da placa; a foto entra por cima quando carrega.
  const acender = (img) => {
    img.classList.add('is-loaded');
    const placa = img.closest('.plate');
    if (placa) placa.style.backgroundImage = '';
  };
  const observarImagens = (raiz = document) => {
    $$('.plate img', raiz).forEach((img) => {
      if (img.complete && img.naturalWidth) acender(img);
      else img.addEventListener('load', () => acender(img), { once: true });
      img.addEventListener('error', () => acender(img), { once: true });
    });
  };
  observarImagens();

  /* ----------------------------------------------------- revelar ao rolar */
  const revelaveis = $$('[data-reveal], .reveal-lines');
  if (!calmo.matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    );
    revelaveis.forEach((el) => io.observe(el));
  } else {
    revelaveis.forEach((el) => el.classList.add('is-in'));
  }

  /* --------------------------------------- cabeçalho, progresso, parallax */
  const header = $('.header');
  const barra = $('.progress');
  /** Rolagem a partir da qual o cabeçalho ganha fundo. */
  const CABECALHO_FIXO = 24;
  /** Fora desta folga além da tela, o parallax nem é calculado. */
  const FOLGA_PARALLAX = 200;
  /** Deslocamento máximo, em fração da altura da placa. A foto tem 6% de sobra
   *  em cada borda (scale: 1.12 em site.css): 5% nunca descobre o fundo. */
  const PARALLAX_MAX = 0.05;
  const camadas = $$('[data-parallax]').map((img) => ({ img, placa: img.closest('.plate') || img }));
  let pendente = false;

  const aoRolar = () => {
    const y = window.scrollY;

    if (header) header.classList.toggle('is-stuck', y > CABECALHO_FIXO);

    if (barra) {
      const alcance = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.setProperty('--p', alcance > 0 ? Math.min(y / alcance, 1) : 0);
    }

    if (!calmo.matches) {
      const meio = window.innerHeight / 2;
      // Mede a placa, não a foto — a foto já deslocada realimentaria a conta.
      // `translate` é independente de `transform`: o deslocamento não herda a
      // transição de entrada da foto e acompanha a rolagem sem atraso.
      camadas.forEach(({ img, placa }) => {
        const r = placa.getBoundingClientRect();
        if (r.bottom < -FOLGA_PARALLAX || r.top > window.innerHeight + FOLGA_PARALLAX) return;
        const forca = parseFloat(img.dataset.parallax) || 0.08;
        const limite = r.height * PARALLAX_MAX;
        const d = Math.max(-limite, Math.min(limite, (r.top + r.height / 2 - meio) * forca));
        img.style.translate = `0 ${d.toFixed(2)}px`;
      });
    }
    pendente = false;
  };

  const agendar = () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(aoRolar);
  };

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  aoRolar();

  /* ------------------------------------------ um só CTA principal por tela */
  // O botão do cabeçalho recolhe enquanto um CTA primário da página está à
  // vista: dois "Solicitar orçamento" na mesma tela disputam o olhar
  // (ADR-004 no vault). A margem desconta o cabeçalho fixo, que cobre o topo.
  const acoes = $('.header__actions');
  const ctasDaPagina = $$('main .btn--primary');
  if (header && acoes && ctasDaPagina.length && 'IntersectionObserver' in window) {
    const aVista = new Set();
    const vigia = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? aVista.add(e.target) : aVista.delete(e.target)));
        document.documentElement.classList.toggle('has-cta-em-vista', aVista.size > 0);
      },
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` }
    );
    ctasDaPagina.forEach((b) => vigia.observe(b));
  }

  /* --------------------------------------------------------- menu mobile */
  const burger = $('.burger');
  const menu = $('.menu');
  if (burger && menu) {
    let ultimoFoco = null;

    const focaveis = () =>
      $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);

    const fechar = () => {
      document.documentElement.classList.remove('is-menu-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // espera a máscara terminar antes de tirar do fluxo
      setTimeout(() => { if (!aberto()) menu.hidden = true; }, calmo.matches ? 0 : DURACAO_MENU);
      if (ultimoFoco) ultimoFoco.focus();
    };

    const aberto = () => document.documentElement.classList.contains('is-menu-open');

    const abrir = () => {
      ultimoFoco = document.activeElement;
      menu.hidden = false;
      // força reflow para a transição de clip-path acontecer
      void menu.offsetWidth;
      document.documentElement.classList.add('is-menu-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const alvo = focaveis()[0];
      if (alvo) alvo.focus();
    };

    burger.addEventListener('click', () => (aberto() ? fechar() : abrir()));
    $$('a', menu).forEach((a) => a.addEventListener('click', fechar));

    document.addEventListener('keydown', (e) => {
      if (!aberto()) return;
      if (e.key === 'Escape') { fechar(); return; }
      if (e.key !== 'Tab') return;
      const lista = focaveis();
      if (!lista.length) return;
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    });

    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
      if (e.matches && aberto()) fechar();
    });
  }

  /* -------------------------------------------------- filtro do acervo */
  const filtros = $$('.filtro');
  if (filtros.length) {
    const cartoes = $$('.pedra-card');
    const contador = $('[data-contagem]');

    const aplicar = (chave) => {
      let visiveis = 0;
      cartoes.forEach((c) => {
        const bate = chave === 'todas' || (c.dataset.aplicacoes || '').split(' ').includes(chave);
        c.hidden = !bate;
        if (bate) visiveis++;
        // A foto do cartão acompanha o filtro; em "Todas", volta a primeira.
        const capas = $$('[data-capa]', c);
        const alvo = capas.find((f) => f.dataset.capa === chave) || capas[0];
        capas.forEach((f) => { f.hidden = f !== alvo; });
      });
      filtros.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === chave)));
      if (contador) {
        contador.textContent =
          chave === 'cubas' ? `${visiveis} ${visiveis === 1 ? 'cuba' : 'cubas'}`
          : chave === 'todas' && $('[data-filtro="cubas"]') ? `${visiveis} ${visiveis === 1 ? 'peça' : 'peças'}`
          : `${visiveis} ${visiveis === 1 ? 'pedra' : 'pedras'}`;
      }
      // Aberto direto do disco (file://), o navegador recusa reescrever o
      // endereço: o filtro funciona igual, só não vai para a barra de endereço.
      if (location.protocol !== 'file:') {
        const url = new URL(location.href);
        if (chave === 'todas') url.searchParams.delete('a');
        else url.searchParams.set('a', chave);
        history.replaceState(null, '', url);
      }
    };

    filtros.forEach((b) => b.addEventListener('click', () => aplicar(b.dataset.filtro)));

    const inicial = new URL(location.href).searchParams.get('a');
    if (inicial && filtros.some((b) => b.dataset.filtro === inicial)) aplicar(inicial);
  }

  /* ---------------------------------------------------- ano no rodapé */
  $$('[data-ano]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
