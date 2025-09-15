// ShaderToy or GLSL-style format

// ---------- HASHING / NOISE ----------
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(hash(i), hash(i + vec2(1, 0)), u.x),
        mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return value;
}

// ---------- COORDINATE MANIPULATION ----------
vec2 toPolar(vec2 uv) {
    return vec2(atan(uv.y, uv.x), length(uv));
}

vec2 fromPolar(vec2 polar) {
    return polar.y * vec2(cos(polar.x), sin(polar.x));
}

vec2 rotate(vec2 uv, float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * uv;
}

vec2 kaleido(vec2 uv, float seg) {
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float sector = 6.28318 / seg;
    angle = mod(angle, sector);
    angle = abs(angle - sector * 0.5);
    return vec2(cos(angle), sin(angle)) * radius;
}

// ---------- COLOR PALETTE ----------
vec3 palette(float t, float time) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    
    return a + b * cos(6.28318 * (c * t + d + time * 0.05));
}

// ---------- PARTICLES ----------
vec3 particles(vec2 uv, float time) {
    vec3 col = vec3(0.0);
    for (int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 pos = vec2(
            sin(time * 0.5 + fi * 1.3) * 0.6,
            cos(time * 0.3 + fi * 1.7) * 0.6
        );
        float d = length(uv - pos);
        float intensity = exp(-pow(d * 20.0, 2.0));
        col += palette(fi * 0.3, time) * intensity;
    }
    return col;
}

// ---------- MAIN ----------
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    
    float time = iTime;
    float tSlow = time * 0.5;
    
    // Warping
    float n1 = fbm(uv * 1.3 + time * 0.1) * 0.15;
    float n2 = fbm(uv * 0.7 - time * 0.08) * 0.1;
    uv += vec2(n1 - n2, n2 - n1);
    
    // Kaleidoscopic + Polar warping
    vec2 polar = toPolar(uv);
    polar = kaleido(polar, 8.0 + 2.0 * sin(time * 0.2));
    uv = fromPolar(polar);
    
    // Rotate and zoom
    uv = rotate(uv, time * 0.1);
    uv *= 1.1 + 0.2 * sin(time * 0.25);
    
    // Multi-layered color fractals
    vec3 finalColor = vec3(0.0);
    for (int i = 0; i < 6; i++) {
        float fi = float(i);
        vec2 layerUV = fract(uv * (1.5 + fi * 0.2)) - 0.5;
        float d = length(layerUV);
        float m = sin(d * (20.0 + fi * 2.0) - time * 0.6) / 8.0;
        m = abs(m);
        m = pow(0.008 / m, 1.5);
        finalColor += palette(fi * 0.1 + length(uv0), time) * m * exp(-fi * 0.15);
    }
    
    // Particles & glow
    finalColor += particles(uv0, time) * 0.3;
    
    // Fresnel-like glow
    float edge = pow(1.0 - length(uv0), 4.0);
    finalColor += vec3(edge) * 0.15;
    
    // Bloom pulse
    float pulse = 0.08 * sin(time * 0.4 + length(uv0) * 2.5);
    finalColor += pulse * palette(length(uv0), time);
    
    // Vignette
    float vignette = smoothstep(1.0, 0.5, length(uv0));
    finalColor *= vignette;
    
    // Grain & gamma correction
    finalColor = pow(finalColor, vec3(0.4545));
    finalColor += hash(fragCoord + time) * 0.015;
    
    fragColor = vec4(finalColor, 1.0);
}
