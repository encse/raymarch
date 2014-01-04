var cubes =  (function(){

	function rendererCreate(canvas, gl, program) {

  	    gl.uniform2f(gl.getUniformLocation(program, 'uCanvasSize'), canvas.width, canvas.height);

		var ulocMatA = gl.getUniformLocation(program, 'matA');
		var ulocMatB = gl.getUniformLocation(program, 'matB');
		var ulocMatiA = gl.getUniformLocation(program, 'matiA');
		var ulocMatiB = gl.getUniformLocation(program, 'matiB');
		var ulocMatCam = gl.getUniformLocation(program, 'matCam');
		
		var dtStart = Date.now();
		
		return RaytraceUtils.screenQuadRenderer(gl, program, function(){
			var TIME_FROM_INIT =  Date.now() - dtStart;

			var sizeBox = 300.0;
			var matA = mat4.create();
			matA = mat4.translate(matA, [-0.5,-0.5,-0.5]);
			matA = mat4.scale(matA, [sizeBox, sizeBox, sizeBox]);
			
			var matB = mat4.create();
			matB = mat4.translate(matB, [-0.5,-0.5,-0.5]);
			matB = mat4.scale(matB, [sizeBox, sizeBox, sizeBox]);
			
			matB = mat4.rotate(matB, [0,1,0], 0.04*TIME_FROM_INIT  * Math.PI/180, [150,150,150]);
			matB = mat4.translate(matB, [0,0,100*Math.sin(0.1*TIME_FROM_INIT * Math.PI/180 )]);
				
			gl.uniformMatrix4fv(ulocMatiA, false, mat4.invert(matA));
			gl.uniformMatrix4fv(ulocMatiB, false, mat4.invert(matB));
			gl.uniformMatrix4fv(ulocMatA, false, matA);
			gl.uniformMatrix4fv(ulocMatB, false, matB);
			gl.uniformMatrix4fv(ulocMatCam, false, mat4.camLookAt(
				45, // *Math.sin(TIME_FROM_INIT / 1000.0),
				45.0 //*Math.sin(TIME_FROM_INIT / 1000.0), //. + 50.0*sin(float(TIME_FROM_INIT)/200.),
			));
			
		});
	
    }
	 
	function run(domidCanvas)
	{
		RaytraceUtils.init(
			document.getElementById(domidCanvas), 
			U.resolveURI(location.href,'vshader.vs'), 
			U.resolveURI(location.href,'rm.frag'), 
			rendererCreate);
	}
	
	return {
		run: run
	}
})();



