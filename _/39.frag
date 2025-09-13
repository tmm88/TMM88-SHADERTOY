// Utility: 2D rotation matrix
mat2 rot(float a){ 
    float c = cos(a), s = sin(a); 
    return mat2(c, -s, s, c); 
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    // Normalize and center coordinates
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;

    float time = iTime * 1.5;

    //----------------------------------------
    // Digital Radial Symmetry
    //----------------------------------------
    float sectors = 8.0 + floor(sin(time * 0.1) * 3.0);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv) * (1.3 + 0.1 * floor(cos(time * 1.2) * 5.0) / 5.0);
    
    // Digital angular partitioning
    ang = mod(ang, 2.0 * 3.14159265 / sectors);
    float sector = floor(ang * sectors / (2.0 * 3.14159265));
    ang = mod(ang, 2.0 * 3.14159265 / sectors) - (3.14159265 / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // Background grid
    vec3 col = vec3(0.05);
    vec2 grid = fract(uv * 10.0);
    if(grid.x < 0.02 || grid.y < 0.02) col += vec3(0.05, 0.1, 0.15);

    //----------------------------------------
    // Camera & Ray Direction
    //----------------------------------------
    vec3 rayDir = normalize(vec3(uv * (0.7 + 0.2 * sin(time * 0.3)), 1.5));
    vec3 origin = vec3(
        sin(time * 0.2) * 0.8, 
        cos(time * 0.25) * 0.7, 
        -time * 0.8
    );

    //----------------------------------------
    // Data Stream Algorithm
    //----------------------------------------
    for(int i = 0; i < 18; i++){
        float fi = float(i);
        
        // Digital Z-plane stepping
        float z = mod(origin.z + fi * 0.2 + sin(time * 0.5 + fi) * 0.1, 1.7);
        vec3 p = origin + rayDir * z;
        
        // Digital folding
        p.xz = abs(mod(p.xz * vec2(6.0, 8.0), 1.0) - 0.5) * 2.5;
        
        // Data stream movement
        p.y = mod(p.y + time * 0.5, 1.0) - 0.5;
        
        // Digital components
        float data = max(abs(p.x), max(abs(p.y), abs(p.z)));
        float stream = smoothstep(0.1, 0.06, data);
        
        // Binary bits floating around
        float bits = smoothstep(0.04, 0.02, length(p - vec3(0.3, sin(time + fi), 0.3)));
        
        // Neon colors
        vec3 neonColor = mix(
            vec3(0.1, 0.8, 0.9),
            vec3(0.9, 0.1, 0.7),
            mod(sector + fi + time * 0.2, sectors) / sectors
        );
        
        col += stream * neonColor * (1.7 - z) * 0.9;
        col += bits * vec3(1.0, 1.0, 1.0) * 1.2;
    }

    //----------------------------------------
    // Digital Noise Effect
    //----------------------------------------
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233) + time)) * 43758.5453);
    if(noise > 0.95) col += vec3(0.2, 0.4, 0.8);

    //----------------------------------------
    // Scanlines
    //----------------------------------------
    col *= 0.9 + 0.1 * sin(uv.y * 100.0 + time * 5.0);

    //----------------------------------------
    // Final Adjustments
    //----------------------------------------
    col *= 0.6 + 0.4 * smoothstep(1.4, 0.0, length(uv) * 1.1);
    col = pow(col, vec3(1.2));

    fragColor = vec4(col, 1.0);
}