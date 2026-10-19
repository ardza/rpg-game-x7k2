#!/usr/bin/env python3
"""Style2 add-on: pack-opening animation + battle backgrounds. Run: python3 gen_style2_packbattle.py"""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFilter
from gen_style2 import PAL, INK, R, HERE, shape, mline, blob, mtext, cardboard, wob
FW,FH=192,224; CX,CY=96,112
RAR={'common':PAL['gray'],'uncommon':PAL['green'],'rare':PAL['blue'],'epic':PAL['purple'],'legendary':PAL['gold']}
def rgb(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def fr(): return Image.new('RGBA',(FW,FH),(0,0,0,0))
def glow(col,r,alpha=200):
    g=fr(); d=ImageDraw.Draw(g); d.ellipse((CX-r,CY-r*1.15,CX+r,CY+r*1.15),fill=rgb(col)+(alpha,))
    return g.filter(ImageFilter.GaussianBlur(r/3))
def rays(d,col,n,r0,r1,rot,w=6):
    for i in range(n):
        a=rot+2*math.pi*i/n; mline(d,[(CX+r0*math.cos(a),CY+r0*math.sin(a)),(CX+r1*math.cos(a),CY+r1*math.sin(a))],w,1.5,col)
def sparkle(d,x,y,s):
    p=[(x,y-s),(x+s*.25,y-s*.25),(x+s,y),(x+s*.25,y+s*.25),(x,y+s),(x-s*.25,y+s*.25),(x-s,y),(x-s*.25,y-s*.25)]
    d.polygon(p,fill=PAL['paper']); d.line(p+[p[0]],fill=INK,width=2)
def pack_frames(tier,back):
    pk=Image.open(f'{HERE}/ui/pack_{tier}_96x128.png').convert('RGBA'); pw,ph=pk.size
    top,bot=pk.crop((0,0,pw,30)),pk.crop((0,30,pw,ph))
    F={}; ox,oy=CX-pw//2,CY-ph//2
    for i,(dx,ang) in enumerate([(0,0),(-5,-6),(5,6),(-3,-3)]):            # shake
        R.seed(300+i); f=fr(); f.alpha_composite(pk.rotate(ang,expand=True,resample=Image.BICUBIC),(ox+dx-(int(abs(ang))),oy-int(abs(ang)))); F[f'shake{i}']=f
    for i,(lift,ang) in enumerate([(4,-8),(14,-22),(30,-45)]):              # tear
        R.seed(310+i); f=fr(); d=ImageDraw.Draw(f); f.alpha_composite(bot,(ox,oy+30))
        mline(d,[(ox+k*12,oy+31+(k%2)*4) for k in range(9)],3)            # jagged tear
        t=top.rotate(ang,expand=True,resample=Image.BICUBIC); f.alpha_composite(t,(ox+lift//2,oy-lift-t.height//4)); F[f'tear{i}']=f
    for i in range(3):                                                       # burst (paper white flash + confetti)
        R.seed(320+i); f=fr(); d=ImageDraw.Draw(f); r=30+i*28
        f.alpha_composite(glow(PAL['paper'],r,230)); rays(d,PAL['yellow'],10,r*.4,r*1.2,i*.3)
        rc=random.Random(i)
        for _ in range(14):
            a=rc.uniform(0,6.28); q=r*rc.uniform(.6,1.4); x,y=CX+q*math.cos(a),CY+q*math.sin(a)
            shape(d,[(x,y),(x+14,y+2),(x+12,y+12),(x-2,y+10)],rc.choice([PAL['pink'],PAL['yellow'],PAL['blue'],PAL['lime']]),w=2,j=.8)
        if i==0: f.alpha_composite(bot,(ox,oy+30+8))
        F[f'burst{i}']=f
    return F
def reveal_frames(rarity,back,holo=False):
    col=RAR[rarity]; F={}
    for i in range(4):                                                       # card rises + glow pulses
        R.seed(400+i); f=fr(); d=ImageDraw.Draw(f); r=[60,74,82,76][i]
        f.alpha_composite(glow(col,r,210)); rays(d,col,12,64,r+18,i*.13,5)
        s=[.6,.85,1.0,1.0][i]; c=back.resize((int(120*s),int(168*s)),Image.BICUBIC)
        f.alpha_composite(c,(CX-c.width//2,CY-c.height//2))
        if holo:
            for k,(x,y) in enumerate([(40,40),(156,64),(48,176),(150,190),(96,22)]):
                if (k+i)%2==0: sparkle(d,x,y,7+(i%2)*3)
        F[f'reveal{i}']=f
    return F
TIMING={'shake':120,'tear':90,'burst':70,'reveal':140}
def build_pack():
    out=f'{HERE}/ui/pack_open'; os.makedirs(out,exist_ok=True)
    back=Image.open(f'{HERE}/cards/card_back_120x168.png').convert('RGBA')
    meta={'frame_w':FW,'frame_h':FH,'note':'Pack centered at (96,112). Reveal shows card BACK as placeholder at scale; on last reveal frame code draws the real card (120x168) at (36,28) over it. Holo variant adds sparkles (5% holo roll). reveal3 loops while waiting for tap.','sequences':{}}
    def save(name,frames):
        names=list(frames); sheet=Image.new('RGBA',(FW*len(names),FH),(0,0,0,0)); seq=[]
        for i,n in enumerate(names):
            frames[n].save(f'{out}/{name}_{n}.png'); sheet.alpha_composite(frames[n],(i*FW,0))
            seq.append({'i':i,'name':n,'ms':TIMING[n.rstrip('0123456789')]+(160 if n=='shake3' or n=='tear2' else 0)})
        sheet.save(f'{out}/{name}_sheet.png'); meta['sequences'][name]={'sheet':f'{name}_sheet.png','frames':seq,'loop_last':name.startswith('reveal'),'total_ms':sum(s['ms'] for s in seq)}
    for t in ('basic','premium','elite'): save(f'open_{t}',pack_frames(t,back))
    for r in RAR:
        save(f'reveal_{r}',reveal_frames(r,back)); save(f'reveal_{r}_holo',reveal_frames(r,back,True))
    json.dump(meta,open(f'{out}/pack_open.json','w'),indent=1)
    return meta
# ---------- battle backgrounds ----------
def bg_stream(variant):
    W,H=720,528; im=cardboard(W,H,seed=70+variant); d=ImageDraw.Draw(im); R.seed(500+variant)
    if variant==0:   # "streamer bedroom stage": LED wall, ring lights, view counter
        shape(d,[(20,20),(700,18),(702,330),(18,334)],'#2a2140',w=5,j=1.5)
        for k in range(6): mline(d,[(30,60+k*44),(690,58+k*44)],3,1,[PAL['pink'],PAL['blue'],PAL['purple']][k%3])
        for x in (110,610):
            for r,c in ((62,PAL['paper']),(44,'#2a2140')): p=blob(x,150,r,r,j=.03,n=36); d.polygon(p,fill=c); d.line(p+[p[0]],fill=INK,width=4)
            mline(d,[(x,212),(x,370)],5); mline(d,[(x-30,372),(x,360),(x+30,372)],4)
        shape(d,[(250,36),(470,34),(472,84),(248,86)],PAL['red'],w=4); mtext(d,(360,60),'● LIVE  12 VIEWERS',22,PAL['paper'],'mm')
        shape(d,[(300,110),(420,108),(422,140),(298,142)],PAL['yellow'],w=3); mtext(d,(360,125),'+ FOLLOW?',18,INK,'mm')
        floor='#7a5a8a'
    else:            # "hype launch pop-up": banners, velvet rope, fake queue
        shape(d,[(0,0),(720,0),(720,330),(0,330)],'#3a5a7a',w=0,j=0,raw=True)
        for i in range(8):
            x=i*92+10; shape(d,[(x,0),(x+70,0),(x+70,70),(x+35,92),(x,70)],[PAL['pink'],PAL['yellow'],PAL['lime'],PAL['orange']][i%4],w=3)
        shape(d,[(210,110),(510,104),(514,170),(206,176)],PAL['paper'],w=5); mtext(d,(360,128),'DROP DAY',34,PAL['red'],'mm'); mtext(d,(360,160),'limited to infinity units',14,INK,'mm')
        for x in (40,680):
            mline(d,[(x,200),(x,372)],6); d.ellipse((x-12,188,x+12,212),fill=PAL['gold'],outline=INK,width=3)
        mtext(d,(70,250),'SOLD OUT*',20,PAL['paper']); mtext(d,(560,250),'*restocking hourly',14,PAL['paper'])
        floor='#8a3a3a'
    shape(d,[(0,330),(720,326),(720,446),(0,446)],floor,w=4,j=1.5)  # open floor band y330-446, no baked shadows   # stage floor band (party/enemies stand ~y284-380)
    for x in (-40,680): mline(d,[(x+60,330),(x,446)],2,1,'#00000055')  # edge planks only, keep middle clear
    shape(d,[(0,446),(720,446),(720,528),(0,528)],PAL['card_dk'],w=0,j=0,raw=True)   # command bar zone left plain
    return im
def shadow(w,h):
    S=4; im=Image.new('RGBA',(w*S,h*S),(0,0,0,0)); d=ImageDraw.Draw(im); R.seed(600+w)
    p=blob(w*S/2,h*S/2,w*S/2-6*S/2,h*S/2-3*S/2,j=.05,n=30); d.polygon(p,fill=rgb(INK)+(110,))
    for k in range(3): y=h*S/2+(k-1)*h*S/6; mline(d,[(w*S*.25,y),(w*S*.75,y+2)],max(2,S),1.5,rgb(INK)+(70,))  # marker hatch
    return im.resize((w,h),Image.LANCZOS)
def build_battle():
    out=f'{HERE}/battle'; os.makedirs(out,exist_ok=True); bgs=[]
    shadow(48,16).save(f'{out}/shadow_48x16.png'); shadow(96,24).save(f'{out}/shadow_96x24.png')
    for v,n in ((0,'bg_stream_room'),(1,'bg_drop_day')):
        b=bg_stream(v); b.convert('RGB').save(f'{out}/{n}_720x528.png'); bgs.append((n,b))
    return bgs
def preview(meta,bgs):
    out=f'{HERE}/ui/pack_open'; P=cardboard(1500,1000,seed=88); d=ImageDraw.Draw(P)
    mtext(d,(20,8),'STYLE 2 — PACK OPENING + BATTLE BG',32)
    for row,name in enumerate(['open_basic','open_premium','open_elite']):
        s=Image.open(f'{out}/{name}_sheet.png'); s=s.resize((s.width//2,s.height//2)); P.alpha_composite(s,(20,56+row*118)); mtext(d,(20+s.width+8,100+row*118),name,14)
    for i,r in enumerate(RAR):
        s=Image.open(f'{out}/reveal_{r}{"_holo" if r=="rare" else ""}_sheet.png'); s=s.resize((s.width//3,s.height//3)); P.alpha_composite(s,(20+(i%2)*330,420+(i//2)*84)); mtext(d,(24+(i%2)*330,420+(i//2)*84),r+(' holo' if r=='rare' else ''),12)
    for i,(n,b) in enumerate(bgs): P.alpha_composite(b.resize((360,264)),(720+(i%2)*380 if i<2 else 720,420)); mtext(d,(720+i*380,690),n,14)
    demo=bgs[0][1].copy(); sh=Image.open(f'{HERE}/battle/shadow_96x24.png')
    for x in (70,170,270): demo.alpha_composite(sh,(x-48,388))
    for x in (420,480,540,600,660): demo.alpha_composite(Image.open(f'{HERE}/battle/shadow_48x16.png'),(x-24,392))
    P.alpha_composite(demo.resize((360,264)),(1100,720)); mtext(d,(1100,990-6),'demo: 3 party + 5 enemy shadows (code)',12)
    mock=Image.open(f'{HERE}/battle_mock_720x528.png').convert('RGBA').resize((360,264)); P.alpha_composite(mock,(720,720)); mtext(d,(720,988),'layout ref (mock)',12)
    P.convert('RGB').save(f'{HERE}/pack_battle_preview.png')
if __name__=='__main__':
    m=build_pack(); b=build_battle(); preview(m,b)
