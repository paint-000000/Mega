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

/** Marca do WhatsApp (Simple Icons, CC0) — preenchida, não traço: é logotipo, não ícone de interface. */
export const whatsapp =
  '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
  '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
