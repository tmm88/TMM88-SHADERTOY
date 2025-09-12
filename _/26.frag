// Expects: iChannel1 = audio texture / FFT (horizontal bar with frequency energy)
// Uniform knobs: float uIntensity (0.0..2.0), float uDetail (1..20)
uniform float uIntensity; // optional host uniform
uniform float uDetail;

float audioGain(){
    // sample low-to-mid frequency band from iChannel1
    #ifdef GL_ES
    vec2 pos = vec2(0.25, 0.5);
    #else
    vec2 pos = vec2(0.15, 0.5);
    #endif
    vec4 s = texture(iChannel1, pos);
    return length(s.rgb);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord/iResolution.xy)-0.5; uv.x*=iResolution.x/iResolution.y;
    float time=iTime*0.9;
    float ag = audioGain();
    float beat = smoothstep(0.1, 0.0, abs(sin(time*2.0) - ag)); // crude beat influence

    vec3 col=vec3(0.0);
    vec3 rayDir = normalize(vec3(uv*(1.0 + 0.08*sin(time)), 1.75));
    vec3 origin = vec3(sin(time*0.2)*0.5, cos(time*0.3)*0.4, -time*0.6);

    int LAYERS = int(clamp(uDetail, 3.0, 24.0));
    for(int i=0;i<LAYERS;i++){
        float fi=float(i);
        float z = mod(origin.z + fi*(0.26 - 0.08*ag) + sin(time+fi*0.3)*0.08, 1.25);
        vec3 p = origin + rayDir*z;
        vec3 g = abs(fract(p*vec3(14.0,16.0,18.0)*(1.0+0.05*ag)) - 0.5);
        float gridLines = smoothstep(0.08, 0.04, min(min(g.x,g.y),g.z));

        float colorShift = 0.5 + 0.5*sin(time*1.5 + ag*6.0 + fi*0.2);
        vec3 palette = mix(vec3(0.2,0.5,0.9), vec3(1.0,0.4,0.9), colorShift);

        col += gridLines * palette * (1.2 - z) * (0.9 + 0.5*beat);
        // nodes pulse on audio
        float node = smoothstep(0.07, 0.01, 0.06 - length(fract(p*14.0)-0.5));
        col += node * (0.6 + 1.2*ag) * vec3(1.0,0.8,1.0) * (1.2 - z);
    }

    col *= 0.8 + 0.2*smoothstep(1.0,0.0,length(uv)*1.5);
    // small noise
    col += 0.02 * fract(sin(dot(uv,vec2(12.9898,78.233))) * 43758.5453 + time*0.4);

    fragColor = vec4(pow(col, vec3(1.02)), 1.0);
}
