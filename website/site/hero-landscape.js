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
var De=`
// The far edge of the floor, where the haze takes over.
const float RW_HORIZON = 0.31;
// Height of the point every trunk leans towards.
const float RW_VANISH = 3.4;

// Set once per sample by redwoodScene and read by every layer.
float rwT;
float rwAspect;
float rwCx;
float rwHalf;
float rwRow;
float rwCol;
vec2 rwSun;

// A stable random value. The engine's hash21 repeats on whole numbers,
// which would tile the trunk rows.
float rwHash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// How much a trunk has narrowed at height y, 1 at the horizon.
float rwScale(float y) {
  return (RW_VANISH - y) / (RW_VANISH - RW_HORIZON);
}

// x in trunk space, where every trunk stands straight.
float rwU(vec2 p) {
  return rwCx + (p.x - rwCx) / rwScale(p.y);
}

// The air: blue-green haze, paler low down in the distance and deeper
// higher up. Sunlight scattered through the leaves lifts it to a soft
// green-gold towards the sun, so the forest is lit, not murky.
vec3 rwHaze(vec2 p) {
  float h = clamp((p.y - RW_HORIZON) / 0.62, 0.0, 1.0);
  vec3 col = mix(vec3(0.3, 0.44, 0.4), vec3(0.12, 0.22, 0.2), h);
  col *= 0.94 + 0.12 * fbm(vec2(p.x * 2.2, p.y * 1.4) + 21.0);
  vec2 g = (p - rwSun) * vec2(0.6, 0.85);
  col = mix(col, vec3(0.6, 0.66, 0.38), exp(-dot(g, g) * 4.0) * 0.6);
  float warm = exp(-length((p - rwSun) * vec2(0.7, 1.0)) * 5.0);
  return mix(col, vec3(0.92, 0.82, 0.52), warm * 0.6);
}

// The sun's halo: a hot core and a wide soft bloom.
float rwGlow(vec2 p) {
  // Smaller on narrow boxes, where the same halo would fill the width.
  float d = length((p - rwSun) * vec2(0.8, 1.0)) / mix(0.6, 1.0, smoothstep(0.6, 1.4, rwAspect));
  return 0.9 * exp(-d / 0.022) + 0.22 * exp(-d / 0.09);
}

// One shaft: a soft band across the light, brightest down its middle.
float rwBeam(float q, float at, float width) {
  float k = (q - at) / width;
  return exp(-k * k);
}

// Four shafts of light falling steeply from the opening in the canopy,
// upper right, slanting a little to the left and widening as they fall.
// Each breathes on its own slow cycle. They stay on the sun's side, so the
// middle of the box is calm air for a headline.
float rwShaft(vec2 p) {
  float drop = rwSun.y + 0.06 - p.y;
  if (drop < 0.0) {
    return 0.0;
  }
  float wide = smoothstep(0.6, 1.4, rwAspect);
  float slope = mix(0.08, 0.16, wide);
  // Position across the shafts, measured where they leave the canopy.
  float q = (p.x - rwSun.x + drop * slope) / (1.0 + 0.6 * drop);
  float unit = min(rwAspect, 1.0);
  float b = rwBeam(q, -0.17 * unit, 0.042 * unit) * (0.55 + 0.15 * sin(rwT * 0.19 + 1.0));
  b += rwBeam(q, -0.07 * unit, 0.03 * unit) * (0.8 + 0.2 * sin(rwT * 0.23 + 2.0));
  b += rwBeam(q, 0.03 * unit, 0.05 * unit) * (0.9 + 0.1 * sin(rwT * 0.16 + 4.0));
  b += rwBeam(q, 0.13 * unit, 0.03 * unit) * (0.65 + 0.2 * sin(rwT * 0.27 + 3.0));
  // Leaves between the sun and the air break each shaft into pieces, so
  // the light falls dappled, never as a clean bar.
  float dapple = fbm(vec2(q * 38.0, drop * 7.0) + vec2(3.0, -rwT * 0.008));
  b *= smoothstep(0.36, 0.6, dapple);
  // Brightest just under the canopy, thinning into the haze as they fall.
  // Even along their length, so no shaft reads as a bright bar that stops.
  // On narrow boxes they fall shorter, so they end above the headline.
  float reach = mix(0.4, 0.9, wide);
  return b * smoothstep(0.0, 0.35, drop) * mix(0.8, 0.5, smoothstep(0.2, 0.9, drop)) * (1.0 - smoothstep(reach * 0.6, reach, drop)) * mix(0.5, 1.0, wide);
}

// One layer of foliage: clumped masses above "bottom" that hang lower in
// places, with ragged leafy edges. Returns how much of the point is leaf,
// and how deep inside its mass it lies (0 at the fringe, 1 in the heart).
vec2 rwLeaves(vec2 p, float bottom, float scale, float seed) {
  float mass = fbm(p * scale + seed) + (p.y - bottom) * 2.4;
  mass += 0.08 * snoise(p * scale * 8.0 + seed) + 0.05 * snoise(p * scale * 17.0 - seed);
  return vec2(smoothstep(0.5, 0.52, mass), smoothstep(0.52, 0.74, mass));
}

// A foliage layer's colour: dark at the heart of each mass, its fringe
// lifted towards the haze, and gold where the sun backlights it.
vec3 rwLeafColor(vec2 p, vec2 leaf, vec3 heart, float sunD) {
  vec3 fringe = mix(heart, rwHaze(p), 0.45);
  vec3 col = mix(fringe, heart, leaf.y);
  // Sprays of leaves inside each mass catch more or less light.
  float spray = fbm(p * vec2(11.0, 14.0) + heart.g * 40.0);
  col *= mix(0.75, 1.3, smoothstep(0.3, 0.75, spray));
  float back = (1.0 - leaf.y) * exp(-sunD / 0.16);
  return mix(col, vec3(0.86, 0.78, 0.42), back * 0.75);
}

// One row of trunks. Trunk space is cut into slots, each holding at most
// one trunk; a trunk leans a little, so its neighbours' slots are checked
// too. Widths are skewed: many thin trunks and a few broad ones. Slots
// within "clear" of the middle stay empty, for the headline.
vec4 rwTrunks(vec2 p, float spacing, float wMin, float wMax, float base, float seed, float chance, vec3 bark, float clear) {
  float u = rwU(p);
  float id0 = floor(u / spacing);
  vec4 best = vec4(0.0);
  for (int i = -1; i <= 1; i++) {
    float id = id0 + float(i);
    if (rwHash(vec2(id, seed)) > chance) {
      continue;
    }
    float uc = (id + 0.2 + 0.6 * rwHash(vec2(id, seed + 1.0))) * spacing;
    if (abs(uc - rwCx) < clear) {
      continue;
    }
    float hw = mix(wMin, wMax, pow(rwHash(vec2(id, seed + 2.0)), 2.2));
    float b = base + 0.04 * (rwHash(vec2(id, seed + 3.0)) - 0.5) + 0.012 * snoise(vec2(p.x * 40.0, seed));
    if (p.y < b) {
      continue;
    }
    float h = p.y - b;
    // Every trunk has its own lean, a slight bow, and its own taper: some
    // narrow fast, some barely at all.
    float lean = (rwHash(vec2(id, seed + 4.0)) - 0.5) * 0.14;
    float bow = (rwHash(vec2(id, seed + 5.0)) - 0.5) * 0.05 * sin(h * 3.0);
    float taper = mix(0.5, 0.95, rwHash(vec2(id, seed + 6.0)));
    float w = hw * (1.0 + 0.4 * exp(-h / 0.04)) * mix(1.0, taper, smoothstep(b, 1.0, p.y));
    // The girth swells and narrows a little along the height.
    w *= 1.0 + 0.14 * snoise(vec2(p.y * 4.0, id * 1.7 + seed));
    float x = (u - uc - lean * h - bow) / w;
    // Bark noise breaks each edge on its own, so neither side is a ruled line.
    x += 0.12 * snoise(vec2(p.y * 7.0, id * 3.1 + seed));
    x += sign(x) * 0.16 * snoise(vec2(p.y * 19.0, id * 2.3 + seed + step(0.0, x) * 7.0));
    float soft = rwCol / (w * rwScale(p.y));
    float cover = 1.0 - smoothstep(1.0 - soft, 1.0 + soft * 0.5, abs(x));
    if (cover <= best.a) {
      continue;
    }
    float side = sign(rwSun.x - p.x);
    float lit = smoothstep(-0.5, 1.0, x * side);
    float furrow = snoise(vec2(x * 3.0 + id * 7.3, p.y * 2.0 + id));
    vec3 col = bark * mix(0.4, 1.5, lit) * (0.78 + 0.3 * furrow);
    // Patches of moss and shade up the trunk, so no trunk is one flat tone.
    col *= 0.78 + 0.4 * fbm(vec2(id * 3.7 + seed, p.y * 3.5));
    // A faint warm edge only: strong rims belong to the giants in front.
    col = mix(col, vec3(0.7, 0.52, 0.32), smoothstep(0.75, 0.98, x * side) * 0.22);
    best = vec4(col, cover);
  }
  return best;
}

// Ground mist drifting slowly between the far trunks.
float rwMist(vec2 p) {
  float band = smoothstep(0.2, 0.3, p.y) * (1.0 - smoothstep(0.38, 0.56, p.y));
  float n = fbm(vec2(p.x * 1.4 - rwT * 0.011, p.y * 5.0 + 3.0));
  return band * smoothstep(0.38, 0.72, n) * rwMistOn;
}

// The fern floor seen in perspective: clumps get smaller and hazier
// towards the horizon, and the shafts land on it as warm pools.
vec3 rwFloor(vec2 p, float shaft) {
  float dy = max(RW_HORIZON - p.y, 0.004);
  float z = 0.1 / dy;
  vec2 g = vec2((p.x - rwCx) * z * 3.2, z * 2.4);
  float clump = fbm(g * 0.9 + 5.0);
  float frond = 0.5 + 0.5 * snoise(g * vec2(3.6, 2.4) + 9.0);
  float leaf = smoothstep(0.35, 0.75, clump) * mix(0.6, 1.0, frond);
  vec3 shade = vec3(0.06, 0.12, 0.07);
  vec3 fern = vec3(0.24, 0.42, 0.17);
  vec3 col = mix(shade, fern, leaf);
  vec3 sunlit = vec3(0.86, 0.82, 0.36);
  col = mix(col, sunlit * mix(0.6, 1.0, leaf), clamp(shaft * 1.6, 0.0, 1.0) * mix(0.5, 0.95, leaf));
  float far = smoothstep(0.05, RW_HORIZON, p.y);
  return mix(col, rwHaze(vec2(p.x, RW_HORIZON)) * 0.85, far * far * 0.75);
}

// The giants in front: hand placed so the middle stays open for a
// headline, and narrowed on tall boxes so they never fill a phone.
vec4 rwGiant(vec2 p, float at, float hw, float base, float seed, float lean) {
  // A slight bow as well as the lean, so no trunk is a ruled line.
  float u = rwU(p) - lean * (p.y - base) - 0.012 * sin((p.y - base) * 2.6 + seed * 1.9);
  float uc = rwCx + at * rwHalf;
  if (p.y < base) {
    return vec4(0.0);
  }
  float w = hw * (1.0 + 0.55 * exp(-(p.y - base) / 0.07));
  // Each trunk tapers at its own rate and swells a little along its height.
  w *= mix(1.0, 0.72 + 0.12 * fract(seed * 0.37), smoothstep(base, 1.0, p.y));
  w *= 1.0 + 0.08 * snoise(vec2(p.y * 3.0, seed * 5.3));
  float x = (u - uc) / w;
  // A ragged outline: bark plates and buttresses break every edge, each
  // side on its own.
  x += 0.07 * snoise(vec2(p.y * 5.0, seed * 7.0));
  x += sign(x) * 0.07 * snoise(vec2(p.y * 21.0, seed * 3.0 + step(0.0, x) * 5.0));
  float soft = rwCol / (w * rwScale(p.y));
  float cover = 1.0 - smoothstep(1.0 - soft, 1.0 + soft * 0.5, abs(x));
  if (cover <= 0.0) {
    return vec4(0.0);
  }
  float side = sign(rwSun.x - uc);
  float facing = x * side;
  // Furrows of uneven width that wander, split and rejoin as they climb.
  float groove = snoise(vec2(x * 4.5 + seed * 5.0, p.y * 0.9 + seed));
  groove += 0.5 * snoise(vec2(x * 9.0 - seed, p.y * 2.3));
  float furrow = smoothstep(-0.5, 0.7, groove);
  float lit = smoothstep(-0.9, 1.0, facing);
  float rim = smoothstep(0.25, 1.0, facing) * mix(0.5, 1.0, furrow);
  vec3 bark = vec3(0.58, 0.26, 0.15);
  // Ridges catch the light and grooves stay in shade; the shadow side
  // sinks to a quiet dark brown.
  vec3 col = bark * mix(0.5, 1.05, furrow) * mix(0.45, 1.0, lit);
  col = mix(col, vec3(0.9, 0.58, 0.32), rim * rim * 0.45);
  return vec4(col, cover);
}

// Fern clumps across the bottom edge, in front of everything: each is a
// fan of arching fronds with saw-toothed leaflets, dark at the heart and
// lighter towards the tips, gold where a shaft reaches them.
vec4 rwFronds(vec2 p, float shaft) {
  if (p.y > 0.34) {
    return vec4(0.0);
  }
  float sp = 0.3;
  float id0 = floor(p.x / sp);
  float best = -1.0;
  vec3 col = vec3(0.0);
  for (int i = -1; i <= 1; i++) {
    float id = id0 + float(i);
    if (rwHash(vec2(id, 60.0)) > 0.85) {
      continue;
    }
    vec2 c = vec2((id + 0.5 + 0.5 * (rwHash(vec2(id, 61.0)) - 0.5)) * sp, -0.04);
    float len = mix(0.22, 0.32, rwHash(vec2(id, 62.0)));
    vec2 d = p - c;
    for (int j = 0; j < 5; j++) {
      float fj = float(j) - 2.0;
      float a = fj * 0.5 + 0.3 * (rwHash(vec2(id, 70.0 + float(j))) - 0.5);
      float l = len * (1.0 - 0.16 * abs(fj));
      float ca = cos(a);
      float sa = sin(a);
      float t = (d.x * sa + d.y * ca) / l;
      if (t < 0.0 || t > 1.0) {
        continue;
      }
      // The spine arches outward and down as it grows.
      float bend = a >= 0.0 ? 1.0 : -1.0;
      float off = (d.x * ca - d.y * sa) - bend * 0.5 * l * t * t;
      float w = l * 0.17 * sin(3.1416 * pow(t, 0.7));
      float saw = fract(t * l / 0.022 + rwHash(vec2(id, float(j))));
      if (abs(off) > w * (0.62 + 0.38 * (1.0 - saw))) {
        continue;
      }
      // The front frond of the clump wins, so overlapping ones stay clear.
      float order = 1.0 - abs(fj) * 0.2 + float(i) * 0.01;
      if (order <= best) {
        continue;
      }
      best = order;
      float v = mix(0.45, 1.0, t) * mix(0.7, 1.0, smoothstep(0.0, 0.4, abs(off) / max(w, 0.001)));
      col = mix(vec3(0.08, 0.17, 0.08), vec3(0.36, 0.56, 0.2), v);
      // A paler midrib down each frond.
      col = mix(col, vec3(0.5, 0.64, 0.3), (1.0 - smoothstep(0.0, 0.18, abs(off) / max(w, 0.001))) * 0.5);
      col = mix(col, vec3(0.84, 0.8, 0.36), clamp(shaft * 1.2, 0.0, 1.0) * t * 0.8);
    }
  }
  return vec4(col, best > -1.0 ? 1.0 : 0.0);
}

// Dust and pollen drifting slowly, seen only where a shaft lights them.
float rwMotes(vec2 p) {
  float sp = 0.055;
  vec2 q = p + vec2(rwT * 0.0045, -rwT * 0.0028);
  q.x += 0.008 * sin(rwT * 0.13 + p.y * 9.0);
  vec2 id = floor(q / sp);
  vec2 f = q - id * sp;
  float h = rwHash(id + u_seed + 31.0);
  if (h > 0.4) {
    return 0.0;
  }
  vec2 c = sp * (0.2 + 0.6 * vec2(rwHash(id + 5.0), rwHash(id + 9.0)));
  vec2 d = (f - c) / vec2(rwCol * 1.2, rwRow * 0.9);
  float twinkle = 0.65 + 0.35 * sin(rwT * (0.5 + h) + h * 40.0);
  return exp(-dot(d, d)) * twinkle * rwMotesOn;
}

// 1 across the headline band (the middle half of the width, 30 to 65% of
// the height), fading out softly around it.
float rwCalm(vec2 uv) {
  float cx = 1.0 - smoothstep(0.16, 0.36, abs(uv.x - 0.5));
  float cy = smoothstep(0.18, 0.36, uv.y) * (1.0 - smoothstep(0.55, 0.82, uv.y));
  return cx * cy;
}

vec2 rwCacheUv = vec2(-1.0);
float rwCacheT = -1.0;
vec4 rwCacheValue = vec4(0.0);

vec4 redwoodScene(vec2 uv, vec2 res, float t) {
  if (uv == rwCacheUv && t == rwCacheT) {
    return rwCacheValue;
  }
  rwT = t;
  rwAspect = res.x / res.y;
  rwCx = rwAspect * 0.5;
  rwHalf = rwCx;
  rwRow = 1.0 / res.y;
  rwCol = rwAspect / max(ascii_samples.x, 1.0);
  // The sun and the opening in the canopy sit upper right on every box,
  // so the middle stays calm for a headline.
  rwSun = vec2(rwAspect * mix(0.64, 0.73, smoothstep(0.6, 1.4, rwAspect)), 0.86);
  vec2 p = vec2(uv.x * rwAspect, uv.y);

  float shaft = rwShaft(p);
  vec3 col;
  if (p.y >= RW_HORIZON) {
    col = rwHaze(p);
  } else {
    col = rwFloor(p, shaft);
  }

  float calm = rwCalm(uv);
  float sunD = length((p - rwSun) * vec2(0.85, 1.0));
  // 0 in the middle of the box, 1 at its sides, where foliage hangs lower.
  float sides = smoothstep(0.18, 0.5, abs(uv.x - 0.5));

  // Many thin far trunks, nearly lost in the haze, then a sparser row.
  vec4 t1 = rwTrunks(p, 0.05, 0.004, 0.012, 0.31, 17.0, 0.75, vec3(0.15, 0.21, 0.21), 0.0);
  col = mix(col, mix(t1.rgb, rwHaze(p), 0.4 + 0.3 * calm), t1.a);
  vec4 t2 = rwTrunks(p, 0.1, 0.006, 0.02, 0.29, 23.0, 0.7, vec3(0.22, 0.22, 0.21), 0.0);
  col = mix(col, mix(t2.rgb, rwHaze(p), 0.36 + 0.3 * calm), t2.a);

  // Soft sprays of far foliage and patches of high mist hide parts of the
  // far trunks, so they never run unbroken from floor to canopy.
  vec2 lu = rwLeaves(p, 0.6 + 0.2 * (1.0 - sides), 4.6, 41.0);
  col = mix(col, mix(vec3(0.12, 0.2, 0.15), rwHaze(p), 0.6), lu.x * 0.85);
  float veil = fbm(vec2(p.x * 2.6 - rwT * 0.008, p.y * 3.2 + 11.0));
  veil = smoothstep(0.48, 0.7, veil) * smoothstep(0.33, 0.45, p.y) * (1.0 - smoothstep(0.62, 0.8, p.y));
  col = mix(col, rwHaze(p) * 1.08, veil * 0.75 * rwMistOn);

  // The far canopy, pale with haze, open only right around the sun.
  vec2 lf = rwLeaves(p, 0.8, 3.2, 3.0);
  lf.x *= 1.0 - 0.9 * exp(-pow(sunD / 0.08, 2.0));
  col = mix(col, rwLeafColor(p, lf, mix(vec3(0.1, 0.18, 0.15), rwHaze(p), 0.45), sunD), lf.x);

  float mist = rwMist(p);
  col = mix(col, rwHaze(p) * 1.15 + vec3(0.1, 0.08, 0.03) * shaft, mist * 0.6);
  // The middle row: trunks of every width from thin to broad.
  vec4 t3 = rwTrunks(p, 0.2, 0.014, 0.045, 0.25, 29.0, 0.75, vec3(0.32, 0.16, 0.1), 0.16 * rwAspect);
  col = mix(col, mix(t3.rgb, rwHaze(p), 0.14), t3.a);
  col = mix(col, rwHaze(p) * 1.1, mist * 0.18 * (1.0 - t3.a * 0.5));
  // The sun shines past the trunks and behind the canopy, so the leaves
  // in front break it up.
  col += vec3(1.0, 0.84, 0.55) * rwGlow(p);

  // The middle canopy, overlapping the far one, with a wider opening.
  vec2 lm = rwLeaves(p, 0.9 - 0.12 * sides, 2.3, 9.0);
  lm.x *= 1.0 - exp(-pow(sunD / 0.14, 2.0));
  col = mix(col, rwLeafColor(p, lm, vec3(0.08, 0.16, 0.1), sunD), lm.x);
  float canopy = max(lf.x * 0.6, lm.x);

  // Shafts scatter warm light into the air under the canopy.
  float air = shaft * (1.0 - 0.8 * canopy) * smoothstep(RW_HORIZON - 0.1, RW_HORIZON + 0.08, p.y);
  // The middle of the box, where a headline sits, stays calm air.
  air *= 1.0 - 0.8 * calm;
  col += vec3(0.82, 0.62, 0.28) * air * 1.1;
  float mote = rwMotes(p) * (0.15 + shaft * 1.2) * (1.0 - canopy) * (1.0 - 0.7 * calm) * step(RW_HORIZON, p.y);
  col = mix(col, vec3(1.0, 0.95, 0.78), clamp(mote, 0.0, 1.0));

  // A soft vignette: the light lives in the middle and the sun's side.
  vec2 v = (p - vec2(mix(rwCx, rwSun.x, 0.4), 0.55)) / vec2(max(rwCx, 0.4) * 1.25, 0.8);
  col *= mix(1.0, 0.8, smoothstep(0.35, 1.15, length(v)));

  // The giants in front, rim lit on the sun's side.
  float squeeze = mix(0.4, 1.0, smoothstep(0.5, 1.4, rwAspect));
  // Two huge trunks frame the view; medium ones stand a little behind,
  // each at its own lean, the farther ones softened by the haze.
  vec4 g = rwGiant(p, -0.84, 0.14 * squeeze, -0.02, 1.0, 0.03);
  vec4 g2 = rwGiant(p, -0.47, 0.065 * squeeze, 0.08, 2.0, -0.025);
  vec4 g3 = rwGiant(p, 0.82, 0.16 * squeeze, -0.04, 3.0, -0.02);
  vec4 g4 = rwGiant(p, 0.6, 0.045 * squeeze, 0.12, 4.0, 0.035);
  vec4 g5 = rwGiant(p, -0.64, 0.032 * squeeze, 0.14, 5.0, -0.04);
  g2.rgb = mix(g2.rgb, rwHaze(p), 0.18);
  g4.rgb = mix(g4.rgb, rwHaze(p), 0.3);
  g5.rgb = mix(g5.rgb, rwHaze(p), 0.34);
  // On narrow boxes the medium trunks would merge into the giants.
  float roomy = smoothstep(0.75, 1.05, rwAspect);
  g2.a *= roomy;
  g4.a *= roomy;
  g5.a *= roomy;
  // Mist drifts across the farther medium trunks and hides parts of them.
  float drift = smoothstep(0.5, 0.72, fbm(vec2(p.x * 3.0 + rwT * 0.006, p.y * 2.4 + 4.0))) * rwMistOn;
  g4.a *= 1.0 - 0.65 * drift;
  g5.a *= 1.0 - 0.65 * drift;
  col = mix(col, g5.rgb + vec3(0.5, 0.36, 0.16) * shaft * 0.5, g5.a);
  col = mix(col, g4.rgb + vec3(0.5, 0.36, 0.16) * shaft * 0.5, g4.a);
  col = mix(col, g2.rgb + vec3(0.5, 0.36, 0.16) * shaft * 0.5, g2.a);
  col = mix(col, g.rgb + vec3(0.5, 0.36, 0.16) * shaft * 0.35, g.a);
  col = mix(col, g3.rgb + vec3(0.5, 0.36, 0.16) * shaft * 0.35, g3.a);

  // The near canopy, darkest, hanging low in sprays at the sides so it
  // overlaps the giants and frames the light.
  vec2 ln = rwLeaves(p, 0.98 - 0.32 * sides, 1.6, 17.0);
  ln.x *= 1.0 - exp(-pow(sunD / 0.24, 2.0));
  // Small gaps let the sky through the near leaves, and the leaves near
  // the top catch light from above, so the corners are never black.
  float gaps = smoothstep(0.52, 0.61, fbm(p * vec2(13.0, 16.0) + 5.0)) * smoothstep(0.68, 0.88, p.y);
  ln.x *= 1.0 - 0.75 * gaps;
  vec3 nearHeart = mix(vec3(0.06, 0.13, 0.08), vec3(0.12, 0.2, 0.1), smoothstep(0.72, 1.0, p.y));
  col = mix(col, rwLeafColor(p, ln, nearHeart, sunD), ln.x);
  col += vec3(0.3, 0.33, 0.17) * gaps * (1.0 - ln.x) * sides;

  vec4 fronds = rwFronds(p, shaft);
  col = mix(col, fronds.rgb, fronds.a);

  col = clamp(col, 0.0, 1.0);
  float lum = dot(col, vec3(0.3, 0.55, 0.15));
  // Dot size follows brightness. The faintest dot starts near tone 0.09,
  // the middle one near 0.32 and the largest near 0.73. Shadow gets the
  // smallest dot or none, the haze small dots, and only the light, its
  // pools and the lit edges reach the large ones.
  float tone = 0.13 * smoothstep(0.02, 0.06, lum) + 0.87 * smoothstep(0.06, 0.8, lum);
  // Small dots in shadow sit close to the paper: darker and greyer, so
  // the shade reads as quiet air rather than a field of dots.
  float quiet = smoothstep(0.03, 0.18, lum);
  vec3 ink = mix(vec3(lum) * 1.3 + vec3(0.01, 0.02, 0.015), col * 1.15, quiet);
  tone *= mix(0.35, 1.0, sqrt(rwIntensity));
  rwCacheUv = uv;
  rwCacheT = t;
  rwCacheValue = vec4(ink * rwIntensity, rwIntensity > 0.0 ? tone : 0.0);
  return rwCacheValue;
}
`,He=`${De}
float field(vec2 uv, vec2 res, float t) {
  return redwoodScene(uv, res, t).a;
}
`,Pe=`${De}
vec3 colorField(vec2 uv, vec2 res, float t) {
  return redwoodScene(uv, res, t).rgb;
}
`;var S=e=>[...e];var le=[[1,8],[2,16],[4,32],[64,128]],mt=e=>String.fromCodePoint(10240+(e&255)),xe=S(" \u2598\u259D\u2580\u2596\u258C\u259E\u259B\u2597\u259A\u2590\u259C\u2584\u2599\u259F\u2588");var Xt=S("-/|\\");var jt=S(" \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"),Yt=S(" \u258F\u258E\u258D\u258C\u258B\u258A\u2589\u2588"),pt=S(" \u2591\u2592\u2593\u2588");var Zt={arc:S("\u25DC\u25E0\u25DD\u25DE\u25E1\u25DF"),bar:S("\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588\u2587\u2586\u2585\u2584\u2583\u2582"),braille:S("\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F"),orbit:S("\u28FE\u28FD\u28FB\u28BF\u287F\u28DF\u28EF\u28F7"),quadrant:S("\u2596\u2598\u259D\u2597"),tick:S("-\\|/")},vt=Array.from({length:256},(e,t)=>mt(t)),ye={blocks:{glyphs:pt,grid:[1,1],id:"blocks",kind:"ramp",label:"ANSI blocks"},braille:{glyphs:vt,grid:[2,4],id:"braille",kind:"braille",label:"Braille 2\xD74"},cp437:{glyphs:S(" \xB7\u2219\u2022\u221F\u2194\u25CB\u25D8\u266A\u266B\u263C\u2195\u203C\xA7\xB6\u2642\u2640\u2660\u2663\u2665\u2666\u25AC\u25BA\u25C4\u25B2\u25BC\u263A\u263B\u25D9\u2591\u2592\u2593\u2588"),grid:[1,1],id:"cp437",kind:"ramp",label:"CP437"},dense:{glyphs:S(" .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"),grid:[1,1],id:"dense",kind:"ramp",label:"Dense 70"},dots:{glyphs:S(" \xB7\u2219\u2022\u2981\u25CF"),grid:[1,1],id:"dots",kind:"ramp",label:"Halftone"},edge:{glyphs:S(" .:-=+*#%@"),grid:[1,1],id:"edge",kind:"edge",label:"Sobel edges"},katakana:{glyphs:S(" \xB7:=+\uFF70\uFF7C\uFF82\uFF7F\uFF9D\uFF90\uFF8A\uFF91\uFF92\uFF93\uFF94\uFF95\uFF97\uFF98\uFF9C\uFF66\uFF71\uFF73\uFF74\uFF75\uFF76\uFF77\uFF79\uFF7A\uFF7B\uFF7D\uFF7E\uFF80\uFF83\uFF85\uFF86\uFF87\uFF88\uFF8B\uFF8E\uFF8F01234789Z"),grid:[1,1],id:"katakana",kind:"ramp",label:"Katakana"},petscii:{glyphs:S(" \u2581\u2571\u2572\u2500\u2502\u256D\u256E\u2570\u256F\u2582\u253C\u25CB\u25C7\u2583\u2660\u2663\u2665\u2666\u25CF\u25C6\u2584\u258C\u2585\u2586\u258A\u2587\u2588"),grid:[1,1],id:"petscii",kind:"ramp",label:"PETSCII"},quadrants:{glyphs:xe,grid:[2,2],id:"quadrants",kind:"quadrants",label:"Quadrants 2\xD72"},standard:{glyphs:S(" .:-=+*#%@"),grid:[1,1],id:"standard",kind:"ramp",label:"Classic"}};var bt=e=>Object.hasOwn(ye,e),_e=(e="standard",t)=>{if(t!==void 0){let o=S(t);if(o.length>=2)return{glyphs:o,grid:[1,1],id:"custom",kind:"ramp",label:"Custom"}}return typeof e!="string"?e:bt(e)?ye[e]:ye.standard};var ce=.5,V={heavy:.26,light:.13},U=(e,t,o,r)=>({h:r,kind:"rect",w:o,x:e,y:t}),z=(e,t,o)=>({cx:e,cy:t,kind:"dot",r:o}),_=(e,t,o,r,s=V.light)=>({kind:"line",weight:s,x1:e,x2:o,y1:t,y2:r}),ue=new Map,E=(e,t)=>ue.set(e,t);E(" ",[]);E("\u2588",[U(0,0,1,1)]);for(let[e,t]of[..."\u2581\u2582\u2583\u2584\u2585\u2586\u2587"].entries()){let o=(e+1)/8;E(t,[U(0,1-o,1,o)])}for(let[e,t]of[..."\u258F\u258E\u258D\u258C\u258B\u258A\u2589"].entries())E(t,[U(0,0,(e+1)/8,1)]);E("\u2580",[U(0,0,1,.5)]);E("\u2594",[U(0,0,1,.125)]);E("\u2590",[U(.5,0,.5,1)]);E("\u2595",[U(.875,0,.125,1)]);for(let[e,t]of xe.entries()){if(e===0||e===15||ue.has(t))continue;let o=[];for(let r=0;r<4;r+=1)e&1<<r&&o.push(U(r%2*.5,Math.floor(r/2)*.5,.5,.5));E(t,o)}var ge=e=>{let t=[];for(let o=0;o<4;o+=1)for(let r=0;r<2;r+=1)e(r,o)&&t.push(U(r/2,o/4,.5,.25));return t};E("\u2591",ge((e,t)=>t===0&&e===0||t===2&&e===1));E("\u2592",ge((e,t)=>(e+t)%2===0));E("\u2593",ge((e,t)=>!(t===1&&e===1||t===3&&e===0)));var yt=.17;for(let e=1;e<256;e+=1){let t=[];for(let[o,r]of le.entries())for(let[s,c]of r.entries())e&c&&t.push(z(s===0?.3:.7,(o+.5)/4,yt));E(String.fromCodePoint(10240+e),t)}E(String.fromCodePoint(10240),[]);E("\xB7",[z(.5,.5,.07)]);E("\u2219",[z(.5,.5,.13)]);E("\u2022",[z(.5,.5,.24)]);E("\u2981",[z(.5,.5,.33)]);E("\u25CF",[z(.5,.5,.42)]);E("\u2571",[_(0,1,1,0)]);E("\u2572",[_(0,0,1,1)]);E("\u2573",[_(0,1,1,0),_(0,0,1,1)]);var g=(e,t,o,r,s)=>{let c=[],n=V.light*1.2,i=(d,m,b)=>{if(d!==null){if(d==="d"){for(let v of[-n,n])c.push(_(.5+v,m,.5+v,b));return}c.push(_(.5,m,.5,b,d==="h"?V.heavy:void 0))}},u=(d,m,b)=>{if(d!==null){if(d==="d"){for(let v of[-n*ce,n*ce])c.push(_(m,.5+v,b,.5+v));return}c.push(_(m,.5,b,.5,d==="h"?V.heavy:void 0))}},l=V.heavy/2;i(t,0,.5+l*ce),i(r,.5-l*ce,1),u(s,0,.5+l),u(o,.5-l,1),E(e,c)};g("\u2500",null,"l",null,"l");g("\u2502","l",null,"l",null);g("\u250C",null,"l","l",null);g("\u2510",null,null,"l","l");g("\u2514","l","l",null,null);g("\u2518","l",null,null,"l");g("\u251C","l","l","l",null);g("\u2524","l",null,"l","l");g("\u252C",null,"l","l","l");g("\u2534","l","l",null,"l");g("\u253C","l","l","l","l");g("\u2501",null,"h",null,"h");g("\u2503","h",null,"h",null);g("\u250F",null,"h","h",null);g("\u2513",null,null,"h","h");g("\u2517","h","h",null,null);g("\u251B","h",null,null,"h");g("\u2523","h","h","h",null);g("\u252B","h",null,"h","h");g("\u2533",null,"h","h","h");g("\u253B","h","h",null,"h");g("\u254B","h","h","h","h");g("\u2550",null,"d",null,"d");g("\u2551","d",null,"d",null);g("\u256C","d","d","d","d");for(let[e,t,o,r,s]of[["\u2554",null,"d","d",null],["\u2557",null,null,"d","d"],["\u255A","d","d",null,null],["\u255D","d",null,null,"d"],["\u2560","d","d","d",null],["\u2563","d",null,"d","d"],["\u2566",null,"d","d","d"],["\u2569","d","d",null,"d"]])g(e,t,o,r,s);var de=(e,t,o,r,s)=>E(e,[{cx:t,cy:o,from:r,kind:"arc",rx:.5,ry:.5,to:s,weight:V.light}]);de("\u256D",1,1,Math.PI,Math.PI*1.5);de("\u256E",0,1,Math.PI*1.5,Math.PI*2);de("\u2570",1,0,Math.PI*.5,Math.PI);de("\u256F",0,0,0,Math.PI*.5);var Ue=new Map,G=(e,t)=>Ue.set(e,t);G(".",[z(.5,.78,.12)]);G(":",[z(.5,.36,.12),z(.5,.74,.12)]);G("-",[_(.18,.55,.82,.55)]);G("_",[_(.08,.9,.92,.9)]);G("=",[_(.18,.44,.82,.44),_(.18,.66,.82,.66)]);G("+",[_(.16,.55,.84,.55),_(.5,.33,.5,.77)]);G("*",[_(.5,.3,.5,.72),_(.2,.4,.8,.62),_(.2,.62,.8,.4)]);G("x",[_(.2,.38,.8,.82),_(.2,.82,.8,.38)]);G("o",[{cx:.5,cy:.6,from:0,kind:"arc",rx:.3,ry:.2,to:Math.PI*2,weight:V.light}]);G("#",[_(.38,.22,.3,.86),_(.72,.22,.64,.86),_(.12,.42,.9,.42),_(.1,.66,.88,.66)]);G("/",[_(.18,.88,.82,.12)]);G("\\",[_(.18,.12,.82,.88)]);G("|",[_(.5,.08,.5,.92)]);var Oe=e=>ue.get(e);var Jt=[...ue.keys(),...Ue.keys()],D=e=>Math.round(e*100)/100,Ne=e=>{let t=0;for(let[r,[s,c]]of e.entries()){let[n,i]=e[(r+1)%e.length]??[s,c];t+=s*i-n*c}return`${(t<0?[...e].toReversed():e).map(([r,s],c)=>`${c===0?"M":"L"}${D(r)} ${D(s)}`).join("")}Z`},ze=10,Be=(e,t)=>{let{x:o,y:r,width:s,height:c}=t,n=l=>o+l*s,i=l=>r+l*c,u="";for(let l of e)switch(l.kind){case"rect":{u+=`M${D(n(l.x))} ${D(i(l.y))}h${D(l.w*s)}v${D(l.h*c)}h${D(-l.w*s)}Z`;break}case"dot":{let d=D(l.r*s);u+=`M${D(n(l.cx)-d)} ${D(i(l.cy))}a${d} ${d} 0 1 1 ${D(2*d)} 0a${d} ${d} 0 1 1 ${D(-2*d)} 0Z`;break}case"line":{let d=n(l.x1),m=i(l.y1),b=n(l.x2),v=i(l.y2),A=Math.hypot(b-d,v-m)||1,L=l.weight*s/2,C=(v-m)/A*L,T=-(b-d)/A*L;u+=Ne([[d+C,m+T],[b+C,v+T],[b-C,v-T],[d-C,m-T]]);break}case"arc":{let d=l.weight*s/2,m=[],b=[];for(let v=0;v<=ze;v+=1){let A=l.from+(l.to-l.from)*v/ze,L=Math.cos(A),C=Math.sin(A),T=n(l.cx)+L*l.rx*s,I=i(l.cy)+C*l.ry*c;m.push([T+L*d,I+C*d]),b.push([T-L*d,I-C*d])}u+=Ne([...m,...b.toReversed()]);break}default:return l}return u};var Z=32,xt=24,_t=(e,t)=>`${e.deviceWidth}x${e.deviceHeight}:${e.fontSize*e.dpr}:${e.font}:${t?t.join(""):"*"}`,B=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>{for(let e of B.values())e.redraw()});var gt=(e,t,o,r,s,c)=>{let n=Math.max(1,Math.round(t.weight*s)),i=Math.floor(n/2);if(t.x1===t.x2){let u=o+Math.floor(t.x1*s),l=r+Math.round(Math.min(t.y1,t.y2)*c),d=r+Math.round(Math.max(t.y1,t.y2)*c);return e.fillRect(u-i,l,n,Math.max(1,d-l)),!0}if(t.y1===t.y2){let u=r+Math.floor(t.y1*c),l=o+Math.round(Math.min(t.x1,t.x2)*s),d=o+Math.round(Math.max(t.x1,t.x2)*s);return e.fillRect(l,u-i,Math.max(1,d-l),n),!0}return!1},wt=(e,t,o,r,s,c)=>{for(let n of t){if(n.kind==="rect"){let i=Math.round(o+n.x*s),u=Math.round(r+n.y*c),l=Math.round(o+(n.x+n.w)*s),d=Math.round(r+(n.y+n.h)*c);l>i&&d>u&&e.fillRect(i,u,l-i,d-u);continue}if(!(n.kind==="line"&&gt(e,n,o,r,s,c))){if(n.kind==="dot"){let i=Math.max(.5,n.r*s);e.beginPath(),e.arc(o+n.cx*s,r+n.cy*c,i,0,Math.PI*2),e.fill();continue}e.fill(new Path2D(Be([n],{height:c,width:s,x:o,y:r})))}}},At=(e,t,o,r,s,c)=>{let n=s/2,i=c/4,u=Math.max(1,Math.round(Math.min(n,i)*.55));for(let[l,d]of le.entries())for(let[m,b]of d.entries()){if((t&b)===0)continue;let v=o+Math.round(m*n+(n-u)/2),A=r+Math.round(l*i+(i-u)/2);u<4?e.fillRect(v,A,u,u):(e.beginPath(),e.arc(v+u/2,A+u/2,u/2,0,Math.PI*2),e.fill())}},Et={"\u2591":(e,t)=>e%2===0&&t%2===0,"\u2592":(e,t)=>(e+t)%2===0,"\u2593":(e,t)=>!(e%2===1&&t%2===1)},Rt=(e,t,o,r,s,c,n)=>{let i=Math.max(1,Math.round(n));for(let u=0;u*i<c;u+=1)for(let l=0;l*i<s;l+=1)t(l,u)&&e.fillRect(o+l*i,r+u*i,i,i)},we=class{canvas;metrics;columns=Z;glyphs;version=0;dynamic;slots=new Map;coverages=[];context;baseline=0;constructor(t,o,r){this.metrics=t,this.dynamic=r,this.glyphs=[],this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d",{willReadFrequently:!0});for(let s of o)this.slots.has(s)||this.slots.set(s,this.glyphs.length),this.glyphs.push(s);this.redraw()}redraw(){let{deviceWidth:t,deviceHeight:o}=this.metrics,r=Math.max(1,Math.ceil(this.glyphs.length/Z)),s=this.dynamic?r+2:r;this.canvas.width=t*Z,this.canvas.height=o*s,this.context=this.canvas.getContext("2d",{willReadFrequently:!0});let{context:c}=this;if(!c)return;c.font=`${this.metrics.fontSize*this.metrics.dpr}px ${this.metrics.font}`;let n=c.measureText("Mg"),i=n.fontBoundingBoxAscent||this.metrics.fontSize*this.metrics.dpr*.8,u=n.fontBoundingBoxDescent||this.metrics.fontSize*this.metrics.dpr*.2;this.baseline=Math.round((o-(i+u))/2+i),this.coverages=[];for(let l=0;l<this.glyphs.length;l+=1)this.paint(l);this.version+=1}paint(t){let{context:o}=this,r=this.glyphs[t];if(!o||r===void 0)return;let{deviceWidth:s,deviceHeight:c,dpr:n}=this.metrics,[i,u]=this.slotOrigin(t);o.clearRect(i,u,s,c),o.save(),o.beginPath(),o.rect(i,u,s,c),o.clip(),o.fillStyle="#fff";let l=r.codePointAt(0)??0,d=Et[r],m=Oe(r);if(l>=10240&&l<=10495&&r.length===1)At(o,l-10240,i,u,s,c);else if(d)Rt(o,d,i,u,s,c,n);else if(m)wt(o,m,i,u,s,c);else if(r.trim()!==""){o.font=`${this.metrics.fontSize*n}px ${this.metrics.font}`,o.textAlign="center",o.textBaseline="alphabetic";let b=o.measureText(r).width,v=b>s*1.05?s/b:1;o.translate(i+s/2,u+this.baseline),o.scale(v,1),o.fillText(r,0,0)}o.restore(),this.coverages[t]=this.measure(i,u,s,c)}measure(t,o,r,s){let{context:c}=this;if(!c)return 0;let{data:n}=c.getImageData(t,o,r,s),i=0;for(let u=3;u<n.length;u+=4)i+=n[u]??0;return i/(r*s*255)}slot(t){let o=this.slots.get(t);if(o!==void 0)return o;if(!this.dynamic)return-1;let r=this.glyphs.length;return this.slots.set(t,r),this.glyphs.push(t),Math.ceil(this.glyphs.length/Z)*this.metrics.deviceHeight>this.canvas.height?this.redraw():(this.paint(r),this.version+=1),r}slotOrigin(t){return[t%Z*this.metrics.deviceWidth,Math.floor(t/Z)*this.metrics.deviceHeight]}coverage(t){let o=this.slots.get(t);return o===void 0?0:this.coverages[o]??0}slotCoverage(t){return this.coverages[t]??0}drawGlyph(t,o,r,s,c=this.metrics.deviceWidth,n=this.metrics.deviceHeight){let i=this.slot(o);if(i<0)return;let[u,l]=this.slotOrigin(i);t.drawImage(this.canvas,u,l,this.metrics.deviceWidth,this.metrics.deviceHeight,r,s,c,n)}},$e=({metrics:e,glyphs:t,dynamic:o=!1})=>{let r=_t(e,o?null:t),s=B.get(r);if(s){if(B.delete(r),B.set(r,s),o)for(let n of t)s.slot(n);return s}let c=new we(e,t,o);if(B.set(r,c),B.size>xt){let n=B.keys().next().value;n!==void 0&&B.delete(n)}return c},Tt=(e,t,o=.6)=>{let r=new Float32Array(Math.max(t,0));if(t<2)return r;let s=e(0),n=e(t-1)-s,i=1/(t-1),u=0;for(let d=0;d<t;d+=1){let m=d*i,b=n>1e-4?(e(d)-s)/n:m,v=m+(Math.min(1,Math.max(0,b))-m)*o,A=d===0?0:u+i*.15;u=d===t-1?1:Math.max(v,A),r[d]=u}if((r[t-2]??0)>=1)for(let d=1;d<t-1;d+=1)r[d]=d*i;return r};var We=(e,t)=>Tt(o=>e.slotCoverage(o),t);var Xe=/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,St=/^[ \t]*#/m,Ct=/^\s*(?:(?:lowp|mediump|highp|const|uniform)\s+)*struct\b/,Lt=/^\s*precision\b/,Mt=/\d+\.\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?|\d+(?:[eE][-+]?\d+)?|[A-Za-z_]\w*|\+\+|--|<=|>=|==|!=|&&|\|\||\^\^|[-+*/]=|\S/g,fe=e=>{let t=e.replaceAll(Xe," "),o=[],r=0,s=0,c=n=>{let i=t.slice(s,n).trim();s=n,i!==""&&o.push(i)};for(let n=0;n<t.length;n+=1){let i=t[n];i==="{"?r+=1:i==="}"?(r-=1,r===0&&!Ct.test(t.slice(s,n))&&c(n+1)):i===";"&&r===0&&c(n+1)}return c(t.length),o},qe=e=>e.match(Mt)?.join(" ")??"",Ve=e=>St.test(e.replaceAll(Xe," ")),kt=(e,t)=>{if(Ve(e)||Ve(t))return t;let o=new Set(fe(e).map(qe));return fe(t).filter(r=>Lt.test(r)||!o.has(qe(r))).join(`
`)},Ft=`
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
`,Gt=`
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
`,It=`
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
`,je=({field:e,colorField:t,uniforms:o})=>{let r=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
${Gt}
${o}
${Ft}
${It}
`,s="";if(t!==void 0){let u=kt(e,t);s=fe(u).length<fe(t).length?u:t}let c=r.split(`
`).length-1,n=c+e.split(`
`).length,i=`${r}${e}
${s}
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
`;return{colorLine:n,fieldLine:c,source:i}},re=`#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,Ye=`
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;var Ze=`#version 300 es
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
`,Ke=`#version 300 es
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
`,Dt=/ERROR:\s*\d+:(\d+):\s*(.*)/g,et=({log:e,field:t,colorField:o,fieldLine:r,colorLine:s})=>{let c=[];for(let n of e.matchAll(Dt)){let i=Number(n[1]),u=n[2]??"";if(o!==void 0&&i>s){let l=i-s;c.push(`colorField line ${l}: ${u}
  > ${(o.split(`
`)[l-1]??"").trim()}`)}else if(i>r){let l=i-r;c.push(`field line ${l}: ${u}
  > ${(t.split(`
`)[l-1]??"").trim()}`)}else c.push(`engine line ${i}: ${u}`)}return c.length>0?c.join(`
`):e};var Ht=/^[A-Za-z][A-Za-z0-9_]*$/,Pt={1:"float",2:"vec2",3:"vec3",4:"vec4"},Nt=e=>typeof e=="number"?1:e.length,Ae=e=>Object.keys(e).toSorted().flatMap(t=>{let o=e[t];return o===void 0?[]:!Ht.test(t)||t.startsWith("u_")||t.startsWith("ascii_")?(console.error(`[ascii-shader] uniform "${t}" skipped: names must be GLSL identifiers and not start with "u_" or "ascii_"`),[]):[{name:t,size:Nt(o)}]}),rt=()=>({ansi:new Float32Array(48),ansiLab:new Float32Array(48),audio:new Float32Array(4),bloom:0,click:new Float32Array([.5,.5,1e3]),colorMode:0,curvature:0,delta:0,edgeThreshold:.22,flicker:0,frame:0,glitch:0,grade:new Float32Array([0,1,1,1]),ink:new Float32Array([1,1,1]),interaction:0,invert:!1,levels:0,paper:new Float32Array([0,0,0,1]),pointer:new Float32Array([.5,.5,0]),pointerVelocity:new Float32Array(2),scanlines:0,seed:0,stopCount:1,stops:new Float32Array(24),threshold:.5,time:0,uniforms:{},vignette:0}),tt=e=>{console.error(`[ascii-shader] ${e}`)},ot=(e,t,o)=>{let r=e.createShader(t);return r?(e.shaderSource(r,o),e.compileShader(r),r):null},ne=(e,t,o,r=s=>s)=>{let s=ot(e,e.VERTEX_SHADER,t),c=ot(e,e.FRAGMENT_SHADER,o),n=e.createProgram();if(!(s&&c&&n))return null;if(e.attachShader(n,s),e.attachShader(n,c),e.bindAttribLocation(n,0,"a_position"),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS)){if(!e.isContextLost()){let i=e.getShaderInfoLog(c)||e.getShaderInfoLog(s)||e.getProgramInfoLog(n)||"";tt(`shader failed to compile
${r(i)}`),(i.includes("already has a body")||i.includes("redefinition"))&&tt("a function is defined twice. `field` and `colorField` compile into one shader: give helpers different names, or define a shared helper once, in `field`, and call it from both.")}return e.deleteShader(s),e.deleteShader(c),e.deleteProgram(n),null}return e.deleteShader(s),e.deleteShader(c),n},ae=(e,t,o)=>{let r={};for(let s of o)r[s]=e.getUniformLocation(t,s);return r},H=(e,t)=>{let o=e.createTexture();return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o},zt=["u_field","u_positions","u_thresholds","u_coverage","u_cells","u_grid","u_kind","u_count","u_calibrated","u_dither","u_matrixSize","u_steps","u_grade","u_invert","u_threshold","u_edgeThreshold","u_colorMode","u_hasColor","u_ink","u_ansi","u_ansiLab","u_stops","u_stopCount","u_glitch","u_glitchSeed"],Ut=["u_cellGlyph","u_cellColor","u_atlas","u_bloom","u_cells","u_cellSize","u_canvas","u_atlasColumns","u_paper","u_fx","u_fx2","u_glitchRows"],Ot=["u_source","u_glyph","u_step","u_fromCells","u_size"],Bt=["u_previous","u_size","u_pointer","u_decay","u_strength"],$t=["u_resolution","u_time","u_seed","u_pointer","u_pointerVelocity","u_click","u_audio","u_palette","u_paletteSize","ascii_samples","ascii_levels","ascii_interaction","ascii_trail"],K=(e,t)=>{let o=Math.sin(e*12.9898+t*78.233)*43758.5453;return o-Math.floor(o)},Ee=e=>{let t=e.getExtension("EXT_color_buffer_float")!==null,o=ne(e,re,Ze),r=ne(e,re,Ke),s=ne(e,re,Qe),c=ne(e,re,Je);if(!(o&&r&&s&&c))return null;let n=ae(e,o,zt),i=ae(e,r,Ut),u=ae(e,s,Ot),l=ae(e,c,Bt),d=e.createVertexArray();e.bindVertexArray(d);let m=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.pixelStorei(e.UNPACK_ALIGNMENT,1);let b=H(e,e.NEAREST),v=H(e,e.LINEAR),A=H(e,e.LINEAR),L=H(e,e.LINEAR),C=H(e,e.LINEAR),T=[H(e,e.LINEAR),H(e,e.LINEAR)],I=H(e,e.NEAREST),$=H(e,e.NEAREST),y=H(e,e.NEAREST),P=H(e,e.NEAREST),O=H(e,e.NEAREST),X=e.createFramebuffer(),W=e.createFramebuffer(),Q=e.createFramebuffer(),J=e.createFramebuffer(),me=[e.createFramebuffer(),e.createFramebuffer()],se=(a,f)=>{e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,f,0)},q=null,Te=2,Se=1,Ce=1,Le=!1,N={count:2,grid:[1,1],kind:0,positions:null},Me=32,ke=-1,ee=null,x=0,w=0,te=0,oe=0,pe=1,j=0,Fe=!1,ve=null,be=(a,f,p,h,R,k)=>{e.bindTexture(e.TEXTURE_2D,a),e.texImage2D(e.TEXTURE_2D,0,h,f,p,0,R,k,null)},Ge=a=>{e.bindTexture(e.TEXTURE_2D,O),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a.canvas);let f=new Float32Array(Math.max(1,a.glyphs.length));for(let p=0;p<a.glyphs.length;p+=1)f[p]=a.slotCoverage(p);e.bindTexture(e.TEXTURE_2D,P),e.texImage2D(e.TEXTURE_2D,0,e.R32F,f.length,1,0,e.RED,e.FLOAT,f),Me=a.columns,ke=a.version},M=(a,f)=>{e.activeTexture(e.TEXTURE0+a),e.bindTexture(e.TEXTURE_2D,f)},lt=(a,f)=>{for(let p of a.custom){let h=f[p.name];h!==void 0&&(typeof h=="number"?e.uniform1f(p.location,h):h.length===2?e.uniform2f(p.location,h[0],h[1]):h.length===3?e.uniform3f(p.location,h[0],h[1],h[2]):e.uniform4f(p.location,h[0],h[1],h[2],h[3]))}},ct=a=>{let f=T[j];j=1-j;let p=T[j];if(f&&p){e.useProgram(c),e.bindFramebuffer(e.FRAMEBUFFER,me[j]??null),e.viewport(0,0,x,w),M(0,f),e.uniform1i(l.u_previous,0),e.uniform2f(l.u_size,x,w),e.uniform3fv(l.u_pointer,a.pointer),e.uniform1f(l.u_decay,Math.exp(-a.delta*2.2));let h=Math.hypot(a.pointerVelocity[0]??0,a.pointerVelocity[1]??0);e.uniform1f(l.u_strength,Math.min(.9,.08+h*1.6)*Math.min(1,a.delta*30)),e.drawArrays(e.TRIANGLES,0,3)}},ut=(a,f,p,h)=>{e.useProgram(a.program),e.bindFramebuffer(e.FRAMEBUFFER,X),e.viewport(0,0,p,h),M(0,I),e.uniform1i(a.at.u_palette,0),M(1,T[j]??T[0]??I),e.uniform1i(a.at.ascii_trail,1),e.uniform1f(a.at.u_paletteSize,Te),e.uniform2f(a.at.u_resolution,h*te/Math.max(1,oe),h),e.uniform2f(a.at.ascii_samples,p,h),e.uniform1f(a.at.u_time,f.time),e.uniform1f(a.at.u_seed,f.seed),e.uniform3fv(a.at.u_pointer,f.pointer),e.uniform2fv(a.at.u_pointerVelocity,f.pointerVelocity),e.uniform3fv(a.at.u_click,f.click),e.uniform4fv(a.at.u_audio,f.audio),e.uniform1f(a.at.ascii_levels,f.levels),e.uniform1f(a.at.ascii_interaction,f.interaction),lt(a,f.uniforms),e.drawArrays(e.TRIANGLES,0,3)},dt=(a,f)=>{let[p,h]=N.grid;e.useProgram(o),e.bindFramebuffer(e.FRAMEBUFFER,W),e.viewport(0,0,x,w),M(0,b),e.uniform1i(n.u_field,0),M(1,y),e.uniform1i(n.u_positions,1),M(2,$),e.uniform1i(n.u_thresholds,2),M(3,P),e.uniform1i(n.u_coverage,3),e.uniform2i(n.u_cells,x,w),e.uniform2i(n.u_grid,p,h),e.uniform1i(n.u_kind,N.kind),e.uniform1i(n.u_count,N.count),e.uniform1i(n.u_calibrated,N.positions?1:0),e.uniform1i(n.u_dither,Le?1:0),e.uniform1i(n.u_matrixSize,Se),e.uniform1f(n.u_steps,Ce),e.uniform4fv(n.u_grade,a.grade),e.uniform1i(n.u_invert,a.invert?1:0),e.uniform1f(n.u_threshold,a.threshold),e.uniform1f(n.u_edgeThreshold,a.edgeThreshold),e.uniform1i(n.u_colorMode,a.colorMode),e.uniform1i(n.u_hasColor,Fe?1:0),e.uniform3fv(n.u_ink,a.ink),e.uniform3fv(n.u_ansi,a.ansi),e.uniform3fv(n.u_ansiLab,a.ansiLab),e.uniform3fv(n.u_stops,a.stops),e.uniform1i(n.u_stopCount,a.stopCount),e.uniform1f(n.u_glitch,f),e.uniform1f(n.u_glitchSeed,K(a.frame,2)*100),e.drawArrays(e.TRIANGLES,0,3)},ft=()=>{e.useProgram(s),e.uniform2f(u.u_size,x,w),e.bindFramebuffer(e.FRAMEBUFFER,Q),M(0,A),e.uniform1i(u.u_source,0),M(1,v),e.uniform1i(u.u_glyph,1),e.uniform1i(u.u_fromCells,1),e.uniform2f(u.u_step,1/x,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,J),M(0,L),e.uniform1i(u.u_fromCells,0),e.uniform2f(u.u_step,0,.6/w),e.drawArrays(e.TRIANGLES,0,3)},ht=(a,f,p)=>{e.useProgram(r),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,te,oe),M(0,v),e.uniform1i(i.u_cellGlyph,0),M(1,A),e.uniform1i(i.u_cellColor,1),M(2,O),e.uniform1i(i.u_atlas,2),M(3,C),e.uniform1i(i.u_bloom,3),e.uniform2i(i.u_cells,x,w),e.uniform2i(i.u_cellSize,p.deviceWidth,p.deviceHeight),e.uniform2f(i.u_canvas,te,oe),e.uniform1i(i.u_atlasColumns,Me),e.uniform4fv(i.u_paper,a.paper),e.uniform4f(i.u_fx,a.scanlines,a.bloom,a.curvature,f);let h=a.flicker>0?1-a.flicker*.22*K(a.frame,3):1;if(e.uniform4f(i.u_fx2,h,a.vignette,pe,a.time),f>0){let R=Math.floor(K(a.frame,4)*w),k=1+Math.floor(K(a.frame,5)*3*a.glitch),F=Math.round((K(a.frame,6)-.5)*8*a.glitch);e.uniform4f(i.u_glitchRows,R,R+k,F,0)}else e.uniform4f(i.u_glitchRows,-1,-1,0,0);e.drawArrays(e.TRIANGLES,0,3)},Ie={dispose:()=>{for(let a of[b,v,A,L,C,...T,I,$,y,P,O])e.deleteTexture(a);for(let a of[X,W,Q,J,...me])e.deleteFramebuffer(a);e.deleteBuffer(m),e.deleteVertexArray(d);for(let a of[o,r,s,c])e.deleteProgram(a);q&&e.deleteProgram(q.program)},draw:a=>{if(!q||x===0||w===0||!ee)return;ee.version!==ke&&Ge(ee);let[f,p]=N.grid;e.bindVertexArray(d),e.disable(e.BLEND),a.interaction===3&&ct(a),ut(q,a,x*f,w*p);let h=a.glitch>0&&K(Math.floor(a.frame/3),1)<a.glitch*.3?a.glitch:0;dt(a,h),a.bloom>0&&ft(),ht(a,h,ee.metrics)},readCells:()=>{if(x===0||w===0)return null;let a=x*w;ve?.slots.length!==a&&(ve={colors:new Uint8Array(a*4),raw:new Uint8Array(a*4),slots:new Uint16Array(a)});let{raw:f,slots:p,colors:h}=ve;e.bindFramebuffer(e.READ_FRAMEBUFFER,W),e.readBuffer(e.COLOR_ATTACHMENT0),e.readPixels(0,0,x,w,e.RGBA,e.UNSIGNED_BYTE,f);for(let R=0;R<w;R+=1){let k=(w-1-R)*x;for(let F=0;F<x;F+=1){let ie=(k+F)*4;p[R*x+F]=(f[ie]??0)+256*(f[ie+1]??0)}}e.readBuffer(e.COLOR_ATTACHMENT1),e.readPixels(0,0,x,w,e.RGBA,e.UNSIGNED_BYTE,f);for(let R=0;R<w;R+=1)h.set(f.subarray((w-1-R)*x*4,(w-R)*x*4),R*x*4);return e.bindFramebuffer(e.READ_FRAMEBUFFER,null),{colors:h,columns:x,rows:w,slots:p}},resize:a=>{({columns:x,rows:w,canvasWidth:te,canvasHeight:oe,dpr:pe}=a);let[f,p]=N.grid;t?be(b,x*f,w*p,e.RGBA16F,e.RGBA,e.HALF_FLOAT):be(b,x*f,w*p,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE),se(X,b);for(let h of[v,A,L,C,...T])be(h,x,w,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE);e.bindFramebuffer(e.FRAMEBUFFER,W),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,v,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,A,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]),se(Q,L),se(J,C);for(let[h,R]of me.entries()){let k=T[h];k&&(se(R,k),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT))}e.bindFramebuffer(e.FRAMEBUFFER,null)},setAtlas:(a,f)=>{let p=f.grid[0]!==N.grid[0]||f.grid[1]!==N.grid[1];N=f,ee=a,Ge(a);let h=f.positions??new Float32Array([0]);e.bindTexture(e.TEXTURE_2D,y),e.texImage2D(e.TEXTURE_2D,0,e.R32F,h.length,1,0,e.RED,e.FLOAT,h),p&&x>0&&Ie.resize({canvasHeight:oe,canvasWidth:te,columns:x,dpr:pe,rows:w})},setField:({field:a,colorField:f,specs:p})=>{let h=p.map(({name:F,size:ie})=>`uniform ${Pt[ie]} ${F};`).join(`
`),R=je({colorField:f,field:a,uniforms:h}),k=ne(e,Ye,R.source,F=>et({colorField:f,colorLine:R.colorLine,field:a,fieldLine:R.fieldLine,log:F}));return k?(q&&e.deleteProgram(q.program),q={at:ae(e,k,$t),custom:p.map(F=>({...F,location:e.getUniformLocation(k,F.name)})),program:k},Fe=f!==void 0,!0):!1},setMatrix:a=>{Le=a!==null,a&&(e.bindTexture(e.TEXTURE_2D,$),e.texImage2D(e.TEXTURE_2D,0,e.R8,a.size,a.size,0,e.RED,e.UNSIGNED_BYTE,a.ranks),Se=a.size,Ce=a.steps)},setPalette:a=>{let f=new Uint8Array(a.length*4);for(let[p,h]of a.entries())f.set(h.map(R=>Math.round(R*255)),p*4);e.bindTexture(e.TEXTURE_2D,I),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,a.length,1,0,e.RGBA,e.UNSIGNED_BYTE,f),Te=a.length}};return Ie};var Wt='ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',he=null,Re=new Map;typeof document<"u"&&document.fonts?.addEventListener?.("loadingdone",()=>Re.clear());var qt=e=>{let t=Re.get(e);if(t!==void 0)return t;if(typeof document>"u"||(he??=document.createElement("canvas").getContext("2d"),!he))return .6;he.font=`100px ${e}`;let o=he.measureText("M").width/100,r=Number.isFinite(o)&&o>.3&&o<1.2?o:.6;return Re.set(e,r),r},nt=({cell:e=12,font:t=Wt,dpr:o=typeof window>"u"?1:window.devicePixelRatio||1,square:r=!1}={})=>{let s=Math.max(2,e),c=s/1.2,n=r?s:c*qt(t),i=Math.max(1,Math.round(s*o)),u=Math.max(1,Math.round(n*o));return{deviceHeight:i,deviceWidth:u,dpr:o,font:t,fontSize:c,height:i/o,width:u/o}},at=(e,t,o)=>({columns:Math.max(1,Math.ceil(t/e.width)),rows:Math.max(1,Math.ceil(o/e.height))});var st=e=>e.replace("#","").match(/../g).map(t=>parseInt(t,16)/255);function it(e,t){let{field:o,colorField:r,uniforms:s,paper:c,charset:n}=t,i=t.palette?.map(y=>[...st(y),1]),u=e.getContext("webgl2",{alpha:!1,antialias:!1});if(!u)return null;let l=Ee(u);if(!l)return null;if(!l.setField({field:o,colorField:r,specs:Ae(s)}))return l.dispose(),null;let d=_e(n),m=rt();m.colorMode=1,m.paper.set([...st(c),1]),m.uniforms=s,m.time=12,i&&(m.stopCount=i.length,i.forEach((y,P)=>m.stops.set(y.slice(0,3),P*3))),e.dataset.scene=t.name,e.dataset.charset=n,l.setMatrix(null),i&&l.setPalette(i);let b=!1,v=0,A,L=!0,C,T=!1;function I(){if(!T){if(L||C!==window.devicePixelRatio){C=window.devicePixelRatio;let y=e.clientWidth,P=e.clientHeight,O=Math.min(C||1,2),X=nt({cell:t.cell??7,dpr:O,square:!0}),W=$e({glyphs:d.glyphs,metrics:X});l.setAtlas(W,{kind:0,count:d.glyphs.length,grid:d.grid,positions:We(W,d.glyphs.length)});let{columns:Q,rows:J}=at(X,y,P);e.width=Math.round(y*O),e.height=Math.round(P*O),l.resize({columns:Q,rows:J,canvasWidth:e.width,canvasHeight:e.height,dpr:O}),L=!1}m.frame+=1,l.draw(m),e.dataset.ready="true"}}function $(y){(A===void 0||y-A>=32)&&(m.delta=A===void 0?0:(y-A)/1e3,m.time+=m.delta,A=y,I()),v=requestAnimationFrame($)}return new ResizeObserver(()=>{L=!0,!b&&e.clientWidth&&e.clientHeight&&I()}).observe(e),e.addEventListener("webglcontextlost",y=>{y.preventDefault(),cancelAnimationFrame(v),v=0,T=!0,delete e.dataset.ready}),e.addEventListener("webglcontextrestored",()=>{if(l=Ee(u),!l?.setField({field:o,colorField:r,specs:Ae(s)})){l?.dispose();return}T=!1,l.setMatrix(null),i&&l.setPalette(i),L=!0,A=void 0,I(),b&&(v=requestAnimationFrame($))}),I(),{setRunning(y){b=y,y&&!v&&!T&&(v=requestAnimationFrame($)),y||(cancelAnimationFrame(v),v=0,A=void 0)},capture(){let y=l.readCells();return y?{columns:y.columns,rows:y.rows,glyphs:Array.from(y.slots,P=>d.glyphs[P]??" "),colors:Array.from(y.colors)}:null}}}function vo(e){return it(e,{name:"redwood-light",field:He,colorField:Pe,uniforms:{rwIntensity:1,rwMistOn:1,rwMotesOn:1},charset:"blocks",cell:7,paper:"#060a08"})}export{vo as createHeroLandscape};
