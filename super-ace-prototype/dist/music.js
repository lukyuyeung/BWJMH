/** Audio never participates in loading, RNG, round settlement, or presentation waits. */
export function createGameMusic({enabled=true,volume=.3}={}){
 const tracks={base:'assets/audio/superace-main.m4a',free:'assets/audio/superace-bonus.m4a'},players={};let mode='base',unlocked=false,paused=false,frame=0,failed=false;
 function player(name){if(!players[name]){const a=new Audio();a.preload='none';a.loop=true;a.volume=0;a.src=tracks[name];a.addEventListener('error',()=>{failed=true});players[name]=a}return players[name]}
 function fade(){cancelAnimationFrame(frame);const started=performance.now(),from=Object.fromEntries(Object.entries(players).map(([n,a])=>[n,a.volume]));function tick(now){const t=Math.min(1,Math.max(0,(now-started)/650));for(const[n,a]of Object.entries(players)){const target=enabled&&!paused&&unlocked&&n===mode?volume:0;a.volume=(from[n]??0)+(target-(from[n]??0))*t;if(t===1&&target===0)a.pause()}if(t<1)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)}
 function play(){if(!enabled||paused||!unlocked)return;const a=player(mode);a.play().catch(()=>{});fade()}
 return{unlock(){if(unlocked)return;unlocked=true;play()},setMode(free){const next=free?'free':'base';if(next===mode)return;mode=next;play()},setEnabled(value){enabled=!!value;if(enabled)play();else fade()},pause(){paused=true;cancelAnimationFrame(frame);for(const a of Object.values(players))a.pause()},resume(){paused=false;play()},get state(){return{enabled,mode,unlocked,paused,failed,playing:Object.entries(players).filter(([,a])=>!a.paused).map(([n])=>n)}}};
}
