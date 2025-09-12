void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 uv = fragCoord / iResolution.xy;
uv -= 0.5;
uv.x *= iResolution.x / iResolution.y;
float time = iTime * 0.8;  // Slightly slow down time for smoother transitions
// Enhanced perspective with dynamic zoom and camera movement
float zoom = 1.2 + sin(time * 0.4) * 0.3 + cos(time * 0.7) * 0.1;
vec3 rayDir = normalize(vec3(uv * (1.0 + 0.1 * sin(time)), 1.8));  // Add slight distortion to ray direction
vec3 rayOrigin = vec3(sin(time * 0.2) * 0.5, cos(time * 0.3) * 0.4, -time * 0.6 - cos(time * 0.5) * 0.2);
vec3 col = vec3(0.0);
for (float i = 0.0; i < 8.0; i++) {  // Increase layers for deeper hyperspatial depth
// Modulated depth stepping with hyperspatial warping
float z = mod(rayOrigin.z + i * 0.25 + sin(time + i) * 0.1, 1.2);
vec3 p = rayOrigin + rayDir * z;
// Introduce 4D-like projection: simulate w coordinate
float w = sin(p.x * 0.5 + time) + cos(p.y * 0.7 + time * 1.2) + p.z * 0.3;
p.xy *= 1.0 + 0.1 * sin(w * 3.0 + time);  // Warp XY based on simulated 4D
// Enhanced 3D grid with multi-scale fractals
vec3 gridScale = vec3(15.0 + 5.0 * sin(time * 0.1), 18.0 + 6.0 * cos(time * 0.15), 20.0);
vec3 grid = abs(fract(p * gridScale * zoom) - 0.5);
float gridLines = smoothstep(0.07 - 0.02 * sin(time), 0.05, min(grid.x, min(grid.y, grid.z)));  // Thicker multi-axis lines
gridLines *= smoothstep(0.12, 0.02, length(grid.xy + grid.z * 0.5));  // Blend with Z for depth
col += gridLines * vec3(0.2 + 0.1 * sin(time), 0.5 + 0.1 * cos(time), 0.9) * (1.2 - z) * (1.0 + 0.2 * w);
// More complex nodes with hyperspatial pulsing and connections
vec3 nodePos = floor(p * gridScale * zoom);
float nodeAnim = sin(nodePos.x * 1.3 + nodePos.y * 1.7 + nodePos.z * 2.3 + w * 1.5 + time * 3.5);
nodeAnim = 0.6 + 0.4 * nodeAnim;
float nodeSize = 0.08 + 0.06 * sin(time * 4.5 + dot(nodePos, vec3(1.1, 2.2, 3.3)) + w);
float nodes = smoothstep(nodeSize, nodeSize - 0.04, length(fract(p * gridScale * zoom) - 0.5));
nodes *= nodeAnim * (1.0 + 0.3 * sin(time * 2.0 + w));  // Add 4D-influenced pulse
// Add node connections like neural links in hyperspace
vec3 neighborOffset = vec3(1.0, 0.0, 0.0);  // Example: connect to X neighbor
vec3 neighborPos = floor((p + neighborOffset) * gridScale * zoom);
float link = smoothstep(0.02, 0.01, abs(length(fract(p * gridScale * zoom) - 0.5) - 0.4));  // Thin lines between nodes
link *= 0.5 + 0.5 * sin(time * 5.0 + dot(nodePos, neighborPos));
nodes += link * 0.6;
col += nodes * vec3(0.7 + 0.1 * cos(time), 0.4, 0.9 + 0.1 * sin(time)) * (1.2 - z);
// Introduce subtle hyperspatial distortions (like wormholes)
float distort = sin(p.x * 5.0 + time) * cos(p.y * 4.0 + time) * sin(p.z * 3.0 + w + time);
p += 0.05 * distort * rayDir;  // Perturb position for warping effect
}
// Intricate 3D light beams with branching and hyperspatial bending
float beam = 0.0;
for (float i = 0.0; i < 5.0; i++) {  // More beams for complexity
float beamTime = time * (0.8 + i * 0.25);
vec2 beamDir = vec2(cos(beamTime * 1.1), sin(beamTime * 1.3));
float p = dot(uv + 0.1 * sin(time + i), beamDir) + sin(time * 2.2 + i * 0.5);
float branch = sin(p * 10.0 + time) * 0.1;  // Add branching effect
beam += smoothstep(0.25 + branch, 0.0, abs(p + branch)) * (1.0 - abs(p)) * (0.8 + 0.2 * cos(time + i));
}
col += beam * vec3(0.3 + 0.1 * sin(time), 0.7, 0.9 + 0.1 * cos(time));
// Enhanced glow with bloom-like effect and hyperspatial aura
vec3 glow = col * (0.6 + 0.4 * sin(time * 12.0 + length(uv) * 5.0));
col = pow(col, vec3(1.1));  // Softer gamma
col += glow * 0.6;
col += 0.2 * smoothstep(0.9, 0.1, length(uv + vec2(sin(time * 0.5), cos(time * 0.4)))) * vec3(0.05, 0.15, 0.25);  // Dynamic ambient halo
// Post-processing: vignette, chromatic aberration, and scanlines for retro-futuristic feel
col *= 0.8 + 0.2 * smoothstep(1.0, 0.0, length(uv) * 1.5);  // Vignette
vec2 caOffset = 0.005 * uv;
col.r += texture(iChannel0, uv + caOffset).r * 0.1;  // Assume iChannel0 is self for aberration (or noise)
col.b += texture(iChannel0, uv - caOffset).b * 0.1;
float scan = sin(uv.y * iResolution.y * 0.5 + time * 10.0) * 0.05;
col += scan * vec3(0.1, 0.2, 0.3);
// Final output with subtle noise for organic hyperspatial feel
float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + time);
col += 0.02 * noise * vec3(1.0);
fragColor = vec4(col, 1.0);
}