float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 palette(float t)
{
    vec3 a = vec3(0.6, 0.5, 0.4); // Warmer base
    vec3 b = vec3(0.5, 0.6, 0.5); // Increased amplitude
    vec3 c = vec3(1.0, 0.8, 0.9); // Slightly cooler tint
    vec3 d = vec3(0.15, 0.35, 0.55); // Adjusted phase for vivid flow

    return a + b * cos(6.28318 * (c * t + d));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    
    // Noise-based warping
    float noiseWarp = hash(uv + iTime * 0.05) * 0.1 * sin(iTime * 0.2);
    uv += vec2(noiseWarp, noiseWarp);
    
    // Primary rotation with smoother variation
    float theta = iTime * 0.18 + sin(iTime * 0.15) * 0.35;
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    
    float xp = uv.x * cosTheta - uv.y * sinTheta;
    float yp = uv.x * sinTheta + uv.y * cosTheta;
    vec2 uv_r = vec2(xp, yp);
    
    // Secondary spiral rotation with distance modulation
    float theta2 = iTime * -0.06 + length(uv_r) * 2.5;
    cosTheta = cos(theta2);
    sinTheta = sin(theta2);
    xp = uv_r.x * cosTheta - uv_r.y * sinTheta;
    yp = uv_r.x * sinTheta + uv_r.y * cosTheta;
    uv = vec2(xp, yp);
    
    vec2 uv0 = uv;
    
    // Dynamic zoom with smoother oscillation
    float zoom = 1.0 + 0.5 * sin(iTime * 0.3 + length(uv0) * 0.5);
    uv *= zoom;
    
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 14.0; i++) // More iterations for depth
    {
        uv = fract(uv * (1.35 + 0.08 * sin(iTime * 0.12))) - 0.5; // Refined dynamic scaling
        
        float d = length(uv) * exp(-length(uv0) * 0.65); // Softer decay
        
        // Noise-modulated color
        float noise = hash(uv0 + i * 0.08 + iTime * 0.02) * 0.12;
        vec3 col = palette(length(uv0) + i * 0.07 + iTime * 0.035 + noise);
        
        d = sin(d * 22.0 + iTime * 0.55) / 8.0; // Higher frequency
        d = abs(d);
        d = pow(0.008 / d, 1.5); // Sharper falloff for glow
        
        finalColor += col * d;
    }
    
    finalColor = clamp(finalColor, vec3(0.0), vec3(1.0));
    
    // Subtle glow effect
    finalColor += 0.1 * palette(length(uv0) + iTime * 0.05);
    
    // Refined vignette
    float vignette = 1.0 - pow(length(fragCoord / iResolution.xy - 0.5), 1.7) * 0.55;
    finalColor *= vignette;
    
    fragColor = vec4(finalColor, 1.0);
}