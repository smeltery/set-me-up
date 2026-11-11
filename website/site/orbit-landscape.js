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
var Ge=`
const float BH_CRITICAL = 2.598076;
const float BH_INNER = 3.0;
const float BH_CAMERA = 60.0;

// Stars on a lon/lat grid of the escaped direction. One star at most per
// grid square, about one sample across, so far from the hole each is a
// single glyph or dot; near the edge the lens stretches it into an arc.
float bhStars(vec3 d, vec2 pixel, float t) {
  vec2 a = vec2(atan(d.x, d.z), asin(clamp(d.y, -1.0, 1.0)));
  float spacing = pixel.y * bhCellRows * 7.0;
  vec2 g = a / spacing;
  vec2 id = floor(g);
  float pick = hash21(id + 17.3 + u_seed);
  if (pick < 0.7) {
    return 0.0;
  }
  vec2 centre = (id + 0.2 + 0.6 * vec2(hash21(id + 3.7), hash21(id + 9.1))) * spacing;
  vec2 off = (a - centre) / pixel;
  // Mostly faint points, with the odd bright one.
  float level = hash21(id + 5.3);
  float bright = level > 0.92 ? 0.62 : 0.12 + 0.12 * level;
  // Slow and shallow, so the sky glimmers rather than flickers.
  float twinkle = 0.85 + 0.15 * sin(t * (0.2 + pick * 0.5) + pick * 80.0);
  return bright * twinkle * exp(-dot(off, off) * 2.2);
}

vec3 bhWarm(float heat) {
  vec3 col = mix(vec3(0.55, 0.13, 0.04), vec3(0.98, 0.42, 0.12), smoothstep(0.0, 0.35, heat));
  col = mix(col, vec3(1.0, 0.7, 0.3), smoothstep(0.3, 0.65, heat));
  return mix(col, vec3(1.0, 0.93, 0.78), smoothstep(0.65, 1.0, heat));
}

vec3 bhDeepen(vec3 col) {
  // On light paper, bright amber vanishes: darken and saturate.
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 rich = mix(vec3(l), col, 1.3) * 0.6;
  return mix(col, clamp(rich, 0.0, 1.0), bhOnLight);
}

vec2 bhCacheUv = vec2(-1.0);
float bhCacheT = -1.0;
vec4 bhCacheValue = vec4(0.0);

// Returns the colour in rgb and the tone in a.
vec4 bhScene(vec2 uv, vec2 res, float t) {
  if (uv == bhCacheUv && t == bhCacheT) {
    return bhCacheValue;
  }
  float aspect = res.x / res.y;
  // Fit the disk across a wide box, keep the shadow a fair share of a
  // narrow one, and never crop the lensed arcs top and bottom.
  float fit = 1.9 * bhOuter / aspect;
  float zoom = max(11.5, min(fit, 13.5 / aspect)) / bhScale;
  vec2 s = (uv - 0.5) * vec2(aspect, 1.0) * zoom;
  // One sample in Schwarzschild radii, rows from the contract and columns
  // from the sample grid, since glyph cells are narrower than they are tall.
  vec2 cellRs = vec2(aspect / ascii_samples.x, 1.0 / res.y) * zoom;

  vec3 cam = BH_CAMERA * vec3(0.0, sin(bhTilt), -cos(bhTilt));
  vec3 fwd = -normalize(cam);
  vec3 right = vec3(1.0, 0.0, 0.0);
  vec3 up = cross(fwd, right);
  vec3 dir = normalize(fwd + (s.x * right + s.y * up) / BH_CAMERA);

  vec3 pos = cam;
  vec3 vel = dir;
  vec3 hv = cross(pos, vel);
  float h2 = dot(hv, hv);
  float b = sqrt(h2);

  float disk = 0.0;
  float heat = 0.0;
  float cover = 0.0;
  bool captured = false;
  for (int i = 0; i < 128; i++) {
    float r = length(pos);
    // Long strides far out, short ones near the photon sphere.
    float dl = clamp(0.1 * (r - 0.8), 0.04, 4.0);
    vec3 acc = -1.5 * h2 * pos / (r * r * r * r * r);
    vec3 mid = vel + 0.5 * dl * acc;
    vec3 next = pos + dl * mid;
    float rn = length(next);
    vel = mid + 0.5 * dl * (-1.5 * h2 * next / (rn * rn * rn * rn * rn));

    if (pos.y * next.y < 0.0) {
      vec3 hit = mix(pos, next, pos.y / (pos.y - next.y));
      float rh = length(hit.xz);
      if (rh > BH_INNER * 0.96 && rh < bhOuter) {
        // Keplerian orbit, anticlockwise seen from above: the left side
        // comes toward the camera.
        vec3 tangent = vec3(-hit.z, 0.0, hit.x) / rh;
        float beta = sqrt(0.5 / rh);
        float gamma = inversesqrt(1.0 - beta * beta);
        float facing = dot(tangent, -normalize(vel));
        float g = sqrt(1.0 - 1.0 / rh) / (gamma * (1.0 - beta * facing));

        // Each radius turns at its own rate, so streaks shear as they flow.
        float omega = 0.22 * pow(BH_INNER / rh, 1.5);
        float ang = atan(hit.z, hit.x) - omega * t;
        vec2 loop = vec2(cos(ang), sin(ang));
        float clumps = fbm(vec2(rh * 1.1, 2.0) + loop * 1.3 + u_seed);
        float streaks = fbm(vec2(rh * 4.2, 7.0) + loop * 1.9 + u_seed);
        float density = clamp(0.25 + 0.75 * clumps + 1.1 * (streaks - 0.5), 0.0, 1.0);

        float inner = smoothstep(BH_INNER * 0.96, BH_INNER * 1.12, rh);
        float outer = 1.0 - smoothstep(bhOuter * 0.35, bhOuter, rh);
        float profile = pow(BH_INNER / rh, 2.0) * inner * outer;
        // Streaks show most in the bright inner disk; the outer disk stays
        // a quiet haze.
        float texture = mix(0.75, 0.3 + 1.0 * density, smoothstep(bhOuter * 0.8, BH_INNER * 1.4, rh));
        float emit = profile * pow(g, bhBeaming) * texture;
        float alpha = clamp(0.3 + 0.7 * density, 0.0, 0.95) * inner * outer;

        float w = (1.0 - cover) * emit;
        disk += w;
        heat += w * clamp((g * pow(BH_INNER / rh, 0.75) - 0.2) * 1.15, 0.0, 1.0);
        cover += (1.0 - cover) * alpha;
      }
    }
    pos = next;
    if (rn < 1.02) {
      captured = true;
      break;
    }
    if (rn > BH_CAMERA && dot(pos, vel) > 0.0) {
      break;
    }
    if (cover > 0.98) {
      break;
    }
  }

  float starLight = 0.0;
  if (!captured && bhShowStars > 0.5 && cover < 0.98) {
    starLight = bhStars(normalize(vel), cellRs / BH_CAMERA, t) * (1.0 - cover);
  }

  // The photon ring: a line a sample or so wide just outside the shadow,
  // brighter on the side that comes toward you.
  float ringDist = (b - BH_CRITICAL) / cellRs.y;
  float ring = exp(-pow(ringDist - 0.5, 2.0) * 1.1) * (1.0 - 0.5 * cover);
  vec2 sn = s / max(length(s), 1e-4);
  ring *= 0.9 - 0.2 * sn.x * (bhBeaming / 2.5);

  float diskTone = 1.0 - exp(-disk * 2.2);
  float ringTone = ring;
  float starTone = starLight;
  float tone = max(max(diskTone, ringTone), starTone);
  // Dots light against an ordered matrix: stretch the range so the hot
  // disk and the ring draw solid and the faint haze thins out.
  tone = mix(tone, smoothstep(0.05, 0.85, tone), bhPacked);

  float heatAvg = disk > 1e-4 ? heat / disk : 0.0;
  vec3 ink = paletteColor(0.0).rgb;
  vec3 accent = paletteColor(1.0).rgb;
  vec3 diskCol;
  vec3 ringCol;
  vec3 starCol;
  if (bhWarmTint > 0.5) {
    diskCol = bhDeepen(bhWarm(heatAvg));
    ringCol = bhDeepen(bhWarm(0.8));
    starCol = bhDeepen(vec3(0.86, 0.9, 1.0));
  } else {
    diskCol = mix(ink, accent, smoothstep(0.25, 0.7, heatAvg));
    ringCol = accent;
    starCol = ink;
  }
  float wd = diskTone + 1e-4;
  vec3 col = (diskCol * wd + ringCol * ringTone + starCol * starTone) / (wd + ringTone + starTone);

  bhCacheUv = uv;
  bhCacheT = t;
  bhCacheValue = vec4(col, tone);
  return bhCacheValue;
}
`,Pe=`${Ge}
float field(vec2 uv, vec2 res, float t) {
  return bhScene(uv, res, t).a;
}
`,Ne=`${Ge}
vec4 colorField(vec2 uv, vec2 res, float t) {
  vec4 scene = bhScene(uv, res, t);
  // Faint glyphs sit back toward the paper, so the hot disk reads nearest.
  // Dots are either lit or not, so they keep full colour.
  float fade = mix(mix(0.55, 1.0, smoothstep(0.0, 0.7, scene.a)), 1.0, bhPacked);
  return vec4(scene.rgb, fade);
}
`;var S=e=>[...e];var le=[[1,8],[2,16],[4,32],[64,128]],ht=e=>String.fromCodePoint(10240+(e&255)),ye=S(" \u2598\u259D\u2580\u2596\u258C\u259E\u259B\u2597\u259A\u2590\u259C\u2584\u2599\u259F\u2588");var qt=S("-/|\\");var Yt=S(" \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"),jt=S(" \u258F\u258E\u258D\u258C\u258B\u258A\u2589\u2588"),pt=S(" \u2591\u2592\u2593\u2588");var Kt={arc:S("\u25DC\u25E0\u25DD\u25DE\u25E1\u25DF"),bar:S("\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588\u2587\u2586\u2585\u2584\u2583\u2582"),braille:S("\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F"),orbit:S("\u28FE\u28FD\u28FB\u28BF\u287F\u28DF\u28EF\u28F7"),quadrant:S("\u2596\u2598\u259D\u2597"),tick:S("-\\|/")},bt=Array.from({length:256},(e,t)=>ht(t)),_e={blocks:{glyphs:pt,grid:[1,1],id:"blocks",kind:"ramp",label:"ANSI blocks"},braille:{glyphs:bt,grid:[2,4],id:"braille",kind:"braille",label:"Braille 2\xD74"},cp437:{glyphs:S(" \xB7\u2219\u2022\u221F\u2194\u25CB\u25D8\u266A\u266B\u263C\u2195\u203C\xA7\xB6\u2642\u2640\u2660\u2663\u2665\u2666\u25AC\u25BA\u25C4\u25B2\u25BC\u263A\u263B\u25D9\u2591\u2592\u2593\u2588"),grid:[1,1],id:"cp437",kind:"ramp",label:"CP437"},dense:{glyphs:S(" .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"),grid:[1,1],id:"dense",kind:"ramp",label:"Dense 70"},dots:{glyphs:S(" \xB7\u2219\u2022\u2981\u25CF"),grid:[1,1],id:"dots",kind:"ramp",label:"Halftone"},edge:{glyphs:S(" .:-=+*#%@"),grid:[1,1],id:"edge",kind:"edge",label:"Sobel edges"},katakana:{glyphs:S(" \xB7:=+\uFF70\uFF7C\uFF82\uFF7F\uFF9D\uFF90\uFF8A\uFF91\uFF92\uFF93\uFF94\uFF95\uFF97\uFF98\uFF9C\uFF66\uFF71\uFF73\uFF74\uFF75\uFF76\uFF77\uFF79\uFF7A\uFF7B\uFF7D\uFF7E\uFF80\uFF83\uFF85\uFF86\uFF87\uFF88\uFF8B\uFF8E\uFF8F01234789Z"),grid:[1,1],id:"katakana",kind:"ramp",label:"Katakana"},petscii:{glyphs:S(" \u2581\u2571\u2572\u2500\u2502\u256D\u256E\u2570\u256F\u2582\u253C\u25CB\u25C7\u2583\u2660\u2663\u2665\u2666\u25CF\u25C6\u2584\u258C\u2585\u2586\u258A\u2587\u2588"),grid:[1,1],id:"petscii",kind:"ramp",label:"PETSCII"},quadrants:{glyphs:ye,grid:[2,2],id:"quadrants",kind:"quadrants",label:"Quadrants 2\xD72"},standard:{glyphs:S(" .:-=+*#%@"),grid:[1,1],id:"standard",kind:"ramp",label:"Classic"}};var vt=e=>Object.hasOwn(_e,e),xe=(e="standard",t)=>{if(t!==void 0){let r=S(t);if(r.length>=2)return{glyphs:r,grid:[1,1],id:"custom",kind:"ramp",label:"Custom"}}return typeof e!="string"?e:vt(e)?_e[e]:_e.standard};var ce=.5,X={heavy:.26,light:.13},z=(e,t,r,o)=>({h:o,kind:"rect",w:r,x:e,y:t}),U=(e,t,r)=>({cx:e,cy:t,kind:"dot",r}),x=(e,t,r,o,a=X.light)=>({kind:"line",weight:a,x1:e,x2:r,y1:t,y2:o}),ue=new Map,R=(e,t)=>ue.set(e,t);R(" ",[]);R("\u2588",[z(0,0,1,1)]);for(let[e,t]of[..."\u2581\u2582\u2583\u2584\u2585\u2586\u2587"].entries()){let r=(e+1)/8;R(t,[z(0,1-r,1,r)])}for(let[e,t]of[..."\u258F\u258E\u258D\u258C\u258B\u258A\u2589"].entries())R(t,[z(0,0,(e+1)/8,1)]);R("\u2580",[z(0,0,1,.5)]);R("\u2594",[z(0,0,1,.125)]);R("\u2590",[z(.5,0,.5,1)]);R("\u2595",[z(.875,0,.125,1)]);for(let[e,t]of ye.entries()){if(e===0||e===15||ue.has(t))continue;let r=[];for(let o=0;o<4;o+=1)e&1<<o&&r.push(z(o%2*.5,Math.floor(o/2)*.5,.5,.5));R(t,r)}var ge=e=>{let t=[];for(let r=0;r<4;r+=1)for(let o=0;o<2;o+=1)e(o,r)&&t.push(z(o/2,r/4,.5,.25));return t};R("\u2591",ge((e,t)=>t===0&&e===0||t===2&&e===1));R("\u2592",ge((e,t)=>(e+t)%2===0));R("\u2593",ge((e,t)=>!(t===1&&e===1||t===3&&e===0)));var _t=.17;for(let e=1;e<256;e+=1){let t=[];for(let[r,o]of le.entries())for(let[a,c]of o.entries())e&c&&t.push(U(a===0?.3:.7,(r+.5)/4,_t));R(String.fromCodePoint(10240+e),t)}R(String.fromCodePoint(10240),[]);R("\xB7",[U(.5,.5,.07)]);R("\u2219",[U(.5,.5,.13)]);R("\u2022",[U(.5,.5,.24)]);R("\u2981",[U(.5,.5,.33)]);R("\u25CF",[U(.5,.5,.42)]);R("\u2571",[x(0,1,1,0)]);R("\u2572",[x(0,0,1,1)]);R("\u2573",[x(0,1,1,0),x(0,0,1,1)]);var g=(e,t,r,o,a)=>{let c=[],n=X.light*1.2,s=(d,h,v)=>{if(d!==null){if(d==="d"){for(let b of[-n,n])c.push(x(.5+b,h,.5+b,v));return}c.push(x(.5,h,.5,v,d==="h"?X.heavy:void 0))}},u=(d,h,v)=>{if(d!==null){if(d==="d"){for(let b of[-n*ce,n*ce])c.push(x(h,.5+b,v,.5+b));return}c.push(x(h,.5,v,.5,d==="h"?X.heavy:void 0))}},l=X.heavy/2;s(t,0,.5+l*ce),s(o,.5-l*ce,1),u(a,0,.5+l),u(r,.5-l,1),R(e,c)};g("\u2500",null,"l",null,"l");g("\u2502","l",null,"l",null);g("\u250C",null,"l","l",null);g("\u2510",null,null,"l","l");g("\u2514","l","l",null,null);g("\u2518","l",null,null,"l");g("\u251C","l","l","l",null);g("\u2524","l",null,"l","l");g("\u252C",null,"l","l","l");g("\u2534","l","l",null,"l");g("\u253C","l","l","l","l");g("\u2501",null,"h",null,"h");g("\u2503","h",null,"h",null);g("\u250F",null,"h","h",null);g("\u2513",null,null,"h","h");g("\u2517","h","h",null,null);g("\u251B","h",null,null,"h");g("\u2523","h","h","h",null);g("\u252B","h",null,"h","h");g("\u2533",null,"h","h","h");g("\u253B","h","h",null,"h");g("\u254B","h","h","h","h");g("\u2550",null,"d",null,"d");g("\u2551","d",null,"d",null);g("\u256C","d","d","d","d");for(let[e,t,r,o,a]of[["\u2554",null,"d","d",null],["\u2557",null,null,"d","d"],["\u255A","d","d",null,null],["\u255D","d",null,null,"d"],["\u2560","d","d","d",null],["\u2563","d",null,"d","d"],["\u2566",null,"d","d","d"],["\u2569","d","d",null,"d"]])g(e,t,r,o,a);var de=(e,t,r,o,a)=>R(e,[{cx:t,cy:r,from:o,kind:"arc",rx:.5,ry:.5,to:a,weight:X.light}]);de("\u256D",1,1,Math.PI,Math.PI*1.5);de("\u256E",0,1,Math.PI*1.5,Math.PI*2);de("\u2570",1,0,Math.PI*.5,Math.PI);de("\u256F",0,0,0,Math.PI*.5);var ze=new Map,I=(e,t)=>ze.set(e,t);I(".",[U(.5,.78,.12)]);I(":",[U(.5,.36,.12),U(.5,.74,.12)]);I("-",[x(.18,.55,.82,.55)]);I("_",[x(.08,.9,.92,.9)]);I("=",[x(.18,.44,.82,.44),x(.18,.66,.82,.66)]);I("+",[x(.16,.55,.84,.55),x(.5,.33,.5,.77)]);I("*",[x(.5,.3,.5,.72),x(.2,.4,.8,.62),x(.2,.62,.8,.4)]);I("x",[x(.2,.38,.8,.82),x(.2,.82,.8,.38)]);I("o",[{cx:.5,cy:.6,from:0,kind:"arc",rx:.3,ry:.2,to:Math.PI*2,weight:X.light}]);I("#",[x(.38,.22,.3,.86),x(.72,.22,.64,.86),x(.12,.42,.9,.42),x(.1,.66,.88,.66)]);I("/",[x(.18,.88,.82,.12)]);I("\\",[x(.18,.12,.82,.88)]);I("|",[x(.5,.08,.5,.92)]);var He=e=>ue.get(e);var Jt=[...ue.keys(),...ze.keys()],G=e=>Math.round(e*100)/100,Be=e=>{let t=0;for(let[o,[a,c]]of e.entries()){let[n,s]=e[(o+1)%e.length]??[a,c];t+=a*s-n*c}return`${(t<0?[...e].toReversed():e).map(([o,a],c)=>`${c===0?"M":"L"}${G(o)} ${G(a)}`).join("")}Z`},Ue=10,Oe=(e,t)=>{let{x:r,y:o,width:a,height:c}=t,n=l=>r+l*a,s=l=>o+l*c,u="";for(let l of e)switch(l.kind){case"rect":{u+=`M${G(n(l.x))} ${G(s(l.y))}h${G(l.w*a)}v${G(l.h*c)}h${G(-l.w*a)}Z`;break}case"dot":{let d=G(l.r*a);u+=`M${G(n(l.cx)-d)} ${G(s(l.cy))}a${d} ${d} 0 1 1 ${G(2*d)} 0a${d} ${d} 0 1 1 ${G(-2*d)} 0Z`;break}case"line":{let d=n(l.x1),h=s(l.y1),v=n(l.x2),b=s(l.y2),E=Math.hypot(v-d,b-h)||1,L=l.weight*a/2,w=(b-h)/E*L,C=-(v-d)/E*L;u+=Be([[d+w,h+C],[v+w,b+C],[v-w,b-C],[d-w,h-C]]);break}case"arc":{let d=l.weight*a/2,h=[],v=[];for(let b=0;b<=Ue;b+=1){let E=l.from+(l.to-l.from)*b/Ue,L=Math.cos(E),w=Math.sin(E),C=n(l.cx)+L*l.rx*a,D=s(l.cy)+w*l.ry*c;h.push([C+L*d,D+w*d]),v.push([C-L*d,D-w*d])}u+=Be([...h,...v.toReversed()]);break}default:return l}return u};var K=32,yt=24,xt=(e,t)=>`${e.deviceWidth}x${e.deviceHeight}:${e.fontSize*e.dpr}:${e.font}:${t?t.join(""):"*"}`,O=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>{for(let e of O.values())e.redraw()});var gt=(e,t,r,o,a,c)=>{let n=Math.max(1,Math.round(t.weight*a)),s=Math.floor(n/2);if(t.x1===t.x2){let u=r+Math.floor(t.x1*a),l=o+Math.round(Math.min(t.y1,t.y2)*c),d=o+Math.round(Math.max(t.y1,t.y2)*c);return e.fillRect(u-s,l,n,Math.max(1,d-l)),!0}if(t.y1===t.y2){let u=o+Math.floor(t.y1*c),l=r+Math.round(Math.min(t.x1,t.x2)*a),d=r+Math.round(Math.max(t.x1,t.x2)*a);return e.fillRect(l,u-s,Math.max(1,d-l),n),!0}return!1},At=(e,t,r,o,a,c)=>{for(let n of t){if(n.kind==="rect"){let s=Math.round(r+n.x*a),u=Math.round(o+n.y*c),l=Math.round(r+(n.x+n.w)*a),d=Math.round(o+(n.y+n.h)*c);l>s&&d>u&&e.fillRect(s,u,l-s,d-u);continue}if(!(n.kind==="line"&&gt(e,n,r,o,a,c))){if(n.kind==="dot"){let s=Math.max(.5,n.r*a);e.beginPath(),e.arc(r+n.cx*a,o+n.cy*c,s,0,Math.PI*2),e.fill();continue}e.fill(new Path2D(Oe([n],{height:c,width:a,x:r,y:o})))}}},Et=(e,t,r,o,a,c)=>{let n=a/2,s=c/4,u=Math.max(1,Math.round(Math.min(n,s)*.55));for(let[l,d]of le.entries())for(let[h,v]of d.entries()){if((t&v)===0)continue;let b=r+Math.round(h*n+(n-u)/2),E=o+Math.round(l*s+(s-u)/2);u<4?e.fillRect(b,E,u,u):(e.beginPath(),e.arc(b+u/2,E+u/2,u/2,0,Math.PI*2),e.fill())}},Rt={"\u2591":(e,t)=>e%2===0&&t%2===0,"\u2592":(e,t)=>(e+t)%2===0,"\u2593":(e,t)=>!(e%2===1&&t%2===1)},Tt=(e,t,r,o,a,c,n)=>{let s=Math.max(1,Math.round(n));for(let u=0;u*s<c;u+=1)for(let l=0;l*s<a;l+=1)t(l,u)&&e.fillRect(r+l*s,o+u*s,s,s)},Ae=class{canvas;metrics;columns=K;glyphs;version=0;dynamic;slots=new Map;coverages=[];context;baseline=0;constructor(t,r,o){this.metrics=t,this.dynamic=o,this.glyphs=[],this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d",{willReadFrequently:!0});for(let a of r)this.slots.has(a)||this.slots.set(a,this.glyphs.length),this.glyphs.push(a);this.redraw()}redraw(){let{deviceWidth:t,deviceHeight:r}=this.metrics,o=Math.max(1,Math.ceil(this.glyphs.length/K)),a=this.dynamic?o+2:o;this.canvas.width=t*K,this.canvas.height=r*a,this.context=this.canvas.getContext("2d",{willReadFrequently:!0});let{context:c}=this;if(!c)return;c.font=`${this.metrics.fontSize*this.metrics.dpr}px ${this.metrics.font}`;let n=c.measureText("Mg"),s=n.fontBoundingBoxAscent||this.metrics.fontSize*this.metrics.dpr*.8,u=n.fontBoundingBoxDescent||this.metrics.fontSize*this.metrics.dpr*.2;this.baseline=Math.round((r-(s+u))/2+s),this.coverages=[];for(let l=0;l<this.glyphs.length;l+=1)this.paint(l);this.version+=1}paint(t){let{context:r}=this,o=this.glyphs[t];if(!r||o===void 0)return;let{deviceWidth:a,deviceHeight:c,dpr:n}=this.metrics,[s,u]=this.slotOrigin(t);r.clearRect(s,u,a,c),r.save(),r.beginPath(),r.rect(s,u,a,c),r.clip(),r.fillStyle="#fff";let l=o.codePointAt(0)??0,d=Rt[o],h=He(o);if(l>=10240&&l<=10495&&o.length===1)Et(r,l-10240,s,u,a,c);else if(d)Tt(r,d,s,u,a,c,n);else if(h)At(r,h,s,u,a,c);else if(o.trim()!==""){r.font=`${this.metrics.fontSize*n}px ${this.metrics.font}`,r.textAlign="center",r.textBaseline="alphabetic";let v=r.measureText(o).width,b=v>a*1.05?a/v:1;r.translate(s+a/2,u+this.baseline),r.scale(b,1),r.fillText(o,0,0)}r.restore(),this.coverages[t]=this.measure(s,u,a,c)}measure(t,r,o,a){let{context:c}=this;if(!c)return 0;let{data:n}=c.getImageData(t,r,o,a),s=0;for(let u=3;u<n.length;u+=4)s+=n[u]??0;return s/(o*a*255)}slot(t){let r=this.slots.get(t);if(r!==void 0)return r;if(!this.dynamic)return-1;let o=this.glyphs.length;return this.slots.set(t,o),this.glyphs.push(t),Math.ceil(this.glyphs.length/K)*this.metrics.deviceHeight>this.canvas.height?this.redraw():(this.paint(o),this.version+=1),o}slotOrigin(t){return[t%K*this.metrics.deviceWidth,Math.floor(t/K)*this.metrics.deviceHeight]}coverage(t){let r=this.slots.get(t);return r===void 0?0:this.coverages[r]??0}slotCoverage(t){return this.coverages[t]??0}drawGlyph(t,r,o,a,c=this.metrics.deviceWidth,n=this.metrics.deviceHeight){let s=this.slot(r);if(s<0)return;let[u,l]=this.slotOrigin(s);t.drawImage(this.canvas,u,l,this.metrics.deviceWidth,this.metrics.deviceHeight,o,a,c,n)}},$e=({metrics:e,glyphs:t,dynamic:r=!1})=>{let o=xt(e,r?null:t),a=O.get(o);if(a){if(O.delete(o),O.set(o,a),r)for(let n of t)a.slot(n);return a}let c=new Ae(e,t,r);if(O.set(o,c),O.size>yt){let n=O.keys().next().value;n!==void 0&&O.delete(n)}return c},Ct=(e,t,r=.6)=>{let o=new Float32Array(Math.max(t,0));if(t<2)return o;let a=e(0),n=e(t-1)-a,s=1/(t-1),u=0;for(let d=0;d<t;d+=1){let h=d*s,v=n>1e-4?(e(d)-a)/n:h,b=h+(Math.min(1,Math.max(0,v))-h)*r,E=d===0?0:u+s*.15;u=d===t-1?1:Math.max(b,E),o[d]=u}if((o[t-2]??0)>=1)for(let d=1;d<t-1;d+=1)o[d]=d*s;return o};var We=(e,t)=>Ct(r=>e.slotCoverage(r),t);var qe=/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,St=/^[ \t]*#/m,wt=/^\s*(?:(?:lowp|mediump|highp|const|uniform)\s+)*struct\b/,Lt=/^\s*precision\b/,Mt=/\d+\.\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?|\d+(?:[eE][-+]?\d+)?|[A-Za-z_]\w*|\+\+|--|<=|>=|==|!=|&&|\|\||\^\^|[-+*/]=|\S/g,fe=e=>{let t=e.replaceAll(qe," "),r=[],o=0,a=0,c=n=>{let s=t.slice(a,n).trim();a=n,s!==""&&r.push(s)};for(let n=0;n<t.length;n+=1){let s=t[n];s==="{"?o+=1:s==="}"?(o-=1,o===0&&!wt.test(t.slice(a,n))&&c(n+1)):s===";"&&o===0&&c(n+1)}return c(t.length),r},Ve=e=>e.match(Mt)?.join(" ")??"",Xe=e=>St.test(e.replaceAll(qe," ")),Ft=(e,t)=>{if(Xe(e)||Xe(t))return t;let r=new Set(fe(e).map(Ve));return fe(t).filter(o=>Lt.test(o)||!r.has(Ve(o))).join(`
`)},kt=`
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
`,It=`
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
`,Dt=`
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
`,Ye=({field:e,colorField:t,uniforms:r})=>{let o=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
${It}
${r}
${kt}
${Dt}
`,a="";if(t!==void 0){let u=Ft(e,t);a=fe(u).length<fe(t).length?u:t}let c=o.split(`
`).length-1,n=c+e.split(`
`).length,s=`${o}${e}
${a}
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
`;return{colorLine:n,fieldLine:c,source:s}},oe=`#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,je=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;var Ke=`#version 300 es
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
`,Ze=`#version 300 es
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
`,Qe=`#version 300 es
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
`,Je=`#version 300 es
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
`,Gt=/ERROR:\s*\d+:(\d+):\s*(.*)/g,et=({log:e,field:t,colorField:r,fieldLine:o,colorLine:a})=>{let c=[];for(let n of e.matchAll(Gt)){let s=Number(n[1]),u=n[2]??"";if(r!==void 0&&s>a){let l=s-a;c.push(`colorField line ${l}: ${u}
  > ${(r.split(`
`)[l-1]??"").trim()}`)}else if(s>o){let l=s-o;c.push(`field line ${l}: ${u}
  > ${(t.split(`
`)[l-1]??"").trim()}`)}else c.push(`engine line ${s}: ${u}`)}return c.length>0?c.join(`
`):e};var Pt=/^[A-Za-z][A-Za-z0-9_]*$/,Nt={1:"float",2:"vec2",3:"vec3",4:"vec4"},Bt=e=>typeof e=="number"?1:e.length,Ee=e=>Object.keys(e).toSorted().flatMap(t=>{let r=e[t];return r===void 0?[]:!Pt.test(t)||t.startsWith("u_")||t.startsWith("ascii_")?(console.error(`[ascii-shader] uniform "${t}" skipped: names must be GLSL identifiers and not start with "u_" or "ascii_"`),[]):[{name:t,size:Bt(r)}]}),ot=()=>({ansi:new Float32Array(48),ansiLab:new Float32Array(48),audio:new Float32Array(4),bloom:0,click:new Float32Array([.5,.5,1e3]),colorMode:0,curvature:0,delta:0,edgeThreshold:.22,flicker:0,frame:0,glitch:0,grade:new Float32Array([0,1,1,1]),ink:new Float32Array([1,1,1]),interaction:0,invert:!1,levels:0,paper:new Float32Array([0,0,0,1]),pointer:new Float32Array([.5,.5,0]),pointerVelocity:new Float32Array(2),scanlines:0,seed:0,stopCount:1,stops:new Float32Array(24),threshold:.5,time:0,uniforms:{},vignette:0}),tt=e=>{console.error(`[ascii-shader] ${e}`)},rt=(e,t,r)=>{let o=e.createShader(t);return o?(e.shaderSource(o,r),e.compileShader(o),o):null},ne=(e,t,r,o=a=>a)=>{let a=rt(e,e.VERTEX_SHADER,t),c=rt(e,e.FRAGMENT_SHADER,r),n=e.createProgram();if(!(a&&c&&n))return null;if(e.attachShader(n,a),e.attachShader(n,c),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){if(!e.isContextLost()){let s=e.getShaderInfoLog(c)||e.getShaderInfoLog(a)||e.getProgramInfoLog(n)||"";tt(`shader failed to compile
${o(s)}`),(s.includes("already has a body")||s.includes("redefinition"))&&tt("a function is defined twice. `field` and `colorField` compile into one shader: give helpers different names, or define a shared helper once, in `field`, and call it from both.")}return e.deleteShader(a),e.deleteShader(c),e.deleteProgram(n),null}return e.deleteShader(a),e.deleteShader(c),n},ie=(e,t,r)=>{let o={};for(let a of r)o[a]=e.getUniformLocation(t,a);return o},P=(e,t)=>{let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r},Ut=["u_field","u_positions","u_thresholds","u_coverage","u_cells","u_grid","u_kind","u_count","u_calibrated","u_dither","u_matrixSize","u_steps","u_grade","u_invert","u_threshold","u_edgeThreshold","u_colorMode","u_hasColor","u_ink","u_ansi","u_ansiLab","u_stops","u_stopCount","u_glitch","u_glitchSeed"],zt=["u_cellGlyph","u_cellColor","u_atlas","u_bloom","u_cells","u_cellSize","u_canvas","u_atlasColumns","u_paper","u_fx","u_fx2","u_glitchRows"],Ht=["u_source","u_glyph","u_step","u_fromCells","u_size"],Ot=["u_previous","u_size","u_pointer","u_decay","u_strength"],$t=["u_resolution","u_time","u_seed","u_pointer","u_pointerVelocity","u_click","u_audio","u_palette","u_paletteSize","ascii_samples","ascii_levels","ascii_interaction","ascii_trail"],Z=(e,t)=>{let r=Math.sin(e*12.9898+t*78.233)*43758.5453;return r-Math.floor(r)},Re=e=>{let t=e.getExtension("EXT_color_buffer_float")!==null,r=ne(e,oe,Ke),o=ne(e,oe,Ze),a=ne(e,oe,Qe),c=ne(e,oe,Je);if(!(r&&o&&a&&c))return null;let n=ie(e,r,Ut),s=ie(e,o,zt),u=ie(e,a,Ht),l=ie(e,c,Ot),d=e.createVertexArray();e.bindVertexArray(d);let h=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,h),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.pixelStorei(e.UNPACK_ALIGNMENT,1);let v=P(e,e.NEAREST),b=P(e,e.LINEAR),E=P(e,e.LINEAR),L=P(e,e.LINEAR),w=P(e,e.LINEAR),C=[P(e,e.LINEAR),P(e,e.LINEAR)],D=P(e,e.NEAREST),$=P(e,e.NEAREST),_=P(e,e.NEAREST),N=P(e,e.NEAREST),H=P(e,e.NEAREST),q=e.createFramebuffer(),W=e.createFramebuffer(),Q=e.createFramebuffer(),J=e.createFramebuffer(),he=[e.createFramebuffer(),e.createFramebuffer()],ae=(i,f)=>{e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0)},V=null,Ce=2,Se=1,we=1,Le=!1,B={count:2,grid:[1,1],kind:0,positions:null},Me=32,Fe=-1,ee=null,y=0,A=0,te=0,re=0,pe=1,Y=0,ke=!1,be=null,ve=(i,f,p,m,T,F)=>{e.bindTexture(e.TEXTURE_2D,i),e.texImage2D(e.TEXTURE_2D,0,m,f,p,0,T,F,null)},Ie=i=>{e.bindTexture(e.TEXTURE_2D,H),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i.canvas);let f=new Float32Array(Math.max(1,i.glyphs.length));for(let p=0;p<i.glyphs.length;p+=1)f[p]=i.slotCoverage(p);e.bindTexture(e.TEXTURE_2D,N),e.texImage2D(e.TEXTURE_2D,0,e.R32F,f.length,1,0,e.RED,e.FLOAT,f),Me=i.columns,Fe=i.version},M=(i,f)=>{e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,f)},lt=(i,f)=>{for(let p of i.custom){let m=f[p.name];m!==void 0&&(typeof m=="number"?e.uniform1f(p.location,m):m.length===2?e.uniform2f(p.location,m[0],m[1]):m.length===3?e.uniform3f(p.location,m[0],m[1],m[2]):e.uniform4f(p.location,m[0],m[1],m[2],m[3]))}},ct=i=>{let f=C[Y];Y=1-Y;let p=C[Y];if(f&&p){e.useProgram(c),e.bindFramebuffer(e.FRAMEBUFFER,he[Y]??null),e.viewport(0,0,y,A),M(0,f),e.uniform1i(l.u_previous,0),e.uniform2f(l.u_size,y,A),e.uniform3fv(l.u_pointer,i.pointer),e.uniform1f(l.u_decay,Math.exp(-i.delta*2.2));let m=Math.hypot(i.pointerVelocity[0]??0,i.pointerVelocity[1]??0);e.uniform1f(l.u_strength,Math.min(.9,.08+m*1.6)*Math.min(1,i.delta*30)),e.drawArrays(e.TRIANGLES,0,3)}},ut=(i,f,p,m)=>{e.useProgram(i.program),e.bindFramebuffer(e.FRAMEBUFFER,q),e.viewport(0,0,p,m),M(0,D),e.uniform1i(i.at.u_palette,0),M(1,C[Y]??C[0]??D),e.uniform1i(i.at.ascii_trail,1),e.uniform1f(i.at.u_paletteSize,Ce),e.uniform2f(i.at.u_resolution,m*te/Math.max(1,re),m),e.uniform2f(i.at.ascii_samples,p,m),e.uniform1f(i.at.u_time,f.time),e.uniform1f(i.at.u_seed,f.seed),e.uniform3fv(i.at.u_pointer,f.pointer),e.uniform2fv(i.at.u_pointerVelocity,f.pointerVelocity),e.uniform3fv(i.at.u_click,f.click),e.uniform4fv(i.at.u_audio,f.audio),e.uniform1f(i.at.ascii_levels,f.levels),e.uniform1f(i.at.ascii_interaction,f.interaction),lt(i,f.uniforms),e.drawArrays(e.TRIANGLES,0,3)},dt=(i,f)=>{let[p,m]=B.grid;e.useProgram(r),e.bindFramebuffer(e.FRAMEBUFFER,W),e.viewport(0,0,y,A),M(0,v),e.uniform1i(n.u_field,0),M(1,_),e.uniform1i(n.u_positions,1),M(2,$),e.uniform1i(n.u_thresholds,2),M(3,N),e.uniform1i(n.u_coverage,3),e.uniform2i(n.u_cells,y,A),e.uniform2i(n.u_grid,p,m),e.uniform1i(n.u_kind,B.kind),e.uniform1i(n.u_count,B.count),e.uniform1i(n.u_calibrated,B.positions?1:0),e.uniform1i(n.u_dither,Le?1:0),e.uniform1i(n.u_matrixSize,Se),e.uniform1f(n.u_steps,we),e.uniform4fv(n.u_grade,i.grade),e.uniform1i(n.u_invert,i.invert?1:0),e.uniform1f(n.u_threshold,i.threshold),e.uniform1f(n.u_edgeThreshold,i.edgeThreshold),e.uniform1i(n.u_colorMode,i.colorMode),e.uniform1i(n.u_hasColor,ke?1:0),e.uniform3fv(n.u_ink,i.ink),e.uniform3fv(n.u_ansi,i.ansi),e.uniform3fv(n.u_ansiLab,i.ansiLab),e.uniform3fv(n.u_stops,i.stops),e.uniform1i(n.u_stopCount,i.stopCount),e.uniform1f(n.u_glitch,f),e.uniform1f(n.u_glitchSeed,Z(i.frame,2)*100),e.drawArrays(e.TRIANGLES,0,3)},ft=()=>{e.useProgram(a),e.uniform2f(u.u_size,y,A),e.bindFramebuffer(e.FRAMEBUFFER,Q),M(0,E),e.uniform1i(u.u_source,0),M(1,b),e.uniform1i(u.u_glyph,1),e.uniform1i(u.u_fromCells,1),e.uniform2f(u.u_step,1/y,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,J),M(0,L),e.uniform1i(u.u_fromCells,0),e.uniform2f(u.u_step,0,.6/A),e.drawArrays(e.TRIANGLES,0,3)},mt=(i,f,p)=>{e.useProgram(o),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,te,re),M(0,b),e.uniform1i(s.u_cellGlyph,0),M(1,E),e.uniform1i(s.u_cellColor,1),M(2,H),e.uniform1i(s.u_atlas,2),M(3,w),e.uniform1i(s.u_bloom,3),e.uniform2i(s.u_cells,y,A),e.uniform2i(s.u_cellSize,p.deviceWidth,p.deviceHeight),e.uniform2f(s.u_canvas,te,re),e.uniform1i(s.u_atlasColumns,Me),e.uniform4fv(s.u_paper,i.paper),e.uniform4f(s.u_fx,i.scanlines,i.bloom,i.curvature,f);let m=i.flicker>0?1-i.flicker*.22*Z(i.frame,3):1;if(e.uniform4f(s.u_fx2,m,i.vignette,pe,i.time),f>0){let T=Math.floor(Z(i.frame,4)*A),F=1+Math.floor(Z(i.frame,5)*3*i.glitch),k=Math.round((Z(i.frame,6)-.5)*8*i.glitch);e.uniform4f(s.u_glitchRows,T,T+F,k,0)}else e.uniform4f(s.u_glitchRows,-1,-1,0,0);e.drawArrays(e.TRIANGLES,0,3)},De={dispose:()=>{for(let i of[v,b,E,L,w,...C,D,$,_,N,H])e.deleteTexture(i);for(let i of[q,W,Q,J,...he])e.deleteFramebuffer(i);e.deleteBuffer(h),e.deleteVertexArray(d);for(let i of[r,o,a,c])e.deleteProgram(i);V&&e.deleteProgram(V.program)},draw:i=>{if(!V||y===0||A===0||!ee)return;ee.version!==Fe&&Ie(ee);let[f,p]=B.grid;e.bindVertexArray(d),e.disable(e.BLEND),i.interaction===3&&ct(i),ut(V,i,y*f,A*p);let m=i.glitch>0&&Z(Math.floor(i.frame/3),1)<i.glitch*.3?i.glitch:0;dt(i,m),i.bloom>0&&ft(),mt(i,m,ee.metrics)},readCells:()=>{if(y===0||A===0)return null;let i=y*A;be?.slots.length!==i&&(be={colors:new Uint8Array(i*4),raw:new Uint8Array(i*4),slots:new Uint16Array(i)});let{raw:f,slots:p,colors:m}=be;e.bindFramebuffer(e.READ_FRAMEBUFFER,W),e.readBuffer(e.COLOR_ATTACHMENT0),e.readPixels(0,0,y,A,e.RGBA,e.UNSIGNED_BYTE,f);for(let T=0;T<A;T+=1){let F=(A-1-T)*y;for(let k=0;k<y;k+=1){let se=(F+k)*4;p[T*y+k]=(f[se]??0)+256*(f[se+1]??0)}}e.readBuffer(e.COLOR_ATTACHMENT1),e.readPixels(0,0,y,A,e.RGBA,e.UNSIGNED_BYTE,f);for(let T=0;T<A;T+=1)m.set(f.subarray((A-1-T)*y*4,(A-T)*y*4),T*y*4);return e.bindFramebuffer(e.READ_FRAMEBUFFER,null),{colors:m,columns:y,rows:A,slots:p}},resize:i=>{({columns:y,rows:A,canvasWidth:te,canvasHeight:re,dpr:pe}=i);let[f,p]=B.grid;t?ve(v,y*f,A*p,e.RGBA16F,e.RGBA,e.HALF_FLOAT):ve(v,y*f,A*p,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE),ae(q,v);for(let m of[b,E,L,w,...C])ve(m,y,A,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE);e.bindFramebuffer(e.FRAMEBUFFER,W),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,b,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,E,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),ae(Q,L),ae(J,w);for(let[m,T]of he.entries()){let F=C[m];F&&(ae(T,F),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT))}e.bindFramebuffer(e.FRAMEBUFFER,null)},setAtlas:(i,f)=>{let p=f.grid[0]!==B.grid[0]||f.grid[1]!==B.grid[1];B=f,ee=i,Ie(i);let m=f.positions??new Float32Array([0]);e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.R32F,m.length,1,0,e.RED,e.FLOAT,m),p&&y>0&&De.resize({canvasHeight:re,canvasWidth:te,columns:y,dpr:pe,rows:A})},setField:({field:i,colorField:f,specs:p})=>{let m=p.map(({name:k,size:se})=>`uniform ${Nt[se]} ${k};`).join(`
`),T=Ye({colorField:f,field:i,uniforms:m}),F=ne(e,je,T.source,k=>et({colorField:f,colorLine:T.colorLine,field:i,fieldLine:T.fieldLine,log:k}));return F?(V&&e.deleteProgram(V.program),V={at:ie(e,F,$t),custom:p.map(k=>({...k,location:e.getUniformLocation(F,k.name)})),program:F},ke=f!==void 0,!0):!1},setMatrix:i=>{Le=i!==null,i&&(e.bindTexture(e.TEXTURE_2D,$),e.texImage2D(e.TEXTURE_2D,0,e.R8,i.size,i.size,0,e.RED,e.UNSIGNED_BYTE,i.ranks),Se=i.size,we=i.steps)},setPalette:i=>{let f=new Uint8Array(i.length*4);for(let[p,m]of i.entries())f.set(m.map(T=>Math.round(T*255)),p*4);e.bindTexture(e.TEXTURE_2D,D),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i.length,1,0,e.RGBA,e.UNSIGNED_BYTE,f),Ce=i.length}};return De};var Wt='ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',me=null,Te=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>Te.clear());var Vt=e=>{let t=Te.get(e);if(t!==void 0)return t;if(typeof document>"u"||(me??=document.createElement("canvas").getContext("2d"),!me))return .6;me.font=`100px ${e}`;let r=me.measureText("M").width/100,o=Number.isFinite(r)&&r>.3&&r<1.2?r:.6;return Te.set(e,o),o},nt=({cell:e=12,font:t=Wt,dpr:r=typeof window>"u"?1:window.devicePixelRatio||1,square:o=!1}={})=>{let a=Math.max(2,e),c=a/1.2,n=o?a:c*Vt(t),s=Math.max(1,Math.round(a*r)),u=Math.max(1,Math.round(n*r));return{deviceHeight:s,deviceWidth:u,dpr:r,font:t,fontSize:c,height:s/r,width:u/r}},it=(e,t,r)=>({columns:Math.max(1,Math.ceil(t/e.width)),rows:Math.max(1,Math.ceil(r/e.height))});var at=e=>e.replace("#","").match(/../g).map(t=>parseInt(t,16)/255);function st(e,t){let{field:r,colorField:o,uniforms:a,paper:c,charset:n}=t,s=t.palette?.map(_=>[...at(_),1]),u=e.getContext("webgl2",{alpha:!1,antialias:!1});if(!u)return null;let l=Re(u);if(!l)return null;if(!l.setField({field:r,colorField:o,specs:Ee(a)}))return l.dispose(),null;let d=xe(n),h=ot();h.colorMode=1,h.paper.set([...at(c),1]),h.uniforms=a,h.time=12,s&&(h.stopCount=s.length,s.forEach((_,N)=>h.stops.set(_.slice(0,3),N*3))),e.dataset.scene=t.name,e.dataset.charset=n,l.setMatrix(null),s&&l.setPalette(s);let v=!1,b=0,E,L=!0,w,C=!1;function D(){if(!C){if(L||w!==window.devicePixelRatio){w=window.devicePixelRatio;let _=e.clientWidth,N=e.clientHeight,H=Math.min(w||1,2),q=nt({cell:t.cell??7,dpr:H,square:!0}),W=$e({glyphs:d.glyphs,metrics:q});l.setAtlas(W,{kind:0,count:d.glyphs.length,grid:d.grid,positions:We(W,d.glyphs.length)});let{columns:Q,rows:J}=it(q,_,N);e.width=Math.round(_*H),e.height=Math.round(N*H),l.resize({columns:Q,rows:J,canvasWidth:e.width,canvasHeight:e.height,dpr:H}),L=!1}h.frame+=1,l.draw(h),e.dataset.ready="true"}}function $(_){(E===void 0||_-E>=32)&&(h.delta=E===void 0?0:(_-E)/1e3,h.time+=h.delta,E=_,D()),b=requestAnimationFrame($)}return new ResizeObserver(()=>{L=!0,!v&&e.clientWidth&&e.clientHeight&&D()}).observe(e),e.addEventListener("webglcontextlost",_=>{_.preventDefault(),cancelAnimationFrame(b),b=0,C=!0,delete e.dataset.ready}),e.addEventListener("webglcontextrestored",()=>{if(l=Re(u),!l?.setField({field:r,colorField:o,specs:Ee(a)})){l?.dispose();return}C=!1,l.setMatrix(null),s&&l.setPalette(s),L=!0,E=void 0,D(),v&&(b=requestAnimationFrame($))}),D(),{setRunning(_){v=_,_&&!b&&!C&&(b=requestAnimationFrame($)),_||(cancelAnimationFrame(b),b=0,E=void 0)},capture(){let _=l.readCells();return _?{columns:_.columns,rows:_.rows,glyphs:Array.from(_.slots,N=>d.glyphs[N]??" "),colors:Array.from(_.colors)}:null}}}function pr(e){return st(e,{name:"black-hole",field:Pe,colorField:Ne,uniforms:{bhBeaming:2.5,bhCellRows:1,bhOnLight:0,bhOuter:10,bhPacked:0,bhScale:.95,bhShowStars:1,bhTilt:8*Math.PI/180,bhWarmTint:1},charset:"standard",cell:9,paper:"#0a1510",palette:["c27a49","ffe1a6"]})}export{pr as createOrbitLandscape};
