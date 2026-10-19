#!/usr/bin/env python3
"""Style2 add-on: boss fighter Maxx Volume, the Mega-Streamer. Side view facing LEFT. Run: python3 gen_style2_boss.py"""
from PIL import Image, ImageDraw
from gen_style2 import PAL, INK, R, RB, HERE, shape, mline, dot, mtext, canvas, fit, cardboard, fighter
def maxx():
    im,d=canvas(200,220)
    # legs + chunky sneakers (toes point left)
    mline(d,[(92,176),(88,210)],9); mline(d,[(118,176),(122,210)],9)
    shape(d,[(66,204),(96,204),(98,216),(62,216)],PAL['paper'],w=3); shape(d,[(100,204),(130,204),(132,216),(96,216)],PAL['paper'],w=3)
    # loud shirt: big belly box, lightning zigzags
    shape(d,[(70,96),(140,92),(150,180),(62,182)],PAL['orange'])
    mline(d,[(76,118),(92,108),(98,126),(114,112),(120,130),(140,118)],4,1,PAL['yellow'])
    mline(d,[(72,150),(88,140),(96,160),(112,146),(118,164),(144,152)],4,1,PAL['pink'])
    # donation-goal bar strapped to his chest
    shape(d,[(74,164),(140,162),(140,178),(74,180)],PAL['paper'],w=3,j=.6)
    d.rectangle((78,167,98,175),fill=PAL['lime']); mtext(d,(118,170),'$4/$5000',10,INK,'mm')
    # arm holding unbranded mug out front (left)
    shape(d,[(72,110),(46,124),(50,136),(78,126)],PAL['orange'],w=4)
    shape(d,[(18,112),(46,112),(44,148),(20,148)],PAL['purple'],w=4,j=1)          # mug
    shape(d,[(8,120),(18,118),(18,138),(8,138)],(0,0,0,0),w=4,j=.6)               # handle
    mtext(d,(32,130),'#1',13,PAL['yellow'],'mm')
    for x in (24,34): mline(d,[(x,108),(x-4,96),(x+2,86)],3,1.5,PAL['silver'])   # steam
    # big round head
    shape(d,[(62,24),(132,22),(140,94),(58,96)],'#e9c9a0')
    shape(d,[(58,22),(70,6),(84,18),(98,2),(112,16),(130,8),(136,30),(60,32)],PAL['blue'],j=1)  # wild hair
    # oversized headset: huge ear cup on the visible (right) side, band over head
    mline(d,[(66,30),(98,-2),(134,30)],9,1); mline(d,[(66,30),(98,-2),(134,30)],4,1,PAL['lime'])
    shape(d,[(114,34),(150,32),(152,82),(116,84)],INK,w=4); shape(d,[(120,40),(146,40),(146,76),(120,76)],PAL['lime'],w=3,j=.6)
    mtext(d,(133,58),'MAX',11,INK,'mm')
    # mic boom swinging forward to his mouth
    mline(d,[(118,72),(80,86),(54,78)],5); shape(d,[(40,70),(56,70),(56,84),(40,84)],PAL['red'],w=3,j=.6)
    # face (looking left): wide eye with eyebag, yelling mouth
    shape(d,[(66,40),(84,38),(84,54),(66,54)],PAL['paper'],w=3,j=.5); dot(d,71,47,4)
    mline(d,[(64,58),(84,60)],2,.5,PAL['purple'])                                   # 900-day eyebag
    shape(d,[(56,68),(84,64),(86,90),(60,92)],INK,w=3); shape(d,[(62,80),(80,78),(80,88),(64,88)],PAL['pink'],w=0)
    # LIVE badge on shoulder
    shape(d,[(128,96),(158,94),(158,108),(128,110)],PAL['red'],w=3,j=.5); mtext(d,(143,102),'LIVE',10,PAL['paper'],'mm')
    return im
def boss(frame,size):
    RB.seed(99); R.seed(1300+frame*17); return fit(maxx(),size)
if __name__=='__main__':
    out={}
    for s in (96,144,48):
        for f in range(3):
            im=boss(f,s); out[(s,f)]=im
            if s!=48: im.save(f'{HERE}/fighters/maxx_{s}_f{f}.png')
    P=cardboard(900,420,seed=93); d=ImageDraw.Draw(P); mtext(d,(16,6),'STYLE 2 — BOSS: MAXX VOLUME (faces left)',26)
    for f in range(3):
        P.alpha_composite(out[(144,f)],(16+f*160,60)); P.alpha_composite(out[(96,f)],(500+f*110,108)); mtext(d,(16+f*160,210),f'144 f{f}',12); mtext(d,(500+f*110,210),f'96 f{f}',12)
    bg=Image.open(f'{HERE}/battle/bg_stream_room_720x528.png').convert('RGBA'); sh=Image.open(f'{HERE}/battle/shadow_96x24.png')
    for x in (100,200):  P.alpha_composite(sh,(0,0)) if False else None
    bg.alpha_composite(Image.open(f'{HERE}/battle/shadow_96x24.png').resize((144,30)),(545-72,430-15)); bg.alpha_composite(out[(144,0)],(545-72,430-144))
    P.alpha_composite(bg.resize((360,264)),(520,140)) if False else None
    P.alpha_composite(bg.crop((360,250,720,450)).resize((300,166)),(16,240)); mtext(d,(330,300),'in battle: 144 at x545, feet 430',13)
    P.convert('RGB').save(f'{HERE}/boss_preview.png')
