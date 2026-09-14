# -*- coding: utf-8 -*-
"""
Pipeline de imagens — Magah Minerale.

Para cada fotografia gera a escada de larguras em WebP (o formato das páginas),
um LQIP embutido e um JPEG único de cartão de compartilhamento, mais o
manifesto JSON consumido por build.mjs.

Por que ainda existe um JPEG: o LinkedIn não lê WebP no og:image e clientes
antigos do WhatsApp falham — o link sairia sem imagem. O mesmo arquivo serve
de fallback do <picture> para navegador sem WebP (ADR-007 no vault).

Matrizes:
  1. As 41 fotografias de obra em <raiz>/<CATEGORIA>/ — ficam em JPEG: já vêm
     comprimidas, e em WebP de qualidade equivalente pesariam 73% mais.
  2. As 6 fotografias do arquivo Figma, em build/figma/ — as PNG viraram WebP
     q90 (82% menores); raw_1 já era JPEG e fica.
"""
import base64
import io
import json
import os
import re
import sys
import unicodedata

from PIL import Image, ImageFilter, ImageOps

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "site", "assets", "img")
FIGMA = os.path.join(HERE, "figma")

# Larguras candidatas. Nunca ampliamos a origem: o acervo tem ~630 px de largura
# e esticar o arquivo só produziria peso sem detalhe.
LADDER = [420, 640, 960, 1280, 1600]
QUALIDADE_WEBP = 76
QUALIDADE_CARTAO = 82
LARGURA_MAX_CARTAO = 1200  # prévia de link não mostra mais que isso
PROPORCAO_CARTAO = 1200 / 630
MATRIZES = (".webp", ".jpg", ".jpeg", ".png")


def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return re.sub(r"-{2,}", "-", text)


def widths_for(src_w):
    ws = [w for w in LADDER if w <= src_w]
    if not ws:
        ws = [src_w]
    elif ws[-1] < src_w:
        ws.append(src_w)
    return ws


def lqip(im):
    """Placeholder minúsculo (~20 px) embutido como data URI."""
    tiny = im.copy()
    tiny.thumbnail((20, 20), Image.LANCZOS)
    buf = io.BytesIO()
    tiny.save(buf, "WEBP", quality=42, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


FUNDO_CARTAO = (0x12, 0x11, 0x10)  # --color-background do site


def emit(src_path, rel_dir, base_name, cartao_inteiro=False):
    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im).convert("RGB")
    sw, sh = im.size
    dest_dir = os.path.join(OUT, rel_dir)
    os.makedirs(dest_dir, exist_ok=True)

    ws = widths_for(sw)
    for w in ws:
        h = round(sh * w / sw)
        frame = im if w == sw else im.resize((w, h), Image.LANCZOS)
        if w != sw:
            # Compensa a suavização do reamostrador — pedra vive de textura.
            frame = frame.filter(ImageFilter.UnsharpMask(radius=0.6, percent=58, threshold=3))
        frame.save(os.path.join(dest_dir, f"{base_name}-{w}.webp"), quality=QUALIDADE_WEBP, method=6)

    # Cartão horizontal 1.91:1 — é a proporção que WhatsApp, iMessage, LinkedIn
    # e Facebook desenham; foto em pé vira miniatura ou é cortada por eles.
    # Sem ampliar: foto estreita dá cartão menor.
    if cartao_inteiro:
        # Fotos de obra: o assunto muda de lugar (a escada fotografada de cima
        # fica no pé da foto), então nenhum corte fixo serve. A foto entra
        # inteira, centrada sobre o fundo do site.
        cw = LARGURA_MAX_CARTAO
        ch = round(cw / PROPORCAO_CARTAO)
        cartao = Image.new("RGB", (cw, ch), FUNDO_CARTAO)
        foto = ImageOps.contain(im, (cw, ch), Image.LANCZOS) if sh > ch else im
        cartao.paste(foto, ((cw - foto.width) // 2, (ch - foto.height) // 2))
    else:
        # Fotos da marca: corte um pouco acima do meio, onde fica a fachada.
        cw = min(LARGURA_MAX_CARTAO, sw)
        cartao = ImageOps.fit(im, (cw, round(cw / PROPORCAO_CARTAO)), Image.LANCZOS, centering=(0.5, 0.42))
    cartao.save(
        os.path.join(dest_dir, f"{base_name}-og.jpg"),
        quality=QUALIDADE_CARTAO, optimize=True, progressive=True,
    )

    return {
        "base": f"assets/img/{rel_dir}/{base_name}",
        "w": sw,
        "h": sh,
        "widths": ws,
        "social": {"w": cartao.width, "h": cartao.height},
        "lqip": lqip(im),
    }


def limpar_saida():
    """Tudo em OUT é gerado aqui: apaga antes, para não sobrar formato antigo."""
    if not os.path.isdir(OUT):
        return
    for dp, _, fs in os.walk(OUT):
        for f in fs:
            os.remove(os.path.join(dp, f))


def main():
    limpar_saida()
    manifest = {}

    # --- 1. Acervo fotográfico por categoria -------------------------------
    for entry in sorted(os.listdir(ROOT)):
        cat_dir = os.path.join(ROOT, entry)
        if not os.path.isdir(cat_dir) or entry.startswith((".", "_")) or entry in ("site", "build", "node_modules"):
            continue
        files = [f for f in sorted(os.listdir(cat_dir)) if f.lower().endswith(MATRIZES)]
        if not files:
            continue
        for f in files:
            stem = os.path.splitext(f)[0]
            key = "acervo/" + slugify(stem)
            manifest[key] = emit(os.path.join(cat_dir, f), "acervo", slugify(stem), cartao_inteiro=True)
            manifest[key]["source"] = f"{entry}/{f}"

    # --- 2. Fotografias vindas do Figma ------------------------------------
    figma_map = {
        "raw_1.jpeg": "residencia-encosta",   # hero: residência ao entardecer
        "raw_2.webp": "estar-alvenaria",      # estar com parede de alvenaria seca
        "raw_3.webp": "alvenaria-seca",       # textura de bloco irregular
        "raw_8.webp": "travertino-romano",    # exemplar de travertino
        "raw_5.webp": "muro-noturno",         # muro iluminado em luz rasante
        "raw_11.webp": "marmore-grafite",     # painel escuro com ripado
    }
    for fname, name in figma_map.items():
        path = os.path.join(FIGMA, fname)
        if not os.path.exists(path):
            print(f"  ! ausente: {fname}")
            continue
        manifest["marca/" + name] = emit(path, "marca", name)

    out_json = os.path.join(HERE, "images.json")
    with open(out_json, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=1)

    por_formato = {}
    for dp, _, fs in os.walk(OUT):
        for f in fs:
            ext = os.path.splitext(f)[1].lower().lstrip(".")
            n, b = por_formato.get(ext, (0, 0))
            por_formato[ext] = (n + 1, b + os.path.getsize(os.path.join(dp, f)))
    resumo = " · ".join(f"{n} {ext} ({b / 1048576:.1f} MB)" for ext, (n, b) in sorted(por_formato.items()))
    total = sum(b for _, b in por_formato.values())
    print(f"{len(manifest)} imagens · {resumo} · {total / 1048576:.1f} MB gerados")


if __name__ == "__main__":
    main()
