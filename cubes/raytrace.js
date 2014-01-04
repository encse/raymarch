var raytrace =  (function(){

	function vec3(x,y,z){
	   return { x: x, y: y, z: z };
	}
	
	function cint(r,g,b,a) {
	   return { r:r, g:g, b:b, a:a };
	}
	
	function cross(vectU, vectV){
		return vec3(
			vectU.y * vectV.z - vectU.z * vectV.y,
			vectU.z * vectV.x - vectU.x * vectV.z,
			vectU.x * vectV.y - vectU.y * vectV.x
		);
	}
	function length(vect){
		return Math.sqrt(vect.x*vect.x + vect.y*vect.y + vect.z*vect.z);
	}

	function normalize(vect){
		var d = length(vect);
		return vec3(vect.x/d, vect.y/d, vect.z/d);
	}

	function mul(d, vect) {
		
		return vec3(vect.x * d, vect.y * d, vect.z * d);
	}

	function sub(vectA, vectB) {

		return vec3(vectA.x - vectB.x, vectA.y - vectB.y, vectA.z - vectB.z);
	}

	function camLookAt(alpha, beta) {
		var alphaRad = alpha * 3.141592654 / 180.0;
		var betaRad = beta * 3.141592654 / 180.0;
		
		var vectP = vec3(Math.cos(alphaRad) * Math.cos(betaRad), Math.sin(betaRad), Math.sin(alphaRad)* Math.cos(betaRad));
		var vectZ = mul(100000, vectP);
		
		var u = cross(vectZ, vec3(0, 1, 0));
		
		if (length(u) == 0.0)
			 u = cross(vectZ, vec3(1, 0, 0));
		var v = cross(u, vectZ);
		
		var vectX = normalize(u);
		var vectY = normalize(v);
		
		var matCam = mat4.create();
		matCam[0] = vectX.x;
		matCam[1] = vectX.y;
		matCam[2] = vectX.z;
		
		matCam[4] = vectY.x;
		matCam[5] = vectY.y;
		matCam[6] = vectY.z;
		
		matCam[8] = vectZ.x;
		matCam[9] = vectZ.y;
		matCam[10] = vectZ.z;
		
		matCam[12] = vectP.x;
		matCam[13] = vectP.y;
		matCam[14] = vectP.z;
	
		return matCam;
    }
	
	function translate (mat4, vec3){
		mat4[3] += vec3[0];
		mat4[7] += vec3[1];
		mat4[11] += vec3[2];
		return mat4;
	}
	
	function rotate (mat, vecAxis, phi, vecOrigin){
	
		if(vecOrigin)
			translate(mat, [-vecOrigin[0], -vecOrigin[1], -vecOrigin[2]]);	
		mat4.rotate(mat, mat, phi, vecAxis);
		if(vecOrigin)
			translate(mat, vecOrigin);	
		return mat;
	}

	function rendererCreate(gl, program) {
		
		var ulocMatA = gl.getUniformLocation(program, 'matA');
		var ulocMatB = gl.getUniformLocation(program, 'matB');
		var ulocMatiA = gl.getUniformLocation(program, 'matiA');
		var ulocMatiB = gl.getUniformLocation(program, 'matiB');
		var ulocMatCam = gl.getUniformLocation(program, 'matCam');
		
		var dtStart = Date.now();
		var vertexPosBuffer = WebGLUtils.screenQuad(gl);
		return function(){
			var TIME_FROM_INIT =  Date.now() - dtStart;

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
		
			gl.uniformMatrix4fv(ulocMatCam, false, camLookAt(
				45, // *Math.sin(TIME_FROM_INIT / 1000.0),
				45.0 //*Math.sin(TIME_FROM_INIT / 1000.0), //. + 50.0*sin(float(TIME_FROM_INIT)/200.),
			));
			
			var sizeBox = 300.0;
			var matA = mat4.create();
			translate(matA, [-0.5,-0.5,-0.5]);
			mat4.scale(matA, matA, [sizeBox, sizeBox, sizeBox]);
			
			var matB = mat4.create();
			translate(matB, [-0.5,-0.5,-0.5]);
			mat4.scale(matB, matB, [sizeBox, sizeBox, sizeBox]);
			
		//	rotate(matB, [1,1,0], 0.04*TIME_FROM_INIT  * Math.PI/180, [150,150,150]);
			translate(matB, [0,0,100*Math.sin(0.1*TIME_FROM_INIT * Math.PI/180 )]);
			
			gl.uniformMatrix4fv(ulocMatiA, false, mat4.invert(mat4.create(),  mat4.transpose(mat4.create(), matA)));
			gl.uniformMatrix4fv(ulocMatiB, false, mat4.invert(mat4.create(),  mat4.transpose(mat4.create(), matB)));
			gl.uniformMatrix4fv(ulocMatA, false, mat4.transpose(mat4.create(), matA));
			gl.uniformMatrix4fv(ulocMatB, false, mat4.transpose(mat4.create(), matB));
			gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
		};
	
    }
	 
	function run(domidCanvas)
	{
		var urlBase = location.href;
		var c = document.getElementById(domidCanvas);
		
		var gl = WebGLUtils.setupWebGL(c);
		WebGLUtils.loadProgram(gl, U.resolveURI(urlBase,'vshader.vs'), U.resolveURI(urlBase,'rm.frag'), function (program) {
			
		    gl.useProgram(program);
		    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		    gl.enable(gl.BLEND);
		    gl.viewport(0, 0, c.width, c.height);
		
		    program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
		    program.timeFromInit = gl.getUniformLocation(program, 'TIME_FROM_INIT');
		    gl.enableVertexAttribArray(program.vertexPosArray);
		    gl.uniform2f(gl.getUniformLocation(program, 'uCanvasSize'), c.width, c.height);

			var renderer = rendererCreate(gl, program);
			
			(function v(){ renderer(); requestAnimationFrame(v);})();
		});
	
	}
	
	return {
		init: run
	}
})();



