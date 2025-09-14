// Hyperdimensional Hash function
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Value noise for smoother transitions
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractional Brownian Motion with multiple dimensions
float fbm(vec2 p, int octaves, float time) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p * frequency + time * 0.1);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

// 4D noise for time-varying effects
float noise4D(vec3 p, float time) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    float a = hash(vec2(i.x, i.y) + time);
    float b = hash(vec2(i.x + 1.0, i.y) + time);
    float c = hash(vec2(i.x, i.y + 1.0) + time);
    float d = hash(vec2(i.x + 1.0, i.y + 1.0) + time);
    
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Convert Cartesian to polar coordinates
vec2 toPolar(vec2 uv) {
    return vec2(atan(uv.y, uv.x), length(uv));
}

// Convert polar to Cartesian coordinates
vec2 fromPolar(vec2 polar) {
    return polar.y * vec2(cos(polar.x), sin(polar.x));
}

// Quantum-inspired color palette with entanglement simulation
vec3 palette(float t, float time, vec2 uv) {
    // Quantum state simulation
    float quantumState = sin(t * 3.14159 * 2.0 + time * 0.5) * 0.5 + 0.5;
    
    // Base colors that shift based on quantum state
    vec3 a = 0.5 + 0.5 * cos(time * 0.2 + vec3(0.0, 1.0, 2.0) + quantumState);
    vec3 b = 0.5 + 0.5 * cos(time * 0.15 + vec3(2.0, 3.0, 1.0) + quantumState);
    vec3 c = 1.0 + 0.5 * cos(time * 0.1 + vec3(1.0, 2.0, 0.0) + quantumState);
    vec3 d = 0.5 + 0.5 * cos(time * 0.25 + vec3(3.0, 1.0, 2.0) + quantumState);
    
    // Entanglement effect - colors react to position
    float entanglement = sin(length(uv) * 10.0 - time * 2.0) * 0.5 + 0.5;
    
    return (a + b * cos(6.28318 * (c * t + d))) * (0.8 + 0.2 * entanglement);
}

// Non-linear oscillation with chaos theory influence
float nonLinearOsc(float x, float time) {
    // Lorenz attractor inspired modulation
    float lorenz = sin(x * 3.14159 + sin(time * 0.25) * 0.7) * 
                   cos(x * 5.0 + cos(time * 0.5) * 0.5);
    
    // Add chaotic element
    float chaos = sin(time * 0.73) * cos(time * 1.27) * 0.1;
    
    return lorenz + chaos;
}

// Advanced Fresnel effect with wavelength dispersion
vec3 fresnel(vec3 viewDir, vec3 normal, float f0, float time) {
    float cosTheta = dot(viewDir, normal);
    float baseFresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
    
    // Chromatic dispersion
    vec3 dispersion = vec3(
        f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0 + sin(time * 0.1) * 0.5),
        f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0 + sin(time * 0.1 + 0.3) * 0.5),
        f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0 + sin(time * 0.1 + 0.6) * 0.5)
    );
    
    return mix(vec3(baseFresnel), dispersion, 0.3);
}

// Rotate function with multiple axes
vec2 rotate(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c) * uv;
}

// Domain repetition with morphing capabilities
vec2 repeat(vec2 uv, float segments, float time) {
    float angle = atan(uv.y, uv.x);
    float segment = 6.28318 / (segments + sin(time * 0.2) * 2.0);
    angle = mod(angle, segment);
    if (angle > segment * 0.5) angle = segment - angle;
    return vec2(angle, length(uv));
}

// Ray marching SDF for 3D effects
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// Audio reactivity simulation (would connect to actual audio in a full implementation)
float audioReactivity(vec2 uv, float time) {
    // Simulate bass, mid, and treble frequencies
    float bass = sin(time * 0.5) * 0.5 + 0.5;
    float mid = sin(time * 2.0) * 0.5 + 0.5;
    float treble = sin(time * 8.0) * 0.5 + 0.5;
    
    // React differently based on position
    return mix(bass, mix(mid, treble, length(uv)), 0.5);
}

// Particle system simulation
vec3 particles(vec2 uv, float time) {
    vec3 particleColor = vec3(0.0);
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec2 position = vec2(
            sin(time * 0.5 + fi * 1.17) * 0.7,
            cos(time * 0.3 + fi * 1.73) * 0.7
        );
        
        float size = 0.01 + 0.005 * sin(time * 2.0 + fi);
        float dist = length(uv - position);
        float intensity = exp(-dist * 100.0 * size);
        
        particleColor += intensity * palette(fi * 0.2, time, uv);
    }
    return particleColor;
}

// Main function
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates with aspect ratio correction
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    
    // Time with smooth variation and audio reactivity
    float time = iTime;
    float slowTime = time * 0.5;
    float audioLevel = audioReactivity(uv, time);
    
    // Create multiple UV layers for parallax effect
    vec2 uv1 = uv * 1.2;
    vec2 uv2 = uv * 0.8;
    
    // Multi-dimensional noise warping
    float n1 = fbm(uv1 + time * 0.1, 6, time) * 0.1;
    float n2 = fbm(uv2 * 1.5 + time * 0.13, 6, time) * 0.07;
    float n3 = noise4D(vec3(uv, time * 0.05), time) * 0.05;
    
    uv += vec2(n1 - n2, n2 - n1) * (0.8 + 0.2 * audioLevel);
    uv += n3;
    
    // Apply kaleidoscopic repetition with morphing
    vec2 polar = toPolar(uv);
    polar = repeat(polar, 6.0 + 4.0 * sin(time * 0.2) + 2.0 * audioLevel, time);
    uv = fromPolar(polar);
    
    // Add multidimensional distortion
    polar = toPolar(uv);
    polar.y += nonLinearOsc(polar.x * 2.0, time) * (0.6 + 0.2 * audioLevel);
    uv = fromPolar(polar);
    
    // Dynamic rotation with multiple layers
    float angle1 = time * 0.22 + nonLinearOsc(time * 0.1, time) * 0.35;
    float angle2 = time * 0.15 + nonLinearOsc(time * 0.2 + 1.0, time) * 0.25;
    
    uv = rotate(uv, angle1);
    vec2 uvLayer2 = rotate(uv, angle2);
    
    // Breathing zoom with audio reactivity
    float zoom = 1.3 + 0.25 * sin(time * 0.3 + length(uv0) * 0.5) + 0.1 * audioLevel;
    uv *= zoom;
    uvLayer2 *= zoom * 1.1;
    
    // Initialize color
    vec3 finalColor = vec3(0.0);
    
    // Multidimensional layering with parallax
    for (float i = 0.0; i < 12.0; i++) {
        float fi = i;
        float layerTime = time * (0.9 + fi * 0.05);
        
        // Alternate between UV layers for depth
        vec2 layerUV = mix(uv, uvLayer2, mod(fi, 2.0));
        float layerFactor = 1.4 + 0.05 * sin(layerTime * 0.1 + fi);
        vec2 warpedUV = fract(layerUV * layerFactor) - 0.5;
        
        // Distance field with modulation
        float d = length(warpedUV) * exp(-length(uv0) * 0.7);
        float noise = fbm(uv0 + fi * 0.1 + layerTime * 0.03, 3, time) * 0.12;
        
        // Animated color parameter
        float t = length(uv0) + fi * 0.04 + layerTime * 0.05 + noise;
        vec3 col = palette(t, layerTime, uv0);
        
        // Pattern generation with time variation
        d = sin(d * (28.0 + 5.0 * audioLevel) + layerTime * 0.65) / 7.5;
        d = abs(d);
        d = pow(0.007 / d, 1.7);
        
        // Layer fading with exponential decay
        float fade = exp(-fi * 0.15);
        finalColor += col * d * fade * (1.0 + 0.2 * audioLevel);
    }
    
    // Add particle system
    finalColor += particles(uv0, time) * 0.3;
    
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    // Advanced fresnel glow with dispersion
    vec3 fresnelColor = fresnel(vec3(0.0, 0.0, 1.0), normalize(vec3(uv0, 1.0)), 0.1, time);
    finalColor += fresnelColor * 0.15 * palette(length(uv0), time, uv0);
    
    // Enhanced radial pulse with audio reactivity
    float pulseDist = 0.1 * sin(time * 0.4 + length(uv0) * 2.5) * (1.0 + 0.3 * audioLevel);
    finalColor += pulseDist * palette(time * 0.08 + length(uv0), time, uv0);
    
    // Vignette effect with audio modulation
    float vignette = 1.0 - pow(length(fragCoord / iResolution.xy - 0.5), 2.4) * (0.75 - 0.1 * audioLevel);
    finalColor *= vignette;
    
    // Color correction and gamma adjustment
    finalColor = pow(finalColor, vec3(1.0/2.2));
    
    // Hyperdimensional film grain
    float grain = hash(fragCoord + time) * 0.02;
    finalColor += grain;
    
    // CRT scanline effect
    float scanline = sin(fragCoord.y * 3.14159 * 2.0) * 0.01;
    finalColor -= scanline;
    
    // Output to screen with final tweaks
    fragColor = vec4(finalColor, 1.0);
}