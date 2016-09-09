# FILo 2.1.0

http://www.berlinpix.com/filo - copyright &copy; 2016 Erik Wendt

> If you want to support me than test filo.js and if you found any bugs [report them here](https://github.com/berlinpix/filo/issues). Feel free to ask for new features and I will add them if I can. I'm working on that in my free time and just for fun so please be patient with me.

FILo is a lightweight jQuery plugin for embedding pictures from your [facebook page](https://www.facebook.com/pages/create.php) into your own website without necessarily writing JavaScript.

- only ~5KB minified and gzipped
- no double content maintenance, just upload your photos once
- "unlimited" space using Facebook servers
- optimized for mobile devices (size of loaded pictures)
- easy use with only HTML possible
- 100% customizable

<img src="https://raw.githubusercontent.com/BerlinPix/filo/master/screen%20shot.png?v=1" width="800" />

## Getting Started

Load all albums of your facebook page

    <!-- use HTML -->
    <div class="filo" id="YOUR-FACEBOOK-ID"></div>
    
    <!-- or JS -->
    <div id="container"></div>
    <script>
    $(function () {
      $('#container').filo({facebookId: 'YOUR-FACEBOOK-ID'});
    });
    </script>

Add a specific photo album

    <!-- use HTML -->
    <div class="filo" id="YOUR-FACEBOOK-ID">
      <div class="filo__album" data-album-name="XYZ"></div>
    </div>
    
    <!-- or JS -->
    <div id="container"></div>
    <script>
      $(function () {
          $('#container').filo({
              facebookId: 'YOUR-FACEBOOK-ID',
              albums: ['XYZ']
          });
      });
    </script>

Wrapping around the HTML5 structure, the scripts and css files:

    <!DOCTYPE HTML>
    <html>
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/path/to/filo_style.css" type="text/css" />
      </head>
      <body>
          <div class="filo" data-facebook-id="YOUR-FACEBOOK-ID">
              <div class="filo__album" data-album-name="XYZ"></div>
          </div>
          <script src="https://code.jquery.com/jquery-2.2.1.min.js" language="javascript" type="text/javascript"></script>
          <script src="/path/to/filo.js" type="text/javascript" language="javascript"></script>
        </body>
    </html>
  
## Facebook ID

To use FILo you need a public [facebook page](https://www.facebook.com/pages/create/). Those pages have ID's which you have to use identify your page in the code. If you don't know your ID, find help here: [http://findmyfbid.com/](http://findmyfbid.com/)

## Proxy Service

I've created a service called [filo-proxy](https://github.com/BerlinPix/filo-proxy). Filo.js is using this proxy instead of making the requests directly to Facebook. The reason for that [I've documented here](https://github.com/BerlinPix/filo-proxy#why).

If you don't want that you have 2 possibilities:

1. provide your own proxy using the option "proxyUrl" (you could take a copy of [filo-proxy]((https://github.com/BerlinPix/filo-proxy)))
2. you generate your own token as written in the next section (NOT recommended)

**WARNING:**
**If you put an access token into your options filo.js will not use the proxy and will do the requests to Facebook directly instead. I can not recommend that solution because than your token is visible to everybody and can easily be stolen for something you don't want to.**

## Access Token

To use the Facebook Graph API a valid [access token](https://developers.facebook.com/docs/facebook-login/access-tokens) is needed. If you want to use your own instead of the proxy you can do it [like here](https://www.rocketmarketinginc.com/blog/get-never-expiring-facebook-page-access-token/). 
  
## API

Property | Type | Default | Explanation
--- | --- | --- | ---
accessToken | String | - |  Access token for the Facebook Graph API. Use this property if you don't want to use the proxy
addAsPhotoStream | Bool | false | Add all photos as one stream
albums | Array of String\|Object | - | Load only this albums
load | Function | - | Will be called after the loading is finished
before | Function | - | Will be called before the albums will be loaded
container | String | body | Container where the albums should be added to
excluded | Array of Strings | - | Don't load this albums
hideTitle | Bool | false | Don't add title to album
href | String | - | Forward user to given url instead of showing overlay
maxCount | Number\|String | 10 | Max count of images in the albums. Can be set global or for each album. You can use any number or 'all' to get all the images from the album. 
maxPreview | Number\|String | Infinity | Max count of thumbnails. Can be set global or for each album.
maxWidth | Number | 90 | Max width of overlay image in percent
maxHeight | Number | 90 | Max height of overlay in percent
method | String | post | Method for user forwarding (post or get)
newWindow | Bool | false | Open a new tab on click by user forwarding
order | String | normal | Order in which the photos should be added (normal, reverse, random)
proxyUrl | String | https://bpx.gacrux.uberspace.de/filo-proxy/ | Use this URL to do the requests instead of requesting facebook.com. See [filo-proxy](https://github.com/BerlinPix/filo).
template | Number | 1 | Design template which should be used
thumbWidth | Number | 300 | Max width of the thumbnails. FILo tries to get the value **out of the CSS**. With this property you can overwrite the css settings.
thumbHeight | Numbr | 500 | Max height of the thumbnails. FILo tries to get the value **out of the CSS**. With this property you can overwrite the css settings.
titleTag |  String | h3 | Tag which is used for the album title

## Bugs and Feedback

If you found any bugs please [report them here](https://github.com/berlinpix/filo/issues) so that everybody can follow. Please add the browser (+ version) and the OS you have used for a better debugging.
 
Copyright &copy; 2016, [berlinpix.com](http://www.berlinpix.com)
licensed under the LGPL license.
