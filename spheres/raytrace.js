/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

WebGLUtils = function() {

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs) {
  function showLink(str) {
    var container = canvas.parentNode;
    if (container) {
      container.innerHTML = makeFailHTML(str);
    }
  };

  if (!window.WebGLRenderingContext) {
    showLink(GET_A_WEBGL_BROWSER);
    return null;
  }

  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    showLink(OTHER_PROBLEM);
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           return window.setTimeout(callback, 1000/60);
         };
})();

/**
 * Provides cancelAnimationFrame in a cross browser way.
 */
window.cancelAnimFrame = (function() {
  return window.cancelAnimationFrame ||
         window.webkitCancelAnimationFrame ||
         window.mozCancelAnimationFrame ||
         window.oCancelAnimationFrame ||
         window.msCancelAnimationFrame ||
         window.clearTimeout;
})();



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

	function init(domidCanvas, urlBase)
	{
		var c = document.getElementById(domidCanvas);
		var gl = WebGLUtils.setupWebGL(c);
		var dt = Date.now();
		var vertexPosBuffer = screenQuad();
		
		loadProgram(urlBase+"/vshader.vs", urlBase+"/rm.frag", function (program) {
		   gl.useProgram(program);
		   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		   gl.enable(gl.BLEND);
		   gl.viewport(0, 0, c.width, c.height);
		   
		   program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
		   program.timeFromInit = gl.getUniformLocation(program, 'TIME_FROM_INIT');
		   gl.enableVertexAttribArray(program.vertexPosArray);
		 
		   gl.uniform2f(gl.getUniformLocation(program, 'uCanvasSize'), c.width, c.height);
		   
		   var camLookAt = (function () {
			   var cam_vectO = gl.getUniformLocation(program, 'cam.vectO');
			   var cam_vectP = gl.getUniformLocation(program, 'cam.vectP');
			   var cam_vectX = gl.getUniformLocation(program, 'cam.vectX');
			   var cam_vectY = gl.getUniformLocation(program, 'cam.vectY');

			   return function (alpha, beta, d) {
				   var alphaRad = alpha * 3.141592654 / 180.0;
				   var betaRad = beta * 3.141592654 / 180.0;

				   var cam = {};
				   cam.vectP = vec3(d * Math.cos(alphaRad) * Math.cos(betaRad), d * Math.sin(betaRad), d * Math.sin(alphaRad)* Math.cos(betaRad));
				   cam.vectO = mul(10001.0, normalize(cam.vectP));
				   var u = cross(vec3(0, 1, 0), sub(cam.vectP, cam.vectO));

				   if (length(u) == 0.0)
					   u = cross(vec3(1, 0, 0), sub(cam.vectP, cam.vectO));
				   var v = cross(sub(cam.vectP, cam.vectO), u);

				   cam.vectX = normalize(u);
				   cam.vectY = normalize(v);

				   gl.uniform3f(cam_vectP, cam.vectP.x, cam.vectP.y, cam.vectP.z);
				   gl.uniform3f(cam_vectO, cam.vectO.x, cam.vectO.y, cam.vectO.z);
				   gl.uniform3f(cam_vectX, cam.vectX.x, cam.vectX.y, cam.vectX.z);
				   gl.uniform3f(cam_vectY, cam.vectY.x, cam.vectY.y, cam.vectY.z);
			   }
		   })();

		   (function animloop() {

			   var TIME_FROM_INIT = Date.now() - dt;

			   camLookAt(
					TIME_FROM_INIT / 80.0,
					45.0, //. + 50.0*sin(float(TIME_FROM_INIT)/200.),
					550.0 + 150.0 * Math.sin(TIME_FROM_INIT / 200.0)
					);

			   gl.clear(gl.COLOR_BUFFER_BIT);
			  
			   gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
			   gl.uniform1i(program.timeFromInit, TIME_FROM_INIT);

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

