var express = require('express');
var app = express();
var serveIndex = require('serve-index');

var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, 'examples/6-api-href-post.html');
var bodyParser = require('body-parser'); 
var compress = require('compression');

app.use(compress());

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// example: filo API method: "post"
app.post('/examples/6-api-href-post.html', function (req, res) {

    //get album name fron POST
    var album = req.body.album;

    console.log(filePath);

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){

        //replace empty string by album name
        if (typeof album !== 'undefined' && album.length > 0)
            data = data.replace('album = \'\'', 'album = \''+album+'\'');
        if (!err){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        } else{
            console.log(err);
        }
    });
});

app.use(express.static(__dirname ));
app.use('/', serveIndex('./', {'icons': true}));
app.listen(process.env.PORT || 3000, function () {
    console.log('server started at ' + process.env.PORT || 3000);
});