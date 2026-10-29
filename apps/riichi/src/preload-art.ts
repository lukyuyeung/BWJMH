import {warmImage} from './art-loading';
import {characterCutin} from './character-art';
import {seatCharacter} from './seat-character';
import {winArtUrl} from './win-art-config';
import {winImpactTier} from './win-impact';
import type {Game} from './main';
let loading:Promise<void>|undefined;
/** No speculative full-tier galleries, nine-emote packs, or six-pose packs on entry. */
export function preloadEventArt(){return loading??=Promise.all(['/art/hoodie-v3/character.png','/art/hoodie-v3/avatar.jpg','/art/ribbon-v2/01-ribbon.png','/art/ribbon-v2/04-fx.png',...['chi','pon','kan','ron','riichi','tsumo'].map(n=>'/art/ribbon-v2/03-'+n+'.png')].map(url=>warmImage(url,'high'))).then(()=>{})}
export function preloadAvailableArt(game:Game){
 const a=game.hand.actions,role=seatCharacter(game,game.you.seat),calls=[...(a.canPon?['pon']:[]),...(a.canRon?['ron']:[]),...(a.canTsumo?['tsumo']:[]),...(a.canKan||a.ankanTileIds.length||a.kakanTileIds.length?['kan']:[]),...(a.chiSequences.length?['chi']:[]),...(a.riichiDiscardIds.length?['riichi']:[])];
 for(const call of calls)void warmImage(characterCutin(role,call),'high');
 for(const result of game.hand.results??(game.hand.result?[game.hand.result]:[])){
  const view={...game,hand:{...game.hand,result}},winnerRole=seatCharacter(view,result.winner),tier=winImpactTier(view);
  void warmImage(winnerRole==='yellow'?'/art/hoodie-v3/character.png':winArtUrl(winnerRole,'mangan'),'high');
  if(tier&&!game.hand.winSequence?.segments.some(s=>s.winner===result.winner&&s.kind==='video'))void warmImage(winArtUrl(winnerRole,tier),'high');
 }
}
