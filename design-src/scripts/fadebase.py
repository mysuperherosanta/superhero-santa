"""Fade out the bottom of a full-canvas hero layer, under the CSS snowbank (.bank).
The bank covers the bottom .088*cs of the canvas (y > 1320 of 1447), so alpha
ramps from 1 at y0 to 0 at y1. Lets a layer come forward (.ch.talk) without
its baked snow showing over the bank. Applied to hero-boy and hero-girl only:
the Reindeer pops up when found, which would lift a faded base into view.
usage: fadebase.py src out [y0] [y1]"""
import sys, numpy as np
from PIL import Image
src,out=sys.argv[1:3]; y0=int(sys.argv[3]) if len(sys.argv)>3 else 1318; y1=int(sys.argv[4]) if len(sys.argv)>4 else 1336
A=np.array(Image.open(src).convert('RGBA')).astype(float)
ys=np.arange(A.shape[0])[:,None]
A[...,3]*=np.clip((y1-ys)/(y1-y0),0,1)
Image.fromarray(A.clip(0,255).astype(np.uint8)).save(out,'WEBP',quality=90,method=6)
print(src.split('/')[-1],'faded',y0,'-',y1)
