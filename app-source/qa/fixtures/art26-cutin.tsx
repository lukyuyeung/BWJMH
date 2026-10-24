import React from 'react';import {createRoot} from 'react-dom/client';import {CharacterPerformance} from '../../src/presentation';import '../../src/art-update-26.css';
const seats=['east','south','west','north'],characters={east:'yellow',south:'king',west:'ninja',north:'wizard'} as const;
function Harness(){const [event,setEvent]=React.useState<any[]>([]);(window as any).playCutin=(seat:number,kind:string,id:number)=>setEvent([{id,kind,seat:seats[seat]}]);return <div className="phone-stage" style={{width:1125,height:634,position:'relative'}}><CharacterPerformance relativeSeats={seats} events={event} characters={characters} skip={false} reduce={false} critical={false} handKey="qa" settled={false} kanTypes={{}} onSkip={()=>{}}/></div>};createRoot(document.getElementById('root')!).render(<Harness/>);

import '../../src/visual-fixes-22.css';
