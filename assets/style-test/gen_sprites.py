#!/usr/bin/env python3
"""Style-test sprite generator. Run: python3 gen_sprites.py  (outputs to ./sprites/)"""
from PIL import Image, ImageDraw
import os
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,'sprites')
P={'out':'#1a1423','dgreen':'#2d5a27','green':'#4f9a3a','lgreen':'#8fd16a','dbrown':'#5c3a21','brown':'#9a6b3f','sand':'#d9b77a','dblue':'#23477a','blue':'#3f7fd1','lblue':'#9fd8f0','dgray':'#4a4a5a','gray':'#8a8a9a','white':'#f4f0e6','red':'#c8402c','orange':'#f08a2c','yellow':'#f7d354'}
C={k:'#'+v[1:] for k,v in P.items()}
O=C['out']

class Pen:
    """Draw on a 64-unit design grid, scaled to target size; outline stays 1px."""
    def __init__(s,size): s.im=Image.new('RGBA',(size,size),(0,0,0,0)); s.d=ImageDraw.Draw(s.im); s.k=size/64
    def _b(s,b): return [round(v*s.k) for v in b]
    def ell(s,b,f,o=O): s.d.ellipse(s._b(b),fill=C[f] if f in C else f,outline=o)
    def rect(s,b,f,o=O,r=0): s.d.rounded_rectangle(s._b(b),max(0,round(r*s.k)),fill=C[f],outline=o)
    def poly(s,pts,f,o=O): s.d.polygon([(round(x*s.k),round(y*s.k)) for x,y in pts],fill=C[f],outline=o)
    def px(s,x,y,f,w=2):
        x,y=round(x*s.k),round(y*s.k); n=max(1,round(w*s.k)); s.d.rectangle((x,y,x+n-1,y+n-1),fill=C[f])
    def eyes(s,xs,y,big=4):
        for x in xs: s.rect((x,y,x+big,y+big+1),'out',None); s.px(x+1,y+1,'white',1.5)

def emberkit(p):  # Ember: boxy lantern-cat with a candle-wick flame between ears
    p.rect((14,58,22,63),'dbrown'); p.rect((40,58,48,63),'dbrown')
    p.poly([(48,44),(60,36),(58,46)],'red')                   # stubby wedge tail
    p.poly([(14,22),(16,6),(26,18)],'red'); p.poly([(50,22),(48,6),(38,18)],'red')  # ears
    p.rect((10,16,54,60),'red',r=10)                          # boxy body
    p.rect((14,20,30,28),'orange',None,r=3)                   # top-left highlight
    p.rect((20,40,44,56),'yellow',r=5)                        # lantern-glow chest window
    p.rect((24,44,40,52),'orange',None,r=3)
    p.poly([(32,2),(37,12),(32,18),(27,12)],'yellow'); p.poly([(32,8),(34,13),(30,13)],'orange',None)
    p.eyes((20,40),28); p.poly([(30,35),(34,35),(32,37)],'out')

def puddlop(p):  # Tide: flat puddle-dome with long floppy lop ears dragging to ground
    p.ell((6,34,58,62),'blue')
    p.ell((12,22,52,56),'blue')
    p.ell((16,26,30,36),'lblue',None)
    p.poly([(14,30),(2,40),(4,58),(10,56),(18,38)],'dblue')   # lop ears
    p.poly([(50,30),(62,40),(60,58),(54,56),(46,38)],'dblue')
    p.px(28,16,'lblue',4); p.ell((26,10,34,18),'lblue')        # floating droplet
    p.eyes((22,36),36,big=5); p.d.line(p._b((28,48,36,48)),fill=O)

def sproutle(p):  # Bloom: radish-bulb body, twin leaf "antlers", root-toe feet
    for x in (18,30,42): p.poly([(x,54),(x+4,54),(x+2,63)],'brown')
    p.ell((10,18,54,58),'lgreen'); p.ell((15,23,24,31),'white',None)
    p.ell((14,40,50,58),'green',None)
    p.poly([(28,20),(14,2),(6,10),(24,22)],'green'); p.poly([(36,20),(50,2),(58,10),(40,22)],'green')
    p.d.line(p._b((26,20,14,6)),fill=C['dgreen']); p.d.line(p._b((38,20,50,6)),fill=C['dgreen'])
    p.eyes((22,38),32); p.px(18,42,'red',3); p.px(43,42,'red',3)

def grumblet(p):  # Stone: lopsided boulder, heavy brow ledge, two short legs, no arms, moss cap
    p.rect((16,54,26,63),'dgray'); p.rect((38,54,48,63),'dgray')
    p.poly([(8,40),(14,16),(34,8),(56,18),(58,46),(46,58),(16,58)],'gray')
    p.poly([(16,18),(34,11),(30,20),(18,24)],'white',None)
    p.poly([(26,10),(44,10),(54,16),(36,16)],'green')          # moss cap
    p.rect((14,28,52,33),'dgray',r=1)                         # brow ledge
    p.eyes((22,40),34); p.d.line(p._b((26,48,38,46)),fill=O)
    p.d.line(p._b((46,36,50,44,46,50)),fill=C['dgray'])        # crack

# ---- approved starters ----
def kitewisp(p):  # Gale: living kite with ribbon tail
    p.poly([(32,40),(30,50),(36,54),(30,58),(34,63)],'white')         # ribbon tail
    p.poly([(32,4),(58,26),(32,44),(6,26)],'lblue')                   # kite diamond
    p.poly([(32,4),(6,26),(32,26)],'white',None)                      # lit top-left facet
    p.d.line(p._b((32,6,32,42)),fill=C['blue']); p.d.line(p._b((8,26,56,26)),fill=C['blue'])
    p.eyes((24,36),20); p.px(30,30,'blue',2)

def kitewisp_late(p):  # twin kite wings, long split tail
    p.poly([(32,36),(22,52),(26,63)],'white'); p.poly([(32,36),(42,52),(38,63)],'white')
    p.poly([(4,8),(30,22),(24,40)],'lblue'); p.poly([(60,8),(34,22),(40,40)],'lblue')
    p.poly([(32,10),(44,26),(32,42),(20,26)],'blue')
    p.eyes((26,36),22,big=3)

def brazzle(p):  # Ember: brazier beetle, domed iron shell with coal vents
    for x in (12,22,38,48): p.rect((x,52,x+4,62),'dgray')
    p.ell((6,22,58,58),'dgray')
    p.ell((12,26,30,36),'gray',None)
    for x in (18,30,42): p.rect((x,30,x+5,36),'orange'); p.px(x+1,31,'yellow',3)
    p.poly([(28,24),(32,4),(36,24)],'orange'); p.poly([(31,22),(32,12),(33,22)],'yellow',None)
    p.rect((16,44,48,54),'red',r=3); p.eyes((22,44),42,big=3)

def brazzle_late(p):  # tall beetle with flame wing-cases open
    p.poly([(10,20),(2,50),(20,40)],'orange'); p.poly([(54,20),(62,50),(44,40)],'orange')
    p.ell((14,14,50,62),'dgray'); p.poly([(22,16),(26,0),(32,14),(38,0),(42,16)],'yellow')
    p.eyes((24,36),32,big=3)

def lofton(p):  # Stone: tiny floating sky-island creature
    p.ell((26,58,38,62),'dgray',None)                                 # hover shadow
    p.poly([(6,22),(58,22),(44,40),(36,52),(26,48),(16,38)],'brown')  # inverted rock cone
    p.poly([(10,24),(30,24),(22,34)],'sand',None)
    p.d.line(p._b((26,48,24,56)),fill=C['dbrown']); p.d.line(p._b((40,44,44,54)),fill=C['dbrown'])
    p.ell((4,14,60,28),'green'); p.ell((10,15,30,21),'lgreen',None)  # grassy top
    p.rect((28,4,32,16),'dbrown'); p.ell((22,0,38,10),'dgreen')       # sapling
    p.eyes((22,38),28)

def lofton_late(p):  # big island with tree and orbiting pebbles
    p.poly([(2,26),(62,26),(40,56),(24,56)],'brown')
    p.ell((0,20,64,32),'green'); p.rect((28,4,34,24),'dbrown'); p.ell((14,0,50,14),'dgreen')
    for x,y in ((4,44),(54,46),(46,60)): p.ell((x,y,x+6,y+5),'gray')
    p.eyes((24,38),34,big=3)

def kitewisp_back(p):
    p.poly([(32,40),(30,50),(36,54),(30,58),(34,63)],'white')
    p.poly([(32,4),(58,26),(32,44),(6,26)],'blue')
    p.poly([(32,4),(6,26),(32,26)],'lblue',None)
    p.rect((30,6,34,42),'dbrown',None); p.rect((8,24,56,28),'dbrown',None)  # kite spars
    p.px(30,24,'sand',4)
def brazzle_back(p):
    for x in (12,22,38,48): p.rect((x,52,x+4,62),'dgray')
    p.ell((6,22,58,58),'dgray'); p.ell((12,26,30,36),'gray',None)
    p.d.line(p._b((32,24,32,56)),fill=O)                       # shell seam
    for x,y in ((16,36),(40,36),(18,46),(40,46)): p.rect((x,y,x+5,y+5),'orange'); p.px(x+1,y+1,'yellow',3)
    p.poly([(28,24),(32,4),(36,24)],'orange')
def lofton_back(p):
    p.ell((26,58,38,62),'dgray',None)
    p.poly([(6,22),(58,22),(44,40),(36,52),(26,48),(16,38)],'brown')
    p.poly([(10,24),(30,24),(22,34)],'sand',None)
    for a,b_,c,d_ in ((22,40,20,54),(32,48,32,58),(42,40,46,52)): p.d.line(p._b((a,b_,c,d_)),fill=C['dbrown'])
    p.ell((4,14,60,28),'green'); p.ell((10,15,30,21),'lgreen',None)
    p.rect((28,4,32,16),'dbrown'); p.ell((22,0,38,10),'dgreen')

CREATURES={'kitewisp':kitewisp,'brazzle':brazzle,'lofton':lofton,'emberkit':emberkit,'puddlop':puddlop,'sproutle':sproutle,'grumblet':grumblet}

# ---- back views (seen from behind: no faces, same colors/outline) ----
def emberkit_back(p):
    p.rect((14,58,22,63),'dbrown'); p.rect((40,58,48,63),'dbrown')
    p.poly([(14,22),(16,6),(26,18)],'red'); p.poly([(50,22),(48,6),(38,18)],'red')
    p.rect((10,16,54,60),'red',r=10); p.rect((14,20,30,28),'orange',None,r=3)
    p.poly([(32,2),(37,12),(32,18),(27,12)],'yellow')
    p.ell((26,40,38,52),'red'); p.ell((29,43,35,49),'orange',None)   # round curled tail
    p.d.line(p._b((22,30,22,50)),fill=C['dbrown']); p.d.line(p._b((42,30,42,50)),fill=C['dbrown'])
def puddlop_back(p):
    p.ell((6,34,58,62),'blue'); p.ell((12,22,52,56),'blue'); p.ell((16,26,30,36),'lblue',None)
    p.poly([(14,30),(2,40),(4,58),(10,56),(18,38)],'dblue'); p.poly([(50,30),(62,40),(60,58),(54,56),(46,38)],'dblue')
    p.ell((26,10,34,18),'lblue'); p.d.arc(p._b((20,40,44,56)),200,340,fill=C['dblue'])
def sproutle_back(p):
    for x in (18,30,42): p.poly([(x,54),(x+4,54),(x+2,63)],'brown')
    p.ell((10,18,54,58),'lgreen'); p.ell((15,23,24,31),'white',None)
    p.poly([(28,20),(14,2),(6,10),(24,22)],'green'); p.poly([(36,20),(50,2),(58,10),(40,22)],'green')
    p.d.line(p._b((32,22,32,54)),fill=C['green'])  # bulb seam
def grumblet_back(p):
    p.rect((16,54,26,63),'dgray'); p.rect((38,54,48,63),'dgray')
    p.poly([(8,40),(14,16),(34,8),(56,18),(58,46),(46,58),(16,58)],'gray')
    p.poly([(16,18),(34,11),(30,20),(18,24)],'white',None)
    p.poly([(14,22),(30,10),(50,14),(54,30),(36,28)],'green')  # moss spreads down the back
    p.d.line(p._b((20,36,26,46,22,52)),fill=C['dgray'])
BACKS={'kitewisp':kitewisp_back,'brazzle':brazzle_back,'lofton':lofton_back,'emberkit':emberkit_back,'puddlop':puddlop_back,'sproutle':sproutle_back,'grumblet':grumblet_back}

def player_frame(direction,step):
    """Sky-explorer: brown hair, flight goggles on forehead, blue jacket, long yellow scarf.
    step 0 = legs apart, body up; step 1 = legs together, body bobbed down 1px, scarf swayed."""
    im=Image.new('RGBA',(32,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    b=step            # 1px body bob
    sw=2 if step else -1  # scarf sway
    side=direction in('left','right'); f=1 if direction=='right' else -1
    # legs (drawn without bob so feet stay planted)
    if side:
        if step==0:
            d.rectangle((16-3*f-1,24,16-3*f+2,30),fill=C['dbrown'],outline=O)
            d.rectangle((16+3*f-2,24,16+3*f+1,30),fill=C['dbrown'],outline=O)
        else: d.rectangle((14,24,17,30),fill=C['dbrown'],outline=O)
    else:
        if step==0:
            d.rectangle((9,24,13,30),fill=C['dbrown'],outline=O); d.rectangle((18,24,22,30),fill=C['dbrown'],outline=O)
        else:
            d.rectangle((11,24,15,30),fill=C['dbrown'],outline=O); d.rectangle((16,24,20,30),fill=C['dbrown'],outline=O)
    # scarf tail behind (drawn first for down/side so body overlaps)
    if direction=='up':
        pass
    elif side:
        t=1 if step else 0  # subtle flutter: tip kicks back 1px on frame 1
        # thin 2px tail, mostly tucked behind the jacket; only the tip peeks past the back edge
        x0,x1=16-3*f,16-7*f-t*f
        d.line((x0,16+b,x1,23+b),fill=O,width=4)
        d.line((x0,16+b,x1,23+b),fill=C['yellow'],width=2)
        d.point((x1,23+b),fill=C['orange'])
    else:
        d.polygon([(19,16+b),(25,19+b+sw),(26,23+b+sw),(23,22+b+sw),(20,19+b)],fill=C['yellow'],outline=O)
    # body / jacket
    bx=(11,20) if side else (9,22)
    d.rounded_rectangle((bx[0],14+b,bx[1],25+b),3,fill=C['blue'],outline=O)
    d.line((bx[0]+2,16+b,bx[0]+2,23+b),fill=C['lblue'])         # top-left highlight
    # head
    hx=(10,21) if side else (9,22)
    d.ellipse((hx[0],3+b,hx[1],16+b),fill=C['sand'] if direction!='up' else C['dbrown'],outline=O)
    d.chord((hx[0],2+b,hx[1],14+b),180,360,fill=C['dbrown'],outline=O)   # hair
    # goggles band + lenses on forehead
    d.rectangle((hx[0],6+b,hx[1],7+b),fill=C['dgray'])
    if direction=='down':
        for x in (11,17): d.rectangle((x,5+b,x+3,8+b),fill=C['lblue'],outline=O)
        d.point([(13,11+b),(18,11+b)],fill=O)
    elif side:
        x=16+2*f-(0 if f>0 else 3); d.rectangle((x,5+b,x+3,8+b),fill=C['lblue'],outline=O)
        d.point((16+4*f,11+b),fill=O)
    # scarf wrap at neck
    d.rectangle((bx[0]+1,14+b,bx[1]-1,16+b),fill=C['yellow'],outline=O)
    if direction=='up':  # long tail hangs down the back, swaying
        d.polygon([(15,16+b),(18,16+b),(18+sw,26+b),(14+sw,26+b)],fill=C['yellow'],outline=O)
        d.line((16+sw,25+b,17+sw,25+b),fill=C['orange'])
    return im

# ---- Stillwater Holdings grunt (same sheet layout as player) ----
def grunt_frame(direction,step):
    """Gray suit vest over white shirt, clip-on tie, lanyard badge, clipboard. Same walk rules as player."""
    im=Image.new('RGBA',(32,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    b=step; side=direction in('left','right'); f=1 if direction=='right' else -1
    L=C['dgray']
    if side:
        if step==0:
            d.rectangle((16-3*f-1,24,16-3*f+2,30),fill=L,outline=O); d.rectangle((16+3*f-2,24,16+3*f+1,30),fill=L,outline=O)
        else: d.rectangle((14,24,17,30),fill=L,outline=O)
    else:
        if step==0: d.rectangle((9,24,13,30),fill=L,outline=O); d.rectangle((18,24,22,30),fill=L,outline=O)
        else: d.rectangle((11,24,15,30),fill=L,outline=O); d.rectangle((16,24,20,30),fill=L,outline=O)
    bx=(11,20) if side else (9,22); hx=(10,21) if side else (9,22)
    d.rounded_rectangle((bx[0],14+b,bx[1],25+b),2,fill=C['white'],outline=O)          # shirt
    if direction=='up':
        d.rectangle((bx[0]+1,15+b,bx[1]-1,24+b),fill=C['gray'])                         # vest back
        d.line((bx[0]+2,15+b,bx[1]-2,15+b),fill=C['lblue'])                             # lanyard strap
    elif side:
        d.rectangle((bx[0]+1,15+b,bx[1]-1,24+b),fill=C['gray']); d.line((16+2*f,15+b,16+2*f,24+b),fill=C['white'])
        d.line((16+3*f,15+b,16+3*f,20+b),fill=C['dblue'])                               # tie
        cx=16+4*f-(0 if f>0 else 4)
        d.rectangle((cx,17+b,cx+4,23+b),fill=C['brown'],outline=O); d.rectangle((cx+1,18+b,cx+3,22+b),fill=C['white'])  # clipboard in front
    else:
        d.rectangle((bx[0]+1,15+b,14,24+b),fill=C['gray']); d.rectangle((17,15+b,bx[1]-1,24+b),fill=C['gray'])
        d.rectangle((15,15+b,16,20+b),fill=C['dblue']); d.point((15,21+b),fill=C['dblue'])  # clip-on tie
        d.line((12,15+b,13,19+b),fill=C['lblue']); d.rectangle((12,19+b,14,22+b),fill=C['white'],outline=O)  # lanyard+badge
        d.rectangle((20,18+b,25,25+b),fill=C['brown'],outline=O); d.rectangle((21,20+b,24,24+b),fill=C['white']); d.point((22,19+b),fill=C['gray'])  # clipboard
    d.ellipse((hx[0],3+b,hx[1],16+b),fill=C['sand'] if direction!='up' else C['dgray'],outline=O)
    d.chord((hx[0],2+b,hx[1],12+b),180,360,fill=C['dgray'],outline=O)                  # slicked hair
    if direction=='down': d.point([(13,10+b),(18,10+b)],fill=O); d.line((14,13+b,17,13+b),fill=C['brown'])  # flat mouth
    elif side: d.point((16+4*f,10+b),fill=O)
    return im

# ---- tiny 3x5 pixel font ----
FONT={'W':['101','101','101','111','101'],'E':['111','100','110','100','111'],'V':['101','101','101','101','010'],
 'A':['010','101','111','101','101'],'L':['100','100','100','100','111'],'U':['101','101','101','101','111'],
 'Y':['101','101','010','010','010'],'O':['111','101','101','101','111'],'R':['110','101','110','101','101'],
 'S':['011','100','010','001','110'],'T':['111','010','010','010','010'],'&':['010','101','010','101','011'],'C':['011','100','100','100','011'],' ':['000']*5}
def text(d,x,y,s,col):
    for ch in s:
        for r,row in enumerate(FONT[ch]):
            for c,v in enumerate(row):
                if v=='1': d.point((x+c,y+r),fill=col)
        x+=4
def text_w(s): return len(s)*4-1

def sign_16():
    im=Image.new('RGBA',(16,16),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rectangle((7,9,8,15),fill=C['dbrown'],outline=O)
    d.rectangle((1,1,14,10),fill=C['brown'],outline=O); d.line((2,2,13,2),fill=C['sand'])
    d.polygon([(4,8),(7,4),(10,8)],fill=C['sand']); d.point((7,7),fill=C['dbrown'])      # tent icon
    d.point((12,4),fill=C['yellow'])                                                     # star (rest)
    return im
def sign_48():
    im=Image.new('RGBA',(48,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    for x in (8,38): d.rectangle((x,22,x+2,31),fill=C['dbrown'],outline=O)
    d.rectangle((0,0,47,23),fill=C['brown'],outline=O); d.rectangle((2,2,45,21),fill=C['sand']); d.line((2,2,45,2),fill=C['white'])
    for i,line in enumerate(['WE VALUE','YOUR','REST']): text(d,(48-text_w(line))//2,4+i*6,line,O)
    d.point([(44,19),(43,20),(45,20),(44,21)],fill=C['gray'])  # tiny asterisk, naturally
    return im
def dialog(terms=False):
    ui=Image.new('RGBA',(24,24),(0,0,0,0)); d=ImageDraw.Draw(ui)
    d.rounded_rectangle((0,0,23,23),4,fill=C['out']); d.rounded_rectangle((1,1,22,22),3,fill=C['blue'])
    d.rounded_rectangle((3,3,20,20),2,fill=C['white']); d.line((4,4,19,4),fill=C['lblue'])
    if terms: d.point([(18,16),(17,17),(18,17),(19,17),(18,18),(17,15),(19,15),(17,19),(19,19)],fill=C['gray'])  # asterisk in BR corner slice
    return ui

# ---- rivals (shared base: same walk rules as player) ----
def _base(d,direction,step,legs,body,skin='sand',hair='dbrown',shoe=None):
    b=step; side=direction in('left','right'); f=1 if direction=='right' else -1
    L=C[legs]
    if side:
        legs_r=[(16-3*f-1,16-3*f+2),(16+3*f-2,16+3*f+1)] if step==0 else [(14,17)]
    else:
        legs_r=[(9,13),(18,22)] if step==0 else [(11,15),(16,20)]
    for x0,x1 in legs_r:
        x0,x1=min(x0,x1),max(x0,x1); d.rectangle((x0,24,x1,30),fill=L,outline=O)
        if shoe: d.line((x0+1,29,x1-1,29),fill=C[shoe])
    bx=(11,20) if side else (9,22); hx=(10,21) if side else (9,22)
    d.rounded_rectangle((bx[0],14+b,bx[1],25+b),3,fill=C[body],outline=O)
    return b,side,f,bx,hx

def juno_frame(direction,step):
    """Activist: earthy green jacket, messy bun, canvas tote, petition clipboard."""
    im=Image.new('RGBA',(32,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    b,side,f,bx,hx=_base(d,direction,step,'dbrown','green')
    d.line((bx[0]+2,16+b,bx[0]+2,23+b),fill=C['lgreen'])
    if direction=='down':
        d.line((11,15+b,20,21+b),fill=C['sand'])                                       # tote strap
        d.rectangle((19,20+b,24,25+b),fill=C['sand'],outline=O); d.point((21,22+b),fill=C['green'])  # tote w/ leaf print
        d.rectangle((7,17+b,11,23+b),fill=C['brown'],outline=O); d.rectangle((8,18+b,10,22+b),fill=C['white']); d.line((8,19+b,10,19+b),fill=C['gray']); d.line((8,21+b,10,21+b),fill=C['gray'])
    elif direction=='up':
        d.line((20,15+b,11,21+b),fill=C['sand']); d.rectangle((7,20+b,12,25+b),fill=C['sand'],outline=O)
    else:
        tx=16-6*f-(0 if f>0 else 5); d.rectangle((tx,19+b,tx+5,25+b),fill=C['sand'],outline=O)  # tote behind
        cx=16+4*f-(0 if f>0 else 4); d.rectangle((cx,17+b,cx+4,23+b),fill=C['brown'],outline=O); d.rectangle((cx+1,18+b,cx+3,22+b),fill=C['white'])
    d.ellipse((hx[0],3+b,hx[1],16+b),fill=C['sand'] if direction!='up' else C['dbrown'],outline=O)
    d.chord((hx[0],2+b,hx[1],12+b),180,360,fill=C['dbrown'],outline=O)
    bxc=(hx[0]+hx[1])//2-(2*f if side else 0)
    d.ellipse((bxc-3,0+b,bxc+3,5+b),fill=C['dbrown'],outline=O); d.point([(bxc+3,0+b),(bxc-4,2+b)],fill=C['dbrown'])  # messy bun + stray hairs
    if direction=='down': d.point([(13,10+b),(18,10+b)],fill=O); d.line((14,13+b,17,13+b),fill=C['red'])
    elif side: d.point((16+4*f,10+b),fill=O)
    return im

def thorne_frame(direction,step):
    """Hustle guy: navy quarter-zip vest over gray, earpiece, swoopy slick hair, white sneakers, smirk."""
    im=Image.new('RGBA',(32,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    b,side,f,bx,hx=_base(d,direction,step,'gray','gray',shoe='white')
    d.rectangle((bx[0]+2,15+b,bx[1]-2,25+b),fill=C['dblue'])                            # vest (gray sleeves show)
    if direction=='down':
        d.line((15,14+b,15,19+b),fill=C['gray']); d.point((15,19+b),fill=C['white'])   # quarter-zip + pull
        d.rectangle((12,14+b,19,15+b),fill=C['dblue'],outline=O)                         # high collar
    elif side:
        d.rectangle((bx[0]+1,14+b,bx[1]-1,15+b),fill=C['dblue'],outline=O)
    else: d.rectangle((12,14+b,19,15+b),fill=C['dblue'],outline=O)
    d.ellipse((hx[0],3+b,hx[1],16+b),fill=C['sand'] if direction!='up' else C['out'],outline=O)
    d.chord((hx[0],2+b,hx[1],11+b),180,360,fill=C['out'])
    sw=1 if direction!='left' else -1
    d.polygon([(hx[0]+2,4+b),(hx[1]+1*sw,1+b),(hx[1]-1,6+b)],fill=C['out'])             # swoop
    if direction=='down':
        d.point([(13,10+b),(18,10+b)],fill=O); d.line((15,13+b,18,12+b),fill=C['brown'])  # smirk
        d.rectangle((22,10+b,23,12+b),fill=C['gray'],outline=O)                           # earpiece
    elif side:
        d.point((16+4*f,10+b),fill=O); ex=16-3*f; d.rectangle((min(ex,ex+f),11+b,max(ex,ex+f),12+b),fill=C['gray'],outline=None); d.point((ex,12+b),fill=C['dgray']); d.line((ex+f,13+b,ex+3*f,13+b),fill=C['gray'])  # earpiece low on back of ear + stem to mouth
    else: d.point((9,11+b),fill=C['gray'])
    return im

def sheet_of(fn):
    sh=Image.new('RGBA',(64,128),(0,0,0,0))
    for r,dr in enumerate(['down','up','left','right']):
        for c in range(2): sh.paste(fn(dr,c),(c*32,r*32))
    return sh

def main():
    os.makedirs(OUT,exist_ok=True)
    sheet=Image.new('RGBA',(64,128),(0,0,0,0))
    for r,dr in enumerate(['down','up','left','right']):
        for c in range(2): sheet.paste(player_frame(dr,c),(c*32,r*32))
    sheet.save(f'{OUT}/player_32.png')
    gs=Image.new('RGBA',(64,128),(0,0,0,0))
    for r,dr in enumerate(['down','up','left','right']):
        for c in range(2): gs.paste(grunt_frame(dr,c),(c*32,r*32))
    gs.save(f'{OUT}/grunt_32.png')
    js=sheet_of(juno_frame); js.save(f'{OUT}/juno_32.png'); ts=sheet_of(thorne_frame); ts.save(f'{OUT}/thorne_32.png')
    os.makedirs(f'{HERE}/tiles',exist_ok=True); os.makedirs(f'{HERE}/ui',exist_ok=True)
    s16=sign_16(); s16.save(f'{HERE}/tiles/sign_rest_16.png'); s48=sign_48(); s48.save(f'{HERE}/tiles/sign_rest_48x32.png')
    dt=dialog(True); dt.save(f'{HERE}/ui/dialog_terms_9slice_24.png')
    for n,fn in CREATURES.items():
        for size,tag in((64,'battle'),(32,'map')):
            p=Pen(size); fn(p); p.im.save(f'{OUT}/{n}_{tag}_{size}.png')
        p=Pen(64); BACKS[n](p); p.im.save(f'{OUT}/{n}_back_64.png')
    # preview at 3x (in-game scale)
    pv=Image.new('RGBA',(64+8+len(CREATURES)*68,350),C['dgray'])
    pv.alpha_composite(sheet,(4,6))
    for i,n in enumerate(CREATURES):
        x=76+i*68
        pv.alpha_composite(Image.open(f'{OUT}/{n}_battle_64.png'),(x,6))
        pv.alpha_composite(Image.open(f'{OUT}/{n}_map_32.png'),(x+16,76))
        pv.alpha_composite(Image.open(f'{OUT}/{n}_back_64.png'),(x,140))
    pv.alpha_composite(gs,(4,214))
    pv.alpha_composite(js,(200,214)); pv.alpha_composite(ts,(272,214))
    pv.alpha_composite(s16,(80,220)); pv.alpha_composite(s48,(104,214)); pv.alpha_composite(dt,(160,214))
    pv.resize((pv.width*3,pv.height*3),Image.NEAREST).save(f'{OUT}/sprites_preview.png')
if __name__=='__main__': main()
