
/**
* This function is one possibility to use FIlo like $('#myid').filo(options) or $('.myContainers').filo(options). Make sure that every container has an vaild Facebook ID. 
*
* @param: {Object} filo_options - contains the options for FIlo
*/
$.fn.filo = function (filo_options) {

	//check the user options
	if (typeof filo_options === 'undefined') {
		filo_options = {};
	}
	
	//check for errors in the selector like unescaped characters
	if (this.length === 0) {
		console.log('no container can be selected with the selector "'+this.selector+'". please check the jQuery selector for special characters like "." and escape them with "\\\\."');
		console.log('http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/');
		if (typeof filo_options.logging !== undefined && filo_options.logging === true) 
			alert('no container can be selected with the selector "'+this.selector+'". please check the jQuery selector for special characters like "." and escape them with "\\\\."');
	//if everything is fine start FILo for each selected element
	} else {
		return this.each(function(index, value) {
			var id = $(this).attr('data-facebook-id');
			var albums = $(this).find('.filo__album');
			var htmlData = $(this).data();
			var options = $.extend({container:  value, facebookId: id}, filo_options, htmlData);

			// add main class to container
			$(this).addClass('filo');

			//check for albums to add
			if (albums.length > 0) {
				options.albums = [];
				$.each(albums, function (index, value) {
					if ($(value).data('albumName') !== undefined && $(value).data('albumName').length > 0) {
						
						var album = $.extend({'name':$(value).data('albumName')}, $(value).data());
						options.albums.push(album);
					}
				});
			}

			//check for excluded
			if ($(this).data('excluded'))
				options.excluded = $(this).data('excluded').split(',').map(function (string) {
					return string.trim();
				});

			$.filo(options);
		});
	}
};

/**
* This will support the HTML-version of FIlo
*/
$(function () {
	var f = $('.filo');
	if (f.length > 0) {
		$(f).filo();
	}
});

/**
* This function is one possibility to use FIlo like $.filo('myid', options) or $.filo(['firstID', 'secondID'], options). Make sure that the IDs are valid. If no option for a container is set the FILo elements will be added to the body.
*
* @param: {Object} filo_options - contains the options for FIlo
*/
$.filo = function (filo_options) {

	//check the user options
	if (typeof filo_options === 'undefined') {
		filo_options = {};
	}

	//enable cross-origin resource sharing
	$.support.cors = true;

	//default options
	var options = $.extend({

		accessToken: 'CAAaADXqheBgBAIMvHYLu35uppUZB1oKiYrNnVIvqTDGDF5kYLKKeIB5bIA2qAN0ouGESzma6sZBwZAzOC3KREyqclge0bQXGmzRyjwVgnszgj0wZBQWPKNBUoLorJ2bm0ZCmaMGZBiZCQ3JamhOm3zgkMOSrB0wDs9uWcoMtTjGBJlVfPfJWD3l',

		addAsPhotoStream: false,

		albums: [],

		load: function () {}, //will be called after the loading is finished

		before: function () {}, //will be called before the albums will be loaded
		
		//closeButtons: {'black':'/img/close_black.png', 'white':'/img/close_white.png'}, //button on top right corner
		closeButton: '/img/close_black.png', //button on top right corner
		
		container: 'body', //container where the albums should be added
		
		defaultImage: '/img/default.png', //default image of no picture was found
		
		excluded: [],
		//excluded: ['profile pictures', 'cover photos', 'timeline photos', 'untitled album'], //exclude this albums

		hideTitle: false,
		href: '',
		
		//loaderGraphic: '../img/bpx_loader.gif', //image while loading
		
		//ie: false, //is IE
		isLoaded: new Array(), //remeber loaded albums
		
		logging: false, //log errors to console if true
		
		maxCount: 10, //max count of images in album
		maxWidth: 90, //max width of overlay in percent
		maxHeight: 90,//max height of overlay in percent
		maxPreview: Number.MAX_VALUE, //max count of thumbnails
		method: 'post', //'post' || 'get' - method for user forwarding
		
		newWindow: false, //open a new window by click

		order: 'normal',//new Array('normal','reverse','random'),
		//overlay: '#333', //color of the overlay container
		//overlayOpacity: 0.75, //opacity of the overlay container

		photos_array: null,
		
		resize: false,
		root_path: getRootPath(), //path to FILo folder
		
		template: 1, //design template
		//thumbWidth: '500',
		//thumbHeight: '500',
		titleTag: 'h3',
		toLoad:  new Array() //albums to load	
		
	}, filo_options);

	//convert an album name to an album object
	for (var i = 0; i < options.albums.length; i++) {
		if (typeof options.albums[i] === 'string') {
			options.albums[i] = {'name' : options.albums[i]};
		}
	}

	//check the Facebook ID(s)
	if (typeof filo_options.facebookId === 'string') {		
		filoHandler(filo_options.facebookId, options); //start FILo handler
	} else if ($.isArray(filo_options.facebookId) && filo_options.facebookId.length > 0) {
		//for each Facebook ID in array
		for (var i = 0; i < filo_options.facebookId.length; i++) {
			filoHandler(filo_options.facebookId[i], options); //start FILo handler
		}
	} else {
		if (options.logging) {
			console.log('please check the Facebook ID(s), must be a single string or an array of IDs');
		}	
	}	
};