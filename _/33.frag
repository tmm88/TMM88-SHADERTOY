mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 1.05;

    // Waveform-based symmetry
    float sectors = 9.0;
    float ang = atan(uv.y * (1.0 + sin(time)), uv.x) + cos(time * 0.2);
    float radius = length(uv) + 0.15 * sin(time * 2.0 + ang * 4.0);
    ang = mod(ang, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    vec3 rayDir = normalize(vec3(uv * (1.1 + 0.09 * cos(time * 1.2)), 1.9));
    vec3 origin = vec3(cos(time * 0.15) * 0.3, sin(time * 0.25) * 0.4, -time * 1.0);

    vec3 col = vec3(0.0);
    for(int i = 0; i < 10; i++){
        float fi = float(i);
        float z = mod(origin.z + fi * 0.22 + cos(time * 1.1 + fi) * 0.13, 1.3);
        vec3 p = origin + rayDir * z;
        // Harmonic ripple folding
        p.xy *= rot(sin(time + fi) * 0.3);
        p = abs(fract(p.xz * vec2(13.0, 16.0)) - 0.5) * 2.2 - 1.1;
        float wave = sin(p.x * 5.0 + p.y * 3.0 + time) * 0.2 + p.z;
        float g = smoothstep(0.07, 0.02, abs(wave));
        col += g * vec3(0.2 + 0.12 * sin(time + fi * 2.0), 0.55, 0.85) * (1.3 - z);
    }

    // Rippling harmonic beams
    for(int b = 0; b < 10; b++){
        float bt = time * (1.2 + float(b) * 0.09);
        float ripple = dot(uv, vec2(cos(bt + float(b) * 0.5), sin(bt - float(b)))) + sin(bt * 4.0) * 0.08;
        col += smoothstep(0.18, 0.03, abs(ripple)) * vec3(0.35, 0.65, 1.0) * 0.28;
    }

    col *= 0.75 + 0.25 * smoothstep(1.1, 0.0, length(uv) * 1.4);
    fragColor = vec4(pow(col + 0.05 * sin(time), vec3(0.98)), 1.0);
}