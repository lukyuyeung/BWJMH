import type {Game,Seat} from './main';
import type {Character} from './presentation';
export function seatCharacter(game:Game,seat:Seat):Character{
 if(game.hand.demoCharacter&&game.hand.result?.winner===seat)return game.hand.demoCharacter;
 const player=game.room.players.find(p=>p.seat===seat);if(player?.character)return player.character;
 // Compatibility with saves/servers from before explicit character selection.
 if(seat===game.you.seat)return 'yellow';if(player?.botProfile)return {aggressive:'king',balanced:'yellow',defensive:'ninja',value:'wizard'}[player.botProfile] as Character;
 const order:Seat[]=['east','south','west','north'];return (['yellow','king','ninja','wizard'] as Character[])[(order.indexOf(seat)-order.indexOf(game.you.seat)+4)%4]!;
}
