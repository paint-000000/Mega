/**
 * Ícones exportados do arquivo Figma (24 px, traço 1.5, conforme a descrição
 * do componente "icon/*"). Reproduzidos tal como vieram; só a cor virou
 * currentColor para herdar do contexto.
 */
const wrap = (d) =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;

export const icons = {
  search: wrap(
    '<path d="M11 17.5C14.5899 17.5 17.5 14.5899 17.5 11C17.5 7.41015 14.5899 4.5 11 4.5C7.41015 4.5 4.5 7.41015 4.5 11C4.5 14.5899 7.41015 17.5 11 17.5Z"/>' +
    '<path d="M15.8 15.8L20 20"/>'
  ),
  layers: wrap(
    '<path d="M12 3L21 7.5L12 12L3 7.5L12 3Z"/>' +
    '<path d="M3 12.5L12 17L21 12.5"/>'
  ),
  calendar: wrap(
    '<path d="M19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5Z"/>' +
    '<path d="M8 3V7M16 3V7M3 10.5H21"/>'
  ),
  check: wrap('<path d="M5 12.5L9.5 17L19 7.5"/>'),
};

/** icon/arrow-right, exportado em 16 px — usado em botões e links. */
export const arrow =
  '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<path d="M2.66667 8H12.6667M9 4L13 8L9 12"/></svg>';
