import { d3 } from '../deps.js';
import { dur, globalReveal } from '../core/utils.js';

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

  const rowsEls = [];
  props.rows.forEach((row)=>{
    const tr = document.createElement('tr');
    props.columns.forEach(c=>{
      const td = document.createElement('td');
      td.textContent = (row[c.key] ?? '');
      tr.appendChild(td);
    });
    tr.style.opacity=0; tr.style.transform='translateY(6px)';
    tbody.appendChild(tr);
    rowsEls.push(tr);
  });

  // Fade in the whole table, then stagger rows
  globalReveal({
    container: sel,
    fadeSel: d3.select(wrap),
    fadeMs: dur(400),
    ease: d3.easeCubicOut,
    animateFinal(){
      rowsEls.forEach((tr, i)=>{
        setTimeout(()=>{
          tr.style.transition='opacity .8s ease, transform .8s ease';
          tr.style.opacity=1;
          tr.style.transform='none';
        }, (props.staggerMs||180)*i);
      });
    }
  });
}
