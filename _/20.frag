void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 0.75;
    vec3 col = vec3(0.0);

    vec3 rayDir = normalize(vec3(uv*(1.0+0.12*sin(time*0.8)), 1.9));
    vec3 rayOrigin = vec3(sin(time*0.22)*0.6, cos(time*0.28)*0.45, -time*0.65 - 0.3*cos(time*0.5));
    vec3 gridScale = vec3(16.0 + 6.0*sin(time*0.09), 20.0 + 7.0*cos(time*0.12), 22.0);

    const int LAYERS = 16;
    for (int i=0;i<LAYERS;i++){
        float fi=float(i);
        float z = mod(rayOrigin.z + fi*0.18 + sin(time + fi*0.4)*0.12, 1.6);
        vec3 p = rayOrigin + rayDir * z;
        float w = sin(p.x*0.45 + time*1.02) + cos(p.y*0.72 + time*1.3) + p.z*0.35;
        p.xy *= 1.0 + 0.12 * sin(w*3.5 + time);

        vec3 g = abs(fract(p * gridScale * (1.05 + 0.02*fi)) - 0.5);
        float gridLines = smoothstep(0.09 - 0.03*sin(time), 0.04, min(min(g.x,g.y),g.z));
        float att = exp(-fi*0.08) * (1.6 - z); // fog / depth attenuation
        col += gridLines * vec3(0.22 + 0.12*sin(time+fi*0.5), 0.52 + 0.12*cos(time+fi*0.4), 0.94) * att * (1.0 + 0.3*w);

        // nodes with halo
        vec3 fracp = fract(p*gridScale)-0.5;
        float nodes = smoothstep(0.0, 0.07, 0.07 - length(fracp));
        float pulse = 0.5 + 0.5*sin(time*3.8 + dot(floor(p*gridScale), vec3(1.1,2.2,3.3)) + w);
        col += nodes * vec3(0.9,0.45,1.0) * pulse * att * 1.2;
    }

    // volumetric beams (additive god-ray look)
    for (int b=0;b<6;b++){
        float bt=time*(0.7+float(b)*0.3);
        vec2 bd=vec2(cos(bt*1.07), sin(bt*1.31));
        float p=dot(uv*1.2 + 0.12*sin(time+float(b)), bd);
        float beam = smoothstep(0.3, 0.0, abs(p)) * (1.0-abs(p));
        col += beam * (0.6*exp(-float(b)*0.12)) * vec3(0.3+0.1*sin(time+float(b)), 0.75, 1.0);
    }

    // bloom & fog
    vec3 glow = pow(col, vec3(1.1))*0.7;
    col = pow(col, vec3(1.02));
    col += glow*0.8;
    col *= 0.75 + 0.25 * smoothstep(1.0,0.0,length(uv)*1.4);

    float noise = fract(sin(dot(uv, vec2(12.9898,78.233)))*43758.5453 + time*0.3);
    col += 0.02 * noise;

    fragColor = vec4(col,1.0);
}
