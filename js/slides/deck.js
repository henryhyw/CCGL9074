// js/deck.js — redesigned story: DC growth → electricity draw → prices + water stress

// Simple formatters (no d3 imports here)
const d3formatYear = v => String(v);
const d3formatDefault = v => {
  if (v == null || isNaN(v)) return '';
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v/1e9).toFixed(1) + 'G';
  if (abs >= 1e6) return (v/1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (v/1e3).toFixed(1) + 'k';
  return String(Math.round(v));
};

import { warmJsons } from '../core/geoWarm.js';

warmJsons([
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
]);

const defaultBasemap = {
  url:'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  object:'states',
  sphereFill:'rgba(255,255,255,.0)',
  stateFill:'rgba(255,255,255,.35)',
  stateStroke:'rgba(255,255,255,.12)',
  stateStrokeWidth:0.6
};

// ---- Data (materialized from datasets) ----
const globalTopCountries = [
  { country:'United States', sites:4214, share:'37.8%' },
  { country:'United Kingdom', sites:514, share:'4.6%' },
  { country:'Germany', sites:490, share:'4.4%' },
  { country:'China', sites:381, share:'3.4%' },
  { country:'France', sites:321, share:'2.9%' },
  { country:'Canada', sites:295, share:'2.6%' },
  { country:'Rest of world', sites:4937, share:'44.3%' }
];

const usTopSites = [
  { name:'Virginia', lon:-79.013672, lat:37.160317, sites:666, share:15.8 },
  { name:'Texas', lon:-99.404297, lat:31.728167, sites:413, share:9.8 },
  { name:'California', lon:-119.970703, lat:36.668419, sites:321, share:7.6 },
  { name:'Illinois', lon:-89.384766, lat:40.178873, sites:244, share:5.8 },
  { name:'Ohio', lon:-83.056641, lat:40.446947, sites:203, share:4.8 },
  { name:'Arizona', lon:-112.236328, lat:34.161818, sites:164, share:3.9 },
  { name:'Georgia', lon:-83.496094, lat:32.472695, sites:163, share:3.9 },
  { name:'New York', lon:-75.234375, lat:42.617791, sites:142, share:3.4 },
  { name:'Oregon', lon:-121.025391, lat:43.707594, sites:137, share:3.3 },
  { name:'Washington', lon:-121.025391, lat:47.100045, sites:134, share:3.2 },
  { name:'Florida', lon:-83.056641, lat:28.613459, sites:126, share:3.0 },
  { name:'North Carolina', lon:-80.068359, lat:35.675147, sites:110, share:2.6 }
];

const estTrend = [
  { x:2015, y:17799 }, { x:2016, y:19493 }, { x:2017, y:21244 }, { x:2018, y:23700 }, { x:2019, y:26397 },
  { x:2020, y:30112 }, { x:2021, y:37164 }, { x:2022, y:46696 }, { x:2023, y:52770 }, { x:2024, y:55259 }
];

const priceTrendUS = [
  { x:2015, y:13.22 }, { x:2016, y:13.17 }, { x:2017, y:13.52 }, { x:2018, y:13.62 }, { x:2019, y:13.75 },
  { x:2020, y:13.80 }, { x:2021, y:14.23 }, { x:2022, y:15.63 }, { x:2023, y:16.68 }, { x:2024, y:17.05 }
];

const estTrendIndex = [
  { x:2015, y:100.0 }, { x:2016, y:109.5 }, { x:2017, y:119.3 }, { x:2018, y:133.1 }, { x:2019, y:148.4 },
  { x:2020, y:169.2 }, { x:2021, y:208.9 }, { x:2022, y:262.4 }, { x:2023, y:296.6 }, { x:2024, y:310.7 }
];

const priceTrendUSIndex = [
  { x:2015, y:100.0 }, { x:2016, y:99.6 }, { x:2017, y:102.3 }, { x:2018, y:103.0 }, { x:2019, y:104.0 },
  { x:2020, y:104.4 }, { x:2021, y:107.6 }, { x:2022, y:118.2 }, { x:2023, y:126.2 }, { x:2024, y:128.9 }
];

const growthLeaderRows = [
  { state:'Alabama', start:131, end:1420, growth:'+984%' },
  { state:'Connecticut', start:156, end:1583, growth:'+915%' },
  { state:'District of Columbia', start:79, end:614, growth:'+677%' },
  { state:'North Dakota', start:24, end:178, growth:'+642%' },
  { state:'Maine', start:51, end:338, growth:'+563%' }
];

const aiSeries = {
  ai: [
    { x:2025, y:44 }, { x:2026, y:62 }, { x:2027, y:83 },
    { x:2028, y:102 }, { x:2029, y:124 }, { x:2030, y:156 }
  ],
  nonAi: [
    { x:2025, y:38 }, { x:2026, y:40 }, { x:2027, y:45 },
    { x:2028, y:50 }, { x:2029, y:56 }, { x:2030, y:64 }
  ]
};

const buildTimelineItems = [
  { name:'Data center shell + fit-out', max:18, color:'var(--brand)' },
  { name:'Battery storage', max:24, color:'var(--brand-2)' },
  { name:'Utility-scale solar', max:30, color:'var(--brand-2)' },
  { name:'Gas-fired (planned)', max:36, color:'var(--accent)' },
  { name:'Wind onshore', max:42, color:'var(--brand-2)' },
  { name:'Coal retrofit/new', max:54, color:'var(--muted)' },
  { name:'Wind offshore', max:60, color:'var(--brand-2)' },
  { name:'Conventional geothermal', max:66, color:'var(--muted)' },
  { name:'Gas-fired (unplanned)', max:78, color:'var(--danger)' },
  { name:'Hydropower plant', max:120, color:'var(--danger)' },
  { name:'Transmission line', max:120, color:'var(--danger)' },
  { name:'Nuclear (traditional fission)', max:120, color:'var(--danger)' }
];

const priceSeries = {
  VA: [
    { x:2015, y:11.37 }, { x:2016, y:11.36 }, { x:2017, y:11.55 }, { x:2018, y:11.73 }, { x:2019, y:12.07 },
    { x:2020, y:12.03 }, { x:2021, y:11.96 }, { x:2022, y:13.34 }, { x:2023, y:14.26 }, { x:2024, y:14.41 }
  ],
  TX: [
    { x:2015, y:11.56 }, { x:2016, y:10.99 }, { x:2017, y:11.01 }, { x:2018, y:11.20 }, { x:2019, y:11.76 },
    { x:2020, y:11.71 }, { x:2021, y:12.11 }, { x:2022, y:13.76 }, { x:2023, y:14.46 }, { x:2024, y:14.94 }
  ],
  CA: [
    { x:2015, y:16.99 }, { x:2016, y:17.39 }, { x:2017, y:18.31 }, { x:2018, y:18.84 }, { x:2019, y:19.15 },
    { x:2020, y:20.45 }, { x:2021, y:22.82 }, { x:2022, y:25.84 }, { x:2023, y:29.51 }, { x:2024, y:31.97 }
  ],
  US: [
    { x:2015, y:13.22 }, { x:2016, y:13.17 }, { x:2017, y:13.52 }, { x:2018, y:13.62 }, { x:2019, y:13.75 },
    { x:2020, y:13.80 }, { x:2021, y:14.23 }, { x:2022, y:15.63 }, { x:2023, y:16.68 }, { x:2024, y:17.05 }
  ]
};

const priceTableRows = [
  { state:'California', share:'3.7%',  p2015:'16.99', p2024:'31.97', delta:'+14.98' },
  { state:'Oregon',     share:'11.4%', p2015:'10.66', p2024:'14.70', delta:'+4.04' },
  { state:'Texas',      share:'4.6%',  p2015:'11.56', p2024:'14.94', delta:'+3.38' },
  { state:'Virginia',   share:'25.6%', p2015:'11.37', p2024:'14.41', delta:'+3.04' },
  { state:'Arizona',    share:'7.4%',  p2015:'12.13', p2024:'14.91', delta:'+2.78' },
  { state:'Nevada',     share:'8.7%',  p2015:'12.76', p2024:'15.00', delta:'+2.24' }
];

const electricityShareMap = {
  "Alabama":0.017,"Arizona":0.074,"California":0.037,"Colorado":0.027,"Connecticut":0.01,"Delaware":0.003,"Florida":0.006,"Georgia":0.022,
  "Idaho":0.052,"Illinois":0.055,"Indiana":0.019,"Iowa":0.114,"Kansas":0.008,"Kentucky":0.01,"Louisiana":0.002,"Maine":0.0,"Maryland":0.021,
  "Massachusetts":0.022,"Michigan":0.019,"Minnesota":0.025,"Missouri":0.011,"Nebraska":0.117,"Nevada":0.087,"New Hampshire":0.0,"New Jersey":0.001,
  "New Mexico":0.006,"New York":0.024,"North Carolina":0.013,"North Dakota":0.0,"Ohio":0.033,"Oklahoma":0.017,"Oregon":0.114,"Pennsylvania":0.004,
  "Rhode Island":0.0,"South Carolina":0.011,"South Dakota":0.004,"Tennessee":0.013,"Texas":0.015,"Utah":0.077,"Vermont":0.0,"Virginia":0.256,
  "Washington":0.057,"West Virginia":0.011,"Wisconsin":0.008,"Wyoming":0.113
};

const electricityCorrPoints = [
  {"name":"Virginia","datacenters":666,"elec_pct":0.256},
  {"name":"Nebraska","datacenters":39,"elec_pct":0.117},
  {"name":"Oregon","datacenters":137,"elec_pct":0.114},
  {"name":"Iowa","datacenters":105,"elec_pct":0.114},
  {"name":"Wyoming","datacenters":15,"elec_pct":0.113},
  {"name":"Nevada","datacenters":62,"elec_pct":0.087},
  {"name":"Utah","datacenters":44,"elec_pct":0.077},
  {"name":"Arizona","datacenters":164,"elec_pct":0.074},
  {"name":"Washington","datacenters":134,"elec_pct":0.057},
  {"name":"Illinois","datacenters":244,"elec_pct":0.055},
  {"name":"New Jersey","datacenters":82,"elec_pct":0.054},
  {"name":"Texas","datacenters":413,"elec_pct":0.046},
  {"name":"North Dakota","datacenters":22,"elec_pct":0.044},
  {"name":"Georgia","datacenters":163,"elec_pct":0.043},
  {"name":"California","datacenters":321,"elec_pct":0.037},
  {"name":"Montana","datacenters":27,"elec_pct":0.036},
  {"name":"Pennsylvania","datacenters":101,"elec_pct":0.032},
  {"name":"New York","datacenters":142,"elec_pct":0.028},
  {"name":"Colorado","datacenters":60,"elec_pct":0.027},
  {"name":"South Carolina","datacenters":30,"elec_pct":0.025},
  {"name":"Massachusetts","datacenters":49,"elec_pct":0.022},
  {"name":"Maryland","datacenters":135,"elec_pct":0.021},
  {"name":"Tennessee","datacenters":75,"elec_pct":0.013},
  {"name":"Ohio","datacenters":203,"elec_pct":0.016},
  {"name":"North Carolina","datacenters":110,"elec_pct":0.019},
  {"name":"Florida","datacenters":126,"elec_pct":0.006},
  {"name":"Michigan","datacenters":58,"elec_pct":0.005}
];

const waterCorrPoints = [
  {"name":"California","datacenters":321,"scarcity":244.9218,"footprint":19.60878},
  {"name":"Texas","datacenters":413,"scarcity":8.936889,"footprint":3.725257},
  {"name":"Florida","datacenters":126,"scarcity":1.525329,"footprint":6.537948},
  {"name":"Virginia","datacenters":666,"scarcity":1.158254,"footprint":3.378927},
  {"name":"Illinois","datacenters":244,"scarcity":0.760778,"footprint":2.469428},
  {"name":"New York","datacenters":142,"scarcity":1.352035,"footprint":2.360777},
  {"name":"Missouri","datacenters":55,"scarcity":0.82114,"footprint":6.049557},
  {"name":"Georgia","datacenters":163,"scarcity":1.152827,"footprint":3.068456},
  {"name":"Oregon","datacenters":137,"scarcity":33.89067,"footprint":8.228881},
  {"name":"Ohio","datacenters":203,"scarcity":0.73454,"footprint":2.996501},
  {"name":"Colorado","datacenters":60,"scarcity":61.51373,"footprint":5.097351},
  {"name":"Washington","datacenters":134,"scarcity":89.1991,"footprint":8.543733},
  {"name":"Arizona","datacenters":164,"scarcity":129.3905,"footprint":19.13328},
  {"name":"Nevada","datacenters":62,"scarcity":159.1618,"footprint":20.54477},
  {"name":"New Jersey","datacenters":82,"scarcity":1.38814,"footprint":7.436839},
  {"name":"North Carolina","datacenters":110,"scarcity":1.077524,"footprint":7.620251},
  {"name":"Iowa","datacenters":105,"scarcity":0.982694,"footprint":5.753424},
  {"name":"Minnesota","datacenters":81,"scarcity":1.440265,"footprint":4.762337},
  {"name":"Massachusetts","datacenters":49,"scarcity":1.217586,"footprint":2.450075},
  {"name":"Michigan","datacenters":58,"scarcity":0.985253,"footprint":4.342229}
];

const waterScarcityByState = {
  "Alabama":0.996,"Arizona":129.391,"Arkansas":0.526,"California":244.922,"Colorado":61.514,"Connecticut":1.069,
  "Delaware":1.343,"District of Columbia":0.388,"Florida":1.525,"Georgia":1.153,"Idaho":13.248,"Illinois":0.761,
  "Indiana":0.682,"Iowa":0.983,"Kansas":10.249,"Kentucky":1.064,"Louisiana":0.598,"Maine":1.124,"Maryland":1.124,
  "Massachusetts":1.218,"Michigan":0.985,"Minnesota":1.440,"Mississippi":1.383,"Missouri":0.821,"Montana":17.899,
  "Nebraska":8.864,"Nevada":159.162,"New Hampshire":1.018,"New Jersey":1.388,"New Mexico":82.157,"New York":1.352,
  "North Carolina":1.078,"North Dakota":5.776,"Ohio":0.735,"Oklahoma":2.327,"Oregon":33.891,"Pennsylvania":1.062,
  "South Carolina":1.102,"South Dakota":4.585,"Tennessee":1.045,"Texas":8.937,"Utah":103.210,"Vermont":1.139,
  "Virginia":1.158,"Washington":89.199,"West Virginia":0.809,"Wisconsin":0.897,"Wyoming":46.151
};

const waterFootprintByState = {
  "Alabama":5.914,"Arizona":19.133,"Arkansas":4.137,"California":19.609,"Colorado":5.097,"Connecticut":1.652,"Delaware":2.475,"Washington, D.C.":3.379,"Florida":6.538,"Georgia":3.068,"Idaho":2.946,"Illinois":2.469,"Indiana":2.954,"Iowa":5.753,"Kansas":2.341,"Kentucky":4.410,"Louisiana":2.274,"Maine":21.299,"Maryland":4.836,"Massachusetts":2.450,"Michigan":4.342,"Minnesota":4.762,"Mississippi":10.746,"Missouri":6.050,"Montana":2.482,"Nebraska":2.254,"Nevada":20.545,"New Hampshire":2.559,"New Jersey":7.437,"New Mexico":13.744,"New York":2.361,"North Carolina":7.620,"North Dakota":6.687,"Ohio":2.997,"Oklahoma":3.858,"Oregon":8.229,"Pennsylvania":3.296,"South Carolina":6.902,"South Dakota":2.539,"Tennessee":4.475,"Texas":3.725,"Utah":20.169,"Vermont":4.866,"Virginia":3.379,"Washington":8.544,"West Virginia":6.452,"Wisconsin":5.274,"Wyoming":3.655
};

const waterUsageRows = [
  { type:'Hyperscale campus', perDay:'550,000', perYear:'200,000,000' },
  { type:'Wholesale/retail avg site', perDay:'18,000', perYear:'6,570,000' },
  { type:'Wholesale/retail high site', perDay:'88,000', perYear:'32,100,000' }
];

const waterSankeyNodes = [
  { name:'DC build' },
  { name:'Cooling water' },
  { name:'Hyperscale sites' },
  { name:'Wholesale sites' },
  { name:'High-stress basins (40%)' },
  { name:'Lower-stress basins (60%)' }
];

const waterSankeyLinks = [
  { source:'DC build', target:'Cooling water', value:100 },
  { source:'Cooling water', target:'Hyperscale sites', value:60 },
  { source:'Cooling water', target:'Wholesale sites', value:40 },
  { source:'Hyperscale sites', target:'High-stress basins (40%)', value:24 },
  { source:'Hyperscale sites', target:'Lower-stress basins (60%)', value:36 },
  { source:'Wholesale sites', target:'High-stress basins (40%)', value:16 },
  { source:'Wholesale sites', target:'Lower-stress basins (60%)', value:24 }
];

const waterBubbleSites = [
  { name:'California', lon:-119.970703, lat:36.668419, footprint:19.61, scarcity:244.92 },
  { name:'Nevada', lon:-116.419389, lat:38.502032, footprint:20.54, scarcity:159.16 },
  { name:'Arizona', lon:-112.236328, lat:34.161818, footprint:19.13, scarcity:129.39 },
  { name:'Utah', lon:-111.888229, lat:39.32155, footprint:20.17, scarcity:103.21 },
  { name:'New Mexico', lon:-106.018066, lat:34.51994, footprint:13.74, scarcity:82.16 },
  { name:'Washington', lon:-121.025391, lat:47.100045, footprint:8.54, scarcity:89.20 }
];

const deck = {
  themeVars: {
    '--bg': '#0f1115','--ink': '#e6e9ef','--muted': '#9aa4b2',
    '--brand':'#7bdff2','--brand-2':'#f7b267','--accent':'#f79d65','--danger':'#ef5d60','--ok':'#19d97b',
    '--panel':'rgba(17,18,23,.6)',
    '--fs-title-xs':'clamp(1.8rem,3vw,3rem)',
    '--fs-title-sm':'clamp(2.2rem,3.8vw,3.6rem)',
    '--fs-title-md':'clamp(2.8rem,6vw,6rem)',
    '--fs-title-lg':'clamp(3.4rem,7vw,7rem)',
    '--fs-subtitle-xs':'clamp(0.9rem,1.3vw,1.1rem)',
    '--fs-subtitle-sm':'clamp(1.0rem,1.6vw,1.25rem)',
    '--fs-subtitle-md':'clamp(1.15rem,1.9vw,1.4rem)',
    '--fs-subtitle-lg':'clamp(1.3rem,2.2vw,1.6rem)',
    '--fs-body-xs':'clamp(0.95rem,1.2vw,1.05rem)',
    '--fs-body-sm':'clamp(1.0rem,1.4vw,1.15rem)',
    '--fs-body-md':'clamp(1.08rem,1.6vw,1.25rem)',
    '--fs-body-lg':'clamp(1.2rem,1.9vw,1.35rem)'
  },

  mediaGroups: [
    { id:'group-1', media:{ type:'video', src:'media/vid-overview c.mp4', muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-2', media:{ type:'video', src:'media/vid-urban c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-3', media:{ type:'video', src:'media/vid-impacts c.mp4',  muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-4', media:{ type:'video', src:'media/vid-future c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } }
  ],

  slides: [
    // Introduction
    {
      id:'scene-cover', group:'group-1', nav:'Cover',
      figures:[{
        type:'text',
        figSel:'#cover-box',
        props:{
          kicker:'CCGL9074 · Group 8',
          title:'US Data Center Boom<br/>and<br/>Its **Urban Impact**',
          subtitle:'More than two new US sites a week—what that means for power, prices, water, and communities',
          align:'center', halign:'center',
          sizes:{ title:'lg', subtitle:'md', body:'sm' }
        }
      }]
    },
    {
      id:'scene-what-is-dc', group:'group-1', nav:'What is a DC?',
      figures:[{
        type:'text',
        figSel:'#what-is-dc',
        props:{
          kicker:'What is a data center?',
          title:'A warehouse that turns __electricity__ into ==compute==',
          subtitle:'Hundreds of racks, nonstop power, heavy cooling (often water), and fiber routes—big campuses can drink as much water as a small city.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },

    // Section 1: Overall growth
    {
      id:'scene-global-table', group:'group-1', nav:'US share',
      label:'US vs world share',
      layout:{ textFrac:0.22, gapFrac:0.05 },
      figures:[
        {
          type:'text',
          figSel:'#global-table-text',
          props:{
            kicker:'Why focus on the US?',
            title:'US hosts more sites than the next six countries combined',
            subtitle:'**4,214** US sites = **37.8%** of global records; UK + Germany + China together hold **12.4%**.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'table',
          figSel:'#global-table',
          props:{
            columns:[{key:'country',title:'Country/Region'},{key:'sites',title:'Sites'},{key:'share',title:'Share of world'}],
            rows: globalTopCountries,
            staggerMs: 140,
            graphOpacity:1
          }
        }
      ],
      caption:'Source: DataCenterMap.com (global data center counts by country, accessed 2024).'
    },
    {
      id:'scene-us-share-text', group:'group-1', nav:'US share text',
      caption:'Source: DataCenterMap.com (global and US counts, accessed 2024).',
      figures:[{
        type:'text',
        figSel:'#us-share-text',
        props:{
          kicker:'Only the US has this footprint',
          title:'==37.8%== of all known sites sit in the US',
          subtitle:'No federal registry means estimates vary (Business Insider tallied 1,240 built/approved in 2024), but the dominant footprint is here—so the US story matters.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-us-map', group:'group-1', nav:'US map',
      label:'US clusters',
      figures:[
        {
          type:'text',
          figSel:'#us-map-text',
          props:{
            kicker:'Where sites cluster',
            title:'Top 12 states hold **67%** of US sites',
            subtitle:'Northern Virginia alone is **15.8%** (BI also counted 329 built/approved there); Texas 9.8%; California 7.6%.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'geo',
          figSel:'#us-map-fig',
          props:{
            basemap:{ ...defaultBasemap },
            layers:{
              bubbles:{
                data: usTopSites,
                r:'sites',
                rRange:[8,60],
                legend:{ values:[100,300,600], title:'Sites' },
                style:{ fill:'rgba(123,223,242,.22)', stroke:'rgba(123,223,242,.95)', strokeWidth:1.6 },
                label:{ show:true, text:d=> `${d.name} · ${d.sites}`, fontSize:'var(--fs-geoLabel, 13px)' },
                tooltip:d=> `<strong>${d.name}</strong><br/>${d.sites.toLocaleString()} sites<br/>${d.share.toFixed(1)}% of US`,
                anim:{ growMs:1400 }
              }
            },
            graphOpacity:1
          }
        }
      ],
      caption:'Source: DataCenterMap.com (US state counts, accessed 2024).'
    },
    {
      id:'scene-est-trend', group:'group-1', nav:'Growth trend',
      label:'US establishment trend',
      figures:[
        {
          type:'text',
          figSel:'#est-trend-text',
          props:{
            kicker:'Overall growth',
            title:'Establishments __tripled__ since 2015',
            subtitle:'17,799 → **55,259** (==+210%==); slope steepens after 2020 as AI/cloud accelerates builds.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'line',
          figSel:'#est-trend-line',
          props:{
            series:[{ id:'Establishments', data: estTrend, styles:{ stroke:'var(--brand)', strokeWidth:3 }, marker:{ show:true, r:5, fill:'var(--brand)' } }],
            axes:{ xTicks:6, yTicks:6, grid:true, xFormat:d3formatYear, yFormat:d3formatDefault, xLabel:'Year', yLabel:'Establishments' },
            curve:'MonotoneX',
            graphOpacity:1,
            legend:false
          }
        }
      ],
      caption:'Source: US Bureau of Labor Statistics (NAICS 518210 establishments, 2015–2024).'
    },
    {
      id:'scene-growth-leaders', group:'group-1', nav:'Top growth states',
      label:'Fastest-growing states',
      layout:{ textFrac:0.22, gapFrac:0.05 },
      figures:[
        {
          type:'text',
          figSel:'#growth-leaders-text',
          props:{
            kicker:'Where growth is hottest',
            title:'Smaller states led percentage growth',
            subtitle:'Alabama **+984%**, Connecticut **+915%**, DC **+677%**—growth is spreading inland, not just coasts.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'table',
          figSel:'#growth-leaders-table',
          props:{
            columns:[{key:'state',title:'State'},{key:'start',title:'2015'},{key:'end',title:'2024'},{key:'growth',title:'Growth'}],
            rows: growthLeaderRows,
            staggerMs: 160,
            graphOpacity:1
          }
        }
      ],
      caption:'Source: US Bureau of Labor Statistics (NAICS 518210 establishments, 2015–2024).'
    },
    {
      id:'scene-growth-question', group:'group-1', nav:'Why growing?',
      figures:[{
        type:'text',
        figSel:'#growth-question',
        props:{
          kicker:'Driver',
          title:'What is driving this acceleration?',
          subtitle:'Hyperscale cloud, edge buildout, and a swing toward ==AI workloads== push more sites, faster; BI notes hyperscalers are nearly 4× more numerous than in 2010.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-ai-shift', group:'group-1', nav:'AI rise',
      label:'AI workload rise',
      figures:[
        {
          type:'text',
          figSel:'#ai-shift-text',
          props:{
            kicker:'AI share',
            title:'AI overtakes other workloads',
            subtitle:'AI climbs from 54% (2025) to **71%** (2030); incremental AI adds 31 GW in 2030 alone.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'line',
          figSel:'#ai-shift-line',
          props:{
            series:[
              { id:'AI workload', data: aiSeries.ai, styles:{ stroke:'var(--accent)', strokeWidth:3 }, marker:{ show:true, r:5, fill:'var(--accent)' } },
              { id:'Non-AI workload', data: aiSeries.nonAi, styles:{ stroke:'var(--brand)', strokeWidth:3 }, marker:{ show:true, r:5, fill:'var(--brand)' } }
            ],
            axes:{ xTicks:6, yTicks:6, grid:true, xFormat:d3formatYear, yFormat:d=> d.toFixed(0), xLabel:'Year', yLabel:'Workload (GW)' },
            curve:'MonotoneX',
            graphOpacity:1,
            legend:true
          }
        }
      ],
      caption:'Source: McKinsey (2024) “The cost of compute: A $7 trillion race to scale data centers.”'
    },

    // Section 2: Electricity use & prices
    {
      id:'scene-electricity-intro', group:'group-2', nav:'Power stress',
      figures:[{
        type:'text',
        figSel:'#electricity-intro',
          props:{
            kicker:'Load concentration',
            title:'Clusters hit local grids first',
            subtitle:'IEA pegs US data centers at ~__183 TWh__ in 2024 (~45% of global DC use, >4% of US load) with a projected **+133%** to 426 TWh by 2030. We trace where that lands in state power shares and prices.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-electricity-map', group:'group-2', nav:'DC load map',
      label:'DC share of power',
      figures:[
        {
          type:'text',
          figSel:'#electricity-map-text',
          props:{
            kicker:'Electricity pull',
            title:'Some states already hit __double digits__',
            subtitle:'Virginia **25.6%**; Nebraska/Iowa/Oregon/Wyoming ~**11%**; Nevada 8.7%; Utah 7.7%; Arizona 7.4%—in a year when US electricity use already hit a record high.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'geo',
          figSel:'#electricity-map',
          props:{
            basemap:{
              ...defaultBasemap,
              choropleth:{
                valueByName: electricityShareMap,
                color:{ range:['#0c1c2f','#1d4f7a','#f7b267','#ef5d60'], domain:[0,0.02,0.08,0.26] },
                legend:{ title:'% of state electricity', format:'percent' }
              }
            },
            graphOpacity:1
          }
        }
      ],
      caption:'Source: Visual Capitalist, “Mapped: Data Center Electricity Consumption by State.”'
    },
    {
      id:'scene-electricity-text', group:'group-2', nav:'Load callouts',
      caption:'Source: Visual Capitalist (2024) “Mapped: Data Center Electricity Consumption by State.”',
      figures:[{
        type:'text',
        figSel:'#electricity-text',
        props:{
          kicker:'Load concentration',
          title:'DC electricity share is [rise]climbing[/rise] in key states',
          subtitle:'Virginia **25.6%**; Nebraska/Iowa/Oregon/Wyoming ~**11%**; Nevada 8.7%; Utah 7.7%; Arizona 7.4%. These hubs feel rising load most quickly—and still need interconnection approvals.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-electricity-corr', group:'group-2', nav:'Growth→Use',
      label:'Count vs power share',
      figures:[
        {
          type:'text',
          figSel:'#electricity-corr-text',
          props:{
            kicker:'Correlation',
            title:'More sites → higher electricity share (r ≈ **0.62**)',
            subtitle:'Virginia: 666 sites, 25.6% of state load; Oregon/Iowa/Wyoming/Nebraska: ~11% bands.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'scatter',
          figSel:'#electricity-corr-fig',
          props:{
            points: electricityCorrPoints.map(p=>({ dist:p.datacenters, cap:p.elec_pct*100, name:p.name })),
            xLabel:'Data center count', yLabel:'% of state electricity consumed',
            xDomain:[0,700], yDomain:[0,30],
            capFmt:v=> v.toFixed(1),
            tooltipFmt:d=> `<strong>${d.name}</strong><br/>${Math.round(d.dist)} sites · ${d.cap.toFixed(1)}% of state electricity`,
            graphOpacity:1
          }
        }
      ],
      caption:'Sources: DataCenterMap (state DC counts); Visual Capitalist (DC electricity share).'
    },
    {
      id:'scene-electricity-question', group:'group-2', nav:'Enough power?',
      figures:[{
        type:'text',
        figSel:'#electricity-question',
        props:{
          kicker:'Challenge',
          title:'Power-on date now depends on **grid queue + hookups**',
          subtitle:'Do we have enough electricity where we need it? Long interconnection queues and permits—not construction speed—often decide when sites switch on.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-build-timeline', group:'group-2', nav:'Timelines',
      label:'Time to build vs energy',
      figures:[
        {
          type:'text',
          figSel:'#build-timeline-text',
          props:{
            kicker:'Schedule mismatch',
            title:'Data halls: 18–24 months; wires: ~10 years',
            subtitle:'Storage/solar are the only supply options on similar timelines.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'timeline',
          figSel:'#build-timeline-fig',
          props:{ items: buildTimelineItems, xMax:130, graphOpacity:1 }
        }
      ],
      caption:'Source: Deloitte (2023) “Few energy sources align with data center timelines.”'
    },
    {
      id:'scene-affected-question', group:'group-2', nav:'Who pays?',
      figures:[{
        type:'text',
        figSel:'#affected-question',
        props:{
          kicker:'Impact lens',
          title:'==Households== and small businesses feel rate __pressure__ first',
          subtitle:'Who bears the cost when grids stretch?',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-price-trend', group:'group-2', nav:'Price trend',
      label:'Residential prices',
      figures:[
        {
          type:'text',
          figSel:'#price-trend-text',
          props:{
            kicker:'Bills over time',
            title:'Hub-state prices rise faster than the US average',
            subtitle:'California **17¢ → 32¢**; Virginia and Texas trend up post-2021. Nationally prices move 13.2¢ → 17.1¢—a post-2020 rise that mirrors the establishment surge.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'line',
          figSel:'#price-trend-line',
          props:{
            series:[
              { id:'California', data: priceSeries.CA, styles:{ stroke:'var(--accent)', strokeWidth:3 }, marker:{ show:false } },
              { id:'Virginia', data: priceSeries.VA, styles:{ stroke:'var(--brand-2)', strokeWidth:3 }, marker:{ show:false } },
              { id:'Texas', data: priceSeries.TX, styles:{ stroke:'var(--brand)', strokeWidth:3 }, marker:{ show:false } }
            ],
            axes:{ xTicks:6, yTicks:6, grid:true, xFormat:d3formatYear, yFormat:v=> v.toFixed(1), xLabel:'Year', yLabel:'¢/kWh (residential)' },
            curve:'MonotoneX',
            legend:true,
            graphOpacity:1
          }
        }
      ],
      caption:'Source: US EIA Annual Electric Power Industry Report (residential price, 2015–2024).'
    },
    {
      id:'scene-price-pattern', group:'group-2', nav:'Post-2020',
      label:'Post-2020 rise',
      figures:[{
        type:'text',
        figSel:'#price-pattern-text',
        props:{
          kicker:'Pattern match',
          title:'Post-2020 __DC build surge__ matches the __price climb__',
          subtitle:'Establishments __30k → 55k__ (+83%) from 2020–2024; US residential price **13.8¢ → 17.1¢** (+24%). Same window, same upward push on grids.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }],
      caption:'Sources: US Bureau of Labor Statistics (NAICS 518210 establishments) and US EIA residential price (2015–2024).'
    },
    {
      id:'scene-price-table', group:'group-2', nav:'High-share states',
      label:'Hub-state price change',
      layout:{ textFrac:0.20, gapFrac:0.05 },
      figures:[
        {
          type:'text',
          figSel:'#price-table-text',
          props:{
            kicker:'Load to bills',
            title:'Prices in hub states rising',
            subtitle:'Largest DC hubs with notable price jumps: California (+15¢ to 32¢); Texas (+3.4¢); Virginia (+3.0¢ at 25.6% share); Oregon (+4.0¢ at 11.4% share); Arizona (+2.8¢); Nevada (+2.2¢).',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'table',
          figSel:'#price-table-fig',
          props:{
            columns:[{key:'state',title:'State'},{key:'share',title:'% of state electricity'},{key:'p2015',title:'2015 (¢/kWh)'},{key:'p2024',title:'2024 (¢/kWh)'},{key:'delta',title:'Change'}],
            rows: priceTableRows,
            staggerMs: 160,
            graphOpacity:1
          }
        }
      ],
      caption:'Sources: Visual Capitalist (state DC electricity share); EIA Annual Electric Power Industry Report (residential price); Pew/EPRI analyses of clustered load and rates.'
    },

    // Section 3: Water use & impacts
    {
      id:'scene-power-to-water', group:'group-3', nav:'Power → Water',
      figures:[{
        type:'text',
        figSel:'#power-to-water-text',
        props:{
          kicker:'Beyond electricity',
          title:'From grid strain to [glow]water strain[/glow]',
          subtitle:'High-load hubs are often in arid basins; ~40% of US data centers already sit in high-stress areas.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },
    {
      id:'scene-water-usage', group:'group-3', nav:'Water use',
      label:'Water per facility',
      layout:{ textFrac:0.20, gapFrac:0.05 },
      figures:[
        {
          type:'text',
          figSel:'#water-usage-text',
        props:{
          kicker:'Cooling volumes',
          title:'Hyperscale ~__550k gal/day__ (200M/yr)',
          subtitle:'Wholesale/retail averages ~18k gal/day (6.6M/yr). 550k gal/day is enough for ~6,500 Americans’ daily household use (USGS).',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'table',
          figSel:'#water-usage-table',
          props:{
            columns:[{key:'type',title:'Facility type'},{key:'perDay',title:'Per day (gallons)'},{key:'perYear',title:'Per year (gallons)'}],
            rows: waterUsageRows,
            staggerMs: 160,
            graphOpacity:1
          }
        }
      ],
      caption:'Source: EESI, “Data Centers and Water Consumption.”'
    },
    {
      id:'scene-transition-water', group:'group-3', nav:'Water?',
      label:'DC growth → water use → scarcity stress',
      figures:[
        {
          type:'text',
          figSel:'#transition-water',
          props:{
            kicker:'Beyond electricity',
            title:'DC growth → water use <br/>→ scarcity stress',
            subtitle:'Cooling demand flows to hyperscale and wholesale sites; a large share of that footprint sits in high water-stress basins.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'sankey',
          figSel:'#water-sankey',
          props:{
            nodes: waterSankeyNodes,
            links: waterSankeyLinks,
            graphOpacity:1
          }
        }
      ],
      caption:'Sources: Business Insider (2025) mapping of US data centers in high-stress basins; EESI (2023) water use ranges.'
    },
    {
      id:'scene-water-footprint', group:'group-3', nav:'Footprint map',
      label:'Water footprint by state',
      figures:[
        {
          type:'text',
          figSel:'#water-footprint-text',
          props:{
            kicker:'Per-unit draw',
            title:'Highest water footprints <br> cluster west',
            subtitle:'Nevada (20.5), Utah (20.2), California (19.6), Arizona (19.1), New Mexico (13.7), Washington (8.5).',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'geo',
          figSel:'#water-footprint-map',
          props:{
            basemap:{
              ...defaultBasemap,
              choropleth:{
                valueByName: waterFootprintByState,
                color:{ range:['#0f2b46','#1f5f8a','#f7b267','#ef5d60'], domain:[0,5,12,21.3] },
                legend:{ title:'Water unit footprint' }
              }
            },
            graphOpacity:1
          }
        }
      ],
      caption:'Source: Lu et al. (2025), Nature Sustainability, Figure 3h (water unit footprint).'
    },
    {
      id:'scene-water-scarcity', group:'group-3', nav:'Scarcity + footprint',
      label:'Scarcity + footprint overlay',
      figures:[
        {
          type:'text',
          figSel:'#water-scarcity-text',
          props:{
            kicker:'Stacked constraints',
            title:'High scarcity and high footprint overlap in the Southwest',
            subtitle:'Choropleth = scarcity index; bubbles = footprint (CA/AZ/NV/UT/Washington up to ~20 gal/unit). BI notes ~40% of US data centers already operate in high-stress basins.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'geo',
          figSel:'#water-scarcity-map',
          props:{
            basemap:{
              ...defaultBasemap,
              choropleth:{
                valueByName: waterScarcityByState,
                color:{ range:['#7ac7ff','#f7dda6','#ef946c','#b12a2f'], domain:[0,10,80,245] },
                legend:{ title:'Scarcity index' }
              }
            },
            layers:{
              bubbles:{
                data: waterBubbleSites,
                r:'footprint',
                rRange:[10,52],
                legend:{ values:[8,14,20], title:'Water footprint' },
                style:{ fill:'rgba(64,141,255,.22)', stroke:'rgba(64,141,255,.95)', strokeWidth:1.6 },
                label:{ show:true, text:d=> `${d.name} · ${d.footprint.toFixed(1)}` },
                tooltip:d=> `<strong>${d.name}</strong><br/>Footprint: ${d.footprint.toFixed(2)}<br/>Scarcity: ${d.scarcity.toFixed(1)}`,
                anim:{ growMs:1400 }
              }
            },
            graphOpacity:1
          }
        }
      ],
      caption:'Sources: Lu et al. (2025), Nature Sustainability (water scarcity/footprint); Business Insider (2025) water-stress mapping of US data centers.'
    },
    {
      id:'scene-water-corr2', group:'group-3', nav:'Footprint vs scarcity',
      label:'Footprint vs scarcity',
      figures:[
        {
          type:'text',
          figSel:'#water-corr2-text',
          props:{
            kicker:'Overlap check',
            title:'Higher footprint aligns with higher scarcity in key states',
            subtitle:'California/Arizona/Nevada cluster high on both axes; Washington is moderate footprint but high scarcity.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'scatter',
          figSel:'#water-corr2-fig',
          props:{
            points: waterCorrPoints.map(p=>({ dist:p.footprint, cap:p.scarcity, name:p.name })),
            xLabel:'Water footprint', yLabel:'Water scarcity index',
            xDomain:[0,22], yDomain:[0,260],
            distFmt:v=> v.toFixed(1),
            capFmt:v=> v.toFixed(0),
            tooltipFmt:d=> `<strong>${d.name}</strong><br/>Footprint ${d.dist.toFixed(1)} · scarcity ${d.cap.toFixed(0)}`,
            graphOpacity:1
          }
        }
      ],
      caption:'Source: Lu et al. (2025), Nature Sustainability (Figure 3h water scarcity and footprint).'
    },
    {
      id:'scene-water-affected', group:'group-3', nav:'Who is affected?',
      figures:[{
        type:'text',
        figSel:'#water-affected-text',
        props:{
          kicker:'Communities downstream',
          title:'Cooling draws compete with __domestic, agricultural, and ecological needs__—especially in ==arid western states==.',
          subtitle:'Scarce basins = tighter margins for households and farms',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }]
    },

    // Section 4: Summary & actions
    {
      id:'scene-summary', group:'group-4', nav:'Summary',
      figures:[
        {
          type:'text',
          figSel:'#summary-text',
          props:{
            kicker:'Recap',
            title:'Key takeaways',
            subtitle:'Growth is fast and concentrated; power shares and prices are rising in hub states; water stress overlaps western build zones.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'cards',
          figSel:'#summary-cards',
          props:{
            items:[
              { title:'Growth facts', icon:'fa-database', bullets:['US = 38% of global sites','Establishments +210% (2015→2024)','AI dominates by 2030'] },
              { title:'Concentration', icon:'fa-location-dot', bullets:['12 states hold 67% of US sites','VA/TX/CA together ≈ one-third of US sites','Electricity share hits 25%+ in VA'] },
              { title:'Impacts', icon:'fa-bolt', bullets:['IEA: US DCs ~183 TWh (45% of global DC use)','Hub-state prices trending up post-2020','BI: ~40% of US DCs already in high water-stress areas'] }
            ]
          }
        }
      ]
    },
    {
      id:'scene-solutions', group:'group-4', nav:'Solutions',
      figures:[
        {
          type:'text',
          figSel:'#solutions-text',
          props:{
            kicker:'What to do now',
            title:'Keep building, reduce strain',
            subtitle:'Align timelines, hedge load locally, and protect people and water.',
            align:'center', halign:'center',
            sizes:{ title:'xs', subtitle:'xs', body:'xs' }
          }
        },
        {
          type:'cards',
          figSel:'#solutions-cards',
          props:{
            items:[
              { title:'Speed-to-power', icon:'fa-forward-fast', bullets:['Interconnection/queue reforms','Hosting capacity maps','Study standards keyed to load profiles'] },
              { title:'On-site hedges', icon:'fa-battery-full', bullets:['Storage + hybrids for bridge power','DR-friendly load shaping','Microgrids for commissioning'] },
              { title:'Protect people & water', icon:'fa-droplet', bullets:['Reclaimed/dry cooling in arid basins','Rate guardrails + community benefits','Water-positive pledges (AWS/Microsoft/Google/Meta) + waste-heat reuse'] }
            ]
          }
        }
      ]
    },
    {
      id:'scene-credits', group:'group-4', nav:'Credits',
      label:'',
      figures:[{
        type:'credits',
        figSel:'#credits-fig',
        props:{ items:[
          'DataCenterMap.com (global and US data center counts by country/state)',
          'Bureau of Labor Statistics (NAICS 518210 establishments, 2015–2024)',
          'McKinsey (2024) “The cost of compute: A $7 trillion race to scale data centers” (AI vs non-AI workload)',
          'Deloitte (2023) “Few energy sources align with data center timelines” (build timelines)',
          'Visual Capitalist (2024) “Mapped: Data Center Electricity Consumption by State”',
          'EIA Annual Electric Power Industry Report (Total Electric Industry, residential price)',
          'EESI (2023) “Data Centers and Water Consumption”',
          'Lu et al. (2025), Nature Sustainability, Figure 3h (water scarcity and footprint)',
          'International Energy Agency (2024) estimates of US DC electricity (183 TWh; 45% of global DC use)',
          'Pew Research Center (2025) “What we know about energy use at US data centers amid the AI boom”',
          'Electric Power Research Institute Report 3002028905 (DC grid impacts by state)',
          'Business Insider (Aug 5, 2025) “Where Data Center Construction Is Concentrated: Map”',
          'Business Insider (Jun 25, 2025) “How Data Centers Are Deepening the Water Crisis”',
          'Business Insider (2024) “How BI investigated the true cost of data centers”',
          'Southwest Energy Efficiency Project (2025) data center electricity demand outlook',
          'Stanford “And the West” (2025) “Thirsty for power and water: AI-crunching data centers”',
          'World Resources Institute (2024) “Managing electricity demand growth in the US”',
          'World Resources Institute Aqueduct Water Risk Atlas (water-stress classification)',
          'AWS Sustainability (2024) “Water stewardship and water-positive by 2030”',
          'NPR (Oct 14, 2025) coverage of Google AI data centers and grid strain',
          'Politico (Jul 17, 2023) “NYC grid shortfall as fossil fuel peakers plan to retire”',
          'CalMatters (Feb 2025) “Data center crackdown to protect California electricity rates”',
          'NBC News (2025) on data centers, utility costs, and elections (VA/NJ debates)',
          'Cardinal News (Aug 22, 2025) on Virginia utility disconnections and DC boom',
          'WRI/Aqueduct + EPRI insights on grid and water risk (supporting maps)'
        ], graphOpacity:1 }
      }]
    }
  ]
};

export default deck;
