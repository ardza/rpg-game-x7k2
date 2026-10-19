#!/usr/bin/env python3
"""Style2 add-on: player bust, interior tileset, PACK SHACK + bedroom rooms. Run: python3 gen_style2_rooms.py"""
import json, os
from PIL import Image, ImageDraw
from gen_style2 import PAL, INK, R, RB, HERE, shape, mline, blob, mtext, cardboard, canvas, dot
T=48
def player_bust():
    RB.seed(99); R.seed(7); im,d=canvas(96,96)
    shape(d,[(6,66),(90,62),(94,96),(2,96)],PAL['yellow'])                     # baggy hoodie, wide shoulders
    shape(d,[(30,62),(66,60),(62,74),(34,76)],PAL['card_dk'],w=4)              # hood bunched at neck
    mline(d,[(40,76),(38,92)],3); mline(d,[(56,76),(58,92)],3)                 # drawstrings
    shape(d,[(32,4),(64,6),(66,64),(30,62)],PAL['paper'])                      # tall narrow head
    shape(d,[(28,2),(68,4),(68,16),(28,16)],INK,w=3)                           # flat hair
    dot(d,40,30,4); dot(d,56,30,4); mline(d,[(40,48),(56,50)],3)               # eyes, flat mouth
    mline(d,[(36,22),(46,24)],3); mline(d,[(52,24),(62,22)],3)                 # brows
    return im
# ---- interior tileset: one row, index = column ----
CELLS=['floor_wood','floor_rug','floor_tile','wall','wall_window','wall_poster','door','counter','counter_till',
       'shelf_packs','bed_head','bed_foot','desk','desk_laptop','ring_light','plant','box_pile','mat_exit','shelf_soldout']
def cell(name):
    R.seed(700+CELLS.index(name)); im=Image.new('RGBA',(T,T),(0,0,0,0)); d=ImageDraw.Draw(im)
    floor=lambda c,g: (d.rectangle((0,0,T,T),fill=c), [mline(d,[(0,y),(T,y)],2,0.8,g) for y in (16,32)])
    if name in ('floor_wood','mat_exit'):
        floor('#b07a4a','#8a5a32')
    if name=='floor_rug': floor('#b07a4a','#8a5a32'); shape(d,[(2,2),(46,2),(46,46),(2,46)],PAL['purple'],w=3,j=1); mline(d,[(8,24),(40,24)],3,1,PAL['yellow'])
    if name=='floor_tile':
        d.rectangle((0,0,T,T),fill=PAL['paper']); [mline(d,[(k,0),(k,T)],2,.5,PAL['silver']) or mline(d,[(0,k),(T,k)],2,.5,PAL['silver']) for k in (0,24)]
    if name.startswith('wall'):
        d.rectangle((0,0,T,T),fill='#4a6aa0'); mline(d,[(0,40),(T,40)],4); d.rectangle((0,41,T,T),fill=PAL['card_dk'])
        if name=='wall_window': shape(d,[(8,6),(40,6),(40,34),(8,34)],'#9fd8ff',w=3,j=.8); mline(d,[(24,6),(24,34)],3)
        if name=='wall_poster': shape(d,[(10,4),(38,6),(36,36),(12,34)],PAL['pink'],w=3,j=.8); mtext(d,(24,20),'#1',12,PAL['yellow'],'mm')
    if name=='door': d.rectangle((0,0,T,T),fill='#4a6aa0'); shape(d,[(8,4),(40,4),(40,48),(8,48)],PAL['card_dk'],w=3,j=.8); dot(d,34,28,3,PAL['gold'])
    if name in('counter','counter_till'):
        shape(d,[(0,14),(48,12),(48,46),(0,46)],PAL['orange'],w=4,j=1); mline(d,[(0,22),(48,20)],3)
        if name=='counter_till': shape(d,[(12,2),(36,4),(36,20),(12,20)],PAL['silver'],w=3,j=.8); mtext(d,(24,11),'$',12,PAL['green'],'mm')
    if name=='shelf_packs':
        shape(d,[(2,2),(46,2),(46,46),(2,46)],PAL['card_dk'],w=4,j=.8)
        for row,y in enumerate((6,26)):
            for k,c in enumerate((PAL['lime'],PAL['blue'],PAL['purple'])): shape(d,[(5+k*14,y),(16+k*14,y),(16+k*14,y+16),(5+k*14,y+16)],c,w=2,j=.5)
    if name=='shelf_soldout':
        shape(d,[(2,2),(46,2),(46,46),(2,46)],PAL['card_dk'],w=4,j=.8); mline(d,[(4,24),(44,24)],3)
        shape(d,[(0,12),(48,8),(48,36),(0,40)],PAL['red'],w=3,j=.8); mtext(d,(24,18),'SOLD',13,PAL['paper'],'mm'); mtext(d,(24,31),'OUT',13,PAL['paper'],'mm')
    if name=='bed_head': shape(d,[(2,4),(46,4),(46,48),(2,48)],PAL['blue'],w=4,j=1); shape(d,[(8,8),(40,8),(40,22),(8,22)],PAL['paper'],w=3,j=.8)
    if name=='bed_foot': shape(d,[(2,0),(46,0),(46,42),(2,42)],PAL['blue'],w=4,j=1); mline(d,[(4,10),(44,10)],3)
    if name in('desk','desk_laptop'):
        shape(d,[(0,12),(48,10),(48,30),(0,32)],'#7a4a2a',w=4,j=1); mline(d,[(4,32),(4,46)],4); mline(d,[(44,30),(44,46)],4)
        if name=='desk_laptop': shape(d,[(12,0),(36,0),(38,16),(10,16)],PAL['gray'],w=3,j=.6); dot(d,24,8,3,PAL['pink'])
    if name=='ring_light':
        p=blob(24,14,12,12,j=.03,n=24); d.line(p+[p[0]],fill=PAL['paper'],width=5); d.line(p+[p[0]],fill=INK,width=2)
        mline(d,[(24,26),(24,44)],4); mline(d,[(14,46),(24,40),(34,46)],3)
    if name=='plant': shape(d,[(14,30),(34,30),(32,46),(16,46)],PAL['orange'],w=3,j=.6); shape(d,[(24,4),(38,22),(24,32),(10,22)],PAL['green'],w=3,j=1)
    if name=='box_pile': shape(d,[(4,18),(30,18),(30,46),(4,46)],PAL['card'],w=3,j=.8); shape(d,[(22,6),(44,8),(44,46),(24,46)],PAL['card_dk'],w=3,j=.8)
    if name=='mat_exit': shape(d,[(4,14),(44,14),(44,40),(4,40)],PAL['red'],w=3,j=.8); mtext(d,(24,27),'BYE',12,PAL['paper'],'mm')
    return im
BLOCK={'wall','wall_window','wall_poster','counter','counter_till','shelf_packs','bed_head','bed_foot','desk','desk_laptop','ring_light','plant','box_pile','shelf_soldout'}
def tileset():
    s=Image.new('RGBA',(T*len(CELLS),T)); [s.alpha_composite(cell(n),(i*T,0)) for i,n in enumerate(CELLS)]; return s
# 15x11 maps. codes -> cell names
KEY={'.':'floor_wood','r':'floor_rug','t':'floor_tile','W':'wall','N':'wall_window','P':'wall_poster','D':'door','C':'counter','$':'counter_till',
     'S':'shelf_packs','H':'bed_head','F':'bed_foot','K':'desk','L':'desk_laptop','O':'ring_light','p':'plant','B':'box_pile','E':'mat_exit','X':'shelf_soldout'}
SHOP=["WWWPWWWWWWWPWWW","SSSSStttttSSSXS","ttttttttttttttt","tttCCC$CCCttttt","ttttttttttttttt",
      "SStttttttttttSS","SStttttttttttSS","ttttttttttttttt","Bttttttttttttpt","ttttttttttttttp","WWWWWWWEWWWWWWW"]
BED =["WWWPWNNWWPWWWWW","H......KLO....p","F..............","..............B","....rrrrr......",
      "....rrrrr......","....rrrrr......","...............","p..............","...............","WWWWWWWDWWWWWWW"]
EXITS={'door','mat_exit'}
def collision(rows):
    """1 = blocked. Derived from BLOCK cell list; outer ring (rows 0/10, cols 0/14) solid except exit cells."""
    H,W=len(rows),len(rows[0]); out=[]
    for y,r in enumerate(rows):
        row=[]
        for x,c in enumerate(r):
            n=KEY[c]; edge=x in (0,W-1) or y in (0,H-1)
            row.append(0 if n in EXITS else 1 if (n in BLOCK or edge) else 0)
        out.append(row)
    return out
def room(rows,signs):
    sheet={n:cell(n) for n in CELLS}; im=Image.new('RGBA',(720,528)); d=ImageDraw.Draw(im)
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            n=KEY[ch]; base='floor_tile' if rows is SHOP else 'floor_wood'
            if not n.startswith('wall') and n!='door': im.alpha_composite(sheet[base],(x*T,y*T))
            im.alpha_composite(sheet[n],(x*T,y*T))
    for f in signs: f(d)
    return im,collision(rows)
def sign(x,y,w,h,txt,size,col,fill):
    def f(d): R.seed(x+y); shape(d,[(x,y),(x+w,y+2),(x+w-2,y+h),(x+2,y+h-2)],fill,w=4,j=1); mtext(d,(x+w//2,y+h//2),txt,size,col,'mm')
    return f
SHOP_SIGNS=[sign(240,4,240,40,'PACK SHACK',28,PAL['pink'],PAL['yellow']),
            sign(536,104,170,30,'NO REFUNDS. ONLY VIBES.',12,INK,PAL['paper']),
            sign(14,196,150,30,'BUY 1 GET HYPE',14,PAL['paper'],PAL['red']),
            sign(540,196,170,30,'SELL-BACK 20%. LOL.',14,INK,PAL['lime'])]
def rug(d): R.seed(5); shape(d,[(196,196),(436,192),(438,332),(194,334)],PAL['purple'],w=5,j=1.5); mline(d,[(214,262),(418,262)],4,1,PAL['yellow']); mtext(d,(316,300),'LIVE LAUGH LOOT',16,PAL['yellow'],'mm')
BED_SIGNS=[rug,sign(500,104,160,30,'MOM: CLEAN YOUR ROOM',12,INK,PAL['paper']),
           sign(180,60,120,26,'FUTURE CEO',14,PAL['paper'],PAL['purple'])]
def preview(items):
    P=cardboard(1500,1120,seed=91); d=ImageDraw.Draw(P); mtext(d,(20,8),'STYLE 2 — PLAYER BUST + INTERIORS',32)
    P.alpha_composite(items['bust'].resize((192,192)),(20,60)); mtext(d,(20,256),'player_bust_96 (2x)',14)
    P.alpha_composite(Image.open(f'{HERE}/overworld/player_walk_48.png').convert('RGBA'),(240,60)); mtext(d,(240,256),'walk sheet ref',14)
    ts=items['tiles']; P.alpha_composite(ts.resize((ts.width*3//2,72)),(20,290))
    for i,n in enumerate(CELLS): mtext(d,(20+i*72+36,370),str(i),12,INK,'mm')
    P.alpha_composite(items['shop'],(20,400)); P.alpha_composite(items['bed'],(760,400))
    P.convert('RGB').save(f'{HERE}/rooms_preview.png')
if __name__=='__main__':
    for p in ('npc','tiles','rooms'): os.makedirs(f'{HERE}/{p}',exist_ok=True)
    b=player_bust(); b.save(f'{HERE}/npc/player_bust_96.png')
    ts=tileset(); ts.save(f'{HERE}/tiles/interior_48.png')
    shop,sc=room(SHOP,SHOP_SIGNS); shop.convert('RGB').save(f'{HERE}/rooms/shop_interior_720x528.png')
    bed,bc=room(BED,BED_SIGNS); bed.convert('RGB').save(f'{HERE}/rooms/bedroom_720x528.png')
    idx={c:CELLS.index(n) for c,n in KEY.items()}
    json.dump({'tileSize':T,'tileset':'tiles/interior_48.png','cells':CELLS,'blocking':sorted(CELLS.index(n) for n in BLOCK),
      'shop':{'tiles':[[idx[c] for c in r] for r in SHOP],'collision':sc,'shopkeeper_spot':[6,2],'exit':[7,10],'interact':[{'key':'shop_entry','tile':[7,9],'trigger':'enter'},{'key':'shelf_soldout','tile':[13,1],'trigger':'face'}]},
      'bedroom':{'tiles':[[idx[c] for c in r] for r in BED],'collision':bc,'spawn':[7,8],'exit':[7,10],'interact':[{'key':'bed','tile':[0,1],'also':[[0,2]],'trigger':'face'},{'key':'pc','tile':[8,1],'trigger':'face'},{'key':'poster','tile':[3,0],'also':[[9,0]],'trigger':'face'}]}},open(f'{HERE}/rooms/rooms_48.json','w'))
    preview({'bust':b,'tiles':ts,'shop':shop.resize((720,528)),'bed':bed})
