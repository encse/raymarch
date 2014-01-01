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

	
	
	function init(domidCanvas)
	{
		var urlBase = location.href;
		var c = document.getElementById(domidCanvas);
		var gl = WebGLUtils.setupWebGL(c);
		var dt = Date.now();
		var vertexPosBuffer = screenQuad();
		
		loadProgram(U.resolveURI(urlBase,'vshader.vs'), U.resolveURI(urlBase,'rm.frag'), function (program) {
		    gl.useProgram(program);
		    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		    gl.enable(gl.BLEND);
		    gl.viewport(0, 0, c.width, c.height);
		   
		    program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
		    program.timeFromInit = gl.getUniformLocation(program, 'TIME_FROM_INIT');
		    gl.enableVertexAttribArray(program.vertexPosArray);
		 
		    gl.uniform2f(gl.getUniformLocation(program, 'uCanvasSize'), c.width, c.height);
		  
		    var ulocMatA = gl.getUniformLocation(program, 'matA');
		    var ulocMatB = gl.getUniformLocation(program, 'matB');
		    var ulocMatiA = gl.getUniformLocation(program, 'matiA');
		    var ulocMatiB = gl.getUniformLocation(program, 'matiB');
		
			
		
			var camLookAt = (function () {
			   var ulocCamVectO = gl.getUniformLocation(program, 'cam.vectO');
			   var ulocCamVectP = gl.getUniformLocation(program, 'cam.vectP');
			   var ulocCamVectX = gl.getUniformLocation(program, 'cam.vectX');
			   var ulocCamVectY = gl.getUniformLocation(program, 'cam.vectY');

			   return function (alpha, beta, d) {
				   var alphaRad = alpha * 3.141592654 / 180.0;
				   var betaRad = beta * 3.141592654 / 180.0;

				   var cam = {};
				   cam.vectP = vec3(d * Math.cos(alphaRad) * Math.cos(betaRad), d * Math.sin(betaRad), d * Math.sin(alphaRad)* Math.cos(betaRad));
				   cam.vectO = mul(100001.0, normalize(cam.vectP));
				   var u = cross(vec3(0, 1, 0), sub(cam.vectP, cam.vectO));

				   if (length(u) == 0.0)
					   u = cross(vec3(1, 0, 0), sub(cam.vectP, cam.vectO));
				   var v = cross(sub(cam.vectP, cam.vectO), u);

				   cam.vectX = normalize(u);
				   cam.vectY = normalize(v);

				   gl.uniform3f(ulocCamVectP, cam.vectP.x, cam.vectP.y, cam.vectP.z);
				   gl.uniform3f(ulocCamVectO, cam.vectO.x, cam.vectO.y, cam.vectO.z);
				   gl.uniform3f(ulocCamVectX, cam.vectX.x, cam.vectX.y, cam.vectX.z);
				   gl.uniform3f(ulocCamVectY, cam.vectY.x, cam.vectY.y, cam.vectY.z);
			   }
		   })();

		   (function animloop() {

			    var TIME_FROM_INIT =  Date.now() - dt;
			    //var TIME_FROM_INIT = 1000; Date.now() - dt;

			    camLookAt(
					30,
					45.0, //. + 50.0*sin(float(TIME_FROM_INIT)/200.),
					400
					//1050.0 + 150.0 * Math.sin(TIME_FROM_INIT / 200.0)
					);

			    gl.clear(gl.COLOR_BUFFER_BIT);
			  
			    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
			    gl.uniform1i(program.timeFromInit, TIME_FROM_INIT);
			    
				var matA = mat4.create();
			
			function translate (mat4, vec3){
				mat4[3] += vec3[0];
				mat4[7] += vec3[1];
				mat4[11] += vec3[2];
				return mat4;
			}
				
			    matA = mat4.rotate(matA, matA, 0.04*TIME_FROM_INIT  * Math.PI/180, [1, 0, 0]); 
			 //   matA = mat4.translate(matA, matA, [10050,50,50]);
				
				//var matB = mat4.rotate(mat4.create(), mat4.create(), 0.05*TIME_FROM_INIT  * Math.PI/180, [0, 1, 0]); 
				var matB = mat4.create();
		  		
				//matB = mat4.translate(mat4.create(), matB, [0,0,100*Math.sin(0.1*TIME_FROM_INIT * Math.PI/180 )]);
				//matB = mat4.translate(mat4.create(), matB, [0,0,100]);
				//matB = mat4.rotate(mat4.create(), matB, 0.04*TIME_FROM_INIT  * Math.PI/180, [0,1, 0]);
				
				gl.uniformMatrix4fv(ulocMatiA, false, mat4.invert(mat4.create(),  matA));
			    gl.uniformMatrix4fv(ulocMatiB, false, mat4.invert(mat4.create(),  matB));
			

				gl.uniformMatrix4fv(ulocMatA, false, matA);
			    gl.uniformMatrix4fv(ulocMatB, false, matB);
			
			   
		
			   gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
			   gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexPosBuffer.numItems);
			   requestAnimationFrame(animloop);
			 
		   })();
		});
	
		function createShader(str, type) {
			var shader = gl.createShader(type);
			gl.shaderSource(shader, str);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				throw gl.getShaderInfoLog(shader);
			}
			return shader;
		}

		function screenQuad() {
			var vertexPosBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);

			var vertices = [
				-1.0, -1.0,
				-1.0,  1.0,
				 1.0,  1.0,
				 1.0, -1.0,
				-1.0, -1.0,
			];
			
			
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			vertexPosBuffer.itemSize = 2;
			vertexPosBuffer.numItems = 5;
			
			return vertexPosBuffer;
		}

		function linkProgram(program) {
			var vshader = createShader(program.vshaderSource, gl.VERTEX_SHADER);
			var fshader = createShader(program.fshaderSource, gl.FRAGMENT_SHADER);
			gl.attachShader(program, vshader);
			gl.attachShader(program, fshader);
			gl.linkProgram(program);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw gl.getProgramInfoLog(program);
			}
		}

		function loadFile(file, callback, noCache, isJson) {
			var request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState == 1) {
					if (isJson) {
						request.overrideMimeType('application/json');
					}
					request.send();
				} else if (request.readyState == 4) {
					if (request.status == 200) {
						callback(request.responseText);
					} else if (request.status == 404) {
						throw 'File "' + file + '" does not exist.';
					} else {
						throw 'XHR error ' + request.status + '.';
					}
				}
			};
			var url = file;
			if (noCache) {
				url += '?' + (new Date()).getTime();
			}
			request.open('GET', url, true);
		}

		function loadProgram(vs, fs, callback) {
			var program = gl.createProgram();
			function vshaderLoaded(str) {
				program.vshaderSource = str;
				if (program.fshaderSource) {
					linkProgram(program);
					callback(program);
				}
			}
			function fshaderLoaded(str) {
				program.fshaderSource = str;
				if (program.vshaderSource) {
					linkProgram(program);
					callback(program);
				}
			}
			loadFile(vs, vshaderLoaded, true);
			loadFile(fs, fshaderLoaded, true);
			return program;
		}

		
	}
	
	return {
		init: init
	}
})();



