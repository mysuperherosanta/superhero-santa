"""Patch holes that background removal punched through a light fur hem.
Inside the rect, every pixel above a column's lowest solid pixel becomes
solid, coloured by blending the nearest solid fur left and right on its row.
usage: hemfill.py src out x0,y0,x1,y1"""
import sys, numpy as np
from PIL import Image
src,out,r=sys.argv[1:4]; x0,y0,x1,y1=map(int,r.split(','))
A=np.array(Image.open(src).convert('RGBA')).astype(float)
a=A[...,3]; solid=a>200
H=np.zeros(a.shape,bool)
for x in range(x0,x1):
    col=np.nonzero(solid[y0:y1,x])[0]
    if len(col): H[y0:y0+col.max()+1,x]=~solid[y0:y0+col.max()+1,x]
rng=np.random.default_rng(1)
for y in range(y0,y1):
    xs=np.nonzero(H[y])[0]
    for x in xs:
        l=x
        while l>0 and not solid[y,l]: l-=1
        r_=x
        while r_<a.shape[1]-1 and not solid[y,r_]: r_+=1
        cl=A[y,l,:3]; cr=A[y,r_,:3] if solid[y,r_] else cl
        if not solid[y,l]: cl=cr
        t=(x-l)/max(1,r_-l)
        A[y,x,:3]=cl*(1-t)+cr*t+rng.normal(0,4,3); A[y,x,3]=255
print('patched',int(H.sum()))
Image.fromarray(A.clip(0,255).astype(np.uint8)).save(out,'WEBP',quality=90,method=6)
