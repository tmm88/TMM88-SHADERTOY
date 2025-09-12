void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 0.8;
    float zoom = 1.15 + sin(time*0.35)*0.25;
    vec3 rayDir = normalize(vec3(uv*(1.0+0.08*sin(time)), 1.6));
    vec3 rayOrigin = vec3(sin(time*0.18)*0.45, cos(time*0.28)*0.35, -time*0.55);

    vec3 col = vec3(0.0);
    const int LAYERS = 5;
    vec3 gridScale = vec3(14.0, 17.0, 18.5);

    for (int i = 0; i < LAYERS; ++i) {
        float fi = float(i);
        float z = mod(rayOrigin.z + fi * 0.28 + sin(time + fi)*0.08, 1.1);
        vec3 p = rayOrigin + rayDir * z;
        float w = sin(p.x*0.5 + time) + cos(p.y*0.7 + time*1.1) + p.z*0.25;
        p.xy *= 1.0 + 0.08 * sin(w*2.8 + time);

        vec3 g = abs(fract(p * gridScale * zoom) - 0.5);
        float gridLines = smoothstep(0.065, 0.045, min(min(g.x,g.y),g.z));
        col += gridLines * vec3(0.18 + 0.08*sin(time), 0.46 + 0.08*cos(time), 0.88) * (1.1 - z) * (1.0 + 0.15*w);

        // nodes (cheap)
        float node = max(0.0, 0.06 - length(fract(p*gridScale*zoom)-0.5));
        col += node * vec3(0.7,0.35,0.9) * (1.1 - z) * (0.8 + 0.2*sin(time*2.0 + w));
    }

    // light beams (cheap mix)
    float beam = 0.0;
    for (int i=0;i<3;i++){
        float bt=time*(0.9+float(i)*0.25);
        vec2 bd=vec2(cos(bt*1.1), sin(bt*1.3));
        float p=dot(uv+0.08*sin(time+float(i)), bd);
        beam += smoothstep(0.22, 0.0, abs(p))*(1.0-abs(p))*(0.8+0.15*cos(time+float(i)));
    }
    col += beam * vec3(0.28,0.66,0.9);

    // vignette + subtle noise
    col *= 0.82 + 0.18 * smoothstep(1.0, 0.0, length(uv)*1.5);
    float noise = fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453 + time*0.1);
    col += 0.015 * noise;

    fragColor = vec4(pow(col, vec3(1.05)), 1.0);
}
