#define PI 3.14159265

// Helper function to create a smooth, glowing box
// 'd' is the signed distance from the center of the box
// 'r' is the radius of the glow
float glow(float d, float r) {
    return smoothstep(r, 0.0, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord / iResolution.xy) - 0.5;
    uv.x *= iResolution.x / iResolution.y;
    float time = iTime * 0.85;

    // --- Kaleidoscope Symmetry ---
    // Make the number of sectors oscillate for a more dynamic effect
    float sectors = 6.0 + 2.0 * sin(time * 0.5);
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    ang = mod(ang, (2.0 * PI) / sectors) - (PI / sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    // --- Raymarching for the Glowing Grid ---
    vec3 rayDir = normalize(vec3(uv * (1.0 + 0.08 * sin(time)), 1.7));
    vec3 origin = vec3(sin(time * 0.2) * 0.5, cos(time * 0.28) * 0.4, -time * 0.6);

    vec3 col = vec3(0.0);
    vec3 glowColor = vec3(0.25, 0.5, 0.9);

    for (int i = 0; i < 10; i++) {
        float fi = float(i);
        float z = mod(origin.z + fi * 0.24 + sin(time + fi) * 0.1, 1.25);
        vec3 p = origin + rayDir * z;

        // Repeat and fold in space to emphasize symmetry
        p.xy = abs(fract(p.xy * vec2(12.0, 14.0)) - 0.5) * 2.0 - 1.0;
        
        // Calculate the distance to the center of the box
        float d = min(abs(p.x), min(abs(p.y), abs(p.z)));
        float g = glow(d, 0.03);
        
        // Add a pulsing effect to the glow intensity
        float pulse = 1.0 + 0.5 * sin(time + fi * 0.5);
        
        col += g * glowColor * pulse * (1.2 - z);
    }

    // --- Radial Light Beams ---
    vec3 beamColor = vec3(0.3, 0.7, 0.95);
    for (int b = 0; b < 6; b++) {
        float bt = time * (0.9 + float(b) * 0.1);
        float p = dot(uv, vec2(cos(bt + float(b)), sin(bt - float(b) * 0.7)));
        
        // Adjust the beam thickness and color based on time
        float beamGlow = smoothstep(0.25, 0.0, abs(p));
        col += beamGlow * beamColor * 0.25;
    }

    // --- Final Color and Vignette ---
    col *= 0.8 + 0.2 * smoothstep(1.0, 0.0, length(uv) * 1.3);
    fragColor = vec4(pow(col, vec3(1.04)), 1.0);
}