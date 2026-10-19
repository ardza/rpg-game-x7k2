#!/usr/bin/env python3
"""Style 2: 'marker on cardboard'. Run: python3 gen_style2.py -> outputs in this folder."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, math, os
HERE=os.path.dirname(os.path.abspath(__file__))
R=random.Random(7)   # outline wobble (changes per boil frame)
RB=random.Random(99) # base geometry (fixed per drawing)
PAL={'ink':'#1a1423','card':'#c49a6c','card_dk':'#9c7448','paper':'#f6f1e4','pink':'#ff3e8a','yellow':'#ffd400',
     'blue':'#2f6bff','lime':'#8fe03a','orange':'#ff7a1a','red':'#e8322b','gray':'#8d8d96','silver':'#c9ccd6','gold':'#e8b530','purple':'#8a3cff','green':'#2fa84f'}
INK=PAL['ink']; W_OUT=5
FONT='/usr/share/fonts/truetype/sand-box/google/Permanent Marker/PermanentMarker-Regular.ttf'
def F(n): return ImageFont.truetype(FONT,n)

def wob(pts,j=2.0,step=10):
    """Subdivide a closed polygon and jitter it so it looks hand-cut."""
    out=[]
    for i in range(len(pts)):
        (x0,y0),(x1,y1)=pts[i],pts[(i+1)%len(pts)]
        n=max(1,int(math.hypot(x1-x0,y1-y0)/step))
        for k in range(n):
            t=k/n; out.append((x0+(x1-x0)*t+R.uniform(-j,j),y0+(y1-y0)*t+R.uniform(-j,j)))
    return out
def blob(cx,cy,rx,ry,j=0.06,n=28,rot=0):
    return [(cx+rx*(1+RB.uniform(-j,j))*math.cos(a+rot),cy+ry*(1+R.uniform(-j,j))*math.sin(a+rot)) for a in [2*math.pi*i/n for i in range(n)]]
def shape(d,pts,fill,w=W_OUT,j=2.0,raw=False):
    p=pts if raw else wob(pts,j)
    d.polygon(p,fill=fill)
    d.line(p+[p[0]],fill=INK,width=w,joint='curve')
def mline(d,pts,w=W_OUT,j=1.5,col=INK):
    p=[(x+R.uniform(-j,j),y+R.uniform(-j,j)) for x,y in pts]; d.line(p,fill=col,width=w,joint='curve')
def dot(d,x,y,r=4,col=INK): d.ellipse((x-r,y-r,x+r,y+r),fill=col)
def mtext(d,xy,s,size,col=INK,anchor='la',rot=None): d.text(xy,s,font=F(size),fill=col,anchor=anchor)

def cardboard(w,h,seed=1):
    r=random.Random(seed); im=Image.new('RGB',(w,h),PAL['card']); d=ImageDraw.Draw(im)
    for _ in range(w*h//60):
        x,y=r.randrange(w),r.randrange(h); c=r.choice([(186,143,98),(204,164,118),(176,134,92)]); d.point((x,y),fill=c)
    for y in range(0,h,9):  # corrugation streaks
        d.line((0,y+r.randint(-1,1),w,y),fill=(190,148,104),width=1)
    for _ in range(w//25): x=r.randrange(w); d.line((x,r.randrange(h),x+r.randint(-30,30),r.randrange(h)),fill=(178,136,94),width=1)
    return im.filter(ImageFilter.GaussianBlur(0.6)).convert('RGBA')

def canvas(w,h): im=Image.new('RGBA',(w,h),(0,0,0,0)); return im,ImageDraw.Draw(im)

# ---------- 1. player kid, side view facing right, 96x128 ----------
def player():
    im,d=canvas(96,128)
    shape(d,[(30,116),(46,116),(48,124),(26,125)],PAL['blue'])           # back sneaker
    shape(d,[(50,116),(64,115),(74,123),(48,125)],PAL['blue'])           # front sneaker
    mline(d,[(38,92),(36,116)],7); mline(d,[(56,92),(58,116)],7)          # stick legs
    shape(d,[(24,52),(66,48),(72,96),(20,98)],PAL['yellow'])             # baggy oversize hoodie, boxy
    shape(d,[(58,60),(80,72),(76,80),(56,72)],PAL['yellow'])             # arm reaching forward
    mtext(d,(30,66),'#1',16)                                             # hoodie print
    shape(d,[(34,6),(64,10),(68,48),(30,46)],PAL['paper'])               # tall crooked box head
    shape(d,[(66,26),(74,30),(66,34)],PAL['paper'])                      # nose wedge
    shape(d,[(30,4),(66,6),(70,16),(56,12),(40,16),(28,12)],PAL['ink'],j=1)  # flat-top hair
    dot(d,56,24,4); mline(d,[(54,38),(64,37)],3)                          # dot eye + flat mouth
    return im

# ---------- 2a. Crypto Grumblet: grumpy rock, RENTED tag, HODL, like & subscribe sticker ----------
def grumblet(w=215,h=180):
    im,d=canvas(w,h)
    shape(d,blob(80,110,72,58,j=0.12,n=14,rot=0.3),PAL['gray'],j=2.5)    # lumpy boulder
    shape(d,[(28,86),(56,70),(60,78),(32,94)],PAL['silver'],w=0)         # chalky highlight
    mline(d,[(44,96),(70,104)],6); mline(d,[(96,104),(122,94)],6)        # angry brows
    dot(d,60,112,5); dot(d,104,112,5)
    mline(d,[(64,140),(80,134),(98,140)],5)                               # frown
    mline(d,[(30,124),(40,140),(34,150)],3)                               # crack
    shape(d,[(106,118),(200,108),(206,168),(112,176)],PAL['yellow'],w=5,j=1)  # slapped-on sticker: thumbs-up + SUB!
    shape(d,[(118,140),(128,140),(132,124),(140,122),(140,136),(152,136),(150,164),(118,164)],PAL['pink'],w=4,j=1)
    mtext(d,(178,142),'SUB!',26,PAL['ink'],'mm')
    mline(d,[(118,66),(132,30)],3)                                        # tag string
    shape(d,[(100,8),(170,4),(176,30),(106,36)],PAL['red'])              # RENTED tag
    mtext(d,(138,20),'RENTED',16,PAL['paper'],'mm')
    mtext(d,(70,74),'HODL',14,PAL['ink'])                              # scratched into the rock
    return im

# ---------- 2b. Hypewick: a candle that sets itself on fire for every new trend ----------
def hypewick(w=180,h=200,side=False):
    im,d=canvas(w,h)
    shape(d,blob(90,186,62,10,j=0.15),PAL['pink'],w=4)                    # melted wax puddle
    shape(d,[(58,70),(84,64),(124,72),(120,184),(62,186)],PAL['pink'])    # crooked wax pillar
    for x,l in ((64,40),(96,26),(112,56)):                                # drips
        shape(d,[(x,70),(x+12,70),(x+10,70+l),(x+6,76+l),(x+2,70+l)],PAL['pink'],w=4)
    shape(d,[(62,64),(86,58),(124,66),(118,76),(64,78)],'#ff8fbf',w=0)    # lit top-left lip
    mline(d,[(90,64),(92,40)],5)                                          # wick
    shape(d,[(92,2),(120,30),(112,58),(72,58),(64,30),(80,22),(84,36)],PAL['orange'])   # big flame
    shape(d,[(92,24),(104,40),(98,54),(84,54),(82,40)],PAL['yellow'],w=3)
    for x,y in ((40,20),(146,28),(30,60)): shape(d,[(x,y),(x+8,y-12),(x+12,y+2)],PAL['yellow'],w=3)  # sparks
    if side:  # profile facing right: one bulging eye near the front edge, grin wedge breaking the edge
        d.ellipse((98,94,120,116),fill=PAL['paper'],outline=INK,width=4); dot(d,114,104,4)
        shape(d,[(92,128),(128,124),(126,150),(98,148)],PAL['ink'],w=3)
        for x in range(100,124,7): d.rectangle((x,127,x+4,132),fill=PAL['paper'])
    else:
        # crazed face: mismatched eyes, huge toothy grin
        d.ellipse((66,96,86,116),fill=PAL['paper'],outline=INK,width=4); dot(d,79,104,4)
        d.ellipse((96,92,112,108),fill=PAL['paper'],outline=INK,width=4); dot(d,101,101,3)
        shape(d,[(66,128),(116,124),(110,150),(74,152)],PAL['ink'],w=3)
        for x in range(72,112,8): d.rectangle((x,127,x+5,133),fill=PAL['paper'])
    shape(d,[(150,150),(172,128),(178,150)],PAL['lime'],w=3); mtext(d,(128,166),'NEW!',18)
    return im

# ---------- 3. trading card 180x252, tiers ----------
TIERS=('plain','gem','legendary')
def card(tier):
    rim,inner=(PAL['gold'],'#ffe27a') if tier=='legendary' else (PAL['card_dk'],PAL['card'])
    im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],rim,w=5,j=1.5)
    if tier=='legendary':  # strong foil: bright diagonal bands + glints + darker bevel
        for i in range(-40,260,36): d.line((i-60,252,i,0),fill='#fffbe6',width=8); d.line((i-48,252,i+12,0),fill='#b8860b',width=3)
        for x,y in ((20,18),(160,60),(26,240),(168,232),(90,8)):
            d.line((x-7,y,x+7,y),fill='#ffffff',width=3); d.line((x,y-7,x,y+7),fill='#ffffff',width=3)
    shape(d,[(14,40),(166,42),(164,150),(16,148)],inner,w=4,j=1)
    art=grumblet().resize((150,125)); im.alpha_composite(art,(16,44))
    shape(d,[(12,12),(140,10),(142,36),(14,38)],PAL['paper'],w=4,j=1)
    mtext(d,(18,17),'CRYPTO GRUMBLET',12)
    if tier!='plain':
        gem=PAL['pink'] if tier=='legendary' else PAL['blue']
        shape(d,[(158,6),(174,22),(158,40),(142,22)],gem,w=4,j=1); mtext(d,(158,23),'3',18,PAL['paper'],'mm')
    shape(d,[(14,158),(166,160),(164,236),(16,234)],PAL['paper'],w=4,j=1)
    for i,l in enumerate(['STONE · Middle Mgmt','Files a complaint','about your complaint.','Twice.']):
        mtext(d,(22,162+i*17),l,12,PAL['red'] if i==0 else INK)
    return im
def holo(w=120,h=168,amp=45):
    """Transparent diagonal rainbow sheen; alpha-composite over any card."""
    im=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(im)
    cols=[(255,62,138),(255,212,0),(143,224,58),(47,107,255),(180,90,255)]
    for i in range(-h,w+h,6):
        c=cols[(i//6)%len(cols)]; a=int(amp*max(0,1-abs((i-w/2)/(w*0.9))))
        d.line((i,h,i+h,0),fill=c+(a,),width=6)
    return im.filter(ImageFilter.GaussianBlur(2))

# ---------- 4. battle lineup mock (side view) ----------
def ricky():
    """Ring Light Ricky: tall skinny, ring-light halo, mid 'hey guys', shouting 'Smash that like!'. Faces right (flip for enemies)."""
    im,d=canvas(150,190)
    d.ellipse((4,0,128,116),outline=INK,width=24); d.ellipse((4,0,128,116),outline=PAL['paper'],width=16); d.ellipse((10,6,122,110),outline=PAL['yellow'],width=4)   # ring light halo
    mline(d,[(64,80),(64,110)],4)                                         # ring stand into his back
    mline(d,[(56,150),(52,184)],6); mline(d,[(72,150),(78,184)],6)        # stick legs
    shape(d,[(44,180),(60,180),(60,188),(40,188)],PAL['lime'],w=3); shape(d,[(72,180),(90,180),(92,188),(72,188)],PAL['lime'],w=3)
    shape(d,[(46,96),(84,92),(88,154),(42,156)],PAL['lime'])              # puffer vest
    for y in (110,126,142): mline(d,[(46,y),(86,y-2)],3)
    shape(d,[(80,104),(104,92),(110,100),(86,114)],PAL['lime'])           # pointing arm
    shape(d,[(40,18),(92,22),(88,92),(44,90)],PAL['paper'])              # long flat slab head
    shape(d,[(36,18),(48,0),(58,14),(68,-2),(78,14),(92,4),(94,24),(38,26)],PAL['pink'],j=1)  # frosted spikes
    dot(d,78,40,4)
    shape(d,[(62,56),(96,52),(92,84),(66,82)],PAL['ink'],w=3)             # huge open mouth
    shape(d,[(70,72),(88,70),(86,80),(72,80)],PAL['pink'],w=0)            # tongue
    return im
def unboxer():
    """Unboxing Kid: short wide pear body, backwards cap, half-ripped card pack, sponsor patch. Faces right."""
    im,d=canvas(150,190)
    mline(d,[(52,164),(50,184)],8); mline(d,[(80,164),(84,184)],8)
    shape(d,[(38,180),(60,180),(60,188),(34,188)],PAL['ink'],w=2); shape(d,[(76,180),(98,180),(100,188),(76,188)],PAL['ink'],w=2)
    shape(d,[(40,88),(92,84),(112,168),(24,170)],PAL['orange'])           # wide pear hoodie
    shape(d,[(50,126),(80,124),(82,146),(52,148)],PAL['paper'],w=3)       # sponsor patch
    mtext(d,(66,130),'SPON',10,PAL['red'],'mt'); mtext(d,(66,140),'SORED',8,INK,'mt')
    shape(d,[(98,96),(132,90),(136,138),(102,142)],PAL['blue'])           # card pack held out front
    shape(d,[(98,96),(110,84),(118,98),(126,80),(132,90)],PAL['silver'],w=3)  # ripped foil top
    shape(d,[(106,82),(124,78),(126,96),(108,98)],PAL['paper'],w=2)       # card peeking out
    mtext(d,(117,118),'PACK',12,PAL['yellow'],'mm')
    shape(d,[(86,110),(102,104),(104,116),(88,122)],PAL['orange'])        # hand/arm
    shape(d,[(46,30),(90,26),(94,88),(42,90)],PAL['paper'])              # squat box head, wider low
    shape(d,[(38,30),(92,24),(92,36),(40,40)],PAL['red'],j=1)             # backwards cap
    shape(d,[(30,32),(44,30),(42,40),(28,40)],PAL['red'],w=3)             # brim at back
    dot(d,78,48,4)
    shape(d,[(64,62),(96,58),(94,88),(68,86)],PAL['ink'],w=3)             # 'hey guys' mouth
    shape(d,[(72,76),(88,74),(86,84),(74,84)],PAL['pink'],w=0)
    return im
def grunt(flip=True,tint=PAL['gray']):
    im,d=canvas(110,170)
    mline(d,[(40,130),(38,164)],7); mline(d,[(66,130),(70,164)],7)
    shape(d,[(26,160),(46,160),(46,168),(22,168)],INK,w=2); shape(d,[(64,160),(86,160),(88,168),(64,168)],INK,w=2)
    shape(d,[(24,62),(84,58),(88,134),(20,136)],tint)                     # boxy suit, wider than tall head
    shape(d,[(50,64),(58,64),(60,100),(54,108),(48,100)],PAL['blue'],w=3) # tie
    shape(d,[(34,10),(76,14),(72,58),(38,56)],'#e6e0cf')                  # beige monitor-ish head
    shape(d,[(40,18),(70,20),(68,44),(42,42)],PAL['lime'],w=3)            # screen face
    dot(d,50,30,3); dot(d,62,30,3); mline(d,[(50,38),(62,38)],2)
    shape(d,[(84,90),(102,88),(100,110),(86,112)],PAL['paper'],w=3); mtext(d,(87,92),'KPI',9)  # mug
    mline(d,[(30,64),(40,90),(48,92)],2,col=PAL['red']); shape(d,[(40,88),(52,88),(52,100),(40,100)],PAL['paper'],w=2)  # lanyard badge
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im
def hpbar(d,x,y,w,frac,label):
    shape(d,[(x,y),(x+w,y-2),(x+w+2,y+16),(x-1,y+18)],PAL['paper'],w=3,j=1)
    d.rectangle((x+4,y+4,x+4+int((w-8)*frac),y+12),fill=PAL['lime'] if frac>0.4 else PAL['red'])
    mtext(d,(x,y-22),label,16)
def fit(im,size=96):
    """Fit a drawing into a size x size transparent square, bottom-centered (feet on the floor)."""
    im=im.crop(im.getbbox()); k=min(size/im.width,size/im.height)
    im=im.resize((max(1,round(im.width*k)),max(1,round(im.height*k))),Image.LANCZOS)
    out=Image.new('RGBA',(size,size),(0,0,0,0)); out.alpha_composite(im,((size-im.width)//2,size-im.height)); return out
FIGHTERS={'player':player,'grumblet':grumblet,'hypewick':hypewick,'hypewick_side':lambda:hypewick(side=True),'ricky':lambda:ricky().transpose(Image.FLIP_LEFT_RIGHT),'unboxer':lambda:unboxer().transpose(Image.FLIP_LEFT_RIGHT),'grunt':lambda:grunt(flip=True),'grunt_silver':lambda:grunt(flip=True,tint=PAL['silver'])}
def fighter(name,frame=0,size=96):
    RB.seed(99); R.seed(1000+frame*17+len(name))  # same shapes, different outline wobble per boil frame
    return fit(FIGHTERS[name](),size)

def battle(frame=0):
    W,H=720,528; im=cardboard(W,H,seed=3); d=ImageDraw.Draw(im)
    R.seed(50+frame)
    mline(d,[(0,380),(240,376),(480,382),(720,377)],5)                    # floor
    shape(d,[(440,24),(700,28),(698,76),(442,72)],PAL['paper'],w=3,j=1); mtext(d,(452,34),'TRENDING NOW',24)
    im.alpha_composite(fighter('player',frame),(60,284)); im.alpha_composite(fighter('hypewick_side',frame),(180,284))
    im.alpha_composite(fighter('ricky',frame),(470,284)); im.alpha_composite(fighter('unboxer',frame),(590,284))
    shape(d,[(410,170),(580,164),(582,200),(500,202),(486,218),(484,202),(412,204)],PAL['paper'],w=3,j=1); mtext(d,(496,184),'SMASH THAT LIKE!',14,PAL['pink'],'mm')
    hpbar(d,50,240,110,0.8,'YOU'); hpbar(d,176,240,110,0.55,'HYPEWICK')
    hpbar(d,462,240,100,0.9,'RICKY'); hpbar(d,582,240,100,0.3,'UNBOXER')
    cx,cy=360,330
    for r,c,w in ((54,PAL['pink'],8),(34,PAL['yellow'],6)):
        p=blob(cx,cy,r,r,j=0.04,n=36); d.line(p+[p[0]],fill=c,width=w)
    p=blob(cx,cy,58,58,j=0.04,n=36); d.line(p+[p[0]],fill=INK,width=3)
    shape(d,[(290,404),(430,400),(428,432),(292,436)],PAL['yellow'],w=4)
    mtext(d,(360,418),'PRESS NOW!',24,INK,'mm')
    shape(d,[(20,450),(700,446),(698,516),(22,514)],PAL['paper'],w=4,j=1)  # command box
    for i,(t,a) in enumerate([('LIKE','Attack'),('RATIO','Special'),('SNACK','Item'),('GO LIVE','Run')]):
        x=36+i*168
        if i==0: shape(d,[(x-8,456),(x+150,454),(x+152,508),(x-6,510)],PAL['yellow'],w=4,j=1); mtext(d,(x-24,464),'>',30)
        mtext(d,(x,460),t,22,[PAL['red'],PAL['blue'],INK,PAL['pink']][i]); mtext(d,(x,488),'= '+a,14,INK)
    return im

IN_USE={'grumblet_96_f0.png','hypewick_96_f0.png','player_96_f0.png'}   # referenced by src/ -> stay in root
LEGACY_PREFIX=('grunt_','grunt_silver_','grumblet_','hypewick_96_','hypewick_48_')
def out(name):
    if name in IN_USE: return f'{HERE}/{name}'
    if name.startswith(LEGACY_PREFIX) or name in ('player_96x128.png','grumblet_card_creature.png','hypewick_card_creature.png','style2_test_sheet.png'):
        os.makedirs(f'{HERE}/legacy',exist_ok=True); return f'{HERE}/legacy/{name}'
    return f'{HERE}/{name}'
def main():
    for n in ['player','grumblet','hypewick','hypewick_side','ricky','unboxer','grunt','grunt_silver']:   # 96x96 + 48x48, 3 boil frames, transparent
        for f in range(3):
            fighter(n,f).save(out(f'{n}_96_f{f}.png')); fighter(n,f,48).save(out(f'{n}_48_f{f}.png'))
    RB.seed(99); R.seed(1); P=player(); P.save(out('player_96x128.png'))   # concept-size originals for the sheet
    RB.seed(99); R.seed(2); G=grumblet(); G.save(out('grumblet_card_creature.png'))
    RB.seed(99); R.seed(3); Hy=hypewick(); Hy.save(out('hypewick_card_creature.png'))
    cards={}
    for t in TIERS:
        RB.seed(99); R.seed(4); cards[t]=card(t).resize((120,168),Image.LANCZOS); cards[t].save(f'{HERE}/card_frame_{t}_120x168.png')
    HO=holo(); HO.save(f'{HERE}/card_holo_overlay_120x168.png')
    B=battle(); B.save(f'{HERE}/battle_mock_720x528.png')
    S=cardboard(1280,930,seed=9); d=ImageDraw.Draw(S)
    mtext(d,(30,14),'STYLE 2 TEST — "marker on cardboard"',40)
    mtext(d,(30,70),'player',18); S.alpha_composite(P,(40,100))
    mtext(d,(170,70),'card creatures',18); S.alpha_composite(G,(160,100)); S.alpha_composite(Hy,(370,90))
    mtext(d,(150,286),'CRYPTO GRUMBLET',20); mtext(d,(400,292),'HYPEWICK',22)
    for i,t in enumerate(TIERS): S.alpha_composite(cards[t].resize((150,210)),(560+i*170,90)); mtext(d,(560+i*170,304),t,18)
    hc=cards['gem'].copy(); hc.alpha_composite(HO); S.alpha_composite(hc.resize((150,210)),(1070,90)); mtext(d,(1070,304),'gem + holo',18)
    mtext(d,(30,350),'battle mock 720x528 (shown at 2/3)',18); S.alpha_composite(B.resize((480,352),Image.LANCZOS),(30,380))
    mtext(d,(540,390),'96x96 fighters: boil frames f0 f1 f2',18)
    for r,n in enumerate(['player','grumblet']):
        for f in range(3): S.alpha_composite(fighter(n,f),(540+f*100,420+r*100))
    for f in range(3): S.alpha_composite(fighter('hypewick_side',f),(860+f*100,320+100))
    mtext(d,(860,396),'hypewick (profile)',16)
    for f in range(3): S.alpha_composite(fighter('hypewick',f),(860+f*100,520))
    for f in range(3): S.alpha_composite(fighter('ricky',f),(540+f*100,650)); S.alpha_composite(fighter('unboxer',f),(860+f*100,650))
    mtext(d,(540,624),'Ring Light Ricky',16); mtext(d,(860,624),'Unboxing Kid',16)
    mtext(d,(860,240+300),'',1)
    for i,l in enumerate(['wobbly marker outline #1a1423','flat cut-out fills','dot eyes, crooked boxes','side-view battles','loud palette on cardboard']):
        mtext(d,(30+ (i%3)*400,870+(i//3)*22),'- '+l,14)
    for i,(k,v) in enumerate(PAL.items()):
        x=40+(i%13)*94; y=770+20
        shape(d,[(x,y),(x+40,y-1),(x+41,y+30),(x+1,y+31)],v,w=3,j=1); mtext(d,(x,y+36),k+' '+v,10)
    S.convert('RGB').save(out('style2_test_sheet.png'))

# =====================================================================
# FULL ASSET SET (approved style2). build_full() writes into subfolders.
# =====================================================================
TILE=48   # src/map.js renders 16px tiles at 3x = 48px on screen; style2 tiles are authored at 48x48 native
RARITY={'C':('Common',PAL['gray']),'U':('Uncommon',PAL['green']),'R':('Rare',PAL['blue']),'E':('Epic',PAL['purple']),'L':('Legendary',PAL['gold'])}

def influencorn():
    """Uncommon: lanky unicorn filming itself on a selfie stick held by its horn. Faces right."""
    im,d=canvas(200,200)
    for x0,x1 in ((50,46),(66,70),(118,114),(134,140)): mline(d,[(x0,140),(x1,188)],7)
    shape(d,[(40,96),(146,90),(150,142),(36,146)],PAL['paper'])           # boxy body
    shape(d,[(20,100),(40,96),(36,130),(14,124)],PAL['lime'],w=4)         # tail
    shape(d,[(124,96),(146,94),(150,40),(130,40)],PAL['paper'])           # long neck
    shape(d,[(120,20),(176,18),(180,52),(124,56)],PAL['paper'])           # box head
    shape(d,[(120,20),(134,40),(126,60),(112,44)],PAL['lime'],w=4)        # mane
    shape(d,[(146,20),(156,-2),(162,20)],PAL['yellow'],w=4)               # horn
    mline(d,[(156,4),(196,4)],4)                                          # selfie stick off the horn
    shape(d,[(180,4),(198,2),(198,34),(180,36)],PAL['ink'],w=3)           # phone facing it
    dot(d,189,10,3,PAL['red'])                                            # REC dot
    dot(d,164,32,4); shape(d,[(160,42),(178,40),(176,48),(162,48)],PAL['pink'],w=3)   # dot eye + duckface
    mtext(d,(44,100),'#AD',30,PAL['pink'])
    return im
def doomslug():
    """Rare: long slug glued to a glowing phone, trail of hot takes behind it. Faces right."""
    im,d=canvas(220,150)
    for x,t in ((8,'ACTUALLY'),(60,'TAKE'),(98,'!!')):                    # hot-take trail
        shape(d,[(x,118),(x+len(t)*9+8,116),(x+len(t)*9+10,136),(x,138)],PAL['orange'],w=3,j=1); mtext(d,(x+5,119),t,12,PAL['paper'])
    shape(d,[(40,110),(80,84),(150,80),(190,96),(196,126),(36,130)],PAL['lime'])  # slug body, low and long
    shape(d,[(60,100),(110,90),(108,96),(62,106)],'#c4f58c',w=0)
    mline(d,[(150,84),(160,40)],5); mline(d,[(170,88),(186,46)],5)        # eye stalks bent to the phone
    dot(d,160,38,7,PAL['paper']); dot(d,161,39,3); dot(d,186,44,7,PAL['paper']); dot(d,187,45,3)
    shape(d,[(150,56),(176,52),(180,100),(154,104)],PAL['ink'],w=4)       # phone glued in front
    shape(d,[(155,60),(174,57),(176,96),(158,98)],PAL['blue'],w=0)
    for y in (66,76,86): d.line((160,y,172,y-1),fill=PAL['paper'],width=2)
    for x in (152,178): mline(d,[(x,100),(x,112)],4,col=PAL['paper'])     # glue drips
    mline(d,[(146,112),(162,110)],3)                                      # mouth
    return im
def goose():
    """Epic: shirtless gym-bro goose, sweatband, tiny shorts, protein shaker. Faces right."""
    im,d=canvas(180,220)
    mline(d,[(70,170),(66,210)],6,col=PAL['orange']); mline(d,[(96,170),(102,210)],6,col=PAL['orange'])
    shape(d,[(52,206),(72,206),(74,214),(46,214)],PAL['orange'],w=3); shape(d,[(96,206),(116,206),(120,214),(94,214)],PAL['orange'],w=3)
    shape(d,[(40,100),(128,92),(136,160),(46,168)],PAL['paper'])          # wide chest (V-taper box)
    shape(d,[(52,150),(124,146),(126,176),(56,178)],PAL['blue'],w=4)      # tiny shorts
    mline(d,[(60,116),(84,124),(108,114)],4); mline(d,[(86,124),(86,148)],3)   # pec + ab lines
    shape(d,[(26,104),(48,100),(44,140),(20,136)],PAL['paper'],w=4)       # wing flexing
    shape(d,[(100,96),(118,94),(124,28),(108,28)],PAL['paper'])           # long neck
    shape(d,[(96,8),(136,6),(140,40),(100,42)],PAL['paper'])              # head
    shape(d,[(94,14),(140,12),(140,20),(94,22)],PAL['red'],w=3)           # sweatband
    shape(d,[(136,24),(166,28),(138,38)],PAL['orange'],w=4)               # beak
    dot(d,124,26,4)
    shape(d,[(136,110),(158,108),(160,150),(138,152)],PAL['blue'])        # shaker
    shape(d,[(134,100),(160,98),(160,110),(136,112)],PAL['ink'],w=3); mtext(d,(147,128),'P',22,PAL['paper'],'mm')
    shape(d,[(124,120),(140,116),(140,130),(126,132)],PAL['paper'],w=4)   # wing on shaker
    return im
CREATURES={'hypewick':(lambda:hypewick(side=True),'C','EMBER','On fire for','every trend.'),
           'influencorn':(influencorn,'U','GALE','Films itself','filming itself.'),
           'crypto_grumblet':(grumblet,'R','STONE','Rented rock.','Still HODLs.'),
           'doomscroll_slug':(doomslug,'R','NEUTRAL','Glued to feed.','Hot takes.'),
           'gym_bro_goose':(goose,'E','GALE','Never skips','leg day.')}
for k,v in CREATURES.items(): FIGHTERS[k]=v[0]

def card_full(key,holo_on=False):
    fn,r,typ,l1,l2=CREATURES[key]; rname,rim=RARITY[r]
    RB.seed(99); R.seed(4)
    im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],rim,w=5,j=1.5)
    if r=='L':
        for i in range(-40,260,36): d.line((i-60,252,i,0),fill='#fffbe6',width=8)
    shape(d,[(14,40),(166,42),(164,150),(16,148)],PAL['card'],w=4,j=1)
    art=fn(); art=art.crop(art.getbbox()); k=min(140/art.width,100/art.height)
    art=art.resize((int(art.width*k),int(art.height*k)),Image.LANCZOS); im.alpha_composite(art,(90-art.width//2,146-art.height))
    if holo_on: im.alpha_composite(holo(144,104,85),(18,44))
    name=key.replace('_',' ').upper()
    shape(d,[(12,12),(140,10),(142,36),(14,38)],PAL['paper'],w=4,j=1)
    mtext(d,(77,24),name,15 if len(name)<12 else 11,INK,'mm')
    shape(d,[(158,6),(174,22),(158,40),(142,22)],rim,w=4,j=1); mtext(d,(158,23),r,18,PAL['paper'] if r!='L' else INK,'mm')
    shape(d,[(14,158),(166,160),(164,236),(16,234)],PAL['paper'],w=4,j=1)
    mtext(d,(22,163),f'{typ} · {rname}'+(' · HOLO' if holo_on else ''),14,PAL['red'])
    mtext(d,(22,184),l1,17); mtext(d,(22,208),l2,17)
    return im.resize((120,168),Image.LANCZOS)
def frame_rarity(r):
    rname,rim=RARITY[r]; RB.seed(99); R.seed(5); im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],rim,w=5,j=1.5)
    if r=='L':
        for i in range(-40,260,36): d.line((i-60,252,i,0),fill='#fffbe6',width=8)
    d.rectangle((14,40,166,150),fill=(0,0,0,0)); shape(d,[(12,12),(140,10),(142,36),(14,38)],PAL['paper'],w=4,j=1)
    shape(d,[(158,6),(174,22),(158,40),(142,22)],rim,w=4,j=1); shape(d,[(14,158),(166,160),(164,236),(16,234)],PAL['paper'],w=4,j=1)
    # cut out the art window so the engine can draw art under/over
    m=Image.new('L',im.size,255); ImageDraw.Draw(m).rectangle((16,42,164,148),fill=0); im.putalpha(Image.composite(im.split()[3],m,m))
    d=ImageDraw.Draw(im); d.rectangle((14,40,166,150),outline=INK,width=4)
    return punch(im.resize((120,168),Image.LANCZOS))

# ---------- overworld walkers (48x48 cells, 3 frames x 4 dirs) ----------
def walker(direction,frame,cfg,S=TILE):
    """cfg: colors + geometry. head=(x0,x1,y0,y1), torso=4-6 pts, legs=(top,bottom), on a 48 grid.
    Frames: 0 step, 1 together (2px bob), 2 other step. cfg['behind'] draws before the body, cfg['extra'] after."""
    k=S/48; im=Image.new('RGBA',(int(96*k),int(96*k)),(0,0,0,0)); d=ImageDraw.Draw(im)
    def P(pts): return [(x*2*k,y*2*k) for x,y in pts]
    b=1 if frame==1 else 0; st={0:-1,1:0,2:1}[frame]; side=direction in('left','right'); f=1 if direction=='right' else -1
    hx0,hx1,hy0,hy1=cfg.get('head',(15,33,3,21)); lt,lb=cfg.get('legs',(34,45))
    if side: hx0,hx1=hx0+1,hx1-1
    if cfg.get('behind'): cfg['behind'](d,P,direction,b,f)
    lx=cfg.get('leg_x',(19,29))
    for x0,x1 in ([(lx[0],lx[0]+3*st),(lx[1],lx[1]-3*st)] if not side else [(24-3*f,24-3*f-8*st*f),(24+2*f,24+2*f+8*st*f)]):
        mline(d,P([(x0,lt),(x1,lb)]),int(7*k),j=1)
    torso=cfg.get('torso',[(14,20),(34,19),(36,37),(12,38)])
    if side and cfg.get('torso_side'): torso=cfg['torso_side'] if f>0 else [(48-x,y) for x,y in cfg['torso_side']]
    shape(d,P([(x,y+b) for x,y in torso]),cfg['body'],w=int(5*k),j=1)
    if cfg.get('extra'): cfg['extra'](d,P,direction,b,f)
    face=cfg['skin'] if direction!='up' else cfg['hair']
    shape(d,P([(hx0,hy0+b),(hx1,hy0+1+b),(hx1+1,hy1+b),(hx0-1,hy1-1+b)]),face,w=int(5*k),j=1)
    hs=cfg.get('hair_style','flat'); hy=hy0
    if hs=='flat': shape(d,P([(hx0-1,hy-1+b),(hx1+1,hy+b),(hx1+1,hy+5+b),(hx0-1,hy+5+b)]),cfg['hair'],w=int(4*k),j=1)
    elif hs=='bob': shape(d,P([(hx0-4,hy-1+b),(hx1+4,hy-1+b),(hx1+4,hy1-2+b),(hx1-1,hy+6+b),(hx0+1,hy+6+b),(hx0-4,hy1-2+b)]),cfg['hair'],w=int(4*k),j=1)
    elif hs=='spikes': shape(d,P([(hx0-1,hy+5+b),(hx0,hy-3+b),(hx0+5,hy+2+b),(24,hy-4+b),(hx1-5,hy+2+b),(hx1,hy-3+b),(hx1+1,hy+5+b)]),cfg['hair'],w=int(4*k),j=0.6)
    elif hs=='cap':
        shape(d,P([(hx0-1,hy-2+b),(hx1+1,hy-1+b),(hx1+1,hy+4+b),(hx0-1,hy+4+b)]),cfg['hair'],w=int(4*k),j=1)
        if cfg.get('brim') and direction!='up':
            if side: bx=hx1 if f>0 else hx0; shape(d,P([(bx,hy+2+b),(bx+7*f,hy+3+b),(bx,hy+5+b)]),cfg['hair'],w=int(3*k),j=0.5)
            else: shape(d,P([(hx0+2,hy+3+b),(hx1-2,hy+3+b),(hx1,hy+6+b),(hx0,hy+6+b)]),cfg['hair'],w=int(3*k),j=0.5)
    ey=(hy0+hy1)/2+1
    cx=(hx0+hx1)/2
    if direction=='down': dot(d,(cx-4)*2*k,ey*2*k+2*b*k,3*k); dot(d,(cx+4)*2*k,ey*2*k+2*b*k,3*k)
    elif side: dot(d,(cx+6*f)*2*k,ey*2*k+2*b*k,3*k)
    if cfg.get('beard') and direction!='up': shape(d,P([(hx0,hy1-6+b),(hx1,hy1-6+b),(hx1-2,hy1+1+b),(hx0+2,hy1+1+b)]),cfg['beard'],w=int(3*k),j=1)
    return im.resize((S,S),Image.LANCZOS)
def walk_sheet(cfg):
    sh=Image.new('RGBA',(TILE*3,TILE*4),(0,0,0,0))
    for r,dr in enumerate(['down','up','left','right']):
        for c in range(3): RB.seed(99); R.seed(200+c); sh.alpha_composite(walker(dr,c,cfg),(c*TILE,r*TILE))
    return sh
def hoodie_print(d,P,dr,b,f):
    if dr=='down': shape(d,P([(20,24+b),(28,24+b),(28,30+b),(20,30+b)]),PAL['paper'],w=3,j=0.5)
def mom_extra(d,P,dr,b,f):
    if dr=='down': shape(d,P([(30,26+b),(38,25+b),(38,33+b),(30,33+b)]),PAL['paper'],w=3,j=0.5)   # mug
PLAYER_CFG={'body':PAL['yellow'],'skin':PAL['paper'],'hair':PAL['ink'],'hair_style':'flat','extra':hoodie_print,
  'head':(17,31,1,19),'torso':[(13,19),(35,18),(37,37),(11,38)],'legs':(36,47)}   # tall narrow head, baggy hoodie, long legs
MOM_CFG={'body':PAL['pink'],'skin':'#e9c9a0','hair':PAL['orange'],'hair_style':'bob','extra':mom_extra,
  'head':(17,31,4,19),'torso':[(18,19),(30,19),(39,42),(9,42)],'legs':(41,47),'leg_x':(20,28)}   # big bob, A-line cardigan, short legs
DAD_CFG={'body':PAL['lime'],'skin':'#e9c9a0','hair':PAL['blue'],'hair_style':'cap','beard':PAL['card_dk'],'brim':True,
  'head':(18,30,8,23),'torso':[(14,22),(34,22),(42,32),(36,42),(12,42),(6,32)],'legs':(40,47),'leg_x':(17,31)}   # small head, round belly, wide stance

def bust(cfg,shed=False):
    RB.seed(99); R.seed(7); im,d=canvas(96,96)
    if shed:  # Dad peeking out of the shed door
        shape(d,[(2,10),(94,6),(94,94),(2,94)],PAL['card_dk'],w=5,j=1)
        for x in (24,48,72): mline(d,[(x,12),(x,92)],3)
        shape(d,[(40,18),(92,16),(92,94),(40,94)],PAL['ink'],w=4,j=1)    # dark doorway
    x0=44 if shed else 20
    shape(d,[(x0-4,70),(x0+60,66),(x0+64,96),(x0-8,96)],cfg['body'])
    shape(d,[(x0+4,16),(x0+50,18),(x0+52,72),(x0+2,70)],cfg['skin'])
    hs=cfg.get('hair_style')
    if hs=='bob': shape(d,[(x0-4,10),(x0+58,12),(x0+60,52),(x0+48,26),(x0+6,26),(x0-6,52)],cfg['hair'])
    elif hs=='cap': shape(d,[(x0+2,10),(x0+52,12),(x0+54,26),(x0+2,26)],cfg['hair']); shape(d,[(x0+46,22),(x0+66,24),(x0+52,30)],cfg['hair'],w=4)
    dot(d,x0+18,40,4); dot(d,x0+36,40,4)
    if cfg.get('beard'): shape(d,[(x0+4,52),(x0+50,52),(x0+42,74),(x0+12,74)],cfg['beard']); mline(d,[(x0+18,58),(x0+36,56)],3)
    else: mline(d,[(x0+18,58),(x0+34,60)],3)
    if shed: shape(d,[(4,22),(36,20),(38,48),(6,50)],PAL['paper'],w=3,j=1); mtext(d,(8,26),"IT'LL",10); mtext(d,(8,36),'BE $$!',10)
    return im

# ---------- tiles 48x48 ----------
def tile_base(col):
    im=Image.new('RGBA',(TILE,TILE),col); return im,ImageDraw.Draw(im)
def t_grass():
    im,d=tile_base('#6cc04a'); r=random.Random(11)
    for _ in range(9): x,y=r.randrange(4,44),r.randrange(6,44); d.line((x,y,x-2,y-6),fill=PAL['green'],width=2); d.line((x,y,x+3,y-5),fill=PAL['green'],width=2)
    return im
def t_tall():
    im=t_grass(); d=ImageDraw.Draw(im)
    for x in range(2,48,10):
        shape(d,[(x,46),(x+3,10),(x+6,24),(x+9,6),(x+10,46)],PAL['green'],w=3,j=0.8)
    return im
def t_path():
    im,d=tile_base('#d9b77a'); r=random.Random(12)
    for _ in range(10): x,y=r.randrange(48),r.randrange(48); d.ellipse((x,y,x+4,y+3),fill=PAL['card_dk'])
    return im
def t_wall():
    im,d=tile_base(PAL['paper'])
    for y in (15,31,47): d.line((0,y,48,y),fill=PAL['card'],width=2)
    shape(d,[(12,16),(36,16),(36,34),(12,34)],PAL['blue'],w=4,j=1); mline(d,[(24,16),(24,34)],2)  # window
    return im
def t_roof():
    im,d=tile_base(PAL['red'])
    for y in range(6,48,10): mline(d,[(0,y),(48,y)],3,j=1)
    for x in range(0,48,12): d.line((x,0,x+6,48),fill='#c42520',width=2)
    return im
def t_shed():
    im,d=tile_base((0,0,0,0)); shape(d,[(2,14),(46,12),(46,47),(2,47)],PAL['card_dk'],w=4,j=1)
    shape(d,[(0,16),(24,1),(48,14)],PAL['gray'],w=4,j=1); shape(d,[(16,26),(32,26),(32,47),(16,47)],PAL['ink'],w=3,j=1)
    return im
def t_fence():
    im,d=tile_base((0,0,0,0))
    for x in (4,20,36): shape(d,[(x,10),(x+8,8),(x+8,44),(x,44)],PAL['paper'],w=3,j=0.8)
    mline(d,[(0,20),(48,19)],4); mline(d,[(0,34),(48,33)],4)
    return im
def t_sparkle():
    im,d=tile_base((0,0,0,0))
    shape(d,[(24,4),(29,19),(44,24),(29,29),(24,44),(19,29),(4,24),(19,19)],PAL['yellow'],w=3,j=0.6)
    for x,y in ((8,8),(40,10),(38,40)): d.line((x-3,y,x+3,y),fill=PAL['paper'],width=2); d.line((x,y-3,x,y+3),fill=PAL['paper'],width=2)
    return im
def t_shopdoor():
    im=t_wall(); d=ImageDraw.Draw(im); d.rectangle((0,0,48,48),fill=PAL['paper'])
    shape(d,[(10,8),(38,8),(38,47),(10,47)],PAL['purple'],w=4,j=1); dot(d,33,30,3,PAL['yellow'])
    shape(d,[(4,0),(44,0),(44,8),(4,8)],PAL['yellow'],w=3,j=0.5); shape(d,[(18,1),(26,1),(26,7),(18,7)],PAL['pink'],w=2,j=0.3); shape(d,[(24,2),(32,1),(32,7),(24,8)],PAL['blue'],w=2,j=0.3)
    return im
TILES=[('grass',t_grass),('path',t_path),('tall_grass',t_tall),('house_wall',t_wall),('house_roof',t_roof),('shed',t_shed),('fence',t_fence),('card_sparkle',t_sparkle),('shop_door',t_shopdoor)]

# ---------- UI ----------
def pack(tier):
    RB.seed(99); R.seed(8); im,d=canvas(96,128)
    col,acc,label={'basic':(PAL['card'],PAL['lime'],'BASIC'),'premium':(PAL['blue'],PAL['silver'],'PREMIUM'),'elite':(PAL['purple'],PAL['gold'],'ELITE')}[tier]
    shape(d,[(8,14),(88,12),(90,118),(6,120)],col)
    for y in (14,118): shape(d,[(6,y-8),(90,y-10),(90,y+2),(6,y+4)],PAL['silver'],w=3,j=0.6)   # crimped foil ends
    for x in range(10,90,8): d.line((x,4,x+4,10),fill=INK,width=2); d.line((x,120,x+4,126),fill=INK,width=2)
    shape(d,[(16,34),(80,30),(82,74),(18,78)],acc,w=4,j=1); mtext(d,(49,54),'5',30,INK,'mm')
    mtext(d,(48,92),label,15 if tier!='premium' else 12,PAL['paper'] if tier!='basic' else INK,'mm')
    if tier=='elite':
        for x,y in ((20,24),(78,86)): d.line((x-5,y,x+5,y),fill=PAL['paper'],width=3); d.line((x,y-5,x,y+5),fill=PAL['paper'],width=3)
    return im
def card_back():
    RB.seed(99); R.seed(9); im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],PAL['card_dk'],w=5,j=1.5)
    shape(d,[(18,18),(162,20),(160,232),(20,230)],PAL['pink'],w=4,j=1)
    shape(d,blob(90,126,52,52,j=0.05),PAL['yellow'],w=5)
    mtext(d,(90,112),'TOUCH',20,INK,'mm'); mtext(d,(90,140),'GRASS',20,INK,'mm')
    return im.resize((120,168),Image.LANCZOS)
def coin():
    RB.seed(99); R.seed(10); im,d=canvas(64,64)
    shape(d,blob(32,32,28,28,j=0.04),PAL['gold'],w=5); shape(d,blob(32,32,18,18,j=0.05),PAL['yellow'],w=3); mtext(d,(32,32),'C',22,INK,'mm')
    return im.resize((32,32),Image.LANCZOS)
def nine(fill,rim,mark=None,S=48):
    RB.seed(99); R.seed(12); im,d=canvas(S,S)
    d.rounded_rectangle((2,2,S-3,S-3),8,fill=fill,outline=INK,width=5); d.rounded_rectangle((7,7,S-8,S-8),5,outline=rim,width=3)
    if mark: mark(d)
    return im
def shop_frame():
    RB.seed(99); R.seed(13); im,d=canvas(360,240)
    shape(d,[(4,30),(356,26),(354,236),(6,234)],PAL['paper'],w=5,j=1.5)
    shape(d,[(40,4),(320,2),(326,46),(34,48)],PAL['purple'],w=5,j=1); mtext(d,(180,25),'PACK SHACK',26,PAL['yellow'],'mm')
    for x in range(20,340,40): shape(d,[(x,48),(x+40,48),(x+20,64)],PAL['pink'] if (x//40)%2 else PAL['yellow'],w=3,j=0.6)  # awning
    mtext(d,(180,222),'prices may go up while you look',12,PAL['card_dk'],'mm')
    return im
def binder_page():
    im=cardboard(720,528,seed=21); d=ImageDraw.Draw(im); RB.seed(99); R.seed(14)
    shape(d,[(20,16),(700,12),(702,516),(18,514)],'#2a2a3a',w=6,j=1.5)
    for x in (40,): 
        for y in range(60,500,90): d.ellipse((x-10,y-10,x+10,y+10),fill=PAL['card'],outline=INK,width=3)  # ring holes
    for r in range(2):
        for c in range(4):
            x=90+c*150; y=50+r*230; shape(d,[(x,y),(x+130,y-2),(x+132,y+184),(x+2,y+186)],'#ffffff30',w=3,j=1)
    return im

ART_WIN=(11,28,99,70)   # x,y,w,h of the transparent art window inside every 120x168 frame
def punch(im):
    x,y,w,h=ART_WIN; a=im.split()[3]; ImageDraw.Draw(a).rectangle((x,y,x+w-1,y+h-1),fill=0); im.putalpha(a); return im
def frame_empty(kind):
    rim={'plain':PAL['card_dk'],'gem':PAL['card_dk'],'legendary':PAL['gold']}[kind]
    RB.seed(99); R.seed(5); im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],rim,w=5,j=1.5)
    if kind=='legendary':
        for i in range(-40,260,36): d.line((i-60,252,i,0),fill='#fffbe6',width=8); d.line((i-48,252,i+12,0),fill='#b8860b',width=3)
    shape(d,[(12,12),(140,10),(142,36),(14,38)],PAL['paper'],w=4,j=1)
    if kind!='plain': shape(d,[(158,6),(174,22),(158,40),(142,22)],PAL['pink'] if kind=='legendary' else PAL['blue'],w=4,j=1)
    shape(d,[(14,158),(166,160),(164,236),(16,234)],PAL['paper'],w=4,j=1)
    d.rectangle((14,40,166,150),outline=INK,width=4)
    return punch(im.resize((120,168),Image.LANCZOS))
def art_cutout(key):
    RB.seed(99); R.seed(4); a=CREATURES[key][0](); a=a.crop(a.getbbox())
    x,y,w,h=ART_WIN; k=min((w-4)/a.width,(h-4)/a.height); a=a.resize((max(1,int(a.width*k)),max(1,int(a.height*k))),Image.LANCZOS)
    out=Image.new('RGBA',(w,h),(0,0,0,0)); out.alpha_composite(a,((w-a.width)//2,h-2-a.height)); return out

# ---------- overworld replacements for v0.2.1 pieces ----------
def ricky_extra(d,P,dr,b,f):
    pts=P([(5,-1+b),(43,-1+b),(43,26+b),(5,26+b)]); x0,y0=pts[0]; x1,y1=pts[2]
    d.ellipse((x0,y0,x1,y1),outline=INK,width=14); d.ellipse((x0+3,y0+3,x1-3,y1-3),outline=PAL['yellow'],width=8)   # ring-light halo
def unboxer_extra(d,P,dr,b,f):
    if dr=='down': shape(d,P([(30,22+b),(40,21+b),(40,33+b),(30,34+b)]),PAL['blue'],w=3,j=0.5)          # card pack
    elif dr in('left','right'): x=24+12*f; shape(d,P([(x-5,22+b),(x+5,21+b),(x+5,33+b),(x-5,34+b)]),PAL['blue'],w=3,j=0.5)
    if dr=='down': shape(d,P([(16,27+b),(24,27+b),(24,32+b),(16,32+b)]),PAL['paper'],w=2,j=0.4)          # sponsor patch
RICKY_CFG={'body':PAL['lime'],'skin':PAL['paper'],'hair':PAL['pink'],'hair_style':'spikes','behind':ricky_extra}
UNBOX_CFG={'body':PAL['orange'],'skin':PAL['paper'],'hair':PAL['red'],'hair_style':'cap','extra':unboxer_extra}
def walker_mouth(sheet):
    """Big open 'hey guys' mouths on down/side frames (drawn on the 48px sheet)."""
    d=ImageDraw.Draw(sheet)
    for c in range(3):
        for r,dx in ((0,0),(2,-5),(3,5)):
            x=c*48+24+dx; y=r*48+15+(1 if c==1 else 0); d.rectangle((x-3,y,x+3,y+4),fill=INK); d.point((x,y+3),fill=PAL['pink'])
    return sheet
def t_sign():
    im,d=tile_base((0,0,0,0))
    mline(d,[(24,30),(24,47)],5)
    shape(d,[(1,4),(46,1),(47,31),(3,34)],PAL['card'],w=4,j=0.8)                                  # crooked cardboard
    for i,(t,c) in enumerate((('GO VIRAL',PAL['pink']),('OR GO',INK),('HOME',PAL['red']))): mtext(d,(24,10+i*9),t,9,c,'mm')
    return im
def t_water():
    im,d=tile_base(PAL['blue'])
    for y in (10,26,40): mline(d,[(4,y),(14,y-3),(24,y),(34,y-3),(44,y)],3,j=0.6,col='#9fc4ff')
    return im
def t_tree():
    im=t_grass(); d=ImageDraw.Draw(im)
    shape(d,[(20,30),(28,30),(29,47),(19,47)],PAL['card_dk'],w=3,j=0.6)
    shape(d,[(4,30),(10,8),(24,1),(40,8),(44,30),(24,36)],PAL['green'],w=4,j=1); shape(d,[(12,12),(22,6),(18,16)],PAL['lime'],w=0,j=0.5)
    return im
def dialog_terms():
    im=nine(PAL['paper'],PAL['pink']); d=ImageDraw.Draw(im)
    for a in range(3): t=math.radians(a*60); d.line((38-5*math.cos(t),38-5*math.sin(t),38+5*math.cos(t),38+5*math.sin(t)),fill=PAL['gray'],width=2)
    return im
def build_overworld_replacements():
    os.makedirs(f'{HERE}/overworld',exist_ok=True); os.makedirs(f'{HERE}/tiles',exist_ok=True)
    walker_mouth(walk_sheet(RICKY_CFG)).save(f'{HERE}/overworld/ricky_walk_48.png')
    walker_mouth(walk_sheet(UNBOX_CFG)).save(f'{HERE}/overworld/unboxer_walk_48.png')
    RB.seed(99); R.seed(41); t_sign().save(f'{HERE}/tiles/sign_48.png')
    RB.seed(99); R.seed(42); t_water().save(f'{HERE}/tiles/water_48.png')
    RB.seed(99); R.seed(43); t_tree().save(f'{HERE}/tiles/tree_48.png')
    # drop-in for the old 6-cell tileset.png (same cell order: grass, tall_grass, path, water, tree, wall)
    order=[t_grass,t_tall,t_path,t_water,t_tree,t_wall]; strip=Image.new('RGBA',(48*6,48),(0,0,0,0))
    for i,fn in enumerate(order): RB.seed(99); R.seed(30+i); strip.alpha_composite(fn(),(i*48,0))
    strip.save(f'{HERE}/tiles/tileset_compat_48.png')
    dialog_terms().save(f'{HERE}/ui/dialog_terms_9slice_48.png')
    for k in CREATURES: fighter(k,0,48).save(f'{HERE}/overworld/{k}_map_48.png')   # roaming/visible-group markers

# ---------- shopkeeper (Pack Shack owner: sweaty reseller, green visor, price gun) ----------
SHOP_CFG={'body':PAL['purple'],'skin':'#e9c9a0','hair':PAL['green'],'hair_style':'cap'}
def shopkeeper_bust():
    RB.seed(99); R.seed(15); im,d=canvas(96,96)
    shape(d,[(10,68),(86,64),(92,96),(4,96)],PAL['purple'])                         # apron
    mtext(d,(48,80),'$$$',16,PAL['yellow'],'mm')
    shape(d,[(22,20),(74,22),(76,72),(20,70)],'#e9c9a0')                             # wide jowly box head
    shape(d,[(16,16),(80,18),(84,30),(14,30)],PAL['green'])                          # visor
    shape(d,[(40,30),(94,28),(80,36),(40,36)],PAL['green'],w=3)                       # visor bill
    dot(d,38,44,4); dot(d,58,44,4); mline(d,[(34,58),(46,62),(62,56)],3)            # smug grin
    for x,y in ((24,40),(70,38)): d.ellipse((x,y,x+5,y+8),fill=PAL['blue'])          # sweat drops
    shape(d,[(66,72),(90,70),(92,82),(70,84)],PAL['orange'],w=3); mtext(d,(80,77),'x3',10,INK,'mm')   # price gun
    return im
def shop_counter():
    RB.seed(99); R.seed(16); im,d=canvas(96,80)
    k=walker('down',1,dict(SHOP_CFG,head=(15,33,3,20)),48); im.alpha_composite(k,(4,0))  # keeper behind counter
    shape(d,[(2,34),(94,32),(94,78),(2,78)],PAL['purple'])                           # counter front
    shape(d,[(0,28),(96,26),(96,36),(0,38)],PAL['card'],w=4)                         # countertop
    for i,c in enumerate((PAL['lime'],PAL['blue'],PAL['gold'])): shape(d,[(52+i*14,12),(62+i*14,12),(62+i*14,28),(52+i*14,28)],c,w=3,j=0.5)  # packs on top
    shape(d,[(28,46),(68,44),(70,66),(30,68)],PAL['yellow'],w=3); mtext(d,(49,56),'NO HAGGLE',9,INK,'mm')
    return im
# ---------- transition + roof-edge tiles (appended to tileset_48 after the first 9) ----------
def t_path_edge(side):
    """Path tile with grass on one side ('n','s','e','w') or an outer corner ('ne','nw','se','sw')."""
    im=t_path(); g=t_grass(); m=Image.new('L',(48,48),0); md=ImageDraw.Draw(m); r=random.Random(hash(side)%999)
    def wl(a,b,n=6): return [(a[0]+(b[0]-a[0])*i/n+r.uniform(-2,2),a[1]+(b[1]-a[1])*i/n+r.uniform(-2,2)) for i in range(n+1)]
    pts={'n':[(0,0),(48,0)]+wl((48,14),(0,14)),'s':wl((0,34),(48,34))+[(48,48),(0,48)],'w':[(0,0)]+wl((14,0),(14,48))+[(0,48)],'e':wl((34,0),(34,48))+[(48,48),(48,0)],
         'nw':[(0,0)]+wl((18,0),(0,18)),'ne':[(48,0)]+wl((48,18),(30,0)),'sw':[(0,48)]+wl((0,30),(18,48)),'se':[(48,48)]+wl((30,48),(48,30))}[side]
    md.polygon(pts,fill=255); im.paste(g,(0,0),m)
    d=ImageDraw.Draw(im); edge=pts[2:] if side in('n',) else pts
    return im
def t_roof_edge(kind):
    im=t_roof(); d=ImageDraw.Draw(im); a=im.split()[3]; ad=ImageDraw.Draw(a)
    if kind=='left': ad.polygon([(0,0),(20,0),(0,48)],fill=0); mline(d,[(20,0),(0,48)],5)
    elif kind=='right': ad.polygon([(48,0),(28,0),(48,48)],fill=0); mline(d,[(28,0),(48,48)],5)
    elif kind=='eave': ad.rectangle((0,40,48,48),fill=0); d.rectangle((0,30,48,40),fill='#a81e1a'); mline(d,[(0,40),(48,40)],5)
    elif kind=='ridge': ad.rectangle((0,0,48,8),fill=0); mline(d,[(0,9),(48,9)],5)
    im.putalpha(a); return im
EXTRA_TILES=[('path_edge_n',lambda:t_path_edge('n')),('path_edge_s',lambda:t_path_edge('s')),('path_edge_e',lambda:t_path_edge('e')),('path_edge_w',lambda:t_path_edge('w')),
  ('path_corner_nw',lambda:t_path_edge('nw')),('path_corner_ne',lambda:t_path_edge('ne')),('path_corner_sw',lambda:t_path_edge('sw')),('path_corner_se',lambda:t_path_edge('se')),
  ('roof_edge_left',lambda:t_roof_edge('left')),('roof_edge_right',lambda:t_roof_edge('right')),('roof_eave',lambda:t_roof_edge('eave')),('roof_ridge',lambda:t_roof_edge('ridge'))]

def build_full():
    for sub in ('fighters','cards','npc','overworld','tiles','ui'): os.makedirs(f'{HERE}/{sub}',exist_ok=True)
    for k in CREATURES:
        for f in range(3): fighter(k,f).save(f'{HERE}/fighters/{k}_96_f{f}.png'); fighter(k,f,48).save(f'{HERE}/fighters/{k}_48_f{f}.png')
    cards={k:card_full(k) for k in CREATURES}; cards['crypto_grumblet_holo']=card_full('crypto_grumblet',True)
    for k,c in cards.items(): c.save(f'{HERE}/cards/card_{k}_120x168.png')
    for r in RARITY: frame_rarity(r).save(f'{HERE}/cards/frame_{RARITY[r][0].lower()}_120x168.png')
    for kd in ('plain','gem','legendary'): frame_empty(kd).save(f'{HERE}/card_frame_{kd}_empty_120x168.png')
    os.makedirs(f'{HERE}/cards/art',exist_ok=True)
    for k in CREATURES: art_cutout(k).save(f'{HERE}/cards/art/{k}_art_{ART_WIN[2]}x{ART_WIN[3]}.png')
    card_back().save(f'{HERE}/cards/card_back_120x168.png'); holo().save(f'{HERE}/cards/holo_overlay_120x168.png')
    sheets={'player':walk_sheet(PLAYER_CFG),'mom':walk_sheet(MOM_CFG),'dad':walk_sheet(DAD_CFG)}
    for k,v in sheets.items(): v.save(f'{HERE}/overworld/{k}_walk_48.png')
    busts={'mom':bust(MOM_CFG),'dad_shed':bust(DAD_CFG,True)}
    busts['shopkeeper']=shopkeeper_bust()
    for k,v in busts.items(): v.save(f'{HERE}/npc/{k}_bust_96.png')
    shop_counter().save(f'{HERE}/overworld/shop_counter_96x80.png')
    strip=Image.new('RGBA',(TILE*len(TILES+EXTRA_TILES),TILE),(0,0,0,0)); timgs={}
    for i,(n,fn) in enumerate(TILES+EXTRA_TILES): RB.seed(99); R.seed(30+i); t=fn(); timgs[n]=t; t.save(f'{HERE}/tiles/{n}_48.png'); strip.alpha_composite(t,(i*TILE,0))
    strip.save(f'{HERE}/tiles/tileset_48.png')
    packs={t:pack(t) for t in ('basic','premium','elite')}
    for t,p in packs.items(): p.save(f'{HERE}/ui/pack_{t}_96x128.png')
    coin().save(f'{HERE}/ui/coin_32.png')
    dlg=nine(PAL['paper'],PAL['pink']); dlg.save(f'{HERE}/ui/dialog_9slice_48.png')
    shop_frame().save(f'{HERE}/ui/shop_frame_360x240.png'); binder_page().save(f'{HERE}/ui/binder_page_720x528.png')
    # contact sheet
    S=cardboard(1600,1240,seed=33); d=ImageDraw.Draw(S); mtext(d,(24,10),'STYLE 2 — FULL ASSET SET',36)
    mtext(d,(24,64),'fighters 96 (f0) + 48',16)
    for i,k in enumerate(CREATURES):
        S.alpha_composite(fighter(k,0),(24+i*150,90)); S.alpha_composite(fighter(k,0,48),(124+i*150,138)); mtext(d,(24+i*150,190),k.replace('_',' '),12)
    for i,k in enumerate(['player','ricky','unboxer']): S.alpha_composite(fighter(k,0),(780+i*110,90))
    mtext(d,(780,190),'player / ricky / unboxer',12)
    mtext(d,(24,220),'cards',16)
    for i,(k,c) in enumerate(cards.items()): S.alpha_composite(c,(24+i*130,244))
    for i,r in enumerate(RARITY): S.alpha_composite(frame_rarity(r),(820+i*130,244))
    for i,kd in enumerate(('plain','gem','legendary')):
        e=frame_empty(kd); e.alpha_composite(art_cutout(list(CREATURES)[i*2]).resize((99,70)),(11,28)) if False else None
        S.alpha_composite(frame_empty(kd),(1250+i*115,450)); mtext(d,(1250+i*115,622),kd+' empty',12)
    for i,k in enumerate(CREATURES): S.alpha_composite(art_cutout(k).resize((66,47)),(1250+i*70,650))
    S.alpha_composite(card_back(),(24,430)); 
    for i,p in enumerate(packs.values()): S.alpha_composite(p,(160+i*110,450))
    S.alpha_composite(coin(),(500,450)); S.alpha_composite(dlg.resize((96,96),Image.NEAREST),(500,500))
    S.alpha_composite(shop_frame(),(620,430))
    S.alpha_composite(binder_page().resize((240,176)),(1000,440))
    mtext(d,(24,700),'overworld walk sheets 48 (cols f0-f2, rows down/up/left/right) + busts',16)
    for i,(k,v) in enumerate(sheets.items()): S.alpha_composite(v,(24+i*170,730))
    for i,v in enumerate(busts.values()): S.alpha_composite(v.resize((144,144)),(560+i*160,730))
    S.alpha_composite(shop_counter(),(1060,780)); S.alpha_composite(walker_mouth(walk_sheet(RICKY_CFG)),(1180,730)); S.alpha_composite(walker_mouth(walk_sheet(UNBOX_CFG)),(1340,730))
    mtext(d,(24,940),'tileset_48 strip (21 cells, frame = index)',16); S.alpha_composite(strip.resize((strip.width*3//2,72)),(24,966))
    S.alpha_composite(t_sign(),(24,1060)); S.alpha_composite(Image.open(f'{HERE}/tiles/tileset_compat_48.png'),(90,1060)); mtext(d,(90,1112),'sign_48 + tileset_compat_48 (unchanged)',12)
    S.alpha_composite(battle().resize((540,396)),(1000,730)) if False else None
    S.convert('RGB').save(f'{HERE}/full_assets_preview.png')
    battle().save(f'{HERE}/battle_mock_720x528.png')

if __name__=='__main__':
    main()
    build_overworld_replacements()
    build_full()
