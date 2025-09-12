// small helper functions
float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
vec2 hash22(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))))*43758.5453); }

vec3 voronoi(in vec3 p, out float cellId) {
    // 2D Voronoi in XY with Z as depth factor
    vec2 uv = p.xy;
    vec2 iuv = floor(uv);
    float best = 1e5;
    vec2 bestCell = vec2(0.0);
    for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
        vec2 b = vec2(x,y);
        vec2 r = hash22(iuv + b);
        vec2 c = b + r - 0.5;
        float d = length(uv - c);
        if (d < best) { best = d; bestCell = iuv + b; }
    }
    cellId = hash21(bestCell);
    return vec3(best, bestCell.x*0.001, bestCell.y*0.001);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv=(fragCoord/iResolution.xy)-0.5; uv.x*=iResolution.x/iResolution.y;
    float time=iTime*0.9;
    vec3 col=vec3(0.0);
    vec3 rayDir = normalize(vec3(uv*(1.0+0.08*sin(time)), 1.7));
    vec3 rayOrigin = vec3(sin(time*0.2)*0.5, cos(time*0.3)*0.4, -time*0.6);

    const int LAYERS=10;
    for(int i=0;i<LAYERS;i++){
        float fi=float(i);
        float z = mod(rayOrigin.z + fi*0.26 + sin(time+fi)*0.09,1.3);
        vec3 p = rayOrigin + rayDir*z;
        float cellId;
        vec3 vor = voronoi(p*6.0, cellId);
        float cellDist = vor.x;
        float nodes = smoothstep(0.18, 0.02, 0.2 - cellDist);
        float pulse = 0.6 + 0.4*sin(time*3.5 + cellId*12.0 + fi);
        col += nodes * vec3(0.9, 0.45, 1.0) * pulse * (1.2 - z);

        // links between nearest cell centers: draw thin bridges when two nearest centers align
        // approximate by checking nearby hash offsets
        float bridge = smoothstep(0.02, 0.005, abs(cellDist - 0.12));
        col += bridge * vec3(0.3,0.7,1.0) * 0.8 * (1.2 - z);
    }

    // subtle ambient & vignette
    col *= 0.8 + 0.2 * smoothstep(1.0,0.0,length(uv)*1.6);
    col += 0.02 * fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453 + time);
    fragColor = vec4(pow(col, vec3(1.06)),1.0);
}
