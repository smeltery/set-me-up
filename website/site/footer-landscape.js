/*! asciicn d5592fc980cad39578f13b16f6e015404160669b
MIT License

Copyright (c) 2026 Leo
Copyright (c) 2026 Shadcn Labs (startercn, which this project is based on)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var Ut={amplitude:[.08,.22],angle:[-.45,.45],count:[3,5],drift:[.05,.12],fold:[.25,.9],frequency:[.7,1.7],glow:[.35,.9],spread:[.35,.7],twist:[.9,2.6],width:[.035,.075]},Bt={density:[.38,.55],drift:[.025,.06],ridge:[.35,.95],scale:[2,3.4],stars:[.2,.8],swirl:[.1,.8],warp:[.6,1.3]},zt=e=>{let t=2166136261;for(let r of e)t^=r.codePointAt(0)??0,t=Math.imul(t,16777619);return t>>>0},Ot=e=>{let t=zt(e);return()=>{t=t+2654435769|0;let r=t;return r=Math.imul(r^r>>>16,2246822507),r=Math.imul(r^r>>>13,3266489909),r^=r>>>16,(r>>>0)/4294967296}},M=(e,[t,r])=>t+(r-t)*e(),he=e=>Math.min(1,Math.max(0,e)),Ye=Math.PI/180,Me=(e,t,r)=>{let n=t*Math.cos(r*Ye),o=t*Math.sin(r*Ye),i=(e+.3963377774*n+.2158037573*o)**3,s=(e-.1055613458*n-.0638541728*o)**3,a=(e-.0894841775*n-1.291485548*o)**3;return[4.0767416621*i-3.3077115913*s+.2309699292*a,-1.2684380046*i+2.6097574011*s-.3413193965*a,-.0041960863*i-.7034186147*s+1.707614701*a]},je=e=>e.every(t=>t>=-1e-4&&t<=1+1e-4),Te=e=>{let t=he(e);return t<=.0031308?t*12.92:1.055*t**(1/2.4)-.055},Ht=(e,t,r)=>{let n=0,o=t,i=Me(e,t,r);if(!je(i)){for(let s=0;s<14;s+=1){let a=(n+o)/2;je(Me(e,a,r))?n=a:o=a}i=Me(e,n,r)}return[Te(i[0]),Te(i[1]),Te(i[2])]},Le=[68,118],me=e=>(e%360+360)%360,nt=e=>{let t=me(e);return t>=Le[0]&&t<=Le[1]},Ze=(e,t)=>{let r=Math.max(2,Math.ceil(Math.abs(t)/4));for(let n=0;n<=r;n+=1)if(nt(e+t*n/r))return!0;return!1},$t={chroma:[.15,.17,.15,.1],lightness:[.56,.66,.76,.88]},qt={chroma:[.13,.16,.17,.15],lightness:[.58,.52,.46,.38]},Qe=(e,{chroma:t,lightness:r},n)=>{let o=i=>{let s=e[0]+(e[1]-e[0])*i/3;return Ht(r[i]??.5,(t[i]??.1)*n,me(s))};return[o(0),o(1),o(2),o(3)]},Wt=(e,t={})=>{let r=M(e,t.hue??[0,360]);for(let a=0;t.hue===void 0&&nt(r);a+=1)r=M(e,[0,360]),a>8&&(r=Le[1]+40);let n=M(e,[30,120]),o=t.turn===void 0?n*(e()<.5?-1:1):M(e,t.turn);Ze(r,o)&&(o=-o),Ze(r,o)&&(o=0);let i=[r,r+o],s=Math.min(1.3,Math.max(.4,t.vividness??1));return{dark:Qe(i,$t,s),hues:[me(i[0]),me(i[1])],light:Qe(i,qt,s)}},oe=e=>e-Math.floor(e),de=(e,t)=>{let r=oe(e*.1031),n=oe(t*.1031),o=oe(e*.1031),i=r*(n+33.33)+n*(o+33.33)+o*(r+33.33);return r+=i,n+=i,o+=i,oe((r+n)*o)},Vt=(e,t)=>{let r=Math.floor(e),n=Math.floor(t),o=e-r,i=t-n,s=o*o*o*(o*(o*6-15)+10),a=i*i*i*(i*(i*6-15)+10),u=de(r,n),c=de(r+1,n),d=de(r,n+1),f=de(r+1,n+1),b=u+(c-u)*s,h=d+(f-d)*s;return b+(h-b)*a},se=(e,t)=>{let r=0,n=.5,o=e,i=t;for(let s=0;s<4;s+=1){r+=n*Vt(o,i);let a=1.6*o-1.2*i+3.1,u=1.2*o+1.6*i+1.7;o=a,i=u,n*=.5}return r/.9375},fe=(e,t,r)=>{let n=he((r-e)/(t-e));return n*n*(3-2*n)},pe=`
float seedHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float seedNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = seedHash(i);
  float b = seedHash(i + vec2(1.0, 0.0));
  float c = seedHash(i + vec2(0.0, 1.0));
  float d = seedHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float seedFbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * seedNoise(p);
    p = vec2(1.6 * p.x - 1.2 * p.y + 3.1, 1.2 * p.x + 1.6 * p.y + 1.7);
    amp *= 0.5;
  }
  return sum / 0.9375;
}

// The palette for this paper: dark-paper stops, or light-paper ones.
vec3 seedStop(int index) {
  vec3 dark = index == 0 ? seedDark0 : index == 1 ? seedDark1 : index == 2 ? seedDark2 : seedDark3;
  vec3 light = index == 0 ? seedLight0 : index == 1 ? seedLight1 : index == 2 ? seedLight2 : seedLight3;
  return mix(dark, light, seedOnLight);
}

// Bright glyphs on dark paper catch a little white, like light on glass.
vec3 seedSheen(vec3 color, float tone) {
  return mix(color, vec3(1.0), pow(tone, 6.0) * 0.3 * (1.0 - seedOnLight));
}

vec3 seedColor(float x) {
  float s = clamp(x, 0.0, 1.0) * 3.0;
  if (s < 1.0) return mix(seedStop(0), seedStop(1), s);
  if (s < 2.0) return mix(seedStop(1), seedStop(2), s - 1.0);
  return mix(seedStop(2), seedStop(3), s - 2.0);
}

// Faint light below a glyph's worth drops to paper, so the space between
// shapes stays clean instead of filling with the ramp's first glyph.
float seedFloor(float tone) {
  return clamp((tone - 0.05) / 0.95, 0.0, 1.0);
}

// Centred box coordinates: y from -0.5 to 0.5, x scaled to the true aspect.
vec2 seedCentred(vec2 uv, vec2 res) {
  return vec2((uv.x - 0.5) * res.x / res.y, uv.y - 0.5);
}
`,ot=`
vec2 seedRibbons(vec2 uv, vec2 res, float t) {
  vec2 c = seedCentred(uv, res);
  float ca = cos(seedRibbonTilt);
  float sa = sin(seedRibbonTilt);
  vec2 p = vec2(ca * c.x - sa * c.y, sa * c.x + ca * c.y);
  float count = seedRibbonShape.x;
  float drift = seedMotion.x;
  float miss = 1.0;
  float best = 0.0;
  float which = 0.0;
  for (int n = 0; n < 5; n++) {
    float i = float(n);
    if (i < count) {
      float k = i / max(count - 1.0, 1.0);
      float phase = i * 2.399 + seedMotion.y;
      float bend = seedRibbonFold.x * (seedFbm(vec2(p.x * 0.8 + i * 3.1 + seedMotion.y, t * drift * 1.5 + i * 1.7 + seedMotion.z)) - 0.5);
      float centre = (k - 0.5) * seedRibbonShape.y
        + seedRibbonShape.z * sin(p.x * seedRibbonShape.w * 3.0 + phase + t * drift * (1.0 + 0.25 * i))
        + bend;
      float turn = cos(p.x * seedRibbonFold.z * 2.0 + phase * 1.7 - t * drift * 2.2);
      float w = seedRibbonFold.y * (0.2 + 0.8 * abs(turn));
      float d = abs(p.y - centre);
      float face = smoothstep(w, w * 0.35, d) * mix(0.35, 0.8, 0.5 + 0.5 * turn);
      float rimWidth = w * 0.22 + 0.006;
      float rim = exp(-pow((d - w) / rimWidth, 2.0)) * 0.75;
      float halo = seedRibbonFold.w * 0.22 * seedRibbonFold.y / (d + seedRibbonFold.y * 1.5);
      // Back ribbons sit a little dimmer, for depth.
      float depth = mix(1.0, 0.68, fract(i * 0.618 + seedMotion.y));
      float glow = clamp((face + rim + halo) * depth, 0.0, 1.0);
      miss *= 1.0 - glow;
      if (glow > best) {
        best = glow;
        which = k;
      }
    }
  }
  float haze = 0.06 * seedFbm(p * 2.2 + seedMotion.yz + vec2(t * drift * 0.4, 0.0));
  return vec2(seedFloor((1.0 - miss + haze) * seedMotion.w), which);
}
`,Xt=`${pe}${ot}
float field(vec2 uv, vec2 res, float t) {
  return seedRibbons(uv, res, t).x;
}
`,Kt=`${pe}${ot}
vec3 colorField(vec2 uv, vec2 res, float t) {
  vec2 r = seedRibbons(uv, res, t);
  // Each ribbon takes its own hue along the palette, so a prism of violet
  // and teal shows both; tone only nudges it.
  return seedSheen(seedColor(r.y * 0.9 + 0.05 + (r.x - 0.5) * 0.15), r.x);
}
`,st=`
vec3 seedNebula(vec2 uv, vec2 res, float t) {
  vec2 c = seedCentred(uv, res);
  float drift = seedMotion.x;
  float r = length(c);
  float spin = seedGasShape.x * (0.6 - r) + t * drift * 0.4 * seedGasShape.x;
  float cs = cos(spin);
  float sn = sin(spin);
  vec2 q = vec2(cs * c.x - sn * c.y, sn * c.x + cs * c.y) * seedGas.x + seedMotion.yz + vec2(t * drift, t * drift * 0.3);
  float a = seedFbm(q);
  float b = seedFbm(q * 1.7 + seedGas.y * 2.0 * vec2(a - 0.5, 0.5 - a) + vec2(1.7, 9.2) + vec2(0.0, t * drift * 0.5));
  float g = seedFbm(q + seedGas.y * 3.0 * vec2(b - 0.5, a - 0.5) + vec2(8.3, 2.8));
  // The cloud: a broad soft edge, squared so the core is dense and the
  // rim runs down through the middle of the glyph ramp.
  float gas = smoothstep(seedGas.w - 0.18, seedGas.w + 0.42, g);
  gas *= gas;
  // Filaments where the middle layer crosses its midpoint, reaching a
  // little past the cloud's edge.
  float ridge = pow(1.0 - abs(2.0 * b - 1.0), 5.0) * seedGas.z;
  float reach = smoothstep(seedGas.w - 0.35, seedGas.w + 0.05, g);
  // Dark dust lanes cutting through the brightest parts.
  float dust = smoothstep(0.55, 0.75, seedFbm(q * 2.3 + vec2(b * 1.5, 4.1)));
  float tone = seedFloor((gas * (1.0 - dust * 0.6) + ridge * reach * 0.7) * seedMotion.w);
  return vec3(tone, g, ridge * reach);
}

float seedStars(vec2 uv, vec2 res, float t) {
  vec2 cell = floor(uv * res);
  float h = seedHash(cell + seedMotion.yz * 13.0);
  float lit = step(1.0 - 0.012 * seedGasShape.y, h);
  float pulse = 0.65 + 0.35 * sin(t * (0.6 + 2.0 * fract(h * 37.0)) + h * 50.0);
  return lit * pulse * mix(0.55, 1.0, fract(h * 91.0));
}
`,Yt=`${pe}${st}
float field(vec2 uv, vec2 res, float t) {
  vec3 n = seedNebula(uv, res, t);
  // Stars only show where the gas is thin.
  return max(n.x, seedStars(uv, res, t) * (1.0 - smoothstep(0.15, 0.45, n.x)));
}
`,jt=`${pe}${st}
vec3 colorField(vec2 uv, vec2 res, float t) {
  vec3 n = seedNebula(uv, res, t);
  float star = seedStars(uv, res, t) * (1.0 - smoothstep(0.15, 0.45, n.x));
  // Hue follows the gas layers, so clouds of different depth differ in
  // colour; filaments climb to the far end of the palette.
  vec3 gas = seedSheen(seedColor(clamp((n.y - 0.3) * 1.6 + n.z * 0.6, 0.0, 1.0)), n.x);
  return mix(gas, seedSheen(seedStop(3), 1.0), clamp(star * 1.4, 0.0, 1.0));
}
`,Zt={nebula:{colorField:jt,field:Yt},ribbons:{colorField:Kt,field:Xt}},Qt=(e,t,r,n)=>{let o=Math.cos(e.angle),i=Math.sin(e.angle),s=o*t-i*r,a=i*t+o*r,[u,c]=e.offset,d=1;for(let f=0;f<e.count;f+=1){let b=f/Math.max(e.count-1,1),h=f*2.399+u,_=e.fold*(se(s*.8+f*3.1+u,n*e.drift*1.5+f*1.7+c)-.5),C=(b-.5)*e.spread+e.amplitude*Math.sin(s*e.frequency*3+h+n*e.drift*(1+.25*f))+_,T=Math.cos(s*e.twist*2+h*1.7-n*e.drift*2.2),x=e.width*(.2+.8*Math.abs(T)),F=Math.abs(a-C),z=fe(x,x*.35,F)*(.35+.45*(.5+.5*T)),v=x*.22+.006,I=Math.exp(-(((F-x)/v)**2))*.75,B=e.glow*.22*e.width/(F+e.width*1.5),q=1-.32*oe(f*.618+u);d*=1-he((z+I+B)*q)}return 1-d},Jt=(e,t,r,n)=>{let[o,i]=e.offset,s=Math.hypot(t,r),a=e.swirl*(.6-s)+n*e.drift*.4*e.swirl,u=Math.cos(a),c=Math.sin(a),d=(u*t-c*r)*e.scale+o+n*e.drift,f=(c*t+u*r)*e.scale+i+n*e.drift*.3,b=se(d,f),h=se(d*1.7+e.warp*2*(b-.5)+1.7,f*1.7+e.warp*2*(.5-b)+9.2+n*e.drift*.5),_=se(d+e.warp*3*(h-.5)+8.3,f+e.warp*3*(b-.5)+2.8),C=fe(e.density-.18,e.density+.42,_)**2,T=(1-Math.abs(2*h-1))**5*e.ridge,x=fe(e.density-.35,e.density+.05,_),F=fe(.55,.75,se(d*2.3+h*1.5,f*2.3+4.1));return C*(1-F*.6)+T*x*.7},er=(e,t,r,n)=>e.kind==="ribbons"?Qt(e,t,r,n):Jt(e,t,r,n),Je=40,et=22,tr=[0,9,23],rr=16/9,tt=e=>{let t=[];for(let o of tr)for(let i=0;i<et;i+=1){let s=(i+.5)/et-.5;for(let a=0;a<Je;a+=1){let u=((a+.5)/Je-.5)*rr;t.push(he(er(e,u,s,o)))}}t.sort((o,i)=>o-i);let r=t.reduce((o,i)=>o+i,0);return{coverage:t.filter(o=>o>.18).length/t.length,mean:r/t.length,peak:t[Math.floor(t.length*.96)]??0}},rt=[.26,.62],Ce=({coverage:e,peak:t})=>Math.max(0,rt[0]-e)+Math.max(0,e-rt[1])+Math.max(0,.35-t),nr=({peak:e})=>Math.min(2.2,Math.max(.75,.96/Math.max(e,.05))),or=8,sr=(e,t,r={})=>{let n=o=>r[o]??Ut[o];return{...t,amplitude:M(e,n("amplitude")),angle:M(e,n("angle")),count:Math.round(M(e,n("count"))),drift:M(e,n("drift")),fold:M(e,n("fold")),frequency:M(e,n("frequency")),gain:1,glow:M(e,n("glow")),kind:"ribbons",spread:M(e,n("spread")),twist:M(e,n("twist")),width:M(e,n("width"))}},ir=(e,t,r={})=>{let n=o=>r[o]??Bt[o];return{...t,density:M(e,n("density")),drift:M(e,n("drift")),gain:1,kind:"nebula",ridge:M(e,n("ridge")),scale:M(e,n("scale")),stars:M(e,n("stars")),swirl:M(e,n("swirl")),warp:M(e,n("warp"))}},ar=(e,t,r={})=>{let n=Ot(`${t}:${e}`),o=Wt(n,r),i=()=>{let u={drift:0,offset:[M(n,[0,97]),M(n,[0,97])],palette:o,seed:e};return t==="ribbons"?sr(n,u,r.ribbons):ir(n,u,r.nebula)},s=i(),a=tt(s);for(let u=1;u<or&&Ce(a)>0;u+=1){let c=i(),d=tt(c);Ce(d)<Ce(a)&&(s=c,a=d)}return{...s,gain:nr(a)}},lr=({dark:e,light:t},r)=>({seedDark0:e[0],seedDark1:e[1],seedDark2:e[2],seedDark3:e[3],seedLight0:t[0],seedLight1:t[1],seedLight2:t[2],seedLight3:t[3],seedOnLight:r?1:0}),cr=e=>e.kind==="ribbons"?{seedRibbonFold:[e.fold,e.width,e.twist,e.glow],seedRibbonShape:[e.count,e.spread,e.amplitude,e.frequency],seedRibbonTilt:e.angle}:{seedGas:[e.scale,e.warp,e.ridge,e.density],seedGasShape:[e.swirl,e.stars,0,0]},ur=(e,{onLight:t=!1,intensity:r=1}={})=>({...lr(e.palette,t),...cr(e),seedMotion:[e.drift,e.offset[0],e.offset[1],e.gain*Math.min(1.5,Math.max(0,r))]}),it=(e,t,r={})=>{let n=ar(e,t,r);return{...Zt[t],params:n,uniforms:ur(n,r)}};var L=e=>[...e];var be=[[1,8],[2,16],[4,32],[64,128]],dr=e=>String.fromCodePoint(10240+(e&255)),ke=L(" \u2598\u259D\u2580\u2596\u258C\u259E\u259B\u2597\u259A\u2590\u259C\u2584\u2599\u259F\u2588");var Wr=L("-/|\\");var Vr=L(" \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"),Xr=L(" \u258F\u258E\u258D\u258C\u258B\u258A\u2589\u2588"),fr=L(" \u2591\u2592\u2593\u2588");var Kr={arc:L("\u25DC\u25E0\u25DD\u25DE\u25E1\u25DF"),bar:L("\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588\u2587\u2586\u2585\u2584\u2583\u2582"),braille:L("\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F"),orbit:L("\u28FE\u28FD\u28FB\u28BF\u287F\u28DF\u28EF\u28F7"),quadrant:L("\u2596\u2598\u259D\u2597"),tick:L("-\\|/")},mr=Array.from({length:256},(e,t)=>dr(t)),Fe={blocks:{glyphs:fr,grid:[1,1],id:"blocks",kind:"ramp",label:"ANSI blocks"},braille:{glyphs:mr,grid:[2,4],id:"braille",kind:"braille",label:"Braille 2\xD74"},cp437:{glyphs:L(" \xB7\u2219\u2022\u221F\u2194\u25CB\u25D8\u266A\u266B\u263C\u2195\u203C\xA7\xB6\u2642\u2640\u2660\u2663\u2665\u2666\u25AC\u25BA\u25C4\u25B2\u25BC\u263A\u263B\u25D9\u2591\u2592\u2593\u2588"),grid:[1,1],id:"cp437",kind:"ramp",label:"CP437"},dense:{glyphs:L(" .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"),grid:[1,1],id:"dense",kind:"ramp",label:"Dense 70"},dots:{glyphs:L(" \xB7\u2219\u2022\u2981\u25CF"),grid:[1,1],id:"dots",kind:"ramp",label:"Halftone"},edge:{glyphs:L(" .:-=+*#%@"),grid:[1,1],id:"edge",kind:"edge",label:"Sobel edges"},katakana:{glyphs:L(" \xB7:=+\uFF70\uFF7C\uFF82\uFF7F\uFF9D\uFF90\uFF8A\uFF91\uFF92\uFF93\uFF94\uFF95\uFF97\uFF98\uFF9C\uFF66\uFF71\uFF73\uFF74\uFF75\uFF76\uFF77\uFF79\uFF7A\uFF7B\uFF7D\uFF7E\uFF80\uFF83\uFF85\uFF86\uFF87\uFF88\uFF8B\uFF8E\uFF8F01234789Z"),grid:[1,1],id:"katakana",kind:"ramp",label:"Katakana"},petscii:{glyphs:L(" \u2581\u2571\u2572\u2500\u2502\u256D\u256E\u2570\u256F\u2582\u253C\u25CB\u25C7\u2583\u2660\u2663\u2665\u2666\u25CF\u25C6\u2584\u258C\u2585\u2586\u258A\u2587\u2588"),grid:[1,1],id:"petscii",kind:"ramp",label:"PETSCII"},quadrants:{glyphs:ke,grid:[2,2],id:"quadrants",kind:"quadrants",label:"Quadrants 2\xD72"},standard:{glyphs:L(" .:-=+*#%@"),grid:[1,1],id:"standard",kind:"ramp",label:"Classic"}};var hr=e=>Object.hasOwn(Fe,e),Pe=(e="standard",t)=>{if(t!==void 0){let r=L(t);if(r.length>=2)return{glyphs:r,grid:[1,1],id:"custom",kind:"ramp",label:"Custom"}}return typeof e!="string"?e:hr(e)?Fe[e]:Fe.standard};var ye=.5,K={heavy:.26,light:.13},$=(e,t,r,n)=>({h:n,kind:"rect",w:r,x:e,y:t}),H=(e,t,r)=>({cx:e,cy:t,kind:"dot",r}),S=(e,t,r,n,o=K.light)=>({kind:"line",weight:o,x1:e,x2:r,y1:t,y2:n}),_e=new Map,A=(e,t)=>_e.set(e,t);A(" ",[]);A("\u2588",[$(0,0,1,1)]);for(let[e,t]of[..."\u2581\u2582\u2583\u2584\u2585\u2586\u2587"].entries()){let r=(e+1)/8;A(t,[$(0,1-r,1,r)])}for(let[e,t]of[..."\u258F\u258E\u258D\u258C\u258B\u258A\u2589"].entries())A(t,[$(0,0,(e+1)/8,1)]);A("\u2580",[$(0,0,1,.5)]);A("\u2594",[$(0,0,1,.125)]);A("\u2590",[$(.5,0,.5,1)]);A("\u2595",[$(.875,0,.125,1)]);for(let[e,t]of ke.entries()){if(e===0||e===15||_e.has(t))continue;let r=[];for(let n=0;n<4;n+=1)e&1<<n&&r.push($(n%2*.5,Math.floor(n/2)*.5,.5,.5));A(t,r)}var Ge=e=>{let t=[];for(let r=0;r<4;r+=1)for(let n=0;n<2;n+=1)e(n,r)&&t.push($(n/2,r/4,.5,.25));return t};A("\u2591",Ge((e,t)=>t===0&&e===0||t===2&&e===1));A("\u2592",Ge((e,t)=>(e+t)%2===0));A("\u2593",Ge((e,t)=>!(t===1&&e===1||t===3&&e===0)));var pr=.17;for(let e=1;e<256;e+=1){let t=[];for(let[r,n]of be.entries())for(let[o,i]of n.entries())e&i&&t.push(H(o===0?.3:.7,(r+.5)/4,pr));A(String.fromCodePoint(10240+e),t)}A(String.fromCodePoint(10240),[]);A("\xB7",[H(.5,.5,.07)]);A("\u2219",[H(.5,.5,.13)]);A("\u2022",[H(.5,.5,.24)]);A("\u2981",[H(.5,.5,.33)]);A("\u25CF",[H(.5,.5,.42)]);A("\u2571",[S(0,1,1,0)]);A("\u2572",[S(0,0,1,1)]);A("\u2573",[S(0,1,1,0),S(0,0,1,1)]);var R=(e,t,r,n,o)=>{let i=[],s=K.light*1.2,a=(d,f,b)=>{if(d!==null){if(d==="d"){for(let h of[-s,s])i.push(S(.5+h,f,.5+h,b));return}i.push(S(.5,f,.5,b,d==="h"?K.heavy:void 0))}},u=(d,f,b)=>{if(d!==null){if(d==="d"){for(let h of[-s*ye,s*ye])i.push(S(f,.5+h,b,.5+h));return}i.push(S(f,.5,b,.5,d==="h"?K.heavy:void 0))}},c=K.heavy/2;a(t,0,.5+c*ye),a(n,.5-c*ye,1),u(o,0,.5+c),u(r,.5-c,1),A(e,i)};R("\u2500",null,"l",null,"l");R("\u2502","l",null,"l",null);R("\u250C",null,"l","l",null);R("\u2510",null,null,"l","l");R("\u2514","l","l",null,null);R("\u2518","l",null,null,"l");R("\u251C","l","l","l",null);R("\u2524","l",null,"l","l");R("\u252C",null,"l","l","l");R("\u2534","l","l",null,"l");R("\u253C","l","l","l","l");R("\u2501",null,"h",null,"h");R("\u2503","h",null,"h",null);R("\u250F",null,"h","h",null);R("\u2513",null,null,"h","h");R("\u2517","h","h",null,null);R("\u251B","h",null,null,"h");R("\u2523","h","h","h",null);R("\u252B","h",null,"h","h");R("\u2533",null,"h","h","h");R("\u253B","h","h",null,"h");R("\u254B","h","h","h","h");R("\u2550",null,"d",null,"d");R("\u2551","d",null,"d",null);R("\u256C","d","d","d","d");for(let[e,t,r,n,o]of[["\u2554",null,"d","d",null],["\u2557",null,null,"d","d"],["\u255A","d","d",null,null],["\u255D","d",null,null,"d"],["\u2560","d","d","d",null],["\u2563","d",null,"d","d"],["\u2566",null,"d","d","d"],["\u2569","d","d",null,"d"]])R(e,t,r,n,o);var ve=(e,t,r,n,o)=>A(e,[{cx:t,cy:r,from:n,kind:"arc",rx:.5,ry:.5,to:o,weight:K.light}]);ve("\u256D",1,1,Math.PI,Math.PI*1.5);ve("\u256E",0,1,Math.PI*1.5,Math.PI*2);ve("\u2570",1,0,Math.PI*.5,Math.PI);ve("\u256F",0,0,0,Math.PI*.5);var ct=new Map,D=(e,t)=>ct.set(e,t);D(".",[H(.5,.78,.12)]);D(":",[H(.5,.36,.12),H(.5,.74,.12)]);D("-",[S(.18,.55,.82,.55)]);D("_",[S(.08,.9,.92,.9)]);D("=",[S(.18,.44,.82,.44),S(.18,.66,.82,.66)]);D("+",[S(.16,.55,.84,.55),S(.5,.33,.5,.77)]);D("*",[S(.5,.3,.5,.72),S(.2,.4,.8,.62),S(.2,.62,.8,.4)]);D("x",[S(.2,.38,.8,.82),S(.2,.82,.8,.38)]);D("o",[{cx:.5,cy:.6,from:0,kind:"arc",rx:.3,ry:.2,to:Math.PI*2,weight:K.light}]);D("#",[S(.38,.22,.3,.86),S(.72,.22,.64,.86),S(.12,.42,.9,.42),S(.1,.66,.88,.66)]);D("/",[S(.18,.88,.82,.12)]);D("\\",[S(.18,.12,.82,.88)]);D("|",[S(.5,.08,.5,.92)]);var ut=e=>_e.get(e);var Zr=[..._e.keys(),...ct.keys()],N=e=>Math.round(e*100)/100,at=e=>{let t=0;for(let[n,[o,i]]of e.entries()){let[s,a]=e[(n+1)%e.length]??[o,i];t+=o*a-s*i}return`${(t<0?[...e].toReversed():e).map(([n,o],i)=>`${i===0?"M":"L"}${N(n)} ${N(o)}`).join("")}Z`},lt=10,dt=(e,t)=>{let{x:r,y:n,width:o,height:i}=t,s=c=>r+c*o,a=c=>n+c*i,u="";for(let c of e)switch(c.kind){case"rect":{u+=`M${N(s(c.x))} ${N(a(c.y))}h${N(c.w*o)}v${N(c.h*i)}h${N(-c.w*o)}Z`;break}case"dot":{let d=N(c.r*o);u+=`M${N(s(c.cx)-d)} ${N(a(c.cy))}a${d} ${d} 0 1 1 ${N(2*d)} 0a${d} ${d} 0 1 1 ${N(-2*d)} 0Z`;break}case"line":{let d=s(c.x1),f=a(c.y1),b=s(c.x2),h=a(c.y2),_=Math.hypot(b-d,h-f)||1,C=c.weight*o/2,T=(h-f)/_*C,x=-(b-d)/_*C;u+=at([[d+T,f+x],[b+T,h+x],[b-T,h-x],[d-T,f-x]]);break}case"arc":{let d=c.weight*o/2,f=[],b=[];for(let h=0;h<=lt;h+=1){let _=c.from+(c.to-c.from)*h/lt,C=Math.cos(_),T=Math.sin(_),x=s(c.cx)+C*c.rx*o,F=a(c.cy)+T*c.ry*i;f.push([x+C*d,F+T*d]),b.push([x-C*d,F-T*d])}u+=at([...f,...b.toReversed()]);break}default:return c}return u};var Z=32,br=24,yr=(e,t)=>`${e.deviceWidth}x${e.deviceHeight}:${e.fontSize*e.dpr}:${e.font}:${t?t.join(""):"*"}`,W=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>{for(let e of W.values())e.redraw()});var _r=(e,t,r,n,o,i)=>{let s=Math.max(1,Math.round(t.weight*o)),a=Math.floor(s/2);if(t.x1===t.x2){let u=r+Math.floor(t.x1*o),c=n+Math.round(Math.min(t.y1,t.y2)*i),d=n+Math.round(Math.max(t.y1,t.y2)*i);return e.fillRect(u-a,c,s,Math.max(1,d-c)),!0}if(t.y1===t.y2){let u=n+Math.floor(t.y1*i),c=r+Math.round(Math.min(t.x1,t.x2)*o),d=r+Math.round(Math.max(t.x1,t.x2)*o);return e.fillRect(c,u-a,Math.max(1,d-c),s),!0}return!1},vr=(e,t,r,n,o,i)=>{for(let s of t){if(s.kind==="rect"){let a=Math.round(r+s.x*o),u=Math.round(n+s.y*i),c=Math.round(r+(s.x+s.w)*o),d=Math.round(n+(s.y+s.h)*i);c>a&&d>u&&e.fillRect(a,u,c-a,d-u);continue}if(!(s.kind==="line"&&_r(e,s,r,n,o,i))){if(s.kind==="dot"){let a=Math.max(.5,s.r*o);e.beginPath(),e.arc(r+s.cx*o,n+s.cy*i,a,0,Math.PI*2),e.fill();continue}e.fill(new Path2D(dt([s],{height:i,width:o,x:r,y:n})))}}},xr=(e,t,r,n,o,i)=>{let s=o/2,a=i/4,u=Math.max(1,Math.round(Math.min(s,a)*.55));for(let[c,d]of be.entries())for(let[f,b]of d.entries()){if((t&b)===0)continue;let h=r+Math.round(f*s+(s-u)/2),_=n+Math.round(c*a+(a-u)/2);u<4?e.fillRect(h,_,u,u):(e.beginPath(),e.arc(h+u/2,_+u/2,u/2,0,Math.PI*2),e.fill())}},gr={"\u2591":(e,t)=>e%2===0&&t%2===0,"\u2592":(e,t)=>(e+t)%2===0,"\u2593":(e,t)=>!(e%2===1&&t%2===1)},Sr=(e,t,r,n,o,i,s)=>{let a=Math.max(1,Math.round(s));for(let u=0;u*a<i;u+=1)for(let c=0;c*a<o;c+=1)t(c,u)&&e.fillRect(r+c*a,n+u*a,a,a)},De=class{canvas;metrics;columns=Z;glyphs;version=0;dynamic;slots=new Map;coverages=[];context;baseline=0;constructor(t,r,n){this.metrics=t,this.dynamic=n,this.glyphs=[],this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d",{willReadFrequently:!0});for(let o of r)this.slots.has(o)||this.slots.set(o,this.glyphs.length),this.glyphs.push(o);this.redraw()}redraw(){let{deviceWidth:t,deviceHeight:r}=this.metrics,n=Math.max(1,Math.ceil(this.glyphs.length/Z)),o=this.dynamic?n+2:n;this.canvas.width=t*Z,this.canvas.height=r*o,this.context=this.canvas.getContext("2d",{willReadFrequently:!0});let{context:i}=this;if(!i)return;i.font=`${this.metrics.fontSize*this.metrics.dpr}px ${this.metrics.font}`;let s=i.measureText("Mg"),a=s.fontBoundingBoxAscent||this.metrics.fontSize*this.metrics.dpr*.8,u=s.fontBoundingBoxDescent||this.metrics.fontSize*this.metrics.dpr*.2;this.baseline=Math.round((r-(a+u))/2+a),this.coverages=[];for(let c=0;c<this.glyphs.length;c+=1)this.paint(c);this.version+=1}paint(t){let{context:r}=this,n=this.glyphs[t];if(!r||n===void 0)return;let{deviceWidth:o,deviceHeight:i,dpr:s}=this.metrics,[a,u]=this.slotOrigin(t);r.clearRect(a,u,o,i),r.save(),r.beginPath(),r.rect(a,u,o,i),r.clip(),r.fillStyle="#fff";let c=n.codePointAt(0)??0,d=gr[n],f=ut(n);if(c>=10240&&c<=10495&&n.length===1)xr(r,c-10240,a,u,o,i);else if(d)Sr(r,d,a,u,o,i,s);else if(f)vr(r,f,a,u,o,i);else if(n.trim()!==""){r.font=`${this.metrics.fontSize*s}px ${this.metrics.font}`,r.textAlign="center",r.textBaseline="alphabetic";let b=r.measureText(n).width,h=b>o*1.05?o/b:1;r.translate(a+o/2,u+this.baseline),r.scale(h,1),r.fillText(n,0,0)}r.restore(),this.coverages[t]=this.measure(a,u,o,i)}measure(t,r,n,o){let{context:i}=this;if(!i)return 0;let{data:s}=i.getImageData(t,r,n,o),a=0;for(let u=3;u<s.length;u+=4)a+=s[u]??0;return a/(n*o*255)}slot(t){let r=this.slots.get(t);if(r!==void 0)return r;if(!this.dynamic)return-1;let n=this.glyphs.length;return this.slots.set(t,n),this.glyphs.push(t),Math.ceil(this.glyphs.length/Z)*this.metrics.deviceHeight>this.canvas.height?this.redraw():(this.paint(n),this.version+=1),n}slotOrigin(t){return[t%Z*this.metrics.deviceWidth,Math.floor(t/Z)*this.metrics.deviceHeight]}coverage(t){let r=this.slots.get(t);return r===void 0?0:this.coverages[r]??0}slotCoverage(t){return this.coverages[t]??0}drawGlyph(t,r,n,o,i=this.metrics.deviceWidth,s=this.metrics.deviceHeight){let a=this.slot(r);if(a<0)return;let[u,c]=this.slotOrigin(a);t.drawImage(this.canvas,u,c,this.metrics.deviceWidth,this.metrics.deviceHeight,n,o,i,s)}},ft=({metrics:e,glyphs:t,dynamic:r=!1})=>{let n=yr(e,r?null:t),o=W.get(n);if(o){if(W.delete(n),W.set(n,o),r)for(let s of t)o.slot(s);return o}let i=new De(e,t,r);if(W.set(n,i),W.size>br){let s=W.keys().next().value;s!==void 0&&W.delete(s)}return i},Rr=(e,t,r=.6)=>{let n=new Float32Array(Math.max(t,0));if(t<2)return n;let o=e(0),s=e(t-1)-o,a=1/(t-1),u=0;for(let d=0;d<t;d+=1){let f=d*a,b=s>1e-4?(e(d)-o)/s:f,h=f+(Math.min(1,Math.max(0,b))-f)*r,_=d===0?0:u+a*.15;u=d===t-1?1:Math.max(h,_),n[d]=u}if((n[t-2]??0)>=1)for(let d=1;d<t-1;d+=1)n[d]=d*a;return n};var mt=(e,t)=>Rr(r=>e.slotCoverage(r),t);var bt=/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,Er=/^[ \t]*#/m,Ar=/^\s*(?:(?:lowp|mediump|highp|const|uniform)\s+)*struct\b/,wr=/^\s*precision\b/,Mr=/\d+\.\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?|\d+(?:[eE][-+]?\d+)?|[A-Za-z_]\w*|\+\+|--|<=|>=|==|!=|&&|\|\||\^\^|[-+*/]=|\S/g,xe=e=>{let t=e.replaceAll(bt," "),r=[],n=0,o=0,i=s=>{let a=t.slice(o,s).trim();o=s,a!==""&&r.push(a)};for(let s=0;s<t.length;s+=1){let a=t[s];a==="{"?n+=1:a==="}"?(n-=1,n===0&&!Ar.test(t.slice(o,s))&&i(s+1)):a===";"&&n===0&&i(s+1)}return i(t.length),r},ht=e=>e.match(Mr)?.join(" ")??"",pt=e=>Er.test(e.replaceAll(bt," ")),Tr=(e,t)=>{if(pt(e)||pt(t))return t;let r=new Set(xe(e).map(ht));return xe(t).filter(n=>wr.test(n)||!r.has(ht(n))).join(`
`)},Cr=`
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 ascii_permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = ascii_permute(ascii_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p = rotate * p * 2.02 + vec2(11.3, 4.7);
    amp *= 0.5;
  }
  return clamp(0.5 + 0.5 * sum / 0.9375, 0.0, 1.0);
}

vec3 spectrum(float h) {
  vec3 rgb = clamp(abs(mod(fract(h) * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return rgb * rgb * (3.0 - 2.0 * rgb);
}

vec4 ascii_paletteEntry(float index) {
  return texture2D(u_palette, vec2((index + 0.5) / u_paletteSize, 0.5));
}

vec4 paletteColor(float x) {
  float last = u_paletteSize - 1.0;
  float scaled = clamp(x, 0.0, 1.0) * max(last - 1.0, 0.0);
  float index = floor(scaled);
  vec4 from = ascii_paletteEntry(min(1.0 + index, last));
  vec4 to = ascii_paletteEntry(min(2.0 + index, last));
  return mix(from, to, scaled - index);
}

vec3 oklch(float L, float C, float h) {
  vec3 lab = vec3(L, C * cos(h), C * sin(h));
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 linear) {
  vec3 c = clamp(linear, 0.0, 1.0);
  vec3 low = c * 12.92;
  vec3 high = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(low, high, step(vec3(0.0031308), c));
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec4 ascii_rgba(vec3 color) {
  return vec4(color, 1.0);
}

vec4 ascii_rgba(vec4 color) {
  return color;
}
`,Lr=`
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform vec3 u_pointer;
uniform vec2 u_pointerVelocity;
uniform vec3 u_click;
uniform vec4 u_audio;
uniform sampler2D u_palette;
uniform float u_paletteSize;
uniform vec2 ascii_samples;
uniform float ascii_levels;
uniform float ascii_interaction;
uniform sampler2D ascii_trail;
`,Fr=`
vec2 ascii_interact(vec2 uv, out float keep, out float boost) {
  keep = 1.0;
  boost = 0.0;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  if (ascii_interaction > 0.5 && ascii_interaction < 1.5) {
    // Repel: glyphs bulge away from the pointer and its core clears.
    vec2 d = (uv - u_pointer.xy) * aspect;
    float dist = length(d);
    float radius = 0.24;
    float fall = smoothstep(radius, 0.0, dist) * u_pointer.z;
    vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
    uv -= dir * fall * radius * 0.55 / aspect;
    keep = 1.0 - 0.9 * smoothstep(radius * 0.42, 0.0, dist) * u_pointer.z;
  } else if (ascii_interaction > 1.5 && ascii_interaction < 2.5) {
    // Ripple: a ring leaves each click, displacing and lighting glyphs.
    float age = u_click.z;
    if (age < 4.0) {
      vec2 d = (uv - u_click.xy) * aspect;
      float dist = length(d);
      float front = dist - age * 0.55;
      float fade = exp(-age * 1.1);
      float wave = sin(front * 46.0) * exp(-front * front * 90.0) * fade;
      vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
      uv += dir * wave * 0.018 / aspect;
      boost = max(wave, 0.0) * 0.55;
    }
  }
  return uv;
}
`,yt=({field:e,colorField:t,uniforms:r})=>{let n=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
${Lr}
${r}
${Cr}
${Fr}
`,o="";if(t!==void 0){let u=Tr(e,t);o=xe(u).length<xe(t).length?u:t}let i=n.split(`
`).length-1,s=i+e.split(`
`).length,a=`${n}${e}
${o}
void main() {
  vec2 base = gl_FragCoord.xy / ascii_samples;
  float keep;
  float boost;
  vec2 uv = ascii_interact(base, keep, boost);
  float tone = field(uv, u_resolution, u_time);
  // NaN and infinities from a field become paper, not noise.
  tone = (tone == tone && abs(tone) < 1e6) ? clamp(tone, 0.0, 1.0) : 0.0;
  tone = clamp(tone * keep + boost, 0.0, 1.0);
  if (ascii_interaction > 2.5) {
    tone = clamp(tone + texture2D(ascii_trail, base).r, 0.0, 1.0);
  }
  if (ascii_levels > 1.5) {
    tone = floor(tone * (ascii_levels - 1.0) + 0.5) / (ascii_levels - 1.0);
  }
  vec3 rgb = ${t===void 0?"vec3(0.0)":"clamp(ascii_rgba(colorField(uv, u_resolution, u_time)).rgb, 0.0, 1.0)"};
  gl_FragColor = vec4(rgb, tone);
}
`;return{colorLine:s,fieldLine:i,source:a}},ie=`#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,_t=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;var vt=`#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_field;
uniform sampler2D u_positions;
uniform sampler2D u_thresholds;
uniform sampler2D u_coverage;
uniform ivec2 u_cells;
uniform ivec2 u_grid;
uniform int u_kind;
uniform int u_count;
uniform int u_calibrated;
uniform int u_dither;
uniform int u_matrixSize;
uniform float u_steps;
uniform vec4 u_grade;
uniform int u_invert;
uniform float u_threshold;
uniform float u_edgeThreshold;
uniform int u_colorMode;
uniform int u_hasColor;
uniform vec3 u_ink;
uniform vec3 u_ansi[16];
uniform vec3 u_ansiLab[16];
uniform vec3 u_stops[8];
uniform int u_stopCount;
uniform float u_glitch;
uniform float u_glitchSeed;

layout(location = 0) out vec4 o_glyph;
layout(location = 1) out vec4 o_color;

ivec2 fieldSize;

float grade(float t) {
  float shaped = clamp((t - 0.5) * u_grade.y + 0.5 + u_grade.x, 0.0, 1.0);
  return u_grade.z == 1.0 ? shaped : pow(shaped, 1.0 / max(0.01, u_grade.z));
}

// A sample by its top-left based coordinate; the texture's row 0 is the bottom.
vec4 fieldAt(ivec2 p) {
  return texelFetch(u_field, ivec2(p.x, fieldSize.y - 1 - p.y), 0);
}

float toneAt(ivec2 p) {
  float graded = grade(fieldAt(p).a);
  return u_invert == 1 ? 1.0 - graded : graded;
}

float cutAt(ivec2 p) {
  if (u_dither == 0) {
    return 0.5;
  }
  float rank = floor(texelFetch(u_thresholds, p % u_matrixSize, 0).r * 255.0 + 0.5);
  return (rank + 0.5) / u_steps;
}

float positionAt(int index) {
  return texelFetch(u_positions, ivec2(index, 0), 0).r;
}

int rampLevel(float tone, float cut) {
  float last = float(u_count - 1);
  float level;
  if (u_calibrated == 0) {
    level = tone * last;
  } else {
    int low = 0;
    int high = u_count - 1;
    for (int i = 0; i < 12; i++) {
      if (high - low <= 1) {
        break;
      }
      int mid = (low + high) / 2;
      if (positionAt(mid) <= tone) {
        low = mid;
      } else {
        high = mid;
      }
    }
    float from = positionAt(low);
    float to = positionAt(high);
    level = float(low) + (to > from ? (tone - from) / (to - from) : 0.0);
  }
  return int(clamp(floor(level + cut), 0.0, last));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 linearOf(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

vec3 oklab(vec3 srgb) {
  vec3 c = linearOf(srgb);
  float l = pow(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b, 1.0 / 3.0);
  float m = pow(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b, 1.0 / 3.0);
  float s = pow(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b, 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  );
}

vec3 sampleStops(float t) {
  if (u_stopCount <= 1) {
    return u_stops[0];
  }
  float scaled = clamp(t, 0.0, 1.0) * float(u_stopCount - 1);
  int index = min(u_stopCount - 2, int(floor(scaled)));
  return mix(u_stops[index], u_stops[index + 1], scaled - float(index));
}

vec3 gradeRgb(vec3 rgb) {
  vec3 curved = vec3(grade(rgb.r), grade(rgb.g), grade(rgb.b));
  if (u_grade.w == 1.0) {
    return curved;
  }
  float grey = dot(curved, vec3(0.2126, 0.7152, 0.0722));
  return clamp(grey + (curved - grey) * u_grade.w, 0.0, 1.0);
}

void main() {
  fieldSize = u_cells * u_grid;
  ivec2 cell = ivec2(int(gl_FragCoord.x), u_cells.y - 1 - int(gl_FragCoord.y));
  int slot = 0;
  float tone = 0.0;
  vec3 rgb = vec3(0.0);

  if (u_kind == 1 || u_kind == 2) {
    int mask = 0;
    float sum = 0.0;
    for (int dy = 0; dy < 4; dy++) {
      if (dy >= u_grid.y) {
        break;
      }
      for (int dx = 0; dx < 2; dx++) {
        if (dx >= u_grid.x) {
          break;
        }
        ivec2 p = cell * u_grid + ivec2(dx, dy);
        vec4 s = fieldAt(p);
        float t = toneAt(p);
        sum += t;
        rgb += s.rgb;
        if (t > (u_dither == 1 ? cutAt(p) : u_threshold)) {
          if (u_kind == 1) {
            // Braille dot bits: 1-3 down the left, 4-6 down the right, 7-8 on the bottom row.
            int bit = dy == 3 ? (dx == 0 ? 64 : 128) : (dx == 0 ? (1 << dy) : (8 << dy));
            mask |= bit;
          } else {
            mask |= 1 << (dy * 2 + dx);
          }
        }
      }
    }
    float count = float(u_grid.x * u_grid.y);
    tone = sum / count;
    rgb /= count;
    slot = mask;
  } else {
    tone = toneAt(cell);
    rgb = fieldAt(cell).rgb;
    slot = rampLevel(tone, cutAt(cell));
    if (u_kind == 3) {
      ivec2 hi = u_cells - 1;
      #define T(x, y) toneAt(clamp(cell + ivec2(x, y), ivec2(0), hi))
      float sx = T(1, -1) + 2.0 * T(1, 0) + T(1, 1) - T(-1, -1) - 2.0 * T(-1, 0) - T(-1, 1);
      float sy = T(-1, 1) + 2.0 * T(0, 1) + T(1, 1) - T(-1, -1) - 2.0 * T(0, -1) - T(1, -1);
      #undef T
      if (length(vec2(sx, sy)) / 4.0 > u_edgeThreshold) {
        // y points down here, as in edgeChar: fold the angle into [0, pi).
        float angle = atan(sy, sx);
        if (angle < 0.0) {
          angle += 3.14159265;
        }
        int octant = int(floor(angle / 0.785398163 + 0.5)) % 4;
        int glyph = octant == 0 ? 2 : octant == 1 ? 1 : octant == 2 ? 0 : 3;
        slot = u_count + glyph;
      }
    }
  }

  // Glitch: a few cells flip to a random glyph on glitch frames.
  if (u_glitch > 0.0 && hash(vec2(cell) + u_glitchSeed) < u_glitch * 0.06) {
    float pick = hash(vec2(cell) * 1.7 + u_glitchSeed + 3.1);
    slot = u_kind == 1 ? int(pick * 255.0) + 1 : u_kind == 2 ? int(pick * 15.0) + 1 : int(pick * float(u_count - 1)) + 1;
  }

  vec3 color;
  if (u_colorMode == 0) {
    color = u_ink;
  } else if (u_colorMode == 3) {
    color = sampleStops(tone);
  } else {
    color = u_hasColor == 1 ? gradeRgb(rgb) : vec3(clamp(tone, 0.0, 1.0));
    if (u_colorMode == 2) {
      vec3 lab = oklab(color);
      float best = 1e9;
      vec3 pick = u_ansi[0];
      for (int i = 0; i < 16; i++) {
        vec3 d = lab - u_ansiLab[i];
        float distance = dot(d, d);
        if (distance < best) {
          best = distance;
          pick = u_ansi[i];
        }
      }
      color = pick;
    }
  }

  float coverage = texelFetch(u_coverage, ivec2(slot, 0), 0).r;
  o_glyph = vec4(float(slot & 255) / 255.0, float(slot >> 8) / 255.0, coverage, 1.0);
  o_color = vec4(color, 1.0);
}
`,xt=`#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_cellGlyph;
uniform sampler2D u_cellColor;
uniform sampler2D u_atlas;
uniform sampler2D u_bloom;
uniform ivec2 u_cells;
uniform ivec2 u_cellSize;
uniform vec2 u_canvas;
uniform int u_atlasColumns;
uniform vec4 u_paper;
uniform vec4 u_fx;
uniform vec4 u_fx2;
uniform vec4 u_glitchRows;

out vec4 o_color;

float coverageAt(int slot, ivec2 local) {
  ivec2 origin = ivec2(slot % u_atlasColumns, slot / u_atlasColumns) * u_cellSize;
  return texelFetch(u_atlas, origin + clamp(local, ivec2(0), u_cellSize - 1), 0).a;
}

void main() {
  float scanlines = u_fx.x;
  float bloom = u_fx.y;
  float curvature = u_fx.z;
  float split = u_fx.w;
  float flicker = u_fx2.x;
  float vignette = u_fx2.y;
  float dpr = u_fx2.z;

  // Top-left based position in [0, 1].
  vec2 p = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y) / u_canvas;
  float outside = 0.0;
  if (curvature > 0.0) {
    vec2 c = p * 2.0 - 1.0;
    c *= 1.0 + curvature * 0.18 * dot(c, c);
    c /= 1.0 + curvature * 0.18;
    p = c * 0.5 + 0.5;
    vec2 edge = smoothstep(vec2(0.0), vec2(2.0) / u_canvas, p) * smoothstep(vec2(0.0), vec2(2.0) / u_canvas, 1.0 - p);
    outside = 1.0 - edge.x * edge.y;
  }

  ivec2 px = ivec2(floor(p * u_canvas));
  ivec2 cell = px / u_cellSize;
  ivec2 local = px - cell * u_cellSize;
  // Glitch: a band of rows jumps sideways for a frame.
  if (cell.y >= int(u_glitchRows.x) && cell.y < int(u_glitchRows.y)) {
    cell.x += int(u_glitchRows.z);
  }

  vec3 rgb = u_paper.rgb;
  float alpha = u_paper.a;
  if (cell.x >= 0 && cell.y >= 0 && cell.x < u_cells.x && cell.y < u_cells.y) {
    ivec2 at = ivec2(cell.x, u_cells.y - 1 - cell.y);
    vec4 g = texelFetch(u_cellGlyph, at, 0);
    int slot = int(g.r * 255.0 + 0.5) + 256 * int(g.g * 255.0 + 0.5);
    vec3 ink = texelFetch(u_cellColor, at, 0).rgb;
    float cov = coverageAt(slot, local);
    vec3 covs = vec3(cov);
    if (split > 0.0) {
      int shift = max(1, int(dpr + 0.5));
      covs.r = coverageAt(slot, local - ivec2(shift, 0));
      covs.b = coverageAt(slot, local + ivec2(shift, 0));
    }
    // Premultiplied: glyph over paper, channel by channel for the RGB split.
    rgb = ink * covs + rgb * (1.0 - covs);
    alpha = max(cov, max(covs.r, covs.b)) + alpha * (1.0 - max(cov, max(covs.r, covs.b)));
  }

  if (bloom > 0.0) {
    vec2 grid = vec2(u_cells * u_cellSize);
    vec2 uv = vec2(p.x * u_canvas.x / grid.x, 1.0 - p.y * u_canvas.y / grid.y);
    vec3 glow = texture(u_bloom, uv).rgb * bloom;
    rgb += glow;
    alpha = min(1.0, alpha + dot(glow, vec3(0.3333)));
  }

  float shade = 1.0;
  if (scanlines > 0.0) {
    float y = gl_FragCoord.y / max(dpr, 1.0);
    shade *= 1.0 - scanlines * 0.42 * (0.5 + 0.5 * cos(y * 2.0943951));
  }
  if (vignette > 0.0) {
    vec2 c = p * 2.0 - 1.0;
    shade *= 1.0 - vignette * 0.75 * smoothstep(0.35, 1.45, dot(c, c));
  }
  shade *= flicker;
  rgb *= shade;
  if (u_paper.a < 1.0) {
    alpha *= shade;
  }

  // Curved glass leaves black corners (transparent without paper).
  rgb *= 1.0 - outside;
  alpha = mix(alpha, u_paper.a, outside);
  o_color = vec4(rgb, alpha);
}
`,gt=`#version 300 es
precision highp float;

uniform sampler2D u_source;
uniform sampler2D u_glyph;
uniform vec2 u_step;
uniform int u_fromCells;
uniform vec2 u_size;

out vec4 o_color;

vec3 read(vec2 uv) {
  vec3 c = texture(u_source, uv).rgb;
  if (u_fromCells == 1) {
    c *= texture(u_glyph, uv).b * 2.2;
  }
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  vec3 sum = read(uv) * 0.227027;
  sum += (read(uv + u_step * 1.3846) + read(uv - u_step * 1.3846)) * 0.316216;
  sum += (read(uv + u_step * 3.2308) + read(uv - u_step * 3.2308)) * 0.070270;
  o_color = vec4(sum, 1.0);
}
`,St=`#version 300 es
precision highp float;

uniform sampler2D u_previous;
uniform vec2 u_size;
uniform vec3 u_pointer;
uniform float u_decay;
uniform float u_strength;

out vec4 o_color;

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  float previous = texture(u_previous, uv).r * u_decay;
  vec2 d = (uv - u_pointer.xy) * vec2(u_size.x / u_size.y, 1.0);
  float stamp = exp(-dot(d, d) / 0.0035) * u_strength * u_pointer.z;
  o_color = vec4(min(1.0, previous + stamp), 0.0, 0.0, 1.0);
}
`,kr=/ERROR:\s*\d+:(\d+):\s*(.*)/g,Rt=({log:e,field:t,colorField:r,fieldLine:n,colorLine:o})=>{let i=[];for(let s of e.matchAll(kr)){let a=Number(s[1]),u=s[2]??"";if(r!==void 0&&a>o){let c=a-o;i.push(`colorField line ${c}: ${u}
  > ${(r.split(`
`)[c-1]??"").trim()}`)}else if(a>n){let c=a-n;i.push(`field line ${c}: ${u}
  > ${(t.split(`
`)[c-1]??"").trim()}`)}else i.push(`engine line ${a}: ${u}`)}return i.length>0?i.join(`
`):e};var Pr=/^[A-Za-z][A-Za-z0-9_]*$/,Gr={1:"float",2:"vec2",3:"vec3",4:"vec4"},Dr=e=>typeof e=="number"?1:e.length,Ie=e=>Object.keys(e).toSorted().flatMap(t=>{let r=e[t];return r===void 0?[]:!Pr.test(t)||t.startsWith("u_")||t.startsWith("ascii_")?(console.error(`[ascii-shader] uniform "${t}" skipped: names must be GLSL identifiers and not start with "u_" or "ascii_"`),[]):[{name:t,size:Dr(r)}]}),wt=()=>({ansi:new Float32Array(48),ansiLab:new Float32Array(48),audio:new Float32Array(4),bloom:0,click:new Float32Array([.5,.5,1e3]),colorMode:0,curvature:0,delta:0,edgeThreshold:.22,flicker:0,frame:0,glitch:0,grade:new Float32Array([0,1,1,1]),ink:new Float32Array([1,1,1]),interaction:0,invert:!1,levels:0,paper:new Float32Array([0,0,0,1]),pointer:new Float32Array([.5,.5,0]),pointerVelocity:new Float32Array(2),scanlines:0,seed:0,stopCount:1,stops:new Float32Array(24),threshold:.5,time:0,uniforms:{},vignette:0}),Et=e=>{console.error(`[ascii-shader] ${e}`)},At=(e,t,r)=>{let n=e.createShader(t);return n?(e.shaderSource(n,r),e.compileShader(n),n):null},ae=(e,t,r,n=o=>o)=>{let o=At(e,e.VERTEX_SHADER,t),i=At(e,e.FRAGMENT_SHADER,r),s=e.createProgram();if(!(o&&i&&s))return null;if(e.attachShader(s,o),e.attachShader(s,i),e.bindAttribLocation(s,0,"a_position"),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS)){if(!e.isContextLost()){let a=e.getShaderInfoLog(i)||e.getShaderInfoLog(o)||e.getProgramInfoLog(s)||"";Et(`shader failed to compile
${n(a)}`),(a.includes("already has a body")||a.includes("redefinition"))&&Et("a function is defined twice. `field` and `colorField` compile into one shader: give helpers different names, or define a shared helper once, in `field`, and call it from both.")}return e.deleteShader(o),e.deleteShader(i),e.deleteProgram(s),null}return e.deleteShader(o),e.deleteShader(i),s},le=(e,t,r)=>{let n={};for(let o of r)n[o]=e.getUniformLocation(t,o);return n},U=(e,t)=>{let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r},Ir=["u_field","u_positions","u_thresholds","u_coverage","u_cells","u_grid","u_kind","u_count","u_calibrated","u_dither","u_matrixSize","u_steps","u_grade","u_invert","u_threshold","u_edgeThreshold","u_colorMode","u_hasColor","u_ink","u_ansi","u_ansiLab","u_stops","u_stopCount","u_glitch","u_glitchSeed"],Nr=["u_cellGlyph","u_cellColor","u_atlas","u_bloom","u_cells","u_cellSize","u_canvas","u_atlasColumns","u_paper","u_fx","u_fx2","u_glitchRows"],Ur=["u_source","u_glyph","u_step","u_fromCells","u_size"],Br=["u_previous","u_size","u_pointer","u_decay","u_strength"],zr=["u_resolution","u_time","u_seed","u_pointer","u_pointerVelocity","u_click","u_audio","u_palette","u_paletteSize","ascii_samples","ascii_levels","ascii_interaction","ascii_trail"],Q=(e,t)=>{let r=Math.sin(e*12.9898+t*78.233)*43758.5453;return r-Math.floor(r)},Ne=e=>{let t=e.getExtension("EXT_color_buffer_float")!==null,r=ae(e,ie,vt),n=ae(e,ie,xt),o=ae(e,ie,gt),i=ae(e,ie,St);if(!(r&&n&&o&&i))return null;let s=le(e,r,Ir),a=le(e,n,Nr),u=le(e,o,Ur),c=le(e,i,Br),d=e.createVertexArray();e.bindVertexArray(d);let f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.pixelStorei(e.UNPACK_ALIGNMENT,1);let b=U(e,e.NEAREST),h=U(e,e.LINEAR),_=U(e,e.LINEAR),C=U(e,e.LINEAR),T=U(e,e.LINEAR),x=[U(e,e.LINEAR),U(e,e.LINEAR)],F=U(e,e.NEAREST),z=U(e,e.NEAREST),v=U(e,e.NEAREST),I=U(e,e.NEAREST),B=U(e,e.NEAREST),q=e.createFramebuffer(),V=e.createFramebuffer(),J=e.createFramebuffer(),ee=e.createFramebuffer(),Re=[e.createFramebuffer(),e.createFramebuffer()],ce=(l,m)=>{e.bindFramebuffer(e.FRAMEBUFFER,l),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,m,0)},X=null,ze=2,Oe=1,He=1,$e=!1,O={count:2,grid:[1,1],kind:0,positions:null},qe=32,We=-1,te=null,g=0,E=0,re=0,ne=0,Ee=1,Y=0,Ve=!1,Ae=null,we=(l,m,y,p,w,P)=>{e.bindTexture(e.TEXTURE_2D,l),e.texImage2D(e.TEXTURE_2D,0,p,m,y,0,w,P,null)},Xe=l=>{e.bindTexture(e.TEXTURE_2D,B),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,l.canvas);let m=new Float32Array(Math.max(1,l.glyphs.length));for(let y=0;y<l.glyphs.length;y+=1)m[y]=l.slotCoverage(y);e.bindTexture(e.TEXTURE_2D,I),e.texImage2D(e.TEXTURE_2D,0,e.R32F,m.length,1,0,e.RED,e.FLOAT,m),qe=l.columns,We=l.version},k=(l,m)=>{e.activeTexture(e.TEXTURE0+l),e.bindTexture(e.TEXTURE_2D,m)},kt=(l,m)=>{for(let y of l.custom){let p=m[y.name];p!==void 0&&(typeof p=="number"?e.uniform1f(y.location,p):p.length===2?e.uniform2f(y.location,p[0],p[1]):p.length===3?e.uniform3f(y.location,p[0],p[1],p[2]):e.uniform4f(y.location,p[0],p[1],p[2],p[3]))}},Pt=l=>{let m=x[Y];Y=1-Y;let y=x[Y];if(m&&y){e.useProgram(i),e.bindFramebuffer(e.FRAMEBUFFER,Re[Y]??null),e.viewport(0,0,g,E),k(0,m),e.uniform1i(c.u_previous,0),e.uniform2f(c.u_size,g,E),e.uniform3fv(c.u_pointer,l.pointer),e.uniform1f(c.u_decay,Math.exp(-l.delta*2.2));let p=Math.hypot(l.pointerVelocity[0]??0,l.pointerVelocity[1]??0);e.uniform1f(c.u_strength,Math.min(.9,.08+p*1.6)*Math.min(1,l.delta*30)),e.drawArrays(e.TRIANGLES,0,3)}},Gt=(l,m,y,p)=>{e.useProgram(l.program),e.bindFramebuffer(e.FRAMEBUFFER,q),e.viewport(0,0,y,p),k(0,F),e.uniform1i(l.at.u_palette,0),k(1,x[Y]??x[0]??F),e.uniform1i(l.at.ascii_trail,1),e.uniform1f(l.at.u_paletteSize,ze),e.uniform2f(l.at.u_resolution,p*re/Math.max(1,ne),p),e.uniform2f(l.at.ascii_samples,y,p),e.uniform1f(l.at.u_time,m.time),e.uniform1f(l.at.u_seed,m.seed),e.uniform3fv(l.at.u_pointer,m.pointer),e.uniform2fv(l.at.u_pointerVelocity,m.pointerVelocity),e.uniform3fv(l.at.u_click,m.click),e.uniform4fv(l.at.u_audio,m.audio),e.uniform1f(l.at.ascii_levels,m.levels),e.uniform1f(l.at.ascii_interaction,m.interaction),kt(l,m.uniforms),e.drawArrays(e.TRIANGLES,0,3)},Dt=(l,m)=>{let[y,p]=O.grid;e.useProgram(r),e.bindFramebuffer(e.FRAMEBUFFER,V),e.viewport(0,0,g,E),k(0,b),e.uniform1i(s.u_field,0),k(1,v),e.uniform1i(s.u_positions,1),k(2,z),e.uniform1i(s.u_thresholds,2),k(3,I),e.uniform1i(s.u_coverage,3),e.uniform2i(s.u_cells,g,E),e.uniform2i(s.u_grid,y,p),e.uniform1i(s.u_kind,O.kind),e.uniform1i(s.u_count,O.count),e.uniform1i(s.u_calibrated,O.positions?1:0),e.uniform1i(s.u_dither,$e?1:0),e.uniform1i(s.u_matrixSize,Oe),e.uniform1f(s.u_steps,He),e.uniform4fv(s.u_grade,l.grade),e.uniform1i(s.u_invert,l.invert?1:0),e.uniform1f(s.u_threshold,l.threshold),e.uniform1f(s.u_edgeThreshold,l.edgeThreshold),e.uniform1i(s.u_colorMode,l.colorMode),e.uniform1i(s.u_hasColor,Ve?1:0),e.uniform3fv(s.u_ink,l.ink),e.uniform3fv(s.u_ansi,l.ansi),e.uniform3fv(s.u_ansiLab,l.ansiLab),e.uniform3fv(s.u_stops,l.stops),e.uniform1i(s.u_stopCount,l.stopCount),e.uniform1f(s.u_glitch,m),e.uniform1f(s.u_glitchSeed,Q(l.frame,2)*100),e.drawArrays(e.TRIANGLES,0,3)},It=()=>{e.useProgram(o),e.uniform2f(u.u_size,g,E),e.bindFramebuffer(e.FRAMEBUFFER,J),k(0,_),e.uniform1i(u.u_source,0),k(1,h),e.uniform1i(u.u_glyph,1),e.uniform1i(u.u_fromCells,1),e.uniform2f(u.u_step,1/g,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,ee),k(0,C),e.uniform1i(u.u_fromCells,0),e.uniform2f(u.u_step,0,.6/E),e.drawArrays(e.TRIANGLES,0,3)},Nt=(l,m,y)=>{e.useProgram(n),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,re,ne),k(0,h),e.uniform1i(a.u_cellGlyph,0),k(1,_),e.uniform1i(a.u_cellColor,1),k(2,B),e.uniform1i(a.u_atlas,2),k(3,T),e.uniform1i(a.u_bloom,3),e.uniform2i(a.u_cells,g,E),e.uniform2i(a.u_cellSize,y.deviceWidth,y.deviceHeight),e.uniform2f(a.u_canvas,re,ne),e.uniform1i(a.u_atlasColumns,qe),e.uniform4fv(a.u_paper,l.paper),e.uniform4f(a.u_fx,l.scanlines,l.bloom,l.curvature,m);let p=l.flicker>0?1-l.flicker*.22*Q(l.frame,3):1;if(e.uniform4f(a.u_fx2,p,l.vignette,Ee,l.time),m>0){let w=Math.floor(Q(l.frame,4)*E),P=1+Math.floor(Q(l.frame,5)*3*l.glitch),G=Math.round((Q(l.frame,6)-.5)*8*l.glitch);e.uniform4f(a.u_glitchRows,w,w+P,G,0)}else e.uniform4f(a.u_glitchRows,-1,-1,0,0);e.drawArrays(e.TRIANGLES,0,3)},Ke={dispose:()=>{for(let l of[b,h,_,C,T,...x,F,z,v,I,B])e.deleteTexture(l);for(let l of[q,V,J,ee,...Re])e.deleteFramebuffer(l);e.deleteBuffer(f),e.deleteVertexArray(d);for(let l of[r,n,o,i])e.deleteProgram(l);X&&e.deleteProgram(X.program)},draw:l=>{if(!X||g===0||E===0||!te)return;te.version!==We&&Xe(te);let[m,y]=O.grid;e.bindVertexArray(d),e.disable(e.BLEND),l.interaction===3&&Pt(l),Gt(X,l,g*m,E*y);let p=l.glitch>0&&Q(Math.floor(l.frame/3),1)<l.glitch*.3?l.glitch:0;Dt(l,p),l.bloom>0&&It(),Nt(l,p,te.metrics)},readCells:()=>{if(g===0||E===0)return null;let l=g*E;Ae?.slots.length!==l&&(Ae={colors:new Uint8Array(l*4),raw:new Uint8Array(l*4),slots:new Uint16Array(l)});let{raw:m,slots:y,colors:p}=Ae;e.bindFramebuffer(e.READ_FRAMEBUFFER,V),e.readBuffer(e.COLOR_ATTACHMENT0),e.readPixels(0,0,g,E,e.RGBA,e.UNSIGNED_BYTE,m);for(let w=0;w<E;w+=1){let P=(E-1-w)*g;for(let G=0;G<g;G+=1){let ue=(P+G)*4;y[w*g+G]=(m[ue]??0)+256*(m[ue+1]??0)}}e.readBuffer(e.COLOR_ATTACHMENT1),e.readPixels(0,0,g,E,e.RGBA,e.UNSIGNED_BYTE,m);for(let w=0;w<E;w+=1)p.set(m.subarray((E-1-w)*g*4,(E-w)*g*4),w*g*4);return e.bindFramebuffer(e.READ_FRAMEBUFFER,null),{colors:p,columns:g,rows:E,slots:y}},resize:l=>{({columns:g,rows:E,canvasWidth:re,canvasHeight:ne,dpr:Ee}=l);let[m,y]=O.grid;t?we(b,g*m,E*y,e.RGBA16F,e.RGBA,e.HALF_FLOAT):we(b,g*m,E*y,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE),ce(q,b);for(let p of[h,_,C,T,...x])we(p,g,E,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE);e.bindFramebuffer(e.FRAMEBUFFER,V),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,h,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,_,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),ce(J,C),ce(ee,T);for(let[p,w]of Re.entries()){let P=x[p];P&&(ce(w,P),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT))}e.bindFramebuffer(e.FRAMEBUFFER,null)},setAtlas:(l,m)=>{let y=m.grid[0]!==O.grid[0]||m.grid[1]!==O.grid[1];O=m,te=l,Xe(l);let p=m.positions??new Float32Array([0]);e.bindTexture(e.TEXTURE_2D,v),e.texImage2D(e.TEXTURE_2D,0,e.R32F,p.length,1,0,e.RED,e.FLOAT,p),y&&g>0&&Ke.resize({canvasHeight:ne,canvasWidth:re,columns:g,dpr:Ee,rows:E})},setField:({field:l,colorField:m,specs:y})=>{let p=y.map(({name:G,size:ue})=>`uniform ${Gr[ue]} ${G};`).join(`
`),w=yt({colorField:m,field:l,uniforms:p}),P=ae(e,_t,w.source,G=>Rt({colorField:m,colorLine:w.colorLine,field:l,fieldLine:w.fieldLine,log:G}));return P?(X&&e.deleteProgram(X.program),X={at:le(e,P,zr),custom:y.map(G=>({...G,location:e.getUniformLocation(P,G.name)})),program:P},Ve=m!==void 0,!0):!1},setMatrix:l=>{$e=l!==null,l&&(e.bindTexture(e.TEXTURE_2D,z),e.texImage2D(e.TEXTURE_2D,0,e.R8,l.size,l.size,0,e.RED,e.UNSIGNED_BYTE,l.ranks),Oe=l.size,He=l.steps)},setPalette:l=>{let m=new Uint8Array(l.length*4);for(let[y,p]of l.entries())m.set(p.map(w=>Math.round(w*255)),y*4);e.bindTexture(e.TEXTURE_2D,F),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,l.length,1,0,e.RGBA,e.UNSIGNED_BYTE,m),ze=l.length}};return Ke};var Or='ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',ge=null,Ue=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>Ue.clear());var Hr=e=>{let t=Ue.get(e);if(t!==void 0)return t;if(typeof document>"u"||(ge??=document.createElement("canvas").getContext("2d"),!ge))return .6;ge.font=`100px ${e}`;let r=ge.measureText("M").width/100,n=Number.isFinite(r)&&r>.3&&r<1.2?r:.6;return Ue.set(e,n),n},Mt=({cell:e=12,font:t=Or,dpr:r=typeof window>"u"?1:window.devicePixelRatio||1,square:n=!1}={})=>{let o=Math.max(2,e),i=o/1.2,s=n?o:i*Hr(t),a=Math.max(1,Math.round(o*r)),u=Math.max(1,Math.round(s*r));return{deviceHeight:a,deviceWidth:u,dpr:r,font:t,fontSize:i,height:a/r,width:u/r}},Tt=(e,t,r)=>({columns:Math.max(1,Math.ceil(t/e.width)),rows:Math.max(1,Math.ceil(r/e.height))});var Ct=e=>e.replace("#","").match(/../g).map(t=>parseInt(t,16)/255);function Lt(e,t){let{field:r,colorField:n,uniforms:o,paper:i,charset:s}=t,a=t.palette?.map(v=>[...Ct(v),1]),u=e.getContext("webgl2",{alpha:!1,antialias:!1});if(!u)return null;let c=Ne(u);if(!c)return null;if(!c.setField({field:r,colorField:n,specs:Ie(o)}))return c.dispose(),null;let d=Pe(s),f=wt();f.colorMode=1,f.paper.set([...Ct(i),1]),f.uniforms=o,f.time=12,a&&(f.stopCount=a.length,a.forEach((v,I)=>f.stops.set(v.slice(0,3),I*3))),e.dataset.scene=t.name,e.dataset.charset=s,c.setMatrix(null),a&&c.setPalette(a);let b=!1,h=0,_,C=!0,T,x=!1;function F(){if(!x){if(C||T!==window.devicePixelRatio){T=window.devicePixelRatio;let v=e.clientWidth,I=e.clientHeight,B=Math.min(T||1,2),q=Mt({cell:t.cell??7,dpr:B,square:!0}),V=ft({glyphs:d.glyphs,metrics:q});c.setAtlas(V,{kind:0,count:d.glyphs.length,grid:d.grid,positions:mt(V,d.glyphs.length)});let{columns:J,rows:ee}=Tt(q,v,I);e.width=Math.round(v*B),e.height=Math.round(I*B),c.resize({columns:J,rows:ee,canvasWidth:e.width,canvasHeight:e.height,dpr:B}),C=!1}f.frame+=1,c.draw(f),e.dataset.ready="true"}}function z(v){(_===void 0||v-_>=32)&&(f.delta=_===void 0?0:(v-_)/1e3,f.time+=f.delta,_=v,F()),h=requestAnimationFrame(z)}return new ResizeObserver(()=>{C=!0,!b&&e.clientWidth&&e.clientHeight&&F()}).observe(e),e.addEventListener("webglcontextlost",v=>{v.preventDefault(),cancelAnimationFrame(h),h=0,x=!0,delete e.dataset.ready}),e.addEventListener("webglcontextrestored",()=>{if(c=Ne(u),!c?.setField({field:r,colorField:n,specs:Ie(o)})){c?.dispose();return}x=!1,c.setMatrix(null),a&&c.setPalette(a),C=!0,_=void 0,F(),b&&(h=requestAnimationFrame(z))}),F(),{setRunning(v){b=v,v&&!h&&!x&&(h=requestAnimationFrame(z)),v||(cancelAnimationFrame(h),h=0,_=void 0)},capture(){let v=c.readCells();return v?{columns:v.columns,rows:v.rows,glyphs:Array.from(v.slots,I=>d.glyphs[I]??" "),colors:Array.from(v.colors)}:null}}}var Be=it("set-me-up-forest-mist","nebula",{hue:[120,145],turn:[-18,8],vividness:.55,intensity:.8,nebula:{stars:[0,0],drift:[.035,.055]}}),Ft=["blocks","standard","petscii"],Se=e=>e.match(/../g).map(t=>parseInt(t,16)/255),$r={...Be.uniforms,seedDark0:Se("14291d"),seedDark1:Se("426047"),seedDark2:Se("819267"),seedDark3:Se("d8dba8")};function hn(e,t={}){let r=t.charset??Ft[crypto.getRandomValues(new Uint32Array(1))[0]%Ft.length];return Lt(e,{name:"forest-nebula",field:Be.field,colorField:Be.colorField,uniforms:$r,charset:r,cell:8,paper:"#0a1510"})}export{hn as createFooterLandscape};
