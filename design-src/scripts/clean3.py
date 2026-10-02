import numpy as np, sys
from PIL import Image
from scipy import ndimage
def clean_with_mask(A,W,er=1,minisl=60):
    rgb=A[...,:3].astype(float); a0=A[...,3]>=128
    m=a0&ndimage.binary_erosion(W>0.5,iterations=er) if er else a0&(W>0.5)
    m=ndimage.binary_opening(m,iterations=1)
    lab,n=ndimage.label(m); sz=ndimage.sum(m,lab,range(1,n+1)); m=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>=minisl])
    notm=~m; lab2,n2=ndimage.label(notm)
    outside=set(np.unique(np.concatenate([lab2[0],lab2[-1],lab2[:,0],lab2[:,-1]])))|set(np.unique(lab2[~a0]))
    r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]; lum=rgb.mean(-1); sat=rgb.max(-1)-rgb.min(-1)
    bgl=(lum>175)&(sat<30)&((r-b)<9)
    for k in range(1,n2+1):
        if k in outside: continue
        reg=lab2==k
        if reg.sum()<4000 and bgl[reg].mean()<0.5: m|=reg
    dist=ndimage.distance_transform_edt(m)
    _,(iy,ix)=ndimage.distance_transform_edt(~(dist>5),return_indices=True)
    ref=rgb[iy,ix]; rl=ref.mean(-1); out=rgb.copy()
    light=m&(dist<=5)&(lum>rl+18); w=np.clip((6-dist)/5,0,1)[...,None]
    out=np.where(light[...,None],ref*(0.4+0.6*w)+out*(0.6-0.6*w),out)
    rim=m&(dist<=2); out[rim]=ref[rim]
    al=ndimage.gaussian_filter(m.astype(float),0.8)*255; al[~ndimage.binary_dilation(m,iterations=2)]=0
    return np.dstack([out,al]).clip(0,255).astype(np.uint8)
if __name__=='__main__':
    A=np.array(Image.open('cast/cast.webp').convert('RGBA'))
    W=np.load('mask_warp2.npy')
    out=clean_with_mask(A,W)
    Image.fromarray(out).save('cast/cast_clean3.webp',lossless=True)
    bg=Image.new('RGBA',out.shape[1::-1],(0,200,60,255)); bg.alpha_composite(Image.fromarray(out)); bb=bg.convert('RGB')
    O='/sessions/trusting-laughing-darwin/mnt/outputs/'
    bb.crop((0,330,1000,834)).save(O+'_c4a.png')
    bb.crop((1480,100,1992,834)).save(O+'_c4b.png')
    bb.crop((0,480,200,640)).resize((600,480)).save(O+'_c4h.png')
    bb.crop((600,300,920,560)).resize((640,520)).save(O+'_c4s.png')
