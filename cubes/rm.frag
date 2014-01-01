
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

const int ITERLIM = 300;
const float D = 1000.0;
const float epsilon = 0.01;

//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float f_sbox(vec3 vecP, float size)
{
	vec3 d = abs(vecP)-vec3(size);
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float map(vec3 vecP, int iobst)
{
	float fs = iobst == 0 ? 
		f_sbox(vec3(matiA * vec4(vecP,1)), 100.0) : 
		f_sbox(vec3(matiB * vec4(vecP,1)), 100.0);
	return fs;
}

vec3 vecNorm(vec3 vecP, int iobst)
{	
	
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

void rm(vec3 vecV, vec3 vecD, int iobst, float tStart, out float t, out vec3 vecN) {
	
	t = tStart;
	vec3 vecQ;
	vecN = vec3(0);
	for (int i=0; i<=ITERLIM; i++) {
		if(i == ITERLIM)
			t = D;
		if(t >= D)
			break;
		vecQ = vecV + t * vecD;
		float d = abs(map(vecQ, iobst));

		if (d < epsilon) {
			vecN = vecNorm(vecQ, iobst);
			break;
		}
		
		t += d;
	}
}


void foo(vec3 vecV, vec3 vecD, int iobst, out float t1, out vec3 vecN1, out float t2, out vec3 vecN2){
	
	rm(vecV, vecD, iobst, 0.0, t1, vecN1);
	
	if(t1 >= D)	{
		t2 = t1;
		vecN2 = vec3(0);
		return;
	}
	
	t2 = t1+epsilon;
	for (int i=0; i<=ITERLIM; i++) {
		if(t2 >= D)
			break;
		
		vec3 vecQ = vecV + t2 * vecD;
		float d = max(epsilon, abs(map(vecQ, iobst)));
		t2 += d;
		if (d > 4.0*epsilon)
			break;	
	}
	
	rm(vecV, vecD, iobst, t2, t2, vecN2);
	
}

vec4 cintAdd(vec4 cint, vec4 cintBase, vec3 vecN) {
	return length(vecN) > 0.0 ? cintBlend(cint, cintShade(cintBase, vecN)) : cint;
}

vec4 cintGet(vec3 vecV, vec3 vecD){

	float t1A, t2A, t1B,t2B;
	vec3 vecN1A, vecN2A, vecN1B, vecN2B;
	
	foo(vecV, vecD, 0, t1A, vecN1A, t2A, vecN2A);
	foo(vecV, vecD, 1, t1B, vecN1B, t2B, vecN2B);
	
	vec4 cint = vec4(0);
	vec4 cintBox = vec4(0,0,1,0.05);
	vec4 cintIntersection = vec4(1,0,0,1);
		
	if(t1A <= t1B && t1B <= t2A && t2A < D)
	{
		cint = cintAdd(cint, cintBox, vecN1A);
		cint = cintAdd(cint, cintIntersection, vecN1B);
	}
	else if(t1B <= t1A && t1A <= t2B && t2B < D)
	{
		cint = cintAdd(cint, cintBox, vecN1B);
		cint = cintAdd(cint, cintIntersection, vecN1A);
	}
	else
	{
		cint = cintAdd(cint, cintBox, vecN1A);
		cint = cintAdd(cint, cintBox, vecN2A);
		cint = cintAdd(cint, cintBox, vecN1B);
		cint = cintAdd(cint, cintBox, vecN2B);
	}

	return cint;
}

void main() {
	float wScene = uCanvasSize.x;
	float hScene = uCanvasSize.y;
	
	vec3 vectS = cam.vectP + cam.vectX * (gl_FragCoord.x-wScene/2.0) + cam.vectY * (gl_FragCoord.y-hScene /2.0);
	vec4 cint = cintGet(vectS, normalize(vectS - cam.vectO));
	gl_FragColor =  cintBlend(cint, cintBg);
}
