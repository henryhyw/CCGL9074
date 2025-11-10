import { d3 } from '../deps.js';
import { dur, globalReveal } from '../core/utils.js';

export function build(sel, props){
  const box = document.querySelector(sel);

  // Placement inside slide
  const wrap = box.closest('.text-wrap');
  if(wrap){
    const h = (props.halign || 'center');
    const map = {left:'start', center:'center', right:'end'};
    wrap.style.justifyItems = map[h] || 'center';
    wrap.style.alignItems = 'center';
  }

  // Text alignment + content
  box.style.textAlign = props.align || 'center';

  const kicker = props.kicker ? `<div class="text-kicker">${props.kicker}</div>` : '';
  const titleSize = (props.sizes?.title || 'clamp(2.8rem,6vw,6rem)');
  const subSize = (props.sizes?.subtitle || '1rem');
  const bodySize = (props.sizes?.body || '1rem');
  const bodyHTML = props.bodyHTML ? `<div class="text-body" style="font-size:${bodySize}">${props.bodyHTML}</div>` : '';
  const titleHTML = props.title ? `<h1 class="text-title" style="font-size:${titleSize}">${props.title}</h1>` : '';
  const subHTML = props.subtitle ? `<p class="text-sub" style="font-size:${subSize}">${props.subtitle}</p>` : '';

  box.innerHTML = `${kicker}${titleHTML}${subHTML}${bodyHTML}`;

  // Global-style fade for text box
  globalReveal({
    container: sel,
    fadeSel: d3.select(box),
    fadeMs: dur(450),
    ease: d3.easeCubicOut,
    animateFinal(){ /* no extra animation needed for text */ }
  });
}