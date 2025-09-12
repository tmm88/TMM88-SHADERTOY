// Iteration 2: The Organic Network
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime;

    // Create a soft, organic noise field for distortion
    float n = texture(iChannel0, uv * 2.0 + time * 0.05).r * 2.0 - 1.0;
    uv += vec2(n, n) * 0.1;

    // Create a fluid, cellular grid
    vec2 grid = abs(fract(uv * 10.0 + n * 0.2) - 0.5);
    // Add a "breathing" sine wave distortion
    grid.x += sin(uv.y * 8.0 + time * 1.5) * 0.2;
    grid.y += cos(uv.x * 6.0 + time * 1.2) * 0.2;
    
    // Fluid grid lines with feathered edges
    float gridLines = 0.0;
    gridLines += smoothstep(0.1, 0.05, length(grid)) * 0.8;
    gridLines += smoothstep(0.2, 0.15, length(grid)) * 0.5;

    // Pulsing, biological nodes
    vec2 cellPos = floor(uv * 10.0 + n);
    float node = sin(cellPos.x * 1.1 + cellPos.y * 1.8 + time * 2.0);
    node = 0.5 + 0.5 * node;
    float nodeSize = 0.15 + 0.1 * sin(time * 3.0 + cellPos.x * cellPos.y * 0.2);
    float nodes = smoothstep(nodeSize, nodeSize - 0.08, length(fract(uv * 10.0) - 0.5));
    nodes *= node;
    
    // Bioluminescent energy beams
    float beam = 0.0;
    for (float i = 0.0; i < 3.0; i++) {
        float beamTime = time * (0.8 + i * 0.2);
        vec2 beamDir = vec2(sin(beamTime), cos(beamTime));
        beam += smoothstep(0.2, 0.0, abs(dot(uv, beamDir) - sin(beamTime * 1.5) * 0.2));
    }
    // Add a soft, hazy glow to the beams
    float haze = smoothstep(0.2, 0.0, abs(dot(uv, vec2(1.0, 0.0)) - sin(time) * 0.3));
    beam += haze * 0.5;

    // Color scheme: lush green and deep purple
    vec3 col = vec3(0.0);
    col += gridLines * vec3(0.0, 0.5, 0.2) * 1.2;
    col += nodes * vec3(0.8, 0.2, 0.8) * 1.5;
    col += beam * vec3(0.2, 1.0, 0.5);

    // Apply a soft, organic scanline effect
    col *= 0.95 + 0.05 * sin(uv.y * iResolution.y * 1.0 + time * 5.0);
    
    // Add a deep, central glow
    float centralGlow = smoothstep(0.5, 0.0, length(uv)) * 0.5;
    col += centralGlow * vec3(0.1, 0.4, 0.8);

    fragColor = vec4(col, 1.0);
}