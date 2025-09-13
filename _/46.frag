// ... (keep the same utility functions)

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.7;

    // Sharp symmetry
    float sectors = 8.0 + 2.0*sin(time*0.04) + 1.0*cos(time*0.08);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Crystal background
    vec3 col = vec3(0.02, 0.03, 0.05);
    col += 0.05 * fbm(uv*5.0 + vec2(time*0.25, -time*0.2)) * vec3(0.3,0.5,0.7);
    col += 0.04 * sin(uv.x*35.0 + time*1.5) * vec3(0.5,0.6,0.8);
    col += 0.03 * cos(uv.y*32.0 - time*1.7) * vec3(0.4,0.5,0.9);

    // Camera & rays
    vec3 rayDir = normalize(vec3(uv*(1.0+0.3*sin(time*0.4)), 1.6));
    vec3 origin = vec3(sin(time*0.3)*0.8, cos(time*0.33)*0.7, -time*0.5);

    // Sharp, crystalline cells
    for(int i=0; i<32; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.18 + sin(time*0.8+fi*1.0)*0.21, 2.0);
        vec3 p = origin + rayDir*z;

        // Sharp folding
        p.xy = abs(fract(p.xy*4.2 + fbm(p.xz*1.2+time*0.4)) - 0.5)*3.0 - 1.5;
        p.xz = abs(fract(p.xz*5.8 + fbm(p.yz*1.0-time*0.3)) - 0.5)*2.9 - 1.45;

        // Angular warping
        p.y += 0.25*sin(p.x*2.5+time*1.6);
        p.x += 0.3*cos(p.z*3.2+time*1.3);
        p.z += 0.22*sin(p.y*2.3+time*1.5);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.2, 0.09, cell);
        float nucleus  = smoothstep(0.1, 0.04, length(p));

        // Crystal colors
        vec3 cellColor = mix(
            vec3(0.3,0.6,0.9),
            vec3(0.7,0.4,0.9),
            0.5+0.5*sin(time*0.65+fi*0.48)
        );

        vec3 nucleusColor = mix(
            vec3(1.0,1.0,1.0),
            vec3(0.8,0.9,1.0),
            0.5+0.5*sin(time*0.85+fi*0.58)
        );

        col += membrane*cellColor*(2.0-z)*0.8;
        col += nucleus*nucleusColor*1.7;
    }

    // Veins
    for(int v=0; v<13; v++){
        float vt = time*(0.65+float(v)*0.15);
        vec2 veinDir = vec2(cos(vt+float(v)*2.8), sin(vt-float(v)*2.3));

        float vein = dot(uv, veinDir) - 0.07*sin(vt*4.2);
        float veinMask = smoothstep(0.28, 0.09, abs(vein));

        vec3 veinColor = mix(vec3(0.3,0.6,0.9), vec3(0.7,0.4,0.9), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.45;
    }

    // Sharp flow effect
    float flow = fbm(uv*7.5 + vec2(time*0.9, -time*0.7));
    col += 0.25*flow*vec3(0.5,0.6,0.9);

    // Final adjustments
    col *= 0.6 + 0.45*smoothstep(1.8, 0.0, length(uv)*1.7);
    col = pow(col, vec3(1.4));

    fragColor = vec4(col, 1.0);
}