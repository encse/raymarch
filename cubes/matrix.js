
var vec3 = (function(){
	function cross(vectU, vectV){
		return [
			vectU[1] * vectV[2] - vectU[2] * vectV[1],
			vectU[2] * vectV[0] - vectU[0] * vectV[2],
			vectU[0] * vectV[1] - vectU[1] * vectV[0]
		];
	}
	function length(vect){
		return Math.sqrt(vect[0]*vect[0] + vect[1]*vect[1] + vect[2]*vect[2]);
	}

	function normalize(vect){
		var d = length(vect);
		return [vect[0]/d, vect[1]/d, vect[2]/d];
	}

	function mul(d, vect) {
		
		return [vect[0] * d, vect[1] * d, vect[2] * d];
	}

	function sub(vectA, vectB) {

		return [vectA[0] - vectB[0], vectA[1] - vectB[1], vectA[2] - vectB[2]];
	}
	
	return{
		cross: cross,
		length: length,
		normalize: normalize, 
		mul: mul,
		sub: sub
	}

})();


var mat4 = (function(){
	function create() {
		var out = new Float32Array(16);
		out[0] = 1;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = 1;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = 1;
		out[11] = 0;
		out[12] = 0;
		out[13] = 0;
		out[14] = 0;
		out[15] = 1;
		return out;
	};


	function clone(a) {
		var out = new Float32Array(16);
		out[0] = a[0];
		out[1] = a[1];
		out[2] = a[2];
		out[3] = a[3];
		out[4] = a[4];
		out[5] = a[5];
		out[6] = a[6];
		out[7] = a[7];
		out[8] = a[8];
		out[9] = a[9];
		out[10] = a[10];
		out[11] = a[11];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
		return out;
	};

	function multiply(a, b) {
		var out = mat4.create();
		
		var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

		// Cache only the current line of the second matrix
		var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
		out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
		out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
		out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
		out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
		return out;
	}
	
	
	function translate (mat, vec3){
		var mat4Result = mat4.clone(mat);
		mat4Result[12] += vec3[0];
		mat4Result[13] += vec3[1];
		mat4Result[14] += vec3[2];
		return mat4Result;
	}
	
	
	function rotate (mat, axis, rad, vecOrigin){
	
		if (vecOrigin)
			mat = translate(mat, [-vecOrigin[0], -vecOrigin[1], -vecOrigin[2]]);	
		
		var x = axis[0], y = axis[1], z = axis[2],
			len = Math.sqrt(x * x + y * y + z * z),
			s, c, t,
			b00, b01, b02,
			b10, b11, b12,
			b20, b21, b22;

		if (Math.abs(len) < 0.000001) { return null; }
		
		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;

		s = Math.sin(rad);
		c = Math.cos(rad);
		t = 1 - c;

		// Construct the elements of the rotation matrix
		b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
		b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
		b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
	
		var matB = mat4.create();
		matB[0] = b00; matB[1] = b01; matB[2] = b02;
		matB[4] = b10; matB[5] = b11; matB[6] = b12;
		matB[8] = b20; matB[9] = b21; matB[10] = b22;
		
		mat = mat4.multiply(matB, mat);
	
		if (vecOrigin)
			mat = translate(mat, vecOrigin);	
		return mat;
	}
	
	function scale (mat, v){
		
		var x = v[0], y = v[1], z = v[2];
	
		var mat4Result = mat4.clone(mat);
		
		mat4Result[0] *= x;
		mat4Result[1] *= x;
		mat4Result[2] *= x;
		mat4Result[3] *= x;
		mat4Result[4] *= y;
		mat4Result[5] *= y;
		mat4Result[6] *= y;
		mat4Result[7] *= y;
		mat4Result[8] *= z;
		mat4Result[9] *= z;
		mat4Result[10] *= z;
		mat4Result[11] *= z;
	
		return mat4Result;
	}
	
	function invert(a){
		var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

			b00 = a00 * a11 - a01 * a10,
			b01 = a00 * a12 - a02 * a10,
			b02 = a00 * a13 - a03 * a10,
			b03 = a01 * a12 - a02 * a11,
			b04 = a01 * a13 - a03 * a11,
			b05 = a02 * a13 - a03 * a12,
			b06 = a20 * a31 - a21 * a30,
			b07 = a20 * a32 - a22 * a30,
			b08 = a20 * a33 - a23 * a30,
			b09 = a21 * a32 - a22 * a31,
			b10 = a21 * a33 - a23 * a31,
			b11 = a22 * a33 - a23 * a32,

			// Calculate the determinant
			det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!det) { 
			return null; 
		}
		det = 1.0 / det;

		var out = mat4.create();
		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
		out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
		out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
		out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
		out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
		out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
		out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
		out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
		out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
		out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
		out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
		out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
		out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
		out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
		out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
		out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

		return out;
	}
	
	function camLookAt(alpha, beta) {
		var alphaRad = alpha * 3.141592654 / 180.0;
		var betaRad = beta * 3.141592654 / 180.0;
		
		var vectP = [Math.cos(alphaRad) * Math.cos(betaRad), Math.sin(betaRad), Math.sin(alphaRad)* Math.cos(betaRad)];
		var vectZ = vec3.mul(100000, vectP);
		
		var u = vec3.cross(vectZ, [0, 1, 0]);
		
		if (vec3.length(u) == 0.0)
			 u = vec3.cross(vectZ, [1, 0, 0]);
		var v = vec3.cross(u, vectZ);
		
		var vectX = vec3.normalize(u);
		var vectY = vec3.normalize(v);
		
		var matCam = mat4.create();
		matCam[0] = vectX[0];
		matCam[1] = vectX[1];
		matCam[2] = vectX[2];
		
		matCam[4] = vectY[0];
		matCam[5] = vectY[1];
		matCam[6] = vectY[2];
		
		matCam[8] = vectZ[0];
		matCam[9] = vectZ[1];
		matCam[10] = vectZ[2];
		
		matCam[12] = vectP[0];
		matCam[13] = vectP[1];
		matCam[14] = vectP[2];
	
		return matCam;
	}
	
	return{
		create:create,
		clone: clone,
		multiply: multiply,
		translate: translate,
		rotate: rotate,
		invert: invert,
		scale: scale,
		camLookAt: camLookAt
	}
})();