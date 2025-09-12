void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float time = iTime;

    // Grid with jitter offsets
    vec2 jitter = vec2(sin(time*3.0 + uv.y*20.0),
                       cos(time*2.0 + uv.x*20.0)) * 0.05;
    vec2 grid = fract(uv * 10.0 + jitter);
    vec2 center = vec2(0.5);

    // Distance metrics (circle vs square morph)
    float distCircle = length(grid - center);
    float distSquare = max(abs(grid.x - center.x), abs(grid.y - center.y));
    float morph = mix(distCircle, distSquare, 0.5 + 0.5*sin(time*0.7));

    // Pulsing radius
    float radius = 0.35 * (0.5 + 0.5*sin(time*1.2));
    float shape = smoothstep(radius, radius-0.02, morph);

    // Glitching color bands
    vec3 col = vec3(shape * sin(time + uv.x*10.0),
                    shape * cos(time*1.3 + uv.y*15.0),
                    shape);
    fragColor = vec4(col, 1.0);
}
