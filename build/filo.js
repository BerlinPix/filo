/*!
 * URL: http://www.berlinpix.com/filo
 * Author: Erik Wendt
 * Version: 2.1.1
 */
;(function( $ ) {


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

		accessToken: false,

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
		maxPreview: Infinity, //max count of thumbnails
		method: 'post', //'post' || 'get' - method for user forwarding
		
		newWindow: false, //open a new window by click

		order: 'normal',//new Array('normal','reverse','random'),
		//overlay: '#333', //color of the overlay container
		//overlayOpacity: 0.75, //opacity of the overlay container

		photos_array: null,
		proxyUrl: 'https://bpx.gacrux.uberspace.de/filo-proxy/',
		
		resize: false,
		root_path: getRootPath(), //path to FILo folder

		setImageLink: false, // generate hash for images like www.my-site.com/fb-page-id/album/photo
		
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
/**
* Loads the albums from the Facebook page with the given ID.
*
* @param id {Number} Facebook ID
* @param options {Object} The settings for FILo 
*/
var filoHandler = function (id, options) {
	
	var uid = getUniqueID();
	var stream = [];
	var value = null;
	var container = options.container;

	addLoaderGraphic(options);

	//replace the ID with the unique ID
	$(container).attr('data-filo-uid', uid);

	if (options.addAsPhotoStream) {
		$(container).addClass('filo--stream')
	}

	getAllAlbumsData('facebook', id, options, function (error, response) {

		if (error) {
			console.log(error);
			removeLoaderGraphic();
			return;
		}

		//call the before eventlistener
		if(typeof options.before === 'function') {
			options.before();
		}

		if (typeof options.albums !== 'undefined' && options.albums.length > 0) {
			addSpecificAlbums(response.data, options, uid, id);
		} else {
			addAllAlbums(response.data, options, uid, id);
		}
			
	});
}

var addAllAlbums = function (data, options, uid, id) {

	$.each(data, function (i2, album) {

		var template = " filo__template-" + options.template,
		 	albumID = null,
		 	title = null,
		 	albumContainer = null;
		//if album is not excluded
		if (!inArray(album.name, options.excluded)) {
			albumID = uid + "_" + getUniqueID(filoEscape(album.name));
			title = options.hideTitle === true || options.addAsPhotoStream === true ? '' : '<'+options.titleTag+' class="filo__album__title">'+album.name+'</'+options.titleTag+'>';
			albumContainer = $('<div id="'+albumID+'" class="filo__album'+template+'">'+title+'<div class="filo__album__thumbs"></div></div>');
			//add new album
			$('[data-filo-uid="' + filoEscape(uid) + '"]').append(albumContainer);
			options.toLoad.push(album.name);
			handleAlbum(uid, id, album, albumID, albumContainer, options);	
		}
	});
}

var addSpecificAlbums = function (data, options, uid, id) {

	var found = false;
	//the filo instance
	var selector = '[data-filo-uid="' + filoEscape(uid) + '"]';
	//check if albums were add as html
	var hasAlbumsInHtml = $(selector).find('.filo__album').length > 0;
	//albums to remove, e.g. html albums with regex name
	var toRemove = [];

	$.each(data, function (i2, album) {

		var arr = albumInArray(album.name, options.albums);

		//not needed
		if (!arr) {
			//if last
			if (i2 === data.length - 1) {
				removeAlbums(toRemove);
				removeLoaderGraphic();
			}
			//continue loop
			return;
		}

		$.each(arr, function (i3, a) {

			//overwrite options by album specific options
			var albumOptions = {};
			$.extend(albumOptions, options, options.albums[a.index]);
			
			//init album container
			var template = '';

			//set template
			if (a !== false) {
				template = " filo__template-" + albumOptions.template
			} else {
				template = " filo__template-" + options.template;
			}

			var albumID = uid + "_" + getUniqueID(filoEscape(album.name));
			var titleText = typeof albumOptions.title !== 'undefined' ? albumOptions.title : album.name;
			var title = options.hideTitle === true || options.addAsPhotoStream === true ? '' : '<'+options.titleTag+' class="filo__album__title">'+titleText+'</'+options.titleTag+'>';
			var albumContainer = $('<div id="'+albumID+'" class="filo__album'+template+'">'+title+'<div class="filo__album__thumbs"></div></div>');
			var ac = null;
			
			//add new album to keep the order from HTML
			if (hasAlbumsInHtml) {
				ac = getAlbumContainer(selector, album);
				$(ac).after(albumContainer);//.remove();
				toRemove.push(ac);
			}
			//keep order from array
			else {
				//if origin index is > then current amount if albums just append
				if (a.index > $(selector).find('.filo__album').length - 1) {
					$(selector).append(albumContainer);
				//else add at specific index
				} else {
					$($(selector).find('.filo__album').get(a.index)).before(albumContainer);
				}
			}
			
			options.toLoad.push(album.name);
			handleAlbum(uid, id, album, albumID, albumContainer, albumOptions);
			found = true;

			if (i2 === data.length - 1) {
				if (!found) {
					alert("No Facebook albums found, please check the names in your list\n\nalbum: " + options.albums);
					removeLoaderGraphic();
				}
			}
		});
	});
}

/* remove unneeded albums */
var removeAlbums = function (toRemove) {
	$(toRemove).each(function () {
		if ($(this).length > 0)
			$(this).remove();
	});
}

/* Get one specific album container from DOM */
var getAlbumContainer = function (selector, album) {
	var ac = null,
		regex = null;

	$(selector).find('.filo__album').each(function (index, value) {

		try {
			regex = new RegExp($(value).attr('data-album-name'), 'i');
		} catch (error) {
			console.log(error);
			return;
		}

		if (typeof $(value).attr('data-album-name') !== 'undefined' && album.name.match(regex) !== null) {
			ac = value;
			return false;
		}
		
	});
	return ac;
}

/**
* Loads a list of all albums from the user with the given ID
*
* @param id {Number} The Facebook ID
*/
var getAllAlbumsData = function (source, id, options, cb) {
	var url = null;
	var access_token = options.accessToken ? '?access_token=' + options.accessToken : '';
	var baseUrl = options.accessToken ? 'https://graph.facebook.com/' : options.proxyUrl;

	switch (source) {
		case 'facebook': url = baseUrl + id + '/albums/' + access_token; break;
		default: baseUrl + id +'/albums/' + access_token;
	}

	$.getJSON(url, function (response) {
		cb(null, response);
	}).fail(function (jqxhr, textStatus, error) {
		cb('couldn\'t load the data from ' + source + '. please check the ID and access token');
	});
}
var handleAlbum = function (uid, id, album, albumID, albumContainer, options) {

	getAlbumData('facebook', album, options ,function (error, response) {

		if (error) {
			console.log(error);
			removeLoaderGraphic();
			return;
		}

		var photos = response.data;
		var maxCount = options.maxCount === 'all' ? photos.length : options.maxCount;

		//add photos to the album
		switch (options.order) {
			case 'reverse':
				addReverseOrder(uid, maxCount, photos, id, album, albumID, options, albumContainer);
				break;
			case 'random':
				addRandomOrder(uid, maxCount, photos, id, album, albumID, options, albumContainer);
				break;
			case 'normal':
			default:
				addNormalOrder(uid, maxCount, photos, id, album, albumID, options, albumContainer);	
				break;
		}

		//check if all albums were loaded
		options.isLoaded.push(album);
		//update progress
		var percentage = options.isLoaded.length / options.toLoad.length * 100;
		updateLoaderGraphic(percentage);
		//remove album if it's a photo stream
		if (options.addAsPhotoStream) {
			$('#' + albumID).remove();
		}

		if (options.isLoaded.length >= options.toLoad.length) {
			removeLoaderGraphic();
			$('.filo .excluded').remove();
			//call the load eventlistener
			options.load();
			if (options.setImageLink) {
				openImageFromHash(options.facebookId, album.name);
			}
		}
	});
}

var openImageFromHash = function (facebookId, album) {

	var hash, hashFbId, hashAlbum, hashIndex;

	if (window.location.hash.indexOf('/filo/') < 0) {
		return;
	}

	hash = window.location.hash.split('/');
	hashFbId = hash[2];
	hashAlbum = hash[3];
	hashIndex = parseInt(hash[4]) - 1;

	if (hashFbId === facebookId && hashAlbum === album) {
		if ($('[data-hash="' + facebookId + '-' + album + '-' + hashIndex + '"]').length > 0) {
			$('[data-hash="' + facebookId + '-' + album + '-' + hashIndex + '"]').trigger('filo-click');
		}
	}
}

var addNormalOrder = function (uid, maxCount, photos, id, album, albumID, options, albumContainer) {
	var reducedPhotos = [];
	//reduce photos in relation to maxCount
	for (var i = 0; i < Math.min(maxCount, photos.length); i++) {
		reducedPhotos.push(photos[i]);
	}
	//handle photos
	for (i = 0; i < reducedPhotos.length; i++) {
		handlePhoto(id, album, albumID, reducedPhotos[i], reducedPhotos, options, i, uid);
	}
}

var addRandomOrder = function (uid, maxCount, photos, id, album, albumID, options, albumContainer) {
	var r = [];
	var keys = [];
	//build new random array
	while (r.length < maxCount && r.length < photos.length) {
		var randomNumber = Math.floor((Math.random()*photos.length));
		if (keys[randomNumber] === undefined) {
			r.push(photos[randomNumber]);
			keys[randomNumber] = true;
		}
	}
	//add photos from new array
	for (var i = 0; i < r.length; i++) {
		handlePhoto(id, album, albumID, r[i], r, options, i);
	}
}

var addReverseOrder = function (uid, maxCount, photos, id, album, albumID, options, albumContainer) {
	var reducedPhotos = [];
	for (var i = Math.min(maxCount, photos.length) - 1; i >= 0 ; i--) {
		reducedPhotos.push(photos[i]);
	}
	for (var i = 0; i < reducedPhotos.length; i++) {
		handlePhoto(id, album, albumID, reducedPhotos[i], reducedPhotos, options, i);
	}
}

var getAlbumData = function (source, album, options , cb) {
	var url = null;
	var maxCount = getMaxCount(options);
	var getString = '';
	var count = 0;
	var imagePerRequest = 100;
	var load;
	var baseUrl = options.accessToken ? 'https://graph.facebook.com/' : options.proxyUrl;
	var params = {
		access_token: options.accessToken ? options.accessToken : '',
		fields: ['images'],
		limit: maxCount
	};

	// build GET string out of params
	$.each(Object.keys(params), function (index, key) {
		getString += (index === 0 ? '?' : '&') + key + '=' + params[key]
	});

	// @todo: add more source like instagram
	switch (source) {
		case 'facebook': url = baseUrl + album.id + '/photos' + getString; break;
		default: url = baseUrl + album.id + '/photos' + getString;
	}

	// only 100 images are allowd per request. each responsve 
	// has a "next" link so we use recursive loading to get all images
	load = function (url, cb) {
		$.getJSON(url, function (response) {
			if (maxCount > imagePerRequest  && response.paging && response.paging.next) {
				load(response.paging.next, function (recursiveResponse) {
					response.data = response.data.concat(recursiveResponse.data);
					cb(null, response);
				});
			}
			else {
				cb(null, response);
			}
		}).fail(function () {
			cb('couldn\'t load the data of the album: "' + album.name + '". please check the facebook ID and access token');
		});
	}

	load(url, cb);
}

var getMaxCount = function (options) {
	var maxCount = 25; // default

	// check how many photos should be loaded
	if (typeof options.maxCount === 'number') {
		maxCount = options.maxCount;
	}
	// load all photos 
	else if (options.maxCount === 'all') {
		maxCount = 1000; // 
	} 
	else if (parseInt(options.maxCount) > 0) {
		maxCount = parseInt(options.maxCount);
	}

	return maxCount;
}
var handlePhoto = function (facebookID, album, albumID, photo, photos, options, index, uid) {

	var maxWidth = null;
	var maxHeight = null;
	var src_big = getBigPictureFromSize(photo);
	var cssClass = 'filo__album__thumbs__thumb';
	var a = $('<a class="'+cssClass+'" data-child="'+index+'" href="'+src_big+'"></a>');
	var picture = null;
	var maxPreview = typeof options.maxPreview !== 'undefined' && !isNaN(parseInt(options.maxPreview)) ? parseInt(options.maxPreview) : Infinity;

	// set hash value open this image later on
	$(a).attr('data-hash', facebookID + '-' + album.name + '-' + index);

	$(a).on('click filo-click', function (evt) {

		evt.preventDefault();

		if (typeof options.href === 'string' && options.href.length > 0) {
			forwardUser(facebookID, album.name, options);
		} else {
			showOverlay(
				a,		
				album,		
				$.inArray(photo,photos), 
				photos, 
				$(this).attr('href'), 
				options
			);
		}

		if (evt.type === 'click' && options.setImageLink) {
			setUrlHash(facebookID, album.name, index);
		}
	});

	//if it shouldn't add as stream
	if (!options.addAsPhotoStream) {
		$('#' + filoEscape(albumID)).find('.filo__album__thumbs').append(a);
	} else {
		//append after album to keep defined album order
		$('#' + filoEscape(albumID)).after(a);
	}

	//if set in options
	if (typeof options.thumbWidth !== 'undefined' && typeof options.thumbHeight !== 'undefined') {
		maxWidth = options.thumbWidth;
		maxHeight = options.thumbHeight;
	//if set in CSS and in pixel
	} else if ($(a).css('maxWidth') !== 'none' && $(a).css('maxWidth').indexOf('px') > -1 ) {
		maxWidth = $(a).css('maxWidth');
		maxHeight = $(a).css('maxWidth');
	} else {
		maxWidth = '300';
		maxHeight = '300';
	}

	picture = getPictureFromSize(maxWidth, maxHeight, photo); 

	//add some modifiers for different thumb sizes
	if (picture.width / picture.height < 4/3 && picture.width / picture.height > 3/4) {
		$(a).addClass(cssClass + '--quadratic');
	} else if(picture.width > picture.height) {
		$(a).addClass(cssClass + '--horizontal');
	} else {
		$(a).addClass(cssClass + '--vertical');
	}

	if (index < maxPreview) {
		$(a).append('<i style="background-image:url('+picture.source+');" ></i>');
	}
}

/**
will detect the image wich is bigger than 'width' but the smallest in the collection
*/
var getPictureFromSize = function (width, height, photo) {

	var w = width;
	var h = height;
	var result = null;

	//is in pixel
	if (typeof w === 'string' && w.indexOf('px') !== -1) {
		w = w.split('px')[0];
	}
	if (typeof h === 'string' && w.indexOf('px') !== -1) {
		h = h.split('px')[0];
	}

	for (var i = photo.images.length - 1; i >= 0; i--) {
		if (parseInt(photo.images[i].width) >= parseInt(w) && result === null ||
			parseInt(photo.images[i].width) >= parseInt(w) && parseInt(photo.images[i].width) < parseInt(result.width)) {
			result = photo.images[i];
		}		
	}

	return result === null ? {} : result;
}

/* TO DO: optimize for mobile */
var getBigPictureFromSize = function (photo) {
	var big = photo.images[0];
	//get biggest picture needed for the screen size
	/*for (var i = 1; i < photo.images.length; i++) {
		if ($(window).width() < big.width || $(window).height() < big.height) {
			big = photo.images[i];
		} else {
			return big.source;
		}
	}*/
	return big.source;
}

var forwardUser = function (facebookID, albumName, options) {
	if (options.method !== undefined && options.method.toLowerCase() === 'post') {
		//open in a new window?
		var newWindow = options.newWindow === true ? 'target="_blank"' : '';
		$('body').append('<form id="filo_forward" '+newWindow+' method="POST" action="'+options.href+'"><input name="profile" value="'+facebookID+'" /><input name="album" value="'+albumName+'" /></form>');
		$("#filo_forward").trigger("submit").remove();
		return false;
	} else {
		//open new window?
		if (!options.newWindow) {
			document.location = options.href + '?profile=' + facebookID + '&album=' + albumName;
			return false;
		} else {						
			window.open(options.href + '?profile=' + facebookID + '&album=' + albumName);
			return false;
		}
	}
}

var showOverlay = function (thumb, album, index, photos, path, options) {

	var index = index,
		fullscreen = '';

	//show loader graphic
	addLoaderGraphic(options);

	if (supportFullScreen()) {
		fullscreen = '<div class="filo__overlay__container__full" title="full screen"></div>';
	}

	//append empty container
	$('body').append('<div class="filo__overlay">'+
		'<div class="filo__overlay__background" style="background: '+options.overlay+'; opacity: '+options.overlayOpacity+';"></div>' +
		'<div class="filo__overlay__container">'+
			'<div class="filo__overlay__container__left"><span class="arrow-left"></span></div>' +
			'<div class="filo__overlay__container__right"><span class="arrow-right"></span></div>' +
			'<div class="filo__overlay__container__meta">'+
				'<div class="filo__overlay__container__meta__album" >'+album.name+'</div>' +
				'<div class="filo__overlay__container__meta__count" >'+(index+1)+' / '+photos.length+'</div>' +
			'</div>' + 
			fullscreen +
		'</div>' +
	'</div>');

	//add new image
	var img = new Image();
	img.onload = function () {

		//remove loader graphic
		removeLoaderGraphic();

		//append image to container
		$('.filo__overlay__container').append(img);

		//set size and resize to fit the screen
		this.setAttribute("width", this.width);
		this.setAttribute("height", this.height);
		resizeImage(options);

		//preparePrevImage(thumb);
		//prepareNextImage(thumb);

		//show image after resize
		$('.filo__overlay__container').fadeIn('slow');
	}
	img.setAttribute("class", "filo_full_picture");
	img.src = path;

	//remove over on click on the background
	$('.filo__overlay').click(function (evt) {
		if ($(evt.target).attr('class') === 'filo__overlay__background') {
			$('.filo__overlay').fadeOut(500, function () {
				$('.filo__overlay').remove();
			});
		}
	});

	//listen to window resize events
	$(window).unbind('resize');
	$(window).resize(function (evt) {
		resizeImage(options);
	});
	
	//left arrow
	$('.filo__overlay__container__left').click(function () {
		index = prevImage(index, photos, options);
		setUrlHash(options.facebookId, album.name, index);
	});
	//right arrow	
	$('.filo__overlay__container__right').click(function () {		
		index = nextImage(index, photos, options);
		setUrlHash(options.facebookId, album.name, index);
	});

	$(document).unbind('keyup');
	$(document).bind('keyup',function (evt) {
		switch (evt.keyCode) {
			//left -> prev image
			case 37: 
				index = prevImage(index, photos, options);
				setUrlHash(options.facebookId, album.name, index);
				break;
			//right -> next image
			case 39:
				index = nextImage(index, photos, options);
				setUrlHash(options.facebookId, album.name, index);
				break;
		}
	});

	//full screen 
	$('.filo__overlay__container__full').click(function (evt) {
		
		var element = $('.filo__overlay')[0];
		
		toggleFullScreen(element);

		resizeImage();
		
		$('.filo__overlay').toggleClass('is-full-screen');
	});
}

var preload = function (index, photos) {
	if (index === 0) {
		var i1 = new Image();
		i1.src = photos[index+1];
	} else  if (index === photos.length-1) {
		var i1 = new Image();
		i1.src = photos[index-1];
	} else {
		var i1 = new Image();
		i1.src = photos[index-1];
		var i2 = new Image();
		i2.src = photos[index+1];
	}
}

var preparePrevImage = function (thumb) {
	//var thumbs = $(thumb).closest('.filo__album__thumbs');
	//var index = thumbs.find('.filo__album__thumbs__thumb').index(thumb);
	//var prev = thumbs.find('.filo__album__thumbs__thumb').get(index - 1);
	//$('.filo__overlay__container').prepend('<img src="'+$(prev).attr('href')+'" class="filo__overlay__prevImage" />')
}

/*var prepareNextImage = function (thumb) {
	var thumbs = $(thumb).closest('.filo__album__thumbs');
	var index = thumbs.find('.filo__album__thumbs__thumb').index(thumb);
	var next = thumbs.find('.filo__album__thumbs__thumb').get(index + 1);
	$('.filo__overlay__container').append('<img src="'+$(next).attr('href')+'" class="filo__overlay__nextImage" />')
}*/

/* TO DO: animation: slide etc. */
var prevImage = function (index, photos, options) {
	if (index > 0) {
		index -= 1;
		addLoaderGraphic(options);
		var src_big = getBigPictureFromSize(photos[index])
		$('.filo_full_picture').attr('src', src_big);
		$('.filo__overlay__container__meta__count').text((index+1)+' / '+photos.length);
		resizeImage(options);
		if (options.setImageLink) {
			setUrlHash(null, null, index);
		}
		return index;
	} else {
		shakeOverlay();
		return index;
	}
}
var nextImage = function (index, photos, options) {
	if (index < photos.length - 1) {
		index += 1;
		addLoaderGraphic(options);
		var src_big = getBigPictureFromSize(photos[index])
		$('.filo_full_picture').attr('src', src_big);
		$('.filo__overlay__container__meta__count').text((index+1)+' / '+photos.length);
		resizeImage(options);
		if (options.setImageLink) {
			setUrlHash(null, null, index);
		}
		return index;
	} else {
		shakeOverlay();
		return index;
	}
}

var shakeOverlay = function () {
	$('.filo__overlay__container')
		.animate({
			left: '49%'
		}, 100)
		.animate({
			left: '51%'
		}, 100)
		.animate({
			left: '50%'
		}, 100);
}

var resizeImage = function (options) {

	if ($(".filo__overlay").length > 0 ) {//&& !$.filo.resize) {
		
		resize = true;
		var maxWidth = (options.maxWidth ? options.maxWidth : $.filo.maxWidth) / 100;
		var maxHeight = (options.maxHeight ? options.maxHeight : $.filo.maxHeight) / 100;
		var border_width = parseInt($(".filo__overlay__container").css("border-top-width").split("px")[0]);
		var counter_height = 0;//parseInt($(".picture_counter").height());
		var doc_width = $(window).width() * maxWidth - border_width;
		var doc_height = $(window).height() * maxHeight - (border_width + counter_height);
		var old_width = parseInt($(".filo_full_picture")[0].naturalWidth);
		var old_height = parseInt($(".filo_full_picture")[0].naturalHeight);

		//scale depending on width and height
		var new_width;
		var new_height;
		if (old_width > old_height) {
			new_width = old_width > doc_width ? doc_width : old_width;
			new_height = new_width * old_height / old_width;
			//check new height
			if (new_height > doc_height) {
				new_height = old_height > doc_height ? doc_height : old_height;
				new_width = new_height * old_width / old_height;	
			}
		} else {
			new_height = old_height > doc_height ? doc_height : old_height;
			new_width = new_height * old_width / old_height;
			//check new width
			if (new_width > doc_width) {
				new_width = old_width > doc_width ? doc_width : old_width;
				new_height = new_width * old_height / old_width;
			}
		}		
		
		//set the new height and width to the overlay container 
		//image will fit by css 100% width and 100% height
		$(".filo__overlay__container")
			.width(new_width)
			.height(new_height)
			.css("margin-left",new_width / 2 * - 1)
			.css("margin-top",new_height / 2 * - 1 - counter_height)
			.find('.filo_full_picture')
				.width(new_width)
				.height(new_height);
			
		resize = false;
	}
}

var setUrlHash = function (pageId, album, index) {

	var hash = window.location.hash;
	var image = index + 1;

	if (hash.indexOf('/filo/')) {
		hash = hash.split('/');
	}

	// if page ID isn't defined use URL part
	if (!pageId) {
		pageId = hash[2];
	}

	// if albui´ isn't defined use URL part
	if (!album) {
		album = hash[3];
	}

	// remember that the has was set from script for the onhashchange handler
	$('html').attr('data-add-hash', true);

	window.location.hash = '/filo/' + pageId + '/' + album + '/' + image;
}
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
* Generates a unique ID as selector 
*/
var getUniqueID = function () {
	return Date.now() + "_" + Math.round(Math.random()*100000);
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

})( jQuery );