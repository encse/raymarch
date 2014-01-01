
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
uniform mat4 matiA;
uniform mat4 matiB;
uniform int TIME_FROM_INIT;
uniform Cam cam;



vec3 vecLight = vec3(1,0.4,0);
vec4 cintAmbient = vec4(0.6,0.6,0.6,1);
vec4 cintBg = vec4(1,1,1,1);

const float D = 1000.0;
const float epsilon = 0.001;
const float scale = 8.0;
const int clight = 2;
const int kmapUnion = 0;
const int kmapIntersection = 1;

float f_sphere(vec3 vecP, vec3 vecO, float r)
{
	return length(vecO-vecP)-r;
}

float f_plane(vec3 vecP, vec3 vecO, vec3 vecN)
{
	return dot(vecN, vecP-vecO);
}

float f_sbox(vec3 vecP, float size)
{
	vec3 d = abs(vecP)-vec3(size);
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float f_ubox(vec3 vecP, float size)
{
	return length(max(abs(vecP)-vec3(size),0.0));

}




float f_min(float fA, float fB, out int iobst)
{
	if(fA < fB)
	{
		iobst = 0;
		return fA;
	}
	else
	{
		iobst = 1;
		return fB;
	}
}

//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float map(vec3 vecP, out int iobst)
{
	float fsA = f_sbox(vec3(matiA * vec4(vecP,1)), 100.0);
	float fsB = f_sbox(vec3(matiB * vec4(vecP,1)), 100.0);
	
	float fuA = f_ubox(vec3(matiA * vec4(vecP,1)), 100.0);
	float fuB = f_ubox(vec3(matiB * vec4(vecP,1)), 100.0);
	
	
	
	//iobst = 1;
	//return max(fA, fB);
	//iobst = 1;
//	return fA;
	iobst = 1;
	//return fsB;
	return max(fsA, fsB);
	//return max(fsA, fsB);
	return f_min(fsA,max(fsA, fsB), iobst);
	
}

vec3 vecNorm(vec3 vecP)
{	
	int iobst;
	return vec3(
		map(vecP + vec3(epsilon,0,0), iobst) - map(vecP - vec3(epsilon,0,0), iobst),
		map(vecP + vec3(0,epsilon,0), iobst) - map(vecP - vec3(0,epsilon,0), iobst),
		map(vecP + vec3(0,0,epsilon), iobst) - map(vecP - vec3(0,0,epsilon), iobst)
	);

}

vec4 cintShade(vec4 cintDiffuse, vec3 vecN){
	float c = abs(dot(normalize(vecN), normalize(vecLight)));
	return cintDiffuse * (cintAmbient + vec4(c));
}

vec4 cintBlend(vec4 cintA, vec4 cintB){

	float outA = cintA.a + cintB.a*(1.0-cintA.a);
	if(outA > 0.0)
		return vec4( (cintA.rgb*cintA.a + cintB.rgb*cintB.a * (1.0-cintA.a)) / outA, outA);
	return vec4(0);
}


vec4 rm(vec3 vecV, vec3 vecD){

	vec4 cint = vec4(0); 
	float t = 0.0;
	
	for(int j=0;j<20;j++) {	

		vec3 vecQ;
		int iobst=-1;
		for (int i=0; i<=1000; i++) {
			if(t >= D)
				break;
			
			vecQ = vecV + t * vecD;
			float d = abs(map(vecQ, iobst));

			if (d < epsilon)
			{
				
				break;	
			}
			
			t += d;
			iobst = -1;
		}
		
		if (iobst < 0)
			return cint;
		
		vec3 vecN = vecNorm(vecQ);	
		vec4 cintDiffuse;
		if(iobst == 1)
			cintDiffuse = vec4(0,0,1,0.1);
		else if(iobst == 0)
			cintDiffuse = vec4(1,0,0,1);
		
		cint += cintBlend(cint, cintShade(cintDiffuse, vecN));
		
		if(cint.a >= 1.0-epsilon)
			break;
		
		t+=epsilon;
		for (int i=0; i<=1000; i++) {
			if(t >= D)
				break;
			
			vecQ = vecV + t * vecD;
			float d = max(epsilon, abs(map(vecQ, iobst)));
			t += d;
			if (d > 2.0*epsilon)
				break;	
		}
		
	}
	
	return cint;
}


vec4 cintGet(vec3 vecV, vec3 vecD){

	return rm(vecV, vecD);
}

void main() {

//	mat4 m = mat4(1);
//	mat4 d = transpose(m);
	float wScene = uCanvasSize.x;
	float hScene = uCanvasSize.y;
	
	vec3 vectS = cam.vectP + cam.vectX * (gl_FragCoord.x-wScene/2.0) + cam.vectY * (gl_FragCoord.y-hScene /2.0);
 
    vec4 cint = cintGet(vectS, normalize(vectS - cam.vectO));
	
	gl_FragColor =  cintBlend(cint, cintBg);
	//gl_FragColor =  vec4(-1.0+gl_FragCoord.x /wScene, -1.0+gl_FragCoord.x/hScene,-1.0+gl_FragCoord.x/hScene, 1);
   
}
