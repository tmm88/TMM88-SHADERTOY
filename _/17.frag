// Iteration 3: Hyperspatial Construct
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime;

    // Create a perspective effect by mapping uv to a 3D-like space
    float zoom = 1.0 + sin(time * 0.5) * 0.2;
    vec3 rayDir = normalize(vec3(uv, 1.5));
    vec3 rayOrigin = vec3(0.0, 0.0, -time * 0.5);

    vec3 col = vec3(0.0);
    for (float i = 0.0; i < 5.0; i++) {
        // Step through the depth of the scene
        float z = mod(rayOrigin.z + i * 0.3, 1.0);
        vec3 p = rayOrigin + rayDir * z;

        // Create a 3D grid based on the position
        vec3 grid = abs(fract(p * 20.0 * zoom) - 0.5);

        // Grid lines with perspective
        float gridLines = smoothstep(0.08, 0.06, length(grid.xy));
        gridLines *= smoothstep(0.1, 0.0, length(grid.z));
        col += gridLines * vec3(0.3, 0.6, 1.0) * (1.0 - z);

        // Complex 3D nodes
        vec3 nodePos = floor(p * 20.0 * zoom);
        float node = sin(nodePos.x * 1.2 + nodePos.y * 1.8 + nodePos.z * 2.1 + time * 3.0);
        node = 0.5 + 0.5 * node;
        float nodeSize = 0.1 + 0.05 * sin(time * 4.0 + dot(nodePos, vec3(1.0, 2.0, 3.0)));
        float nodes = smoothstep(nodeSize, nodeSize - 0.05, length(fract(p * 20.0 * zoom) - 0.5));
        nodes *= node;
        col += nodes * vec3(0.8, 0.3, 1.0) * (1.0 - z);
    }
    
    // Add intricate light beams that appear to move in 3D
    float beam = 0.0;
    for (float i = 0.0; i < 3.0; i++) {
        float beamTime = time * (1.0 + i * 0.2);
        vec2 beamDir = vec2(cos(beamTime), sin(beamTime));
        float p = dot(uv, beamDir) + sin(time * 2.0);
        beam += smoothstep(0.3, 0.0, abs(p)) * (1.0 - abs(p));
    }
    col += beam * vec3(0.4, 0.8, 1.0);

    // Apply a soft glow and final effects
    vec3 glow = col * (0.5 + 0.5 * sin(time * 10.0));
    col = pow(col, vec3(1.2));
    col += glow * 0.5;

    // Add subtle ambient light
    col += 0.1 * smoothstep(0.8, 0.0, length(uv)) * vec3(0.1, 0.2, 0.3);

    // Final color output
    fragColor = vec4(col, 1.0);
}