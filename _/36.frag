// Utility: 2D rotation matrix
mat2 rot(float a){ 
    float c = cos(a), s = sin(a); 
    return mat2(c, -s, s, c); 
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    // Normalize and center coordinates
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 0.9;

    //----------------------------------------
    // Radial Labyrinthal Symmetry System
    //----------------------------------------
    float sectors = 10.0 + sin(time * 0.12) * 4.0;
    float ang = atan(uv.y, uv.x) + sin(time * 0.4);
    float radius = length(uv) * (1.2 + 0.08 * cos(time * 1.5));
    
    // Mirror angular partitioning
    ang = mod(ang * 0.9, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    //----------------------------------------
    // Camera & Ray Direction
    //----------------------------------------
    vec3 rayDir = normalize(vec3(uv * (0.7 + 0.2 * sin(time * 0.33)), 2.5));
    vec3 origin = vec3(
        sin(time * 0.35) * 0.9, 
        cos(time * 0.4) * 0.8, 
        -time * 0.4
    );

    vec3 col = vec3(0.0);

    //----------------------------------------
    // Iterative Mirror Reflections
    //----------------------------------------
    for(int i = 0; i < 18; i++){
        float fi = float(i);
        
        // Z-plane depth stepping with wobble
        float z = mod(origin.z + fi * 0.26 + sin(time + fi * 0.8) * 0.18, 1.6);
        vec3 p = origin + rayDir * z;
        
        // Labyrinth mirror folding
        p.xz = abs(fract(p.xz * vec2(11.0, 13.0)) - 0.5) * 2.8 - 1.4;
        
        // Vertical warping
        p.y += cos(p.x + p.z + time * 1.1) * 0.25;
        
        // Shadowing by bounding box
        float shadow = max(abs(p.x), max(abs(p.y), abs(p.z - sin(time))));
        float g = smoothstep(0.09, 0.05, shadow);
        
        // Color oscillations with depth fade
        col += g * vec3(
            0.35 + 0.1 * sin(time * 0.7 + fi), 
            0.45 + 0.15 * cos(time + fi * 0.5), 
            0.75 + 0.1 * sin(fi * 0.3)
        ) * (1.6 - z * 1.2);
    }

    //----------------------------------------
    // Extra Shadowy Beam Reflections
    //----------------------------------------
    for(int b = 0; b < 6; b++){
        float bt = time * (0.85 + float(b) * 0.11);
        vec2 mirrorDir = vec2(cos(bt + float(b) * 3.0), sin(bt - float(b) * 1.2));
        
        // Pulsing beams with angular slicing
        float p = dot(uv, mirrorDir) - 0.05 * cos(bt * 2.5);
        float beamMask = smoothstep(0.35, 0.08, abs(p));
        
        col += beamMask * vec3(
            0.5 + 0.2 * sin(bt), 
            0.3 + 0.1 * cos(bt * 1.5), 
            0.8
        ) * 0.45;
    }

    //----------------------------------------
    // Ghost Echo Overlay (Temporal Feedback)
    //----------------------------------------
    float echo = sin(length(uv) * 12.0 - time * 2.0) * 0.5 + 0.5;
    col += echo * vec3(0.2, 0.35, 0.55) * smoothstep(0.8, 0.0, radius);

    //----------------------------------------
    // Radial Vignetting + Final Tone Mapping
    //----------------------------------------
    col *= 0.65 + 0.35 * smoothstep(1.3, 0.0, length(uv) * 1.1);
    col = pow(col * 1.1, vec3(1.15));  // Subtle gamma-like curve

    fragColor = vec4(col, 1.0);
}
