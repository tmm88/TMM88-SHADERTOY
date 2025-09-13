// ... (keep the same utility functions)

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.5;
    

    // Ethereal symmetry
    float sectors = 5.0 + 2.5*sin(time*0.04) + 1.8*cos(time*0.08);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Cosmic background
    vec3 col = vec3(0.01, 0.02, 0.03);
    col += 0.08 * fbm(uv*3.0 + vec2(time*0.2, -time*0.15)) * vec3(0.4,0.2,0.6);
    col += 0.06 * sin(uv.x*22.0 + time*1.0) * vec3(0.5,0.3,0.7);
    col += 0.05 * cos(uv.y*20.0 - time*1.2) * vec3(0.6,0.4,0.8);

    // Camera & rays
    vec3 rayDir = normalize(vec3(uv*(0.7+0.25*sin(time*0.3)), 1.0));
    vec3 origin = vec3(sin(time*0.2)*0.6, cos(time*0.23)*0.5, -time*0.4);

    // Nebula cells
    for(int i=0; i<22; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.14 + sin(time*0.6+fi*0.8)*0.17, 1.6);
        vec3 p = origin + rayDir*z;

        // Soft folding
        p.xy = abs(fract(p.xy*3.0 + fbm(p.xz*0.8+time*0.2)) - 0.5)*2.2 - 1.1;
        p.xz = abs(fract(p.xz*4.2 + fbm(p.yz*0.6-time*0.15)) - 0.5)*2.1 - 1.05;

        // Gentle warping
        p.y += 0.18*sin(p.x*1.6+time*1.0);
        p.x += 0.22*cos(p.z*2.2+time*0.8);
        p.z += 0.15*sin(p.y*1.4+time*0.9);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.14, 0.07, cell);
        float nucleus  = smoothstep(0.08, 0.03, length(p));

        // Cosmic colors
        vec3 cellColor = mix(
            vec3(0.5,0.3,0.7),
            vec3(0.3,0.2,0.6),
            0.5+0.5*sin(time*0.4+fi*0.35)
        );

        vec3 nucleusColor = mix(
            vec3(0.9,0.8,1.0),
            vec3(0.8,0.7,0.9),
            0.5+0.5*sin(time*0.55+fi*0.45)
        );

        col += membrane*cellColor*(1.6-z)*0.55;
        col += nucleus*nucleusColor*1.2;
    }

    // Veins
    for(int v=0; v<8; v++){
        float vt = time*(0.4+float(v)*0.1);
        vec2 veinDir = vec2(cos(vt+float(v)*2.0), sin(vt-float(v)*1.7));

        float vein = dot(uv, veinDir) - 0.05*sin(vt*3.0);
        float veinMask = smoothstep(0.2, 0.07, abs(vein));

        vec3 veinColor = mix(vec3(0.5,0.3,0.7), vec3(0.3,0.2,0.6), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.3;
    }

    // Nebula flow effect
    float flow = fbm(uv*5.0 + vec2(time*0.5, -time*0.4));
    col += 0.18*flow*vec3(0.5,0.3,0.7);

    // Final adjustments
    col *= 0.75 + 0.35*smoothstep(1.4, 0.0, length(uv)*1.3);
    col = pow(col, vec3(1.25));

    fragColor = vec4(col, 1.0);
}