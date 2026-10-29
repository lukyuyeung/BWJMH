"""Extract approved atlas cells for the shared DOM/WebGL tile faces.
Source: lukyuyeung/BWJMH, codex/clear-table-scene, client/public/art/tiles.
Keep these original atlases unchanged; never redraw the tile symbols.
"""
from pathlib import Path
import sys
from PIL import Image
root=Path(__file__).resolve().parents[1]/'public/art/tiles'
out=root/'faces';out.mkdir(exist_ok=True)
images={k:Image.open(root/n).convert('RGBA') for k,n in {'m':'characters-atlas.png','p':'circles-atlas.png','s':'bamboo-atlas.png','honors':'honors-red-atlas.png','peacock':'peacock-1s.png'}.items()}
faces=[f'{n}{s}' for s in 'mps' for n in range(1,10)]+list('ESWNPFC')
for face,red in [(f,False) for f in faces]+[(f'5{s}',True) for s in 'mps']:
    if len(sys.argv)>1 and face not in sys.argv[1:]: continue
    if face=='2s' and not red:
        Image.open(root/'overrides/2s-approved.png').convert('RGB').resize((352,480),Image.Resampling.LANCZOS).save(out/'2s.png',optimize=True)
        continue
    canvas=Image.new('RGBA',(352,480),'#fff3d9')
    if face=='1s':
        im=images['peacock'].resize((302,424),Image.Resampling.LANCZOS);canvas.alpha_composite(im,(25,28))
    else:
        inset=0
        if red: source,cols,rows,col,row='honors',5,2,2+'mps'.index(face[1]),1
        elif face in 'ESWNPFC':
            i='ESWNPFC'.index(face);source,cols,rows,col,row='honors',5,2,i if i<5 else i-5,0 if i<5 else 1
        else:
            i=int(face[0])-1;source,cols,rows,col,row=face[1],3,3,i%3,i//3;inset=.16 if face=='2s' else 0
        im=images[source];w,h=im.width/cols,im.height/rows
        cell=im.crop((round((col+inset)*w),round(row*h),round((col+1-inset)*w),round((row+1)*h))).resize((336,464),Image.Resampling.LANCZOS)
        # Remove the atlas paper colour so no rectangular patch remains.
        pixels=list(cell.getdata())
        cell.putdata([(r,g,b,0 if r>180 and g>155 and b>105 and r>=g>=b else a) for r,g,b,a in pixels])
        canvas.alpha_composite(cell,(8,8))
    # Keep artwork inside a consistent 4% enamel margin, away from the bevel.
    inset=Image.new('RGBA',(352,480),'#fff3d9')
    inset.alpha_composite(canvas.resize((324,442),Image.Resampling.LANCZOS),(14,19))
    canvas=inset
    canvas.convert('RGB').save(out/(face+('-red' if red else '')+'.png'),optimize=True)
print('Extracted 34 faces and 3 red fives from the approved original artwork.')
