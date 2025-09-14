float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 palette(float t) {
    vec3 a = vec3(0.45, 0.35, 0.25);
    vec3 b = vec3(0.65, 0.6, 0.55);
    vec3 c = vec3(1.1, 0.75, 1.2);
    vec3 d = vec3(0.05, 0.15, 0.3);
    return a + b * cos(6.28318 * (c * t + d));
}

// Non-linear oscillation for dynamic rotation
float nonLinearOsc(float x, float time) {
    return sin(x * 3.14159 + sin(time * 0.25) * 0.7) * cos(x * 5.0 + cos(time * 0.5) * 0.5);
}

// Fresnel effect for glowing edges
float fresnel(vec3 viewDir, vec3 normal, float f0) {
    float cosTheta = dot(viewDir, normal);
    return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;

    // Multi-frequency noise warping with more complexity
    float n1 = hash(uv + iTime * 0.1) * 0.08;
    float n2 = hash(uv * 1.5 + iTime * 0.13) * 0.05;
    uv += vec2(n1 - n2, n2 - n1);

    // Convert to polar for more radial control
    vec2 polar = toPolar(uv);
    polar.y += nonLinearOsc(polar.x * 2.0, iTime) * 0.6;
    uv = fromPolar(polar);

    // More pronounced rotation with non-linear variation
    float angle = iTime * 0.22 + nonLinearOsc(iTime * 0.1, iTime) * 0.35;
    uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;

    // Breathing zoom, oscillating faster
    float zoom = 1.3 + 0.25 * sin(iTime * 0.3 + length(uv0) * 0.5);
    uv *= zoom;

    vec3 finalColor = vec3(0.0);

    // Adding more depth and layering with noise-modulated fading
    for (float i = 0.0; i < 20.0; i++) {
        vec2 warpedUV = fract(uv * (1.4 + 0.05 * sin(iTime * 0.1 + i))) - 0.5;

        float d = length(warpedUV) * exp(-length(uv0) * 0.7);
        float noise = hash(uv0 + i * 0.1 + iTime * 0.03) * 0.12;

        float t = length(uv0) + i * 0.04 + iTime * 0.05 + noise;
        vec3 col = palette(t);

        d = sin(d * 28.0 + iTime * 0.65) / 7.5;
        d = abs(d);
        d = pow(0.007 / d, 1.7);

        float fade = exp(-i * 0.1);
        finalColor += col * d * fade;
    }

    finalColor = clamp(finalColor, 0.0, 1.0);

    // Adding a fresnel glow effect based on radial distance from center
    float fresnelFactor = fresnel(vec3(0.0, 0.0, 1.0), normalize(vec3(uv0, 1.0)), 0.1);
    finalColor += fresnelFactor * 0.15 * palette(iTime * 0.1 + length(uv0));

    // Enhanced radial pulse distortion
    float pulseDist = 0.1 * sin(iTime * 0.4 + length(uv0) * 2.5);
    finalColor += pulseDist * palette(iTime * 0.08 + length(uv0));

    // Vignette effect, with sharper edge to increase contrast
    float vignette = 1.0 - pow(length(fragCoord / iResolution.xy - 0.5), 2.4) * 0.75;
    finalColor *= vignette;

    fragColor = vec4(finalColor, 1.0);
}
