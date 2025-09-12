// Aether Tunnel
// Uniforms: 
//   uIntensity (0.0-2.0) - Overall effect intensity
//   uDetail (1-20) - Level of detail/complexity
//   uColorMode (0-3) - Color palette selection
//   uSpeed (0.0-2.0) - Animation speed

uniform float uIntensity;
uniform float uDetail;
uniform float uColorMode;
uniform float uSpeed;

// Audio processing function - samples multiple frequency bands
vec4 audioData() {
    float low = texture(iChannel1, vec2(0.1, 0.5)).r;
    float mid = texture(iChannel1, vec2(0.3, 0.5)).g;
    float high = texture(iChannel1, vec2(0.5, 0.5)).b;
    float volume = (low + mid + high) / 3.0;
    
    return vec4(low, mid, high, volume);
}

// Color palette generator
vec3 getColor(float index, float time, vec4 audio) {
    float hue = 0.0;
    
    if (uColorMode < 1.0) {
        // Default: Audio-reactive electric blues and purples
        hue = 0.5 + 0.5 * sin(time * 0.5 + index * 0.2 + audio.r * 5.0);
        return mix(vec3(0.1, 0.3, 0.8), vec3(0.8, 0.3, 1.0), hue);
    } else if (uColorMode < 2.0) {
        // Warm fiery colors based on bass
        hue = 0.3 + 0.7 * audio.r;
        return mix(vec3(0.9, 0.1, 0.0), vec3(1.0, 0.9, 0.2), hue);
    } else if (uColorMode < 3.0) {
        // Cool icy colors based on treble
        hue = 0.3 + 0.7 * audio.b;
        return mix(vec3(0.0, 0.2, 0.7), vec3(0.5, 1.0, 1.0), hue);
    } else {
        // Psychedelic spectrum based on all frequencies
        hue = fract(time * 0.1 + index * 0.05 + audio.r * 0.5);
        vec3 color = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
        return color * (0.8 + 0.4 * audio.a);
    }
}

// Complex signed distance function for a dynamic, audio-reactive grid
float complexGridSDF(vec3 p, float scale, float time, vec4 audio) {
    p.x += sin(p.y * 3.0 + time * 0.5) * 0.2 * audio.r;
    p.y += cos(p.x * 2.0 + time * 0.4) * 0.2 * audio.g;
    p.z += sin(p.x + p.y + time) * 0.2 * audio.b;
    vec3 g = abs(fract(p * scale) - 0.5);
    return min(min(g.x, g.y), g.z);
}

// Signed distance function for pulsating nodes
float pulsatingSphereSDF(vec3 p, float r, float time, vec4 audio) {
    float pulse = 1.0 + 0.5 * sin(time * 5.0 + p.z * 2.0) * audio.a;
    return length(fract(p * 4.0) - 0.5) - r * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    
    float time = iTime * (0.8 + 0.4 * uSpeed);
    vec4 audio = audioData();
    
    // Deeper camera movement with more audio influence
    vec3 rayDir = normalize(vec3(uv * (1.0 + 0.15 * audio.a), 1.5));
    vec3 origin = vec3(
        sin(time * 0.3 + audio.r * 1.0) * 0.4 * (1.0 + 0.3 * audio.r),
        cos(time * 0.4 + audio.g * 1.0) * 0.3 * (1.0 + 0.3 * audio.g),
        -time * (0.5 + 0.5 * uIntensity + 0.5 * audio.a)
    );
    
    // Beat detection
    float beat = smoothstep(0.2, 0.0, abs(sin(time * 3.0) - audio.a));
    beat = max(beat, smoothstep(0.15, 0.0, abs(fract(time * 0.5) - 0.5) - audio.a * 0.3));
    
    vec3 col = vec3(0.0);
    
    int LAYERS = int(clamp(uDetail, 3.0, 24.0));
    float layerSpacing = 0.22 - 0.1 * audio.a;
    
    for (int i = 0; i < LAYERS; i++) {
        float fi = float(i);
        float z = mod(origin.z + fi * layerSpacing + sin(time + fi * 0.4) * 0.1, 1.8);
        
        vec3 p = origin + rayDir * z;
        float depthFog = 1.0 - z / 2.0;
        
        // Grid pattern with audio modulation and complex SDF
        float gridScale = 14.0 + 8.0 * audio.g;
        float grid = smoothstep(0.08, 0.02, complexGridSDF(p, gridScale, time, audio));
        
        // Pulsating nodes with audio reactivity
        float nodeSize = 0.04 + 0.05 * audio.b;
        float nodes = smoothstep(nodeSize, 0.01, pulsatingSphereSDF(p, 0.03, time, audio));
        
        // Color selection
        vec3 color = getColor(fi, time, audio);
        
        // Add elements to final color with depth fading and beat-reactive intensity
        col += grid * color * depthFog * (1.0 + 1.0 * beat * audio.a);
        col += nodes * (2.0 + 3.0 * audio.a) * mix(vec3(1.0), color, 0.7) * depthFog * (1.0 + 0.5 * beat);
    }
    
    // Radial vignette
    float vignette = 1.0 - smoothstep(0.5, 1.2, length(uv) * 1.5);
    col *= vignette;
    
    // Enhanced audio-responsive pulse effect
    float pulse = 0.5 + 0.5 * sin(time * 10.0 + audio.a * 30.0);
    col += 0.1 * audio.a * pulse * vignette;
    
    // Subtle film grain
    vec2 noiseUV = fragCoord / iResolution.xy;
    float grain = fract(sin(dot(noiseUV, vec2(12.9898, 78.233))) * 43758.5453);
    col += 0.02 * grain * (0.3 + 0.7 * audio.a);
    
    // Tone mapping and gamma correction
    col = pow(col, vec3(1.0 / 1.8));
    col = col / (1.0 + col); // Simple Reinhard tonemapping
    
    fragColor = vec4(col, 1.0);
}
