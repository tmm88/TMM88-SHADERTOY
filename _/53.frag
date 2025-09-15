// Ethereal Hologram V4 - Quantum Kaleidoscope
// Advanced multi-dimensional visual synthesis with temporal evolution

// ---------- ADVANCED HASHING & NOISE ----------
vec3 hash33(vec3 p) {
p = fract(p * vec3(443.897, 441.423, 437.195));
p += dot(p, p.yxz + 19.19);
return fract((p.xxy + p.yxx) * p.zyx);
}

float hash12(vec2 p) {
p = fract(p * vec2(123.34, 456.21));
p += dot(p, p + 45.32);
return fract(p.x * p.y);
}

float voronoi(vec2 p, float time) {
vec2 n = floor(p);
vec2 f = fract(p);

float m = 8.0;
for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec3 o = hash33(vec3(n + g, time * 0.1));
        vec2 r = g + o.xy - f;
        float d = dot(r, r);
        m = min(m, d);
    }
}
return sqrt(m);

}

float fbm(vec2 p, int octaves, float lacunarity, float gain) {
float value = 0.0;
float amplitude = 0.5;
float frequency = 1.0;

for (int i = 0; i < octaves; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
}
return value;

}

// ---------- QUANTUM COORDINATE TRANSFORMS ----------
vec2 quantumWarp(vec2 uv, float time) {
vec2 warped = uv;

/ Multi-scale domain warping
for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 offset = vec2(
        fbm(warped * 2.0 + time * 0.3 + fi, 4, 2.0, 0.5),
        fbm(warped * 2.0 - time * 0.2 + fi, 4, 2.0, 0.5)
    );
    warped += offset * 0.15 / (fi + 1.0);
}

return warped;

}

vec2 hypersphereProjection(vec2 uv, float radius, float time) {
float angle = atan(uv.y, uv.x);
float r = length(uv);

// Dynamic radius modulation
r = mix(r, 1.0 - r, 0.5 + 0.5 * sin(time * 0.7));

// Toroidal wrapping
uv = vec2(cos(angle), sin(angle)) * (1.0 - exp(-r * 3.0));

return uv;

}

// ---------- QUANTUM COLOR SPECTRUM ----------
vec3 quantumPalette(float t, float time, vec3 phase) {
vec3 a = vec3(0.5, 0.5, 0.5);
vec3 b = vec3(0.5, 0.5, 0.5);
vec3 c = vec3(1.0, 1.0, 1.0);
vec3 d = phase + vec3(0.0, 0.33, 0.67) + time * 0.05;

return a + b * cos(6.28318 * (c * t + d));
}

vec3 spectralDecomposition(vec2 uv, float time) {
vec3 col = vec3(0.0);

// Multi-frequency spectral layers
for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float freq = pow(2.0, fi) * 0.3;
    float phase = time * (0.2 + fi * 0.05);
    
    float pattern = sin(uv.x * freq + phase) * 
                   cos(uv.y * freq * 1.618 + phase) *
                   exp(-fi * 0.2);
    
    vec3 spectrum = quantumPalette(fi * 0.15, time, 
        vec3(sin(time * 0.1 + fi), cos(time * 0.2 + fi), sin(time * 0.3 + fi)));
    
    col += spectrum * pattern * (0.8 - fi * 0.1);
}

return col;

}

// ---------- QUANTUM PARTICLE SYSTEM ----------
vec3 quantumParticles(vec2 uv, float time) {
vec3 col = vec3(0.0);

for (int i = 0; i < 12; i++) {
    float fi = float(i);
    vec3 seed = hash33(vec3(fi, time * 0.1, 0.0));
    
    // Orbital particle motion
    vec2 orbit = vec2(
        cos(time * (0.3 + seed.x) + fi * 1.57) * (0.4 + seed.y * 0.3),
        sin(time * (0.4 + seed.z) + fi * 2.09) * (0.4 + seed.x * 0.3)
    );
    
    // Particle trails
    for (int j = 0; j < 3; j++) {
        float fj = float(j);
        vec2 pos = orbit + vec2(
            cos(time * 0.5 + fj * 0.7) * 0.1,
            sin(time * 0.6 + fj * 0.9) * 0.1
        );
        
        float d = length(uv - pos);
        float intensity = exp(-pow(d * (15.0 + fj * 5.0), 2.0 - fj * 0.3));
        intensity *= 1.0 - smoothstep(0.0, 0.3, fj * 0.1);
        
        vec3 particleColor = quantumPalette(fi * 0.2 + fj * 0.1, time, 
            vec3(seed.x, seed.y, seed.z));
        
        col += particleColor * intensity * (0.4 - fj * 0.1);
    }
}

return col;

}

// ---------- TEMPORAL EVOLUTION ----------
float temporalPhase(float time, float speed, float modulation) {
return time * speed + sin(time * modulation) * 0.5;
}

// ---------- MAIN RENDER ----------
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
// Normalized coordinates with aspect ratio correction
vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
vec2 uv0 = uv;

float time = iTime;
float tSlow = time * 0.3;
float tFast = time * 1.5;

// Quantum coordinate transformation
uv = quantumWarp(uv, time);
uv = hypersphereProjection(uv, 1.0, time);

// Multi-dimensional kaleidoscopic folding
float sectors = 6.0 + 2.0 * sin(time * 0.15);
vec2 polar = toPolar(uv);
polar = kaleido(polar, sectors);
uv = fromPolar(polar);

// Dynamic rotation and scaling
float rotation = time * 0.1 + sin(time * 0.3) * 0.2;
float scale = 1.2 + 0.3 * sin(time * 0.25) + 0.1 * cos(time * 0.4);
uv = rotate(uv, rotation);
uv *= scale;

// Quantum fractal synthesis
vec3 finalColor = vec3(0.0);
for (int layer = 0; layer < 8; layer++) {
    float fl = float(layer);
    vec2 layerUV = uv * (1.0 + fl * 0.3);
    
    // Temporal phase modulation
    float phase = temporalPhase(time, 0.2 + fl * 0.05, 0.3 + fl * 0.02);
    
    // Multi-scale pattern generation
    float pattern = 0.0;
    for (int octave = 0; octave < 3; octave++) {
        float fo = float(octave);
        vec2 sampleUV = layerUV * pow(2.0, fo) + phase;
        pattern += fbm(sampleUV, 4, 2.0, 0.5) * exp(-fo);
    }
    
    // Color assignment with spectral variation
    vec3 layerColor = quantumPalette(fl * 0.2 + pattern, time, 
        vec3(sin(time * 0.1 + fl), cos(time * 0.2 + fl), 0.5));
    
    // Depth-based attenuation
    float depth = exp(-fl * 0.25);
    finalColor += layerColor * pattern * depth * 0.8;
}

// Add spectral decomposition
finalColor += spectralDecomposition(uv, time) * 0.4;

// Quantum particle system
finalColor += quantumParticles(uv0, time) * 0.6;

// Dynamic glow effects
float edgeGlow = pow(1.0 - length(uv0), 3.0) * 
                (0.8 + 0.4 * sin(time * 0.7));
finalColor += vec3(edgeGlow) * 0.2;

// Pulsating energy fields
float pulse = 0.1 * sin(time * 0.8 + length(uv0) * 4.0) *
             exp(-length(uv0) * 2.0);
finalColor += pulse * quantumPalette(time * 0.1, time, vec3(0.5));

// Voronoi cellular structure
float cells = 1.0 - voronoi(uv * 8.0, time);
finalColor *= 1.0 + cells * 0.3;

// Advanced vignetting
float vignette = smoothstep(1.2, 0.3, length(uv0));
vignette *= 1.0 - smoothstep(0.7, 1.0, length(uv0)) * 0.5;
finalColor *= vignette;

// Temporal color grading
finalColor = mix(finalColor, finalColor.gbr, 0.1 * sin(time * 0.2));
finalColor = mix(finalColor, finalColor.brg, 0.1 * cos(time * 0.3));

// Film grain with temporal variation
float grain = hash12(fragCoord + time) * 0.02;
finalColor += grain;

// Gamma correction and output
finalColor = pow(finalColor, vec3(0.4545));

// Dynamic brightness modulation
float brightness = 0.9 + 0.1 * sin(time * 0.5);
finalColor *= brightness;

fragColor = vec4(finalColor, 1.0);
}