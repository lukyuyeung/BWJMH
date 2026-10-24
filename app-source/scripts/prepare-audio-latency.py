"""Build public MP3 delivery copies; originals are never edited.

Use --new-source for the SHA-verified GitHub WAV directory and --yaku-source
for the earlier repaired WAVs, after public release is authorized.
"""
from pathlib import Path
import argparse, json, subprocess, wave
from concurrent.futures import ThreadPoolExecutor
import numpy as np

parser=argparse.ArgumentParser()
parser.add_argument('--new-source',type=Path,required=True)
parser.add_argument('--yaku-source',type=Path,required=True)
parser.add_argument('--output',type=Path,default=Path('public/audio'))
parser.add_argument('--cache-version',default='onset2')
args=parser.parse_args()
source_manifest=args.new_source/'source-manifest.json'
source_commit=json.loads(source_manifest.read_text())['sha'] if source_manifest.exists() else 'ced9c6edeec452f1d5e6c51fa8bffac7728f02be'
manifest={'version':3,'sourceCommit':source_commit,'music':{},'sfx':{},'voices':{},'durations':{},'trimmedLeadSeconds':{}}
jobs=[]
for source in sorted(args.new_source.rglob('*.wav')):
 rel=source.relative_to(args.new_source).with_suffix('.mp3');jobs.append((source,rel,rel.parts[0]!='music'))
for source in sorted(args.yaku_source.glob('*.wav')):
 event,role=source.stem.rsplit('_',1);event=event.replace('_','-')
 if event=='yaku-riichi':event='yaku-riichi-yaku'
 jobs.append((source,Path('voices')/role/(event+'.mp3'),True))

def process(job):
 source,rel,trim=job;cut=0.
 if trim:
  with wave.open(str(source)) as w:
   assert w.getsampwidth()==2,source
   rate=w.getframerate();data=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(np.float32)/32768
   peak=np.max(np.abs(data),axis=1);threshold=max(.0002,float(peak.max())*(.006 if rel.parts[0]=='voices' else .02))
   active=np.flatnonzero(peak>threshold)
   if active.size:cut=max(0,float(active[0])/rate-(.020 if rel.parts[0]=='voices' else .008))
 target=args.output/rel;target.parent.mkdir(parents=True,exist_ok=True)
 command=['ffmpeg','-v','error','-y','-i',str(source)]
 if cut>0:command+=['-af',f'atrim=start={cut:.6f},asetpts=PTS-STARTPTS']
 command+=['-ar','44100','-codec:a','libmp3lame','-b:a','128k' if rel.parts[0]=='music' else '64k',str(target)]
 subprocess.run(command,check=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(target)],text=True))
 return rel,cut,duration
with ThreadPoolExecutor(max_workers=6) as pool:
 results=list(pool.map(process,jobs))
for rel,cut,duration in results:
 url='/audio/'+rel.as_posix()+'?v='+args.cache_version
 if rel.parts[0]=='music':manifest['music'][rel.stem.removeprefix('bgm_')]=url
 elif rel.parts[0]=='sfx':manifest['sfx'][rel.stem.removeprefix('sfx_')]=url
 elif rel.stem.startswith('vo_'):
  _,role,event=rel.stem.split('_',2);manifest['voices'].setdefault(role,{})[event]=url
 else:manifest['voices'].setdefault(rel.parts[1],{})[rel.stem]=url
 manifest['durations'][url]=round(duration,3);manifest['trimmedLeadSeconds'][url]=round(cut,4)
(args.output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Built',len(results),'files;',sum(cut>0 for _,cut,_ in results),'with trimmed leading silence')
for rel,cut,_ in results:
 if rel.stem in ['sfx_tile_discard','sfx_tile_draw','sfx_ui_click','vo_yellow_pon']:print(rel,'trimmed',round(cut,4),'seconds')
