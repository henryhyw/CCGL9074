import { d3, depsReady } from '../deps.js';
import { LAYOUTS, dur, dly, applyCSSVars, select } from './utils.js';
import { bg } from './background.js';
import { build as ChartMap } from '../charts/map.js';
import { build as ChartScatter } from '../charts/scatter.js';
import { build as ChartGap } from '../charts/gap.js';
import { build as ChartTimeline } from '../charts/timeline.js';
import { build as ChartFlow2D } from '../charts/flow2d.js';
import { build as ChartRidge } from '../charts/ridge.js';
import { build as ChartSankey } from '../charts/sankey.js';
import { build as ChartPrices } from '../charts/prices.js';
import { build as ChartBubbles } from '../charts/bubbles.js';
import { build as ChartHex } from '../charts/hexgrid.js';
import { build as ChartPlumes } from '../charts/plumes.js';
import { build as ChartHeat } from '../charts/heatmap.js';
import { build as ChartWater } from '../charts/water.js';
import { build as ChartChord } from '../charts/chord.js';
import { build as ChartTable } from '../charts/table.js';
import { build as ChartHist } from '../charts/hist.js';
import { build as ChartText } from '../charts/text.js';
import { build as ChartWrap } from '../charts/wrap.js';
import { build as ChartCredits } from '../charts/credits.js';

const charts = {
  'map': ChartMap, 'scatter': ChartScatter, 'gap': ChartGap, 'timeline': ChartTimeline, 'flow2d': ChartFlow2D,
  'ridge': ChartRidge, 'sankey': ChartSankey, 'prices': ChartPrices, 'bubbles': ChartBubbles, 'hexgrid': ChartHex,
  'plumes': ChartPlumes, 'heatmap': ChartHeat, 'water': ChartWater, 'chord': ChartChord, 'table': ChartTable,
  'hist': ChartHist, 'text': ChartText, 'wrap': ChartWrap, 'credits': ChartCredits
};

function sceneShell(slide){
  const sec = document.createElement('section');
  sec.className = 'scene'; sec.id = slide.id;
  if(slide.graphLabel){
    const gl = document.createElement('div');
    gl.className='graph-label'; gl.textContent=slide.graphLabel; sec.appendChild(gl);
  }
  const graphic = document.createElement('div'); graphic.className = 'graphic'; sec.appendChild(graphic);
  const canvas = document.createElement('div'); canvas.className = 'canvas'; graphic.appendChild(canvas);
  if(slide.textPanel){
    const pt = document.createElement('div'); pt.className='panel-text'; pt.id = slide.textPanel.id; pt.innerHTML = slide.textPanel.html || ''; canvas.appendChild(pt);
  }
  if(slide.type === 'table'){
    const wrap = document.createElement('div'); wrap.className = 'table-wrap'; wrap.id = slide.figSel.replace('#',''); canvas.appendChild(wrap);
  }else if(slide.type === 'text'){
    const tw = document.createElement('div'); tw.className='text-wrap';
    const box = document.createElement('div'); box.className='text-box'; box.id = slide.figSel.replace('#',''); tw.appendChild(box); canvas.appendChild(tw);
  }else if(slide.type === 'credits'){
    const wrap = document.createElement('div'); wrap.className='figure-box'; wrap.id = slide.figSel.replace('#',''); 
    wrap.innerHTML = `<div class="credits-viewport"><!-- dynamic --></div>`; 
    canvas.appendChild(wrap);
  }else{
    const fig = document.createElement('div'); fig.className='figure-box'; fig.id = slide.figSel.replace('#',''); canvas.appendChild(fig);
  }
  if(slide.caption){ const cap = document.createElement('div'); cap.className='caption'; cap.textContent=slide.caption; sec.appendChild(cap); }
  return sec;
}
function applyLayout(slide){
  const textSel = slide.textPanel ? '#'+slide.textPanel.id : null;
  if(slide.type === 'table'){
    LAYOUTS.table(slide.id, { figSel: slide.figSel, textSel, textFrac: slide.layout?.textFrac, gapFrac: slide.layout?.gapFrac });
  }else if(slide.type === 'text'){
    // text type fills center; alignment is handled by ChartText via props
  }else if(slide.type === 'credits'){
    LAYOUTS.credits(slide.id);
  }else{
    LAYOUTS.panel(slide.id, { figSel: slide.figSel, textSel, textFrac: slide.layout?.textFrac, gapFrac: slide.layout?.gapFrac, figFrac: slide.layout?.figFrac });
  }
}
function buildSlide(slide){
  const builder = charts[slide.type]; if(!builder) return;
  if(slide.theme){
    Object.entries(slide.theme).forEach(([k,v])=>{
      document.querySelector('#'+slide.id).style.setProperty(k, v);
    });
  }
  // Per-slide graph opacity configuration
  if(slide.props?.graphOpacity != null){
    const fig = document.querySelector(slide.figSel);
    if(fig) fig.style.opacity = slide.props.graphOpacity;
  }
  builder(slide.figSel, slide.props || {});
  if(slide.textPanel) select('#'+slide.textPanel.id)?.classList.add('show');
}
export async function bootstrap(deck){
  if(deck.themeVars) applyCSSVars(deck.themeVars);
  bg.registerGroups(deck.mediaGroups || []);
  const root = document.getElementById('deck-root');
  deck.slides.forEach(slide => root.appendChild(sceneShell(slide)));
  const dotnav = document.getElementById('dotnav');
  deck.slides.forEach((s,i)=>{
    const b=document.createElement('button'); b.title = s.nav || s.id || `Slide ${i+1}`;
    b.addEventListener('click',()=> document.getElementById(s.id).scrollIntoView({behavior:'smooth'}));
    dotnav.appendChild(b);
  });
  const relayout = ()=> deck.slides.forEach(applyLayout);
  window.addEventListener('resize', relayout); relayout();
  const SceneState = new Map(deck.slides.map(s=>[s.id,{built:false}]));
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const id = entry.target.id;
      const slide = deck.slides.find(s=>s.id===id);
      if(!slide) return;
      if(slide.group) bg.show(slide.group); else bg.show(null);
      if ('overlayGrid' in slide) {
        // true  -> show gridlines (e.g. .06)
        // false -> hide gridlines (0)
        document.documentElement.style.setProperty(
          '--grid-alpha',
          slide.overlayGrid ? '.06' : '0'
        );
      }
      const st = SceneState.get(id);
      if(!st.built){
        buildSlide(slide);
        st.built=true;
        if(slide.textPanel) select('#'+slide.textPanel.id)?.classList.add('show');
        if(slide.id==='scene-wrap'){
          setTimeout(()=>{
            ['card-gains','card-costs','card-fix'].forEach((cid,i)=>{
              const el = document.getElementById(cid);
              if(el){ el.classList.add('show'); }
            });
          }, 150);
        }
      }
      const buttons=[...dotnav.children], idx=deck.slides.findIndex(s=>s.id===id);
      buttons.forEach((b,i)=> b.classList.toggle('active', i===idx));
    });
  },{threshold:0.85});
  deck.slides.forEach(s=> observer.observe(document.getElementById(s.id)));
}
