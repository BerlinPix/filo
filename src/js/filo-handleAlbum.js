var handleAlbum = function (uid, id, album, albumID, albumContainer, options) {

	getAlbumData('facebook',album, options.accessToken ,function (response) {

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

var getAlbumData = function (source, album, at , cb) {
	//var url = 'https://graph.facebook.com/fql?q=' + getAlbumFQL(album, options);
	var url = null;
	var access_token = typeof at !== 'undefined' ? '?access_token=' + at : '';
	var fields = '&fields=images';

	switch (source) {
		case 'facebook': url = 'https://graph.facebook.com/' + album.id + '/photos' + access_token + fields; break;
		default: url = 'https://graph.facebook.com/' + album.id + '/photos' + access_token;
	}

	$.getJSON(url, function (response) {
		cb(response);
	}).fail(function () {
		console.log('couldn\'t load the data of the album: "' + album.name + '". please check the facebook ID and access token');
	});
}