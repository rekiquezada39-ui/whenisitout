const f=require('fs'),P=require('path'),O='dist',z=require('zlib');
// ══════════ CONFIGURA AQUI ══════════
const N='WhenIsItOut',DOM='https://whenisitout.pages.dev';
const MAIL='contact.whenisitout@gmail.com';
const MVERIFY='<meta name="monetag" content="830f2511ef02229941ac4b9ce8df4bad"><meta name="google-site-verification" content="U9iGxs4sIb4prXPIHujTEdxOh7eu-x9UDdaeqOjKHjE">';
// Zonas de Monetag. Dos formatos posibles:
//   ['dominio/ruta.js?z=NNN','']      -> la zona va en la URL (src directo)
//   ['dominio/tag.min.js','NNN']      -> la zona va como dataset.zone
const ZONAS=[
 ['5gvci.com/act/files/tag.min.js?z=11487153',''],
 ['nap5k.com/tag.min.js','11487154']
];
const SWZONE='';                         // zoneId del sw.js de Monetag
// ════════════════════════════════════
const s=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/&[a-z]+;/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
const e=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip=h=>String(h||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();

const HIST='history.json';
const DIAS_HIST=60;

// ── fechas
const HOY_ISO=new Date().toISOString().slice(0,10);
const MESES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DIAS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fFecha=iso=>{const[y,m,d]=iso.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d));
 return `${DIAS[dt.getUTCDay()]}, ${MESES[m-1]} ${d}, ${y}`};
const fCorta=iso=>{const[y,m,d]=iso.split('-').map(Number);return `${MESES[m-1].slice(0,3)} ${d}`};
const fMes=iso=>{const[y,m]=iso.split('-').map(Number);return `${MESES[m-1]} ${y}`};
const HOY=fFecha(HOY_ISO);
const dias=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/864e5);
const cuenta=iso=>{const d=dias(HOY_ISO,iso);
 return d<0?'Aired':d===0?'Today':d===1?'Tomorrow':d<7?`In ${d} days`:d<14?'Next week':d<31?`In ${Math.round(d/7)} weeks`:d<365?`In ${Math.round(d/30)} months`:`In ${(d/365).toFixed(1)} years`};

// ══ CSS ══
const CSS=`
:root{--tx:#0f1115;--tx2:#6b7280;--bg:#fff;--bg2:#f6f7f9;--bg3:#fafbfc;
 --bd:#d7dae0;--bd2:#e8eaee;--bd3:#f0f1f4;--ac:#5b2be0;--ac2:#7040f0;
 --ok:#12a150;--wr:#e8890c;--er:#e02b3f;--sh:rgba(15,17,21,.1);--gr:#c4c8ce}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Helvetica,Arial,sans-serif;
 background:var(--bg);color:var(--tx);line-height:1.5;-webkit-font-smoothing:antialiased;letter-spacing:-.011em}
a{color:inherit;text-decoration:none}
::selection{background:var(--ac);color:#fff}
body.lock{overflow:hidden}
img{display:block;max-width:100%}
/* HEADER */
header{background:rgba(255,255,255,.88);backdrop-filter:saturate(180%) blur(20px);
 -webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--bd2);
 position:sticky;top:0;z-index:9000}
.hin{max-width:1160px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:26px}
.burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;
 background:none;border:0;cursor:pointer;margin-left:-8px;flex-shrink:0}
.burger span{display:block;width:20px;height:2px;background:var(--tx);border-radius:2px;
 transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s;margin:0 auto}
.burger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.burger.open span:nth-child(2){opacity:0}
.burger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.lg{display:flex;align-items:center;gap:9px;flex-shrink:0;color:var(--tx)}
.lgt{font-size:1.3rem;font-weight:700;letter-spacing:-.032em}
.lgt em{font-style:normal;color:var(--ac)}
.hnav{display:flex;gap:26px;font-size:.88rem;font-weight:500;margin-left:6px}
.hnav a{color:var(--tx2);transition:color .18s}.hnav a:hover{color:var(--tx)}
.upd{margin-left:auto;font-size:.75rem;color:var(--tx2);white-space:nowrap}
.scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9400;opacity:0;
 transition:opacity .3s;backdrop-filter:blur(2px)}
.scrim.on{display:block;opacity:1}
.drawer{position:fixed;top:0;left:0;bottom:0;width:min(85vw,310px);background:var(--bg);z-index:9500;
 transform:translateX(-100%);transition:transform .36s cubic-bezier(.32,.72,0,1);overflow-y:auto;
 box-shadow:2px 0 26px var(--sh)}
.drawer.on{transform:translateX(0)}
.dhead{display:flex;align-items:center;gap:9px;padding:20px 22px 18px;border-bottom:1px solid var(--bd2);
 position:sticky;top:0;background:var(--bg)}
.dbody{padding:12px 12px 40px}
.dttl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx2);padding:16px 12px 7px}
.drawer a{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;font-size:.94rem;
 border-radius:10px;transition:background .16s}
.drawer a:active{background:var(--bg2)}
.drawer a .n{font-size:.78rem;color:var(--tx2);font-variant-numeric:tabular-nums}
.dsep{height:1px;background:var(--bd2);margin:10px 12px}
/* LAYOUT */
.shell{max-width:1160px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:186px 1fr;
 gap:48px;align-items:start}
.side{position:sticky;top:88px;max-height:calc(100vh - 112px);overflow-y:auto;padding:36px 0}
.side::-webkit-scrollbar{width:0}
.sttl{font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx2);margin:24px 0 9px}
.sttl:first-child{margin-top:0}
.side a{display:block;padding:6px 0;font-size:.84rem;color:var(--tx2);transition:.16s}
.side a:hover{color:var(--ac)}
main{min-width:0;padding:36px 0 80px}
h1{font-size:2.5rem;font-weight:800;letter-spacing:-.038em;line-height:1.08;margin-bottom:12px}
main>h1:after{content:'';display:block;width:52px;height:4px;border-radius:3px;margin-top:14px;background:var(--ac)}
.sub{color:var(--tx2);font-size:1.04rem;margin-bottom:38px;max-width:660px}
h2{font-size:1.42rem;font-weight:700;letter-spacing:-.028em;margin:56px 0 20px;display:flex;
 align-items:baseline;gap:12px}
h2 .ver{margin-left:auto;font-size:.85rem;font-weight:500;color:var(--ac);white-space:nowrap}
h2 .ver:hover{text-decoration:underline}
h3{font-size:1.1rem;font-weight:650;letter-spacing:-.022em}
.crumb{font-size:.8rem;color:var(--tx2);margin-bottom:16px}
.crumb a:hover{color:var(--ac)}
/* HERO DE CUENTA REGRESIVA */
.hero{background:linear-gradient(135deg,#5b2be0,#8b3fd6);color:#fff;border-radius:20px;
 padding:32px 30px;margin-bottom:14px}
.hero .k{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;opacity:.82;font-weight:600;margin-bottom:9px}
.hero .v{font-size:2.6rem;font-weight:800;letter-spacing:-.035em;line-height:1.05;margin-bottom:8px}
.hero .d{font-size:1rem;opacity:.92}
.hero .cd{display:inline-flex;align-items:baseline;gap:7px;background:rgba(255,255,255,.18);
 border-radius:980px;padding:7px 16px;margin-top:16px;font-size:.9rem;font-weight:600}
/* TARJETAS DE SERIE */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
.card{border:1px solid var(--bd2);border-radius:16px;overflow:hidden;background:var(--bg);
 transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s,border-color .2s;display:flex;flex-direction:column}
.card:hover{transform:translate3d(0,-3px,0);box-shadow:0 10px 30px var(--sh);border-color:var(--bd)}
.card .im{aspect-ratio:2/3;background:var(--bg2);position:relative;overflow:hidden}
.card .im img{width:100%;height:100%;object-fit:cover}
.card .im .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
 color:var(--gr);font-size:2rem;font-weight:700}
.card .bd{padding:13px 14px 15px;flex:1;display:flex;flex-direction:column}
.card .nm{font-size:.95rem;font-weight:650;letter-spacing:-.015em;line-height:1.3;margin-bottom:5px}
.card .mt{font-size:.78rem;color:var(--tx2);margin-bottom:9px}
.card .tag{margin-top:auto;display:inline-flex;align-items:center;gap:5px;align-self:flex-start;
 font-size:.76rem;font-weight:650;padding:4px 10px;border-radius:980px;background:var(--bg2);color:var(--tx2)}
.card .tag.soon{background:#efe8ff;color:#5b2be0}
.card .tag.today{background:#e3f7ec;color:#0d7a3e}
.card .tag.tom{background:#fff4e0;color:#a86408}
/* LISTA / TABLA */
.rows{border:1px solid var(--bd2);border-radius:16px;overflow:hidden}
.row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--bd3);
 transition:background .16s}
.row:last-child{border-bottom:0}
.row:hover{background:var(--bg3)}
.row .dt{width:64px;flex-shrink:0;text-align:center}
.row .dt .m{font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700}
.row .dt .d{font-size:1.28rem;font-weight:750;letter-spacing:-.03em;line-height:1.1}
.row .th{width:44px;height:64px;border-radius:7px;background:var(--bg2);flex-shrink:0;overflow:hidden}
.row .th img{width:100%;height:100%;object-fit:cover}
.row .in{flex:1;min-width:0}
.row .in .t{font-size:.95rem;font-weight:600;letter-spacing:-.014em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .in .s{font-size:.79rem;color:var(--tx2);margin-top:2px}
.row .rt{font-size:.78rem;font-weight:650;color:var(--tx2);white-space:nowrap;flex-shrink:0}
.row .rt b{color:var(--ac)}
/* CHIPS */
.chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px}
.chips a{border:1px solid var(--bd2);border-radius:12px;padding:12px 14px;font-size:.88rem;
 font-weight:550;display:flex;align-items:center;justify-content:space-between;gap:8px;
 transition:transform .2s cubic-bezier(.16,1,.3,1),border-color .18s,background .18s}
.chips a:hover{transform:translate3d(0,-2px,0);border-color:var(--ac);background:var(--bg3)}
.chips a .n{font-size:.76rem;color:var(--tx2);font-variant-numeric:tabular-nums}
/* FICHA DE SERIE */
.showhd{display:flex;gap:24px;margin-bottom:28px;flex-wrap:wrap}
.showhd .po{width:190px;flex-shrink:0;border-radius:14px;overflow:hidden;background:var(--bg2);
 box-shadow:0 6px 24px var(--sh)}
.showhd .po img{width:100%;aspect-ratio:2/3;object-fit:cover}
.showhd .inf{flex:1;min-width:250px}
.meta{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 16px}
.meta span{font-size:.78rem;font-weight:600;padding:5px 11px;border-radius:980px;background:var(--bg2);color:var(--tx2)}
.meta span.on{background:#e3f7ec;color:#0d7a3e}
.meta span.off{background:var(--bg2);color:var(--tx2)}
.meta span.rt{background:#fff4e0;color:#a86408}
.desc{font-size:.96rem;line-height:1.66;color:var(--tx);max-width:680px}
.box{border:1px solid var(--bd2);border-radius:16px;padding:22px 24px;margin:22px 0}
.box h3{margin-bottom:12px}
.box p{font-size:.94rem;line-height:1.65;color:var(--tx)}
.box p+p{margin-top:11px}
.big{background:linear-gradient(135deg,#5b2be0,#8b3fd6);color:#fff;border:0}
.big h3{color:#fff}.big p{color:rgba(255,255,255,.94)}
/* TABLA DE EPISODIOS */
.eps{width:100%;border-collapse:collapse;font-size:.9rem}
.eps th{text-align:left;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);
 font-weight:700;padding:0 12px 10px 0;border-bottom:1px solid var(--bd)}
.eps td{padding:13px 12px 13px 0;border-bottom:1px solid var(--bd3);vertical-align:top}
.eps tr:last-child td{border-bottom:0}
.eps .se{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--ac)}
.eps .ti{font-weight:550}
.eps .da{white-space:nowrap;color:var(--tx2);font-variant-numeric:tabular-nums}
.eps .cd{white-space:nowrap;font-weight:650;font-size:.83rem}
.eps .cd.n{color:var(--ok)}
/* BUSCADOR */
.finder{background:var(--bg2);border-radius:16px;padding:22px;margin-bottom:20px}
#q{width:100%;padding:13px 16px;border-radius:11px;border:1px solid var(--bd);font-size:16px;
 font-family:inherit;background:var(--bg)}
#q:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 3px rgba(91,43,224,.13)}
#res{margin-top:12px}
/* FAQ */
.faq details{border:1px solid var(--bd2);border-radius:13px;margin-bottom:8px;overflow:hidden}
.faq summary{padding:15px 17px;font-size:.95rem;font-weight:600;cursor:pointer;list-style:none;
 display:flex;align-items:center;gap:12px;transition:background .18s}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:'+';margin-left:auto;font-size:1.3rem;font-weight:300;color:var(--tx2);
 transition:transform .28s cubic-bezier(.16,1,.3,1);line-height:1}
.faq details[open] summary:after{transform:rotate(45deg)}
.faq summary:hover{background:var(--bg2)}
.faq details[open] summary{border-bottom:1px solid var(--bd3)}
.faq p{padding:14px 17px 17px;font-size:.92rem;line-height:1.65;color:var(--tx)}
/* PAGINACION */
.pg{display:flex;gap:6px;justify-content:center;align-items:center;margin:32px 0;flex-wrap:wrap}
.pg a,.pg span{padding:8px 13px;border-radius:9px;font-size:.86rem;font-weight:600;border:1px solid var(--bd2)}
.pg a:hover{border-color:var(--ac);color:var(--ac)}
.pg .on{background:var(--ac);color:#fff;border-color:var(--ac)}
/* BOTONES */
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--ac);color:#fff;border:0;
 padding:12px 22px;border-radius:980px;font-size:.9rem;font-weight:600;font-family:inherit;cursor:pointer;
 transition:transform .2s cubic-bezier(.16,1,.3,1),background .2s}
.btn:hover{background:var(--ac2)}.btn:active{transform:scale(.97)}
.btn.g{background:var(--bg2);color:var(--tx);border:1px solid var(--bd)}
.btn.g:hover{background:var(--bd3)}
.up{position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;background:var(--tx);
 color:var(--bg);border:0;cursor:pointer;z-index:8000;display:flex;align-items:center;justify-content:center;
 box-shadow:0 6px 22px var(--sh);opacity:0;pointer-events:none;transform:translate3d(0,14px,0) scale(.85);
 transition:opacity .3s,transform .34s cubic-bezier(.16,1,.3,1)}
.up.on{opacity:1;pointer-events:auto;transform:none}
.up svg{width:18px;height:18px}
/* FOOTER */
footer{border-top:1px solid var(--bd2);margin-top:70px;padding:38px 24px 46px;font-size:.85rem;color:var(--tx2)}
.fin{max-width:1160px;margin:0 auto}
.fnav{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap}
.fnav a:hover{color:var(--ac)}
/* COOKIES */
#ck{position:fixed;left:16px;right:16px;bottom:16px;max-width:520px;margin:0 auto;background:var(--bg);
 border:1px solid var(--bd);border-radius:16px;padding:18px 20px;box-shadow:0 14px 44px var(--sh);
 z-index:9700;display:none;font-size:.86rem;line-height:1.5}
#ck.on{display:block;animation:sube .45s cubic-bezier(.16,1,.3,1) both}
#ck a{color:var(--ac);text-decoration:underline}
.ckb{display:flex;gap:9px;margin-top:14px;flex-wrap:wrap}
.ckb button{flex:1;min-width:120px;padding:10px 18px;border-radius:980px;font-size:.87rem;
 font-family:inherit;font-weight:600;cursor:pointer;border:1px solid var(--bd);background:var(--bg2);color:var(--tx)}
.ckb #ckSi{background:var(--ac);color:#fff;border-color:var(--ac)}
/* LEGAL */
.legal{max-width:740px}
.legal h2{font-size:1.16rem;margin:30px 0 10px}
.legal p,.legal li{font-size:.94rem;line-height:1.7;margin-bottom:11px;color:var(--tx)}
.legal ul{padding-left:22px}
/* ANIMACIONES */
@media(prefers-reduced-motion:no-preference){
 @keyframes sube{from{opacity:0;transform:translate3d(0,18px,0)}to{opacity:1;transform:none}}
 @keyframes esc{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}
 .rv{opacity:0;will-change:transform,opacity}
 .rv.on{animation:sube .56s cubic-bezier(.16,1,.3,1) both}
 main>h1{animation:sube .5s cubic-bezier(.16,1,.3,1) both}
 main>.sub{animation:sube .5s .06s cubic-bezier(.16,1,.3,1) both}
 .hero{animation:esc .55s .1s cubic-bezier(.16,1,.3,1) both}
}
/* MOVIL */
@media(max-width:1000px){.shell{grid-template-columns:1fr;gap:0}.side{display:none}
 .burger{display:flex}.hnav{display:none}}
@media(max-width:734px){
 .hin{height:56px;gap:10px;padding:0 14px}.lgt{font-size:1.15rem}.upd{display:none}
 .shell{padding:0 14px}main{padding:22px 0 60px}
 h1{font-size:1.75rem}main>h1:after{width:44px;height:3px;margin-top:11px}
 .sub{font-size:.95rem;margin-bottom:26px}
 h2{font-size:1.22rem;margin:40px 0 16px}
 .hero{padding:24px 20px;border-radius:16px}.hero .v{font-size:1.85rem}
 .grid{grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:12px}
 .card .nm{font-size:.88rem}.card .mt{font-size:.74rem}.card .bd{padding:11px 12px 13px}
 .row{padding:12px 13px;gap:11px}.row .dt{width:52px}.row .dt .d{font-size:1.12rem}
 .row .th{width:38px;height:56px}.row .in .t{font-size:.9rem}.row .rt{font-size:.74rem}
 .chips{grid-template-columns:1fr 1fr}
 .showhd{gap:16px}.showhd .po{width:130px}
 .box{padding:17px 18px;border-radius:13px}
 .eps{font-size:.85rem}.eps td{padding:11px 8px 11px 0}
 .eps th:nth-child(4),.eps td:nth-child(4){display:none}
 .finder{padding:17px}
 .up{right:14px;bottom:14px}
}
@media(max-width:400px){h1{font-size:1.55rem}.grid{grid-template-columns:1fr 1fr;gap:10px}}
`;

const LOGO='<svg viewBox="0 0 32 32" width="27" height="27" fill="none" aria-hidden="true"><rect x="2" y="5" width="28" height="20" rx="4" stroke="currentColor" stroke-width="2.4"/><path d="M11 2.5 16 5l5-2.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 12.2v5.6l5-2.8z" fill="#5b2be0"/><path d="M9 29h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

let SIDE='',DRAWER='';
const HEAD=(t,d,c,r,nx)=>`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(t)}</title><meta name="description" content="${e(d)}"><link rel="canonical" href="${c}">${nx?'<meta name="robots" content="noindex,follow">':''}${MVERIFY}<meta property="og:title" content="${e(t)}"><meta property="og:description" content="${e(d)}"><meta property="og:type" content="website"><meta property="og:url" content="${c}"><meta property="og:site_name" content="${N}"><meta property="og:locale" content="en_US"><meta property="og:image" content="${DOM}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(t)}"><meta name="twitter:description" content="${e(d)}"><meta name="twitter:image" content="${DOM}/og.png"><meta name="theme-color" content="#ffffff"><link rel="icon" href="${r}favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="${r}favicon.svg"><link rel="manifest" href="${r}manifest.json"><link rel="apple-touch-icon" href="${r}icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><link rel="preconnect" href="https://static.tvmaze.com"><link rel="stylesheet" href="${r}s.css"></head><body>
<header><div class="hin">
<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
<a href="${r}" class="lg">${LOGO}<span class="lgt">WhenIs<em>ItOut</em></span></a>
<nav class="hnav"><a href="${r}">Today</a><a href="${r}calendar">Calendar</a><a href="${r}premieres">Premieres</a><a href="${r}networks">Networks</a></nav>
<span class="upd">Updated ${HOY}</span>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer"><div class="dhead">${LOGO}<span class="lgt">WhenIs<em>ItOut</em></span></div><div class="dbody">${DRAWER.replace(/href="/g,'href="'+r)}</div></aside>`;

const FOOT=(r)=>`<footer><div class="fin"><p><strong>${N}</strong> — TV show release dates, season premieres and episode schedules.</p>
<p style="margin-top:8px">Data from the TVmaze public API. Air dates can change without notice; check with the network before planning. Last updated ${HOY}.</p>
<nav class="fnav"><a href="${r}about">About</a><a href="${r}privacy">Privacy</a><a href="${r}terms">Terms</a><a href="${r}contact">Contact</a></nav></div></footer>
<div id="ck" role="dialog" aria-label="Cookie notice"><p>We use cookies and third-party services to show ads and measure traffic. See our <a href="${r}privacy">privacy policy</a>.</p><div class="ckb"><button id="ckNo" type="button">Necessary only</button><button id="ckSi" type="button">Accept</button></div></div>
<button class="up" id="up" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
function t(o){b.classList.toggle('open',o);d.classList.toggle('on',o);s.classList.toggle('on',o);document.body.classList.toggle('lock',o)}
if(b){b.addEventListener('click',function(){t(!d.classList.contains('on'))});s.addEventListener('click',function(){t(false)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')t(false)});d.addEventListener('click',function(ev){if(ev.target.closest('a'))t(false)})}
// consent gate: ads only load after accepting
var KEY='ck_wio',box=document.getElementById('ck');
var _adsYa=false;
function _iny(){if(_adsYa)return;var Z=window.__ZONAS;if(!Z||!Z.length)return;
 var host=document.body||document.documentElement;if(!host)return;_adsYa=true;
 for(var i=0;i<Z.length;i++){(function(sc,zn){
  if(zn[1]){sc.dataset.zone=zn[1]}
  else{sc.setAttribute('data-cfasync','false');sc.async=true}
  sc.src='https://'+zn[0];
 })(host.appendChild(document.createElement('script')),Z[i])}
 _sw();}
function _sw(){if(!('serviceWorker' in navigator))return;if(location.protocol!=='https:')return;
 if(!window.__SW)return;try{navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){})}catch(e){}}
function ads(){if(window.__ZONAS&&document.body){_iny();return}
 if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){_iny()},{once:true})}
 else{setTimeout(_iny,0)}}
try{var v=localStorage.getItem(KEY);
 if(v==='1'){ads()}else if(v!=='0'&&box){box.classList.add('on')}
 if(box){document.getElementById('ckSi').addEventListener('click',function(){try{localStorage.setItem(KEY,'1')}catch(e){}box.classList.remove('on');ads()});
 document.getElementById('ckNo').addEventListener('click',function(){try{localStorage.setItem(KEY,'0')}catch(e){}box.classList.remove('on')})}
}catch(e){}
// back to top
var ub=document.getElementById('up');
if(ub){var vis=false,tick=false;
 function chk(){var y=window.pageYOffset||document.documentElement.scrollTop;var q=y>620;
  if(q!==vis){vis=q;ub.classList.toggle('on',q)}tick=false}
 addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(chk)}},{passive:true});
 ub.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})});
 chk();}
// reveal on scroll
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion:reduce)').matches){
 var io=new IntersectionObserver(function(en){en.forEach(function(x){
  if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})},
  {rootMargin:'0px 0px -8% 0px',threshold:.06});
 document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
} else {document.querySelectorAll('.rv').forEach(function(el){el.classList.add('on')})}
})();<\/script>
<script>window.__ZONAS=${JSON.stringify(ZONAS)};window.__SW=${SWZONE?'true':'false'};<\/script>`;

const L=(t,d,c,b,r='',nx=false)=>HEAD(t,d,c,r,nx)+
 `<div class="shell"><aside class="side">${SIDE.replace(/href="/g,'href="'+r)}</aside><main>${b}</main></div>`+FOOT(r);

// ══ PNG (og:image e iconos) ══
const FK='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,-:/|!?()+%\u00d1 ';
const FD='ehhvhhhuhhuhhuehgggheuhhhhhuvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhpljhhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhllrhhha4ahhhha4444v1248gvehjlphe4c4444eeh1248vv2421he26aiv22vgu11he68guhhev124888ehhehheehhf12c4fke5u400000cc0000c48000v0000cc0cc0122488g44444444444404eh1640424888428422248044v440h1248ghq0hpljh00000000000000';
const AL='0123456789abcdefghijklmnopqrstuv';
const GLY={};
for(let i=0;i<FK.length;i++){const r=[];for(let j=0;j<7;j++)r.push(AL.indexOf(FD[i*7+j]));GLY[FK[i]]=r}
const SS=2;
function _lz(w,h,r,g,b){const W=w*SS,H=h*SS,p=Buffer.alloc(W*H*3);
 for(let i=0;i<W*H;i++){p[i*3]=r;p[i*3+1]=g;p[i*3+2]=b}return{w,h,W,H,p}}
function _rc(c,x,y,w,h,r,g,b){const X=Math.round(x*SS),Y=Math.round(y*SS),Wd=Math.round(w*SS),Ht=Math.round(h*SS);
 for(let j=Y;j<Y+Ht;j++){if(j<0||j>=c.H)continue;for(let i=X;i<X+Wd;i++){if(i<0||i>=c.W)continue;
  const k=(j*c.W+i)*3;c.p[k]=r;c.p[k+1]=g;c.p[k+2]=b}}}
const ACC=t=>String(t).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function _tx(c,t,x0,y0,es,r,g,b){let x=x0;
 for(const ch of ACC(t)){const gl=GLY[ch];
  if(gl)for(let ry=0;ry<7;ry++)for(let rx=0;rx<5;rx++){if((gl[ry]>>(4-rx))&1)_rc(c,x+rx*es,y0+ry*es,es,es,r,g,b)}
  x+=6*es}return x}
const _an=(t,es)=>String(t).length*6*es-es;
const _fit=(t,max,ini)=>{let e2=ini;while(e2>1&&_an(t,e2)>max)e2--;return e2};
function _png(c){
 const w=c.w,h=c.h,out=Buffer.alloc(w*h*3),n=SS*SS;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let R=0,G=0,B=0;
  for(let j=0;j<SS;j++)for(let i=0;i<SS;i++){const k=(((y*SS+j)*c.W)+(x*SS+i))*3;R+=c.p[k];G+=c.p[k+1];B+=c.p[k+2]}
  const o=(y*w+x)*3;out[o]=R/n;out[o+1]=G/n;out[o+2]=B/n}
 const raw=Buffer.alloc(h*(w*3+1));
 for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;out.copy(raw,y*(w*3+1)+1,y*w*3,(y+1)*w*3)}
 const T=[];for(let m=0;m<256;m++){let k=m;for(let j=0;j<8;j++)k=k&1?0xEDB88320^(k>>>1):k>>>1;T[m]=k>>>0}
 const crc=b=>{let k=0xFFFFFFFF;for(const x of b)k=T[(k^x)&255]^(k>>>8);return(k^0xFFFFFFFF)>>>0};
 const ck=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);
  const cb=Buffer.alloc(4);cb.writeUInt32BE(crc(td));return Buffer.concat([l,td,cb])};
 const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ck('IHDR',ih),
  ck('IDAT',z.deflateSync(raw,{level:9})),ck('IEND',Buffer.alloc(0))]);}
function iconPNG(px){
 const S=px/512,c=_lz(px,px,91,43,224);
 const W=(x,y,w,h)=>_rc(c,x*S,y*S,w*S,h*S,255,255,255);
 W(96,150,320,26); W(96,150,26,220); W(390,150,26,220); W(96,344,320,26);
 W(186,86,26,52); W(300,86,26,52);
 W(186,86,120,26);
 W(216,212,20,96); W(236,228,20,64); W(256,244,20,32);
 W(180,410,152,24);
 return _png(c);}

// ══ HISTORICO ══
let H={dates:[],shows:{}};
try{H=JSON.parse(f.readFileSync(HIST,'utf8'))}catch(x){}

(async()=>{
console.log(`\n📺 Building ${N}...\n📥 Fetching TVmaze schedule:`);

// descarga con reintentos: la red a veces falla (IPv6 sin ruta, timeout)
async function baja(url,intentos=5){
 for(let i=1;i<=intentos;i++){
  try{
   const ctrl=new AbortController();
   const t=setTimeout(()=>ctrl.abort(),45000);
   const r=await fetch(url,{signal:ctrl.signal,headers:{'User-Agent':'WhenIsItOut/1.0'}});
   clearTimeout(t);
   if(!r.ok)throw new Error('HTTP '+r.status);
   return await r.json();
  }catch(err){
   const m=(err&&err.cause&&err.cause.code)||err.code||err.message||'error';
   if(i===intentos)throw new Error(`No se pudo descargar tras ${intentos} intentos: ${m}`);
   const espera=i*3;
   console.log(`   intento ${i}/${intentos} fallo (${m}) — reintentando en ${espera}s...`);
   await new Promise(r2=>setTimeout(r2,espera*1000));
  }
 }
}
const raw=await baja('https://api.tvmaze.com/schedule/full');
console.log(`   ✓ ${raw.length.toLocaleString('en-US')} scheduled episodes`);

// ── agrupar por serie (solo ingles + futuro)
const SH={};
raw.forEach(ep=>{
 const sw=ep._embedded&&ep._embedded.show; if(!sw)return;
 if(sw.language && sw.language!=='English')return;
 if(!ep.airdate || ep.airdate<HOY_ISO)return;
 const net=(sw.network&&sw.network.name)||(sw.webChannel&&sw.webChannel.name)||'';
 if(!SH[sw.id])SH[sw.id]={
  id:sw.id, name:sw.name, slug:(s(sw.name)||'show')+'-'+sw.id,
  type:sw.type||'', genres:sw.genres||[], status:sw.status||'',
  premiered:sw.premiered||'', net, rating:(sw.rating&&sw.rating.average)||0,
  img:(sw.image&&(sw.image.medium||sw.image.original))||'',
  sum:strip(sw.summary), eps:[]
 };
 SH[sw.id].eps.push({s:ep.season,n:ep.number,t:ep.name||'',d:ep.airdate,ts:ep.airstamp||'',rt:ep.runtime||0});
});
const SHOWS=Object.values(SH).filter(x=>x.eps.length);
SHOWS.forEach(x=>x.eps.sort((a,b)=>a.d.localeCompare(b.d)||a.s-b.s||a.n-b.n));
console.log(`   ✓ ${SHOWS.length.toLocaleString('en-US')} English shows with upcoming episodes`);

// ── historico: cuando aparecio cada serie por primera vez
if(H.dates[H.dates.length-1]!==HOY_ISO)H.dates.push(HOY_ISO);
if(H.dates.length>DIAS_HIST)H.dates=H.dates.slice(H.dates.length-DIAS_HIST);
SHOWS.forEach(x=>{
 const k=String(x.id);
 if(!H.shows[k])H.shows[k]={first:HOY_ISO,next:x.eps[0].d};
 H.shows[k].next=x.eps[0].d;
 H.shows[k].seen=HOY_ISO;
});
try{f.writeFileSync(HIST,JSON.stringify(H))}catch(x){}
console.log(`   ✓ history: ${H.dates.length} day(s) tracked, ${Object.keys(H.shows).length} shows known`);

// ── indices
const byNet={}, byGen={}, byDate={};
SHOWS.forEach(x=>{
 if(x.net)(byNet[x.net]=byNet[x.net]||[]).push(x);
 x.genres.forEach(g=>(byGen[g]=byGen[g]||[]).push(x));
 const d=x.eps[0].d;(byDate[d]=byDate[d]||[]).push(x);
});
const nets=Object.entries(byNet).filter(([,v])=>v.length>=2).sort((a,b)=>b[1].length-a[1].length);
const NETOK=new Set(nets.map(([n])=>n));
const gens=Object.entries(byGen).filter(([,v])=>v.length>=3).sort((a,b)=>b[1].length-a[1].length);

// estrenos de temporada = primer episodio de una temporada
const premieres=[];
SHOWS.forEach(x=>{const p=x.eps.find(ep=>ep.n===1);if(p)premieres.push({sh:x,ep:p})});
premieres.sort((a,b)=>a.ep.d.localeCompare(b.ep.d));

// hoy / esta semana
const hoyList=SHOWS.filter(x=>x.eps.some(ep=>ep.d===HOY_ISO));
const semana=SHOWS.filter(x=>{const d=dias(HOY_ISO,x.eps[0].d);return d>=0&&d<=7});
const destacados=[...SHOWS].filter(x=>x.rating>=7).sort((a,b)=>a.eps[0].d.localeCompare(b.eps[0].d));

SIDE=`<div class="sttl">Browse</div><a href="">Today</a><a href="calendar">Calendar</a><a href="premieres">Season premieres</a><a href="networks">All networks</a><div class="sttl">Networks</div>`+nets.slice(0,16).map(([n])=>`<a href="network-${s(n)}">${e(n)}</a>`).join('');
DRAWER=`<a href="">Today</a><a href="calendar">Calendar</a><a href="premieres">Season premieres</a><a href="networks">All networks</a><div class="dsep"></div><div class="dttl">Networks</div>`+nets.slice(0,18).map(([n,v])=>`<a href="network-${s(n)}">${e(n)}<span class="n">${v.length}</span></a>`).join('');

f.rmSync(O,{recursive:true,force:true});f.mkdirSync(O,{recursive:true});
console.log('📄 Generating HTML:');

// ══ COMPONENTES ══
const img=(x,cls='')=>x.img
 ? `<img src="${e(x.img)}" alt="${e(x.name)} poster" loading="lazy" width="210" height="315">`
 : `<div class="ph">${e(x.name.slice(0,1))}</div>`;

const tagCls=d=>{const n=dias(HOY_ISO,d);return n===0?'today':n===1?'tom':n<=7?'soon':''};

const card=(x,r='')=>{const ep=x.eps[0];
 return `<a class="card" href="${r}show/${x.slug}">
<div class="im">${img(x)}</div>
<div class="bd"><div class="nm">${e(x.name)}</div>
<div class="mt">Season ${ep.s}, Episode ${ep.n}${x.net?' · '+e(x.net):''}</div>
<span class="tag ${tagCls(ep.d)}">${cuenta(ep.d)}</span></div></a>`};

const grid=(arr,r='')=>`<div class="grid">${arr.map(x=>card(x,r)).join('')}</div>`;

const row=(x,r='')=>{const ep=x.eps[0];const[y,m,d]=ep.d.split('-').map(Number);
 return `<a class="row" href="${r}show/${x.slug}">
<div class="dt"><div class="m">${MESES[m-1].slice(0,3)}</div><div class="d">${d}</div></div>
<div class="th">${img(x)}</div>
<div class="in"><div class="t">${e(x.name)}</div><div class="s">S${ep.s} E${ep.n}${ep.t?' · '+e(ep.t):''}${x.net?' · '+e(x.net):''}</div></div>
<div class="rt">${x.rating?'<b>★ '+x.rating+'</b>':cuenta(ep.d)}</div></a>`};

const rows=(arr,r='')=>`<div class="rows">${arr.map(x=>row(x,r)).join('')}</div>`;

// ══ HOME ══
const prox=premieres[0];
const idx=JSON.stringify(SHOWS.map(x=>[x.name,x.slug,x.eps[0].d,x.net]));
f.writeFileSync(P.join(O,'search.json'),idx);

const JLD=`<script type="application/ld+json">${JSON.stringify([
 {'@context':'https://schema.org','@type':'WebSite',name:N,
  alternateName:['When Is It Out','whenisitout','When Does It Come Out'],url:DOM+'/',inLanguage:'en-US',
  description:'TV show release dates, season premieres and episode air dates. Updated daily.',
  publisher:{'@type':'Organization',name:N,url:DOM+'/'}},
 {'@context':'https://schema.org','@type':'Organization',name:N,url:DOM+'/',
  logo:{'@type':'ImageObject',url:DOM+'/icon-512.png',width:512,height:512},
  email:MAIL,description:'Free TV schedule tracker with release dates for upcoming episodes and season premieres.'}
])}<\/script>`;

f.writeFileSync(P.join(O,'index.html'),L(
 `When Does It Come Out? TV Release Dates & Season Premieres | ${N}`,
 `Find out when your shows come back. Release dates for ${SHOWS.length} TV series, ${premieres.length} upcoming season premieres and every episode air date. Updated daily.`,
 DOM+'/',
`<h1>When does it come out?</h1>
<p class="sub">Release dates for <strong>${SHOWS.length.toLocaleString('en-US')}</strong> TV shows. See what airs today, what premieres next, and exactly when your series returns. Updated every day.</p>

${prox?`<div class="hero">
<div class="k">Next season premiere</div>
<div class="v">${e(prox.sh.name)}</div>
<div class="d">Season ${prox.ep.s} premieres ${fFecha(prox.ep.d)}${prox.sh.net?' on '+e(prox.sh.net):''}</div>
<div class="cd">${cuenta(prox.ep.d)}</div>
</div>`:''}

<div class="finder rv"><h3 style="margin-bottom:11px">Search any show</h3>
<input id="q" placeholder="Type a show name — Lioness, Reacher, Ted Lasso..." autocomplete="off" enterkeyhint="search">
<div id="res"></div></div>

${hoyList.length?`<h2 class="rv">Airing today<span class="ver">${hoyList.length} shows</span></h2>${rows(hoyList.slice(0,12))}`:''}

<h2 class="rv">Premiering soon<a class="ver" href="premieres">See all ${premieres.length} →</a></h2>
${grid(premieres.slice(0,12).map(p=>p.sh))}

<h2 class="rv">This week<a class="ver" href="calendar">Full calendar →</a></h2>
${rows(semana.slice(0,15))}

${destacados.length?`<h2 class="rv">Top rated returning</h2>${grid(destacados.slice(0,8))}`:''}

<h2 class="rv">Browse by network<a class="ver" href="networks">All networks →</a></h2>
<div class="chips">${nets.slice(0,14).map(([n,v])=>`<a href="network-${s(n)}">${e(n)}<span class="n">${v.length}</span></a>`).join('')}</div>

<h2 class="rv">Frequently asked questions</h2>
<div class="faq">
<details><summary>How do I find out when a show comes back?</summary><p>Search the show by name above, or browse by network. Every show page lists the exact air date of the next episode, a countdown, and the full upcoming schedule. We track <strong>${SHOWS.length.toLocaleString('en-US')} shows</strong> with <strong>${SHOWS.reduce((a,x)=>a+x.eps.length,0).toLocaleString('en-US')} scheduled episodes</strong>.</p></details>
<details><summary>How accurate are these dates?</summary><p>The dates come from the TVmaze public database, which is maintained by editors and updated continuously. Networks sometimes move dates at the last minute, so treat a date more than a few weeks out as tentative. We refresh our copy every single day.</p></details>
<details><summary>What is a season premiere?</summary><p>The first episode of a new season. On this site a premiere is any episode numbered 1 within its season — that includes both brand new shows and returning series. There are <strong>${premieres.length} upcoming premieres</strong> right now.</p></details>
<details><summary>Do you cover streaming services?</summary><p>Yes. Netflix, Hulu, Prime Video, Apple TV+, Disney+, Paramount+, Max, Peacock and more, alongside broadcast networks like ABC, NBC, CBS and FOX. We currently list <strong>${nets.length} networks and streamers</strong>.</p></details>
<details><summary>How often is this updated?</summary><p>Every day. An automated job pulls the latest schedule each morning and rebuilds the whole site, so what you see is never more than 24 hours old.</p></details>
<details><summary>Is this free?</summary><p>Completely free, no account needed. The site is supported by ads.</p></details>
</div>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:[
 ['How do I find out when a show comes back?',`Search the show by name or browse by network. Every show page lists the exact air date of the next episode plus a countdown. We track ${SHOWS.length} shows.`],
 ['How accurate are these dates?','Dates come from the TVmaze public database and are refreshed daily. Networks can move dates, so distant dates are tentative.'],
 ['What is a season premiere?',`The first episode of a new season. There are ${premieres.length} upcoming premieres right now.`],
 ['Do you cover streaming services?',`Yes: Netflix, Hulu, Prime Video, Apple TV+, Disney+, Paramount+, Max, Peacock and broadcast networks. ${nets.length} networks total.`],
 ['How often is this updated?','Every day. An automated job rebuilds the site each morning with the latest schedule.'],
 ['Is this free?','Yes, completely free with no account required.']
].map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))})}<\/script>
${JLD}
<script>
var DB=[],_bl=false;
function _load(cb){if(_bl){cb();return}
 fetch('search.json').then(function(r){return r.json()}).then(function(j){DB=j;_bl=true;cb()}).catch(function(){})}
function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}
document.getElementById('q').addEventListener('input',function(ev){
 var q=nrm(ev.target.value.trim()),o=document.getElementById('res');
 if(q.length<2){o.innerHTML='';return}
 if(!_bl){o.innerHTML='<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">Searching…</p>';
  _load(function(){document.getElementById('q').dispatchEvent(new Event('input'))});return}
 var hits=[];
 for(var i=0;i<DB.length&&hits.length<10;i++){if(nrm(DB[i][0]).indexOf(q)>-1)hits.push(DB[i])}
 o.innerHTML=hits.length
  ? '<div class="rows" style="margin-top:12px">'+hits.map(function(a){
      var p=a[2].split('-');
      return '<a class="row" href="show/'+a[1]+'"><div class="dt"><div class="m">'+
       ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+p[1]-1]+
       '</div><div class="d">'+(+p[2])+'</div></div><div class="in"><div class="t">'+a[0]+
       '</div><div class="s">'+(a[3]||'')+'</div></div></a>'}).join('')+'</div>'
  : '<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">No show found for "'+ev.target.value+'"</p>';
});
<\/script>`));
console.log('   ✓ homepage');

// ══ FICHAS DE SERIE ══
f.mkdirSync(P.join(O,'show'),{recursive:true});
SHOWS.forEach(x=>{
 const ep=x.eps[0];
 const prem=x.eps.find(y=>y.n===1);
 const mismos=NETOK.has(x.net)?(byNet[x.net]||[]).filter(y=>y.id!==x.id).slice(0,6):[];
 const porTemp={};x.eps.forEach(y=>(porTemp[y.s]=porTemp[y.s]||[]).push(y));
 const hist=H.shows[String(x.id)];

 const jld={'@context':'https://schema.org','@type':'TVSeries',name:x.name,
  url:`${DOM}/show/${x.slug}`,
  ...(x.img?{image:x.img}:{}),
  ...(x.sum?{description:x.sum.slice(0,300)}:{}),
  ...(x.genres.length?{genre:x.genres}:{}),
  ...(x.rating?{aggregateRating:{'@type':'AggregateRating',ratingValue:x.rating,bestRating:10,ratingCount:100}}:{}),
  ...(x.net?{productionCompany:{'@type':'Organization',name:x.net}}:{}),
  containsSeason:Object.keys(porTemp).map(k=>({'@type':'TVSeason',seasonNumber:+k,
   numberOfEpisodes:porTemp[k].length,
   startDate:porTemp[k][0].d}))};

 f.writeFileSync(P.join(O,'show',x.slug+'.html'),L(
  `${x.name} Season ${ep.s} Release Date — When Does It Come Out? | ${N}`,
  `${x.name} season ${ep.s} episode ${ep.n} airs ${fFecha(ep.d)}${x.net?' on '+x.net:''}. ${cuenta(ep.d)}. Full episode schedule, air dates and countdown.`,
  `${DOM}/show/${x.slug}`,
`<p class="crumb"><a href="../">Home</a> › ${NETOK.has(x.net)?`<a href="../network-${s(x.net)}">${e(x.net)}</a> › `:(x.net?e(x.net)+' › ':'')}${e(x.name)}</p>

<div class="showhd">
 <div class="po">${img(x)}</div>
 <div class="inf">
  <h1 style="font-size:2rem">${e(x.name)}</h1>
  <div class="meta">
   ${x.status?`<span class="${x.status==='Running'?'on':'off'}">${e(x.status)}</span>`:''}
   ${x.rating?`<span class="rt">★ ${x.rating}</span>`:''}
   ${x.net?`<span>${e(x.net)}</span>`:''}
   ${x.type?`<span>${e(x.type)}</span>`:''}
   ${x.genres.slice(0,3).map(g=>`<span>${e(g)}</span>`).join('')}
  </div>
  ${x.sum?`<p class="desc">${e(x.sum.slice(0,420))}${x.sum.length>420?'…':''}</p>`:''}
 </div>
</div>

<div class="hero">
<div class="k">Next episode</div>
<div class="v">Season ${ep.s}, Episode ${ep.n}</div>
<div class="d">${ep.t?e(ep.t)+' — ':''}${fFecha(ep.d)}${x.net?' on '+e(x.net):''}</div>
<div class="cd">${cuenta(ep.d)}</div>
</div>

<div class="box rv"><h3>When does ${e(x.name)} come out?</h3>
<p><strong>${e(x.name)}</strong> returns with <strong>season ${ep.s}, episode ${ep.n}</strong>${ep.t?` ("${e(ep.t)}")`:''} on <strong>${fFecha(ep.d)}</strong>${x.net?`, airing on ${e(x.net)}`:''}. ${(()=>{const n=dias(HOY_ISO,ep.d);
 return n===0?'That is <strong>today</strong>.':n===1?'That is <strong>tomorrow</strong>.':`That is <strong>in ${n} days</strong>.`})()}</p>
${prem&&prem.d!==ep.d?`<p>The season ${prem.s} premiere is scheduled for <strong>${fFecha(prem.d)}</strong>.</p>`:''}
<p>${x.eps.length>1?`There ${x.eps.length===2?'is':'are'} <strong>${x.eps.length} upcoming episode${x.eps.length>1?'s':''}</strong> on the schedule, running through ${fFecha(x.eps[x.eps.length-1].d)}.`:'This is the only episode currently scheduled.'}${x.status==='Running'?' The show is currently in production.':x.status==='Ended'?' Note that this series has ended.':''}</p>
${hist&&hist.first!==HOY_ISO?`<p style="color:var(--tx2);font-size:.87rem">We have been tracking this show since ${fFecha(hist.first)}.</p>`:''}
</div>

<h2>Upcoming episodes</h2>
<table class="eps"><thead><tr><th>Ep</th><th>Title</th><th>Air date</th><th>When</th></tr></thead><tbody>
${x.eps.slice(0,40).map(y=>`<tr>
<td class="se">S${y.s} E${y.n}</td>
<td class="ti">${y.t?e(y.t):'<span style="color:var(--tx2)">TBA</span>'}</td>
<td class="da">${fCorta(y.d)}, ${y.d.slice(0,4)}</td>
<td class="cd ${dias(HOY_ISO,y.d)<=7?'n':''}">${cuenta(y.d)}</td>
</tr>`).join('')}
</tbody></table>
${x.eps.length>40?`<p style="color:var(--tx2);font-size:.87rem;margin-top:12px">Showing the next 40 of ${x.eps.length} scheduled episodes.</p>`:''}

${mismos.length?`<h2 class="rv">More on ${e(x.net)}</h2>${grid(mismos,'../')}`:''}

<script type="application/ld+json">${JSON.stringify(jld)}<\/script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
 {'@type':'ListItem',position:1,name:N,item:DOM+'/'},
 ...(NETOK.has(x.net)?[{'@type':'ListItem',position:2,name:x.net,item:`${DOM}/network-${s(x.net)}`}]:[]),
 {'@type':'ListItem',position:NETOK.has(x.net)?3:2,name:x.name,item:`${DOM}/show/${x.slug}`}
]})}<\/script>`,'../'));
});
console.log(`   ✓ ${SHOWS.length.toLocaleString('en-US')} show pages`);

// ══ CALENDARIO ══
const fechas=[...new Set(SHOWS.flatMap(x=>x.eps.map(y=>y.d)))].sort();
const porMes={};
fechas.forEach(d=>{const m=d.slice(0,7);(porMes[m]=porMes[m]||[]).push(d)});
const meses=Object.keys(porMes).sort().slice(0,10);

f.writeFileSync(P.join(O,'calendar.html'),L(
 `TV Schedule Calendar — What's On This Week | ${N}`,
 `Full TV calendar with air dates for the next months. ${SHOWS.length} shows, ${premieres.length} season premieres. See what airs today, this week and beyond.`,
 DOM+'/calendar',
`<p class="crumb"><a href="./">Home</a> › Calendar</p>
<h1>TV calendar</h1>
<p class="sub">Every scheduled episode, day by day. ${fechas.length} dates with programming across ${SHOWS.length.toLocaleString('en-US')} shows.</p>
<h2>Browse by month</h2>
<div class="chips">${meses.map(m=>`<a href="calendar-${m}">${fMes(m+'-01')}<span class="n">${porMes[m].length} days</span></a>`).join('')}</div>
<h2 class="rv">Next 14 days</h2>
${fechas.filter(d=>dias(HOY_ISO,d)<=14).map(d=>{
 const lista=SHOWS.filter(x=>x.eps.some(y=>y.d===d)).slice(0,8);
 if(!lista.length)return '';
 return `<h3 style="margin:26px 0 11px;font-size:1rem;color:var(--tx2)">${fFecha(d)}${d===HOY_ISO?' — Today':''}</h3>${rows(lista)}`;
}).join('')}`));

meses.forEach(m=>{
 const ds=porMes[m];
 f.writeFileSync(P.join(O,`calendar-${m}.html`),L(
  `${fMes(m+'-01')} TV Schedule — Every Show Air Date | ${N}`,
  `Complete TV schedule for ${fMes(m+'-01')}. Every episode air date and season premiere across ${nets.length} networks and streaming services.`,
  `${DOM}/calendar-${m}`,
`<p class="crumb"><a href="./">Home</a> › <a href="calendar">Calendar</a> › ${fMes(m+'-01')}</p>
<h1>${fMes(m+'-01')} TV schedule</h1>
<p class="sub">${ds.length} days with new episodes this month.</p>
${ds.map(d=>{
 const lista=SHOWS.filter(x=>x.eps.some(y=>y.d===d)).slice(0,10);
 if(!lista.length)return '';
 return `<h3 style="margin:28px 0 11px;font-size:1rem;color:var(--tx2)">${fFecha(d)}${d===HOY_ISO?' — Today':''}</h3>${rows(lista)}`;
}).join('')}`));
});
console.log(`   ✓ calendar + ${meses.length} month pages`);

// ══ PREMIERES ══
f.writeFileSync(P.join(O,'premieres.html'),L(
 `Upcoming Season Premieres — ${premieres.length} Shows Returning | ${N}`,
 `${premieres.length} upcoming TV season premieres with exact release dates. Find out when your favorite series returns, sorted by air date.`,
 DOM+'/premieres',
`<p class="crumb"><a href="./">Home</a> › Season premieres</p>
<h1>Upcoming season premieres</h1>
<p class="sub">${premieres.length} shows returning with a new season, sorted by air date. The next one is <strong>${e(premieres[0].sh.name)}</strong> on ${fFecha(premieres[0].ep.d)}.</p>
${grid(premieres.slice(0,60).map(p=>p.sh))}`));

// ══ NETWORKS ══
f.writeFileSync(P.join(O,'networks.html'),L(
 `All TV Networks & Streaming Services | ${N}`,
 `Browse upcoming episodes by network: Netflix, HBO, Hulu, Prime Video, ABC, NBC, CBS, FOX and ${nets.length} more.`,
 DOM+'/networks',
`<p class="crumb"><a href="./">Home</a> › Networks</p>
<h1>Networks & streamers</h1>
<p class="sub">${nets.length} networks and streaming services with upcoming episodes.</p>
<div class="chips">${nets.map(([n,v])=>`<a href="network-${s(n)}">${e(n)}<span class="n">${v.length}</span></a>`).join('')}</div>`));

nets.forEach(([n,v])=>{
 const ord=[...v].sort((a,b)=>a.eps[0].d.localeCompare(b.eps[0].d));
 const pr=premieres.filter(p=>p.sh.net===n);
 f.writeFileSync(P.join(O,`network-${s(n)}.html`),L(
  `${n} Schedule — Upcoming Shows & Release Dates | ${N}`,
  `What's coming to ${n}: ${v.length} shows with upcoming episodes${pr.length?` and ${pr.length} season premieres`:''}. Air dates, countdowns and full schedule.`,
  `${DOM}/network-${s(n)}`,
`<p class="crumb"><a href="./">Home</a> › <a href="networks">Networks</a> › ${e(n)}</p>
<h1>${e(n)} schedule</h1>
<p class="sub">${v.length} show${v.length>1?'s':''} with upcoming episodes on ${e(n)}${pr.length?`, including ${pr.length} season premiere${pr.length>1?'s':''}`:''}. Next up: <strong>${e(ord[0].name)}</strong> on ${fFecha(ord[0].eps[0].d)}.</p>
${pr.length?`<h2>Season premieres on ${e(n)}</h2>${grid(pr.slice(0,12).map(p=>p.sh))}`:''}
<h2 class="rv">All upcoming</h2>
${rows(ord)}`));
});
console.log(`   ✓ networks + ${nets.length} network pages`);

// ══ GENEROS ══
gens.forEach(([g,v])=>{
 const ord=[...v].sort((a,b)=>a.eps[0].d.localeCompare(b.eps[0].d));
 f.writeFileSync(P.join(O,`genre-${s(g)}.html`),L(
  `Upcoming ${g} Shows — Release Dates | ${N}`,
  `${v.length} upcoming ${g.toLowerCase()} TV shows with air dates and countdowns. Find out when the next episode comes out.`,
  `${DOM}/genre-${s(g)}`,
`<p class="crumb"><a href="./">Home</a> › ${e(g)}</p>
<h1>Upcoming ${e(g)} shows</h1>
<p class="sub">${v.length} ${g.toLowerCase()} series with episodes on the schedule.</p>
${grid(ord.slice(0,48))}`));
});
console.log(`   ✓ ${gens.length} genre pages`);

// ══ PAGINAS LEGALES ══
const pgL=(file,title,body)=>f.writeFileSync(P.join(O,file+'.html'),L(
 `${title} | ${N}`,`${title} for ${N}.`,`${DOM}/${file}`,
 `<p class="crumb"><a href="./">Home</a> › ${title}</p><div class="legal"><h1>${title}</h1>${body}</div>`));

pgL('about','About',`
<p>${N} is a free tool that answers one question: <strong>when does it come out?</strong></p>
<p>We track ${SHOWS.length.toLocaleString('en-US')} English-language TV shows and list the exact air date of every upcoming episode, along with a countdown. No account, no paywall.</p>
<h2>Where the data comes from</h2>
<p>All schedule data is pulled from the <a href="https://www.tvmaze.com/api" rel="noopener nofollow" target="_blank">TVmaze public API</a>, a community-maintained TV database. We fetch a fresh copy every day and rebuild the entire site automatically.</p>
<h2>How accurate is it?</h2>
<p>Air dates within the next few weeks are usually solid. Dates further out are provisional — networks and streaming services move them regularly. We always show the most recent date on record, and the "Updated" stamp in the header tells you exactly how fresh the data is.</p>
<h2>Contact</h2>
<p>Spotted a wrong date or a missing show? Email <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

pgL('privacy','Privacy Policy',`
<p><em>Last updated: ${HOY}</em></p>
<h2>What we collect</h2>
<p>${N} does not require an account and does not ask for personal information. We do not run our own analytics or store data on a server — this is a static website.</p>
<h2>Cookies and local storage</h2>
<p>We store one preference in your browser's local storage: whether you accepted or declined cookies. Nothing else.</p>
<h2>Advertising</h2>
<p>We display advertising through third-party ad networks. <strong>Ad scripts are only loaded after you press "Accept"</strong> on the cookie banner. If you choose "Necessary only", no advertising or tracking script is loaded at all.</p>
<p>When ads are enabled, the ad provider may set cookies or use device identifiers to show relevant advertising, in line with their own privacy policy.</p>
<h2>Third-party content</h2>
<p>Show artwork is served from TVmaze servers. Your browser contacts those servers directly to load images.</p>
<h2>Your choices</h2>
<p>You can clear this site's data at any time from your browser settings, which resets your cookie choice. You can also use your browser's tracking protection or an ad blocker.</p>
<h2>Children</h2>
<p>This site is not directed at children under 13 and we do not knowingly collect information from them.</p>
<h2>Contact</h2>
<p>Questions about privacy: <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

pgL('terms','Terms of Use',`
<p><em>Last updated: ${HOY}</em></p>
<h2>Service</h2>
<p>${N} provides TV schedule information free of charge, on an "as is" basis, for personal and informational use.</p>
<h2>Accuracy</h2>
<p>Air dates are sourced from a third-party community database and change frequently. We make no guarantee that any date shown is correct or current. <strong>Always confirm with the network or streaming service before making plans.</strong> We are not liable for any loss resulting from reliance on this information.</p>
<h2>Trademarks</h2>
<p>Show titles, network names, logos and artwork are the property of their respective owners. ${N} is not affiliated with, endorsed by, or sponsored by any network, studio or streaming service mentioned on this site.</p>
<h2>Acceptable use</h2>
<p>Do not scrape, mirror or resell this site's content in bulk. If you want the underlying data, get it from the TVmaze API directly.</p>
<h2>Changes</h2>
<p>These terms may be updated at any time. Continued use means you accept the current version.</p>
<h2>Contact</h2>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>`);

pgL('contact','Contact',`
<p>Questions, corrections or business enquiries:</p>
<p><a class="btn" href="mailto:${MAIL}">${MAIL}</a></p>
<h2>Reporting a wrong date</h2>
<p>Our dates mirror the TVmaze database. If a date is wrong here, it is almost certainly wrong there too — the fastest fix is to report it directly to <a href="https://www.tvmaze.com" rel="noopener nofollow" target="_blank">TVmaze</a>, and our copy will pick up the correction within 24 hours.</p>
<h2>Removal requests</h2>
<p>If you represent a rights holder and want a show removed, email us with the details and we will action it.</p>`);
console.log('   ✓ 4 legal pages');

// ══ 404 ══
f.writeFileSync(P.join(O,'404.html'),L(
 `Page not found | ${N}`,'That page does not exist. Browse TV release dates and season premieres.',DOM+'/404',
`<div class="legal" style="text-align:center;padding:50px 0">
<h1 style="font-size:4rem">404</h1>
<p class="sub" style="margin:0 auto 26px">We could not find that page. The show may have been removed from the schedule.</p>
<p><a class="btn" href="/">Go home</a> <a class="btn g" href="/premieres">See premieres</a></p>
</div>`,'',true));

// ══ ESTATICOS ══
f.writeFileSync(P.join(O,'s.css'),CSS);
f.writeFileSync(P.join(O,'manifest.json'),JSON.stringify({
 name:N+' — TV Release Dates',short_name:N,
 description:'Find out when your TV shows come out. Release dates, season premieres and countdowns.',
 start_url:'/?s=pwa',scope:'/',display:'standalone',
 background_color:'#ffffff',theme_color:'#5b2be0',lang:'en-US',
 categories:['entertainment','utilities'],
 icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]
},null,1));

try{
 f.writeFileSync(P.join(O,'icon-192.png'),iconPNG(192));
 f.writeFileSync(P.join(O,'icon-512.png'),iconPNG(512));
 const ic=iconPNG(32),hd=Buffer.alloc(22);
 hd.writeUInt16LE(0,0);hd.writeUInt16LE(1,2);hd.writeUInt16LE(1,4);
 hd[6]=32;hd[7]=32;hd.writeUInt16LE(1,10);hd.writeUInt16LE(32,12);
 hd.writeUInt32LE(ic.length,14);hd.writeUInt32LE(22,18);
 f.writeFileSync(P.join(O,'favicon.ico'),Buffer.concat([hd,ic]));
 console.log('   ✓ manifest + icons');
}catch(err){console.log('   icons failed: '+err.message)}

f.writeFileSync(P.join(O,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect x="2" y="5" width="28" height="20" rx="4" stroke="#0f1115" stroke-width="2.4"/><path d="M11 2.5 16 5l5-2.5" stroke="#0f1115" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 12.2v5.6l5-2.8z" fill="#5b2be0"/><path d="M9 29h14" stroke="#0f1115" stroke-width="2.2" stroke-linecap="round"/></svg>');

// og.png
try{
 const c=_lz(1200,630,255,255,255);
 _rc(c,0,0,1200,14,91,43,224);
 _rc(c,68,74,54,4,15,17,21);_rc(c,68,74,4,40,15,17,21);
 _rc(c,118,74,4,40,15,17,21);_rc(c,68,110,54,4,15,17,21);
 _rc(c,88,88,14,12,91,43,224);
 _tx(c,'WHENISITOUT',140,82,7,15,17,21);
 _rc(c,70,166,1060,2,232,234,238);
 const t1='WHEN DOES IT COME OUT';
 _tx(c,t1,70,206,_fit(t1,1060,11),15,17,21);
 _tx(c,`TV RELEASE DATES FOR ${SHOWS.length} SHOWS`,70,300,5,107,114,128);
 if(prox){
  _rc(c,70,352,1060,186,246,247,249);
  _rc(c,70,352,6,186,91,43,224);
  _tx(c,'NEXT PREMIERE',102,382,4,107,114,128);
  const nm=ACC(prox.sh.name).slice(0,28);
  _tx(c,nm,102,418,_fit(nm,900,8),15,17,21);
  _tx(c,`SEASON ${prox.ep.s} - ${ACC(fFecha(prox.ep.d))}`,102,498,4,91,43,224);
 }
 _tx(c,'WHENISITOUT.PAGES.DEV  -  UPDATED DAILY',70,562,4,107,114,128);
 _rc(c,0,614,1200,16,91,43,224);
 f.writeFileSync(P.join(O,'og.png'),_png(c));
 console.log('   ✓ og.png');
}catch(err){console.log('   og.png failed: '+err.message)}

if(SWZONE){
 f.writeFileSync(P.join(O,'sw.js'),`self.options={"domain":"","zoneId":${SWZONE}}\nself.lary=""\n`);
}

f.writeFileSync(P.join(O,'_redirects'),'/index.html / 200\n');
f.writeFileSync(P.join(O,'_headers'),
`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Cache-Control: public, max-age=600, stale-while-revalidate=86400

/*.json
  Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=86400

/s.css
  Cache-Control: public, max-age=3600, stale-while-revalidate=604800
/favicon.ico
  Cache-Control: public, max-age=86400
/favicon.svg
  Cache-Control: public, max-age=86400
/og.png
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/sw.js
  Cache-Control: no-store, max-age=0
  Service-Worker-Allowed: /
`);

// sitemap
const U=['','calendar','premieres','networks','about','privacy','terms','contact']
 .concat(meses.map(m=>`calendar-${m}`))
 .concat(nets.map(([n])=>`network-${s(n)}`))
 .concat(gens.map(([g])=>`genre-${s(g)}`))
 .concat(SHOWS.map(x=>`show/${x.slug}`));
f.writeFileSync(P.join(O,'sitemap.xml'),
 '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 U.map(u=>`<url><loc>${DOM}/${u}</loc><lastmod>${HOY_ISO}</lastmod></url>`).join('\n')+
 '\n</urlset>');
f.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${DOM}/sitemap.xml\n`);
console.log(`   ✓ sitemap.xml (${U.length.toLocaleString('en-US')} URLs) + robots.txt`);

let by=0,ct=0;(function W(d){f.readdirSync(d,{withFileTypes:true}).forEach(x=>{
 const p=P.join(d,x.name);x.isDirectory()?W(p):(by+=f.statSync(p).size,ct++)})})(O);
console.log(`\n✅ DONE — ${ct.toLocaleString('en-US')} files, ${(by/1048576).toFixed(1)} MB\n`);
})();
