var efecto = null;
var clip = "videos/demovideo1"; // nombre del vídeo, sin extensión

window.onload = function() {

	var video = document.getElementById("video");
	var botonByN = document.getElementById("byn");
	botonByN.onclick = cambiarEfecto;
	var botonNormal = document.getElementById("normal");
	botonNormal.onclick = cambiarEfecto;
				
	video.addEventListener("play", procesarFrame, false);
	
	video.src = clip + getFormatExtension();
	video.load();
	video.play();
	
	//a)
	let botonPausa = document.getElementById("pausa");
	botonPausa.onclick = pausar;
	
	//b)

	//c)
	let botonRotar = document.getElementById("rotar");
	botonRotar.onclick = rotar;
}

function cambiarEfecto(e){
	var id = e.target.getAttribute("id");
	if ( id == "byn" ){
		efecto = byn;
	} else {
		efecto = null;
	}
}

function getFormatExtension() {
	var video = document.getElementById("video");
	if (video.canPlayType("video/mp4") != "") {
		return ".mp4";
	} 
	else if (video.canPlayType("video/ogg") != "") {
		return ".ogv";
	}
	else if (video.canPlayType("video/webm") != "") {
		return ".webm";
	} 
}


function procesarFrame(e) {
	var video = document.getElementById("video");

	if (video.paused || video.ended) {
		return;
	}

	var bufferCanvas = document.getElementById("buffer");
	var displayCanvas = document.getElementById("display");
	var buffer = bufferCanvas.getContext("2d");
	var display = displayCanvas.getContext("2d");

	buffer.drawImage(video, 0, 0, bufferCanvas.width, bufferCanvas.height);
	var frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
	var length = frame.data.length / 4;

	for (var i = 0; i < length; i++) {
		var r = frame.data[i * 4 + 0];
		var g = frame.data[i * 4 + 1];
		var b = frame.data[i * 4 + 2];
		if (efecto){		
			efecto(i, r, g, b, frame.data);
		}
	}
	display.putImageData(frame, 0, 0);

	setTimeout(procesarFrame, 0);
	// en los navegadores modernos, es mejor usar :
	// requestAnimationFrame(procesarFrame);

}

function byn(pos, r, g, b, data) {
	var gris = (r+g+b)/3;

	data[pos * 4 + 0] = gris;
	data[pos * 4 + 1] = gris;
	data[pos * 4 + 2] = gris;
}

function pausar(){
	let video = document.getElementById("video");
	if (video.paused){
		video.play();
	} else {
		video.pause();
	}
}

function rotar(){

	var bufferCanvas = document.getElementById("buffer");
	var displayCanvas = document.getElementById("display");
	var buffer = bufferCanvas.getContext("2d");
	var display = displayCanvas.getContext("2d");

	display.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

  // Rotar el canvas del buffer
  buffer.save();
  buffer.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
  buffer.translate(bufferCanvas.width / 2, bufferCanvas.height / 2);
  buffer.rotate((rotationAngle += rotationSpeed) * Math.PI / 180); // Incrementa el ángulo de rotación
  buffer.drawImage(video, -bufferCanvas.width / 2, -bufferCanvas.height / 2, bufferCanvas.width, bufferCanvas.height);
  buffer.restore();

  // Copiar el contenido rotado al canvas de visualización
  display.drawImage(bufferCanvas, 0, 0, displayCanvas.width, displayCanvas.height);	
  // Llama a la función nuevamente en el próximo cuadro de animación
}

// Variables para el control de la rotación
var rotationAngle = 0; // Ángulo de rotación actual
var rotationSpeed = 1; // Velocidad de rotación (en grados por cuadro)

// Inicia la rotación indefinida
