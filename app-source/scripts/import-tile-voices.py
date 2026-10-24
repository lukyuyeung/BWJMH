import json,hashlib,urllib.request,concurrent.futures,wave,subprocess
from pathlib import Path
import numpy as np
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--manifest',type=Path,default=Path('docs/tile-voice-sources.json'));parser.add_argument('--cache',type=Path,required=True);parser.add_argument('--output',type=Path,default=Path('public/audio'));args=parser.parse_args()
info=json.loads(args.manifest.read_text());root=args.cache;root.mkdir(parents=True,exist_ok=True)
out=args.output;manifest=json.loads((out/'manifest.json').read_text())
def run(item):
 name=item['path'].split('/')[-1];local=root/name
 if not local.exists():
  data=urllib.request.urlopen('https://raw.githubusercontent.com/lukyuyeung/BWJMH/'+info['sha']+'/'+item['path'],timeout=60).read()
  assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==item['sha'],name
  local.write_bytes(data)
 data=local.read_bytes();assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==item['sha']
 event,role=local.stem.rsplit('_',1);target=out/'voices'/role/(event+'.mp3');target.parent.mkdir(exist_ok=True)
 with wave.open(str(local)) as w:
  rate=w.getframerate();assert w.getsampwidth()==2
  pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(np.float32)/32768
  peak=np.max(np.abs(pcm),axis=1);active=np.flatnonzero(peak>max(.0002,float(peak.max())*.006));cut=max(0,float(active[0])/rate-.02) if active.size else 0
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(local),'-af',f'atrim=start={cut:.6f},asetpts=PTS-STARTPTS','-ar','44100','-codec:a','libmp3lame','-b:a','64k',str(target)],check=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(target)]))
 return role,event,'/audio/voices/'+role+'/'+event+'.mp3?v=tiles61',cut,duration
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(run,info['files']))
for role,event,url,cut,duration in results:
 manifest['voices'][role][event]=url;manifest['durations'][url]=round(duration,3);manifest['trimmedLeadSeconds'][url]=round(cut,4)
manifest['tileVoicesSourceCommit']=info['sha'];(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(root/'source-manifest.json').write_text(json.dumps(info,indent=2));print('Verified and encoded',len(results),'tile-name voices; roles',{r:sum(role==r for role,*_ in results) for r in ['yellow','king','ninja','wizard']})
