#!/usr/bin/env python3
"""Style2 add-on: cards batch 2 (v0.4.3), 20 cards. Side view FACING RIGHT (party art; code mirrors enemies).
Run: python3 gen_style2_batch2.py  -> fighters/<id>_96|48_f0-2.png, cards/card_<id>_120x168.png, cards/art/<id>_art_99x70.png, batch2_preview.png
Does not modify gen_style2.py outputs."""
from PIL import Image, ImageDraw
import os
from gen_style2 import PAL, INK, R, RB, HERE, shape, mline, dot, mtext, canvas, fit, cardboard, blob, RARITY, ART_WIN, F
P=PAL; SKIN='#e9c9a0'
def eye(d,x,y,r=7): dot(d,x,y,r,P['paper']); dot(d,x+2,y,3)
def legs(d,xs,y0,y1,w=6,col=INK):
    for x in xs: mline(d,[(x,y0),(x+2,y1)],w,col=col)

# ---------------- COMMON ----------------
def vapebat():
    im,d=canvas(200,170)
    for i,(x,y,r) in enumerate(((14,120,10),(34,110,13),(56,104,15))):   # flavored mist trail
        p=blob(x,y,r,r*.8,n=16); d.polygon(p,fill=[P['blue'],P['pink'],P['lime']][i]); d.line(p+[p[0]],fill=INK,width=3)
    shape(d,[(90,40),(60,10),(70,52)],P['gray'],w=4); shape(d,[(130,40),(170,6),(176,60)],P['gray'],w=4)   # wings
    p=blob(120,90,48,34,j=.12,n=22); d.polygon(p,fill=P['paper']); d.line(p+[p[0]],fill=INK,width=5)       # cloud body
    for cx in (92,120,148): q=blob(cx,64,18,14,n=14); d.polygon(q,fill=P['paper']); d.line(q+[q[0]],fill=INK,width=4)
    shape(d,[(138,52),(144,30),(152,50)],P['gray'],w=3); shape(d,[(152,50),(160,30),(166,52)],P['gray'],w=3)  # ears
    dot(d,146,82,9,P['paper']); dot(d,148,82,5); shape(d,[(150,100),(170,98),(164,108)],P['pink'],w=3); d.polygon([(154,101),(158,101),(156,107)],fill=P['paper'])
    legs(d,(108,132),120,150,4)
    return im
def hustle_hamster():
    im,d=canvas(200,200)
    p=blob(60,96,50,50,j=.04,n=30); d.line(p+[p[0]],fill=INK,width=7); d.line(p+[p[0]],fill=P['silver'],width=3)   # wheel on back
    for a in range(0,4): mline(d,[(60,96),(p[a*7][0],p[a*7][1])],3)
    for x in (30,90): mline(d,[(x-6,60+(x-30)//3),(x+8,64+(x-30)//3)],9,col=P['gray'])  # duct tape
    shape(d,[(70,90),(150,84),(160,168),(66,172)],P['orange'])                 # body
    shape(d,[(110,112),(150,110),(152,160),(112,162)],P['paper'],w=3)          # belly
    shape(d,[(100,40),(164,38),(170,96),(98,98)],P['orange'])                  # head
    shape(d,[(104,34),(116,22),(122,40)],P['orange'],w=4)
    mline(d,[(100,52),(130,30),(168,52)],5); shape(d,[(92,52),(108,50),(108,72),(94,72)],INK,w=3)   # headset
    mline(d,[(104,70),(150,86)],3); dot(d,152,86,4,P['red'])                   # mic
    eye(d,148,58,6); shape(d,[(160,74),(172,76),(162,82)],P['pink'],w=3); d.rectangle((156,82,162,90),fill=P['paper'],outline=INK)
    shape(d,[(150,120),(176,116),(178,136),(152,138)],P['lime'],w=3); mtext(d,(164,126),'$-3',10,INK,'mm')  # side hustle sign
    legs(d,(90,130),168,196,7); return im
def thirst_trout():
    im,d=canvas(220,150)
    shape(d,[(10,40),(40,74),(10,110)],P['pink'],w=4)                         # tail
    shape(d,[(36,70),(100,36),(170,44),(200,76),(170,108),(100,114)],P['blue'])  # fish body
    for x in (80,104,128): mline(d,[(x,56),(x+6,78),(x,98)],3,col='#9ab8ff')
    shape(d,[(100,40),(124,14),(140,42)],P['pink'],w=4)                        # dorsal
    eye(d,166,62,8); mline(d,[(156,48),(176,50)],3)                            # sultry brow
    shape(d,[(190,70),(214,64),(216,90),(192,86)],P['pink'],w=4)               # duck lips
    shape(d,[(134,90),(156,84),(160,138),(138,142)],INK,w=4); shape(d,[(140,94),(154,90),(156,132),(142,136)],P['purple'],w=0)  # phone
    mtext(d,(148,112),'2AM',10,P['paper'],'mm')
    shape(d,[(120,100),(140,96),(146,118),(124,120)],P['pink'],w=3)            # fin holding phone
    return im
def mukbang_mole():
    im,d=canvas(220,190)
    for i in range(5):                                                         # stack of empty bowls
        for j in range(2): shape(d,[(8+j*32,170-i*16),(38+j*32,170-i*16),(34+j*32,184-i*16),(12+j*32,184-i*16)],[P['paper'],P['red']][(i+j)%2],w=3,j=.6)
    mtext(d,(16,90),'x40',18,INK)
    p=blob(140,124,62,56,j=.05,n=30); d.polygon(p,fill=P['card_dk']); d.line(p+[p[0]],fill=INK,width=5)   # round mole
    shape(d,[(110,120),(176,118),(170,170),(116,172)],P['paper'],w=4); mline(d,[(112,120),(176,118)],4,col=P['red'])  # napkin bib
    shape(d,[(186,104),(210,100),(212,118),(190,122)],P['pink'],w=4)          # snout
    dot(d,170,96,4); dot(d,180,96,4)                                           # tiny eyes
    shape(d,[(176,124),(200,122),(196,136),(178,136)],INK,w=3)                 # chewing mouth
    mline(d,[(196,140),(210,160),(204,168)],3); shape(d,[(196,160),(214,158),(212,176),(198,176)],P['yellow'],w=3)  # chopsticks+noodle
    for x in (110,160): shape(d,[(x,172),(x+26,172),(x+28,182),(x-2,182)],P['pink'],w=3)  # claws
    return im
def copypasta_cat():
    im,d=canvas(200,200)
    blocks=[(40,100,110,130),(60,120,150,150),(30,130,100,160),(90,90,160,124),(100,140,170,172),(50,150,120,176)]
    for i,(a,b,c,e) in enumerate(blocks):
        shape(d,[(a,b),(c,b),(c,e),(a,e)],[P['gray'],P['silver']][i%2],w=4,j=1)
        for y in range(b+8,e-4,8): d.line((a+6,y,c-8,y),fill=INK,width=2)
    shape(d,[(16,110),(40,112),(20,60),(8,64)],P['gray'],w=4)                 # tail
    shape(d,[(110,40),(176,38),(180,96),(108,98)],P['gray'])                   # head (text box)
    for y in (56,66,76): d.line((116,y,140,y),fill=P['paper'],width=2)
    shape(d,[(112,40),(122,14),(136,40)],P['gray'],w=4); shape(d,[(152,38),(166,12),(176,40)],P['gray'],w=4)
    eye(d,158,62,6); mtext(d,(160,86),'^C^V',11,P['paper'],'mm')
    legs(d,(70,140),172,198,6); return im
def reply_guy_rat():
    im,d=canvas(220,200)
    mline(d,[(40,150),(14,120),(6,80)],4,col=P['pink'])                         # tail
    shape(d,[(40,110),(130,100),(140,170),(36,176)],P['gray'])                 # body
    shape(d,[(110,60),(170,56),(200,86),(170,108),(112,106)],P['gray'])        # head + snout
    dot(d,200,86,5,P['pink']); eye(d,156,74,6); mline(d,[(146,64),(164,66)],3)
    for k in (-4,4): mline(d,[(186,92),(214,92+k*2)],2)                        # whiskers
    shape(d,[(102,58),(180,52),(182,62),(100,68)],INK,w=3)                     # fedora brim
    shape(d,[(118,22),(166,18),(170,56),(116,60)],INK,w=3); d.line((118,46,168,44),fill=P['red'],width=4)
    shape(d,[(140,140),(204,132),(208,170),(144,176)],P['silver'],w=4)         # laptop
    mtext(d,(174,152),'well...',13,INK,'mm')
    for x in (128,140): mline(d,[(x,126),(x+12,140)],4,col=P['pink'])          # typing paws
    legs(d,(60,110),172,198,6); return im
def filter_frog():
    im,d=canvas(200,180)
    shape(d,[(30,110),(150,100),(170,160),(24,168)],P['lime'])                 # squat body
    shape(d,[(60,60),(170,56),(176,110),(56,112)],P['lime'])                   # head
    for x in (80,140):                                                         # huge filter eyes
        p=blob(x,52,26,26,n=24); d.polygon(p,fill=P['paper']); d.line(p+[p[0]],fill=INK,width=4); dot(d,x+6,54,12,P['blue']); dot(d,x+8,54,6); dot(d,x+12,48,3,P['paper'])
    for x in (100,160): dot(d,x,92,7,P['pink'])                                # blush
    for (x,y) in ((60,92),(176,80),(30,40),(186,30)):                          # sparkles
        shape(d,[(x,y-10),(x+3,y),(x,y+10),(x-3,y)],P['yellow'],w=2,j=.3); shape(d,[(x-10,y),(x,y-3),(x+10,y),(x,y+3)],P['yellow'],w=2,j=.3)
    mline(d,[(118,96),(140,102),(160,96)],4)
    for x in (40,130): shape(d,[(x,160),(x+34,158),(x+36,172),(x-4,172)],P['lime'],w=4)
    return im
def burner_beetle():
    im,d=canvas(220,170)
    for x in (60,90,120): mline(d,[(x,120),(x-8,160)],5); mline(d,[(x+4,120),(x+14,160)],5)
    p=blob(96,96,72,44,j=.04,n=30); d.polygon(p,fill=P['orange']); d.line(p+[p[0]],fill=INK,width=5)   # shell
    mline(d,[(96,54),(90,138)],4)
    for xy in ((60,84),(122,80),(70,112)): dot(d,*xy,7,INK)
    shape(d,[(160,70),(206,70),(210,118),(162,120)],INK)                       # head
    shape(d,[(166,78),(186,76),(186,90),(166,92)],INK,w=3); shape(d,[(188,76),(208,76),(208,90),(190,92)],INK,w=3)  # shades
    mline(d,[(168,80),(184,80)],2,col=P['silver']); mline(d,[(190,80),(206,80)],2,col=P['silver'])
    shape(d,[(166,100),(186,94),(208,100),(196,110),(186,104),(176,110)],P['card_dk'],w=3)   # fake mustache
    for x in (180,198): mline(d,[(x,70),(x+8,40),(x+18,36)],3)                 # antennae
    shape(d,[(0,30),(52,28),(54,52),(2,54)],P['paper'],w=3); mtext(d,(27,41),'@alt14',11,INK,'mm')
    return im
# ---------------- UNCOMMON ----------------
def streak_snail():
    im,d=canvas(220,170)
    shape(d,[(10,150),(60,128),(180,130),(206,90),(214,152),(8,164)],P['lime'])        # foot + neck
    mline(d,[(196,96),(200,60)],4); mline(d,[(208,96),(216,64)],4); eye(d,200,58,6); eye(d,216,62,6)
    p=blob(100,90,62,58,j=.04,n=30); d.polygon(p,fill=P['card_dk']); d.line(p+[p[0]],fill=INK,width=5)   # shell
    mline(d,[(100,90),(120,70),(130,100),(96,120),(70,90),(100,52)],4)
    shape(d,[(66,54),(80,22),(90,44),(102,14),(116,56)],P['orange'],w=4)        # flame badge
    p=blob(92,74,24,20,n=18); d.polygon(p,fill=P['yellow']); d.line(p+[p[0]],fill=INK,width=3); mtext(d,(92,75),'400',16,INK,'mm')
    mline(d,[(190,120),(204,122)],3); return im
def merch_moth():
    im,d=canvas(220,200)
    shape(d,[(70,70),(10,10),(4,100),(64,120)],P['silver'],w=4); shape(d,[(150,70),(212,16),(214,100),(156,120)],P['silver'],w=4)  # wings
    for i,c in enumerate((P['red'],P['blue'],P['lime'],P['yellow'],P['purple'],P['pink'])):   # 6 stacked hoodies
        y=70+i*16; shape(d,[(66-i*2,y),(156+i*2,y),(160+i*2,y+28),(62-i*2,y+28)],c,w=4,j=1)
    mtext(d,(110,140),'MOTH™',16,P['paper'],'mm')
    shape(d,[(84,22),(140,20),(146,72),(80,74)],P['paper'])                    # head in hood
    shape(d,[(76,36),(84,14),(146,14),(152,36),(146,72),(140,40),(86,40),(80,74)],P['red'],w=4)
    eye(d,126,52,6); mline(d,[(100,6),(90,-6)],3); mline(d,[(126,6),(140,-6)],3)
    shape(d,[(170,130),(212,126),(214,150),(172,154)],P['yellow'],w=3); mtext(d,(192,140),'DROP!',11,INK,'mm')
    legs(d,(96,126),180,198,5); return im
def podcast_parrot():
    im,d=canvas(220,220)
    shape(d,[(40,100),(110,80),(120,180),(50,190)],P['red'])                  # body
    shape(d,[(30,130),(60,120),(40,210),(14,200)],P['blue'],w=4)                # tail
    shape(d,[(60,100),(100,96),(104,150),(64,156)],P['yellow'],w=3)            # wing
    shape(d,[(80,30),(140,26),(144,90),(84,92)],P['red'])                       # head
    shape(d,[(140,38),(174,50),(150,76),(142,70)],P['yellow'],w=4)             # beak
    eye(d,118,50,7); shape(d,[(86,12),(100,30),(110,8),(118,28)],P['lime'],w=3)
    for x,cl,ban in ((168,P['gray'],False),(196,P['yellow'],True)):            # two mics, one banana
        mline(d,[(x,200),(x-8,110)],4)
        if ban: shape(d,[(x-20,80),(x-6,90),(x+6,110),(x-6,116),(x-16,100)],cl,w=4); dot(d,x-20,80,3,P['card_dk'])
        else: shape(d,[(x-18,86),(x+2,84),(x+2,116),(x-16,118)],cl,w=4)
    mline(d,[(150,200),(214,200)],5)
    legs(d,(70,96),186,214,5,P['orange']); return im
def prankster_possum():
    im,d=canvas(220,170)
    shape(d,[(30,70),(150,60),(160,120),(26,126)],P['gray'])                   # body on its back
    shape(d,[(150,64),(206,60),(212,108),(156,116)],P['paper'])                # face
    mline(d,[(166,76),(180,88)],3); mline(d,[(180,76),(166,88)],3)             # X eyes (fake dead)
    shape(d,[(186,90),(206,92),(200,102)],P['pink'],w=3); d.polygon([(194,100),(200,100),(197,112)],fill=P['pink'],outline=INK)   # tongue
    dot(d,206,84,4,P['pink'])
    mline(d,[(30,96),(8,80),(4,50),(16,40)],5,col=P['pink'])                   # tail
    for x in (60,90,120,140): mline(d,[(x,62),(x+4,26)],5)                     # legs up
    shape(d,[(110,8),(160,6),(162,42),(112,44)],INK,w=3); dot(d,136,24,9,P['silver']); dot(d,136,24,4)   # camera held up
    dot(d,154,12,3,P['red']); mline(d,[(126,30),(118,46)],5,col=P['gray'])
    return im
def reaction_raccoon():
    im,d=canvas(220,210)
    shape(d,[(20,150),(4,110),(20,96),(36,140)],P['gray'],w=4); mline(d,[(10,118),(26,112)],4); mline(d,[(14,132),(30,126)],4)   # striped tail
    shape(d,[(30,120),(110,110),(116,190),(34,196)],P['gray'])                 # body
    shape(d,[(50,60),(110,56),(116,116),(54,120)],P['gray'])                   # head
    shape(d,[(56,74),(112,72),(112,90),(58,92)],INK,w=3); eye(d,96,82,5)       # mask
    shape(d,[(52,58),(60,38),(72,58)],P['gray'],w=3)
    shape(d,[(120,20),(214,16),(216,120),(122,124)],P['ink'],w=5)              # giant face cam
    shape(d,[(128,28),(208,26),(208,112),(130,116)],P['orange'],w=0)
    p=blob(168,86,26,22,n=20); d.polygon(p,fill=INK); dot(d,152,50,6,P['paper']); dot(d,184,50,6,P['paper']); dot(d,153,51,3); dot(d,185,51,3)
    d.rectangle((158,100,178,108),fill=P['pink']); dot(d,136,34,4,P['red'])
    mline(d,[(110,130),(130,118)],5)
    legs(d,(56,96),190,208,6); return im
def lo_fi_lizard():
    im,d=canvas(220,200)
    shape(d,[(110,4),(214,4),(214,104),(110,104)],'#3a5a7a',w=5)               # rainy window
    mline(d,[(162,4),(162,104)],4); mline(d,[(110,54),(214,54)],4)
    for x,y in ((124,14),(146,36),(178,20),(200,66),(130,74),(190,40),(150,84)): mline(d,[(x,y),(x-2,y+12)],2,.3,'#9ab8ff')
    shape(d,[(6,170),(40,150),(100,140),(150,150),(150,186),(10,190)],P['lime'])    # long low body
    shape(d,[(130,120),(196,116),(204,156),(134,160)],P['lime'])               # head
    mline(d,[(140,140),(196,140)],2,.5); eye(d,176,128,5); mline(d,[(168,124),(186,124)],3)   # sleepy lid
    mline(d,[(132,116),(166,92),(204,116)],6,col=P['pink']); shape(d,[(124,118),(144,116),(144,140),(126,142)],P['pink'],w=4)   # headphones
    mtext(d,(70,106),'♪',22,INK); mtext(d,(40,118),'♪',16,INK)
    shape(d,[(40,170),(70,168),(72,198),(42,198)],P['gray'],w=3); mtext(d,(56,184),'beat',8,P['paper'],'mm')
    legs(d,(100,136),182,198,5); return im
# ---------------- RARE ----------------
def guru_gecko():
    im,d=canvas(230,220)
    shape(d,[(10,40),(120,40),(124,140),(8,140)],P['paper'],w=4)               # rented mansion behind
    shape(d,[(0,44),(66,6),(130,44)],P['red'],w=4)
    for x in (24,58,92): shape(d,[(x,60),(x+20,60),(x+20,86),(x,86)],P['blue'],w=3,j=.6)
    shape(d,[(16,96),(58,96),(58,112),(16,112)],P['yellow'],w=3); mtext(d,(37,104),'RENTED',9,INK,'mm')
    shape(d,[(90,110),(150,106),(156,184),(92,190)],P['orange'])               # body in a cheap blazer
    shape(d,[(92,112),(150,108),(148,150),(122,170),(96,150)],P['purple'],w=4); mtext(d,(122,132),'$',22,P['yellow'],'mm')
    mline(d,[(96,124),(40,150),(20,160)],8,col=P['orange'])                   # arms out wide
    mline(d,[(150,120),(200,96),(222,80)],8,col=P['orange'])
    shape(d,[(102,50),(168,48),(176,104),(100,106)],P['orange'])               # head
    eye(d,150,70,7); eye(d,124,72,6); shape(d,[(130,88),(166,86),(160,98),(136,98)],P['paper'],w=3)   # salesman grin
    shape(d,[(196,40),(226,38),(228,62),(198,64)],P['paper'],w=3); mtext(d,(212,51),'COURSE',8,INK,'mm')
    legs(d,(104,138),186,218,7); mline(d,[(150,150),(176,200),(160,210)],5,col=P['orange'])   # tail
    return im
def cancel_crow():
    im,d=canvas(220,220)
    shape(d,[(20,120),(50,110),(36,200),(8,190)],INK,w=4)                     # tail
    shape(d,[(40,90),(130,84),(136,180),(46,186)],'#2a2140')                  # body
    shape(d,[(50,100),(110,98),(96,160),(56,156)],INK,w=3)                    # wing
    shape(d,[(90,24),(150,22),(156,88),(92,92)],'#2a2140')                    # head
    shape(d,[(150,40),(196,54),(152,70)],P['gray'],w=4)                        # beak
    dot(d,132,44,7,P['red']); dot(d,134,44,3)
    mline(d,[(116,32),(142,38)],4,col=P['paper'])                              # angry brow
    for i in range(4):                                                         # stack of old screenshots
        y=110+i*10; shape(d,[(140,y),(200,y-4),(204,y+30),(142,y+34)],P['paper'],w=3,j=.8)
    mtext(d,(172,150),'2014',16,P['red'],'mm'); d.line((150,158,196,156),fill=INK,width=2); d.line((150,164,190,162),fill=INK,width=2)
    shape(d,[(128,120),(150,116),(152,136),(130,140)],INK,w=3)                 # claw grip
    legs(d,(76,106),182,214,5,P['gray']); return im
def pump_pug():
    im,d=canvas(220,200)
    shape(d,[(30,90),(140,84),(150,160),(26,164)],P['card'])                  # body
    shape(d,[(20,96),(34,80),(40,100)],P['card_dk'],w=4)                       # curly tail
    shape(d,[(110,40),(196,38),(204,116),(112,120)],P['card'])                 # big head
    shape(d,[(150,72),(200,70),(204,112),(150,114)],P['card_dk'],w=4)         # black muzzle
    shape(d,[(110,38),(124,22),(132,46)],P['card_dk'],w=4)
    for x in (148,180):                                                        # laser eyes
        dot(d,x,62,7,P['paper']); dot(d,x+2,62,3,P['red'])
        mline(d,[(x+4,62),(220,52 if x>150 else 46)],4,.3,P['red'])
    mline(d,[(166,96),(180,104),(194,96)],3)
    for x in (40,110):                                                         # diamond paws
        shape(d,[(x,158),(x+16,148),(x+32,158),(x+16,182)],'#9ae7ff',w=4,j=.5); mline(d,[(x+4,158),(x+28,158)],2)
    shape(d,[(0,20),(60,16),(62,44),(2,46)],P['red'],w=3); mtext(d,(31,31),'-90%',13,P['paper'],'mm')
    mline(d,[(18,64),(40,48),(52,60),(64,40)],4,col=P['red'])
    return im
# ---------------- EPIC ----------------
def hype_hydra():
    im,d=canvas(230,230)
    shape(d,[(30,140),(150,130),(160,210),(26,216)],P['purple'])              # body
    for x in (40,80,120): mline(d,[(x,140),(x+12,124)],4,col=P['pink'])       # spines
    shape(d,[(6,180),(30,160),(24,200)],P['purple'],w=4)
    heads=[((60,140),(40,40),'STREAM'),((110,134),(110,10),'REACT'),((150,140),(180,50),'REPOST')]
    for (bx,by),(hx,hy),lab in heads:
        mline(d,[(bx,by),((bx+hx)/2-6,(by+hy)/2),(hx+20,hy+40)],16); mline(d,[(bx,by),((bx+hx)/2-6,(by+hy)/2),(hx+20,hy+40)],9,col=P['purple'])
        shape(d,[(hx,hy),(hx+44,hy-2),(hx+48,hy+36),(hx+2,hy+40)],P['purple'])
        shape(d,[(hx+40,hy+14),(hx+52,hy+20),(hx+40,hy+28)],P['paper'],w=3)
        eye(d,hx+30,hy+12,5)
    shape(d,[(16,30),(36,30),(36,44),(16,44)],P['red'],w=3); mtext(d,(26,37),'LIVE',7,P['paper'],'mm')   # stream head: LIVE tag
    shape(d,[(114,14),(130,4),(132,24)],P['yellow'],w=2); mtext(d,(124,58),'OMG',12,P['yellow'],'mm')  # react head: gasp
    shape(d,[(206,44),(226,44),(226,64),(206,64)],P['lime'],w=3); mtext(d,(216,54),'↻',14,INK,'mm')       # repost head
    for x in (40,120): shape(d,[(x,206),(x+34,204),(x+36,222),(x-2,222)],P['purple'],w=4)
    mtext(d,(70,170),'x3',22,P['yellow']); return im
def clout_kraken():
    im,d=canvas(240,230)
    import math
    for i in range(8):                                                         # 8 arms each with a phone
        a=math.pi*(0.95+i*0.15); x1=120+100*math.cos(a)*-1 if False else 120+96*math.cos(math.pi+i*math.pi/7.0); y1=150+60*math.sin(i*math.pi/7.0)+(20 if i in (0,7) else 0)
        mline(d,[(120,130),((120+x1)/2,(130+y1)/2+18),(x1,y1)],13); mline(d,[(120,130),((120+x1)/2,(130+y1)/2+18),(x1,y1)],7,col=P['pink'])
        shape(d,[(x1-9,y1-26),(x1+9,y1-26),(x1+9,y1+2),(x1-9,y1+2)],INK,w=3,j=.5); d.rectangle((x1-6,y1-22,x1+6,y1-2),fill=[P['blue'],P['lime'],P['yellow']][i%3])
    shape(d,[(70,40),(170,36),(180,130),(64,134)],P['pink'])                  # mantle
    shape(d,[(76,30),(120,0),(166,32)],P['pink'])
    eye(d,140,82,10); eye(d,104,84,8)
    shape(d,[(110,104),(150,104),(140,116),(118,116)],INK,w=3)
    shape(d,[(84,46),(156,44),(158,64),(86,66)],P['paper'],w=3); mtext(d,(121,55),'+FOLLOW',12,P['blue'],'mm')
    return im
# ---------------- LEGENDARY ----------------
def final_boss_boomer():
    im,d=canvas(240,240)
    shape(d,[(20,90),(110,70),(130,200),(20,210)],P['card_dk'])               # recliner back
    shape(d,[(20,150),(180,146),(186,206),(16,212)],P['card_dk'])             # seat
    shape(d,[(176,170),(236,180),(236,200),(180,204)],P['card_dk'],w=4)        # footrest kicked out
    mline(d,[(40,212),(36,236)],7); mline(d,[(160,206),(166,236)],7)
    shape(d,[(46,90),(140,84),(150,160),(50,168)],P['blue'])                  # cardigan torso, huge
    shape(d,[(96,92),(140,88),(146,150),(106,154)],P['paper'],w=3)            # undershirt
    for y in (104,124,144): dot(d,100,y,3)
    shape(d,[(130,150),(200,158),(200,176),(130,174)],P['card'],w=4)           # legs (khakis)
    shape(d,[(196,150),(222,152),(224,180),(198,178)],P['paper'],w=4)          # white sneakers
    shape(d,[(80,20),(150,16),(158,86),(84,90)],SKIN)                          # big head
    shape(d,[(78,14),(110,0),(152,14),(150,28),(82,30)],P['silver'],w=3)       # comb-over
    for x in (104,138): shape(d,[(x-12,40),(x+12,40),(x+12,58),(x-12,58)],P['paper'],w=3,j=.4); dot(d,x+2,49,3)   # reading glasses
    mline(d,[(116,48),(126,48)],3)
    shape(d,[(110,66),(150,64),(154,80),(112,82)],P['silver'],w=3); mline(d,[(118,76),(146,74)],3)   # mustache + frown
    shape(d,[(140,104),(184,92),(188,104),(144,118)],P['blue'],w=4)            # arm out
    shape(d,[(182,82),(216,76),(220,98),(186,104)],INK,w=3)                    # TV remote
    for x in (192,200,208): dot(d,x,90,2,[P['red'],P['lime'],P['yellow']][(x-192)//8])
    shape(d,[(2,26),(66,22),(68,74),(4,78)],P['paper'],w=3); mtext(d,(35,38),'BACK IN',12,INK,'mm'); mtext(d,(35,60),'MY DAY',12,INK,'mm')
    return im

# id: (fn, rarity, TYPE, lore line1, lore line2)  — ids/types/rarities from docs/cards_batch2_stats.md
CARDS={
 'vapebat':(vapebat,'C','GALE','Blue raspberry +','bad decisions.'),
 'hustle_hamster':(hustle_hamster,'C','NEUTRAL','6 side hustles.','Profit: negative.'),
 'thirst_trout':(thirst_trout,'C','GALE','Posts at 2 AM.','Deletes at 2:05.'),
 'mukbang_mole':(mukbang_mole,'C','STONE','Eats on camera','so you don\'t have to.'),
 'copypasta_cat':(copypasta_cat,'C','NEUTRAL','Never had an','original thought.'),
 'reply_guy_rat':(reply_guy_rat,'C','STONE','"Well actually..."','is his personality.'),
 'filter_frog':(filter_frog,'C','GALE','Looks nothing like','this in person.'),
 'burner_beetle':(burner_beetle,'C','EMBER','Has 14 accounts.','All defend itself.'),
 'streak_snail':(streak_snail,'U','STONE','400 days, no miss.','No joy either.'),
 'merch_moth':(merch_moth,'U','EMBER','Drop is live.','Quality is not.'),
 'podcast_parrot':(podcast_parrot,'U','GALE','Just asking...','for three hours.'),
 'prankster_possum':(prankster_possum,'U','NEUTRAL','"It\'s just a prank!"','(It was not.)'),
 'reaction_raccoon':(reaction_raccoon,'U','EMBER','Watches your video.','Earns more than you.'),
 'lo_fi_lizard':(lo_fi_lizard,'U','STONE','Beats to study','and lose to.'),
 'guru_gecko':(guru_gecko,'R','EMBER','Sells a course on','selling courses.'),
 'cancel_crow':(cancel_crow,'R','GALE','Found your post','from 2014.'),
 'pump_pug':(pump_pug,'R','STONE','To the moon. Moon','is down 90%.'),
 'hype_hydra':(hype_hydra,'E','EMBER','Cut one off, two','collabs grow back.'),
 'clout_kraken':(clout_kraken,'E','NEUTRAL','Follows everyone.','Follows back no one.'),
 'final_boss_boomer':(final_boss_boomer,'L','STONE','Doesn\'t know what','this is. Still wins.'),
}
NAMES={'lo_fi_lizard':'LO-FI LIZARD'}
def fsize(d,s,maxw,start):
    n=start
    while n>8 and d.textlength(s,font=F(n))>maxw: n-=1
    return n
def draw(key):
    RB.seed(99); return CARDS[key][0]()
def fighter(key,frame,size):
    RB.seed(99); R.seed(2000+frame*17+len(key)); return fit(CARDS[key][0](),size)
def card(key):
    """Same layout as gen_style2.card_full (180x252 drawn, downscaled to 120x168), rarity rim C gray/U green/R blue/E purple/L gold foil."""
    fn,r,typ,l1,l2=CARDS[key]; rname,rim=RARITY[r]; RB.seed(99); R.seed(4); im,d=canvas(180,252)
    shape(d,[(4,4),(176,6),(175,248),(5,246)],rim,w=5,j=1.5)
    if r=='L':
        for i in range(-40,260,36): d.line((i-60,252,i,0),fill='#fffbe6',width=8); d.line((i-48,252,i+12,0),fill='#b8860b',width=3)
    shape(d,[(14,40),(166,42),(164,150),(16,148)],PAL['card'],w=4,j=1)
    RB.seed(99); art=fn(); art=art.crop(art.getbbox()); k=min(140/art.width,100/art.height)
    art=art.resize((int(art.width*k),int(art.height*k)),Image.LANCZOS); im.alpha_composite(art,(90-art.width//2,146-art.height))
    name=NAMES.get(key,key.replace('_',' ').upper())
    shape(d,[(12,12),(140,10),(142,36),(14,38)],PAL['paper'],w=4,j=1); mtext(d,(77,24),name,fsize(d,name,118,15),INK,'mm')
    shape(d,[(158,6),(174,22),(158,40),(142,22)],rim,w=4,j=1); mtext(d,(158,23),r,18,PAL['paper'] if r!='L' else INK,'mm')
    shape(d,[(14,158),(166,160),(164,236),(16,234)],PAL['paper'],w=4,j=1)
    mtext(d,(22,163),f'{typ} · {rname}',14,PAL['red'])
    for y,l in ((184,l1),(208,l2)): mtext(d,(22,y),l,fsize(d,l,136,17))
    return im.resize((120,168),Image.LANCZOS)
def art_cutout(key):
    RB.seed(99); R.seed(4); a=CARDS[key][0](); a=a.crop(a.getbbox())
    x,y,w,h=ART_WIN; k=min((w-4)/a.width,(h-4)/a.height); a=a.resize((max(1,int(a.width*k)),max(1,int(a.height*k))),Image.LANCZOS)
    out=Image.new('RGBA',(w,h),(0,0,0,0)); out.alpha_composite(a,((w-a.width)//2,h-2-a.height)); return out
if __name__=='__main__':
    os.makedirs(f'{HERE}/cards/art',exist_ok=True); cards={}
    for k in CARDS:
        for f in range(3):
            fighter(k,f,96).save(f'{HERE}/fighters/{k}_96_f{f}.png'); fighter(k,f,48).save(f'{HERE}/fighters/{k}_48_f{f}.png')
        cards[k]=card(k); cards[k].save(f'{HERE}/cards/card_{k}_120x168.png'); art_cutout(k).save(f'{HERE}/cards/art/{k}_art_99x70.png')
    W=10*136+20; S=cardboard(W,980,seed=44); d=ImageDraw.Draw(S); mtext(d,(16,6),'STYLE 2 — CARDS BATCH 2 (v0.4.3)  C,U,R,E,L order · fighters face right',28)
    for i,k in enumerate(CARDS):
        c,rw=i%10,i//10; S.alpha_composite(cards[k],(20+c*136,56+rw*180))
        S.alpha_composite(fighter(k,0,96),(20+c*136,440+rw*250)); S.alpha_composite(fighter(k,0,48),(84+c*136,540+rw*250))
        mtext(d,(20+c*136,592+rw*250),k,11)
    S.convert('RGB').save(f'{HERE}/batch2_preview.png')
# ---------- overworld map markers (same format as gen_style2: single 48x48 RGBA, = fighter f0 at 48, facing right) ----------
def build_maps():
    from gen_style2 import t_grass
    for k in CARDS: fighter(k,0,48).save(f'{HERE}/overworld/{k}_map_48.png')
    S=cardboard(10*64+16,2*84+50,seed=45); d=ImageDraw.Draw(S); mtext(d,(8,4),'BATCH 2 — overworld/<id>_map_48.png (on grass tile)',18)
    for i,k in enumerate(CARDS):
        x,y=8+(i%10)*64,34+(i//10)*84; S.alpha_composite(t_grass(),(x,y)); S.alpha_composite(Image.open(f'{HERE}/overworld/{k}_map_48.png'),(x,y))
        mtext(d,(x,y+50),k[:12],9)
    S=S.resize((S.width*2,S.height*2),Image.NEAREST); S.convert('RGB').save(f'{HERE}/overworld_batch2_preview.png')
if __name__=='__main__': build_maps()
