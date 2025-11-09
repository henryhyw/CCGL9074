import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export function build(sel, props){
  const wrap = document.querySelector(sel);
  wrap.innerHTML = '';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.appendChild(thead); table.appendChild(tbody);
  wrap.appendChild(table);
  const trh = document.createElement('tr');
  props.columns.forEach(c=>{
    const th = document.createElement('th');
    th.textContent = c.title;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  props.rows.forEach((row,i)=>{
    const tr = document.createElement('tr');
    props.columns.forEach(c=>{
      const td = document.createElement('td');
      td.textContent = (row[c.key] ?? '');
      tr.appendChild(td);
    });
    tr.style.opacity=0; tr.style.transform='translateY(6px)';
    tbody.appendChild(tr);
    setTimeout(()=>{ tr.style.transition='opacity .8s ease, transform .8s ease'; tr.style.opacity=1; tr.style.transform='none'; }, (props.staggerMs||180)*i);
  });
}
