"""Rebuild one side of a symmetric hem by mirroring the other side about cx,
feathering across `fw` px at the side seam and along the top of the band.
usage: hemmirror.py src out cx x_from y0 y1 [fw]   (replaces x >= x_from)"""
import sys, numpy as np
from PIL import Image
src,out=sys.argv[1:3]; cx,xf,y0,y1=map(int,sys.argv[3:7]); fw=int(sys.argv[7]) if len(sys.argv)>7 else 16
A=np.array(Image.open(src).convert('RGBA')).astype(float); B=A.copy()
for x in range(xf,A.shape[1]):
    sx=2*cx-x
    if sx<0: B[y0:y1,x,3]=0; continue
    w=min(1,(x-xf)/fw)*np.clip((np.arange(y0,y1)-y0)/fw,0,1)[:,None]
    B[y0:y1,x]=A[y0:y1,sx]*w+A[y0:y1,x]*(1-w)
Image.fromarray(B.clip(0,255).astype(np.uint8)).save(out,'WEBP',quality=90,method=6)
