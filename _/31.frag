mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 1.1;

    // Warped grid symmetry
    float sectors = 7.0;
    float ang = atan(uv.y + sin(time * 0.1), uv.x + cos(time * 0.15));
    float radius = length(uv) * 1.2;
    ang = mod(ang * 1.1, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    vec3 rayDir = normalize(vec3(uv * (1.2 + 0.1 * cos(time * 0.5)), 2.2));
    vec3 origin = vec3(cos(time * 0.18) * 0.4, sin(time * 0.22) * 0.3, -time * 0.9);

    vec3 col = vec3(0.0);
    for(int i = 0; i < 8; i++){
        float fi = float(i);
        float z = mod(origin.z + fi * 0.28 + cos(time + fi * 1.5) * 0.08, 1.0);
        vec3 p = origin + rayDir * z;
        // Grid warping with electric feel
        p.xz *= rot(time * 0.05 + fi);
        p = abs(fract(p.xy * vec2(15.0, 18.0)) - 0.5) * 1.8 - 0.9;
        float grid = min(abs(p.x - p.y), abs(p.z + sin(p.x)));
        float g = smoothstep(0.05, 0.01, grid);
        col += g * vec3(0.1, 0.4 + 0.2 * sin(time + fi), 0.85) * (1.0 - z * 0.8);
    }

    // Electric arcs as beams
    for(int b = 0; b < 9; b++){
        float bt = time * (1.0 + float(b) * 0.15);
        float arc = abs(dot(uv, vec2(cos(bt), sin(bt + float(b) * 2.0))) + sin(bt * 2.0) * 0.1);
        col += smoothstep(0.2, 0.02, arc) * vec3(0.2, 0.9, 0.6) * 0.35;
    }

    col *= 0.6 + 0.4 * smoothstep(1.5, 0.0, length(uv) * 1.8);
    fragColor = vec4(pow(col, vec3(1.2)), 1.0);
}