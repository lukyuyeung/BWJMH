/** Recording names retain their supplied spelling (including hachihin = 8p). */
const readings:Record<string,string>={
 '1m':'ichiman','2m':'niman','3m':'sanman','4m':'yonman','5m':'goman','6m':'rokuman','7m':'nanaman','8m':'hachiman','9m':'kyuuman',
 '1p':'ichipin','2p':'nipin','3p':'sanpin','4p':'yonpin','5p':'gopin','6p':'rokupin','7p':'nanapin','8p':'hachihin','9p':'kyuupin',
 '1s':'ichisou','2s':'nisou','3s':'sansou','4s':'yonsou','5s':'gosou','6s':'rokusou','7s':'nanasou','8s':'hachisou','9s':'kyuusou',
 E:'ton',S:'nan',W:'sha',N:'pei',P:'haku',F:'hatsu',C:'chun'
};
export function tileVoiceEvent(face:string){return readings[face]?'tile_'+readings[face]:null}
