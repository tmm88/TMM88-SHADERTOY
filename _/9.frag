void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float time = iTime;

    // Rotating grid
    mat2 rot = mat2(cos(time*0.3), -sin(time*0.3),
                    sin(time*0.3),  cos(time*0.3));
    vec2 grid = fract((uv * 10.0) * rot); 
    vec2 center = vec2(0.5);

    float dist = length(grid - center);

    // Layered pulsing radii
    float r1 = 0.3 * (sin(time*1.0) * 0.5 + 0.5);
    float r2 = 0.2 * (sin(time*2.3) * 0.5 + 0.5);
    float c1 = smoothstep(r1, r1 - 0.02, dist);
    float c2 = smoothstep(r2, r2 - 0.02, dist);

    // RGB cycling
    vec3 col = vec3(c1, c2, c1 * c2);
    col *= 0.7 + 0.3 * sin(time + uv.xyx*3.1416);

    fragColor = vec4(col, 1.0);
}
