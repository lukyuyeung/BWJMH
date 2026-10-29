"""Build a self-contained SVG art master and individual complete tile assets."""
from pathlib import Path
import base64,json
from PIL import Image
root=Path(__file__).resolve().parents[1]/'public/art/tiles';out=root/'complete';out.mkdir(exist_ok=True)
def data(p):return ('data:image/svg+xml;base64,' if p.suffix=='.svg' else 'data:image/png;base64,')+base64.b64encode(p.read_bytes()).decode()
back=Image.open(root.parent/'v5/TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png')
w,h=back.size;back.crop((round(184/1536*w),round(122/1024*h),round(526/1536*w),round(522/1024*h))).save(out/'back-material.png')
def tile(name):
 isback=name=='back';url=data(out/'back-material.png' if isback else (root/'faces'/f'{name}.svg' if name.endswith('-red') and (root/'faces'/f'{name}.svg').exists() else root/'faces'/f'{name}.png'))
 return f'''<g aria-label="{name}"><rect x="2" y="20" width="184" height="256" rx="15" fill="url(#side)" stroke="#5d492c" stroke-width="2"/><rect x="3" y="15" width="182" height="251" rx="14" fill="#171519" stroke="url(#gold)" stroke-width="3"/><rect x="2" y="2" width="184" height="254" rx="15" fill="url(#ivory)" stroke="#c4a679" stroke-width="2"/><g clip-path="url(#face)"><image href="{url}" x="7" y="7" width="174" height="244" preserveAspectRatio="none"/></g><rect x="7" y="7" width="174" height="244" rx="11" fill="none" stroke="{'url(#gold)' if isback else '#e0cfad'}" stroke-width="1.5"/><path d="M17 4H171" stroke="#fffdf2" stroke-width="2" opacity=".8"/></g>'''
defs='''<defs><linearGradient id="ivory" x2=".7" y2="1"><stop stop-color="#fffbed"/><stop offset="1" stop-color="#e4d2af"/></linearGradient><linearGradient id="side" x2="0" y2="1"><stop stop-color="#e9d7b5"/><stop offset=".6" stop-color="#baa27b"/><stop offset="1" stop-color="#f5e4c6"/></linearGradient><linearGradient id="gold"><stop stop-color="#735229"/><stop offset=".4" stop-color="#efd18e"/><stop offset="1" stop-color="#96703b"/></linearGradient><clipPath id="face"><rect x="7" y="7" width="174" height="244" rx="11"/></clipPath></defs>'''
names=[f'{i}{s}' for s in 'mps' for i in range(1,10)]+list('ESWNPFC')+['5m-red','5p-red','5s-red','back']
for n in names:(out/f'{n}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="188" height="278" viewBox="0 0 188 278">{defs}{tile(n)}</svg>')
master=f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1600" viewBox="0 0 1920 1600" style="max-width:100%;height:auto"><title>Bunny Gala — Complete Mahjong Art Master</title>{defs}<rect width="1920" height="1600" fill="#073c34"/><text x="40" y="60" fill="#ead29e" font-family="sans-serif" font-size="30">BUNNY GALA · MAHJONG ART MASTER · 34 + 3 RED FIVES + BACK</text>'
for i,n in enumerate(names):
 x=40+(i%10)*188;y=100+(i//10)*365;master+=f'<g transform="translate({x} {y}) scale(.92)">{tile(n)}<text x="94" y="310" text-anchor="middle" fill="#ead29e" font-family="sans-serif" font-size="20">{n}</text></g>'
master+='</svg>';(out/'bunny-gala-mahjong-master.svg').write_text(master)
(out/'manifest.json').write_text(json.dumps({'version':1,'tiles':names,'master':'bunny-gala-mahjong-master.svg','gameFaceSafeArea':[.04,.04,.96,.96],'source':'lukyuyeung/BWJMH codex/clear-table-scene'},indent=2))
print('Complete self-contained master and 38 individual SVG tiles built.')
