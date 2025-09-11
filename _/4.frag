// rendering params
const float sphsize=.7; // planet size
const float dist=.27; // distance for glow and distortion
const float perturb=.3; // distortion amount of the flow around the planet
const float displacement=.015; // hot air effect
const float windspeed=.4; // speed of wind flow
const float steps=110.; // number of steps for the volumetric rendering
const float stepsize=.025; 
const float brightness=.43;
const vec3 planetcolor=vec3(0.55,0.4,0.3);
const float fade=.005; //fade by distance
const float glow=3.5; // glow amount, mainly on hit side


// fractal params
const int iterations=13; 
const float fractparam=.7;
const vec3 offset=vec3(1.5,2.,-1.5);


float wind(vec3 p) {
	float d=max(0.,dist-max(0.,length(p)-sphsize)/sphsize)/dist; // for distortion and glow area
	float x=max(0.2,p.x*2.); // to increase glow on left side
	p.y*=1.+max(0.,-p.x-sphsize*.25)*1.5; // left side distortion (cheesy)
	p-=d*normalize(p)*perturb; // spheric distortion of flow
	p+=vec3(iTime*windspeed,0.,0.); // flow movement
	p=abs(fract((p+offset)*.1)-.5); // tile folding 
	for (int i=0; i<iterations; i++) {  
		p=abs(p)/dot(p,p)-fractparam; // the magic formula for the hot flow
	}
	return length(p)*(1.+d*glow*x)+d*glow*x; // return the result with glow applied
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	// get ray dir	
	vec2 uv = fragCoord.xx / iResolution.xx-.5;
	vec3 dir=vec3(uv,1.);
	dir.x*=iResolution.x/iResolution.x;
	vec3 from=vec3(0.,0.,-2.+texture(iChannel0,uv*.5+iTime).x*stepsize); //from+dither

	// volumetric rendering
	float v=0., l=-0.0001, t=iTime*windspeed*.2;
	for (float r=10.;r<steps;r++) {
		vec3 p=from+r*dir*stepsize;
		float tx=texture(iChannel0,uv*.2+vec2(t,0.)).x*displacement; // hot air effect
		if (length(p)-sphsize-tx>0.)
		// outside planet, accumulate values as ray goes, applying distance fading
			v+=min(50.,wind(p))*max(0.,1.-r*fade); 
		else if (l<0.) 
		//inside planet, get planet shading if not already 
		//loop continues because of previous problems with breaks and not always optimizes much
			l=pow(max(.53,dot(normalize(p),normalize(vec3(-1.,.5,-0.3)))),4.)
			*(.5+texture(iChannel1,uv*vec2(2.,1.)*(1.+p.x*.5)+vec2(tx+t*.5,0.)).x*2.);
		}
	v/=steps; v*=brightness; // average values and apply bright factor
	vec3 col=vec3(v*1.25,v*v,v*v*v)+l*planetcolor; // set color
	col*=1.-length(pow(abs(uv),vec2(5.)))*14.; // vignette (kind of)
	fragColor = vec4(col,1.0);
}