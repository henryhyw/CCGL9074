// utils.js
import { d3 } from '../deps.js';

export const SPEED = 1.6;
export const dur = (ms)=>ms*SPEED;
export const dly = (ms)=>ms*SPEED;
export const select=(s,el=document)=>el.querySelector(s);

// IMPORTANT: make SVGs fill the container (no phantom padding),
// top-align content so there’s no big gap above the <g>, and keep responsive.
export const createSVG=(parent,w,h)=> d3.select(parent).append('svg')
  .attr('viewBox', `0 0 ${w} ${h}`)
  .attr('preserveAspectRatio','xMidYMin meet')
  .attr('width','100%')
  .attr('height','100%')
  .style('display','block');

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

/**
 * Fade an element in and, at the SAME TIME, flip scene chrome (label/caption).
 * This matches the legacy feel (labels/captions fade with text).
 */
export function globalReveal({ container, fadeSel, fadeMs=600, ease=d3.easeCubicOut, animateFinal }){
  const root = (typeof container === 'string') ? document.querySelector(container) : container;
  const sceneEl = root?.closest('.scene');

  // ensure starting state
  if (fadeSel) fadeSel.style('opacity', 0);

  // flip chrome ON immediately so label/caption animate with text
  if (sceneEl) sceneEl.classList.add('fx-on');

  // kick the fade
  if (fadeSel) {
    fadeSel
      .transition()
      .duration(fadeMs)
      .ease(ease)
      .style('opacity', 1)
      .on('end', () => {
        if (typeof animateFinal === 'function') animateFinal();
      });
  } else {
    if (typeof animateFinal === 'function') animateFinal();
  }
}

/** Tooltip helpers (unchanged) */
const tooltipEl=document.createElement('div');
tooltipEl.className='tooltip';
document.body.appendChild(tooltipEl);
export const showTip=(x,y,html)=>{ tooltipEl.style.opacity=1; tooltipEl.style.left=`${x}px`; tooltipEl.style.top=`${y}px`; tooltipEl.innerHTML=html; };
export const hideTip=()=>{ tooltipEl.style.opacity=0; };

/**
 * LAYOUTS — replicate legacy positioning, but robust:
 * - Reserve label/caption heights
 * - Text-only slides: text uses full available height
 * - Figure-only slides: figure uses full available height
 * - Text+Figure: text sits above figure with a controlled gap
 * - SVG never exceeds the available space (no caption overlap)
 */
export const LAYOUTS={
  'panel': (id, {textFrac=.22, gapFrac=.03, figFrac=.66, figSel, textSel, hAlign='center'}) => {
    const textEl=document.querySelector(textSel), figEl=document.querySelector(figSel);
    if(!textEl || !figEl) return;

    // Stage metrics
    const labelH=cssPxVar('--labelH',48), captionH=cssPxVar('--captionH',90);
    const avail=window.innerHeight-labelH-captionH;
    const textH=avail*textFrac, gap=avail*gapFrac, figH=avail*figFrac;

    // --- TEXT placement (midline of the reserved band + robust margins)
    const padTop = 40; // breathing room below label
    const padX = Math.max(window.innerWidth*0.05, 48); // "legacy" feel: ignore dotnavs, keep nice margins
    const textMid = labelH + (textH/2) + padTop;

    textEl.style.position = 'absolute';
    textEl.style.top = `${textMid}px`;
    textEl.style.maxWidth = 'min(1120px, 90vw)'; // keeps previous feel

    // Horizontal align — keep margin gutters
    if (hAlign === 'left'){
      textEl.style.left = `${padX}px`;
      textEl.style.right = '';
      textEl.style.transform = 'translateY(-50%)';
      textEl.style.textAlign = 'left';
    } else if (hAlign === 'right'){
      textEl.style.left = '';
      textEl.style.right = `${padX}px`;
      textEl.style.transform = 'translateY(-50%)';
      textEl.style.textAlign = 'right';
    } else {
      // center
      textEl.style.left = '50%';
      textEl.style.right = '';
      textEl.style.transform = 'translate(-50%, -50%)';
      textEl.style.textAlign = 'center';
    }

    // --- FIGURE placement (unchanged behavior)
    figEl.style.position = 'absolute';
    figEl.style.left = '50%';
    figEl.style.transform = 'translateX(-50%)';
    figEl.style.top = `${labelH + textH + padTop + gap}px`;
    figEl.style.width = '90%';
    figEl.style.height = `${figH}px`;
    figEl.style.maxHeight = `${figH}px`;
    figEl.style.overflow = 'hidden';
  },

  'table': (id, {textFrac=.25, gapFrac=.02, figSel, textSel, hAlign='center'}) => {
    const textEl=document.querySelector(textSel), figEl=document.querySelector(figSel);
    if(!textEl || !figEl) return;

    const labelH=cssPxVar('--labelH',48), captionH=cssPxVar('--captionH',90);
    const avail=window.innerHeight-labelH-captionH;
    const textH=avail*textFrac, gap=avail*gapFrac;

    const padTop = 40;
    const padX = Math.max(window.innerWidth*0.05, 48);
    const textMid = labelH + (textH/2) + padTop;

    // TEXT
    textEl.style.position = 'absolute';
    textEl.style.top = `${textMid}px`;
    textEl.style.maxWidth = 'min(1120px, 90vw)';
    if (hAlign === 'left'){
      textEl.style.left = `${padX}px`;
      textEl.style.right = '';
      textEl.style.transform = 'translateY(-50%)';
      textEl.style.textAlign = 'left';
    } else if (hAlign === 'right'){
      textEl.style.left = '';
      textEl.style.right = `${padX}px`;
      textEl.style.transform = 'translateY(-50%)';
      textEl.style.textAlign = 'right';
    } else {
      textEl.style.left = '50%';
      textEl.style.right = '';
      textEl.style.transform = 'translate(-50%, -50%)';
      textEl.style.textAlign = 'center';
    }

    // TABLE FIGURE — adaptive height, but never collides with caption
    const tableTop = labelH + textH + padTop + gap;
    const maxH = Math.max(160, window.innerHeight - tableTop - captionH - 16);

    figEl.style.position = 'absolute';
    figEl.style.left = '50%';
    figEl.style.transform = 'translateX(-50%)';
    figEl.style.top = `${tableTop}px`;
    figEl.style.width = 'min(1120px, 92vw)';
    figEl.style.height = 'auto';             // key: let it size to rows
    figEl.style.maxHeight = `${maxH}px`;     // but keep it within stage
    figEl.style.overflow = 'auto';           // scroll if too tall
  },

  credits: (id) => {
    const labelH   = cssPxVar('--labelH',48);
    const captionH = cssPxVar('--captionH',90);
    const avail    = window.innerHeight - labelH - captionH;
    const h        = Math.round(avail * 0.80);
    const top      = labelH + Math.round((avail - h)/2);
    const vp=document.querySelector(`#${id} .credits-viewport`);
    if(vp){ vp.style.height=`${h}px`; vp.style.top=`${top}px`; }
  }
};