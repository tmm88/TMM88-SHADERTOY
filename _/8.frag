void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // Normalize coordinates
    float time = iTime;
    
    // Create grid
    vec2 grid = fract(uv * 10.0); // 10x10 grid
    vec2 center = vec2(0.5); // Center of each grid cell
    
    // Distance to center of nearest cell
    float dist = length(grid - center);
    
    // Pulsing radius
    float radius = 0.3 * (sin(time) * 0.5 + 0.5);
    float circle = smoothstep(radius, radius - 0.02, dist);
    
    // Color with slight tint
    vec3 col = vec3(circle * 0.8, circle * 0.9, circle);
    fragColor = vec4(col, 1.0);
}