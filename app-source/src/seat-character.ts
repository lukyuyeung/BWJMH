import type {Game,Seat} from './main';
import type {Character} from './presentation';
export function seatCharacter(game:Game,seat:Seat):Character{if(seat===game.you.seat)return 'yellow';const p=game.room.players.find(p=>p.seat===seat)?.botProfile;if(p)return {aggressive:'ninja',balanced:'king',defensive:'wizard'}[p] as Character;const order:Seat[]=['east','south','west','north'];return (['yellow','king','ninja','wizard'] as Character[])[(order.indexOf(seat)-order.indexOf(game.you.seat)+4)%4]!}
