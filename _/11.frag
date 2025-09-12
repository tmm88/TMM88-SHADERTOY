void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float time = iTime;

    // Mirror symmetry for kaleidoscope
    uv = abs(uv * 2.0 - 1.0);
    vec2 grid = fract(uv * 12.0);
    vec2 center = vec2(0.5);

    float dist = length(grid - center);

    // Radial breathing radius
    float radius = 0.25 + 0.15*sin(time*2.0 + uv.x*10.0);
    float circle = smoothstep(radius, radius-0.02, dist);

    // Spectral color mapping
    vec3 col = vec3(sin(time*0.7 + uv.x*5.0),
                    sin(time*1.1 + uv.y*7.0),
                    sin(time*1.5 + uv.x*3.0 + uv.y*3.0)) * 0.5 + 0.5;
    col *= circle;

    // Soft glow effect
    col += circle * 0.2;
    fragColor = vec4(col, 1.0);
}
