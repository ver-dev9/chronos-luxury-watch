import{r as i,a as m,j as r}from"./r3f-ByKTNEWH.js";import{a5 as c,ar as f,D as d}from"./three-DYm3mj0G.js";import{b as g}from"./index-DGbEQH-Y.js";const p=`
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
void main(){ vPos = position; vec4 wp = modelMatrix*vec4(position,1.0);
 vNormal = normalize(normalMatrix*normal); vView = normalize(-(viewMatrix*wp).xyz);
 gl_Position = projectionMatrix*viewMatrix*wp; }
`,x=`
uniform float uTime; uniform float uIntensity; uniform vec3 uColor; uniform float uLength;
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
${g}
void main(){
  float along = clamp(0.5 - vPos.y/uLength, 0.0, 1.0);
  float rim = pow(abs(dot(vNormal, vView)), 1.6);
  float dust = 0.75 + 0.25*snoise(vec3(vPos*1.5 + vec3(0.0, uTime*0.2, 0.0)));
  float a = rim * (1.0-along) * dust * uIntensity * 0.22;
  gl_FragColor = vec4(uColor, a);
}
`;function P({position:t=[0,4,0],rotation:n=[0,0,0],length:o=8,radius:s=2.4,intensity:a=1,color:v="#e4c88d"}){const e=i.useRef(null),u=i.useMemo(()=>({uTime:{value:0},uIntensity:{value:a},uColor:{value:new c(v)},uLength:{value:o}}),[]);return m((y,l)=>{e.current&&(e.current.uniforms.uTime.value+=l,e.current.uniforms.uIntensity.value=a)}),r.jsxs("mesh",{position:t,rotation:n,children:[r.jsx("coneGeometry",{args:[s,o,48,1,!0]}),r.jsx("shaderMaterial",{ref:e,vertexShader:p,fragmentShader:x,uniforms:u,transparent:!0,depthWrite:!1,side:d,blending:f})]})}export{P as V};
