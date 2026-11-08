"""Bake the hero's stable and the Santa/Mrs. Claus/elf layer into one image.

Run from the repo root:  python3 design-src/scripts/hero-cast.py
Needs Pillow and cwebp on PATH. Inputs are the full-size layers in design-src/layers/live/
(the cleaned versions that used to be served one by one). The elf boy, the elf girl and the Reindeer
stay separate layers (public/assets/img/hero-*.webp) because they move: the boy and girl hop when
tapped, the Reindeer pops up when found. (Nov 7 the boy and girl were baked in too, which killed the hop.)

All layers share the 1447 px-tall --cs canvas (x offsets from design-src/layers/meta.json).
The output is cropped to the Santa/Mrs. Claus/elf layer's left edge (x=289) through the stable's right edge
(x=2663), so in CSS it sits at left: cx + 289/1447·cs and is cs tall. The stable is composited behind the trio.
Writes public/assets/img/hero-cast.webp plus 520 and 900 px-tall copies for srcset.
"""
import json, os, subprocess, tempfile
from PIL import Image

SRC = "design-src/layers/live"
OUT = "public/assets/img"
meta = json.load(open("design-src/layers/meta.json"))
H = meta["CH"]
X0, X1 = meta["mid"]["x0"], meta["stable"]["x0"] + 1805  # stable layer is 1805 px wide

canvas = Image.new("RGBA", (X1 - X0, H), (0, 0, 0, 0))
for key, name in [("stable", "stable"), ("mid", "nativity-cast")]:
    layer = Image.open(f"{SRC}/{name}.webp").convert("RGBA")
    canvas.alpha_composite(layer, (meta[key]["x0"] - X0, 0))


def webp(im, out, q=82):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as t:
        im.save(t.name)
    subprocess.run(["cwebp", "-quiet", "-q", str(q), "-alpha_q", "90", "-m", "6", "-sharp_yuv", t.name, "-o", out], check=True)
    os.unlink(t.name)
    print(out, im.size, os.path.getsize(out) // 1024, "KB")


webp(canvas, f"{OUT}/hero-cast.webp", q=86)
for h in (520, 900):
    w = round(canvas.width * h / H)
    # resize premultiplied so transparent edges don't pick up a fringe
    webp(canvas.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA"), f"{OUT}/hero-cast-{h}.webp")
