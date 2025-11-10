// engine.js — uniform slide schema, legacy layout feel preserved
import { d3, depsReady } from '../deps.js';
import { LAYOUTS, dur, dly, applyCSSVars, select } from './utils.js';
import { bg } from './background.js';
import { getChart } from '../charts/registry.js';
import { warmMany } from '../core/geoWarm.js';

warmMany([
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
]);

// === Scene markup (uniform for all slides) ===
function sceneShell(slide){
  const sec = document.createElement('section');
  sec.className = 'scene'; sec.id = slide.id;

  // LABEL (graph label / header)
  if (slide.label){
    const gl = document.createElement('div');
    gl.className='graph-label';
    gl.textContent = typeof slide.label === 'string' ? slide.label : (slide.label.text || '');
    sec.appendChild(gl);
  }

  const graphic = document.createElement('div'); graphic.className = 'graphic'; sec.appendChild(graphic);
  const canvas  = document.createElement('div'); canvas.className  = 'canvas';  graphic.appendChild(canvas);

  // TEXT block (same component for all slides)
  if (slide.text){
    const tw  = document.createElement('div'); tw.className='text-cards';
    const box = document.createElement('div'); box.className='text-box';
    box.id = slide.text.figSel.replace('#','');
    tw.appendChild(box);
    canvas.appendChild(tw);
  }

  // FIGURE (chart/media)
  if (slide.figure){
    const type = slide.figure.type;

    if (type === 'table'){
      const fig = document.createElement('div'); fig.className = 'table-cards';
      fig.id = slide.figure.figSel.replace('#','');
      canvas.appendChild(fig);
    } else if (type === 'credits'){
      const fig = document.createElement('div'); fig.className='figure-box';
      fig.id = slide.figure.figSel.replace('#','');
      fig.innerHTML = `<div class="credits-viewport"><!-- dynamic --></div>`;
      canvas.appendChild(fig);
    } else if (type === 'text'){
      const tw  = document.createElement('div'); tw.className='text-cards';
      const box = document.createElement('div'); box.className='text-box';
      box.id = slide.figure.figSel.replace('#','');
      tw.appendChild(box);
      canvas.appendChild(tw);
    } else {
      const fig = document.createElement('div'); fig.className='figure-box';
      fig.id = slide.figure.figSel.replace('#','');
      canvas.appendChild(fig);
    }
  }

  // CAPTION (below the scene)
  if (slide.caption){
    const cap = document.createElement('div'); cap.className='caption';
    cap.textContent = slide.caption;
    sec.appendChild(cap);
  }
  return sec;
}

// === Layout (replicates legacy proportions)
function applyLayout(slide){
  const textSel = slide.text ? slide.text.figSel : null;
  const hAlign = slide.text?.props?.halign || 'center'; // NEW: pass halign through

  if (slide.figure?.type === 'table'){
    LAYOUTS.table(slide.id, {
      figSel: slide.figure.figSel,
      textSel,
      textFrac: slide.layout?.textFrac,
      gapFrac: slide.layout?.gapFrac,
      hAlign            // NEW
    });
    return;
  }
  if (slide.figure?.type === 'credits'){
    LAYOUTS.credits(slide.id);
    return;
  }

  if (slide.figure){
    LAYOUTS.panel(slide.id, {
      figSel: slide.figure.figSel,
      textSel,
      textFrac: slide.layout?.textFrac,
      gapFrac: slide.layout?.gapFrac,
      figFrac: slide.layout?.figFrac,
      hAlign            // NEW
    });
    return;
  }

  // Text-only slides: let text.js arrange itself (unchanged)
}

// === Build one slide (text first, then figure)
function buildSlide(slide){
  // theme overrides
  if (slide.theme){
    Object.entries(slide.theme).forEach(([k,v])=>{
      document.querySelector('#'+slide.id).style.setProperty(k, v);
    });
  }

  // background group
  if (slide.group) bg.show(slide.group); else bg.show(null);

  // grid overlay toggle (optional)
  if ('overlayGrid' in slide) {
    document.documentElement.style.setProperty('--grid-alpha', slide.overlayGrid ? '.06' : '0');
  }

  // TEXT
  if (slide.text){
    const textBuilder = getChart('text');
    if (textBuilder){
      textBuilder(slide.text.figSel, slide.text.props || {});
      select(slide.text.figSel)?.classList.add('show');
    }
  }

  // FIGURE
  if (slide.figure){
    if (slide.figure.props?.graphOpacity != null){
      const fig = document.querySelector(slide.figure.figSel);
      if(fig) fig.style.opacity = slide.figure.props.graphOpacity;
    }
    const figBuilder = getChart(slide.figure.type);
    if (figBuilder){
      figBuilder(slide.figure.figSel, slide.figure.props || {});
    }
  }

  // If there is no text on this slide, we still want label/caption to fade in.
  if (!slide.text){
    const sec = document.getElementById(slide.id);
    if (sec) sec.classList.add('fx-on');
  }

  // Cards slide: reveal three cards (unchanged)
  if (slide.id === 'scene-cards'){
    setTimeout(()=>{
      ['card-gains','card-costs','card-fix'].forEach((cid)=>{
        const el = document.getElementById(cid);
        if(el){ el.classList.add('show'); }
      });
    }, 150);
  }
}

// === Bootstrap
export async function bootstrap(deck){
  if(deck.themeVars) applyCSSVars(deck.themeVars);
  bg.registerGroups(deck.mediaGroups || []);

  const root = document.getElementById('deck-root');
  deck.slides.forEach(slide => root.appendChild(sceneShell(slide)));

  // dotnav
  const dotnav = document.getElementById('dotnav');
  deck.slides.forEach((s,i)=>{
    const b=document.createElement('button'); b.title = s.nav || s.id || `Slide ${i+1}`;
    b.addEventListener('click',()=> document.getElementById(s.id).scrollIntoView({behavior:'smooth'}));
    dotnav.appendChild(b);
  });

  // layout on load + resize
  const relayout = ()=> deck.slides.forEach(applyLayout);
  window.addEventListener('resize', relayout);
  relayout();

  // build-on-view
  const SceneState = new Map(deck.slides.map(s=>[s.id,{built:false}]));
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const id = entry.target.id;
      const slide = deck.slides.find(s=>s.id===id);
      if(!slide) return;

      const st = SceneState.get(id);
      if(!st.built){
        buildSlide(slide);
        st.built=true;

        if(slide.text) select(slide.text.figSel)?.classList.add('show');
      }

      const buttons=[...dotnav.children], idx=deck.slides.findIndex(s=>s.id===id);
      buttons.forEach((b,i)=> b.classList.toggle('active', i===idx));
    });
  },{threshold:0.85});

  deck.slides.forEach(s=> observer.observe(document.getElementById(s.id)));
}