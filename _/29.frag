mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 1.2;

    // Enhanced kaleidoscope with twisting sectors
    float sectors = 8.0 + sin(time * 0.1) * 2.0;
    float ang = atan(uv.y, uv.x) + time * 0.05;
    float radius = length(uv) * (1.0 + 0.1 * sin(time));
    ang = mod(ang, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Add noise for organic feel
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);

    vec3 rayDir = normalize(vec3(uv * (1.0 + 0.12 * cos(time + noise)), 2.0));
    vec3 origin = vec3(cos(time * 0.3) * 0.6, sin(time * 0.35) * 0.5, -time * 0.8);

    vec3 col = vec3(0.0);
    for(int i = 0; i < 15; i++){
        float fi = float(i);
        float z = mod(origin.z + fi * 0.18 + cos(time + fi * noise) * 0.15, 1.5);
        vec3 p = origin + rayDir * z;
        // Twisted repeat and fold with noise
        p.xy = abs(fract(p.xy * vec2(10.0 + noise, 12.0)) - 0.5) * 2.5 - 1.2;
        p.z += sin(p.x + p.y + time) * 0.2;
        float g = smoothstep(0.08, 0.04, min(abs(p.x * p.y), min(abs(p.y + noise), abs(p.z))));
        col += g * vec3(0.3 + 0.15 * cos(time + fi), 0.6 + noise * 0.1, 0.8) * (1.5 - z);
    }

    // Spiral beams with varying thickness
    for(int b = 0; b < 8; b++){
        float bt = time * (1.1 + float(b) * 0.08);
        vec2 rotDir = vec2(cos(bt + float(b) * 1.2), sin(bt - float(b) * 0.9));
        float p = dot(uv, rotDir) + noise * 0.05;
        col += smoothstep(0.3, 0.05, abs(p)) * vec3(0.4, 0.8, 0.9) * 0.3;
    }

    col *= 0.7 + 0.3 * smoothstep(1.2, 0.0, length(uv) * 1.5 + noise * 0.1);
    fragColor = vec4(pow(col + noise * 0.05, vec3(1.1)), 1.0);
}