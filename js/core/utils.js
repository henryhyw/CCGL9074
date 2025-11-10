import { d3 } from '../deps.js';
export const SPEED = 1.6;
export const dur = (ms)=>ms*SPEED;
export const dly = (ms)=>ms*SPEED;
export const select=(s,el=document)=>el.querySelector(s);
export const createSVG=(parent,w,h)=> d3.select(parent).append('svg')
  .attr('viewBox',`0 0 ${w} ${h}`).attr('preserveAspectRatio','xMidYMid meet');
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function cssPxVar(name,fallback){
  const v=getComputedStyle(document.documentElement).getPropertyValue(name)||'';
  const n=parseFloat(v); return Number.isFinite(n)?n:fallback;
}
export function applyCSSVars(vars={}){
  const root = document.documentElement;
  Object.entries(vars).forEach(([k,v])=> root.style.setProperty(k, v));
}
// Fade a graph root in when its scene enters view, then run `animateFinal`.
export function globalReveal({
  container,      // HTMLElement or selector of the figure container (e.g., sel)
  fadeSel,        // a *D3 selection* you want to fade in (e.g., the root <g>)
  animateFinal,   // function to run AFTER the fade completes
  fadeMs = 700,   // fade duration
  threshold = 0.45,
  ease = null     // optional d3 ease fn (pass d3.easeCubicOut from the chart)
} = {}){
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  const target = el?.closest?.('.scene') ?? el ?? document.body;

  // ensure hidden to start (so it fades to the *initial* state you’ve drawn)
  fadeSel.style('opacity', 0);

  const start = ()=>{
    const t = fadeSel.transition().duration(fadeMs);
    if(ease) t.ease(ease);
    t.style('opacity', 1).on('end', animateFinal);
  };

  if ('IntersectionObserver' in window && target) {
    const io = new IntersectionObserver((entries, obs)=>{
      if (entries.some(e => e.isIntersecting)) { obs.disconnect(); start(); }
    }, { threshold });
    io.observe(target);
  } else {
    // fallback
    start();
  }
}
const tooltipEl=document.createElement('div');
tooltipEl.className='tooltip';
document.body.appendChild(tooltipEl);
export const showTip=(x,y,html)=>{ tooltipEl.style.opacity=1; tooltipEl.style.left=`${x}px`; tooltipEl.style.top=`${y}px`; tooltipEl.innerHTML=html; };
export const hideTip=()=>{ tooltipEl.style.opacity=0; };
export const LAYOUTS={
  'panel': (id, {textFrac=.22, gapFrac=.03, figFrac=.66, figSel, textSel}) => {
    const textEl=document.querySelector(textSel), figEl=document.querySelector(figSel);
    if(!textEl || !figEl) return;
    const labelH=cssPxVar('--labelH',48), captionH=cssPxVar('--captionH',90);
    const avail=window.innerHeight-labelH-captionH;
    const textH=avail*textFrac, gap=avail*gapFrac, figH=avail*figFrac;
    textEl.style.top=`${labelH + textH/2 + 40}px`; textEl.style.width='min(1120px,90vw)';
    figEl.style.top=`${labelH + textH + 40 + gap}px`; figEl.style.width='90%'; figEl.style.height=`${figH}px`;
  },
  'table': (id, {textFrac=.25, gapFrac=.02, figSel, textSel}) => {
    const textEl=document.querySelector(textSel), figEl=document.querySelector(figSel);
    if(!textEl || !figEl) return;
    const labelH=cssPxVar('--labelH',48), captionH=cssPxVar('--captionH',90);
    const avail=window.innerHeight-labelH-captionH;
    const textH=avail*textFrac, gap=avail*gapFrac;
    textEl.style.top=`${labelH + textH/2 + 40}px`; textEl.style.width='min(1120px,90vw)';
    figEl.style.top=`${labelH + textH + 40 + gap}px`; figEl.style.maxHeight=`calc(100vh - ${labelH + textH + gap + captionH}px - 16px)`;
  },
  'credits': (id) => {
    const labelH=cssPxVar('--labelH',48), captionH=cssPxVar('--captionH',90);
    const avail=window.innerHeight-labelH-captionH, h=avail*.80, top=labelH+(avail-h)/2;
    const vp=document.querySelector(`#${id} .credits-viewport`); if(vp){ vp.style.height=`${h}px`; vp.style.top=`${top}px`; }
  }
};
