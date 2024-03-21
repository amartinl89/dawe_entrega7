var efecto = null;
var clip = "videos/demovideo1"; // nombre del vídeo, sin extensión
var audio_path = "audio/soundtrack.mp3"

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
	let botonScifi = document.getElementById("scifi");
    botonScifi.onclick = cambiarEfecto;

	//c)
	let botonRotar = document.getElementById("rotar");
	botonRotar.onclick = salirRotacion;

	//d)
	let botonPlay = document.getElementById("play");
	botonPlay.onclick = function() {
        loadAudio(audio_path)
        .then(audio => {
            audio.play();
        })
        .catch(error => {
            console.error("Error al cargar el audio:", error);
        });
    };

	//e)
	let botonPiP = document.getElementById("pip");
	botonPiP.onclick = activarPiP;

}

function cambiarEfecto(e){
	var id = e.target.getAttribute("id");
	if ( id == "byn" ){
		efecto = byn;
	} else if (id == "scifi") {
            efecto = scifi;
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
	if(salir){
	//display.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
		var frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
		var length = frame.data.length / 4;
		rotationAngle += rotationSpeed;


		rotationAngle %= 360;


		//buffer.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		buffer.save();
		buffer.translate(bufferCanvas.width * 0.5, bufferCanvas.height *0.5);
		buffer.rotate(rotationAngle * Math.PI / 180); 
		buffer.drawImage(video, -bufferCanvas.width *0.5, -bufferCanvas.height *0.5, bufferCanvas.width, bufferCanvas.height);
		buffer.restore();
		for (var i = 0; i < length; i++) {
			var r = frame.data[i * 4 + 0];
			var g = frame.data[i * 4 + 1];
			var b = frame.data[i * 4 + 2];
			if (efecto){		
				efecto(i, r, g, b, frame.data);
			}
		}
	
		display.drawImage(bufferCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
		display.putImageData(frame, 0, 0);

	
		requestAnimationFrame(procesarFrame);
		
	}else{
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
			display.drawImage(bufferCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
		display.putImageData(frame, 0, 0);

		

		setTimeout(procesarFrame, 0);
	}
	
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
	var rotationAngle = 0; 
	var rotationSpeed = 0.5; 
	var salir = false;

function salirRotacion(){
	if (salir){
		salir = false;
	}
	else {
		rotationAngle = 0;
		salir = true;
	}
}

salirPiP = false;

function activarPiP(){
	if (salirPiP == true){
		salirPiP = false;
		formatoPiP();
	}
	else {
		salirPiP = true;
		formatoPiP();
	}
}

async function formatoPiP() {
	
    let canvasVideo = document.createElement('video');
	let displayCanvas = document.getElementById("display");
	canvasVideo.width = displayCanvas.width;
	canvasVideo.height = displayCanvas.height;

	var canvasVideoStream = displayCanvas.captureStream();
	canvasVideo.srcObject = canvasVideoStream;
	// Esperar a que el vídeo se cargue
	await new Promise(resolve => {
		canvasVideo.addEventListener('loadedmetadata', resolve);
	});

    canvasVideo.play();

	if (salirPiP == true) {
		// Solicitar el modo Picture-in-Picture
		await canvasVideo.requestPictureInPicture();
	} else if(salirPiP == false && document.pictureInPictureElement){ //Por si se sale sin pulsar al botón
		// Salir del modo Picture-in-Picture
		await document.exitPictureInPicture();
	}
}

function scifi(pos, r, g, b, data) {
    var offset = pos * 4;
    data[offset] = Math.round(255 - r);
    data[offset+1] = Math.round(255 - g) ;
    data[offset+2] = Math.round(255 - b) ;
}

function loadAudio(audioPath) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioPath);
    audio.addEventListener('canplaythrough', () => {
      resolve(audio);
    });
    audio.load();
  });
}



