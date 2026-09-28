import { introStorageKey } from "@/config/motion";
import { sceneEvents } from "./scene-state";

export type BootState = {
  scene: "live" | "static";
  intro: "play" | "done";
  reducedMotion: boolean;
  staticReason: "" | "reduced-motion" | "no-webgl" | "forced";
};

declare global {
  interface Window {
    __intellateBoot?: BootState;
    __intellateIntroMounted?: boolean;
  }
}

/**
 * Runs synchronously in <head> before first paint. Decides whether the intro
 * plays and whether the live scene runs; without JavaScript none of these
 * attributes exist and the page renders its static, fully readable layout.
 *
 * Test overrides: ?intro=play|skip, ?motion=reduce, ?webgl=off, ?scene=static.
 */
export const bootScript = `(function(){
var d=document.documentElement,q=new URLSearchParams(location.search);
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches||q.get('motion')==='reduce';
var gl=false;
if(q.get('webgl')!=='off'){try{var c=document.createElement('canvas');var x=c.getContext('webgl2')||c.getContext('webgl');gl=!!x;var l=x&&x.getExtension('WEBGL_lose_context');if(l)l.loseContext();}catch(e){}}
var forced=q.get('scene')==='static';
var live=gl&&!rm&&!forced;
var seen=false;try{seen=localStorage.getItem(${JSON.stringify(introStorageKey)})==='1'}catch(e){}
var cn=navigator.connection;var slow=!!(cn&&(cn.saveData||/2g/.test(cn.effectiveType||'')));
var iq=q.get('intro');
var play=iq==='play'||(iq!=='skip'&&!seen&&!rm&&!slow);
var s={scene:live?'live':'static',intro:play?'play':'done',reducedMotion:rm,staticReason:live?'':rm?'reduced-motion':forced?'forced':'no-webgl'};
window.__intellateBoot=s;
d.setAttribute('data-js','');d.setAttribute('data-scene',s.scene);d.setAttribute('data-intro',s.intro);
if(rm)d.setAttribute('data-motion','reduce');
document.addEventListener('click',function(e){
  var t=e.target&&e.target.closest&&e.target.closest('[data-intro-skip]');
  if(!t||window.__intellateIntroMounted)return;
  s.intro='done';d.setAttribute('data-intro','done');
  try{localStorage.setItem(${JSON.stringify(introStorageKey)},'1')}catch(e){}
  document.dispatchEvent(new CustomEvent(${JSON.stringify(sceneEvents.introEnd)},{detail:'skipped'}));
});
})();`;

export function applyBootAttributes(s: BootState) {
  const d = document.documentElement;
  d.setAttribute("data-js", "");
  d.setAttribute("data-scene", s.scene);
  d.setAttribute("data-intro", s.intro);
  if (s.reducedMotion) d.setAttribute("data-motion", "reduce");
}

/** Single writer for document-level mode attributes, so dev remounts can re-apply them. */
export function updateBoot(patch: Partial<BootState>) {
  const current = window.__intellateBoot;
  if (!current) return;
  const next = { ...current, ...patch };
  window.__intellateBoot = next;
  applyBootAttributes(next);
}
