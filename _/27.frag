// Audio-Reactive Grid Tunnel
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
    // Sample low, mid, and high frequencies
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
        // Default: Audio-reactive hues
        hue = 0.5 + 0.5 * sin(time * 0.5 + index * 0.2 + audio.r * 5.0);
        return mix(vec3(0.2, 0.5, 0.9), vec3(1.0, 0.4, 0.9), hue);
    } else if (uColorMode < 2.0) {
        // Warm colors based on bass
        hue = 0.3 + 0.7 * audio.r;
        return mix(vec3(0.8, 0.2, 0.1), vec3(1.0, 0.8, 0.1), hue);
    } else if (uColorMode < 3.0) {
        // Cool colors based on treble
        hue = 0.3 + 0.7 * audio.b;
        return mix(vec3(0.1, 0.2, 0.8), vec3(0.4, 0.9, 1.0), hue);
    } else {
        // Full spectrum based on all frequencies
        hue = fract(time * 0.1 + index * 0.05 + audio.r * 0.5);
        vec3 color = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
        return color * (0.8 + 0.4 * audio.a);
    }
}

// Signed distance function for grid
float gridSDF(vec3 p, float scale) {
    vec3 g = abs(fract(p * scale) - 0.5);
    return min(min(g.x, g.y), g.z);
}

// Signed distance function for sphere
float sphereSDF(vec3 p, float r) {
    return length(fract(p * 4.0) - 0.5) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    
    float time = iTime * (0.8 + 0.4 * uSpeed);
    vec4 audio = audioData();
    
    // Camera movement with audio influence
    vec3 rayDir = normalize(vec3(uv * (1.0 + 0.1 * audio.a), 1.5));
    vec3 origin = vec3(
        sin(time * 0.3) * 0.4 * (1.0 + 0.2 * audio.r),
        cos(time * 0.4) * 0.3 * (1.0 + 0.2 * audio.g),
        -time * (0.5 + 0.3 * uIntensity)
    );
    
    // Beat detection
    float beat = smoothstep(0.2, 0.0, abs(sin(time * 3.0) - audio.a));
    beat = max(beat, smoothstep(0.15, 0.0, abs(fract(time * 0.5) - 0.5) - audio.a * 0.3));
    
    vec3 col = vec3(0.0);
    float depthFog = 0.0;
    
    int LAYERS = int(clamp(uDetail, 3.0, 24.0));
    float layerSpacing = 0.22 - 0.06 * audio.a;
    
    for (int i = 0; i < LAYERS; i++) {
        float fi = float(i);
        float z = mod(origin.z + fi * layerSpacing + sin(time + fi * 0.4) * 0.1, 1.8);
        
        vec3 p = origin + rayDir * z;
        depthFog = 1.0 - z / 2.0;
        
        // Grid pattern with audio modulation
        float gridScale = 14.0 + 4.0 * audio.g;
        float grid = smoothstep(0.08, 0.02, gridSDF(p, gridScale));
        
        // Nodes with audio reactivity
        float nodeSize = 0.04 + 0.03 * audio.b;
        float nodes = smoothstep(nodeSize, 0.01, sphereSDF(p, 0.03));
        
        // Color selection
        vec3 color = getColor(fi, time, audio);
        
        // Add elements to final color with depth fading
        col += grid * color * depthFog * (1.0 + 0.7 * beat);
        col += nodes * (1.5 + 2.0 * audio.a) * mix(vec3(1.0), color, 0.7) * depthFog;
    }
    
    // Radial vignette
    float vignette = 1.0 - smoothstep(0.5, 1.2, length(uv) * 1.5);
    col *= vignette;
    
    // Audio-responsive pulse effect
    float pulse = 0.5 + 0.5 * sin(time * 10.0 + audio.a * 20.0);
    col += 0.05 * audio.a * pulse * vignette;
    
    // Subtle film grain
    vec2 noiseUV = fragCoord / iResolution.xy;
    float grain = fract(sin(dot(noiseUV, vec2(12.9898, 78.233))) * 43758.5453);
    col += 0.02 * grain * (0.3 + 0.7 * audio.a);
    
    // Tone mapping and gamma correction
    col = pow(col, vec3(1.0 / 1.8));
    col = col / (1.0 + col); // Simple Reinhard tonemapping
    
    fragColor = vec4(col, 1.0);
}