"""Make light background-removal gaps transparent inside given rects.
usage: gapfix.py src out 'x0,y0,x1,y1[,lum,sat]' ...
A pixel is a gap if it's inside a rect, brighter than lum (default 195) and
greyer than sat (default 45). The blended fringe around it is cleared too.
For gaps inside an opaque scene (the stable), use gapfill.py instead."""
import sys, numpy as np
from PIL import Image
src,out,*rects=sys.argv[1:]
A=np.array(Image.open(src).convert('RGBA')).astype(np.int32)
rgb=A[...,:3]; lum=rgb.mean(-1); sat=rgb.max(-1)-rgb.min(-1)
M=np.zeros(lum.shape,bool)
for r in rects:
    v=[int(t) for t in r.split(',')]
    x0,y0,x1,y1=v[:4]; L=v[4] if len(v)>4 else 195; Sm=v[5] if len(v)>5 else 45
    reg=np.zeros_like(M); reg[y0:y1,x0:x1]=True
    M|=reg&(lum>L)&(sat<Sm)&(A[...,3]>0)
# grow by 1px into pixels that are noticeably lighter than the subject (blended fringe)
ring=np.zeros_like(M)
for dy in (-1,0,1):
    for dx in (-1,0,1):
        ring|=np.roll(np.roll(M,dy,0),dx,1)
ring&=~M
fr=ring&(lum>170)&(sat<70)
M|=fr
ring2=np.zeros_like(M)
for dy in (-1,0,1):
    for dx in (-1,0,1):
        ring2|=np.roll(np.roll(M,dy,0),dx,1)
ring2&=~M
A[M,3]=0
A[ring2,3]=(A[ring2,3]*0.6).astype(np.int32)
print('cleared',int(M.sum()),'px')
Image.fromarray(A.astype(np.uint8)).save(out,'WEBP',quality=92,method=6)
