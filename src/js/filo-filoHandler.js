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

	getAllAlbumsData('facebook', id, options.accessToken, function (response) {

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
var getAllAlbumsData = function (source, id, at, cb) {
	//var url = 'https://graph.facebook.com/fql?q=' + getAllAlbumsFQL(id, options);
	var url = null;
	var access_token = typeof at !== 'undefined' ? '?access_token=' + at : '';

	switch (source) {
		case 'facebook': url = 'https://graph.facebook.com/'+id+'/albums/' + access_token; break;
		default: 'https://graph.facebook.com/'+id+'/albums/' + access_token;
	}

	$.getJSON(url, function (response) {
		cb(response);
	}).fail(function (jqxhr, textStatus, error) {
		console.log('couldn\'t load the data from ' + source + '. please check the ID and access token', textStatus , error);
	});
}