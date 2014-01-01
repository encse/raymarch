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
uniform mat4 matA, matiA;
uniform mat4 matB, matiB;
uniform Cam cam;

const vec3 vecLight = vec3(0,1,1);
const vec4 cintAmbient = vec4(0.8,0.8,0.8,1);
const vec4 cintBg = vec4(1,1,1,1);
const vec4 cintBox = vec4(0.0,0.0,0.9,0.1);
const vec4 cintIntersection = vec4(0.9,0.7,0,1);

const float sizeBox = 300.0;
const float epsilon = 0.00001;
const float T_LIM = 100000.0;

//compute shading based on the normal vector at a point and diffuse color of object
vec4 cintShade(vec4 cintDiffuse, vec3 vecN){
	
	//cos of angle between vecN and vecLight
	//negative if angle is > Pi/2
	float cphi = dot(normalize(vecN), normalize(vecLight));
	
	if(cintDiffuse.a < 1.0) 
		cphi = abs(cphi); //facing towards light if transparent 
	else
		cphi = max(0.0, cphi); //no light if < 0
		
	return cintDiffuse * (cintAmbient + vec4(cphi));
}

//alpha blending of two colors
vec4 cintBlend(vec4 cintA, vec4 cintB){

	float outA = cintA.a + cintB.a*(1.0-cintA.a);
	if(outA > 0.0)
		return vec4( (cintA.rgb*cintA.a + cintB.rgb*cintB.a * (1.0-cintA.a)) / outA, outA);
	return vec4(0);
}


//compute intersections of a ray originating at vecV and going towards vecD, with a box side

//vecO: point on box side
//vecN: normal vector of box side
//result is false if doesn't intersect the plane inside the box
//out t: in case of an intersection the distance along vecD 
//vecV and vecD are in the boxes coordinate system.
bool line_box_side_intersect(vec3 vecO, vec3 vecN, vec3 vecV, vec3 vecD, out float t){
	float d = dot(vecD, vecN);
	if(abs(d)<epsilon)
	  return false;
	
	t = dot(vecO - vecV, vecN) / d;
	
	vec3 vecQ = vecV + t*vecD;
	
	if(min(vecQ.x, min(vecQ.y, vecQ.z)) < -6.0*epsilon || max(vecQ.x, max(vecQ.y, vecQ.z)) > sizeBox + 6.0*epsilon)
		return false;

	return true;
}

//compute intersections of a ray originating at vecV and goint towards vecD, with a box having transformation matrix mat, and inverse matrix mati
//result:
//t_i: distance along vecD to the first and last intersection (T_LIM if no such thing)
//vecN_i: normal vector at t_i (null vector if t_i is T_LIM)
void box_intersections(vec3 vecV, vec3 vecD, mat4 mat, mat4 mati, out float t1, out vec3 vecN1, out float t2, out vec3 vecN2) {

	vecV = vec3(mati * vec4(vecV, 1));
	vecD = vec3(mati * vec4(vecD, 0));
	vecV += 0.5*vec3(sizeBox,sizeBox,sizeBox);

	t1 = T_LIM;
	t2 = -T_LIM;
	vecN1 = vecN2 = vec3(0);
	
	vec3 rgvecCorner[6]; 
	rgvecCorner[0] = rgvecCorner[1] = rgvecCorner[2] = vec3(0);
	rgvecCorner[3] = rgvecCorner[4] = rgvecCorner[5] = vec3(sizeBox);

	vec3 rgvecN[6];
	rgvecN[0] = vec3(-1,0,0);
	rgvecN[1] = vec3(0,-1,0);
	rgvecN[2] = vec3(0,0,-1);
	rgvecN[3] = vec3(1,0,0);
	rgvecN[4] = vec3(0,1,0);
	rgvecN[5] = vec3(0,0,1);
	
	for(int i=0;i<6;i++)
	{
		vec3 vecCorner = rgvecCorner[i];
		vec3 vecN = rgvecN[i];

		float t;
		if (line_box_side_intersect(vecCorner, vecN, vecV, vecD, t))
		{
			if(t<t1) {t1 = t; vecN1 = vecN;}
			if(t>t2) {t2 = t; vecN2 = vecN;}
		}
	}
	
	if(t2 == -T_LIM)
		t2 = T_LIM;
		
	vecN1 = vec3(mat * vec4(vecN1,0));
	vecN2 = vec3(mat * vec4(vecN2,0));
}

vec4 cintGet(vec3 vecV, vec3 vecD){
	//looking from vecV in the vecD direction
	
	float t1A, t2A, t1B,t2B;
	vec3 vecN1A, vecN2A, vecN1B, vecN2B;
	
	//compute intersections with boxA and boxB
	box_intersections(vecV, vecD, matA, matiA, t1A, vecN1A, t2A, vecN2A);
	box_intersections(vecV, vecD, matB, matiB, t1B, vecN1B, t2B, vecN2B);

	vec4 cint = vec4(0);
	
	if (t1A <= t1B && t1B <= t2A && t2A < T_LIM)
	{
		//we reach boxA first, then before quiting also collide with boxB
		cint = cintBlend(cint, cintShade(cintBox, vecN1A));
		cint = cintBlend(cint, cintShade(cintIntersection, vecN1B));
	}
	else if (t1B <= t1A && t1A <= t2B && t2B < T_LIM)
	{
		//we reach boxB first, then before quiting also collide with boxA
		cint = cintBlend(cint, cintShade(cintBox, vecN1B));
		cint = cintBlend(cint, cintShade(cintIntersection, vecN1A));
	}
	else
	{
		//the boxes don't intersect, combine the four transparent colors
		cint = t1A < T_LIM ? cintBlend(cint, cintShade(cintBox, vecN1A)) : cint;
		cint = t2A < T_LIM ? cintBlend(cint, cintShade(cintBox, vecN2A)) : cint;
		cint = t1B < T_LIM ? cintBlend(cint, cintShade(cintBox, vecN1B)) : cint;
		cint = t2B < T_LIM ? cintBlend(cint, cintShade(cintBox, vecN2B)) : cint;
	}
	return cint;
}

void main() {
	
	vec3 vectS = cam.vectP + cam.vectX * (gl_FragCoord.x - uCanvasSize.x / 2.0) + cam.vectY * (gl_FragCoord.y - uCanvasSize.y / 2.0);
	vec4 cint = cintGet(vectS, normalize(vectS - cam.vectO));
	
	gl_FragColor = cintBlend(cint, cintBg);
}
