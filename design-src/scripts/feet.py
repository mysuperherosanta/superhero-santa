"""Remove the light-grey ground shadow under a cut-out's feet: in the bottom
`frac` of the figure's bounding box, light, grey pixels become transparent.
usage: feet.py src out [frac]"""
import sys, numpy as np
from PIL import Image
src,out=sys.argv[1:3]; frac=float(sys.argv[3]) if len(sys.argv)>3 else 0.05
A=np.array(Image.open(src).convert('RGBA')).astype(np.int32)
rgb=A[...,:3]; lum=rgb.mean(-1); sat=rgb.max(-1)-rgb.min(-1)
ys=np.nonzero(A[...,3].max(1)>20)[0]; top,bot=ys.min(),ys.max()
y0=int(bot-(bot-top)*frac)
M=np.zeros(lum.shape,bool); M[y0:]=(lum[y0:]>120)&(sat[y0:]<28)
A[M,3]=0
print(src.split('/')[-1],'band from',y0,'cleared',int(M.sum()))
Image.fromarray(A.astype(np.uint8)).save(out,'WEBP',quality=90,method=6)
