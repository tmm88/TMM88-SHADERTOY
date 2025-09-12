void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    float time = iTime * 0.5;
    
    // Polar coordinates for radial effects
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    // Multi-layered kaleidoscope with dynamic sectors
    float sectors = 6.0 + floor(sin(time * 0.3) * 3.0 + 4.0);
    angle = mod(angle, 2.0 * 3.14159 / sectors);
    angle = abs(angle - 3.14159 / sectors);
    
    // Recursive fractal distortion for depth
    for(int i = 0; i < 5; i++) {
        uv = abs(uv) / dot(uv, uv) - 0.7;
        uv *= 1.1;
        uv += sin(uv.yx * 3.0 + time * 0.5) * 0.1;
    }
    
    // Dynamic distance field with multiple influences
    float dist = length(uv);
    float pulse = 0.3 + 0.2 * sin(time * 2.0 + dist * 10.0);
    float ripple = sin(dist * 20.0 - time * 5.0) * 0.05;
    float circle = smoothstep(pulse + ripple, pulse + ripple - 0.1, dist);
    
    // Complex color mapping with multiple frequencies
    vec3 col = vec3(0.0);
    col.r = 0.5 + 0.5 * sin(time * 1.7 + uv.x * 8.0 + uv.y * 3.0);
    col.g = 0.5 + 0.5 * sin(time * 2.3 + uv.y * 7.0 - uv.x * 4.0);
    col.b = 0.5 + 0.5 * sin(time * 3.1 - uv.x * 5.0 + uv.y * 6.0);
    
    // Add radial color gradient
    col *= 1.0 - dist * 0.7;
    
    // Apply the circle pattern with glow
    col *= circle;
    col += circle * circle * 0.3 * (1.0 + sin(time * 4.0));
    
    // Vignette effect
    col *= 1.0 - smoothstep(0.5, 1.5, length(fragCoord / iResolution.xy - 0.5));
    
    fragColor = vec4(col, 1.0);
}