// ... (keep the same utility functions)

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.65;

    // More dynamic symmetry
    float sectors = 6.0 + 4.0*sin(time*0.05) + 3.0*cos(time*0.09);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    
    ang = mod(ang, 6.2831853 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Electric background
    vec3 col = vec3(0.01, 0.02, 0.04);
    col += 0.06 * fbm(uv*4.5 + vec2(time*0.3, -time*0.25)) * vec3(0.1,0.4,0.6);
    col += 0.04 * sin(uv.x*30.0 + time*1.3) * vec3(0.4,0.1,0.6);
    col += 0.03 * cos(uv.y*28.0 - time*1.5) * vec3(0.2,0.5,0.3);

    // Camera & rays
    vec3 rayDir = normalize(vec3(uv*(1.1+0.4*sin(time*0.43)), 1.8));
    vec3 origin = vec3(sin(time*0.35)*0.9, cos(time*0.38)*0.8, -time*0.55);

    // Brighter, more electric cells
    for(int i=0; i<28; i++){
        float fi = float(i);
        float z = mod(origin.z + fi*0.16 + sin(time*0.7+fi*0.9)*0.19, 1.8);
        vec3 p = origin + rayDir*z;

        // More aggressive folding
        p.xy = abs(fract(p.xy*3.8 + fbm(p.xz*1.1+time*0.3)) - 0.5)*2.7 - 1.35;
        p.xz = abs(fract(p.xz*5.2 + fbm(p.yz*0.9-time*0.25)) - 0.5)*2.6 - 1.3;

        // Stronger warping
        p.y += 0.3*sin(p.x*2.2+time*1.4);
        p.x += 0.35*cos(p.z*2.8+time*1.1);
        p.z += 0.25*sin(p.y*2.0+time*1.3);

        // Cell metrics
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.18, 0.08, cell);
        float nucleus  = smoothstep(0.09, 0.03, length(p));

        // Electric colors
        vec3 cellColor = mix(
            vec3(0.1,0.7,0.9),
            vec3(0.8,0.2,0.9),
            0.5+0.5*sin(time*0.55+fi*0.42)
        );

        vec3 nucleusColor = mix(
            vec3(0.95,0.95,1.0),
            vec3(0.7,0.9,1.0),
            0.5+0.5*sin(time*0.75+fi*0.53)
        );

        col += membrane*cellColor*(1.8-z)*0.7;
        col += nucleus*nucleusColor*1.5;
    }

    // Veins
    for(int v=0; v<11; v++){
        float vt = time*(0.55+float(v)*0.12);
        vec2 veinDir = vec2(cos(vt+float(v)*2.5), sin(vt-float(v)*2.0));

        float vein = dot(uv, veinDir) - 0.06*sin(vt*3.8);
        float veinMask = smoothstep(0.25, 0.08, abs(vein));

        vec3 veinColor = mix(vec3(0.1,0.5,0.8), vec3(0.7,0.2,0.9), 0.5+0.5*sin(vt));
        col += veinMask*veinColor*0.4;
    }

    // Stronger flow effect
    float flow = fbm(uv*6.5 + vec2(time*0.8, -time*0.6));
    col += 0.2*flow*vec3(0.4,0.2,0.7);

    // Final adjustments
    col *= 0.7 + 0.4*smoothstep(1.6, 0.0, length(uv)*1.5);
    col = pow(col, vec3(1.3));

    fragColor = vec4(col, 1.0);
}