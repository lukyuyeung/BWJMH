"""List the UI image dependencies used by the game. Movies/audio stream separately."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]/'public'
urls=set()
def add(path):
 p=root/path.lstrip('/')
 if p.exists():urls.add('/'+path.lstrip('/'))
for face in [str(n)+s for s in 'mps' for n in range(1,10)]+list('ESWNPFC')+['5m-red','5p-red','5s-red','back']:
 for group in ['faces','complete']:
  file=face+('.svg' if group=='complete' or face.endswith('-red') else '.png')
  if face=='back' and group=='faces':continue
  add('art/tiles/'+group+'/'+file)
for directory in ['art/ribbon-v2','art/results/digits','art/results/limits','art/results/rankings']:
 for p in (root/directory).rglob('*'):
  if p.suffix.lower() in ['.png','.svg','.webp']:add(p.relative_to(root).as_posix())
for group in ['buttons','badges','menu','icons','digits','rank-nameplates','ranks','banners']:
 for p in (root/'art/library-v1'/group).rglob('*.svg'):add(p.relative_to(root).as_posix())
 # ActionArt uses PNGs, not the SVG versions.
 if group in ['buttons','banners','rank-nameplates','ranks']:
  for p in (root/'art/library-v1'/group).rglob('*.png'):add(p.relative_to(root).as_posix())
for name in ['yellow','king','ninja','wizard']:
 for kind in ['avatar','presentation']:add('art/results/'+name+'-'+kind+'.png')
for name in ['art/v5/CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png','art/v5/CHARACTER_KING_MASTER.jpeg','art/v5/CHARACTER_NINJA_MASTER.jpeg','art/v5/CHARACTER_WIZARD_MASTER.jpeg','art/results/gala-result-backdrop.png','art/table/rose-gold-v1/table-master.png','art/v5/TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png','art/v5/TABLE_MATERIAL_MASTER__NOT_GEOMETRY.png','art/update-26/carrot-riichi.png','art/library-v1/motion/neutral/win-burst.webp']:add(name)
# Share the exact cache keys used by the table renderer.
urls=[url+('?art=red-size-v2' if any(n+'-red.svg' in url for n in ['5m','5p','5s']) else '?art=vertical-v2' if '/2s.' in url else '') for url in sorted(urls)]
(root/'startup-assets.json').write_text(json.dumps(urls,indent=2))
print('Startup images:',len(urls),'bytes:',sum((root/url.split('?')[0].lstrip('/')).stat().st_size for url in urls))
