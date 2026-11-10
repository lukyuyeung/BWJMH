/* Browser regression: the entire portrait game must fit, including hit targets. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const [width,height] of [[320,568],[360,640],[375,667],[390,701],[390,844],[430,932]]){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{localStorage.setItem('gala-carrot-tutorial','1');localStorage.setItem('gala-carrot-v1',JSON.stringify({balance:123456789.12}))});
   await page.goto(origin);await page.waitForFunction(()=>window.galaDebug?.getState().visualReady);await page.locator('.cell').nth(19).waitFor();
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
   await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const buttons=[...document.querySelectorAll('.topbar button:not(#sound),.controls button,.balance-bar button')];
    return{backs:[...document.querySelectorAll('.mouth')].map(e=>({box:rect(e),image:rect(e.querySelector('img'))})),amounts:[...document.querySelectorAll('.balance-bar strong')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth})),document:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],cards:[...document.querySelectorAll('.cell')].map(rect),buttons:buttons.map(e=>({id:e.id,...rect(e),hit:document.elementFromPoint(e.getBoundingClientRect().x+e.getBoundingClientRect().width/2,e.getBoundingClientRect().y+e.getBoundingClientRect().height/2)?.closest('button')===e})),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),flags:document.querySelectorAll('.flag').length};
   });
   assert.deepEqual(result.document,[width,height]);assert.equal(result.cards.length,20);assert.equal(result.flags,0);assert.deepEqual(result.broken,[]);assert.deepEqual(errors,[]);
   for(let col=0;col<5;col++){const back=result.backs[col],cell=result.cards[col];assert(Math.abs(back.box.x+back.box.width/2-cell.x-cell.width/2)<.1,'dealer alignment');assert(Math.abs(back.box.width-cell.width)<.1,'dealer column width');assert(Math.abs(back.image.width-back.box.width)<.1&&Math.abs(back.image.height-back.box.height)<.1,'BACK must fill outlet')}
   const gaps=[],vertical=[];for(let row=0;row<4;row++)for(let col=0;col<4;col++){const a=result.cards[row*5+col],b=result.cards[row*5+col+1];gaps.push(b.x-a.right)}for(let row=0;row<3;row++)for(let col=0;col<5;col++){const a=result.cards[row*5+col],b=result.cards[(row+1)*5+col];vertical.push(b.y-a.bottom)}assert(Math.min(...gaps)>=3.95);assert(Math.min(...vertical)>=3.95);for(const axis of [gaps,vertical])assert(Math.max(...axis)-Math.min(...axis)<.1,'uneven gutters on same axis');
   for(const a of result.amounts)assert(a.scroll<=a.width+1,'amount overflow');
   for(const r of result.cards){assert(r.x>=0&&r.y>=0&&r.right<=width&&r.bottom<=height);assert(Math.abs(r.width/r.height-625/835)<.001)}
   for(const r of result.buttons){assert(r.width>=44&&r.height>=44,r.id+' hit target');assert(r.x>=0&&r.y>=0&&r.right<=width&&r.bottom<=height,r.id+' bounds');assert(r.hit,r.id+' covered')}
   await page.evaluate(()=>scrollTo(0,500));await page.mouse.wheel(0,500);assert.equal(await page.evaluate(()=>scrollY),0);
   await page.locator('#auto').click();
   const auto=await page.locator('#modalContent').evaluate(e=>({scroll:e.scrollHeight,height:e.clientHeight}));assert(auto.scroll<=auto.height+1,'Auto requires scrolling');
   for(const id of ['autoStart','autoCancel']){const r=await page.locator('#'+id).boundingBox();assert(r.y>=0&&r.y+r.height<=height,id+' hidden')}
   assert.equal(await page.locator('.chips button.selected').evaluate(e=>getComputedStyle(e).backgroundRepeat),'no-repeat');await page.locator('#autoCancel').click();
   console.log(`${width}x${height}: 20 cards, 10 reachable buttons, main stage and Auto fit`);await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
