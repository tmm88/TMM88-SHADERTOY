mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord/iResolution.xy)-0.5; uv.x*=iResolution.x/iResolution.y;
    float time=iTime*0.85;

    // kaleidoscope: fold symmetry
    float sectors = 6.0;
    float ang = atan(uv.y, uv.x);
    float radius = length(uv);
    ang = mod(ang, 2.0*3.14159265/sectors) - (3.14159265/sectors);
    uv = vec2(cos(ang), sin(ang)) * radius;

    vec3 rayDir = normalize(vec3(uv*(1.0+0.08*sin(time)), 1.7));
    vec3 origin = vec3(sin(time*0.2)*0.5, cos(time*0.28)*0.4, -time*0.6);

    vec3 col=vec3(0.0);
    for(int i=0;i<10;i++){
        float fi=float(i);
        float z=mod(origin.z + fi*0.24 + sin(time+fi)*0.1, 1.25);
        vec3 p = origin + rayDir*z;
        // repeat and fold in space to emphasize symmetry
        p.xy = abs(fract(p.xy*vec2(12.0,14.0)) - 0.5) * 2.0 - 1.0;
        float g = smoothstep(0.06, 0.03, min(abs(p.x), min(abs(p.y), abs(p.z))));
        col += g * vec3(0.25+0.1*sin(time+fi), 0.5, 0.9) * (1.2 - z);
    }

    // radial beams
    for(int b=0;b<6;b++){
        float bt = time*(0.9 + float(b)*0.1);
        float p = dot(uv, vec2(cos(bt+float(b)), sin(bt-float(b)*0.7)));
        col += smoothstep(0.25, 0.0, abs(p)) * vec3(0.3,0.7,0.95) * 0.25;
    }

    col *= 0.8 + 0.2*smoothstep(1.0,0.0,length(uv)*1.3);
    fragColor = vec4(pow(col, vec3(1.04)),1.0);
}
