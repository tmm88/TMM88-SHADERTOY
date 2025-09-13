mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 0.9;

    // Labyrinth mirror symmetry
    float sectors = 10.0 + sin(time * 0.12) * 4.0;
    float ang = atan(uv.y, uv.x) + sin(time * 0.4);
    float radius = length(uv) * (1.2 + 0.08 * cos(time * 1.5));
    ang = mod(ang * 0.9, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    vec3 rayDir = normalize(vec3(uv * (0.7 + 0.2 * sin(time)), 2.5));
    vec3 origin = vec3(sin(time * 0.35) * 0.9, cos(time * 0.4) * 0.8, -time * 0.4);

    vec3 col = vec3(0.0);
    for(int i = 0; i < 14; i++){
        float fi = float(i);
        float z = mod(origin.z + fi * 0.26 + sin(time + fi * 0.8) * 0.18, 1.6);
        vec3 p = origin + rayDir * z;
        // Mirror-like reflections and shadows
        p.xz = abs(fract(p.xz * vec2(11.0, 13.0)) - 0.5) * 2.8 - 1.4;
        p.y += cos(p.x + p.z + time) * 0.25;
        float shadow = max(abs(p.x), max(abs(p.y), abs(p.z - sin(time))));
        float g = smoothstep(0.09, 0.05, shadow);
        col += g * vec3(0.35, 0.45 + 0.15 * cos(time + fi), 0.75) * (1.6 - z * 1.2);
    }

    // Shadowy beam reflections
    for(int b = 0; b < 4; b++){
        float bt = time * (0.85 + float(b) * 0.11);
        vec2 mirrorDir = vec2(cos(bt + float(b) * 3.0), sin(bt - float(b) * 1.2));
        float p = dot(uv, mirrorDir) - 0.05 * cos(bt * 2.5);
        col += smoothstep(0.35, 0.08, abs(p)) * vec3(0.5, 0.3, 0.8) * 0.45;
    }

    col *= 0.65 + 0.35 * smoothstep(1.3, 0.0, length(uv) * 1.1);
    fragColor = vec4(pow(col * 1.1, vec3(1.15)), 1.0);
}