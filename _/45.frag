// ... (keep the same utility functions)

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.45;

    // Softer symmetry
    float sectors = 4.0 + 2.0*sin(time*0.03) + 1.5*cos(time*0.07);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Earthy background
    vec3 col = vec3(0.05, 0.04, 0.02);
    col += 0.03 * fbm(uv*2.5 + vec2(time*0.15, -time*0.1)) * vec3(0.4,0.3,0.1);
    col += 0.02 * sin(uv.x*20.0 + time*0.9) * vec3(0.3,0.2,0.1);
    col += 0.01 * cos(uv.y*18.0 - time*1.0) * vec3(0.2,0.3,0.1);

    // Camera & rays
    vec3 rayDir = normalize(vec3(uv*(0.8+0.2*sin(time*0.23)), 1.2));
    vec3 origin = vec3(sin(time*0.15)*0.5, cos(time*0.18)*0.4, -time*0.35);

    // Softer, more organic cells
    for(int i=0; i<20; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.12 + sin(time*0.5+fi*0.7)*0.15, 1.4);
        vec3 p = origin + rayDir*z;

        // Gentler folding
        p.xy = abs(fract(p.xy*2.8 + fbm(p.xz*0.7+time*0.1)) - 0.5)*2.1 - 1.05;
        p.xz = abs(fract(p.xz*3.7 + fbm(p.yz*0.5-time*0.05)) - 0.5)*2.0 - 1.0;

        // Subtle warping
        p.y += 0.15*sin(p.x*1.5+time*0.9);
        p.x += 0.2*cos(p.z*2.0+time*0.7);
        p.z += 0.12*sin(p.y*1.3+time*0.8);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.12, 0.06, cell);
        float nucleus  = smoothstep(0.06, 0.02, length(p));

        // Organic colors
        vec3 cellColor = mix(
            vec3(0.4,0.6,0.2),
            vec3(0.3,0.4,0.15),
            0.5+0.5*sin(time*0.35+fi*0.28)
        );

        vec3 nucleusColor = mix(
            vec3(0.8,0.9,0.5),
            vec3(0.7,0.8,0.4),
            0.5+0.5*sin(time*0.45+fi*0.32)
        );

        col += membrane*cellColor*(1.4-z)*0.5;
        col += nucleus*nucleusColor*1.1;
    }

    // Veins
    for(int v=0; v<7; v++){
        float vt = time*(0.35+float(v)*0.08);
        vec2 veinDir = vec2(cos(vt+float(v)*1.8), sin(vt-float(v)*1.5));

        float vein = dot(uv, veinDir) - 0.04*sin(vt*2.8);
        float veinMask = smoothstep(0.18, 0.06, abs(vein));

        vec3 veinColor = mix(vec3(0.3,0.5,0.2), vec3(0.2,0.4,0.15), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.25;
    }

    // Subtle flow effect
    float flow = fbm(uv*4.5 + vec2(time*0.4, -time*0.3));
    col += 0.1*flow*vec3(0.2,0.3,0.1);

    // Final adjustments
    col *= 0.8 + 0.3*smoothstep(1.2, 0.0, length(uv)*1.1);
    col = pow(col, vec3(1.1));

    fragColor = vec4(col, 1.0);
}