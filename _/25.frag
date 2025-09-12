void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 ndc = fragCoord / iResolution.xy;
    vec2 uv = ndc - 0.5; uv.x *= iResolution.x / iResolution.y;
    float time = iTime*0.9;

    // barrel distortion (CRT suggestion)
    float r = length(uv);
    uv *= 1.0 + 0.15 * r*r;

    vec3 col = vec3(0.0);
    vec3 dir = normalize(vec3(uv*(1.0 + 0.1*sin(time)), 1.7));
    vec3 origin = vec3(sin(time*0.2)*0.45, cos(time*0.25)*0.4, -time*0.6);

    for(int i=0;i<9;i++){
        float fi=float(i);
        float z = mod(origin.z + fi*0.25 + sin(time + fi)*0.09, 1.25);
        vec3 p = origin + dir*z;
        vec3 g = abs(fract(p*vec3(15.0,17.0,20.0)) - 0.5);
        float grid = smoothstep(0.07, 0.04, min(min(g.x,g.y),g.z));
        col += grid * vec3(0.2 + 0.1*sin(time+fi*0.3), 0.5, 0.88) * (1.2 - z);
    }

    // scanlines
    float scan = sin((fragCoord.y + time*30.0) * 1.5) * 0.06;
    col += scan * vec3(0.08,0.14,0.22);

    // strong chromatic aberration sampling franken (assumes iChannel0 contains previous frame or noise)
    vec2 ca = 0.008 * (uv);
    vec2 pos = fragCoord / iResolution.xy;
    col.r += texture(iChannel0, pos + ca).r * 0.12;
    col.g += texture(iChannel0, pos).g * 0.06;
    col.b += texture(iChannel0, pos - ca).b * 0.12;

    // TV noise / jitter
    float n = fract(sin(dot(fragCoord.xy, vec2(12.9898,78.233))) * 43758.5453 + time*2.0);
    col += 0.03 * (n - 0.5);

    // vignette & contrast
    col *= 0.78 + 0.22 * smoothstep(1.0,0.0,length(uv)*1.6);
    col = pow(col, vec3(0.95)); // slightly harsh
    fragColor = vec4(col,1.0);
}
