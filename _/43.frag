// Utility: 2D rotation matrix
mat2 rot(float a){ 
    float c = cos(a), s = sin(a); 
    return mat2(c, -s, s, c); 
}

// Hash-based pseudo-random generator
float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth noise with interpolation
float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal Brownian Motion
float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for(int i=0;i<6;i++){
        v += a*noise(p);
        p *= 2.1;
        a *= 0.55;
    }
    return v;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    //----------------------------------------
    // Normalize coords
    //----------------------------------------
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.55;

    //----------------------------------------
    // Dynamic radial symmetry with modulation
    //----------------------------------------
    float sectors = 5.0 + 3.0*sin(time*0.07) + 2.0*cos(time*0.11);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    //----------------------------------------
    // Background base color
    //----------------------------------------
    vec3 col = vec3(0.03, 0.05, 0.08);
    col += 0.04 * fbm(uv*3.5 + vec2(time*0.2, -time*0.15)) * vec3(0.2,0.3,0.4);
    col += 0.03 * sin(uv.x*25.0 + time*1.1) * vec3(0.1,0.2,0.3);
    col += 0.02 * cos(uv.y*22.0 - time*1.3) * vec3(0.3,0.1,0.2);

    //----------------------------------------
    // Camera & rays
    //----------------------------------------
    vec3 rayDir = normalize(vec3(uv*(0.9+0.3*sin(time*0.33)), 1.5));
    vec3 origin = vec3(sin(time*0.25)*0.7, cos(time*0.28)*0.6, -time*0.45);

    //----------------------------------------
    // Multi-layered cellular system
    //----------------------------------------
    for(int i=0; i<24; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.14 + sin(time*0.6+fi*0.8)*0.17, 1.6);
        vec3 p = origin + rayDir*z;

        // Recursive folding
        p.xy = abs(fract(p.xy*3.3 + fbm(p.xz*0.9+time*0.2)) - 0.5)*2.4 - 1.2;
        p.xz = abs(fract(p.xz*4.7 + fbm(p.yz*0.7-time*0.15)) - 0.5)*2.3 - 1.15;

        // Organic warps
        p.y += 0.2*sin(p.x*1.8+time*1.2);
        p.x += 0.25*cos(p.z*2.4+time*0.9);
        p.z += 0.18*sin(p.y*1.6+time*1.1);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.15, 0.07, cell);
        float nucleus  = smoothstep(0.07, 0.025, length(p));

        // Colors
        vec3 cellColor = mix(
            vec3(0.25,0.6,0.35),
            vec3(0.45,0.25,0.65),
            0.5+0.5*sin(time*0.45+fi*0.37)
        );

        vec3 nucleusColor = mix(
            vec3(0.9,0.85,0.7),
            vec3(0.8,0.65,0.9),
            0.5+0.5*sin(time*0.6+fi*0.42)
        );

        col += membrane*cellColor*(1.6-z)*0.6;
        col += nucleus*nucleusColor*1.3;
    }

    //----------------------------------------
    // Branching vein-like system
    //----------------------------------------
    for(int v=0; v<9; v++){
        float vt = time*(0.45+float(v)*0.1);
        vec2 veinDir = vec2(cos(vt+float(v)*2.2), sin(vt-float(v)*1.7));

        float vein = dot(uv, veinDir) - 0.05*sin(vt*3.2);
        float veinMask = smoothstep(0.22, 0.07, abs(vein));

        vec3 veinColor = mix(vec3(0.15,0.4,0.35), vec3(0.35,0.2,0.55), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.35;
    }

    //----------------------------------------
    // Pseudo-bloodflow shimmer
    //----------------------------------------
    float flow = fbm(uv*5.5 + vec2(time*0.6, -time*0.4));
    col += 0.15*flow*vec3(0.3,0.1,0.2);

    //----------------------------------------
    // Final Adjustments
    //----------------------------------------
    col *= 0.7 + 0.35*smoothstep(1.4, 0.0, length(uv)*1.3);
    col = pow(col, vec3(1.2));

    fragColor = vec4(col, 1.0);
}
