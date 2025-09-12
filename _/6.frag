void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // Normalize coordinates
    float time = iTime * 0.5; // Slow down animation
    
    // Create wave pattern
    float wave = sin(uv.x * 10.0 + time) * cos(uv.y * 10.0 + time) * 0.5 + 0.5;
    
    // Color based on wave and time
    vec3 col = vec3(
        sin(wave + time) * 0.5 + 0.5,
        cos(wave + time * 0.7) * 0.5 + 0.5,
        sin(wave + time * 0.3) * 0.5 + 0.5
    );
    
    fragColor = vec4(col, 1.0);
}