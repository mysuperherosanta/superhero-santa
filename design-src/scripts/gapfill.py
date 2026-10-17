"""Fill light background-removal gaps inside an opaque layer.
usage: gapfill.py src out 'x0,y0,x1,y1,lum,sat,mode' ...
A pixel is a gap if it's inside the rect, brighter than lum and greyer than sat.
mode: 'lerp'  = blend, row by row, between the colours either side of the gap;
      'cNN' / 'c-NN' = clone pixels from NN px to the right / left on the same row.
The gap is grown 1px to catch the blended fringe, and the next 1px ring is
pulled 80% toward the filled neighbours so no light outline remains."""
import sys, numpy as np
from PIL import Image
src,out,*rects=sys.argv[1:]
A=np.array(Image.open(src).convert('RGBA')).astype(float)
rgb=A[...,:3]; src_rgb=rgb.copy(); lum=rgb.mean(-1); sat=rgb.max(-1)-rgb.min(-1)
def grow(M):
    G=M.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1): G|=np.roll(np.roll(M,dy,0),dx,1)
    return G
n=0
for r in rects:
    x0,y0,x1,y1,L,Sm,mode=r.split(','); x0,y0,x1,y1,L,Sm=map(int,(x0,y0,x1,y1,L,Sm))
    M=np.zeros(lum.shape,bool); M[y0:y1,x0:x1]=(lum[y0:y1,x0:x1]>L)&(sat[y0:y1,x0:x1]<Sm)
    D=grow(M); ring=grow(D)&~D
    for y,x in zip(*np.nonzero(D)):
        if mode=='lerp':
            xl=xr=x
            while D[y,xr]: xr+=1
            while D[y,xl]: xl-=1
            t=(x-xl)/(xr-xl); rgb[y,x]=src_rgb[y,xl]*(1-t)+src_rgb[y,xr]*t
        else:
            rgb[y,x]=src_rgb[y,x+int(mode[1:])]
    for y,x in zip(*np.nonzero(ring)):
        nb=[rgb[y+dy,x+dx] for dy in (-1,0,1) for dx in (-1,0,1) if D[y+dy,x+dx]]
        rgb[y,x]=0.8*np.mean(nb,0)+0.2*src_rgb[y,x]
    n+=int(D.sum())
print('filled',n,'px')
A[...,:3]=rgb
Image.fromarray(A.clip(0,255).astype(np.uint8)).save(out,'WEBP',quality=92,method=6)
