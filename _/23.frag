void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord/iResolution.xy)-0.5; uv.x*=iResolution.x/iResolution.y;
    float time=iTime*0.9;

    vec3 col=vec3(0.0);
    vec3 rayDir = normalize(vec3(uv*(1.0+0.06*sin(time)), 1.6));
    vec3 origin = vec3(sin(time*0.18)*0.5, cos(time*0.22)*0.45, -time*0.6);

    const int LAYERS=8;
    vec3 scale = vec3(12.0,16.0,18.0);
    for(int i=0;i<LAYERS;i++){
        float fi=float(i);
        float z=mod(origin.z + fi*0.26 + sin(time+fi)*0.07, 1.2);
        vec3 p = origin + rayDir*z;
        vec3 g = fract(p*scale) - 0.5;
        float edge = length(g.xy);
        float wire = smoothstep(0.03, 0.018, edge);
        // rim by normal-like dot
        float rim = max(0.0, 1.0 - length(g)*2.0);
        vec3 neon = vec3(0.95, 0.35, 1.0); // magenta neon
        vec3 cyan = vec3(0.1, 1.0, 0.95);
        col += wire * mix(neon, cyan, 0.5 + 0.5*sin(time+fi)) * (1.2 - z) * (0.9 + 0.3*rim);

        // node center bright
        float node = smoothstep(0.07, 0.01, 0.06 - length(g));
        col += node * vec3(1.0,0.75,0.95) * (1.2 - z) * (0.6 + 0.4*sin(time*4.0 + fi));
    }

    // heavy bloom look
    vec3 glow = pow(col, vec3(0.9)) * 0.9;
    col = pow(col, vec3(1.02)) + glow * 0.95;
    col *= 0.7 + 0.3*smoothstep(1.0, 0.0, length(uv)*1.2);

    // slight chromatic offset
    vec2 ca = 0.004*uv;
    col.r += texture(iChannel0, (fragCoord.xy/iResolution.xy) + ca).r * 0.08;
    col.b += texture(iChannel0, (fragCoord.xy/iResolution.xy) - ca).b * 0.08;

    fragColor = vec4(col,1.0);
}
