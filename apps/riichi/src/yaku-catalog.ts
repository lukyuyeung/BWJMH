import type {YakuId} from '../engine/yaku.js';
export type YakuEntry={id:YakuId;name:string;value:string;closed:boolean;condition:string;example:string;note?:string};
const base='2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p';
const entries:Record<YakuId,Omit<YakuEntry,'id'>>={
 riichi:{name:'立直',value:'1番',closed:true,condition:'門前聽牌、持點至少1000點，宣告並放置1000點供託。宣告後原則上摸切。',example:base},
 double_riichi:{name:'雙立直',value:'2番',closed:true,condition:'自己第一巡、未有吃碰槓打斷之前，門前聽牌並宣告立直。',example:base},
 menzen_tsumo:{name:'門前清自摸和',value:'1番',closed:true,condition:'沒有吃、碰或明槓，以自己摸到的牌完成和牌；暗槓不破壞門前。',example:base},
 ippatsu:{name:'一發',value:'1番',closed:true,condition:'立直後一巡內和牌，期間不能有吃、碰或槓打斷；須與立直成立。',example:base},
 tanyao:{name:'斷么九',value:'1番',closed:false,condition:'整副和牌只用二至八的數牌，沒有一、九或字牌。',example:base},
 pinfu:{name:'平和',value:'1番',closed:true,condition:'四組順子，將牌不是三元牌、自風或場風，最後必須兩面聽。',example:base,note:'例：以二萬完成三、四萬的兩面聽；不能以將牌的單騎聽完成平和。'},
 iipeikou:{name:'一盃口',value:'1番',closed:true,condition:'同一花色、同一數字的兩組完全相同順子。',example:'1m 2m 3m 1m 2m 3m 4p 5p 6p 7s 8s 9s 5p 5p'},
 yakuhai:{name:'役牌',value:'每組1番',closed:false,condition:'白、發、中、自風或場風的刻子／槓子；自風同時為場風時該組可算兩番。',example:'1m 2m 3m 4p 5p 6p 7s 8s 9s P P P E E',note:'圖例以白板刻子成立役牌；東風對子本身不算役牌。'},
 haitei:{name:'海底摸月',value:'1番',closed:false,condition:'摸到活牌山最後一張牌並自摸和牌。',example:base},
 houtei:{name:'河底撈魚',value:'1番',closed:false,condition:'榮和別人摸完活牌山最後一張後所打出的牌。',example:base},
 rinshan_kaihou:{name:'嶺上開花',value:'1番',closed:false,condition:'開槓後，靠補進的嶺上牌自摸和牌。槓的第四張不計入四組一對的14張結構。',example:'2m 3m 4m 3p 4p 5p 6s 7s 8s P P P P E E'},
 chankan:{name:'搶槓',value:'1番',closed:false,condition:'搶別人的加槓牌榮和；一般不能搶大明槓。國士無雙搶暗槓須按房規。',example:base},
 chiitoitsu:{name:'七對子',value:'2番・25符',closed:true,condition:'七組不同牌種的對子，不能把四張相同牌當作兩對。',example:'1m 1m 3m 3m 5p 5p 7p 7p 2s 2s 8s 8s E E'},
 toitoi:{name:'對對和',value:'2番',closed:false,condition:'四組刻子／槓子，加一組將牌，沒有順子。',example:'1m 1m 1m 3p 3p 3p 7s 7s 7s P P P E E'},
 sanankou:{name:'三暗刻',value:'2番',closed:false,condition:'三組自己手中完成的暗刻／暗槓。雙碰聽榮和完成的那組不算暗刻。',example:'1m 1m 1m 3p 3p 3p 7s 7s 7s 4p 5p 6p E E',note:'圖例以六筒榮和完成順子，另外三組刻子均保留為暗刻。'},
 sanshoku_doujun:{name:'三色同順',value:'門前2番・副露1番',closed:false,condition:'萬、筒、索各有一組數字完全相同的順子。',example:'1m 2m 3m 1p 2p 3p 1s 2s 3s 7m 8m 9m 5p 5p'},
 sanshoku_doukou:{name:'三色同刻',value:'2番',closed:false,condition:'萬、筒、索各有同一數字的刻子／槓子。',example:'3m 3m 3m 3p 3p 3p 3s 3s 3s 4m 5m 6m E E'},
 ittsu:{name:'一氣通貫',value:'門前2番・副露1番',closed:false,condition:'同一花色的123、456、789三組順子。',example:'1m 2m 3m 4m 5m 6m 7m 8m 9m 3p 4p 5p E E'},
 chanta:{name:'混全帶么九',value:'門前2番・副露1番',closed:false,condition:'每一組面子及將牌都帶一、九或字牌，並且至少有一組順子及字牌。',example:'1m 2m 3m 7p 8p 9p 1s 1s 1s P P P E E'},
 sankantsu:{name:'三槓子',value:'2番',closed:false,condition:'和牌中包含三組槓子；每組槓在基本和牌結構中視作一組刻子。',example:'1m 1m 1m 1m 3p 3p 3p 3p 7s 7s 7s 7s 4p 5p 6p E E'},
 honroutou:{name:'混老頭',value:'2番',closed:false,condition:'全部是數牌的一、九及字牌，不含二至八；可配合對對和或七對子。',example:'1m 1m 1m 9p 9p 9p 1s 1s 1s P P P E E'},
 shousangen:{name:'小三元',value:'2番',closed:false,condition:'白、發、中之中兩組刻子／槓子，加另一種三元牌的將牌；役牌番另計。',example:'P P P F F F C C 1m 2m 3m 4p 5p 6p'},
 honitsu:{name:'混一色',value:'門前3番・副露2番',closed:false,condition:'一種花色的數牌，加字牌；不能混入第二種數牌花色。',example:'1m 2m 3m 4m 5m 6m 7m 8m 9m P P P E E'},
 ryanpeikou:{name:'二盃口',value:'3番',closed:true,condition:'四組順子分成兩組一盃口；與七對子、一盃口不重複計算。',example:'1m 2m 3m 1m 2m 3m 7p 8p 9p 7p 8p 9p 5s 5s'},
 junchan:{name:'純全帶么九',value:'門前3番・副露2番',closed:false,condition:'每組面子及將牌均帶一或九，至少有一組順子，完全沒有字牌。',example:'1m 2m 3m 7p 8p 9p 1s 1s 1s 9s 9s 9s 1p 1p'},
 chinitsu:{name:'清一色',value:'門前6番・副露5番',closed:false,condition:'全部使用同一花色的數牌，沒有字牌。',example:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m'},
 kokushi:{name:'國士無雙',value:'役滿',closed:true,condition:'十三種不同么九牌各一張，再加其中一種的對子。',example:'1m 9m 1p 9p 1s 9s E S W N P F C E'},
 suuankou:{name:'四暗刻',value:'役滿',closed:true,condition:'四組暗刻／暗槓及一對將牌。雙碰聽須自摸，單騎聽可榮和。',example:'1m 1m 1m 3p 3p 3p 7s 7s 7s P P P E E',note:'圖例以東風單騎完成將牌；四組刻子均在自己手中完成。'},
 daisangen:{name:'大三元',value:'役滿',closed:false,condition:'白、發、中三組刻子／槓子。',example:'P P P F F F C C C 1m 2m 3m E E'},
 tsuuiisou:{name:'字一色',value:'役滿',closed:false,condition:'全部使用東南西北白發中，不含任何數牌。',example:'E E E S S S W W W P P P N N'},
 chinroutou:{name:'清老頭',value:'役滿',closed:false,condition:'全部使用萬、筒、索的一或九，不含字牌或二至八。',example:'1m 1m 1m 9m 9m 9m 1p 1p 1p 9p 9p 9p 1s 1s'},
 ryuuiisou:{name:'綠一色',value:'役滿',closed:false,condition:'只使用二、三、四、六、八索及發；不一定需要發。',example:'2s 2s 2s 3s 3s 3s 4s 4s 4s 6s 6s 6s F F'},
 shousuushi:{name:'小四喜',value:'役滿',closed:false,condition:'三種風牌的刻子／槓子，加第四種風牌作將牌。',example:'E E E S S S W W W N N 1m 2m 3m'},
 daisuushi:{name:'大四喜',value:'役滿',closed:false,condition:'東、南、西、北四組刻子／槓子；本遊戲按役滿計。',example:'E E E S S S W W W N N N P P'},
 suukantsu:{name:'四槓子',value:'役滿',closed:false,condition:'同一玩家完成四組槓子，再完成將牌和牌。',example:'1m 1m 1m 1m 3p 3p 3p 3p 7s 7s 7s 7s P P P P E E'},
 chuuren:{name:'九蓮寶燈',value:'役滿',closed:true,condition:'同一花色的1112345678999，加該花色任意一張；不可副露。',example:'1m 1m 1m 2m 3m 4m 5m 6m 7m 8m 9m 9m 9m 5m'},
 tenhou:{name:'天和',value:'役滿',closed:true,condition:'莊家配牌後第一手直接自摸和牌，期間沒有任何鳴牌；須房規啟用。',example:base},
 chiihou:{name:'地和',value:'役滿',closed:true,condition:'子家第一巡、未有任何鳴牌之前，第一次摸牌即自摸和牌；須房規啟用。',example:base},
};
export const yakuCatalog=(Object.entries(entries) as [YakuId,Omit<YakuEntry,'id'>][]).map(([id,entry])=>({id,...entry}));

const englishIds:Record<string,YakuId>={"Tenhou": "tenhou", "Chiihou": "chiihou", "Kokushi Musou": "kokushi", "Double Riichi": "double_riichi", "Riichi": "riichi", "Menzen Tsumo": "menzen_tsumo", "Ippatsu": "ippatsu", "Haitei Raoyue": "haitei", "Houtei Raoyui": "houtei", "Rinshan Kaihou": "rinshan_kaihou", "Chankan": "chankan", "Chiitoitsu": "chiitoitsu", "Tanyao": "tanyao", "Honitsu": "honitsu", "Chinitsu": "chinitsu", "Honroutou": "honroutou", "Daisangen": "daisangen", "Tsuuiisou": "tsuuiisou", "Chinroutou": "chinroutou", "Shousangen": "shousangen", "Yakuhai": "yakuhai", "Pinfu": "pinfu", "Toitoi": "toitoi", "Ryanpeikou": "ryanpeikou", "Iipeikou": "iipeikou", "Suuankou": "suuankou", "Sanankou": "sanankou", "Chanta": "chanta", "Junchan": "junchan", "Sanshoku Doukou": "sanshoku_doukou", "Suukantsu": "suukantsu", "Sankantsu": "sankantsu", "Daisuushi": "daisuushi", "Shousuushi": "shousuushi", "Ryuuiisou": "ryuuiisou", "Chuuren Poutou": "chuuren", "Sanshoku Doujun": "sanshoku_doujun", "Ittsu": "ittsu"};
export const yakuEnglishToChinese=Object.fromEntries(Object.entries(englishIds).map(([name,id])=>[name,entries[id].name]));
