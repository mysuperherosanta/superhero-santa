import numpy as np, json
from PIL import Image, ImageFilter
from scipy import ndimage
exec(open('grade.py').read().split('# light vector per asset')[0])
OUT='/sessions/trusting-laughing-darwin/work/graded5/'
import os; os.makedirs(OUT,exist_ok=True)
def defringe(im,e_in=6,e_a=3):
    A=np.array(im).astype(float); m=A[...,3]>128
    inner=ndimage.binary_erosion(m,iterations=e_in)
    d,(iy,ix)=ndimage.distance_transform_edt(~inner,return_indices=True)
    rgb=A[...,:3][iy,ix]
    al=ndimage.gaussian_filter(ndimage.binary_erosion(m,iterations=e_a).astype(float),0.7)
    return Image.fromarray(np.dstack([rgb,al*255]).clip(0,255).astype('uint8'),'RGBA')
cast=np.array(Image.open('cast/cast_clean.webp').convert('RGBA'))
Hc=cast.shape[0]; FEET=828
K=817/341.0
from fringe import clean2
st=Image.fromarray(clean2(np.array(Image.open('nat7/stable2.webp').convert('RGBA')),band=5,inset=7))
sw,sh=int(st.width*K),int(st.height*K)
st=np.array(st.resize((sw,sh),Image.LANCZOS))
TOP=int(round(585*K-FEET))
XS=760
XR=XS+1600
W=XR+(cast.shape[1]-1505); H=TOP+max(Hc,sh-TOP+ (0))
H=max(TOP+Hc, sh)
C=np.zeros((H,W,4),np.uint8); lab=np.zeros((H,W),np.uint8)
def over(dst,src,x,y):
    h,w=src.shape[:2]; d=dst[y:y+h,x:x+w].astype(float); s=src.astype(float)
    sa=s[...,3:]/255; da=d[...,3:]/255; oa=sa+da*(1-sa)
    rgb=(s[...,:3]*sa+d[...,:3]*da*(1-sa))/np.maximum(oa,1e-6)
    dst[y:y+h,x:x+w]=np.dstack([rgb,oa*255]).clip(0,255).astype(np.uint8)
over(C,st,XS,0); lab[0:sh,XS:XS+sw][st[...,3]>40]=3
left=cast[:,:906].copy(); right=cast[:,1505:].copy()
over(C,left,0,TOP); over(C,right,XR,TOP)
# labels for cast parts by eroded components
def comps(part,x0,names):
    a=part[...,3]>40; er=ndimage.binary_erosion(a,iterations=5)
    l,n=ndimage.label(er); sz=ndimage.sum(er,l,range(1,n+1))
    keep=[i+1 for i,s in enumerate(sz) if s>5000]; ob=ndimage.find_objects(l)
    keep=sorted(keep,key=lambda k:ob[k-1][1].start)
    print('comps',len(keep))
    for nm,k in zip(names,keep):
        sub=lab[TOP:TOP+Hc,x0:x0+part.shape[1]]; sub[l==k]=nm
    # un-eroded fringe of cast drawn over stable -> nearest cast label
comps(left,0,[1,2]); comps(right,XR,[4,5])
im=Image.fromarray(C,'RGBA')
g=grade(im,np.array([6,-32],float),rim=0.2,cool=0.25,bounce=0.12)
# snow bank sized to the cast (Href), base = feet line
Href=834
def snowbank3(im,posts,base,h=0.055):
    W,H=im.size; padx=int(W*0.04); padb=int(Href*0.05)
    canvas=Image.new('RGBA',(W+2*padx,base+padb),(0,0,0,0)); canvas.alpha_composite(im.crop((0,0,W,base+padb)),(padx,0))
    CW,CH=canvas.size; x=np.arange(CW); t=x/CW*(W/1992)
    wave=(np.sin(t*23)*0.35+np.sin(t*57+1.3)*0.25+np.sin(t*131+0.4)*0.15+np.sin(t*9+2)*0.25+np.sin(t*301+.7)*0.08)
    top=base-Href*h-wave*Href*0.018
    for px in [padx+p for p in posts]: top=top-np.exp(-((x-px)/(1992*0.035))**2)*Href*0.045
    ledge=padx*0.15; redge=CW-padx*0.15
    taper=np.clip((x-ledge)/(padx*0.9),0,1)*np.clip((redge-x)/(padx*0.9),0,1)
    top=base-(base-top)*taper; bottom=base+padb*0.9
    ys=np.arange(CH)[:,None]; inside=(ys>=top[None,:])&(ys<=bottom)
    depth=np.clip((ys-top[None,:])/(bottom-top[None,:]+1e-6),0,1)
    col=np.where(depth[...,None]<0.35,SNOW_HI+(SNOW_MID-SNOW_HI)*(depth[...,None]/0.35),SNOW_MID+(SNOW_SH-SNOW_MID)*((depth[...,None]-0.35)/0.65))
    salpha=ndimage.gaussian_filter(inside.astype(float),1.6)
    under=np.where(depth>0.5,np.clip(1-(depth-0.5)/0.5,0,1)**1.3,1.0); salpha=salpha*under*taper[None,:]
    ridge=np.exp(-((ys-top[None,:])/(Href*0.010))**2)*inside
    col=col+(np.array([255,250,244])-col)*ridge[...,None]*0.6
    snow=Image.fromarray(np.dstack([col,salpha*255]).clip(0,255).astype('uint8'),'RGBA').filter(ImageFilter.GaussianBlur(0.6))
    ca=np.array(canvas); ca[...,3]=np.where(ys>top[None,:]+Href*0.022,0,ca[...,3]); canvas=Image.fromarray(ca,'RGBA')
    canvas.alpha_composite(snow); return canvas,padx
BASE=TOP+FEET+4
posts=[XS+int(40*K),XS+int(712*K),95,300,520,760,XR+(1640-1505),XR+(1870-1505),XS+int(200*K),XS+int(450*K)]
full,padx=snowbank3(g,posts,BASE)
CW,CH=full.size; print('full',full.size,'TOP',TOP,'XS',XS,'XR',XR,'K',K)
full.save(OUT+'full.webp','WEBP',quality=90,method=6)
bg=Image.new('RGBA',full.size,(40,60,90,255)); bg.alpha_composite(full); bg.convert('RGB').resize((CW//3,CH//3)).save('/sessions/trusting-laughing-darwin/mnt/outputs/_scene5.jpg')
L=np.zeros((CH,CW),np.uint8); L[:min(H,CH),padx:padx+W]=lab[:min(H,CH)]
dist,(iy,ix)=ndimage.distance_transform_edt(L==0,return_indices=True); Lf=L[iy,ix]
fa=np.array(full); meta={}
for i,nm in enumerate(['boy','mid','stable','girl','deer']):
    m=Lf==i+1; layer=fa.copy(); layer[...,3]=np.where(m,layer[...,3],0)
    xs=np.where((layer[...,3]>0).any(axis=0))[0]; ysn=np.where((layer[...,3]>0).any(axis=1))[0]
    x0,x1=int(xs.min()),int(xs.max()+1); y0=int(ysn.min())
    Image.fromarray(layer,'RGBA').crop((x0,y0,x1,CH)).save(OUT+f'{nm}.webp','WEBP',quality=88,method=6)
    meta[nm]={'x0':x0,'x1':x1,'y0':y0}; print(nm,meta[nm])
meta.update(CW=CW,CH=CH,padx=padx,TOP=TOP,XS=XS,XR=XR)
json.dump(meta,open(OUT+'meta.json','w'))
