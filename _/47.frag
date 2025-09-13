// ... (keep the same utility functions)

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.6;

    // Dynamic symmetry
    float sectors = 7.0 + 3.0*sin(time*0.06) + 2.0*cos(time*0.1);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Fiery background
    vec3 col = vec3(0.06, 0.03, 0.01);
    col += 0.07 * fbm(uv*4.0 + vec2(time*0.35, -time*0.3)) * vec3(0.7,0.4,0.1);
    col += 0.05 * sin(uv.x*28.0 + time*1.7) * vec3(0.8,0.5,0.2);
    col += 0.04 * cos(uv.y*25.0 - time*1.9) * vec3(0.9,0.6,0.3);

    // Camera & rays
    vec3 rayDir = normalize(vec3(uv*(1.2+0.5*sin(time*0.5)), 2.0));
    vec3 origin = vec3(sin(time*0.4)*1.0, cos(time*0.43)*0.9, -time*0.65);

    // Fiery cells
    for(int i=0; i<26; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.2 + sin(time*0.9+fi*1.1)*0.23, 2.2);
        vec3 p = origin + rayDir*z;

        // Volcanic folding
        p.xy = abs(fract(p.xy*4.5 + fbm(p.xz*1.4+time*0.5)) - 0.5)*3.2 - 1.6;
        p.xz = abs(fract(p.xz*6.3 + fbm(p.yz*1.2-time*0.4)) - 0.5)*3.1 - 1.55;

        // Energetic warping
        p.y += 0.35*sin(p.x*2.8+time*1.8);
        p.x += 0.4*cos(p.z*3.5+time*1.5);
        p.z += 0.3*sin(p.y*2.6+time*1.7);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.22, 0.1, cell);
        float nucleus  = smoothstep(0.11, 0.05, length(p));

        // Fire colors
        vec3 cellColor = mix(
            vec3(0.9,0.5,0.1),
            vec3(0.8,0.3,0.1),
            0.5+0.5*sin(time*0.75+fi*0.52)
        );

        vec3 nucleusColor = mix(
            vec3(1.0,1.0,0.7),
            vec3(1.0,0.9,0.5),
            0.5+0.5*sin(time*0.95+fi*0.62)
        );

        col += membrane*cellColor*(2.2-z)*0.9;
        col += nucleus*nucleusColor*1.9;
    }

    // Veins
    for(int v=0; v<10; v++){
        float vt = time*(0.75+float(v)*0.18);
        vec2 veinDir = vec2(cos(vt+float(v)*3.0), sin(vt-float(v)*2.5));

        float vein = dot(uv, veinDir) - 0.08*sin(vt*4.8);
        float veinMask = smoothstep(0.3, 0.1, abs(vein));

        vec3 veinColor = mix(vec3(0.9,0.5,0.1), vec3(0.8,0.3,0.1), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.5;
    }

    // Fiery flow effect
    float flow = fbm(uv*8.5 + vec2(time*1.1, -time*0.9));
    col += 0.3*flow*vec3(0.9,0.6,0.3);

    // Final adjustments
    col *= 0.65 + 0.5*smoothstep(2.0, 0.0, length(uv)*1.9);
    col = pow(col, vec3(1.5));

    fragColor = vec4(col, 1.0);
}