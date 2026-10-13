/** Illustrated patterns; situational yaku still require the conditions in the guide. */
export const yakuExamples:Record<string,string>={
 Riichi:'123m 456m 234p 678s 55p','Double Riichi':'123m 456m 234p 678s 55p',Ippatsu:'123m 456m 234p 678s 55p','Menzen Tsumo':'123m 456m 234p 678s 55p',
 Tanyao:'234m 456m 234p 678s 55p',Yakuhai:'CCC 234m 567p 789s 22p',Pinfu:'123m 456m 234p 678s 55p',Iipeikou:'123m 123m 456p 789s 55p',Ryanpeikou:'123m 123m 456p 456p 55s',Chiitoitsu:'11m 33m 55m 22p 66p 44s CC',
 Toitoi:'222m 444p 666s CCC 55p',Sanankou:'222m 444p 666s CCC 55p',Sankantsu:'2222m 4444p 6666s 345p CC','Sanshoku Doujun':'234m 234p 234s 678s 55p','Sanshoku Doukou':'333m 333p 333s 678s 55p',Ittsu:'123m 456m 789m 678p 55s',
 Chanta:'123m 789p 111s EEE CC',Junchan:'123m 789m 111p 999s 11s',Honroutou:'111m 999p EEE FFF CC',Honitsu:'123m 456m 789m EEE CC',Chinitsu:'123m 456m 789m 111m 99m',Shousangen:'PPP FFF CC 123m 789p',
 'Haitei Raoyue':'123m 456m 234p 678s 55p','Houtei Raoyui':'123m 456m 234p 678s 55p','Rinshan Kaihou':'2222m 345m 456p 678s CC',Chankan:'123m 456m 234p 678s 55p',
 'Kokushi Musou':'19m 19p 19s ESWN PFC E',Suuankou:'222m 444p 666s CCC 55p',Daisangen:'PPP FFF CCC 123m 22p',Tsuuiisou:'EEE SSS PPP FFF CC',Chinroutou:'111m 999m 111p 999s 11s',Suukantsu:'1111m 3333p 7777s CCCC 55p',Shousuushi:'EEE SSS WWW 123m NN',Daisuushi:'EEE SSS WWW NNN CC',Ryuuiisou:'222s 333s 444s 666s FF','Chuuren Poutou':'1112345678999m 5m',Tenhou:'123m 456m 234p 678s 55p',Chiihou:'123m 456m 234p 678s 55p',
};
export function exampleGroups(pattern:string):string[][]{return pattern.split(' ').map(group=>/^[1-9]+[mps]$/.test(group)?[...group.slice(0,-1)].map(rank=>rank+group.at(-1)):[...group]);}
