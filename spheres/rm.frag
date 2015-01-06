
#ifdef GL_ES
precision highp float;
#endif


struct Cam{
	vec3 vectO;
	vec3 vectP;
	vec3 vectX;
	vec3 vectY;
};


uniform vec2 uCanvasSize;
uniform int TIME_FROM_INIT;
uniform Cam cam;

vec4 cintAmbient = vec4(0.2,0.2,0.2,1);

const float D = 10000.0;
const float epsilon = 0.0001;
const float scale = 8.0;
const int clight = 2;

float f_sphere(vec3 vecP, vec3 vecO, float r)
{
	return length(vecO-vecP)-r;
}

float f_plane(vec3 vecP, vec3 vecO, vec3 vecN)
{
	return dot(vecN, vecP-vecO);
}

float map(vec3 vecP, out int i){

	float f = D;
	float f0;
	 
	if( (f0 = f_sphere(vecP, vec3(100.0, 1000, 100), 10.0)) < f){ f = f0; i = 0; }
	if( (f0 = f_sphere(vecP, vec3(100.0, 80, 100),	 10.0)) < f){ f = f0; i = 1; }
	if( (f0 = f_sphere(vecP, vec3(-200,   0, -200), 140.0)) < f){ f = f0; i = 2; }
	if( (f0 = f_sphere(vecP, vec3( 200,   0, -200), 90.0)) < f){ f = f0; i = 3; }
	if( (f0 = f_sphere(vecP, vec3(   0,   0, -200), 90.0)) < f){ f = f0; i = 4; }
	if( (f0 = f_sphere(vecP, vec3(-200,   0,    0), 90.0)) < f){ f = f0; i = 5; }
	if( (f0 = f_sphere(vecP, vec3( 200,   0,    0), 90.0)) < f){ f = f0; i = 6; }
	if( (f0 = f_sphere(vecP, vec3(    0,  0,    0), 90.0)) < f){ f = f0; i = 7; }
	if( (f0 = f_sphere(vecP, vec3(-200,   0,  200), 90.0)) < f){ f = f0; i = 8; }
	if( (f0 = f_sphere(vecP, vec3(200,    0,  200), 90.0)) < f){ f = f0; i = 9; }
	if( (f0 = f_sphere(vecP, vec3(  0,    0,  200), 90.0)) < f){ f = f0; i = 10; }
	if( (f0 = f_plane(vecP, vec3(0, -20, 0), vec3(0, 1, 0))) < f){ f = f0; i = 11; }
	
	return f;
	
}


float angle(vec3 vectU, vec3 vectV){
	return dot(vectU, vectV) /  length(vectU) / length(vectV);
}


float shadeGet2(vec3 ray_start, vec3 ray_dir, int iobstSkip) {
	
    float dist = 1.0;
    float shade = 1.0;
    for(int i=0;i<=100;i++) 
	{
	
       // if (dist >= D) 
		//	break;
			
		int iobst;
        float mapDist = map(ray_start + ray_dir * dist, iobst);
		
		if (mapDist < epsilon)
		{
			if(iobst >= clight)
				shade = 0.0;
			break;
		}
        
		if (iobst != iobstSkip && iobst >= clight)
		   shade = min(shade, 10.0*mapDist / dist);
		
        dist += mapDist;
		
    }
	return shade;
    
}


vec4 cintFromLight(vec3 vecL, float r, vec4 cintLight, vec3 vecV, vec3 vecQ, vec4 cintDiffuse, float shininess, vec3 vecN, int iobstSkip){
    vec3 vecQL = vecL - vecQ;
    vec3 vecQLn = normalize(vecQL);

    // attenuation
	
	float shadeT = shadeGet2(vecQ, vecQLn, iobstSkip);
   
	
	vec4 cint = vec4(0,0,0,0);
    if(shadeT > 0.0)
    {
		//cintLight /= (1.0 + 0.00000001 * length(vecQL) + 0.00000001 * dot(vecQL, vecQL));
		
        //diffuse shading
        float cTheta = angle(vecQL, vecN);

        if (cTheta > 0.0)
            cint += cintDiffuse * cintLight * cTheta * shadeT;

	    //specular shading: a diffuse reflection of the light source
        float cPhi = angle(reflect(vecQL, vecN), vecQ - vecV);
        if (cPhi > 0.0)
            cint += cintLight * (pow(cPhi, 20.0) * shininess * shadeT);
    }
    return cint;
}


vec4 cintGet(vec3 vecV, vec3 vecD){



	float t = 0.0;
	float d = 0.0;
	int iobst = 9;
	vec3 vecQ;
	
	for (int i=0; i<=100; i++) {
		if(t >= D)
			return vec4(0,0,0,1);
		
		vecQ = vecV + t* vecD;
		d = map(vecQ, iobst);

		if (d < epsilon)
			break;	
		
		t += d;
	}
	
	if(iobst < clight)
		return vec4(1,1,1,1);
		
	
	
	vec3 vecN;
	vec4 cintDiffuse;
	float shininess, reflectiveness;
	
	int iDummy;

  	if(iobst == 2){cintDiffuse = vec4(0.8, 0.37, 0.6, 1);       vecN = normalize(vecQ - vec3(-200,    0, -200)); shininess = 0.5; }
	else if(iobst == 3){cintDiffuse = vec4(0.8, 0.5, 0, 1);     vecN = normalize(vecQ - vec3( 200,    0, -200)); shininess = 0.5; }
	else if(iobst == 4){cintDiffuse = vec4(0.8, 0.7, 0, 1);     vecN = normalize(vecQ - vec3(   0,    0, -200)); shininess = 0.5; }
	else if(iobst == 5){cintDiffuse = vec4(0.5, 0, 0.5, 1);     vecN = normalize(vecQ - vec3(-200,    0,    0)); shininess = 0.5; }
	else if(iobst == 6){cintDiffuse = vec4(0, 0.66, 0.2, 1);    vecN = normalize(vecQ - vec3( 200,    0,    0)); shininess = 0.5; }
	else if(iobst == 7){cintDiffuse = vec4(0.4, 0.26, 0.2, 1);  vecN = normalize(vecQ - vec3(   0,    0,    0)); shininess = 0.5; }
	else if(iobst == 8){cintDiffuse = vec4(0.6, 0, 0.1, 1);     vecN = normalize(vecQ - vec3(-200,    0,  200)); shininess = 0.5; }
	else if(iobst == 9){cintDiffuse = vec4(0.59, 0.68, 0.8, 1); vecN = normalize(vecQ - vec3( 200,    0,  200)); shininess = 0.5; }
	else if(iobst == 10){cintDiffuse = vec4(0.6, 0.29, 0, 1);    vecN = normalize(vecQ - vec3(   0,    0,  200)); shininess = 0.5; }
 	else if(iobst == 11){cintDiffuse = vec4(0.2, 0.3, 0.1, 1);   vecN = vec3(0, 1, 0); shininess = 0.1; }
	

	vec4 cint = cintAmbient*cintDiffuse;
  
	cint += cintFromLight(vec3(100.0, 1000, 100), 10.0, vec4(1,1,1,1), vecV, vecQ, cintDiffuse, shininess, vecN, iobst);
	cint += cintFromLight(vec3(100.0, 80, 100)  , 10.0, vec4(1,1,1,1), vecV, vecQ, cintDiffuse, shininess, vecN, iobst);
	
	return cint;

}


Cam camLookAt(float alpha, float beta, float d){
    float alphaRad = alpha * 3.141592654 / 180.0;
    float betaRad = beta * 3.141592654 / 180.0;

	Cam cam;
	cam.vectP = d* vec3(sin(alphaRad)*cos(betaRad), sin(betaRad), cos(alphaRad)*cos(betaRad));
    cam.vectO = 10001.0*normalize(cam.vectP);

    vec3 u = cross(vec3(0, 1, 0), cam.vectP - cam.vectO);

    if (length(u) == 0.0)
        u = cross(vec3(1, 0, 0), cam.vectP - cam.vectO);
    vec3 v = cross(cam.vectP - cam.vectO, u);

    cam.vectX = normalize(u);
    cam.vectY = normalize(v);
    return cam;
}    

void main() {

 //	uCanvasSize= vec2(640,640);
//	cam = camLookAt(0.0, 60.0, 450.0);

	float wScene = uCanvasSize.x;
	float hScene = uCanvasSize.y;
	
	vec3 vectS = cam.vectP + cam.vectX * (gl_FragCoord.x-wScene/2.0) + cam.vectY * (gl_FragCoord.y-hScene /2.0);
 
    gl_FragColor =  cintGet(vectS, normalize(vectS - cam.vectO));
	//gl_FragColor =  vec4(-1.0+gl_FragCoord.x /wScene, -1.0+gl_FragCoord.x/hScene,-1.0+gl_FragCoord.x/hScene, 1);
   
}
