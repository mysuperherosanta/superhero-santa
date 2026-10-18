"""Clear pure-white background-removal leftovers from a cut-out.
The gaps in these renders are pure white (>=240 on every channel), while fur,
aprons and highlights are off-white, so only near-pure-white blobs of at least
MIN px are cleared, plus their blended fringe.
usage: whitekey.py src out [min_px] [floor]"""
import sys, numpy as np
from collections import deque
from PIL import Image
src,out=sys.argv[1:3]; MIN=int(sys.argv[3]) if len(sys.argv)>3 else 40; FL=int(sys.argv[4]) if len(sys.argv)>4 else 240
A=np.array(Image.open(src).convert('RGBA')).astype(np.int32)
rgb=A[...,:3]; mn=rgb.min(-1); sat=rgb.max(-1)-mn; a=A[...,3]
W=(mn>=FL)&(sat<14)&(a>0)
H,Wd=W.shape; lab=np.zeros(W.shape,np.int32); keep=np.zeros_like(W); k=0
for y,x in zip(*np.nonzero(W)):
    if lab[y,x]: continue
    k+=1; q=deque([(y,x)]); lab[y,x]=k; px=[]
    while q:
        cy,cx=q.popleft(); px.append((cy,cx))
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=cy+dy,cx+dx
            if 0<=ny<H and 0<=nx<Wd and W[ny,nx] and not lab[ny,nx]:
                lab[ny,nx]=k; q.append((ny,nx))
    if len(px)>=MIN:
        ys,xs=zip(*px); keep[list(ys),list(xs)]=True
def grow(M):
    G=M.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1): G|=np.roll(np.roll(M,dy,0),dx,1)
    return G
lum=rgb.mean(-1)
# two rings of light, greyish fringe go too; then soften the next ring
for _ in range(2): keep|=grow(keep)&(lum>205)&(sat<35)
ring=grow(keep)&~keep
A[keep,3]=0; A[ring,3]=(A[ring,3]*0.55).astype(np.int32)
print(src.split('/')[-1],'cleared',int(keep.sum()))
Image.fromarray(A.astype(np.uint8)).save(out,'WEBP',quality=90,method=6)
