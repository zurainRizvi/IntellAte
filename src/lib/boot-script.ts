export type BootState = {
  scene: "live" | "static";
  reducedMotion: boolean;
  staticReason: "" | "reduced-motion" | "no-webgl" | "forced";
};

declare global {
  interface Window {
    __intellateBoot?: BootState;
  }
}

/**
 * Runs synchronously in <head> before first paint. Decides whether the live
 * scene runs; without JavaScript none of these attributes exist and the page
 * renders its static, fully readable layout.
 *
 * Test overrides: ?motion=reduce, ?webgl=off, ?scene=static.
 */
export const bootScript = `(function(){
var d=document.documentElement,q=new URLSearchParams(location.search);
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches||q.get('motion')==='reduce';
var gl=false;
if(q.get('webgl')!=='off'){try{var c=document.createElement('canvas');var x=c.getContext('webgl2')||c.getContext('webgl');gl=!!x;var l=x&&x.getExtension('WEBGL_lose_context');if(l)l.loseContext();}catch(e){}}
var forced=q.get('scene')==='static';
var live=gl&&!rm&&!forced;
var s={scene:live?'live':'static',reducedMotion:rm,staticReason:live?'':rm?'reduced-motion':forced?'forced':'no-webgl'};
window.__intellateBoot=s;
d.setAttribute('data-js','');d.setAttribute('data-scene',s.scene);
if(rm)d.setAttribute('data-motion','reduce');
})();`;

export function applyBootAttributes(s: BootState) {
  const d = document.documentElement;
  d.setAttribute("data-js", "");
  d.setAttribute("data-scene", s.scene);
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
