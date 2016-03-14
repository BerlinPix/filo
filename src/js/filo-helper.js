/**
* Helper method to get the path to FIlo.
*
* return {String} The path to the FILo folder
*/
var getRootPath = function () {
	try { 
		throw new Error();
	} catch(exc) {
		var s = "";
		if (exc.fileName != undefined) {
			s = exc.fileName.split("/");
		} else {
			var scripts = document.getElementsByTagName('script');
			$.each(scripts, function (index, value) {
				if(value.src.indexOf("filo.js") >= 0 || value.src.indexOf("filo.min.js") >= 0) {
					s = value.src.split("/");
				}
			});
		}
	//default
	if (s == "") return "filo/";
	}

	var path = "";
	for (var i = 0; i < s.length - 1; i++) {
		if (i < s.length -2)
			path += s[i] + "/";
		else
			path += s[i];
	}

	return path;
}

/**
* Generates a unique ID as selector based on the original ID
*
* @param {Number} The Facebook ID
*/
var getUniqueID = function (id) {
	return id + "_" +Date.now() + "_" + Math.round(Math.random()*100000);
}

/**
* returns the escaped version of the string
*
* @param {String} The string to escape
*/
var filoEscape = function (string) {
	return string
	.replace(/\./g, "-") //points
	.replace(/ /g, '_') //blanks
	.replace(/[(){}<>]/g, "-"); // brackets
}

/**
* Adds an image to the body while loading from Facebook
*
* @param options {Object} The FILo settings
*/
var addLoaderGraphic = function (options, useImage) {

	//is already added
	if ($('.filo_loader').length > 0)
		return;

	//create new image
	if (useImage === true) {
		var img = new Image();
		img.onload = function() {	
			$(img).css("marginTop",this.height/2 * -1);
			$(img).css("marginLeft",this.width/2 * -1);
			$('body').append(img);
		};
		
		img.setAttribute("class", "filo_loader");
		if (typeof options.loaderGraphic === 'string') 
			img.src = options.loaderGraphic;
	} else {
		$('body').append('<div class="filo_loader"><div class="progress-bar blue stripes"><span style="width: 5%"></span></div></div>');	
	}
}

var removeLoaderGraphic = function () {
	$('.filo_loader').fadeOut(1000);
}

var updateLoaderGraphic = function (width) {
	if ($('.filo_loader').length > 0){
		$('.filo_loader span').css('width', width + "%");
	}
}

var inArray = function (string, array) {
	for (var i = 0; i < array.length; i++) {
		if (typeof array[i] === 'string' && array[i].toLowerCase() === string.toLowerCase())
			return true;
	}
	return false;
}

var albumInArray = function (albumName, array) {

	var result = [],
		regex = null;

	for (var i = 0; i < array.length; i++) {
		/*if (typeof array[i].name === 'string' && array[i].name.toLowerCase() === albumName.toLowerCase()) {
			array[i].index = i;
			result.push(array[i]);
		}*/

		// check for invalid regular expressions
		try {
			regex = new RegExp(array[i].name, 'i');
		} catch (error) {
			console.log(error);
			continue;
		}

		//use regex
		if (typeof array[i].name === 'string' && albumName.match(regex) !== null) {
			array[i].index = i;
			result.push(array[i]);
		}
			
	}
	return result.length === 0 ? false : result;	
}

var supportFullScreen = function () {
	return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
}

var toggleFullScreen = function (element) {
	if (!document.fullscreenElement &&    // alternative standard method
	!document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

$.filo.getUrlParameter = function (param) {
    var pageURL = window.location.search.substring(1);
    var urlVariables = pageURL.split('&');
    for (var i = 0; i < urlVariables.length; i++) 
    {
        var parameterName = urlVariables[i].split('=');
        if (parameterName[0] == param) 
        {
            return decodeURIComponent(parameterName[1]);
        }
    }
} 

Date.now = Date.now || function() { return +new Date; };