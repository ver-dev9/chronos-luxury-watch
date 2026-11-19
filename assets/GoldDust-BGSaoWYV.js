import{r as s,u as b,a as A,j as g}from"./r3f-ByKTNEWH.js";import{ai as F,h as m,a5 as P,c as M,ar as C,al as R}from"./three-DYm3mj0G.js";import{b as T,s as c}from"./index-CGk2RyFV.js";const j=`
uniform float uTime;
uniform float uSize;
uniform float uReveal;
uniform float uFlow;
uniform vec3 uPointer;
attribute float aSeed;
attribute float aScale;
varying float vAlpha;
${T}
void main(){
  vec3 p = position;
  float t = uTime * 0.06;
  p += vec3(
    snoise(vec3(p.xy*0.35, t+aSeed)),
    snoise(vec3(p.yz*0.35, t+aSeed+10.0)),
    snoise(vec3(p.zx*0.35, t+aSeed+20.0))
  ) * 0.45;
  // flow mode: particles orbit the centre in a vortex (finale / assembly)
  float ang = uFlow * (uTime*0.25 + aSeed*6.28) * (1.0/(0.6+length(p.xz)*0.25));
  mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p.xz = mix(p.xz, r*p.xz, uFlow);
  // pointer repulsion
  vec3 d = p - uPointer;
  float f = smoothstep(1.6, 0.0, length(d));
  p += normalize(d + 1e-4) * f * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (1.0 / -mv.z);
  float tw = 0.55 + 0.45*sin(uTime*1.7 + aSeed*40.0);
  float reveal = smoothstep(aSeed, aSeed+0.15, uReveal);
  vAlpha = tw * reveal * smoothstep(18.0, 3.0, -mv.z);
}
`,_=`
uniform vec3 uColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 2.2) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * (0.6 + core*0.9), a);
}
`;function V({count:o,radius:p=6,height:v=6,size:S=26,reveal:f,flow:d=0,color:x="#e4c88d"}){const l=s.useRef(null),{camera:n}=b(),z=s.useMemo(()=>{const r=new F,a=new Float32Array(o*3),e=new Float32Array(o),i=new Float32Array(o);for(let t=0;t<o;t++){const h=Math.sqrt(Math.random())*p,w=Math.random()*Math.PI*2;a[t*3]=Math.cos(w)*h,a[t*3+1]=(Math.random()-.5)*v,a[t*3+2]=Math.sin(w)*h,e[t]=Math.random(),i[t]=.25+Math.pow(Math.random(),4)*1.8}return r.setAttribute("position",new m(a,3)),r.setAttribute("aSeed",new m(e,1)),r.setAttribute("aScale",new m(i,1)),r},[o,p,v]),y=s.useMemo(()=>({uTime:{value:0},uSize:{value:S*Math.min(window.devicePixelRatio,2)},uReveal:{value:1},uFlow:{value:d},uPointer:{value:new M(99,99,99)},uColor:{value:new P(x)}}),[]),u=s.useMemo(()=>new M,[]);return A((r,a)=>{if(!l.current)return;const e=l.current.uniforms;e.uTime.value+=a*(1+Math.min(Math.abs(c.velocity)*.05,3)),e.uReveal.value=f?f.current*1.2:1.2,e.uFlow.value=R.lerp(e.uFlow.value,d,.05),u.set(c.pointer.x,c.pointer.y,.5).unproject(n),u.sub(n.position).normalize();const i=n.position.length();e.uPointer.value.copy(n.position).addScaledVector(u,i)}),g.jsx("points",{geometry:z,frustumCulled:!1,children:g.jsx("shaderMaterial",{ref:l,vertexShader:j,fragmentShader:_,uniforms:y,transparent:!0,depthWrite:!1,blending:C})})}export{V as G};
