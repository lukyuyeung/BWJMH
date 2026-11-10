import {AUDIO_CATALOG} from './audio-catalog.js?v=card-reveal-v1';
const TRACKS=Object.fromEntries(AUDIO_CATALOG.tracks.map(t=>[t.id,t]));
const LEVELS={intro:.8,lobby:.5,bgm_main:.6,bgm_bonus:.6,card_shuffle:.7,reel_spin:.6,reel_stop:.7,bet_change:.6,turbo_spin:.6,auto_spin:.6,no_win:.5,win_normal:.7,win_countup:.6,coins:.6,golden_card:.8,golden_eliminate:.8,little_joker:.7,big_joker:.8,cascade:.7,multiplier:.8,scatter:.7,scatter_near:.7,freespin_trigger:.9,freespin_retrigger:.8,freespin_bigwin:.9,freespin_result:.7,return_base:.6,win_big:.8,mega_win:.9,ultimate_win:1,jackpot:1,paytable_open:.6,settings_open:.6,pause:.6,quit:.6,no_coins:.7,buy_bonus:.8};
const MUSIC_CUES=new Set(['intro','win_normal','win_big','mega_win','ultimate_win','jackpot','freespin_bigwin']);
const GAME_CUES=new Set(['win_normal','win_big','mega_win','ultimate_win','jackpot','freespin_bigwin','freespin_trigger','freespin_retrigger','freespin_result','reel_spin','scatter_near','golden_eliminate','little_joker','big_joker']);
export function winSound(ratio){return ratio>1000?'jackpot':ratio>=100?'ultimate_win':ratio>=20?'mega_win':ratio>=5?'win_big':'win_normal'}
/** Independent audio clock, RNG and network: callers never await sound to play a round. */
export function createGameMusic({enabled=true,storage=null}={}){
 let prefs={musicEnabled:enabled,sfxEnabled:true,voiceEnabled:true,musicVolume:.6,sfxVolume:.7,voiceVolume:.9};
 try{prefs={...prefs,...JSON.parse(storage?.getItem('gala-audio-v2')||'null')}}catch{}
 const players={},bgNodes={},buffers=new Map(),loads=new Map(),queue=[],voices=new Set(),history=[],lastCue=new Map(),stopVersions=new Map();
 let context,output,monitor,mode='lobby',roundActive=false,roundWinPlayed=false,rewardPlayed=false,lastWinningTier=-1,plannedRatio=0,currentFree=false,introCompleted=false,started=false,unlocked=false,mediaUnlocked=false,silentSession=false,paused=false,failed=false,fadeFrame=0,loading=0,warmPromise,warming=false,pauseTimer,generation=0,previewVersion=0,lastVoiceRound=-1,round=0,anticipation=false,lastMultiplier=1;
 const log=(kind,id,extra={})=>{history.push({kind,id,at:performance.now(),round,...extra});if(history.length>1200)history.splice(0,history.length-1200)};
 const save=()=>{try{storage?.setItem('gala-audio-v2',JSON.stringify(prefs))}catch{}};
 function audioContext(){if(!context){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(C){context=new C();output=context.createDynamicsCompressor();output.threshold.value=-6;output.knee.value=8;output.ratio.value=12;output.attack.value=.003;output.release.value=.12;output.connect(context.destination)}}return context}
 function drain(){while(loading<2&&queue.length){const job=queue.shift();loading++;job.run().finally(()=>{loading--;drain()})}}
 function load(id,urgent=false){
  if(buffers.has(id))return Promise.resolve(buffers.get(id));
  if(loads.has(id)){if(urgent){const i=queue.findIndex(j=>j.id===id);if(i>0)queue.unshift(...queue.splice(i,1))}return loads.get(id)}
  const track=TRACKS[id];if(!track)return Promise.reject(new Error('Missing audio '+id));
  const promise=new Promise((resolve,reject)=>{const job={id,run:async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const response=await fetch(track.src,{signal:controller.signal,priority:'low'});if(!response.ok)throw new Error('Audio HTTP '+response.status);const bytes=await response.arrayBuffer(),ctx=audioContext();if(!ctx)throw new Error('Web Audio unavailable');const buffer=await ctx.decodeAudioData(bytes);buffers.set(id,buffer);resolve(buffer)}catch(e){failed=true;loads.delete(id);log('load-failed',id);reject(e)}finally{clearTimeout(timer)}}};urgent?queue.unshift(job):queue.push(job);queueMicrotask(drain)});
  loads.set(id,promise);return promise;
 }
 function prepare(){if(warming)return warmPromise;warming=true;warmPromise=Promise.allSettled([...new Set(['reel_spin','win_normal','scatter_near','golden_eliminate','little_joker','big_joker',...GAME_CUES])].map(id=>load(id))).finally(()=>warming=false);return warmPromise}
 function bgPlayer(name){if(!players[name]){const id={base:'lobby',free:'bgm_bonus',lobby:'intro'}[name],a=new Audio();a.preload='none';a.loop=name!=='lobby';a.volume=0;a.src=TRACKS[id].src;const ctx=audioContext();if(ctx){const source=ctx.createMediaElementSource(a),gain=ctx.createGain();gain.gain.value=0;source.connect(gain);gain.connect(output);bgNodes[name]={source,gain};a.volume=1;}a.addEventListener('error',()=>{failed=true;log('load-failed',id)});if(name==='lobby')a.addEventListener('ended',()=>{introCompleted=true;if(mode==='lobby'){mode='base';playBgm()}});players[name]=a}return players[name]}
 function unlockMedia(){if(mediaUnlocked||!prefs.musicEnabled)return;mediaUnlocked=true;for(const name of ['lobby','base','free']){const a=bgPlayer(name);a.play().then(()=>{if(paused||!prefs.musicEnabled||name!==mode)a.pause()}).catch(()=>{})}}
 function bgVolume(name){return bgNodes[name]?.gain.gain.value??players[name]?.volume??0}
 function setBgVolume(name,value){if(bgNodes[name])bgNodes[name].gain.gain.value=value;else players[name].volume=value}
 function duck(){return [...voices].some(v=>v.bus==='music'&&v.duck)?.25:[...voices].some(v=>v.duck)?.6:1}
 function cueGain(id,bus){return prefs[bus+'Volume']*(LEVELS[id]??.8)*(bus==='sfx'?.7:bus==='music'?.75:1)}
 function fade(duration=1300){cancelAnimationFrame(fadeFrame);const start=performance.now(),from=Object.fromEntries(Object.entries(players).map(([n])=>[n,bgVolume(n)]));function tick(now){const t=Math.min(1,Math.max(0,(now-start)/duration));for(const[n,a]of Object.entries(players)){const target=prefs.musicEnabled&&!paused&&unlocked&&n===mode?prefs.musicVolume*.5*LEVELS[{base:'lobby',free:'bgm_bonus',lobby:'intro'}[n]]*duck():0;setBgVolume(n,Math.max(0,Math.min(1,(from[n]??0)+(target-(from[n]??0))*t)));if(t===1&&target===0)a.pause()}if(t<1)fadeFrame=requestAnimationFrame(tick)}fadeFrame=requestAnimationFrame(tick)}
 function playBgm(){if(silentSession||!unlocked||paused||!prefs.musicEnabled)return;const a=bgPlayer(mode);if(a.error)a.load();a.play().catch(()=>{});fade();log('bgm',mode)}
 function stopVoice(v,{natural=false}={}){if(!voices.has(v))return;voices.delete(v);clearTimeout(v.timer);v.source.onended=null;log(natural?'finished':'stopped',v.id,{elapsed:performance.now()-v.at,origin:v.origin});
  try{const now=context.currentTime,tail=v.bus==='music'?.35:.12;v.gain.gain.cancelScheduledValues(now);v.gain.gain.setValueAtTime(v.gain.gain.value,now);v.gain.gain.linearRampToValueAtTime(0,now+tail);v.source.stop(now+tail+.005)}catch{}
  setTimeout(()=>{v.source.disconnect();v.gain.disconnect()},365);v.onend?.();if(!roundActive&&!voices.size)playBgm();else if(v.duck)fade(450);
 }
 function stop(id){if(id)stopVersions.set(id,(stopVersions.get(id)||0)+1);else{generation++;previewVersion++}for(const v of [...voices])if(!id||v.id===id)stopVoice(v)}
 function cue(id,{priority=1,maxMs=0,deadline=180,force=false,onend,bus=MUSIC_CUES.has(id)?'music':'sfx',loop=false,detail={}}={}){
  if(!force&&!GAME_CUES.has(id)){log('suppressed',id);return}if(!force)maxMs=0;
  const token=generation,version=stopVersions.get(id)||0,requestedAt=performance.now(),setting=bus==='voice'?'voiceEnabled':bus==='music'?'musicEnabled':'sfxEnabled';log('event',id,{...detail,bus});
  if(!TRACKS[id]){log('missing',id);return}if(!unlocked||paused||!prefs[setting]){log('muted',id,{bus});return}
  const previous=lastCue.get(id)||-Infinity;if(id!=='reel_stop'&&requestedAt-previous<80)return;lastCue.set(id,requestedAt);
  function launch(buffer){if(token!==generation||version!==(stopVersions.get(id)||0)){log('cancelled',id);return}if(paused||!prefs[setting]||(!force&&performance.now()-requestedAt>deadline)){log('expired',id);return}
   const ctx=audioContext();if(!ctx){log('blocked',id);return}if(ctx.state!=='running'){ctx.resume().then(()=>{if(ctx.state==='running')launch(buffer);else log('blocked',id)}).catch(()=>{});return}
   const lane=id==='reel_spin'?'roll':bus;const group=[...voices].filter(v=>v.lane===lane),limit=lane==='sfx'?3:1;
   if(group.length>=limit){const candidate=group.sort((a,b)=>a.priority-b.priority||a.at-b.at)[0];if(candidate.priority>priority){log('limited',id);return}stopVoice(candidate)}
   const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=loop;gain.gain.value=Math.max(0,Math.min(1,cueGain(id,bus)));if(!force&&bus==='music'&&id!=='win_normal'){const target=gain.gain.value;gain.gain.value=0;gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(target,ctx.currentTime+.18)}source.connect(gain);gain.connect(output);
   const v={id,bus,lane,source,gain,priority,at:performance.now(),duck:bus==='voice'||priority>=3,origin:detail.origin,onend};voices.add(v);source.onended=()=>stopVoice(v,{natural:true});source.start();if(maxMs)v.timer=setTimeout(()=>stopVoice(v),maxMs);log('played',id,{...detail,bus,src:TRACKS[id].src,duration:buffer.duration,lag:v.at-requestedAt,activeSfx:[...voices].filter(x=>x.bus==='sfx').length});fade(120);
  }
  if(buffers.has(id))launch(buffers.get(id));else load(id,true).then(launch).catch(()=>{});
 }
 function configure(values){prefs={...prefs,...values};for(const k of ['musicVolume','sfxVolume','voiceVolume'])prefs[k]=Math.min(1,Math.max(0,Number(prefs[k])||0));for(const v of [...voices]){if(!prefs[v.bus+'Enabled'])stopVoice(v);else v.gain.gain.value=cueGain(v.id,v.bus)}save();if(prefs.musicEnabled){if(unlocked)unlockMedia();playBgm();}else fade()}
 function tryAutoplay(){if(silentSession||roundActive||paused||!prefs.musicEnabled)return;const ctx=audioContext(),a=bgPlayer(mode);if(!ctx)return;Promise.all([ctx.resume(),a.play()]).then(()=>{if(ctx.state==='running'){unlocked=true;playBgm()}}).catch(()=>a.pause())}
 function unlock({silent=false}={}){if(unlocked){if(!silent)unlockMedia();return}unlocked=true;silentSession=silent;if(!silent)unlockMedia();const ctx=audioContext();ctx?.resume().then(()=>{if(!silent)playBgm()}).catch(()=>{});prepare()}
 function startRound(free,{shuffle=true,total=0,bet=1}={}){silentSession=false;roundActive=true;started=true;roundWinPlayed=false;rewardPlayed=false;lastWinningTier=-1;plannedRatio=total/bet;currentFree=free;stop();round++;anticipation=false;lastMultiplier=free?2:1;if(free)mode='free';else if(mode==='free')mode='base';playBgm();if(shuffle)cue('reel_spin',{priority:1,loop:true})}
 function setMode(free){const next=free?'free':mode==='free'?'base':mode;if(next===mode)return;mode=next;playBgm()}
 function cascadeWin(multiplier,tier=0,free=currentFree){tier=Math.max(0,Math.min(3,tier));if(tier===lastWinningTier)return;lastWinningTier=tier;roundWinPlayed=true;const id=(free?['win_big','mega_win','ultimate_win','freespin_bigwin']:['win_normal','win_big','mega_win','ultimate_win'])[tier];cue(id,{priority:tier===0&&!free?2:3,detail:{multiplier,tier,free}})}
 function winRound(ratio=plannedRatio,free=currentFree){if(roundActive&&roundWinPlayed)return;roundWinPlayed=true;const id=free&&ratio>=10&&ratio<100?'freespin_bigwin':winSound(ratio);cue(id,{priority:3})}
 function voice(){return false}
 function animation(id,detail={}){if(id===8)cascadeWin(detail.multiplier,detail.tier,detail.isFree);if(id===27&&!anticipation){anticipation=true;cue('scatter_near',{priority:3,loop:true})}if(id===15)cue('golden_eliminate',{priority:3});if((id===16||id===19)&&detail.reveal){cue(id===16?'little_joker':'big_joker',{priority:3,detail:{origin:'joker-reveal',indices:detail.indices}})}}
 function reward(amount,bet,{free=false,total=false,overlay=true,title=''}={}){if(!overlay)return;if(total){stop();cue('freespin_result',{priority:3,detail:{origin:'free-total'}});return}if(roundActive&&rewardPlayed)return;if(roundActive)rewardPlayed=true;const ratio=amount/bet,id=free&&ratio<100?'freespin_bigwin':title==='BIG WIN'?'win_big':title==='MEGA WIN'?(ratio>=100?winSound(ratio):'mega_win'):winSound(ratio);cue(id,{priority:4,detail:{origin:'reward-overlay',title,ratio}})}
 function endRound(free=false){roundActive=false;if(free)mode='free';else if(mode==='free')mode='base';playBgm()}
 return{prepare,tryAutoplay,unlock,cue,voice,stop,animation,startRound,endRound,setMode,reward,configure,
  feature(extra=false){stop();cue(extra?'freespin_retrigger':'freespin_trigger',{priority:3});},
  setEnabled(value){configure({musicEnabled:!!value})},
  pause({audible=false}={}){clearTimeout(pauseTimer);stop();if(audible)cue('pause',{priority:3,maxMs:350});paused=true;cancelAnimationFrame(fadeFrame);for(const a of Object.values(players))a.pause();if(audible)pauseTimer=setTimeout(()=>{if(paused){stop();context?.suspend().catch(()=>{})}},350);else context?.suspend().catch(()=>{});log('pause','all')},
  resume(){clearTimeout(pauseTimer);paused=false;stop('pause');prepare();if(unlocked)context?.resume().catch(()=>{});playBgm();log('resume','all')},
  async preview(id){const ticket=++previewVersion;unlock({welcome:false,silent:true});await context?.resume();await load(id,true);if(ticket!==previewVersion)return;stop();for(const a of Object.values(players))a.pause();cue(id,{priority:3,force:true,bus:TRACKS[id].category==='bgm'||MUSIC_CUES.has(id)?'music':'sfx'})},
  history,
  signalLevel(){if(!context||context.state!=='running')return 0;if(!monitor){monitor=context.createAnalyser();monitor.fftSize=256;output.connect(monitor)}const data=new Float32Array(monitor.fftSize);monitor.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,x)=>sum+x*x,0)/data.length)},
  get state(){return{enabled:prefs.musicEnabled,mode,unlocked,paused,failed,playing:Object.entries(players).filter(([,a])=>!a.paused).map(([n])=>n),gains:Object.fromEntries(Object.keys(players).map(n=>[n,bgVolume(n)])),roundActive,roundWinPlayed,settings:{...prefs},ready:buffers.size,total:GAME_CUES.size,activeSfx:[...voices].filter(v=>v.bus==='sfx').length,active:[...voices].map(v=>({id:v.id,bus:v.bus})),hasVo:false,missingVo:AUDIO_CATALOG.missingVo}}};
}
