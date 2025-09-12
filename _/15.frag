// Iteration 1: Glitching Data Stream
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime;

    // Add noise-based distortion for a 'broken' effect
    vec2 noise = fract(sin(uv * 100.0) * 43758.5453) * 2.0 - 1.0;
    uv += noise * 0.05 * sin(time * 15.0); // Fast, glitchy distortion

    // Create a warped, chaotic grid
    vec2 grid = abs(fract(uv * 15.0 + time * 0.2) - 0.5);
    // Add sine wave distortion with noise for irregularity
    grid.x += sin(uv.y * 12.0 + time * 3.0 + noise.y * 5.0) * 0.15;
    grid.y += cos(uv.x * 10.0 + time * 2.5 + noise.x * 4.0) * 0.15;

    // Add more detail to the grid lines
    float gridLines = smoothstep(0.08, 0.06, length(grid));
    gridLines += smoothstep(0.18, 0.16, length(grid)) * 0.6;

    // Create more complex pulsing nodes with chromatic aberration
    vec2 cellPos = floor(uv * 15.0);
    float node = sin(cellPos.x * 2.1 + cellPos.y * 3.4 + time * 4.0);
    node = 0.5 + 0.5 * node;
    float nodeSize = 0.12 + 0.08 * sin(time * 5.0 + cellPos.x * cellPos.y * 0.5);
    float nodes = smoothstep(nodeSize, nodeSize - 0.07, length(fract(uv * 15.0) - 0.5));
    nodes *= node;
    
    // Create energy beams that also have a glitch effect
    float beam = 0.0;
    for (float i = 0.0; i < 4.0; i++) {
        float beamTime = time * (1.2 + i * 0.4);
        vec2 beamDir = vec2(sin(beamTime), cos(beamTime));
        beam += smoothstep(0.2, 0.0, abs(dot(uv, beamDir) - sin(beamTime * 2.5) * 0.3));
    }
    // Add sharp, flickering lines for glitches
    float glitches = 0.0;
    if (sin(time * 50.0) > 0.9) {
        glitches = smoothstep(0.01, 0.0, abs(uv.x - sin(time * 30.0))) * 0.8;
        glitches += smoothstep(0.01, 0.0, abs(uv.y - cos(time * 35.0))) * 0.8;
    }
    
    // Color scheme: corrupted red and blue
    vec3 col = vec3(0.0);
    col += gridLines * vec3(0.2, 0.5, 1.0);
    col += nodes * vec3(1.0, 0.2, 0.2) * 1.5;
    col += beam * vec3(0.3, 0.7, 1.0);
    col += glitches * vec3(1.0, 0.5, 0.5);
    
    // Add a circular distortion lens effect
    vec2 lensUV = uv * (1.0 + length(uv) * 0.5);
    col = texture(iChannel0, lensUV).rgb;
    
    // Add scanline and flickering effects
    col *= 0.8 + 0.2 * sin(uv.y * iResolution.y * 4.0);
    col *= 0.8 + 0.2 * sin(time * 30.0);
    
    // Add a final bloom pass
    vec3 glow = col * (0.5 + 0.5 * sin(time * 10.0));
    col = pow(col, vec3(1.2)); // increase contrast
    col += glow * 0.5;

    fragColor = vec4(col, 1.0);
}