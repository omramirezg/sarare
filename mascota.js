/* Cubi — la mascota de Sarare Tech (el cubo del logo convertido en robot).
   Vive en el espacio libre del panel de código de la portada (todo el rectángulo a la derecha del código,
   desde arriba hasta el encabezado SALIDA) y hace cosas solo: camina, salta entre "pisos", se asoma por el
   borde, escribe en su portátil, riega una matica, lee un documento con lupa, carga una caja, juega con
   unas llaves { }, patea un cubito de datos, baila, duerme la siesta y da volteretas. Habla con burbujas.
   - Mientras se escribe el nombre de la demostración señala la línea; al aparecer la nueva, celebra y señala SALIDA.
   - Mouse encima: saluda. Clic: voltereta. Se puede ARRASTRAR (mouse o dedo) y soltar en cualquier parte de la
     página: se queda ahí, sigue con su vida en un radio corto y se desplaza con el contenido. Doble clic, o
     soltarlo de nuevo sobre el editor, lo devuelve a casa. La posición se recuerda en la sesión.
   - Se detiene fuera de pantalla o con la pestaña oculta; con "reducir movimiento" queda quieto (arrastrar sí funciona).
   Solo SVG + CSS + JS propio, sin librerías. Decorativo: aria-hidden, sin foco. */
(() => {
  'use strict';
  const code = document.querySelector('.hero__visual .ide__code');
  const figure = code && code.closest('.ide');
  const textEl = code && code.querySelector('code');
  if (!code || !figure || !textEl) {
    if (document.querySelector('.ide')) console.warn('[cubi] no se encontró el panel de código de la portada; la mascota no se muestra');
    return;
  }
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tiny = window.matchMedia('(max-width: 319px)');     // solo se oculta si de verdad no cabe
  const narrow = window.matchMedia('(max-width: 760px)');   // celular/tableta: Cubi más pequeño y frases cortas
  const visual = figure.parentElement;                      // .hero__visual (para la casa sobre la barra)
  const fileEl = figure.querySelector('.ide__file');
  const demoName = document.getElementById('demoName');
  const demoTitle = document.getElementById('demoTitle');
  const header = document.querySelector('.top');
  const MAX_NAME = 23;            // nombre de demostración más largo que puede escribirse (con margen)
  const STORE = 'sarare-cubi';    // posición fuera de casa durante la sesión

  const CSS = `.cubi svg{display:block;width:100%;height:100%;overflow:visible}
.cubi svg *:not([transform]){transform-box:fill-box}
.cubi .cb-shadow{fill:#000;opacity:.35;transform-origin:50% 50%}
.cubi .cb-all{transform-origin:50% 100%}
.cubi .cb-spin{transform-origin:50% 55%}
.cubi .cb-sit{transition:transform .4s cubic-bezier(.3,.7,.3,1)}
.cubi .cb-leg-l,.cubi .cb-leg-r{transform-origin:50% 100%;transition:transform .4s}
.cubi .cb-body{transform-origin:50% 100%;animation:cb-breathe 3.4s ease-in-out infinite}
.cubi .cb-look{transform:translate(calc(var(--lx,0)*5px),calc(var(--ly,0)*3px));transition:transform .28s cubic-bezier(.3,.7,.3,1)}
.cubi .cb-ball{transform-origin:50% 50%;transition:transform .08s,opacity .15s}
.cubi .cb-eye path,.cubi .cb-mouth{opacity:0;transition:opacity .15s}
.cubi .cb-smile{transition:opacity .15s}
.cubi.is-blink .cb-ball{transform:scaleY(.12)}
.cubi.is-happy .cb-ball,.cubi.is-wave .cb-ball{opacity:0}
.cubi.is-happy .cb-eye path:not(.cb-zz),.cubi.is-wave .cb-eye path:not(.cb-zz),.cubi.is-happy .cb-mouth,.cubi.is-wave .cb-mouth{opacity:1}
.cubi.is-happy .cb-smile,.cubi.is-wave .cb-smile{opacity:0}
.cubi .cb-arm-l{transform-origin:100% 0;transition:transform .3s}.cubi .cb-arm-r{transform-origin:0 0;transition:transform .3s}
.cubi .cb-antena{transform-origin:50% 100%;animation:cb-sway 5s ease-in-out infinite}
.cubi .cb-led{animation:cb-led 2.6s ease-in-out infinite}
.cubi .cb-lap{opacity:0;transform:translateY(10px);transition:opacity .3s,transform .4s cubic-bezier(.3,.7,.3,1)}
.cubi .cb-key{fill:#6f7b76}
.cubi .cb-taps{opacity:0}
.cubi .cb-spark path{fill:#f8cf6a;opacity:0;transform-origin:50% 50%}
.cubi.is-hop .cb-all{animation:cb-hop 1.1s cubic-bezier(.3,.6,.35,1)}
.cubi.is-hop .cb-shadow{animation:cb-shad 1.1s}
.cubi.is-jump .cb-all{animation:cb-jump 1.5s cubic-bezier(.3,.6,.35,1)}
.cubi.is-jump .cb-spin{animation:cb-flip 1.5s ease-in-out}
.cubi.is-jump .cb-shadow{animation:cb-shad2 1.5s}
.cubi.is-wave .cb-arm-r{animation:cb-wave 2.4s ease-in-out}
.cubi.is-wave .cb-body{animation:cb-lean 2.4s ease-in-out}
.cubi.is-spin .cb-antena{animation:cb-ant 2s ease-in-out}
.cubi.is-spin .cb-led{animation:cb-ledb .25s steps(1) 8}
.cubi.is-typing .cb-sit{transform:translateY(16px)}
.cubi.is-typing .cb-leg-l,.cubi.is-typing .cb-leg-r{transform:scaleY(.4)}
.cubi.is-typing .cb-lap{opacity:1;transform:none}
.cubi.is-typing .cb-arm-l{animation:cb-tapl .3s ease-in-out infinite alternate}
.cubi.is-typing .cb-arm-r{animation:cb-tapr .3s ease-in-out infinite alternate-reverse}
.cubi.is-typing .cb-key{animation:cb-key .45s steps(1) infinite}
.cubi.is-typing .cb-key:nth-of-type(2n){animation-delay:.15s}.cubi.is-typing .cb-key:nth-of-type(3n){animation-delay:.3s}
.cubi.is-typing .cb-lines{animation:cb-scroll 2.4s linear infinite}
.cubi.is-typing .cb-taps{animation:cb-taps .6s steps(1) infinite}
.cubi.is-typing .cb-led{fill:#f8cf6a;animation-duration:.5s}
.cubi.is-walk .cb-all{animation:cb-bob .34s ease-in-out infinite alternate}
.cubi.is-walk .cb-leg-l{animation:cb-step .34s ease-in-out infinite alternate}
.cubi.is-walk .cb-leg-r{animation:cb-step .34s ease-in-out infinite alternate-reverse}
.cubi.is-walk .cb-arm-l{animation:cb-swing .34s ease-in-out infinite alternate}
.cubi.is-walk .cb-arm-r{animation:cb-swing .34s ease-in-out infinite alternate-reverse}
.cubi.is-party .cb-spark path{animation:cb-spark .9s ease-out}
.cubi.is-party .cb-spark g:nth-child(2) path{animation-delay:.12s}
.cubi.is-party .cb-spark g:nth-child(3) path{animation-delay:.24s}
@keyframes cb-breathe{50%{transform:scale(1.018,.978)}}
@keyframes cb-sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes cb-led{50%{opacity:.55}}
@keyframes cb-hop{0%{transform:none}28%{transform:scale(1.12,.84)}36%{transform:scale(.94,1.08)}58%{transform:translateY(-40px) scale(.96,1.05)}80%{transform:scale(1.1,.88)}90%{transform:scale(.98,1.03)}100%{transform:none}}
@keyframes cb-shad{58%{transform:scale(.55);opacity:.15}}
@keyframes cb-jump{0%{transform:none}18%{transform:scale(1.12,.85)}26%{transform:scale(.95,1.06)}52%{transform:translateY(-62px)}80%{transform:scale(1.1,.88)}90%{transform:scale(.98,1.03)}100%{transform:none}}
@keyframes cb-flip{0%,26%{transform:none}74%,100%{transform:rotate(360deg)}}
@keyframes cb-shad2{52%{transform:scale(.4);opacity:.12}}
@keyframes cb-wave{0%,100%{transform:none}14%{transform:rotate(-132deg) scale(1.15)}26%{transform:rotate(-92deg) scale(1.15)}38%{transform:rotate(-132deg) scale(1.15)}50%{transform:rotate(-92deg) scale(1.15)}62%{transform:rotate(-132deg) scale(1.15)}74%{transform:rotate(-92deg) scale(1.15)}86%{transform:rotate(-125deg) scale(1.15)}}
@keyframes cb-lean{0%,100%{transform:none}20%,80%{transform:rotate(-4deg)}}
@keyframes cb-ant{0%,100%{transform:none}12%{transform:rotate(-26deg)}26%{transform:rotate(22deg)}40%{transform:rotate(-20deg)}54%{transform:rotate(16deg)}68%{transform:rotate(-10deg)}82%{transform:rotate(6deg)}}
@keyframes cb-ledb{0%{fill:#f8cf6a}50%{fill:#3fb68b}}
@keyframes cb-tapl{from{transform:rotate(-30deg) scale(1.2)}to{transform:rotate(-38deg) scale(1.3)}}
@keyframes cb-tapr{from{transform:rotate(16deg)}to{transform:rotate(32deg)}}
@keyframes cb-key{0%{fill:#6f7b76}50%{fill:#f8cf6a}}
@keyframes cb-scroll{to{transform:translateY(-25px)}}
@keyframes cb-taps{0%{opacity:1}50%{opacity:0}}
@keyframes cb-bob{from{transform:translateY(0)}to{transform:translateY(-6px)}}
@keyframes cb-step{from{transform:translateY(0)}to{transform:translateY(-12px) scaleY(.9)}}
@keyframes cb-swing{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
@keyframes cb-spark{0%{opacity:0;transform:scale(0) rotate(0)}30%{opacity:1;transform:scale(1.2) rotate(45deg)}100%{opacity:0;transform:scale(.4) rotate(90deg)}}
.cubi .cb-pplant,.cubi .cb-pcan,.cubi .cb-drops,.cubi .cb-pdoc,.cubi .cb-pmag,.cubi .cb-pbox,.cubi .cb-pb,.cubi .cb-pcube,.cubi .cb-pz text,.cubi .cb-pn path,.cubi .cb-zz{opacity:0}
.cubi .cb-pplant,.cubi .cb-pcan,.cubi .cb-pdoc,.cubi .cb-pmag,.cubi .cb-pbox,.cubi .cb-pcube{transition:opacity .3s}
.cubi .cb-leaves{transform-origin:50% 100%;transform:scale(.8)}
.cubi .cb-pcan{transform-origin:0 50%}
.cubi .cb-pb,.cubi .cb-pcube{transform-origin:50% 50%}
.cubi.is-water .cb-pplant,.cubi.is-water .cb-pcan{opacity:1}
.cubi.is-water .cb-arm-r{transform:rotate(-35deg)}
.cubi.is-water .cb-pcan{animation:cb-pour 3.3s ease-in-out}
.cubi.is-water .cb-drops{animation:cb-drops .5s linear .6s 5}
.cubi.is-water .cb-leaves{animation:cb-grow 3.3s ease-in-out forwards}
.cubi.is-read .cb-pdoc,.cubi.is-read .cb-pmag{opacity:1}
.cubi.is-read .cb-pmag{animation:cb-mag 3.3s ease-in-out}
.cubi.is-read .cb-arm-l{transform:rotate(-8deg)}
.cubi.is-carry .cb-pbox{opacity:1}
.cubi.is-carry .cb-antena{opacity:0}
.cubi.is-carry .cb-arm-l,.cubi.is-carry.is-walk .cb-arm-l{animation:none;transform:rotate(125deg)}
.cubi.is-carry .cb-arm-r,.cubi.is-carry.is-walk .cb-arm-r{animation:none;transform:rotate(-125deg)}
.cubi.is-juggle .cb-pb{opacity:1;animation:cb-toss .9s ease-in-out 3}
.cubi.is-juggle .cb-arm-r{animation:cb-flick .9s ease-in-out 3}
.cubi.is-kick .cb-pcube{opacity:1;animation:cb-kickc 2.4s ease-in-out}
.cubi.is-kick .cb-leg-l{animation:cb-kickl 2.4s ease-in-out}
.cubi.is-nap .cb-sit{transform:translateY(16px)}
.cubi.is-nap .cb-leg-l,.cubi.is-nap .cb-leg-r{transform:scaleY(.4)}
.cubi.is-nap .cb-ball,.cubi.is-nap .cb-eye path:not(.cb-zz){opacity:0}
.cubi.is-nap .cb-zz{opacity:1}
.cubi.is-nap .cb-body{animation:cb-deep 2.4s ease-in-out infinite}
.cubi.is-nap .cb-antena{animation:none;transform:rotate(28deg);transition:transform .5s}
.cubi.is-nap .cb-led{opacity:.35;animation:none}
.cubi.is-nap .cb-pz text{animation:cb-z 2.2s ease-out infinite .5s}
.cubi.is-nap .cb-pz text:nth-child(2){animation-delay:1.2s}.cubi.is-nap .cb-pz text:nth-child(3){animation-delay:1.9s}
.cubi.is-dance .cb-all{animation:cb-dance .5s ease-in-out infinite alternate}
.cubi.is-dance .cb-arm-l{animation:cb-dl .5s ease-in-out infinite alternate}
.cubi.is-dance .cb-arm-r{animation:cb-dr .5s ease-in-out infinite alternate}
.cubi.is-dance .cb-pn .n1{animation:cb-note 1.3s ease-out infinite}
.cubi.is-dance .cb-pn .n2{animation:cb-note 1.3s ease-out .65s infinite}
.cubi.is-point .cb-arm-l{animation:cb-point .5s ease-in-out infinite alternate}
.cubi.is-pointdown .cb-arm-r{animation:cb-pointd .45s ease-in-out infinite alternate}
.cubi.is-oops .cb-all{animation:cb-oops 1.1s ease-out}
.cubi.is-turn .cb-spin{animation:cb-turn 1s ease-in-out}
.cubi.is-dance .cb-ball,.cubi.is-juggle .cb-ball,.cubi.is-oops .cb-ball{opacity:0}
.cubi.is-dance .cb-eye path:not(.cb-zz),.cubi.is-juggle .cb-eye path:not(.cb-zz),.cubi.is-oops .cb-eye path:not(.cb-zz),.cubi.is-dance .cb-mouth,.cubi.is-juggle .cb-mouth{opacity:1}
.cubi.is-dance .cb-smile,.cubi.is-juggle .cb-smile{opacity:0}
@keyframes cb-pour{0%,100%{transform:none}20%,82%{transform:rotate(24deg)}}
@keyframes cb-drops{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(18px)}}
@keyframes cb-grow{0%,20%{transform:scale(.8)}70%{transform:scale(1.2)}85%,100%{transform:scale(1.1)}}
@keyframes cb-mag{0%,100%{transform:none}25%{transform:translate(-6px,-6px)}50%{transform:translate(4px,4px)}75%{transform:translate(-4px,12px)}}
@keyframes cb-toss{0%{transform:translateY(0) rotate(0)}50%{transform:translateY(-52px) rotate(180deg)}100%{transform:translateY(0) rotate(360deg)}}
@keyframes cb-flick{0%,100%{transform:rotate(-40deg)}12%{transform:rotate(-80deg)}45%{transform:rotate(-30deg)}}
@keyframes cb-kickc{0%,22%{transform:none}50%{transform:translate(40px,-430px) rotate(200deg)}78%{transform:translate(0,0) rotate(360deg)}86%{transform:translateY(-60px) rotate(360deg)}94%,100%{transform:rotate(360deg)}}
@keyframes cb-kickl{0%,14%,34%,100%{transform:none}22%{transform:translate(-9px,-9px)}}
@keyframes cb-deep{50%{transform:scale(1.03,.95)}}
@keyframes cb-z{0%{opacity:0;transform:translate(0,0) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(22px,-36px) scale(1.2)}}
@keyframes cb-dance{from{transform:rotate(-9deg) translateY(0)}to{transform:rotate(9deg) translateY(-9px)}}
@keyframes cb-dl{from{transform:rotate(115deg)}to{transform:rotate(15deg)}}
@keyframes cb-dr{from{transform:rotate(-15deg)}to{transform:rotate(-115deg)}}
@keyframes cb-note{0%{opacity:0;transform:translate(0,6px) scale(.7)}25%{opacity:1}100%{opacity:0;transform:translate(8px,-34px) rotate(14deg)}}
@keyframes cb-point{from{transform:rotate(48deg) scale(1.25)}to{transform:rotate(55deg) scale(1.38)}}
@keyframes cb-pointd{from{transform:rotate(26deg) scale(1.25)}to{transform:rotate(36deg) scale(1.38)}}
@keyframes cb-oops{0%{transform:none}20%{transform:rotate(16deg)}45%{transform:rotate(-10deg)}70%{transform:rotate(5deg)}100%{transform:none}}
@keyframes cb-turn{0%,100%{transform:none}25%{transform:scaleX(.08)}50%{transform:scaleX(-1)}75%{transform:scaleX(.08)}}
.cubi .c3{position:absolute;inset:0}
.cubi .c3-props{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.cubi .c3-props-b{z-index:0}.cubi .c3-props-f{z-index:2}
.cubi .c3-stage{position:absolute;z-index:1;left:50%;top:53.06%;width:0;height:0;perspective:calc(var(--u)*560)}
.cubi .c3-move,.cubi .c3-cam,.cubi .c3-body,.cubi .c3-part{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}
.cubi .c3-f{position:absolute;left:calc(var(--u)*-42);top:calc(var(--u)*-42);width:calc(var(--u)*84);height:calc(var(--u)*84);background:#f0a23b;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:inset 0 0 0 calc(var(--u)*1.8) rgba(0,0,0,.1)}
.cubi .c3-front{transform:translateZ(calc(var(--u)*42))}.cubi .c3-back{transform:rotateY(180deg) translateZ(calc(var(--u)*42))}
.cubi .c3-right{transform:rotateY(90deg) translateZ(calc(var(--u)*42))}.cubi .c3-left{transform:rotateY(-90deg) translateZ(calc(var(--u)*42))}
.cubi .c3-top{transform:rotateX(90deg) translateZ(calc(var(--u)*42))}.cubi .c3-bottom{transform:rotateX(-90deg) translateZ(calc(var(--u)*42))}
.cubi .c3-pl{position:absolute}
.cubi .c3-pa{left:calc(var(--u)*-8);top:calc(var(--u)*-52);width:calc(var(--u)*16);height:calc(var(--u)*52)}
.cubi .c3-pr{left:calc(var(--u)*-7);top:calc(var(--u)*-3);width:calc(var(--u)*14);height:calc(var(--u)*38)}
.cubi .c3-pg{left:calc(var(--u)*-11);top:0;width:calc(var(--u)*22);height:calc(var(--u)*48)}
.cubi .c3-x{transform:rotateY(90deg)}
.cubi .c3-shadow{position:absolute;left:50%;top:96.94%;width:calc(var(--u)*100);height:calc(var(--u)*15);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.95),rgba(0,0,0,0));opacity:.38;transform:translate(-50%,-50%)}
.cubi .c3-ant{transition:opacity .25s}.cubi.is-carry .c3-ant{opacity:0}
.cubi.is-drag .c3-shadow{opacity:0!important}
.hero__visual .ide__code{position:relative}
.cubi-layer{position:absolute;inset:0;pointer-events:none;white-space:normal;z-index:1}
.cubi-layer[hidden]{display:none}
.cubi-away{position:absolute;left:0;top:0;width:0;height:0;z-index:40;pointer-events:none;white-space:normal}
.cubi{position:absolute;left:0;top:0;height:clamp(64px,9vh,88px);aspect-ratio:184/196;pointer-events:auto;cursor:grab;
  touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;--lx:0;--ly:0}
.cubi.is-drag{cursor:grabbing}
.cubi svg{transform-origin:50% 0}
.cubi.is-air .cb-leg-l,.cubi.is-air .cb-leg-r{transform:scaleY(.72)}
.cubi.is-air .cb-arm-l{transform:rotate(70deg)}.cubi.is-air .cb-arm-r{transform:rotate(-70deg)}
.cubi.is-land .cb-all{animation:cb-land .42s ease-out}
.cubi.is-sitdown .cb-sit{transform:translateY(16px)}
.cubi.is-sitdown .cb-leg-l,.cubi.is-sitdown .cb-leg-r{transform:scaleY(.4)}
.cubi.is-drag .cb-leg-l,.cubi.is-drag .cb-leg-r{transform-origin:50% 0}
.cubi.is-drag .cb-leg-l{animation:cb-dangle .45s ease-in-out infinite alternate}
.cubi.is-drag .cb-leg-r{animation:cb-dangle .45s ease-in-out infinite alternate-reverse}
.cubi.is-drag .cb-arm-l{transform:rotate(115deg)}.cubi.is-drag .cb-arm-r{transform:rotate(-115deg)}
.cubi.is-drag .cb-mouth{opacity:1}.cubi.is-drag .cb-smile{opacity:0}
.cubi.is-drag .cb-ball{transform:scale(1.15)}
.cubi.is-drag .cb-shadow{opacity:0}
.cubi.is-paused,.cubi.is-paused *{animation-play-state:paused!important}
@keyframes cb-land{0%{transform:scale(1.16,.8)}55%{transform:scale(.95,1.06)}100%{transform:none}}
@keyframes cb-dangle{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
.cubi-say{position:absolute;left:0;top:0;z-index:2;width:max-content;max-width:200px;padding:6px 10px;border-radius:10px;background:#f2f4f3;color:#0f1412;
  font:600 12px/1.3 Inter,system-ui,sans-serif;box-shadow:0 8px 20px -8px rgba(0,0,0,.7);white-space:normal;
  opacity:0;transform:translateY(4px) scale(.96);transition:opacity .18s,transform .18s;pointer-events:none}
.cubi-say.is-on{opacity:1;transform:none}
.cubi-say::after{content:"";position:absolute;top:100%;left:var(--tail,50%);margin-left:-6px;border:6px solid transparent;border-top-color:#f2f4f3}
.cubi-say.no-tail::after{display:none}
.hero__visual{position:relative}
.cubi-bar{position:absolute;left:0;top:0;width:0;height:0;z-index:5;pointer-events:none;white-space:normal}
.cubi-bar[hidden]{display:none}
.cubi.is-mini{height:clamp(40px,11vw,56px)}
.cubi-say.is-short{font-size:11px;padding:5px 8px}
@media (max-width:319px){.cubi-layer,.cubi-away,.cubi-bar{display:none}}
.cubi-hl{outline:2px solid #f8cf6a!important;outline-offset:4px;animation:cubi-hl 1s ease-in-out infinite}
@keyframes cubi-hl{50%{outline-offset:7px;outline-color:rgba(248,207,106,.4)}}
@media (prefers-reduced-motion:reduce){.cubi-hl{animation:none}}
@media (prefers-reduced-motion:reduce){.cubi,.cubi *,.cubi-say{animation:none!important;transition:none!important}}`;

  const SVG = `<svg viewBox="-92 -104 184 196" aria-hidden="true" focusable="false">
<defs><clipPath id="cubiScr"><rect x="2.5" y="2.5" width="37" height="25" rx="2"/></clipPath></defs>
<ellipse class="cb-shadow" cx="0" cy="86" rx="46" ry="7"/>
<g class="cb-pplant"><path d="M98 70 L120 70 L116 86 L102 86Z" fill="#e0663a"/><rect x="95" y="65" width="28" height="7" rx="2.5" fill="#c9562f"/><g class="cb-leaves"><path d="M109 66 V46" stroke="#3fb68b" stroke-width="3" stroke-linecap="round"/><path d="M109 56 Q96 50 97 40 Q108 45 109 56Z M109 50 Q121 40 124 46 Q118 55 109 50Z M109 46 Q104 36 110 30 Q114 38 109 46Z" fill="#3fb68b"/></g></g>
<g class="cb-all"><g class="cb-spin">
<g class="cb-leg-l"><rect x="-36" y="46" width="9" height="32" rx="4.5" fill="#2b3531"/><rect x="-45" y="74" width="20" height="10" rx="5" fill="#3a4541"/></g>
<g class="cb-leg-r"><rect x="27" y="46" width="9" height="32" rx="4.5" fill="#2b3531"/><rect x="25" y="74" width="20" height="10" rx="5" fill="#3a4541"/></g>
<g class="cb-lap">
<path d="M-112 66 L-86 81 L-44 56.75 L-44 61 L-86 85.5 L-112 70.5Z" fill="#1c2421"/>
<path d="M-112 66 L-70 41.75 L-44 56.75 L-86 81Z" fill="#3a4541" stroke="#98a39e" stroke-width="1.6" stroke-linejoin="round"/>
<circle class="cb-key" cx="-96" cy="66" r="2.4"/><circle class="cb-key" cx="-88" cy="61.5" r="2.4"/><circle class="cb-key" cx="-80" cy="57" r="2.4"/><circle class="cb-key" cx="-72" cy="52.5" r="2.4"/><circle class="cb-key" cx="-86" cy="70.5" r="2.4"/><circle class="cb-key" cx="-78" cy="66" r="2.4"/><circle class="cb-key" cx="-70" cy="61.5" r="2.4"/><circle class="cb-key" cx="-62" cy="57" r="2.4"/><circle class="cb-key" cx="-68" cy="70.5" r="2.4"/><circle class="cb-key" cx="-60" cy="66" r="2.4"/>
<g transform="matrix(1 -.5774 0 1 -112 36)"><rect width="42" height="30" rx="3" fill="#26302c" stroke="#98a39e" stroke-width="2"/><rect x="2.5" y="2.5" width="37" height="25" rx="2" fill="#12201b"/><g clip-path="url(#cubiScr)"><g class="cb-lines"><rect x="4" y="4" width="20" height="2.6" rx="1.3" fill="#f0a23b"/><rect x="4" y="9" width="28" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="8" y="14" width="18" height="2.6" rx="1.3" fill="#8fd0a8"/><rect x="8" y="19" width="24" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="4" y="24" width="14" height="2.6" rx="1.3" fill="#f5c98a"/><rect x="4" y="29" width="20" height="2.6" rx="1.3" fill="#f0a23b"/><rect x="4" y="34" width="28" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="8" y="39" width="18" height="2.6" rx="1.3" fill="#8fd0a8"/><rect x="8" y="44" width="24" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="4" y="49" width="14" height="2.6" rx="1.3" fill="#f5c98a"/><rect x="4" y="54" width="20" height="2.6" rx="1.3" fill="#f0a23b"/><rect x="4" y="59" width="28" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="8" y="64" width="18" height="2.6" rx="1.3" fill="#8fd0a8"/><rect x="8" y="69" width="24" height="2.6" rx="1.3" fill="#6f7b76"/><rect x="4" y="74" width="14" height="2.6" rx="1.3" fill="#f5c98a"/></g></g></g>
<g class="cb-taps" stroke="#f8cf6a" stroke-width="2.6" stroke-linecap="round"><path d="M-74 36 l-4 -6 M-64 33 l0 -7 M-54 36 l4 -6"/></g>
</g>
<g class="cb-sit"><g class="cb-body">
<path d="M0 -75 L63.5 -38.3 L63.5 38.3 L0 75 L-63.5 38.3 L-63.5 -38.3Z" fill="#0f1412"/>
<path fill="#f8cf6a" d="M0 -3.57 L-58.77 -37.5 L0 -71.43 L58.77 -37.5Z"/>
<path fill="#f0a23b" d="M-3.09 1.79 L-3.09 69.64 L-61.86 35.71 L-61.86 -32.14Z"/>
<path fill="#e0663a" d="M3.09 1.79 L61.86 -32.14 L61.86 35.71 L3.09 69.64Z"/>
<path d="M-44 -40 L-26 -50.4" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
<rect x="-40" y="2" width="80" height="44" rx="15" fill="#0f1412"/>
<g class="cb-look">
<ellipse cx="-27" cy="33" rx="4.5" ry="2.8" fill="#e0663a" opacity=".8"/><ellipse cx="27" cy="33" rx="4.5" ry="2.8" fill="#e0663a" opacity=".8"/>
<g class="cb-eye" transform="translate(-16 20)"><g class="cb-ball"><circle r="8.5" fill="#f8cf6a"/><circle cx="2.6" cy="-3" r="2.8" fill="#fff" opacity=".9"/></g><path d="M-7.5 3 Q0 -7.5 7.5 3" fill="none" stroke="#f8cf6a" stroke-width="3.6" stroke-linecap="round"/><path class="cb-zz" d="M-7 0 Q0 5 7 0" fill="none" stroke="#f8cf6a" stroke-width="3.4" stroke-linecap="round"/></g><g class="cb-eye" transform="translate(16 20)"><g class="cb-ball"><circle r="8.5" fill="#f8cf6a"/><circle cx="2.6" cy="-3" r="2.8" fill="#fff" opacity=".9"/></g><path d="M-7.5 3 Q0 -7.5 7.5 3" fill="none" stroke="#f8cf6a" stroke-width="3.6" stroke-linecap="round"/><path class="cb-zz" d="M-7 0 Q0 5 7 0" fill="none" stroke="#f8cf6a" stroke-width="3.4" stroke-linecap="round"/></g>
<path class="cb-smile" d="M-7 32 Q0 39 7 32" fill="none" stroke="#f8cf6a" stroke-width="3.2" stroke-linecap="round"/>
<path class="cb-mouth" d="M-8 30.5 Q0 44 8 30.5Z" fill="#f8cf6a" stroke="#f8cf6a" stroke-width="2" stroke-linejoin="round"/>
</g>
<g class="cb-antena"><line x1="0" y1="-40" x2="0" y2="-84" stroke="#98a39e" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="0" cy="-39" rx="7" ry="4" fill="#d98f32"/><circle class="cb-led" cx="0" cy="-89" r="6.5" fill="#3fb68b"/></g>
<g class="cb-arm-l"><path d="M-58 6 Q-74 10 -77 26" fill="none" stroke="#2b3531" stroke-width="7" stroke-linecap="round"/><circle cx="-77" cy="29" r="6.5" fill="#f8cf6a"/></g><g class="cb-arm-r"><path d="M58 6 Q74 10 77 26" fill="none" stroke="#2b3531" stroke-width="7" stroke-linecap="round"/><circle cx="77" cy="29" r="6.5" fill="#f8cf6a"/></g>
</g></g>
<g class="cb-pcan"><rect x="80" y="2" width="18" height="16" rx="3" fill="#98a39e"/><path d="M96 8 L110 1" stroke="#98a39e" stroke-width="4" stroke-linecap="round"/><path d="M83 2 Q89 -7 95 2" fill="none" stroke="#6f7b76" stroke-width="2.6"/></g><g class="cb-drops" fill="#8fd0e8"><circle cx="111" cy="10" r="2.2"/><circle cx="107" cy="20" r="2.2"/><circle cx="112" cy="30" r="2.2"/></g><g class="cb-pdoc"><rect x="-106" y="-6" width="32" height="40" rx="3" fill="#f2f4f3"/><path d="M-101 2 H-80 M-101 9 H-84 M-101 16 H-80 M-101 23 H-88" stroke="#98a39e" stroke-width="2.4" stroke-linecap="round"/><rect x="-101" y="26" width="10" height="4" rx="1" fill="#e0663a"/></g><g class="cb-pmag"><circle cx="-86" cy="8" r="10" fill="#8fd0e8" fill-opacity=".25" stroke="#f8cf6a" stroke-width="3.6"/><path d="M-78.5 15.5 L-69 25" stroke="#f8cf6a" stroke-width="5" stroke-linecap="round"/></g><g class="cb-pbox"><path d="M-32 -96 L28 -96 L28 -60 L-32 -60Z" fill="#c98a4b"/><path d="M-32 -96 L-20 -108 L40 -108 L28 -96Z" fill="#e0a868"/><path d="M28 -96 L40 -108 L40 -72 L28 -60Z" fill="#a8703a"/><path d="M-2 -96 V-60 M10 -108 L-2 -96" stroke="#f8cf6a" stroke-width="3" opacity=".75"/></g><text class="cb-pb" x="62" y="-30" font-family="JetBrains Mono,monospace" font-weight="700" font-size="30" fill="#8fd0a8">{ }</text><g transform="matrix(.17 0 0 .17 -78 72)"><g class="cb-pcube"><path fill="#f8cf6a" d="M0 -3.57 L-58.77 -37.5 L0 -71.43 L58.77 -37.5Z"/><path fill="#f0a23b" d="M-3.09 1.79 L-3.09 69.64 L-61.86 35.71 L-61.86 -32.14Z"/><path fill="#e0663a" d="M3.09 1.79 L61.86 -32.14 L61.86 35.71 L3.09 69.64Z"/></g></g><g class="cb-pz" fill="#f2f4f3" font-family="Sora,sans-serif" font-weight="700"><text x="40" y="-60" font-size="28">Z</text><text x="40" y="-60" font-size="21">z</text><text x="40" y="-60" font-size="15">z</text></g><g class="cb-pn" fill="none" stroke-width="4" stroke-linecap="round"><path class="n1" stroke="#3fb68b" d="M-70 -40 V-62 L-52 -66 V-44 M-70 -40 a5 5 0 1 1 -3 -3 M-52 -44 a5 5 0 1 1 -3 -3"/><path class="n2" stroke="#f8cf6a" d="M62 -50 V-72 Q70 -68 74 -62 M62 -50 a5 5 0 1 1 -3 -3"/></g>
</g></g>
<g class="cb-spark"><g transform="translate(-72 -64)"><path d="M0 -9 L2.25 -2.25 L9 0 L2.25 2.25 L0 9 L-2.25 2.25 L-9 0 L-2.25 -2.25Z"/></g><g transform="translate(74 -56)"><path d="M0 -9 L2.25 -2.25 L9 0 L2.25 2.25 L0 9 L-2.25 2.25 L-9 0 L-2.25 -2.25Z"/></g><g transform="translate(46 -96)"><path d="M0 -7 L1.75 -1.75 L7 0 L1.75 1.75 L0 7 L-1.75 1.75 L-7 0 L-1.75 -1.75Z"/></g></g>
</svg>`;   // versión plana: respaldo si el navegador no soporta 3D
  const PARTS = {"face": "<svg viewBox=\"0 0 84 84\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"8\" y=\"16\" width=\"68\" height=\"50\" rx=\"15\" fill=\"#0f1412\"/><g class=\"cb-look\"><ellipse cx=\"18\" cy=\"54\" rx=\"4.5\" ry=\"2.8\" fill=\"#e0663a\" opacity=\".85\"/><ellipse cx=\"66\" cy=\"54\" rx=\"4.5\" ry=\"2.8\" fill=\"#e0663a\" opacity=\".85\"/><g class=\"cb-eye\" transform=\"translate(28 38)\"><g class=\"cb-ball\"><circle r=\"8.5\" fill=\"#f8cf6a\"/><circle cx=\"2.6\" cy=\"-3\" r=\"2.8\" fill=\"#fff\" opacity=\".9\"/></g><path d=\"M-7.5 3 Q0 -7.5 7.5 3\" fill=\"none\" stroke=\"#f8cf6a\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path class=\"cb-zz\" d=\"M-7 0 Q0 5 7 0\" fill=\"none\" stroke=\"#f8cf6a\" stroke-width=\"3.4\" stroke-linecap=\"round\"/></g><g class=\"cb-eye\" transform=\"translate(56 38)\"><g class=\"cb-ball\"><circle r=\"8.5\" fill=\"#f8cf6a\"/><circle cx=\"2.6\" cy=\"-3\" r=\"2.8\" fill=\"#fff\" opacity=\".9\"/></g><path d=\"M-7.5 3 Q0 -7.5 7.5 3\" fill=\"none\" stroke=\"#f8cf6a\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path class=\"cb-zz\" d=\"M-7 0 Q0 5 7 0\" fill=\"none\" stroke=\"#f8cf6a\" stroke-width=\"3.4\" stroke-linecap=\"round\"/></g><path class=\"cb-smile\" d=\"M35 52 Q42 59 49 52\" fill=\"none\" stroke=\"#f8cf6a\" stroke-width=\"3.2\" stroke-linecap=\"round\"/><path class=\"cb-mouth\" d=\"M34 50.5 Q42 64 50 50.5Z\" fill=\"#f8cf6a\" stroke=\"#f8cf6a\" stroke-width=\"2\" stroke-linejoin=\"round\"/></g></svg>", "backFace": "<svg viewBox=\"0 0 84 84\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"20\" y=\"18\" width=\"44\" height=\"6\" rx=\"3\" fill=\"#0f1412\" opacity=\".32\"/><rect x=\"20\" y=\"29\" width=\"44\" height=\"6\" rx=\"3\" fill=\"#0f1412\" opacity=\".32\"/><rect x=\"20\" y=\"40\" width=\"44\" height=\"6\" rx=\"3\" fill=\"#0f1412\" opacity=\".32\"/><path d=\"M42 52 L51 57 L51 67 L42 72 L33 67 L33 57Z\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".55\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/></svg>", "side": "<svg viewBox=\"0 0 84 84\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"42\" cy=\"36\" r=\"5.5\" fill=\"#0f1412\" opacity=\".28\"/><rect x=\"16\" y=\"62\" width=\"52\" height=\"4\" rx=\"2\" fill=\"#0f1412\" opacity=\".16\"/></svg>", "top": "<svg viewBox=\"0 0 84 84\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"42\" cy=\"42\" r=\"9\" fill=\"#d98f32\"/><path d=\"M14 14 L34 14\" stroke=\"#fff\" stroke-opacity=\".5\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>", "ant": "<svg viewBox=\"0 0 16 52\" aria-hidden=\"true\" focusable=\"false\"><line x1=\"8\" y1=\"51\" x2=\"8\" y2=\"10\" stroke=\"#98a39e\" stroke-width=\"3.5\" stroke-linecap=\"round\"/><circle class=\"cb-led\" cx=\"8\" cy=\"7\" r=\"6.5\" fill=\"#3fb68b\"/></svg>", "arm": "<svg viewBox=\"0 0 14 38\" aria-hidden=\"true\" focusable=\"false\"><line x1=\"7\" y1=\"3\" x2=\"7\" y2=\"27\" stroke=\"#2b3531\" stroke-width=\"7\" stroke-linecap=\"round\"/><circle cx=\"7\" cy=\"31\" r=\"6.5\" fill=\"#f8cf6a\"/></svg>", "leg": "<svg viewBox=\"0 0 22 48\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"7\" y=\"0\" width=\"8\" height=\"40\" rx=\"4\" fill=\"#2b3531\"/><rect x=\"1\" y=\"38\" width=\"20\" height=\"10\" rx=\"5\" fill=\"#3a4541\"/></svg>", "back": "<svg class=\"c3-props c3-props-b\" viewBox=\"-92 -104 184 196\" aria-hidden=\"true\" focusable=\"false\"><g class=\"cb-pplant\"><path d=\"M98 70 L120 70 L116 86 L102 86Z\" fill=\"#e0663a\"/><rect x=\"95\" y=\"65\" width=\"28\" height=\"7\" rx=\"2.5\" fill=\"#c9562f\"/><g class=\"cb-leaves\"><path d=\"M109 66 V46\" stroke=\"#3fb68b\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M109 56 Q96 50 97 40 Q108 45 109 56Z M109 50 Q121 40 124 46 Q118 55 109 50Z M109 46 Q104 36 110 30 Q114 38 109 46Z\" fill=\"#3fb68b\"/></g></g></svg>", "front": "<svg class=\"c3-props c3-props-f\" viewBox=\"-92 -104 184 196\" aria-hidden=\"true\" focusable=\"false\"><defs><clipPath id=\"cubiScr3d\"><rect x=\"2.5\" y=\"2.5\" width=\"37\" height=\"25\" rx=\"2\"/></clipPath></defs><g class=\"cb-lap\"><path d=\"M-112 66 L-86 81 L-44 56.75 L-44 61 L-86 85.5 L-112 70.5Z\" fill=\"#1c2421\"/><path d=\"M-112 66 L-70 41.75 L-44 56.75 L-86 81Z\" fill=\"#3a4541\" stroke=\"#98a39e\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><circle class=\"cb-key\" cx=\"-96\" cy=\"66\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-88\" cy=\"61.5\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-80\" cy=\"57\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-72\" cy=\"52.5\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-86\" cy=\"70.5\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-78\" cy=\"66\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-70\" cy=\"61.5\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-62\" cy=\"57\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-68\" cy=\"70.5\" r=\"2.4\"/><circle class=\"cb-key\" cx=\"-60\" cy=\"66\" r=\"2.4\"/><g transform=\"matrix(1 -.5774 0 1 -112 36)\"><rect width=\"42\" height=\"30\" rx=\"3\" fill=\"#26302c\" stroke=\"#98a39e\" stroke-width=\"2\"/><rect x=\"2.5\" y=\"2.5\" width=\"37\" height=\"25\" rx=\"2\" fill=\"#12201b\"/><g clip-path=\"url(#cubiScr3d)\"><g class=\"cb-lines\"><rect x=\"4\" y=\"4\" width=\"20\" height=\"2.6\" rx=\"1.3\" fill=\"#f0a23b\"/><rect x=\"4\" y=\"9\" width=\"28\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"8\" y=\"14\" width=\"18\" height=\"2.6\" rx=\"1.3\" fill=\"#8fd0a8\"/><rect x=\"8\" y=\"19\" width=\"24\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"4\" y=\"24\" width=\"14\" height=\"2.6\" rx=\"1.3\" fill=\"#f5c98a\"/><rect x=\"4\" y=\"29\" width=\"20\" height=\"2.6\" rx=\"1.3\" fill=\"#f0a23b\"/><rect x=\"4\" y=\"34\" width=\"28\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"8\" y=\"39\" width=\"18\" height=\"2.6\" rx=\"1.3\" fill=\"#8fd0a8\"/><rect x=\"8\" y=\"44\" width=\"24\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"4\" y=\"49\" width=\"14\" height=\"2.6\" rx=\"1.3\" fill=\"#f5c98a\"/><rect x=\"4\" y=\"54\" width=\"20\" height=\"2.6\" rx=\"1.3\" fill=\"#f0a23b\"/><rect x=\"4\" y=\"59\" width=\"28\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"8\" y=\"64\" width=\"18\" height=\"2.6\" rx=\"1.3\" fill=\"#8fd0a8\"/><rect x=\"8\" y=\"69\" width=\"24\" height=\"2.6\" rx=\"1.3\" fill=\"#6f7b76\"/><rect x=\"4\" y=\"74\" width=\"14\" height=\"2.6\" rx=\"1.3\" fill=\"#f5c98a\"/></g></g></g><g class=\"cb-taps\" stroke=\"#f8cf6a\" stroke-width=\"2.6\" stroke-linecap=\"round\"><path d=\"M-74 36 l-4 -6 M-64 33 l0 -7 M-54 36 l4 -6\"/></g></g><g class=\"cb-pcan\"><rect x=\"80\" y=\"2\" width=\"18\" height=\"16\" rx=\"3\" fill=\"#98a39e\"/><path d=\"M96 8 L110 1\" stroke=\"#98a39e\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M83 2 Q89 -7 95 2\" fill=\"none\" stroke=\"#6f7b76\" stroke-width=\"2.6\"/></g><g class=\"cb-drops\" fill=\"#8fd0e8\"><circle cx=\"111\" cy=\"10\" r=\"2.2\"/><circle cx=\"107\" cy=\"20\" r=\"2.2\"/><circle cx=\"112\" cy=\"30\" r=\"2.2\"/></g><g class=\"cb-pdoc\"><rect x=\"-106\" y=\"-6\" width=\"32\" height=\"40\" rx=\"3\" fill=\"#f2f4f3\"/><path d=\"M-101 2 H-80 M-101 9 H-84 M-101 16 H-80 M-101 23 H-88\" stroke=\"#98a39e\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><rect x=\"-101\" y=\"26\" width=\"10\" height=\"4\" rx=\"1\" fill=\"#e0663a\"/></g><g class=\"cb-pmag\"><circle cx=\"-86\" cy=\"8\" r=\"10\" fill=\"#8fd0e8\" fill-opacity=\".25\" stroke=\"#f8cf6a\" stroke-width=\"3.6\"/><path d=\"M-78.5 15.5 L-69 25\" stroke=\"#f8cf6a\" stroke-width=\"5\" stroke-linecap=\"round\"/></g><g class=\"cb-pbox\"><path d=\"M-32 -96 L28 -96 L28 -60 L-32 -60Z\" fill=\"#c98a4b\"/><path d=\"M-32 -96 L-20 -108 L40 -108 L28 -96Z\" fill=\"#e0a868\"/><path d=\"M28 -96 L40 -108 L40 -72 L28 -60Z\" fill=\"#a8703a\"/><path d=\"M-2 -96 V-60 M10 -108 L-2 -96\" stroke=\"#f8cf6a\" stroke-width=\"3\" opacity=\".75\"/></g><text class=\"cb-pb\" x=\"62\" y=\"-30\" font-family=\"JetBrains Mono,monospace\" font-weight=\"700\" font-size=\"30\" fill=\"#8fd0a8\">{ }</text><g transform=\"matrix(.17 0 0 .17 -78 72)\"><g class=\"cb-pcube\"><path fill=\"#f8cf6a\" d=\"M0 -3.57 L-58.77 -37.5 L0 -71.43 L58.77 -37.5Z\"/><path fill=\"#f0a23b\" d=\"M-3.09 1.79 L-3.09 69.64 L-61.86 35.71 L-61.86 -32.14Z\"/><path fill=\"#e0663a\" d=\"M3.09 1.79 L61.86 -32.14 L61.86 35.71 L3.09 69.64Z\"/></g></g><g class=\"cb-pz\" fill=\"#f2f4f3\" font-family=\"Sora,sans-serif\" font-weight=\"700\"><text x=\"40\" y=\"-60\" font-size=\"28\">Z</text><text x=\"40\" y=\"-60\" font-size=\"21\">z</text><text x=\"40\" y=\"-60\" font-size=\"15\">z</text></g><g class=\"cb-pn\" fill=\"none\" stroke-width=\"4\" stroke-linecap=\"round\"><path class=\"n1\" stroke=\"#3fb68b\" d=\"M-70 -40 V-62 L-52 -66 V-44 M-70 -40 a5 5 0 1 1 -3 -3 M-52 -44 a5 5 0 1 1 -3 -3\"/><path class=\"n2\" stroke=\"#f8cf6a\" d=\"M62 -50 V-72 Q70 -68 74 -62 M62 -50 a5 5 0 1 1 -3 -3\"/></g><g class=\"cb-spark\"><g transform=\"translate(-72 -64)\"><path d=\"M0 -9 L2.25 -2.25 L9 0 L2.25 2.25 L0 9 L-2.25 2.25 L-9 0 L-2.25 -2.25Z\"/></g><g transform=\"translate(74 -56)\"><path d=\"M0 -9 L2.25 -2.25 L9 0 L2.25 2.25 L0 9 L-2.25 2.25 L-9 0 L-2.25 -2.25Z\"/></g><g transform=\"translate(46 -96)\"><path d=\"M0 -7 L1.75 -1.75 L7 0 L1.75 1.75 L0 7 L-1.75 1.75 L-7 0 L-1.75 -1.75Z\"/></g></g></svg>"};

  // ---------- Cubi 3D: cubo real de 6 caras (CSS 3D) con luz calculada en cada cuadro ----------
  // host: el contenedor (su alto define la escala: 196 unidades = alto). Las acciones se leen de las
  // clases is-* del host y la mirada de sus variables --lx/--ly. Devuelve { start, stop, render }.
  function cubi3d(host, parts) {
    const D = Math.PI / 180;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    host.insertAdjacentHTML('beforeend', `<div class="c3">
<div class="c3-shadow"></div>${parts.back}
<div class="c3-stage"><div class="c3-move"><div class="c3-cam"><div class="c3-body">
<div class="c3-f c3-front">${parts.face}</div><div class="c3-f c3-back">${parts.backFace}</div>
<div class="c3-f c3-right">${parts.side}</div><div class="c3-f c3-left">${parts.side}</div>
<div class="c3-f c3-top">${parts.top}</div><div class="c3-f c3-bottom"></div>
<div class="c3-part c3-ant"><div class="c3-pl c3-pa">${parts.ant}</div><div class="c3-pl c3-pa c3-x">${parts.ant}</div></div>
<div class="c3-part c3-arm-l"><div class="c3-pl c3-pr">${parts.arm}</div><div class="c3-pl c3-pr c3-x">${parts.arm}</div></div>
<div class="c3-part c3-arm-r"><div class="c3-pl c3-pr">${parts.arm}</div><div class="c3-pl c3-pr c3-x">${parts.arm}</div></div>
<div class="c3-part c3-leg-l"><div class="c3-pl c3-pg">${parts.leg}</div><div class="c3-pl c3-pg c3-x">${parts.leg}</div></div>
<div class="c3-part c3-leg-r"><div class="c3-pl c3-pg">${parts.leg}</div><div class="c3-pl c3-pg c3-x">${parts.leg}</div></div>
</div></div></div></div>${parts.front}</div>`);
    const root = host.querySelector('.c3');
    const $ = (s) => root.querySelector(s);
    const el = { shadow: $('.c3-shadow'), move: $('.c3-move'), cam: $('.c3-cam'), body: $('.c3-body'), ant: $('.c3-ant'),
      aL: $('.c3-arm-l'), aR: $('.c3-arm-r'), lL: $('.c3-leg-l'), lR: $('.c3-leg-r') };
    const CAM = -20, BASE_YAW = -28;
    // Luz fija (arriba-izquierda-frente). Iluminación "envolvente" para que las caras a contraluz también varíen.
    const L = (() => { const v = [-0.45, -0.8, 0.4], n = Math.hypot(...v); return v.map((x) => x / n); })();
    const rx = (v, a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
    const ry = (v, a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
    const rz = (v, a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; };
    const world = (n, yaw, pitch, roll) => rx(ry(rx(rz(n, roll), pitch), yaw), CAM);
    const lum = (n, yaw, pitch, roll) => { const w = world(n, yaw, pitch, roll); return Math.max(0, (w[0] * L[0] + w[1] * L[1] + w[2] * L[2] + 0.6) / 1.6); };
    const FACES = [['.c3-front', [0, 0, 1]], ['.c3-back', [0, 0, -1]], ['.c3-right', [1, 0, 0]], ['.c3-left', [-1, 0, 0]], ['.c3-top', [0, -1, 0]], ['.c3-bottom', [0, 1, 0]]]
      .map(([s, n]) => ({ el: $(s), n, last: '' }));
    // Rampa de color de marca anclada a la pose de reposo: arriba = #f8cf6a, frente = #f0a23b, lado = #e0663a
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const bT = lum([0, -1, 0], BASE_YAW, 0, 0), bF = lum([0, 0, 1], BASE_YAW, 0, 0), bR = lum([1, 0, 0], BASE_YAW, 0, 0);
    const RAMP = [[0, '#6e2a1b'], [bR * 0.5, '#8f3a24'], [bR * 0.82, '#b8452a'], [bR, '#e0663a'], [bF, '#f0a23b'], [bT, '#f8cf6a'], [1.02, '#fde7ab']]
      .map(([b, c]) => [b, hex(c)]);
    const color = (b) => {
      for (let i = 1; i < RAMP.length; i++) {
        if (b <= RAMP[i][0] || i === RAMP.length - 1) {
          const [b0, c0] = RAMP[i - 1], [b1, c1] = RAMP[i];
          const k = Math.min(1, Math.max(0, (b - b0) / ((b1 - b0) || 1)));
          return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',')})`;
        }
      }
      return 'rgb(248,207,106)';
    };
    // Momento en que empezó cada acción (para animarla por tiempo)
    const start = {};
    new MutationObserver((recs) => {
      const now = performance.now();
      recs.forEach((r, i) => {
        const before = new Set((r.oldValue || '').split(/\s+/));
        const after = new Set(((i + 1 < recs.length ? recs[i + 1].oldValue : host.className) || '').split(/\s+/));
        after.forEach((c) => { if (!before.has(c)) start[c] = now; });
      });
      if (!running) render(now);
    }).observe(host, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });

    let u = 1, running = false, raf = 0, last = 0;
    const fit = () => {
      const h = host.offsetHeight || 80;
      u = h / 196;
      host.style.setProperty('--u', u.toFixed(4) + 'px');
      el.move.style.transformOrigin = `0 ${(86 * u).toFixed(2)}px`;
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(() => { fit(); if (!running) render(performance.now()); }).observe(host);

    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const kf = (p, pts) => {
      if (p <= pts[0][0]) return pts[0][1];
      for (let i = 1; i < pts.length; i++) {
        if (p <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + (v1 - v0) * ease((p - t0) / ((t1 - t0) || 1)); }
      }
      return pts[pts.length - 1][1];
    };
    // Resortes por canal (posición/rotación/escala): rigidez y amortiguación distintas por parte.
    // Cuerpo casi crítico; brazos y antena subamortiguados -> se atrasan y rebotan al frenar (follow-through).
    const SPR = { yaw: [130, 0.82], pitch: [130, 0.8], roll: [110, 0.55], legS: [170, 0.9], aLz: [95, 0.5], aLx: [95, 0.5],
      aRz: [95, 0.5], aRx: [95, 0.5], ant: [55, 0.22], lLx: [150, 0.6], lRx: [150, 0.6], lLy: [180, 0.7], lRy: [180, 0.7] };
    const S = {}, V = {};
    const REST = { yaw: BASE_YAW, pitch: 0, roll: 0, legS: 1, aLz: 18, aLx: 0, aRz: -18, aRx: 0, ant: 0, lLx: 0, lRx: 0, lLy: 0, lRy: 0 };
    for (const k in SPR) { S[k] = REST[k]; V[k] = 0; }
    const springs = (G, dt) => {
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const k in SPR) {
          const [K, z] = SPR[k];
          V[k] += (K * (G[k] - S[k]) - 2 * z * Math.sqrt(K) * V[k]) * h;
          S[k] += V[k] * h;
        }
      }
    };
    let hostX = null, velX = 0;
    const W2 = (t, per) => Math.sin((2 * Math.PI * t) / per);

    function render(now) {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      const has = (c) => host.classList.contains(c);
      const T = (c) => Math.max(0, (now - (start[c] || now)) / 1000);
      const P = (c, dur) => Math.min(1, T(c) / dur);
      const lx = parseFloat(host.style.getPropertyValue('--lx')) || 0;
      const ly = parseFloat(host.style.getPropertyValue('--ly')) || 0;
      const t = now / 1000;
      // objetivo (se suaviza) + aditivo (inmediato)
      const G = { yaw: BASE_YAW + lx * 24, pitch: -ly * 12, roll: 0, legS: 1, aLz: 18, aLx: 0, aRz: -18, aRx: 0, ant: W2(t, 5) * 4 };
      const A = { yaw: 0, pitch: 0, roll: 0, y: 0, sx: 1, sy: 1 + W2(t, 3.4) * 0.016, aLz: 0, aLx: 0, aRz: 0, aRx: 0, lLx: 0, lRx: 0, lLy: 0, lRy: 0, ant: 0 };
      if (has('is-walk')) {
        const w = T('is-walk'), s = W2(w, 0.68);
        G.yaw = (lx < -0.05 ? -1 : lx > 0.05 ? 1 : -1) * 68; G.pitch = 0;
        A.y = -Math.abs(Math.sin((Math.PI * w) / 0.34)) * 5;
        A.lLy = -Math.max(0, s) * 9; A.lRy = -Math.max(0, -s) * 9; A.lLx = s * 26; A.lRx = -s * 26;
        A.aLx = -s * 32; A.aRx = s * 32; A.roll += s * 3.5; A.ant += -s * 6;
      }
      if (has('is-air')) { G.aLz = 75; G.aRz = -75; G.legS = 0.78; A.sy *= 1.05; }
      if (has('is-crouch')) { A.sy *= kf(P('is-crouch', 0.15), [[0, 1], [1, 0.86]]); G.aLz = 34; G.aRz = -34; }
      if (has('is-table')) A.yaw += 360 * ease(P('is-table', 4.2));
      if (has('is-turn')) A.yaw += 360 * ease(P('is-turn', 1));
      if (has('is-wave')) { const w = T('is-wave'); G.yaw = -14; G.aRz = -138; A.aRz = W2(w, 0.5) * 22; A.roll = W2(w, 1.2) * 4; }
      if (has('is-spin')) { const p = P('is-spin', 2); A.ant = kf(p, [[0, 0], [0.12, -28], [0.26, 24], [0.4, -20], [0.54, 16], [0.68, -10], [0.82, 6], [1, 0]]); G.pitch = 8; }
      const sitting = has('is-typing') || has('is-sitdown') || has('is-nap');
      if (sitting) { G.legS = 0.4; G.aLz = 10; G.aRz = -10; }
      if (has('is-typing')) { const w = T('is-typing'); G.yaw = -64; G.pitch = -10; G.aLx = 58; G.aRx = 58; A.aLx = W2(w, 0.3) * 11; A.aRx = -W2(w, 0.3) * 11; }
      if (has('is-nap')) { G.yaw = BASE_YAW; G.pitch = -11; G.ant = 30; A.sy = 1 + W2(t, 2.4) * 0.04; }
      if (has('is-dance')) { const w = T('is-dance'), s = W2(w, 1); A.yaw += s * 35; A.roll = s * 9; A.y = -Math.abs(Math.sin(Math.PI * w)) * 9; G.aLz = 65; G.aRz = -65; A.aLz = s * 50; A.aRz = s * 50; }
      if (has('is-point')) { G.yaw = -50; G.pitch = -8; G.aLz = 78; G.aLx = 22; A.aLz = W2(T('is-point'), 1) * 6; }
      if (has('is-pointdown')) { G.yaw = -16; G.pitch = -12; G.aRz = -22; G.aRx = 52; A.aRx = W2(T('is-pointdown'), 0.9) * 8; }
      if (has('is-oops')) A.roll += kf(P('is-oops', 1.1), [[0, 0], [0.2, 16], [0.45, -10], [0.7, 5], [1, 0]]);
      if (has('is-carry')) { G.aLz = 152; G.aRz = -152; }
      if (has('is-juggle')) { G.yaw = -10; G.aRz = -40; A.aRz = kf((T('is-juggle') % 0.9) / 0.9, [[0, 0], [0.12, -40], [0.45, 10], [1, 0]]); }
      if (has('is-kick')) { G.yaw = -40; A.lLx = kf(P('is-kick', 2.4), [[0, 0], [0.14, -10], [0.22, 58], [0.34, 0], [1, 0]]); }
      if (has('is-water')) { G.yaw = 36; G.aRz = -30; G.aRx = 40; A.aRz = kf(P('is-water', 3.3), [[0, 0], [0.2, -14], [0.82, -14], [1, 0]]); }
      if (has('is-read')) { G.yaw = -40; G.pitch = -6; G.aLx = 52; G.aLz = 24; }
      if (has('is-drag')) { const w = T('is-drag'); G.aLz = 118; G.aRz = -118; A.lLx = W2(w, 0.9) * 24; A.lRx = -W2(w, 0.9) * 24; G.pitch = 6; }
      if (has('is-hop')) {
        const p = P('is-hop', 1.1);
        A.y += kf(p, [[0, 0], [0.28, 0], [0.36, -6], [0.58, -40], [0.8, 0], [1, 0]]);
        A.sy *= kf(p, [[0, 1], [0.28, 0.84], [0.36, 1.08], [0.58, 1.04], [0.8, 0.88], [0.9, 1.03], [1, 1]]);
        if (p > 0.3 && p < 0.8) { G.aLz = 70; G.aRz = -70; }
      }
      if (has('is-jump')) {
        const p = P('is-jump', 1.5);
        A.y += kf(p, [[0, 0], [0.18, 0], [0.26, -8], [0.52, -64], [0.8, 0], [1, 0]]);
        A.sy *= kf(p, [[0, 1], [0.18, 0.85], [0.26, 1.06], [0.52, 1], [0.8, 0.88], [0.9, 1.03], [1, 1]]);
        A.pitch += kf(p, [[0, 0], [0.26, 0], [0.74, -360], [1, -360]]);
        if (p > 0.2 && p < 0.8) { G.aLz = 95; G.aRz = -95; G.legS = 0.75; }
      }
      if (has('is-land')) { const p = P('is-land', 0.42); A.sy *= kf(p, [[0, 0.8], [0.45, 1.06], [0.75, 0.98], [1, 1]]); A.y += kf(p, [[0, 0], [0.3, 0], [0.55, -5], [0.85, 0], [1, 0]]); }
      A.sx = 1 + (1 - A.sy) * 0.8;
      // Movimiento secundario: al desplazarse, antena y brazos se inclinan hacia atrás por inercia y rebotan al frenar
      const hx = host.getBoundingClientRect().left;
      if (hostX !== null && dt > 0) velX += ((hx - hostX) / dt - velX) * Math.min(1, dt * 10);
      hostX = hx;
      const lean = still ? 0 : Math.max(-1, Math.min(1, velX / 160));
      // micro-miradas al azar (timing variable) cuando no hace nada
      const quiet = !/is-(walk|air|typing|wave|dance|point|pointdown|water|read|juggle|kick|nap|drag|jump|hop|turn|table)/.test(host.className);
      const glance = quiet ? Math.sin(t * 0.37 + 1.3) * Math.sin(t * 0.83) * 5 : 0;
      // objetivo = pose de la acción + oscilaciones (todo pasa por los resortes: sin saltos al cambiar de acción)
      const G2 = { yaw: G.yaw + glance, pitch: G.pitch, roll: G.roll + A.roll - lean * 5, legS: G.legS, aLz: G.aLz + A.aLz - lean * 22, aLx: G.aLx + A.aLx,
        aRz: G.aRz + A.aRz - lean * 22, aRx: G.aRx + A.aRx, ant: G.ant + A.ant - lean * 30, lLx: A.lLx, lRx: A.lRx, lLy: A.lLy, lRy: A.lRy };
      if (still) { for (const k2 in SPR) { S[k2] = G2[k2]; V[k2] = 0; } } else springs(G2, dt);
      // data-yaw / data-pitch: desfase manual (para revisar ángulos; normalmente vacío)
      const yaw = S.yaw + A.yaw + (+host.dataset.yaw || 0), pitch = S.pitch + A.pitch + (+host.dataset.pitch || 0), roll = S.roll;
      const sit = 44 * (1 - S.legS);
      const boost = Math.max(1, 0.4 / u);            // Cubi pequeño (celular): saltos proporcionalmente más altos
      el.move.style.transform = `translate3d(0,${((A.y * boost + sit) * u).toFixed(2)}px,0) scale(${A.sx.toFixed(3)},${A.sy.toFixed(3)})`;
      el.cam.style.transform = `rotateX(${CAM}deg)`;
      el.body.style.transform = `rotateY(${yaw.toFixed(2)}deg) rotateX(${pitch.toFixed(2)}deg) rotateZ(${roll.toFixed(2)}deg)`;
      el.ant.style.transform = `translate3d(0,${(-42 * u).toFixed(2)}px,0) rotateZ(${S.ant.toFixed(2)}deg)`;
      el.aL.style.transform = `translate3d(${(-47 * u).toFixed(2)}px,${(-6 * u).toFixed(2)}px,0) rotateZ(${S.aLz.toFixed(2)}deg) rotateX(${S.aLx.toFixed(2)}deg)`;
      el.aR.style.transform = `translate3d(${(47 * u).toFixed(2)}px,${(-6 * u).toFixed(2)}px,0) rotateZ(${S.aRz.toFixed(2)}deg) rotateX(${S.aRx.toFixed(2)}deg)`;
      el.lL.style.transform = `translate3d(${(-22 * u).toFixed(2)}px,${((38 + S.lLy) * u).toFixed(2)}px,0) rotateX(${S.lLx.toFixed(2)}deg) scaleY(${S.legS.toFixed(3)})`;
      el.lR.style.transform = `translate3d(${(22 * u).toFixed(2)}px,${((38 + S.lRy) * u).toFixed(2)}px,0) rotateX(${S.lRx.toFixed(2)}deg) scaleY(${S.legS.toFixed(3)})`;
      const lift = Math.min(0.65, Math.max(0, -A.y * boost / 90));
      el.shadow.style.transform = `translate(-50%,-50%) scale(${(1 - lift).toFixed(3)})`;
      el.shadow.style.opacity = (0.38 * (1 - lift)).toFixed(3);
      for (const f of FACES) {
        const c = color(lum(f.n, yaw, pitch, roll));
        if (c !== f.last) { f.el.style.backgroundColor = c; f.last = c; }
      }
    }
    const loop = (now) => { render(now); raf = running ? requestAnimationFrame(loop) : 0; };
    render(performance.now());
    return {
      root,
      start() { if (still) { render(performance.now()); return; } if (!running) { running = true; last = 0; raf = requestAnimationFrame(loop); } },
      stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
      render,
    };
  }


  const style = document.createElement('style');
  style.id = 'cubi-css';
  style.textContent = CSS;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'cubi-layer';
  layer.setAttribute('aria-hidden', 'true');
  const away = document.createElement('div');
  away.className = 'cubi-away';
  away.setAttribute('aria-hidden', 'true');
  const cubi = document.createElement('div');
  cubi.className = 'cubi';
  // Cubo 3D real; si el navegador no soporta 3D (o con ?cubi=2d) se usa la versión plana
  let rig = null;
  const want3d = !/[?&]cubi=2d\b/.test(location.search) && !!(window.CSS && window.CSS.supports && window.CSS.supports('transform-style', 'preserve-3d'))   // ojo: aquí CSS es la hoja de estilos;
  if (want3d) {
    try { rig = cubi3d(cubi, PARTS); }
    catch (e) { console.error('[cubi] falló el cubo 3D; se usa la versión plana', e); cubi.innerHTML = SVG; rig = null; }
  } else cubi.innerHTML = SVG;
  const svg = cubi.firstElementChild;
  const say = document.createElement('div');
  say.className = 'cubi-say';
  layer.append(cubi, say);
  code.appendChild(layer);
  // Casa en pantallas angostas: de pie sobre la barra de título del editor (fuera del panel recortado)
  const bar = document.createElement('div');
  bar.className = 'cubi-bar';
  bar.setAttribute('aria-hidden', 'true');
  bar.hidden = true;
  visual.appendChild(bar);
  let homeMode = 'pane';
  const homeLayer = () => (homeMode === 'bar' ? bar : layer);
  document.body.appendChild(away);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ACTION_CLASSES = ['is-hop', 'is-jump', 'is-wave', 'is-walk', 'is-spin', 'is-party', 'is-happy', 'is-typing', 'is-water', 'is-read',
    'is-carry', 'is-juggle', 'is-kick', 'is-nap', 'is-dance', 'is-point', 'is-pointdown', 'is-oops', 'is-turn', 'is-air', 'is-land', 'is-sitdown', 'is-blink',
    'is-table', 'is-crouch'];

  let where = 'home';           // 'home' (dentro del editor) o 'away' (en otra parte de la página)
  let pos = { x: 0, y: 0 };     // esquina superior izquierda de Cubi en coordenadas de su contenedor
  let homeA = null, awayA = null, textEdge = 0, room = false, mw = 0, mh = 0, placed = false;
  let active = false, dragging = false, typingDemo = false, lookBusy = false, following = false;
  let gen = 0, moveAnim = null, lastPhrase = '', phraseN = 0;

  // ---------- posición y medidas ----------
  const tf = (x, y) => `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
  const setPos = (x, y) => { pos = { x, y }; cubi.style.transform = tf(x, y); };
  const readPos = () => {
    try { const m = new DOMMatrixReadOnly(getComputedStyle(cubi).transform); return { x: m.m41, y: m.m42 }; }
    catch (e) { console.warn('[cubi] no se pudo leer la posición actual; se usa la última conocida', e); return { ...pos }; }
  };
  const stopMove = () => {
    if (moveAnim) { const p = readPos(); const a = moveAnim; moveAnim = null; a.cancel(); setPos(p.x, p.y); }
    cubi.classList.remove('is-walk', 'is-air');
  };
  let canvas = null;
  const charWidth = () => {
    const cs = getComputedStyle(code);
    try {
      canvas = canvas || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      return ctx.measureText('0').width || parseFloat(cs.fontSize) * 0.6;
    } catch (e) {
      console.warn('[cubi] no se pudo medir la letra del código; se usa un estimado', e);
      return parseFloat(cs.fontSize) * 0.6;
    }
  };
  // Zona libre de la casa: a la derecha de la línea más larga (reservando el nombre de demo más largo),
  // desde arriba del panel hasta el encabezado SALIDA (el panel recorta todo lo que pase de ahí).
  const fullH = () => clamp(window.innerHeight * 0.09, 64, 88);
  const measureBar = () => {
    homeMode = 'bar';
    layer.hidden = true;
    bar.hidden = false;
    bar.style.left = figure.offsetLeft + 'px';
    bar.style.top = figure.offsetTop + 'px';
    bar.style.width = figure.offsetWidth + 'px';
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    const W = figure.offsetWidth;
    let fileRight = 0;
    if (fileEl) {
      const range = document.createRange();
      range.selectNodeContents(fileEl);
      const fr = figure.getBoundingClientRect(), k = fr.width / (W || 1) || 1;
      for (const r of range.getClientRects()) if (r.width) fileRight = Math.max(fileRight, (r.right - fr.left) / k);
    }
    const y = 11 - mh * 0.97;                      // de pie sobre la barra (lado derecho, sin texto); deja libre el botón de arriba
    let x0 = fileRight + 10, x1 = W - mw - 8;
    if (x1 < x0) x0 = x1 = Math.max(0, W - mw - 4);
    homeA = { x0, x1, y0: y, y1: y, w: W, h: 0, bar: true };
    textEdge = 0;
    room = W > 0;
    if (where !== 'home') return;
    if (cubi.parentElement !== bar) bar.append(cubi, say);
    if (!placed) { placed = true; setPos(x1, y); }
    else if (!moveAnim && !dragging) setPos(clamp(pos.x, x0, x1), y);
  };
  const measureHome = () => {
    if (tiny.matches) { room = false; layer.hidden = true; bar.hidden = true; return; }
    cubi.classList.toggle('is-mini', narrow.matches);
    const was = layer.hidden;
    layer.hidden = false;
    const lr = layer.getBoundingClientRect();
    const w = layer.offsetWidth, h = layer.offsetHeight;
    if (!w || !h) { layer.hidden = was; return; }
    const k = lr.width / w || 1;                       // la portada se escala al bajar la página
    const range = document.createRange();
    range.selectNodeContents(textEl);
    let right = lr.left;
    for (const r of range.getClientRects()) if (r.width) right = Math.max(right, r.right);
    if (demoName) {
      const len = demoName.textContent.length;
      right = Math.max(right, demoName.getBoundingClientRect().right + (Math.max(0, MAX_NAME - len) + 2) * charWidth() * k);
    }
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    textEdge = (right - lr.left) / k + 12;
    homeA = { x0: textEdge + 8 + mw * 0.14, x1: w - mw - 8, y0: 2, y1: Math.max(2, h - mh - 4), w, h };
    // ¿cabe en el panel (a la derecha del código)? si no, a la barra de título
    if (homeA.x1 - homeA.x0 < mw * 0.6 || h < mh + 6) { measureBar(); return; }
    homeMode = 'pane';
    bar.hidden = true;
    room = true;
    layer.hidden = false;
    if (where !== 'home') return;
    if (cubi.parentElement !== layer) { layer.append(cubi, say); placed = false; }
    if (!placed) { placed = true; setPos(homeA.x1 - Math.min(24, (homeA.x1 - homeA.x0) * 0.3), homeA.y1); }
    else if (!moveAnim && !dragging) setPos(clamp(pos.x, homeA.x0, homeA.x1 + mw * 0.6), clamp(pos.y, homeA.y0, homeA.y1));
  };
  const area = () => (where === 'home' ? homeA : awayA);
  const viewW = () => document.documentElement.clientWidth;

  // ---------- gestos ----------
  const look = (lx, ly) => { cubi.style.setProperty('--lx', lx.toFixed(2)); cubi.style.setProperty('--ly', ly.toFixed(2)); };
  const rest = () => { if (!following) look(0, 0); };
  const restart = (...cls) => { cubi.classList.remove(...cls); void cubi.getBoundingClientRect(); cubi.classList.add(...cls); };
  const alive = (t) => t === gen && active && !dragging;
  const abort = () => {
    gen++;
    stopMove();
    cubi.classList.remove(...ACTION_CLASSES);
    lookBusy = false;
    rest();
  };
  const land = () => { if (!still) { restart('is-land'); setTimeout(() => cubi.classList.remove('is-land'), 450); } };

  // Movimiento: caminar (misma altura) o brincar en arco (a otro "piso" o al borde de arriba)
  const go = async (nx, ny, kind, t) => {
    if (!alive(t)) return false;
    stopMove();
    const from = { ...pos };
    const dx = nx - from.x, dy = ny - from.y, dist = Math.hypot(dx, dy);
    if (dist < 2) return true;
    if (still) { setPos(nx, ny); return true; }
    if (!lookBusy) look(dx < -2 ? -1 : dx > 2 ? 1 : 0, dy < -8 ? -0.8 : 0.1);
    // anticipación: antes de caminar se gira hacia donde va; antes de brincar se agacha
    if (kind === 'walk') { cubi.classList.add('is-walk'); await wait(rig ? 200 : 0); }
    else { cubi.classList.add('is-crouch'); await wait(rig ? 150 : 0); cubi.classList.remove('is-crouch'); }
    if (!alive(t)) { cubi.classList.remove('is-walk'); return false; }
    let anim, cls;
    if (kind === 'walk') {
      cls = 'is-walk';
      anim = cubi.animate([{ transform: tf(from.x, from.y) }, { transform: tf(nx, ny) }],
        { duration: clamp(Math.abs(dx) / 42 * 1000, 600, 3400), easing: 'cubic-bezier(.45,0,.4,1)', fill: 'forwards' });
    } else {
      cls = 'is-air';
      const lift = 24 + Math.max(0, -dy) * 0.35 + Math.abs(dx) * 0.06;
      let top = Math.min(from.y, ny) - lift;
      if (where === 'home' && homeA && !homeA.bar) top = Math.max(top, homeA.y0 - mh * 0.12);   // que no se salga por arriba del panel
      else if (where === 'home' && homeA && homeA.bar) top = Math.max(top, headerBottom() + 2 - figure.getBoundingClientRect().top);
      else top = Math.max(top, window.scrollY + headerBottom() + 2);                              // por debajo del menú
      anim = cubi.animate([
        { transform: tf(from.x, from.y), easing: 'cubic-bezier(.2,.6,.4,1)' },
        { transform: tf(from.x + dx / 2, top), offset: 0.5, easing: 'cubic-bezier(.6,0,.8,.4)' },
        { transform: tf(nx, ny) }], { duration: clamp(520 + dist * 1.6, 600, 1100), fill: 'forwards' });
    }
    cubi.classList.add(cls);
    moveAnim = anim;
    try { await anim.finished; }
    catch (e) { return false; }   // cancelada a propósito (arrastre, pausa o interrupción): no es un error
    if (moveAnim !== anim) return false;
    moveAnim = null;
    setPos(nx, ny);
    anim.cancel();
    cubi.classList.remove(cls);
    if (kind !== 'walk') land();
    if (!lookBusy) rest();
    return alive(t);
  };
  const act = async (t, cls, ms) => {
    if (!alive(t)) return false;
    const list = Array.isArray(cls) ? cls : [cls];
    restart(...list);
    await wait(ms);
    cubi.classList.remove(...list);
    return alive(t);
  };

  // ---------- burbuja (sigue a Cubi y se queda dentro de la zona libre) ----------
  let sayTimer = 0, sayRaf = 0;
  const placeSay = () => {
    const p = readPos();
    const bw = say.offsetWidth, bh = say.offsetHeight;
    let L, R, T;
    if (where === 'home' && homeA && homeA.bar) {          // en la barra: la burbuja va al lado, dentro de la pantalla
      const fr = figure.getBoundingClientRect(), k = fr.width / (figure.offsetWidth || 1) || 1;
      L = (4 - fr.left) / k; R = (viewW() - 4 - fr.left) / k; T = Infinity;
    } else if (where === 'home' && homeA) { L = textEdge; R = homeA.w - 4; T = 2; }
    else { L = window.scrollX + 6; R = window.scrollX + viewW() - 6; T = window.scrollY + (header ? header.getBoundingClientRect().bottom : 0) + 4; }
    let left, top, tail = true;
    if (p.y - bh - 8 >= T) {
      top = p.y - bh - 8;
      left = clamp(p.x + mw / 2 - bw / 2, L, Math.max(L, R - bw));
    } else {                                                     // sin espacio arriba: al lado
      tail = false;
      top = p.y + mh * 0.12;
      left = p.x - bw - 6 >= L ? p.x - bw - 6 : p.x + mw + 6 + bw <= R ? p.x + mw + 6 : Math.max(L, Math.min(R - bw, p.x - bw - 6));
    }
    say.style.left = left.toFixed(1) + 'px';
    say.style.top = top.toFixed(1) + 'px';
    say.classList.toggle('no-tail', !tail);
    if (tail) say.style.setProperty('--tail', clamp(p.x + mw / 2 - left, 12, bw - 12).toFixed(1) + 'px');
  };
  const follow = () => { placeSay(); sayRaf = say.classList.contains('is-on') ? requestAnimationFrame(follow) : 0; };
  const speak = (text, ms) => {
    if ((where === 'home' && !room) || tiny.matches) return;
    say.textContent = text;
    const maxW = where === 'home' && homeA && homeA.bar ? Math.max(96, Math.min(180, pos.x - 10))
      : where === 'home' && homeA ? Math.max(110, Math.min(200, homeA.w - textEdge - 6)) : (narrow.matches ? 180 : 220);
    say.classList.toggle('is-short', narrow.matches);
    say.style.maxWidth = maxW + 'px';
    say.classList.add('is-on');
    placeSay();
    if (!sayRaf && !still) sayRaf = requestAnimationFrame(follow);
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => { say.classList.remove('is-on'); }, ms || 2500);
  };
  const SHORT = ['¡Hola! Soy Cubi 👋', '¿Automatizamos?', 'Revisando datos…', '¡Listo!', 'Hecho en Saravena 💛'];
  const PHRASES = ['¡Hola! Soy Cubi 👋', '¿Automatizamos algo?', 'Revisando datos…', 'Lo mecánico, a la máquina', '¿Le cuento cómo?', 'Hecho en Saravena 💛'];
  const nextPhrase = () => {
    let p;
    const list = narrow.matches ? SHORT : PHRASES;
    do { p = pick(list); } while (p === lastPhrase && list.length > 1);
    lastPhrase = p;
    return p;
  };
  const hello = () => (phraseN++ === 0 ? '¡Hola! Soy Cubi 👋' : nextPhrase());

  // ---------- acciones ----------
  const bounce = async (t, n) => {
    const A = area();
    for (let i = 0; i < n; i++) {
      const dx = (Math.random() < 0.5 ? -1 : 1) * rnd(6, 14);
      const nx = A ? clamp(pos.x + dx, A.x0, Math.max(A.x0, A.x1)) : pos.x + dx;
      if (!(await go(Math.abs(nx - pos.x) < 3 ? pos.x + (dx > 0 ? 4 : -4) : nx, pos.y, 'hop', t))) return false;
      await wait(rnd(60, 160));
    }
    return true;
  };
  const canJump = () => where !== 'home' || (homeA && homeA.bar) || pos.y >= mh * 0.38;          // hay espacio arriba para saltar sin cortarse
  const fits = (name) => {
    const A = area();
    if (!A) return false;
    if (where === 'home' && A.bar) return ['type', 'wave', 'flip', 'hop', 'nap', 'dance', 'turn', 'antenna', 'table'].includes(name);
    if (name === 'water') return where !== 'home' || pos.x + mw * 1.24 <= A.w - 2;
    if (name === 'flip' || name === 'hop' || name === 'juggle' || name === 'carry') return where !== 'home' || canJump();
    return true;
  };
  const ACTIONS = {
    async type(t) {
      lookBusy = true; look(-1, 0.85);
      speak('Revisando datos…', 2200);
      if (!(await act(t, 'is-typing', 3800))) return;
      lookBusy = false;
      speak('¡Listo!', 1600);
      await act(t, 'is-happy', 900);
    },
    async wave(t) { speak(hello(), 2400); await act(t, 'is-wave', 2400); },
    async flip(t) {
      if (!(await act(t, ['is-jump', 'is-happy', 'is-party'], 1500))) return;
      if (Math.random() < 0.3) { speak('¡Ups!', 1600); await act(t, ['is-oops', 'is-happy'], 1100); }
    },
    async juggle(t) { await act(t, ['is-juggle', 'is-happy'], 2700); },
    async kick(t) { lookBusy = true; look(-1, 0.4); await act(t, 'is-kick', 2400); lookBusy = false; },
    async water(t) { lookBusy = true; look(1, 0.6); await act(t, 'is-water', 3300); lookBusy = false; },
    async read(t) { lookBusy = true; look(-1, 0.3); await act(t, 'is-read', 3300); lookBusy = false; },
    async carry(t) {
      const A = area();
      cubi.classList.add('is-carry');
      await wait(450);
      const to = A.x0 + Math.random() * Math.max(0, A.x1 - A.x0);
      await go(to, pos.y, 'walk', t);
      await wait(500);
      cubi.classList.remove('is-carry');
    },
    async nap(t) {
      cubi.classList.add('is-nap');
      await wait(700);
      if (alive(t)) speak('Zzz…', 2500);
      await wait(3600);
      cubi.classList.remove('is-nap');
      if (alive(t)) await act(t, 'is-hop', 1100);
    },
    async dance(t) { await act(t, ['is-dance', 'is-happy'], 3000); },
    async turn(t) { await act(t, 'is-turn', 1000); },
    async antenna(t) { lookBusy = true; look(0, -1); await act(t, 'is-spin', 2000); lookBusy = false; },
    async hop(t) { if (where === 'home' && homeA && homeA.bar) { await bounce(t, 3); return; } await act(t, 'is-hop', 1100); },
    async table(t) { if (Math.random() < 0.5) speak('Soy un cubo de verdad 😄', 2200); await act(t, 'is-table', 4300); },
  };
  const BAG = ['type', 'type', 'wave', 'flip', 'juggle', 'kick', 'water', 'read', 'carry', 'nap', 'dance', 'turn', 'antenna', 'hop', 'table', 'table'];
  let lastAct = '';
  const pickAction = () => {
    for (let i = 0; i < 12; i++) {
      const a = pick(BAG);
      if (a !== lastAct && fits(a)) { lastAct = a; return a; }
    }
    lastAct = 'wave';
    return 'wave';
  };

  // Desplazarse: caminar, brincar a otro piso, subir al borde de arriba o asomarse por el borde derecho
  const wander = async (t) => {
    const A = area();
    if (!A) return;
    const randX = () => A.x0 + Math.random() * Math.max(0, A.x1 - A.x0);
    if (where === 'home' && A.bar) {                        // sobre la barra del editor: brinca, camina y rebota
      const span = A.x1 - A.x0, r = Math.random();
      const nx = span < 6 ? pos.x : randX();
      if (r < 0.45 && span >= 6) await go(nx, A.y1, 'hop', t);
      else if (r < 0.7 && span >= 6) await go(nx, A.y1, 'walk', t);
      else await bounce(t, 2);
      return;
    }
    if (where !== 'home') {
      if (A.x1 - A.x0 < 6) return;                          // sin espacio para caminar: se queda
      if (Math.random() < 0.75) await go(randX(), A.y1, 'walk', t);
      else await go(randX(), A.y1, 'hop', t);
      return;
    }
    const levels = [A.y1, A.y1, (A.y0 + A.y1) / 2, A.y0];
    const r = Math.random();
    if (r < 0.12) {                                           // asomarse por el borde derecho
      await go(A.x1 + mw * 0.55, pos.y, 'walk', t);
      if (!alive(t)) return;
      lookBusy = true; look(-1, 0.1);
      if (Math.random() < 0.5) speak('¿Le cuento cómo?', 2000);
      await wait(1700);
      lookBusy = false;
      await go(A.x1 - Math.random() * Math.min(60, A.x1 - A.x0), pos.y, 'walk', t);
    } else if (r < 0.27) {                                    // subir al borde de arriba y sentarse
      await go(randX(), A.y0, 'hop', t);
      if (alive(t)) await act(t, 'is-sitdown', 2200);
    } else if (r < 0.72) {                                    // brincar a otro "piso"
      const others = levels.filter((y) => Math.abs(y - pos.y) > 10);
      const ny = others.length ? pick(others) : pick(levels);
      await go(randX(), ny, 'hop', t);
    } else {
      await go(randX(), pos.y, 'walk', t);
    }
  };

  async function life() {
    if (still || !active || dragging) return;
    const t = ++gen;
    await wait(rnd(500, 1200));
    while (alive(t)) {
      if (Math.random() < 0.8) await wander(t);
      if (!alive(t)) return;
      await ACTIONS[pickAction()](t);
      if (!alive(t)) return;
      rest();
      await wait(rnd(1400, 2600));
    }
  }

  // Al aparecer una demostración nueva: celebra y señala la salida
  async function demoShow() {
    if (!active || where !== 'home' || still) return;
    abort();
    const t = gen;
    speak('Esto lo hice yo 😎', 2000);
    if (!(await act(t, canJump() ? ['is-hop', 'is-happy', 'is-party'] : ['is-wave', 'is-party'], canJump() ? 1200 : 1600))) return;
    lookBusy = true; look(0.2, 1);
    speak('Mira esto 👇', 2000);
    if (!(await act(t, 'is-pointdown', 2000))) return;
    lookBusy = false;
    life();
  }

  // ---------- burbujas automáticas ----------
  (function chatter() {
    setTimeout(() => {
      if (active && !still && !dragging && !touring && !say.classList.contains('is-on') && !typingDemo) speak(nextPhrase(), 2500);
      chatter();
    }, rnd(8000, 12000));
  })();

  // ---------- visibilidad ----------
  const section = figure.closest('section');
  const cover = section && section.nextElementSibling;
  const setActive = (on) => {
    if (on === active) return;
    active = on;
    if (on) {
      cubi.classList.remove('is-paused');
      if (rig) rig.start();
      life();
    } else {
      const wasTour = touring;
      abort();
      if (wasTour) { endTour(); placeHomeNow(false); }   // no se queda varado a mitad del recorrido
      cubi.classList.add('is-paused');
      if (rig) rig.stop();
      say.classList.remove('is-on');
    }
  };
  let queued = false;
  const check = () => {
    queued = false;
    let vis = false;
    if (dragging) vis = true;
    else if (!document.hidden && !tiny.matches) {
      if (where === 'home') {
        const r = figure.getBoundingClientRect();
        const coverTop = cover ? cover.getBoundingClientRect().top : Infinity;
        vis = room && r.bottom > 0 && r.top < window.innerHeight && (homeMode === 'bar' || coverTop > r.top + 60);
      } else {
        const r = cubi.getBoundingClientRect();
        vis = r.bottom > 0 && r.top < window.innerHeight;
      }
    }
    setActive(vis);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };

  // ---------- casa y fuera de casa ----------
  const save = () => {
    try {
      if (where === 'away') sessionStorage.setItem(STORE, JSON.stringify({ x: pos.x, y: pos.y }));
      else sessionStorage.removeItem(STORE);
    } catch (e) { console.warn('[cubi] no se pudo guardar la posición en la sesión', e); }
  };
  const headerBottom = () => (header ? header.getBoundingClientRect().bottom : 0);
  // ¿Taparía algo con lo que se interactúa (enlaces, botones, campos, la barra superior)?
  const blocked = (x, y) => {
    const cx = x - window.scrollX, cy = y - window.scrollY;
    if (cx < 4 || cx + mw > viewW() - 4) return true;
    if (cy < headerBottom() + 4) return true;
    const pts = [[0.15, 0.15], [0.85, 0.15], [0.5, 0.5], [0.15, 0.9], [0.85, 0.9]];
    const prev = cubi.style.pointerEvents;
    cubi.style.pointerEvents = 'none';
    try {
      return pts.some(([fx, fy]) => {
        const px = cx + fx * mw, py = cy + fy * mh;
        if (py < 0 || py > window.innerHeight) return false;
        const el = document.elementFromPoint(px, py);
        return !!(el && el.closest('a,button,input,select,textarea,iframe,label,summary,dialog,[role="tab"],.cookie,.top'));
      });
    } finally { cubi.style.pointerEvents = prev; }
  };
  const nudge = (x, y) => {
    const sx = mw + 14, sy = mh + 14;
    const tries = [[0, 0], [sx, 0], [-sx, 0], [0, sy], [2 * sx, 0], [-2 * sx, 0], [0, -sy], [sx, sy], [-sx, sy], [3 * sx, 0], [-3 * sx, 0], [0, 2 * sy]];
    for (const [ox, oy] of tries) {
      const nx = clamp(x + ox, window.scrollX + 6, window.scrollX + viewW() - mw - 6);
      const ny = Math.max(y + oy, window.scrollY + headerBottom() + 6);
      if (!blocked(nx, ny)) return { x: nx, y: ny };
    }
    return { x: clamp(x, window.scrollX + 6, window.scrollX + viewW() - mw - 6), y: Math.max(y, window.scrollY + headerBottom() + 6) };
  };
  const setAway = (x, y) => {
    where = 'away';
    away.append(cubi, say);
    const W = viewW();
    awayA = { x0: clamp(x - 140, 6, W - mw - 6), x1: clamp(x + 140, 6, W - mw - 6), y0: y, y1: y, w: W };
    setPos(x, y);
  };
  const goHome = async (clientX, clientY) => {
    abort();
    where = 'home';
    layer.append(cubi, say);
    say.classList.remove('is-on');
    measureHome();
    const HL = homeLayer();
    save();
    if (!room) { queue(); return; }
    let x = homeA.x1 - 10, y = homeA.y1;
    if (clientX != null) {
      const lr = HL.getBoundingClientRect(), k = (homeMode === 'bar' ? figure.getBoundingClientRect().width / (figure.offsetWidth || 1) : lr.width / (HL.offsetWidth || 1)) || 1;
      x = clamp((clientX - lr.left) / k, homeA.x0, homeA.x1);
      y = clamp((clientY - lr.top) / k, homeA.y0, homeA.y1);
    }
    setPos(x, Math.max(homeA.y0, y - 18));
    queue();
    await wait(30);
    if (!still) { const t = gen; active = true; await go(x, y, 'hop', t); }
    else setPos(x, y);
    speak('¡De vuelta en casa!', 2000);
    life();
  };

  // Vuelve a casa de inmediato (sin brincos); con fundido si estaba perdido
  function placeHomeNow(fade) {
    abort();
    where = 'home';
    layer.append(cubi, say);
    say.classList.remove('is-on');
    cubi.classList.remove('is-drag');
    if (svg) svg.style.transform = '';
    measureHome();
    if (room && homeA) setPos(homeA.bar ? homeA.x1 : homeA.x1 - 10, homeA.y1);
    if (fade && !still) {
      cubi.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cubi.style.transition = 'opacity .5s ease';
        cubi.style.opacity = '';
        setTimeout(() => { cubi.style.transition = ''; }, 600);
      }));
    }
    save();
    queue();
  }
  // Vigilante: cada 2 s comprueba que Cubi exista, tenga tamaño, esté dentro del documento y no quede tapado
  let covered = 0;
  setInterval(() => {
    if (dragging || tiny.matches || document.hidden) return;
    const r = cubi.getBoundingClientRect();
    const de = document.documentElement;
    let why = '';
    if (!cubi.isConnected) why = 'fuera del documento';
    else if (r.width < 2 || r.height < 2) why = 'sin tamaño';
    else if (where === 'away') {
      const dx = r.left + window.scrollX, dy = r.top + window.scrollY;
      if (dx < -r.width || dx > de.scrollWidth || dy < -r.height || dy > de.scrollHeight) why = 'fuera de la página';
      else if (!touring && r.bottom > 0 && r.top < window.innerHeight && r.left >= 0 && r.right <= window.innerWidth) {
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height * 0.5);
        covered = el && !cubi.contains(el) && !el.closest('.top,.cookie,dialog,.cubi-say') ? covered + 1 : 0;
        if (covered >= 2) why = 'tapado por otra capa';
      }
    } else if (where === 'home' && room && active && homeA) {
      if (homeLayer().hidden) why = 'casa oculta';
      else if (!moveAnim && (pos.x < homeA.x0 - mw || pos.x > homeA.w || (!homeA.bar && (pos.y < -mh || pos.y > homeA.h)))) why = 'fuera de su casa';
    }
    if (!why) return;
    covered = 0;
    console.warn('[cubi] se perdió de vista (' + why + '); vuelve a casa');
    if (touring) endTour();
    placeHomeNow(true);
    if (active) life();
  }, 2000);

  // ---------- arrastrar y soltar ----------
  let lastTap = 0, lastPointer = 'mouse';
  let press = null, grab = null, ptr = null, dragRaf = 0, dragPos = null, oldSelect = '';
  const startDrag = (e) => {
    abort();
    dragging = true;
    const r = cubi.getBoundingClientRect();
    grab = { fx: clamp((e.clientX - r.left) / r.width, 0, 1), fy: clamp((e.clientY - r.top) / r.height, 0, 1) };
    where = 'drag';
    away.append(cubi, say);
    // mover el nodo de contenedor suelta la captura del puntero: se vuelve a tomar (si no, el arrastre se pierde sobre el iframe)
    try { cubi.setPointerCapture(e.pointerId); }
    catch (err) { console.warn('[cubi] no se pudo recapturar el puntero tras moverlo de contenedor', err); }
    cubi.classList.toggle('is-mini', narrow.matches);
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    dragPos = { x: r.left + window.scrollX, y: r.top + window.scrollY };
    setPos(dragPos.x, dragPos.y);
    svg.style.transformOrigin = `${(grab.fx * 100).toFixed(0)}% ${(grab.fy * 100).toFixed(0)}%`;
    cubi.classList.add('is-drag');
    oldSelect = document.documentElement.style.userSelect;
    document.documentElement.style.userSelect = 'none';
    speak(pick(['¡Wiii!', '¡Bájame! 😄']), 1800);
    const step = () => {
      if (!dragging) return;
      const tx = ptr.x + window.scrollX - grab.fx * mw, ty = ptr.y + window.scrollY - grab.fy * mh;
      if (still) { dragPos = { x: tx, y: ty }; }
      else {
        const vx = tx - dragPos.x;
        dragPos = { x: dragPos.x + vx * 0.32, y: dragPos.y + (ty - dragPos.y) * 0.32 };
        svg.style.transform = `rotate(${clamp(-vx * 0.9, -28, 28).toFixed(1)}deg)`;
      }
      setPos(dragPos.x, dragPos.y);
      dragRaf = requestAnimationFrame(step);
    };
    dragRaf = requestAnimationFrame(step);
  };
  const endDrag = async () => {
    dragging = false;
    cancelAnimationFrame(dragRaf);
    document.documentElement.style.userSelect = oldSelect;
    const fx = ptr.x + window.scrollX - grab.fx * mw, fy = ptr.y + window.scrollY - grab.fy * mh;
    setPos(fx, fy);
    svg.style.transform = '';
    cubi.classList.remove('is-drag');
    // ¿Lo soltaron sobre el editor? Vuelve a casa en ese punto
    const pr = code.getBoundingClientRect();
    const cx = fx - window.scrollX + mw / 2, cy = fy - window.scrollY + mh / 2;
    const home = homeMode === 'bar' ? figure.getBoundingClientRect() : pr;   // soltarlo sobre su casa lo devuelve
    if (cx > home.left && cx < home.right && cy > home.top - (homeMode === 'bar' ? mh : 0) && cy < (homeMode === 'bar' ? home.top + 60 : home.bottom) && !tiny.matches) {
      goHome(fx - window.scrollX, fy - window.scrollY);
      return;
    }
    const spot = nudge(fx, fy + 14);          // cae un poquito (gravedad) y se aparta de botones y enlaces
    setAway(fx, fy);
    save();
    active = true;
    const t = ++gen;
    if (!still) await go(spot.x, spot.y, 'hop', t);
    else setPos(spot.x, spot.y);
    awayA = { ...awayA, x0: clamp(spot.x - 140, 6, viewW() - mw - 6), x1: clamp(spot.x + 140, 6, viewW() - mw - 6), y0: spot.y, y1: spot.y };
    save();
    speak(lastPointer === 'mouse' ? '¡Aquí me quedo! Doble clic y vuelvo 😉' : '¡Aquí me quedo! Toca dos veces y vuelvo 😉', 2800);
    queue();
    life();
  };
  const onClick = async () => {
    if (touring) { interruptTour(); return; }
    if (still || !active) return;
    abort();
    const t = gen;
    if (where === 'home' && !canJump()) await act(t, ['is-turn', 'is-happy', 'is-party'], 1000);   // arriba no hay espacio para la voltereta
    else await act(t, ['is-jump', 'is-happy', 'is-party'], 1500);
    life();
  };
  cubi.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || tiny.matches) return;
    press = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
    lastPointer = e.pointerType;
    userTouched = true;
    ptr = { x: e.clientX, y: e.clientY };
    try { cubi.setPointerCapture(e.pointerId); }
    catch (err) { console.warn('[cubi] no se pudo capturar el puntero; el arrastre puede cortarse', err); }
    e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    if (!press || e.pointerId !== press.id) return;
    ptr = { x: e.clientX, y: e.clientY };
    if (!press.moved && Math.hypot(e.clientX - press.sx, e.clientY - press.sy) > 5) { press.moved = true; startDrag(e); }
  });
  const release = (e, cancelled) => {
    if (!press || e.pointerId !== press.id) return;
    const p = press;
    press = null;
    try { if (cubi.hasPointerCapture(e.pointerId)) cubi.releasePointerCapture(e.pointerId); }
    catch (err) { console.warn('[cubi] no se pudo soltar la captura del puntero', err); }
    if (p.moved) { endDrag(); return; }
    if (cancelled) return;
    const now = performance.now();
    if (e.pointerType !== 'mouse' && now - lastTap < 320 && where === 'away') { lastTap = 0; goHome(); return; }
    lastTap = now;
    onClick();
  };
  window.addEventListener('pointerup', (e) => release(e, false));
  window.addEventListener('pointercancel', (e) => release(e, true));
  cubi.addEventListener('dblclick', () => { if (where === 'away') goHome(); });
  // que el gesto sobre Cubi no active el paso de hoja de la portada ni el carrusel
  ['touchstart', 'touchmove', 'wheel'].forEach((ev) => cubi.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  cubi.addEventListener('dragstart', (e) => e.preventDefault());

  cubi.addEventListener('pointerenter', (e) => {
    userTouched = true;
    if (e.pointerType !== 'mouse' || dragging || press || touring) return;
    speak(hello(), 2400);
    if (!active || still || typingDemo) return;
    abort();
    const t = gen;
    act(t, 'is-wave', 2400).then((ok) => { if (ok) life(); });
  });

  // ---------- reacciones a la portada ----------
  let typingTimer = 0;
  new MutationObserver(() => {
    const on = code.classList.contains('is-typing');
    if (on === typingDemo) return;
    typingDemo = on;
    if (where !== 'home' || !active || still) return;
    clearTimeout(typingTimer);
    if (on) {                                     // señala la línea que se está escribiendo
      abort();
      lookBusy = true; look(-1, 0.5);
      cubi.classList.add('is-point');
    } else {
      cubi.classList.remove('is-point');
      lookBusy = false;
      typingTimer = setTimeout(() => { if (!typingDemo && gen && active) life(); }, 4500);   // si no llega demo nueva
    }
  }).observe(code, { attributes: true, attributeFilter: ['class'] });

  if (demoTitle) {
    let lastTitle = demoTitle.textContent;
    new MutationObserver(() => {
      const t = demoTitle.textContent;
      if (!t || t === lastTitle) return;
      lastTitle = t;
      clearTimeout(typingTimer);
      demoShow();
    }).observe(demoTitle, { childList: true, characterData: true, subtree: true });
  }

  let raf = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (still || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!active || dragging || lookBusy || cubi.classList.contains('is-walk')) return;
      const r = cubi.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 320) { following = true; look(clamp(dx / 120, -1, 1), clamp(dy / 100, -1, 1)); }
      else if (following) { following = false; rest(); }
    });
  }, { passive: true });

  (function blinkLoop() {
    setTimeout(() => {
      if (active && !still && !cubi.classList.contains('is-nap')) {
        cubi.classList.add('is-blink');
        setTimeout(() => cubi.classList.remove('is-blink'), 140);
      }
      blinkLoop();
    }, rnd(1800, 5000));
  })();

  // ---------- recorrido por la portada: brinca sobre las palabras del titular y señala los botones ----------
  const h1 = document.querySelector('.hero h1');
  const btnMain = document.querySelector('.hero__cta .btn--amber');
  const btnMore = document.querySelector('.hero__cta [data-explica]');
  const wideHero = window.matchMedia('(min-width: 981px)');
  let touring = false, tourCount = 0, userTouched = false, lastInput = performance.now(), tourScroll = 0, hlEl = null;
  const docBox = (el) => { const r = el.getBoundingClientRect(); return { l: r.left + window.scrollX, r: r.right + window.scrollX, t: r.top + window.scrollY, b: r.bottom + window.scrollY }; };
  const inView = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top > headerBottom() && r.bottom < window.innerHeight && r.width > 0; };
  const stand = (cx, top) => ({ x: clamp(cx - mw / 2, window.scrollX + 4, window.scrollX + viewW() - mw - 4), y: top - mh * 0.97 });
  // Cajas de cada palabra del titular (con Range: sin tocar el HTML), agrupadas por renglón
  const headlineLines = () => {
    if (!h1) return [];
    const words = [];
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const re = /\S+/g;
      let m;
      while ((m = re.exec(node.data))) {
        const rg = document.createRange();
        rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length);
        const rs = rg.getClientRects();
        if (!rs.length || !rs[0].width) continue;
        const r = rs[0];
        words.push({ l: r.left + window.scrollX, r: r.right + window.scrollX, t: r.top + window.scrollY, b: r.bottom + window.scrollY });
      }
    }
    const lines = [];
    for (const w of words) {
      const ln = lines.find((x) => Math.abs(x.t - w.t) < (w.b - w.t) * 0.5);
      if (ln) ln.ws.push(w); else lines.push({ t: w.t, ws: [w] });
    }
    lines.forEach((ln) => ln.ws.sort((a, b) => a.l - b.l));
    return lines.sort((a, b) => a.t - b.t);
  };
  const onWord = (w) => stand((w.l + w.r) / 2, w.t + (w.b - w.t) * 0.2);   // los pies sobre el borde de arriba de las letras
  const headlinePath = () => {
    const pts = [];
    headlineLines().forEach((ln, i) => {
      const ws = ln.ws.length > 1 ? [ln.ws[0], ln.ws[ln.ws.length - 1]] : [ln.ws[0]];
      if (i % 2 === 0) ws.reverse();                 // en zigzag, empezando de derecha a izquierda (viene del editor)
      ws.forEach((w) => pts.push(onWord(w)));
    });
    return pts.slice(0, 10);
  };
  const highlight = (el) => {
    if (hlEl && hlEl !== el) hlEl.classList.remove('cubi-hl');
    hlEl = el;
    if (el) el.classList.add('cubi-hl');
  };
  // Casa de destino en coordenadas de la página (para llegar brincando y recién ahí volver a entrar)
  const homeTarget = () => {
    measureHome();
    const fullH = mh;
    cubi.classList.add('is-mini');
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    const HL = homeLayer(), lr = HL.getBoundingClientRect();
    const hx = homeA.bar ? homeA.x1 : homeA.x1 - 10, hy = homeA.y1;
    return { lx: hx, ly: hy, x: lr.left + window.scrollX + hx, y: lr.top + window.scrollY + hy + (fullH - mh) };
  };
  const arriveHome = (h) => {
    where = 'home';
    homeLayer().append(cubi, say);
    measureHome();
    setPos(h.lx, h.ly);
    land();
    save();
    queue();
  };
  function endTour() {
    touring = false;
    highlight(null);
    cubi.classList.remove('is-pointdown');
    lookBusy = false;
  }
  function interruptTour() {
    if (!touring) return;
    abort();
    endTour();
    if (!dragging) goHome();
  }
  async function tour() {
    if (touring || !active || where !== 'home' || dragging || still || !btnMain || !room || document.hidden) return;
    const desktop = wideHero.matches;
    if (desktop && window.scrollY > 10) return;
    if (!inView(btnMain)) return;
    abort();
    const t = gen;
    touring = true; tourCount++; tourScroll = window.scrollY;
    const r0 = cubi.getBoundingClientRect();
    where = 'away';
    away.append(cubi, say);
    cubi.classList.add('is-mini');                    // más pequeño para no tapar el titular
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    setPos(r0.left + window.scrollX + (r0.width - mw) / 2, r0.bottom + window.scrollY - mh);
    awayA = { x0: pos.x, x1: pos.x, y0: pos.y, y1: pos.y, w: viewW() };
    const hop = (p) => go(p.x, p.y, 'hop', t);
    try {
      if (desktop && h1) {
        const fb = docBox(figure);                     // primero por el borde de arriba del editor, luego al titular
        if (!(await hop(stand(fb.r - 110, fb.t)))) return;
        if (!(await hop(stand(fb.l + 40, fb.t)))) return;
        for (const p of headlinePath()) {
          if (!(await hop(p))) return;
          await wait(rnd(90, 220));
        }
      }
      const steps = desktop
        ? [[btnMain, '¿Tiene un proceso para automatizar? Cuéntenos aquí 👇'], [btnMore, '¿Quiere saber más? Toque aquí 👇']]
        : [[btnMain, '¿Algo para automatizar? Aquí 👇']];
      for (const [b, text] of steps) {
        if (!b || !inView(b)) continue;
        const bb = docBox(b);
        if (!(await hop(stand(bb.r - mw * 0.45, bb.t)))) return;    // de pie sobre la esquina del botón (no tapa el texto)
        highlight(b);
        lookBusy = true; look(-0.6, 1);
        cubi.classList.add('is-pointdown');
        speak(text, 2800);
        await wait(3000);
        cubi.classList.remove('is-pointdown');
        highlight(null);
        lookBusy = false;
        if (!alive(t)) return;
      }
      // de vuelta brincando: por el titular y el borde del editor
      if (desktop && h1) {
        const lines = headlineLines();
        const back = [lines[lines.length - 1], lines[1]].filter(Boolean).map((ln) => onWord(ln.ws[ln.ws.length - 1]));
        for (const p of back) if (!(await hop(p))) return;
        const fb = docBox(figure);
        if (!(await hop(stand(fb.l + 40, fb.t)))) return;
      }
      const h = homeTarget();
      if (!(await go(h.x, h.y, 'hop', t))) return;
      arriveHome(h);
      endTour();
      life();
    } finally {
      if (touring) endTour();
    }
  }
  const tryTour = () => {
    if (tourCount >= 3 || touring) return;
    const idle = performance.now() - lastInput > 6000;
    if ((tourCount === 0 && !userTouched) || idle) tour();
  };
  (function scheduleTour() {
    setTimeout(() => {
      if (still) {                                     // sin movimiento: solo una burbuja quieta, una vez
        if (active && where === 'home') speak('¿Algo para automatizar? Cuéntenos en el botón naranja', 4000);
        return;
      }
      tryTour();
      if (tourCount < 3) setTimeout(function again() { tryTour(); if (tourCount < 3) setTimeout(again, tourCount ? rnd(45000, 60000) : 8000); },
        tourCount ? rnd(45000, 60000) : 8000);
    }, rnd(4000, 6000));
  })();
  ['pointermove', 'keydown', 'touchstart', 'wheel'].forEach((ev) => window.addEventListener(ev, () => { lastInput = performance.now(); }, { passive: true }));
  window.addEventListener('scroll', () => {
    lastInput = performance.now();
    if (touring && Math.abs(window.scrollY - tourScroll) > 40) interruptTour();
  }, { passive: true });
  document.addEventListener('click', (e) => {
    if (touring && !cubi.contains(e.target) && e.target.closest && e.target.closest('a,button')) interruptTour();
  }, true);
  window.addEventListener('resize', () => { if (touring) interruptTour(); });

  // ---------- arranque ----------
  let mq = 0;
  const remeasure = () => {
    cancelAnimationFrame(mq);
    mq = requestAnimationFrame(() => {
      measureHome();
      if (where === 'away' && awayA && !dragging) {
        const W = viewW();
        awayA = { ...awayA, x0: clamp(awayA.x0, 6, W - mw - 6), x1: clamp(awayA.x1, 6, W - mw - 6), w: W };
        if (!moveAnim) setPos(clamp(pos.x, 6, W - mw - 6), pos.y);
      }
      if (tiny.matches && where === 'away') goHome();
      queue();
    });
  };
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(code);
  window.addEventListener('resize', remeasure);
  window.addEventListener('orientationchange', remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(figure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure, (e) => console.warn('[cubi] no se pudo esperar la carga de letras', e));
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(queue); io.observe(figure); io.observe(cubi); }
  window.addEventListener('scroll', queue, { passive: true });
  document.addEventListener('visibilitychange', check);

  measureHome();
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); }
  catch (e) { console.warn('[cubi] no se pudo leer la posición guardada; queda en casa', e); saved = null; }
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && !tiny.matches) {
    mw = cubi.offsetWidth; mh = cubi.offsetHeight;
    const de = document.documentElement;
    if (saved.x >= 0 && saved.x <= de.scrollWidth - 20 && saved.y >= 0 && saved.y <= de.scrollHeight - mh) setAway(clamp(saved.x, 6, viewW() - mw - 6), saved.y);
    else {
      console.warn('[cubi] la posición guardada no es válida; queda en casa');
      try { sessionStorage.removeItem(STORE); } catch (e) { console.warn('[cubi] no se pudo borrar la posición guardada', e); }
    }
  }
  check();
  if (!still) setTimeout(() => { if (active && where === 'home') speak('¡Hola! Soy Cubi 👋', 2400); phraseN = 1; }, 1500);
})();
