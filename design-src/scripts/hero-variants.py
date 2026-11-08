"""Smaller copies of the hero layers for srcset, plus a phone crop of the backdrop.

Run from the repo root:  python3 design-src/scripts/hero-variants.py
Needs Pillow and cwebp on PATH. Re-run whenever a hero layer in public/assets/img/ changes.

- The canvas layers are 1447 px tall (the --cs canvas). Phones and 1x desktops show them
  at 175-400 CSS px tall, so 520 and 900 px tall copies cover 1x-3x screens.
- hero-backdrop-phone.webp is the centre 544 px of the backdrop. On a portrait screen
  <=900 px wide the hero shows at most ~36% of the backdrop's width (it is drawn
  2.5*cs + lift tall, cs = 44.8vw), so this crop is pixel-identical there.
"""
import os, subprocess, tempfile
from PIL import Image

IMG = "public/assets/img"
# the stable, Santa/Mrs. Claus/elf, boy and girl are now one image built by hero-cast.py (which makes its own sizes)
LAYERS = ["hero-reindeer"]
HEIGHTS = [520, 900]


def webp(im, out, q=82):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as t:
        im.save(t.name)
    subprocess.run(["cwebp", "-quiet", "-q", str(q), "-alpha_q", "90", "-m", "6", "-sharp_yuv", t.name, "-o", out], check=True)
    os.unlink(t.name)
    print(out, im.size, os.path.getsize(out) // 1024, "KB")


for name in LAYERS:
    src = Image.open(f"{IMG}/{name}.webp").convert("RGBA")
    for h in HEIGHTS:
        w = round(src.width * h / src.height)
        # resize premultiplied so transparent edges don't pick up a dark/light fringe
        small = src.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")
        webp(small, f"{IMG}/{name}-{h}.webp")

bd = Image.open(f"{IMG}/hero-backdrop.webp").convert("RGB")
cw = 544
x0 = (bd.width - cw) // 2
webp(bd.crop((x0, 0, x0 + cw, bd.height)), f"{IMG}/hero-backdrop-phone.webp", q=80)
