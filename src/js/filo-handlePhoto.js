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
	} else {
		// use hidden instead of display:none because of event handlers
		$(a).css({
			visibility: 'hidden',
			position: 'absolute'
		});
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
				if (options.setImageLink) {
					setUrlHash(options.facebookId, album.name, index);
				}
				break;
			//right -> next image
			case 39:
				index = nextImage(index, photos, options);
				if (options.setImageLink) {
					setUrlHash(options.facebookId, album.name, index);
				}
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