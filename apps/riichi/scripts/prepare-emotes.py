"""Slice approved 3x3 sheets, preserving RGBA; remove only near-invisible edge noise."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]/'public/art/emotes'
names=['happy','angry','crying','surprised','thinking','sorry','victory','speechless','playful']
manifest={}
for character in ['yellow','king','wizard','ninja']:
    source=Image.open(root.parents[2]/'assets/emote-masters'/f'{character}.png').convert('RGBA')
    out=root/character;out.mkdir(exist_ok=True)
    files=[]
    for index,name in enumerate(names):
        col,row=index%3,index//3
        cell=source.crop((col*source.width//3,row*source.height//3,(col+1)*source.width//3,(row+1)*source.height//3))
        alpha=cell.getchannel('A').point(lambda a:0 if a<12 else a)
        cell.putalpha(alpha)
        bounds=alpha.getbbox()
        if not bounds:raise ValueError('Empty emote')
        cell=cell.crop(bounds)
        cell.thumbnail((176,176),Image.Resampling.LANCZOS)
        canvas=Image.new('RGBA',(192,192));canvas.alpha_composite(cell,((192-cell.width)//2,(192-cell.height)//2))
        canvas.save(out/f'{index}.webp',lossless=True,method=6)
        files.append({'id':name,'url':f'/art/emotes/{character}/{index}.webp'})
    manifest[character]=files
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
