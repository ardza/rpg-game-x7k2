#!/usr/bin/env python3
"""Style2 add-on v0.4.4: laptop + item readability fix (interior_48), town building cells, tall grass variants, exit path +
COMING SOON barrier (appended to tileset_48 as cells 23+), rival Thorne (walk sheet, bust, fighters).
Run AFTER gen_style2_rooms.py / gen_style2_house.py (it patches their outputs): python3 gen_style2_v044.py
Tileset cells 0-22 are copied byte-for-byte; never reordered."""
from PIL import Image, ImageDraw
import os, json
import gen_style2_rooms as rooms
from gen_style2 import PAL, INK, R, RB, HERE, TILE, shape, mline, dot, mtext, cardboard, canvas, blob, fit, walk_sheet, t_grass, t_path, t_tall
P=PAL; T=48; SKIN='#e9c9a0'
def tile(base=None):
    im=base() if base else Image.new('RGBA',(T,T),(0,0,0,0)); return im,ImageDraw.Draw(im)
# ================= 1. interior item redraws (same cell indices) =================
_old_cell=rooms.cell
def cell(name):
    if name not in ('desk_laptop','bed_head','bed_foot','box_pile'): return _old_cell(name)
    R.seed(900+rooms.CELLS.index(name)); im,d=tile()
    if name=='desk_laptop':        # desk + clearly OPEN laptop: tilted screen with glow, keyboard deck
        shape(d,[(0,22),(48,20),(48,36),(0,38)],'#7a4a2a',w=4,j=.8); mline(d,[(4,38),(4,47)],4); mline(d,[(44,36),(44,47)],4)
        p=blob(24,12,22,12,n=20); d.polygon(p,fill=(159,216,255,110))                                   # screen glow
        shape(d,[(9,1),(39,1),(37,20),(11,20)],INK,w=3,j=.4); d.rectangle((13,4,35,17),fill='#9fd8ff')  # lid + lit screen
        for y in (7,11,14): d.line((15,y,31-(y%3)*3,y),fill=P['blue'],width=2)                          # code lines
        shape(d,[(5,20),(43,20),(46,29),(2,29)],P['silver'],w=3,j=.4)                                   # keyboard deck
        for x in range(8,42,5): d.line((x,23,x+1,26),fill=INK,width=1)
        d.line((18,27,30,27),fill=INK,width=1)
    if name=='bed_head':           # headboard + pillow + blanket start
        shape(d,[(1,2),(47,2),(47,10),(1,10)],'#7a4a2a',w=4,j=.6)
        shape(d,[(3,10),(45,10),(45,48),(3,48)],P['paper'],w=4,j=.6)
        shape(d,[(8,13),(40,13),(40,26),(8,26)],P['paper'],w=3,j=.6); mline(d,[(12,20),(36,20)],2,.5,P['silver'])  # pillow
        shape(d,[(3,32),(45,32),(45,48),(3,48)],P['blue'],w=4,j=.6); mline(d,[(3,36),(45,36)],3,.5,P['paper'])      # blanket fold
    if name=='bed_foot':           # blanket + footboard
        shape(d,[(3,0),(45,0),(45,38),(3,38)],P['blue'],w=4,j=.6)
        for y in (10,22): mline(d,[(6,y),(42,y+1)],3,.6,P['yellow'])
        shape(d,[(1,38),(47,38),(47,46),(1,46)],'#7a4a2a',w=4,j=.6)
    if name=='box_pile':           # taped moving boxes, "STUFF" label
        shape(d,[(2,20),(28,20),(28,47),(2,47)],P['card'],w=3,j=.6); mline(d,[(15,20),(15,47)],3,.3,'#d9c08a')
        shape(d,[(20,4),(46,6),(46,47),(22,47)],P['card_dk'],w=3,j=.6); mline(d,[(20,12),(46,13)],3,.3,'#d9c08a')
        shape(d,[(25,24),(43,24),(43,34),(25,34)],P['paper'],w=2,j=.3); mtext(d,(34,29),'STUFF',7,INK,'mm')
    return im
rooms.cell=cell
# ================= 2-4. overworld cells appended to tileset_48 =================
def wall_base(col,brick):
    im,d=tile(); d.rectangle((0,0,T,T),fill=col)
    for y in (15,31): d.line((0,y,48,y),fill=brick,width=2)
    return im,d
def roof(col,dark):
    im,d=tile(); d.rectangle((0,0,T,T),fill=col)
    for y in (12,24,36): mline(d,[(0,y),(48,y)],3,.6,dark)
    for y,o in ((0,0),(12,12),(24,0),(36,12)):
        for x in range(o,48,24): d.line((x,y,x,y+12),fill=dark,width=2)
    return im
def window(d,x0,y0,x1,y1,glass='#9fd8ff'): shape(d,[(x0,y0),(x1,y0),(x1,y1),(x0,y1)],glass,w=3,j=.4); mline(d,[((x0+x1)/2,y0),((x0+x1)/2,y1)],2,.2); mline(d,[(x0,(y0+y1)/2),(x1,(y0+y1)/2)],2,.2)
def door(d,col,glass=True):
    shape(d,[(11,6),(37,6),(37,47),(11,47)],col,w=4,j=.6); dot(d,32,30,3,P['gold'])
    if glass: shape(d,[(16,11),(32,11),(32,21),(16,21)],'#9fd8ff',w=2,j=.3)
    mline(d,[(4,2),(44,2)],4)
# house 2 (blue siding, teal roof)
H2W,H2B='#7fb2e6','#5a8cc0'
def h2_roof(): R.seed(1001); return roof('#2a9d8f','#1d6f66')
def h2_wall(): R.seed(1002); im,d=wall_base(H2W,H2B); return im
def h2_window(): R.seed(1003); im,d=wall_base(H2W,H2B); window(d,8,8,40,36); shape(d,[(6,36),(42,36),(42,42),(6,42)],P['card_dk'],w=3,j=.3); [dot(d,x,34,3,P['pink']) for x in (14,24,34)]; return im
def h2_door(): R.seed(1004); im,d=wall_base(H2W,H2B); door(d,P['yellow']); return im
# house 1 window (existing house wall cell 3 = red brick? keep paper siding like house_door)
def h1_window(): R.seed(1005); im,d=wall_base(P['paper'],P['card']); window(d,8,8,40,36); mline(d,[(4,40),(44,40)],4); return im
# cafe storefront "BURNT BEANS"
def cafe_awning():
    R.seed(1010); im,d=tile(); d.rectangle((0,0,T,30),fill='#4a3226')
    for i,x in enumerate(range(0,48,12)): d.polygon([(x,0),(x+12,0),(x+12,34),(x+6,40),(x,34)],fill=[P['red'],P['paper']][i%2]); d.line([(x,34),(x+6,40),(x+12,34)],fill=INK,width=3)
    mline(d,[(0,2),(48,2)],4); d.rectangle((0,40,T,T),fill='#4a3226'); return im
def cafe_sign(half):
    def f():
        R.seed(1011+half); im,d=tile(); d.rectangle((0,0,T,T),fill='#4a3226')
        shape(d,[(0 if half else 4,8),(44 if half==0 else 48,8),(44 if half==0 else 48,40),(0 if half else 4,40)],P['yellow'],w=4,j=.5)
        if half==0: mtext(d,(25,24),'BURNT',11,INK,'mm')
        else: mtext(d,(23,24),'BEANS',11,P['red'],'mm')
        if half==0: mline(d,[(4,8),(4,40)],4)
        else: mline(d,[(44,8),(44,40)],4)
        return im
    return f
def cafe_window():
    R.seed(1013); im,d=tile(); d.rectangle((0,0,T,T),fill='#4a3226'); shape(d,[(4,4),(44,4),(44,40),(4,40)],'#ffe9b0',w=3,j=.4)
    mtext(d,(24,14),'OAT?',10,INK,'mm'); mtext(d,(24,28),'$11',13,P['red'],'mm'); mline(d,[(2,44),(46,44)],4); return im
def cafe_door(): R.seed(1014); im,d=tile(); d.rectangle((0,0,T,T),fill='#4a3226'); door(d,P['green']); shape(d,[(14,24),(34,24),(34,32),(14,32)],P['paper'],w=2,j=.2); mtext(d,(24,28),'OPEN-ISH',6,INK,'mm'); return im
# tall building "HUSTLE HQ" (gray office tower, 2+ floors)
TW,TB='#a7abb8','#8d8d96'
def tower_top():
    R.seed(1020); im,d=tile(); d.rectangle((0,18,T,T),fill=TW); mline(d,[(0,18),(48,18)],4); d.rectangle((0,18,T,26),fill=P['gray']); mline(d,[(0,26),(48,26)],3)
    mline(d,[(24,18),(24,2)],3); dot(d,24,3,3,P['red']); [window(d,6+k*22,30,20+k*22,46,'#cfe8ff') for k in (0,1)]; return im   # roofline + antenna
def tower_windows():
    R.seed(1021); im,d=tile(); d.rectangle((0,0,T,T),fill=TW)
    for x0 in (6,28):
        for y0 in (4,26): window(d,x0,y0,x0+14,y0+18,'#cfe8ff')
    d.line((24,0,24,48),fill=TB,width=2); return im
def tower_sign():
    R.seed(1022); im,d=tile(); d.rectangle((0,0,T,T),fill=TW); shape(d,[(2,8),(46,8),(46,40),(2,40)],P['purple'],w=4,j=.4)
    mtext(d,(24,18),'HUSTLE',11,P['yellow'],'mm'); mtext(d,(24,31),'HQ',13,P['paper'],'mm'); return im
def tower_door():
    R.seed(1023); im,d=tile(); d.rectangle((0,0,T,T),fill=TW)
    shape(d,[(6,8),(42,8),(42,47),(6,47)],'#cfe8ff',w=4,j=.4); mline(d,[(24,8),(24,47)],3); dot(d,20,30,2); dot(d,28,30,2); mline(d,[(2,4),(46,4)],4); return im
# tall grass variants (encounter)
def tall_b():
    R.seed(1030); im,d=tile(); d.rectangle((0,0,T,T),fill='#1f6b2c')
    for x in range(2,48,6):
        h=R.randint(20,34); mline(d,[(x,48),(x+R.randint(-3,3),48-h)],4,.5,'#4fc35a'); mline(d,[(x+1,48),(x+1+R.randint(-2,2),48-h+8)],2,.3,INK)
    for x,y in ((10,10),(34,16)): dot(d,x,y,2,P['yellow'])
    return im
def tall_edge_n():
    im=t_tall(); g=t_grass(); m=Image.new('L',(T,T),0); md=ImageDraw.Draw(m); R.seed(1031)
    md.polygon([(0,0),(48,0)]+[(48-i*6,12+R.uniform(-3,3)) for i in range(9)],fill=255); im.paste(g,(0,0),m); return im
# exit path + barrier
def path_v():
    im=t_path(); g=t_grass(); m=Image.new('L',(T,T),0); md=ImageDraw.Draw(m); R.seed(1040)
    md.polygon([(0,0)]+[(10+R.uniform(-2,2),i*8) for i in range(7)]+[(0,48)],fill=255); md.polygon([(48,0)]+[(38+R.uniform(-2,2),i*8) for i in range(7)]+[(48,48)],fill=255)
    im.paste(g,(0,0),m); return im
def path_h():
    im=t_path(); g=t_grass(); m=Image.new('L',(T,T),0); md=ImageDraw.Draw(m); R.seed(1041)
    md.polygon([(0,0)]+[(i*8,10+R.uniform(-2,2)) for i in range(7)]+[(48,0)],fill=255); md.polygon([(0,48)]+[(i*8,38+R.uniform(-2,2)) for i in range(7)]+[(48,48)],fill=255)
    im.paste(g,(0,0),m); return im
def path_exit_arrow():
    im=path_v(); d=ImageDraw.Draw(im); R.seed(1042); shape(d,[(24,8),(34,22),(28,22),(28,38),(20,38),(20,22),(14,22)],P['paper'],w=3,j=.3); return im
def soon_barrier():
    R.seed(1043); im=t_path(); d=ImageDraw.Draw(im)
    for x in (6,42): mline(d,[(x,14),(x,46)],5)
    shape(d,[(0,12),(48,10),(48,30),(0,32)],P['orange'],w=4,j=.6)
    for x in range(-8,48,12): d.polygon([(x,12),(x+6,12),(x+14,30),(x+8,30)],fill=P['paper'])
    mline(d,[(0,12),(48,10)],3); mline(d,[(0,31),(48,29)],3); return im
def soon_sign():
    R.seed(1044); im=t_grass(); d=ImageDraw.Draw(im); mline(d,[(24,30),(24,47)],5)
    shape(d,[(2,4),(46,2),(46,32),(2,34)],P['yellow'],w=4,j=.6); mtext(d,(24,12),'COMING',10,INK,'mm'); mtext(d,(24,25),'SOON',13,P['red'],'mm'); return im
NEW=[('tall_grass_b',tall_b,'walk','encounter variant (denser, darker)'),
 ('tall_grass_edge_n',tall_edge_n,'walk','encounter; tall grass with short-grass fringe on top'),
 ('house2_roof',h2_roof,'solid','house 2 teal roof (use roof_edge_* 17-20 shapes as overlay if wanted)'),
 ('house2_wall',h2_wall,'solid','house 2 blue siding'),
 ('house2_window',h2_window,'solid','house 2 window + flower box'),
 ('house2_door',h2_door,'warp','house 2 yellow door, solid warp like 21 (facade-only until it has an interior)'),
 ('house_wall_window',h1_window,'solid','window for house 1 paper siding (matches cell 21 wall)'),
 ('cafe_awning',cafe_awning,'solid','BURNT BEANS cafe: striped awning (top row)'),
 ('cafe_sign_l',cafe_sign(0),'solid','cafe sign left half "BURNT"'),
 ('cafe_sign_r',cafe_sign(1),'solid','cafe sign right half "BEANS"'),
 ('cafe_window',cafe_window,'solid','cafe menu window "OAT? $11"'),
 ('cafe_door',cafe_door,'warp','cafe door "OPEN-ISH", solid warp-style, FACADE-ONLY (no interior)'),
 ('tower_top',tower_top,'solid','HUSTLE HQ roofline + antenna, top row'),
 ('tower_windows',tower_windows,'solid','HUSTLE HQ 4-pane floor, stack any height'),
 ('tower_sign',tower_sign,'solid','HUSTLE HQ purple sign'),
 ('tower_door',tower_door,'warp','HUSTLE HQ glass doors, solid warp-style, FACADE-ONLY'),
 ('path_v',path_v,'walk','vertical path, grass both sides (exit road)'),
 ('path_h',path_h,'walk','horizontal path, grass both sides'),
 ('path_exit_arrow',path_exit_arrow,'walk','vertical path with painted arrow pointing up/out'),
 ('soon_barrier',soon_barrier,'solid','striped road barrier on path (blocks the exit)'),
 ('soon_sign',soon_sign,'solid','"COMING SOON" sign on grass')]
BASE_N=23
# ================= 5. Thorne, the hustle-culture rival =================
VEST='#3d4a5c'; SHIRT='#bcd4f0'; HAIR='#3a2a1a'
def thorne_extra(d,Pp,dr,b,f):
    if dr=='down':
        shape(d,Pp([(20,20+b),(28,20+b),(26,34+b),(22,34+b)]),SHIRT,w=2,j=.2)            # shirt placket under vest
        mline(d,Pp([(24,20+b),(24,36+b)]),2,.2,P['silver'])                              # quarter-zip
        shape(d,Pp([(35,22+b),(41,22+b),(41,35+b),(35,35+b)]),P['orange'],w=2,j=.2)      # giant tumbler
        shape(d,Pp([(34,19+b),(42,19+b),(42,23+b),(34,23+b)]),INK,w=2,j=.1)
        dot(d,32*2,12*2+2*b,2.5,P['paper'])                                              # earbud
    elif dr in ('left','right'):
        x=24+9*f; shape(d,Pp([(x,22+b),(x+6*f,22+b),(x+6*f,35+b),(x,35+b)]),P['orange'],w=2,j=.2)
        dot(d,(24-4*f)*2,12*2+2*b,2.5,P['paper'])
THORNE_CFG={'body':VEST,'skin':SKIN,'hair':HAIR,'hair_style':'flat','extra':thorne_extra,
  'head':(16,32,2,20),'torso':[(13,20),(35,20),(36,38),(12,38)],'legs':(37,47),'leg_x':(19,29)}
def tumbler(d,x,y,w,h):
    shape(d,[(x,y),(x+w,y),(x+w-3,y+h),(x+3,y+h)],P['orange'],w=4,j=.5)
    shape(d,[(x-2,y-10),(x+w+2,y-10),(x+w+2,y),(x-2,y)],INK,w=3,j=.3); mline(d,[(x+w*0.65,y-10),(x+w*0.75,y-26)],4)   # lid + straw
    mtext(d,(x+w/2,y+h/2),'GRIND',max(8,w//5),P['paper'],'mm')
def thorne_bust():
    RB.seed(99); R.seed(7); im,d=canvas(96,96)
    shape(d,[(4,68),(92,64),(94,96),(2,96)],VEST)                                       # fleece vest
    shape(d,[(34,64),(62,64),(56,96),(40,96)],SHIRT,w=3)                                # button shirt
    for y in (74,84): dot(d,48,y,2)
    mline(d,[(48,64),(48,72)],3,.3,P['silver'])                                         # zip pull
    shape(d,[(26,14),(70,16),(70,66),(26,64)],SKIN)                                     # head
    shape(d,[(22,6),(74,8),(74,20),(56,16),(22,22)],HAIR); mline(d,[(30,10),(64,12)],2,.5,'#6a5034')   # slicked back shine
    for x in (38,58): dot(d,x,36,4); mline(d,[(x-6,44),(x+6,44)],2,.3,P['purple'])     # wired eyes + 4am eyebags
    shape(d,[(34,50),(62,48),(58,58),(38,58)],P['paper'],w=3,j=.3)                      # tired-but-wired grin
    dot(d,72,38,4,P['paper']); d.ellipse((68,34,76,42),outline=INK,width=2)             # single earbud
    tumbler(d,74,58,20,34)
    shape(d,[(2,30),(22,30),(22,60),(2,60)],INK,w=3,j=.3); d.rectangle((5,33,19,57),fill=P['blue']); mtext(d,(12,40),'4:00',7,P['paper'],'mm'); mtext(d,(12,50),'AM',7,P['paper'],'mm')
    return im
def thorne_fighter():
    im,d=canvas(170,210)
    mline(d,[(62,152),(58,192)],7,col=P['card_dk']); mline(d,[(82,152),(88,192)],7,col=P['card_dk'])   # chinos
    shape(d,[(44,188),(64,188),(66,198),(40,198)],INK,w=3); shape(d,[(82,188),(102,188),(106,198),(82,198)],INK,w=3)
    shape(d,[(52,92),(92,90),(94,156),(50,158)],SHIRT)                                 # button shirt
    shape(d,[(42,94),(66,92),(64,156),(40,158)],VEST); shape(d,[(80,92),(98,94),(100,158),(82,156)],VEST)   # quarter-zip vest
    mline(d,[(72,94),(72,110)],3,.3,P['silver'])
    for y in (120,136): dot(d,73,y,2)
    shape(d,[(92,104),(118,98),(122,108),(96,118)],SHIRT)                              # arm out holding phone
    shape(d,[(118,70),(142,70),(142,112),(118,112)],INK,w=3,j=.4); d.rectangle((122,74,138,108),fill=P['paper'])
    mline(d,[(124,104),(128,96),(132,99),(137,80)],3,.3,P['green']); mtext(d,(130,80),'4AM',8,INK,'mm')   # growth chart
    shape(d,[(42,118),(30,128),(36,136),(46,128)],VEST)                                 # back arm to tumbler
    tumbler(d,14,128,26,46)
    shape(d,[(48,26),(94,28),(92,90),(50,88)],SKIN)                                    # head
    shape(d,[(44,18),(98,20),(100,32),(76,30),(46,40)],HAIR); mline(d,[(54,22),(90,24)],3,.5,'#6a5034')
    dot(d,80,52,4); mline(d,[(74,60),(86,60)],2,.3,P['purple'])                        # wired eye + eyebag
    shape(d,[(72,70),(96,66),(92,78),(76,78)],P['paper'],w=3,j=.3)                     # grin
    dot(d,58,54,5,P['paper']); d.ellipse((53,49,63,59),outline=INK,width=2)            # single earbud
    shape(d,[(100,10),(166,8),(168,34),(102,36)],P['paper'],w=3); mtext(d,(134,22),'#content',11,P['purple'],'mm')
    return im
def thorne_frames():
    out={}
    for s in (96,48):
        for f in range(3): RB.seed(99); R.seed(3000+f*17); out[(s,f)]=fit(thorne_fighter(),s)
    return out
# ================= build =================
def town_mock(cells):
    g=t_grass(); c={n:cells[n] for n in cells}; base=Image.open(f'{HERE}/tiles/tileset_48.png').convert('RGBA')
    old=lambda i: base.crop((i*T,0,(i+1)*T,T))
    L={'.':g,'=':old(1),'R':old(4),'w':old(3),'D':old(21),'M':old(22),'W':c['house_wall_window']}
    L.update({'r':c['house2_roof'],'s':c['house2_wall'],'o':c['house2_window'],'d':c['house2_door'],'a':c['cafe_awning'],'(':c['cafe_sign_l'],')':c['cafe_sign_r'],
              'c':c['cafe_window'],'e':c['cafe_door'],'t':c['tower_top'],'x':c['tower_windows'],'h':c['tower_sign'],'q':c['tower_door'],
              'T':old(2),'b':c['tall_grass_b'],'n':c['tall_grass_edge_n'],'|':c['path_v'],'-':c['path_h'],'^':c['path_exit_arrow'],'B':c['soon_barrier'],'S':c['soon_sign']})
    MAP=["......S.B.S...t.....",
         "........|.....x.....",
         ".RRR....|...rrhr....",
         ".WDW....^...sxos....",
         ".=M=....|...odqs....",
         ".===============....",
         "aaa(.)..|.nnnn......",
         "aaa()...|.TbTb......",
         "ccec....|.bTbT......",
         "..=-----|...........",]
    MAP=["......S.B.S.....t...",
         "........|.......x...",
         ".RRR....|.rrrr..h...",
         ".WDW....^.sods..q...",
         "..M.....|.......=...",
         "--------=-----------",
         "c()c....|.nnnn......",
         "aaaa....|.TbTb......",
         "ccec....|.bTbT......",
         "..=.....|...........",]
    im=Image.new('RGBA',(20*T,10*T))
    for y,row in enumerate(MAP):
        for x,ch in enumerate(row): im.alpha_composite(g,(x*T,y*T)); im.alpha_composite(L[ch],(x*T,y*T))
    return im
if __name__=='__main__':
    # 1. interior + bedroom re-render (same grid/json as gen_style2_rooms)
    ts=rooms.tileset(); ts.save(f'{HERE}/tiles/interior_48.png')
    for n in ('desk_laptop','bed_head','bed_foot','box_pile'): cell(n).save(f'{HERE}/tiles/interior_{n}_48.png')
    bed,_=rooms.room(rooms.BED,rooms.BED_SIGNS); bed.convert('RGB').save(f'{HERE}/rooms/bedroom_720x528.png')
    shop,_=rooms.room(rooms.SHOP,rooms.SHOP_SIGNS); shop.convert('RGB').save(f'{HERE}/rooms/shop_interior_720x528.png')
    # 2-4. tileset append
    base=Image.open(f'{HERE}/tiles/tileset_48.png').convert('RGBA'); keep=base.crop((0,0,BASE_N*T,T))
    strip=Image.new('RGBA',(T*(BASE_N+len(NEW)),T),(0,0,0,0)); strip.alpha_composite(keep,(0,0)); cells={}
    for i,(n,fn,flag,_) in enumerate(NEW):
        RB.seed(99); t=fn(); cells[n]=t; t.save(f'{HERE}/tiles/{n}_48.png'); strip.alpha_composite(t,((BASE_N+i)*T,0))
    town=town_mock(cells)   # uses old cells from base before overwrite
    strip.save(f'{HERE}/tiles/tileset_48.png')
    json.dump({'base_cells':BASE_N,'columns':BASE_N+len(NEW),'new':[{'cell':BASE_N+i,'name':n,'flag':f,'note':nt} for i,(n,_,f,nt) in enumerate(NEW)]},open(f'{HERE}/tiles/tileset_48_v044.json','w'),indent=1)
    # 5. rival
    sh=walk_sheet(THORNE_CFG); sh.save(f'{HERE}/overworld/thorne_walk_48.png')
    bu=thorne_bust(); bu.save(f'{HERE}/npc/thorne_bust_96.png'); fr=thorne_frames()
    for (s,f),im in fr.items(): im.save(f'{HERE}/fighters/thorne_{s}_f{f}.png')
    # preview
    Pv=cardboard(1700,1280,seed=97); d=ImageDraw.Draw(Pv); mtext(d,(16,6),'STYLE 2 — v0.4.4: laptop room · town cells · tall grass · exit · Thorne',28)
    Pv.alpha_composite(bed,(16,50)); mtext(d,(16,580),'rooms/bedroom_720x528 (laptop at [8,1])',13)
    Pv.alpha_composite(town,(750,50)); mtext(d,(750,532),'mock town (tileset_48 cells; cafe / house2 / HUSTLE HQ / tall grass / exit road + COMING SOON)',13)
    for i,n in enumerate(['desk_laptop','bed_head','bed_foot','box_pile']): Pv.alpha_composite(cell(n).resize((96,96),Image.NEAREST),(750+i*104,560)); mtext(d,(750+i*104,658),n,11)
    for i,(n,_,f,_) in enumerate(NEW):
        x,y=16+(i%11)*120,690+(i//11)*130; Pv.alpha_composite(cells[n].resize((96,96),Image.NEAREST),(x,y)); mtext(d,(x,y+98),f'{BASE_N+i} {n}',10); mtext(d,(x,y+111),f,10,P['red'])
    Pv.alpha_composite(sh.resize((288,384),Image.NEAREST),(16,950) if False else (1380,560)); mtext(d,(1380,948),'thorne_walk_48 (2x)',12)
    Pv.alpha_composite(bu.resize((144,144)),(1200,960)); mtext(d,(1200,1108),'thorne_bust_96',12)
    for f in range(3): Pv.alpha_composite(fr[(96,f)],(16+f*104,960)); Pv.alpha_composite(fr[(48,f)],(340+f*56,1008))
    mtext(d,(16,1060),'thorne fighters 96 f0-2 + 48 (face right)',12)
    Pv.convert('RGB').save(f'{HERE}/v044_preview.png')
