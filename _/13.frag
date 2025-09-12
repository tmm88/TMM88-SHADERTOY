void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime;
    
    // Create a warped grid pattern
    vec2 grid = abs(fract(uv * 12.0) - 0.5);
    
    // Add sine wave distortion to the grid
    grid.x += sin(uv.y * 10.0 + time * 2.0) * 0.1;
    grid.y += cos(uv.x * 8.0 + time * 1.7) * 0.1;
    
    // Calculate grid lines with varying thickness
    float gridLines = smoothstep(0.07, 0.05, length(grid));
    gridLines += smoothstep(0.15, 0.13, length(grid)) * 0.5;
    
    // Create pulsing nodes at grid intersections
    vec2 cellPos = floor(uv * 12.0);
    float node = sin(cellPos.x * 1.3 + cellPos.y * 2.1 + time * 3.0);
    node = 0.5 + 0.5 * node;
    float nodeSize = 0.1 + 0.05 * sin(time * 4.0 + cellPos.x * cellPos.y * 0.3);
    float nodes = smoothstep(nodeSize, nodeSize - 0.05, length(fract(uv * 12.0) - 0.5));
    nodes *= node;
    
    // Create energy beams between nodes
    float beam = 0.0;
    for (float i = 0.0; i < 3.0; i++) {
        float beamTime = time * (1.0 + i * 0.3);
        vec2 beamDir = vec2(sin(beamTime), cos(beamTime));
        beam += smoothstep(0.3, 0.0, abs(dot(uv, beamDir) - sin(beamTime * 2.0) * 0.2));
    }
    
    // Color scheme: cybernetic blue/purple
    vec3 col = vec3(0.0);
    col += gridLines * vec3(0.2, 0.5, 1.0);
    col += nodes * vec3(0.8, 0.3, 1.0);
    col += beam * vec3(0.4, 0.8, 1.0);
    
    // Add scanline effect
    col *= 0.9 + 0.1 * sin(uv.y * iResolution.y * 2.0);
    
    // Bloom/glow effect
    col += smoothstep(0.3, 0.0, length(uv)) * 0.2;
    
    // Flickering intensity
    col *= 0.9 + 0.1 * sin(time * 20.0);
    
    fragColor = vec4(col, 1.0);
}