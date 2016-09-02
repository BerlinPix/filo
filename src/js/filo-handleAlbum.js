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
		}
	});
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