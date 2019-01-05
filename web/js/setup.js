/*
Copyright (c) 2012-2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
A NES emulator in WebAssembly. Based on vNES.
Licensed under GPLV3 or later
Hosted at: https://github.com/workhorsy/SaltyNES
*/


let g_zoom = 1;
let g_mouse_move_timeout = null;

let statusElement = $('#status');
let progressElement = $('#progress');
var Module = null;

function onReady() {
	// show('#select_game');
	// show('#fileupload');
	show('#screen');
	// hide('#progress');
	Module.setStatus('');
}

function play_game(game_data) {
	Module.set_game_data_size(game_data.length);

	for (let i=0; i<game_data.length; ++i) {
		Module.set_game_data_index(i, game_data[i]);
	}

	Module.on_emultor_start();
}

function downloadBlobWithProgress(url, cb_progress, cb_done, cb_error) {
	let oReq = new XMLHttpRequest();
	oReq.open('GET', url, true);
	oReq.responseType = 'blob';

	oReq.addEventListener("load", function(event) {
		if (this.status === 200) {
			let blob = new Blob([this.response]);
			cb_done(blob);
		} else {
			cb_error(this.status);
		}
	}, false);
	oReq.addEventListener("error", function(event) {
		console.warn(event);
	}, false);
	oReq.addEventListener("abort", function(event) {
		console.warn(event);
	}, false);

	oReq.timeout = 30000;
	oReq.send();
}

function downloadAndLoadScript(url, mime_type, cb) {
	downloadBlobWithProgress(url,
		function(percent_complete) {
			//console.log(percent_complete);
			// progressElement.value = percent_complete * 100;
		},
		function(blob) {
			//console.log(blob);
			let obj_url = URL.createObjectURL(blob);
			let script = document.createElement('script');
			script.type = mime_type;
			script.onload = function() {
				//URL.revokeObjectURL(obj_url);
				//console.log('Revoking url: ' + url + ',  ' + obj_url);
			};
			script.setAttribute('src', obj_url);
			document.head.appendChild(script);
			cb();
		},
		function(status) {
			console.warn(status);
		}
	);
}

function fetchOctetStream(fileName) {
	return fetch(fileName)
		.then(response => {
			if (response.status >= 200 && response.status < 400)
				return response.arrayBuffer()
			throw new Error('Network error: ' + response.statusText + ', ' + response.status);
		})
}

let currentCartridge = null;

function loadCartridge(name) {
	if (null !== currentCartridge) {
		alert('Чтобы выбрать другой картридж, нужно перезагрузить страницу.'); return;
		$('.dendy .cartridge')[0].classList.remove(currentCartridge);
		show('.cartridge-container .' + currentCartridge);
	}

	hide('.cartridge-container .' + name);
	$('.dendy .cartridge')[0].classList.add(name);
	show('.dendy .cartridge');

	currentCartridge = name;

	fetchOctetStream('nes/' + name + '.nes')
		.then(data => {
			 let game_data = new Uint8Array(data);
			 play_game(game_data);
		})
}

let main = (function() {
	Module = {
		canvas: (function() {
			let screen = $('#screen');

			// As a default initial behavior, pop up an alert when webgl context is lost. To make your
			// application robust, you may want to override this behavior before shipping!
			// See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
			screen.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

			return screen;
		})(),
		setStatus: function(text) {
			console.log(text);
		}
	};

	$('#own').addEventListener('click', function(event) {
		$('#fileupload').dispatchEvent(new MouseEvent('click'));
	});

	$('#joystick').addEventListener('click', function(event) {
		show('#scheme');
	});

	$('#scheme').addEventListener('click', function(event) {
		hide('#scheme');
	});

	$('#fileupload').addEventListener('change', function(event) {
		show('.dendy .cartridge');

		if (null !== currentCartridge) {
			alert('Чтобы выбрать другой картридж, нужно перезагрузить страницу.'); return;
			$('.dendy .cartridge')[0].classList.remove(currentCartridge);
		}

		currentCartridge = 'own';

		let fileReader = new FileReader();
		fileReader.onload = function() {
			let game_data  = new Uint8Array(this.result);
			play_game(game_data);
		};
		fileReader.readAsArrayBuffer(this.files[0]);
	}, false);

	$('#screen').addEventListener('contextmenu', function(event) {
		event.preventDefault();
	}, false);

	// Load the large files and show progress
	documentOnReady(() => {
		downloadAndLoadScript("js/SaltyNES.wasm", "application/octet-binary", function() {
			downloadAndLoadScript("js/SaltyNES.js", "text/javascript", function() {
				if (navigator.userAgent.includes('windows')) {
					Module.set_is_windows();
				}
			});
		});
	});

});

if (! ('WebAssembly' in window)) {
	document.body.innerHTML = "<h1>This browser does not support WebAssembly.</h1>";
} else {
	main();
}
