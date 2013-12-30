
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

const float D = 10000.0;
const float epsilon = 0.0001;
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

float f_box(vec3 vecP, float size)
{
	
	//vec3 vecD = abs(vecP-vecO);
	//return length(max(abs(vecD)-s,0.0));
   vec3 vecD = abs(vecP) - vec3(size);
  // return max(vecD - vec3(size,size,size));
   return max(max(vecD.x, vecD.y), vecD.z);
	//vec3 vecD = abs(vecP-vecO) - vec3(size,size,size);
//	return min(max(vecD.x,max(vecD.y,vecD.z)),0.0) + length(max(vecD,0.0));
}



float f_min(float fA, float fB, vec4 cintA, vec4 cintB, out vec4 cint)
{
	if(fA <=fB)
	{
		cint = cintA;
		return fA;
	}
	else
	{
		cint = cintB;
		return fB;
	}
}

//http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float map(vec3 vecP, int kmap)
{
	float fA = f_box(vec3(matiA * vec4(vecP,1)), 100.0);
	float fB = f_box(vec3(matiB * vec4(vecP,1)), 100.0);
	if(kmap == kmapUnion)
		return min(fA, fB);	
	else if(kmap == kmapIntersection)
		return max(fA, fB);
}

vec3 vecNorm(vec3 vecP, int kmap)
{	

	return vec3(
		map(vecP + vec3(epsilon,0,0), kmap) - map(vecP - vec3(epsilon,0,0), kmap),
		map(vecP + vec3(0,epsilon,0), kmap) - map(vecP - vec3(0,epsilon,0), kmap),
		map(vecP + vec3(0,0,epsilon), kmap) - map(vecP - vec3(0,0,epsilon), kmap)
	);

}

void rm(vec3 vecV, vec3 vecD, int kmap, out float t, out vec3 vecN){

	float d = 0.0;
	vec4 cintDiffuse;
	vec3 vecQ;
	
	for (int i=0; i<=100; i++) {
		
		if(t >= D)
			return;
		
		vecQ = vecV + t* vecD;
		d = map(vecQ, kmap);

		if (d < epsilon)
			break;	
		
		t += d;
	}
	
	vecN = vecNorm(vecQ, kmap);
}

vec4 cintShade(vec4 cintDiffuse, vec3 vecN){
	return cintDiffuse * 
		(cintAmbient + (vec4(1) * max(0.0, dot(normalize(vecN), normalize(vecLight)))));
}

vec4 cintBlend(vec4 cintA, vec4 cintB){

	float outA = cintA.a + cintB.a*(1.0-cintA.a);
	if(outA > 0.0)
		return vec4( (cintA.rgb*cintA.a + cintB.rgb*cintB.a * (1.0-cintA.a)) / outA, outA);
	return vec4(0);
}

vec4 cintGet(vec3 vecV, vec3 vecD){

	float tUnion, tIntersection;
	vec3 vecNUnion, vecNIntersection;
	
	rm(vecV, vecD, kmapUnion, tUnion, vecNUnion);
	rm(vecV, vecD, kmapIntersection, tIntersection, vecNIntersection);
	vec4 cintUnion = cintShade(vec4(0,0,1,0.05), vecNUnion);
	vec4 cintIntersection = cintShade(vec4(1,0,0,1), vecNIntersection);
	

	if (tIntersection >= D && tUnion>=D)
		return vec4(0);
	if (tIntersection >= D)
		return cintUnion;
	if (tUnion >= D)
		return cintIntersection;
	
	if(tIntersection > tUnion + epsilon)
		return cintBlend(cintUnion, cintIntersection);
	
	return cintIntersection;

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
