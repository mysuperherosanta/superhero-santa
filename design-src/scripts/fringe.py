import numpy as np
from PIL import Image
from scipy import ndimage
def whitemask(A, halo_d=14):
    rgb=A[...,:3].astype(float); al=A[...,3].astype(float); m=al>128
    mn=rgb.min(-1); mx=rgb.max(-1); g=rgb.mean(-1)
    sd=np.sqrt(np.maximum(ndimage.uniform_filter(g**2,7)-ndimage.uniform_filter(g,7)**2,0))
    flat=m&(mn>232)&((mx-mn)<12)&(sd<3.0)
    # pockets: flat white blobs of real size anywhere
    lab,n=ndimage.label(flat); sz=ndimage.sum(flat,lab,range(1,n+1))
    pockets=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>=40])
    # halo: bright neutral smooth pixels near the outer edge, connected to edge
    dist=ndimage.distance_transform_edt(m)
    cand=m&(dist<=halo_d)&(mn>200)&((mx-mn)<20)&(sd<6)
    lab2,_=ndimage.label(cand); ids=np.unique(lab2[(dist<=2)&cand]); ids=ids[ids>0]
    halo=np.isin(lab2,ids)
    bad=pockets|halo
    # grow pockets a little to eat their antialiased rim
    grow=ndimage.binary_dilation(pockets,iterations=3)&m&(mn>190)&((mx-mn)<30)
    return bad|grow, pockets, halo
def clean(A):
    bad,p,h=whitemask(A)
    B=A.copy(); al=B[...,3].astype(float)
    al[bad]=0
    m=al>128
    inner=ndimage.binary_erosion(m,iterations=3)
    d,(iy,ix)=ndimage.distance_transform_edt(~inner,return_indices=True)
    rgb=B[...,:3][iy,ix]
    a2=ndimage.gaussian_filter(ndimage.binary_erosion(m,iterations=1).astype(float),0.8)*255
    return np.dstack([rgb,a2]).clip(0,255).astype(np.uint8), bad, p, h
if __name__=='__main__':
    import sys
    A=np.array(Image.open(sys.argv[1]).convert('RGBA'))
    C,bad,p,h=clean(A)
    print('pockets',p.sum(),'halo',h.sum())
    rgb=A[...,:3].copy(); bg=np.array([40,60,90]); a=A[...,3:]/255
    v=(rgb*a+bg*(1-a)).astype(np.uint8); v[p]=[255,0,0]; v[h&~p]=[255,200,0]
    Image.fromarray(v).save(sys.argv[2]+'_mask.png')
    bgi=Image.new('RGBA',C.shape[1::-1],(40,60,90,255)); bgi.alpha_composite(Image.fromarray(C)); bgi.convert('RGB').save(sys.argv[2]+'_clean.png')
    Image.fromarray(C).save(sys.argv[3])

def clean2(A, band=7, inset=9, thr=22):
    bad,p,h=whitemask(A)
    B=A.copy().astype(float); B[...,3][bad]=0
    m=B[...,3]>128
    m=ndimage.binary_opening(m,iterations=1)
    dist=ndimage.distance_transform_edt(m)
    inner=dist>inset
    _,(iy,ix)=ndimage.distance_transform_edt(~inner,return_indices=True)
    ref=B[...,:3][iy,ix]
    rgb=B[...,:3]
    lum=rgb.mean(-1); rl=ref.mean(-1)
    edge=m&(dist<=band)
    light=edge&(lum>rl+thr)
    # blend weight rises toward the outer edge
    w=np.clip((band+1-dist)/band,0,1)[...,None]
    rgb=np.where(light[...,None], ref*(0.35+0.65*w)+rgb*(1-(0.35+0.65*w)), rgb)
    # outermost 2px always take interior colour
    rim=m&(dist<=2.5); rgb[rim]=ref[rim]
    a=ndimage.gaussian_filter(ndimage.binary_erosion(m,iterations=2).astype(float),0.9)*255
    return np.dstack([rgb,a]).clip(0,255).astype(np.uint8)
