// Classic 2D noise / FBM (compact)
float noise(in vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    float a=dot(hash22(i), vec2(1.0));
    float b=dot(hash22(i+vec2(1,0)), vec2(1.0));
    float c=dot(hash22(i+vec2(0,1)), vec2(1.0));
    float d=dot(hash22(i+vec2(1,1)), vec2(1.0));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(in vec2 p){
    float v=0.0; float a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
    for(int i=0;i<5;i++){ v+=a*noise(p); p*=m; a*=0.5; }
    return v;
}
vec2 curl(in vec2 p){
    float e=0.01;
    float n1=fbm(p + vec2(e,0));
    float n2=fbm(p - vec2(e,0));
    float n3=fbm(p + vec2(0,e));
    float n4=fbm(p - vec2(0,e));
    return normalize(vec2(n3-n4, -(n1-n2)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord/iResolution.xy)-0.5; uv.x*=iResolution.x/iResolution.y;
    float time=iTime*0.85;
    vec3 col=vec3(0.0);

    vec3 rayDir = normalize(vec3(uv*(1.0+0.08*sin(time)), 1.75));
    vec3 rayOrigin = vec3(sin(time*0.2)*0.45, cos(time*0.25)*0.38, -time*0.6);
    const int LAYERS=10;
    for(int i=0;i<LAYERS;i++){
        float fi=float(i);
        float z=mod(rayOrigin.z + fi*0.24 + sin(time+fi)*0.08, 1.25);
        vec3 p=rayOrigin + rayDir*z;
        // curl warp
        vec2 cw = curl(p.xy*0.5 + time*0.12);
        p.xy += 0.12 * cw * sin(time*0.9 + fi*0.6);

        vec3 g = abs(fract(p*vec3(14.0,16.0,18.0)) - 0.5);
        float gridLines = smoothstep(0.08, 0.045, min(min(g.x,g.y), g.z));
        col += gridLines * vec3(0.2 + 0.12*sin(time), 0.5 + 0.12*cos(time), 0.9) * (1.2 - z);

        // fbm-based soft nodes
        float n = fbm(p.xy*1.8 + time*0.6);
        float nodes = smoothstep(0.15, 0.02, 0.18 - (n*0.6 + length(fract(p*14.0)-0.5)));
        col += nodes * vec3(0.8,0.4,1.0) * (1.2 - z) * (0.8 + 0.3*sin(time*2.0 + n*6.0));
    }

    // glow + final
    vec3 glow = pow(col, vec3(1.12)) * 0.7;
    col = pow(col, vec3(1.03)) + glow*0.65;
    col *= 0.8 + 0.2*smoothstep(1.0,0.0,length(uv)*1.5);
    fragColor = vec4(col,1.0);
}
