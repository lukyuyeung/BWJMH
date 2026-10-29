"""Normalize original red-five glyph geometry through SVG transforms; never redraw source art."""
from pathlib import Path
from PIL import Image
import json,base64,re
root=Path(__file__).resolve().parents[1]/'public/art/tiles'
report={}
def bbox(path,red):
 im=Image.open(path).convert('RGB');points=[]
 for y in range(im.height):
  for x in range(im.width):
   r,g,b=im.getpixel((x,y));ink=r>g*1.35 and r>b*1.2 and g<145 if red else min(r,g,b)<100
   if ink:points.append((x,y))
 return [min(x for x,y in points),min(y for x,y in points),max(x for x,y in points)+1,max(y for x,y in points)+1]
for suit in 'mps':
 name='5'+suit;source=root/'faces'/(name+'-red.png');target=bbox(root/'faces'/(name+'.png'),False);original=bbox(source,True)
 sx=(target[2]-target[0])/(original[2]-original[0]);sy=(target[3]-target[1])/(original[3]-original[1]);tx=target[0]-original[0]*sx;ty=target[1]-original[1]*sy
 raw='data:image/png;base64,'+base64.b64encode(source.read_bytes()).decode()
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="352" height="480" viewBox="0 0 352 480"><rect width="352" height="480" fill="#fff3d9"/><image href="{raw}" width="352" height="480" transform="translate({tx:.6f} {ty:.6f}) scale({sx:.6f} {sy:.6f})"/></svg>'
 (root/'faces'/(name+'-red.svg')).write_text(svg)
 encoded='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
 for file in [root/'complete'/(name+'-red.svg'),root/'complete/bunny-gala-mahjong-master.svg']:
  content=file.read_text();# Handle a previous normalized build as well as the original PNG embed.
  if file.stem==name+'-red':content=re.sub(r'(<image href=")[^"]+',lambda m:m.group(1)+encoded,content,count=1)
  else:
   pattern=r'(<g aria-label="'+name+r'-red">.*?<image href=")[^"]+'
   content=re.sub(pattern,lambda m:m.group(1)+encoded,content,count=1)
  file.write_text(content)
 report[name]={'originalBounds':original,'targetBounds':target,'scale':[sx,sy],'translate':[tx,ty]}
(root/'faces/red-five-normalization.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
