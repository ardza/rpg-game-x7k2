#!/usr/bin/env python3
"""Starter concepts (working names). Run: python3 gen_concepts.py"""
import sys, os
sys.path.insert(0,'/workspace/rpg/assets/style-test')
from gen_sprites import Pen, C, O
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__))

from gen_sprites import kitewisp as starter_a, kitewisp_late as starter_a_late, brazzle as starter_b, brazzle_late as starter_b_late, lofton as starter_c, lofton_late as starter_c_late
S=[('starter_a','Gale',starter_a,starter_a_late),('starter_b','Ember',starter_b,starter_b_late),('starter_c','Stone',starter_c,starter_c_late)]
def silhouette(im):
    s=Image.new('RGBA',im.size,(0,0,0,0)); m=im.split()[3]; s.paste(Image.new('RGBA',im.size,C['dblue']),mask=m); return s
def main():
    W=3*84+8; sheet=Image.new('RGBA',(W,170),C['gray']); d=ImageDraw.Draw(sheet)
    for i,(n,el,fn,late) in enumerate(S):
        p=Pen(64); fn(p); p.im.save(f'{HERE}/{n}_front_64.png')
        q=Pen(64); late(q)
        x=8+i*84; sheet.alpha_composite(p.im,(x,8))
        d.text((x,76),f'{n}\n{el}',fill=C['out'])
        sheet.alpha_composite(silhouette(q.im),(x,100)); d.text((x+40,150),'later',fill=C['white'])
    sheet.resize((W*3,170*3),Image.NEAREST).save(f'{HERE}/starters_concept_sheet.png')
if __name__=='__main__': main()
