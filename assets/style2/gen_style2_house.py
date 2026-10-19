#!/usr/bin/env python3
"""Style2 add-on: shopkeeper walk sheet + house-door tiles appended to tileset_48 (cells 21+). Cells 0-20 are copied, not regenerated."""
from PIL import Image, ImageDraw
from gen_style2 import PAL, INK, R, RB, HERE, TILE, shape, mline, dot, mtext, cardboard, walker, walk_sheet, t_wall, t_path, t_grass
def keeper_extra(d,P,dr,b,f):
    if dr=='down':
        shape(d,P([(16,24+b),(32,24+b),(33,37+b),(15,37+b)]),PAL['purple'],w=3,j=.6)            # $$$ apron bib
        for k,x in enumerate((18,23,28)): mline(d,P([(x+1,27+b),(x+1,34+b)]),2,.3,PAL['yellow'])  # $ strokes
        shape(d,P([(33,27+b),(41,26+b),(41,31+b),(36,31+b),(35,35+b),(33,35+b)]),PAL['orange'],w=3,j=.4)  # price gun
    elif dr in('left','right'):
        x=24+6*f; shape(d,P([(x,26+b),(x+8*f,25+b),(x+8*f,30+b),(x+3*f,30+b),(x+2*f,34+b),(x,34+b)]),PAL['orange'],w=3,j=.4)
    else: mline(d,P([(16,26+b),(32,26+b)]),3,.5,PAL['purple'])                                   # apron tie
SHOP_WALK={'body':PAL['purple'],'skin':'#e9c9a0','hair':PAL['green'],'hair_style':'cap','brim':True,'extra':keeper_extra,
  'head':(14,34,4,21),'torso':[(12,21),(36,21),(39,38),(9,38)],'legs':(37,46),'leg_x':(18,30)}   # wide jowly head, chunky apron body
def t_house_door():
    R.seed(820); im=t_wall(); d=ImageDraw.Draw(im); d.rectangle((0,0,48,48),fill=PAL['paper'])
    for y in (15,31): d.line((0,y,48,y),fill=PAL['card'],width=2)
    shape(d,[(11,6),(37,6),(37,47),(11,47)],PAL['red'],w=4,j=1)                 # front door
    shape(d,[(16,11),(32,11),(32,20),(16,20)],'#9fd8ff',w=2,j=.5)                # little window
    dot(d,32,31,3,PAL['gold']); shape(d,[(18,25),(30,25),(30,30),(18,30)],PAL['yellow'],w=2,j=.4)  # knob + mail slot
    mline(d,[(4,2),(44,2)],4)                                                   # lintel
    return im
def t_house_mat():
    R.seed(821); im=t_path(); d=ImageDraw.Draw(im)
    shape(d,[(6,8),(42,7),(43,36),(5,37)],PAL['lime'],w=4,j=1); mtext(d,(24,22),'NOPE',12,INK,'mm')  # passive-aggressive welcome mat
    return im
NEW=[('house_door',t_house_door),('house_door_mat',t_house_mat)]
if __name__=='__main__':
    sh=walk_sheet(SHOP_WALK); sh.save(f'{HERE}/overworld/shopkeeper_walk_48.png')
    base=Image.open(f'{HERE}/tiles/tileset_48.png').convert('RGBA'); keep=base.crop((0,0,21*TILE,TILE))
    strip=Image.new('RGBA',(TILE*(21+len(NEW)),TILE),(0,0,0,0)); strip.alpha_composite(keep,(0,0)); cells=[]
    for i,(n,fn) in enumerate(NEW):
        t=fn(); t.save(f'{HERE}/tiles/{n}_48.png'); strip.alpha_composite(t,((21+i)*TILE,0)); cells.append(t)
    strip.save(f'{HERE}/tiles/tileset_48.png')
    P=cardboard(900,560,seed=92); d=ImageDraw.Draw(P); mtext(d,(16,6),'STYLE 2 — SHOPKEEPER WALK + HOUSE DOOR',26)
    P.alpha_composite(sh.resize((288,384)),(16,50)); mtext(d,(16,440),'shopkeeper_walk_48 (2x)',13)
    P.alpha_composite(Image.open(f'{HERE}/npc/shopkeeper_bust_96.png').convert('RGBA').resize((144,144)),(320,50)); mtext(d,(320,200),'bust ref',13)
    P.alpha_composite(Image.open(f'{HERE}/overworld/player_walk_48.png').convert('RGBA'),(490,50)); mtext(d,(490,248),'player ref',13)
    for i,t in enumerate(cells): P.alpha_composite(t.resize((96,96)),(320+i*110,270)); mtext(d,(320+i*110,370),f'{21+i} {NEW[i][0]}',12)
    # mock house: roof / wall+door / mat
    roof=base.crop((4*TILE,0,5*TILE,TILE)); wall=base.crop((3*TILE,0,4*TILE,TILE)); g=t_grass()
    for x in range(5):
        P.alpha_composite(roof,(560+x*48,396)); P.alpha_composite(cells[0] if x==2 else wall,(560+x*48,444)); P.alpha_composite(cells[1] if x==2 else g,(560+x*48,492))
    mtext(d,(560,380),'in context',13)
    P.convert('RGB').save(f'{HERE}/house_preview.png')
