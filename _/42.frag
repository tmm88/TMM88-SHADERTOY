// Utility: 2D rotation matrix
mat2 rot(float a){ 
    float c = cos(a), s = sin(a); 
    return mat2(c, -s, s, c); 
}

// Noise function for organic patterns
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    // Normalize and center coordinates
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.6;

    //----------------------------------------
    // Organic Radial Symmetry
    //----------------------------------------
    float sectors = 7.0 + sin(time * 0.08) * 2.0;
    float ang = atan(uv.y, uv.x) + sin(time * 0.3) * 0.5;
    float radius = length(uv) * (1.4 + 0.15 * cos(time * 0.9));
    
    // Soft angular partitioning
    ang = mod(ang * 0.92, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Organic background
    vec3 col = vec3(0.02, 0.05, 0.08);
    col += 0.03 * sin(uv.x * 20.0 + time) * vec3(0.1, 0.3, 0.2);
    col += 0.03 * cos(uv.y * 15.0 + time * 1.2) * vec3(0.2, 0.1, 0.3);

    //----------------------------------------
    // Camera & Ray Direction
    //----------------------------------------
    vec3 rayDir = normalize(vec3(uv * (0.8 + 0.3 * sin(time * 0.4)), 1.6));
    vec3 origin = vec3(
        sin(time * 0.3) * 0.6, 
        cos(time * 0.35) * 0.5, 
        -time * 0.4
    );

    //----------------------------------------
    // Cellular Structure Algorithm
    //----------------------------------------
    for(int i = 0; i < 16; i++){
        float fi = float(i);
        
        // Organic Z-plane stepping
        float z = mod(origin.z + fi * 0.16 + sin(time * 0.7 + fi * 0.9) * 0.14, 1.5);
        vec3 p = origin + rayDir * z;
        
        // Cellular folding with noise
        p.xz = abs(fract(p.xz * vec2(5.0, 7.0) + noise(p.xy + time * 0.1) * 0.1) - 0.5) * 2.2 - 1.1;
        
        // Organic warping
        p.y += sin(p.x * 1.7 + time * 1.4) * 0.25;
        p.x += cos(p.z * 2.3 + time * 1.1) * 0.2;
        p.z += sin(p.y * 1.5 + time * 0.9) * 0.15;
        
        // Cell membrane
        float cell = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float membrane = smoothstep(0.13, 0.09, cell);
        
        // Nucleus
        float nucleus = smoothstep(0.06, 0.03, length(p));
        
        // Organic colors
        vec3 cellColor = mix(
            vec3(0.3, 0.6, 0.4),
            vec3(0.4, 0.3, 0.6),
            sin(time * 0.5 + fi * 0.4) * 0.5 + 0.5
        );
        
        vec3 nucleusColor = mix(
            vec3(0.8, 0.9, 0.7),
            vec3(0.9, 0.7, 0.8),
            sin(time * 0.7 + fi * 0.6) * 0.5 + 0.5
        );
        
        col += membrane * cellColor * (1.5 - z) * 0.7;
        col += nucleus * nucleusColor * 1.2;
    }

    //----------------------------------------
    // Vein-like Structures
    //----------------------------------------
    for(int v = 0; v < 6; v++){
        float vt = time * (0.5 + float(v) * 0.12);
        vec2 veinDir = vec2(cos(vt + float(v) * 2.0), sin(vt - float(v) * 1.5));
        
        float vein = dot(uv, veinDir) - 0.03 * sin(vt * 3.0);
        float veinMask = smoothstep(0.25, 0.1, abs(vein));
        
        col += veinMask * mix(vec3(0.1, 0.4, 0.3), vec3(0.3, 0.2, 0.5), sin(vt) * 0.5 + 0.5) * 0.3;
    }

    //----------------------------------------
    // Final Adjustments
    //----------------------------------------
    col *= 0.7 + 0.3 * smoothstep(1.3, 0.0, length(uv) * 1.2);
    col = pow(col, vec3(1.1));

    fragColor = vec4(col, 1.0);
}