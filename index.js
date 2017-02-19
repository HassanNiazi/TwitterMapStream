var app = require('express')();
var http = require('http').Server(app);
var creds = require('./creds');
var io = require('socket.io')(http);
var path   = require("path");
var Twit = require('twit')
var stream;
var coordinates = ['-180', '-90', '180', '90'];

//Google Maps
const gmaps = require('@google/maps').createClient({
    key: creds.gmapsKey
});

//Twitter
var T = new Twit({
    // Accesss Keys
    consumer_key: creds.consumer_key,
    consumer_secret: creds.consumer_secret,
    access_token: creds.access_token,
    access_token_secret: creds.access_token_secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

var server = http.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});


io.on('connection', function(socket) {
    console.log('a user has connected on scoket ' + socket);

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('newCoords', function(newCoords) {
        var coords = [
            newCoords.southWest.lng,
            newCoords.southWest.lat,
            newCoords.northEast.lng,
            newCoords.northEast.lat

        ];
        if (stream) {
            console.log('stopStream');

            stream.stop();
        }
        initStream(coords);

    });
});

function initStream(coords) {
    console.log('initStream');
    console.log(coords);
    stream = T.stream('statuses/filter', {
        locations: coords
    });

    stream.on('tweet', function(tweet) {
        if (tweet.coordinates) {
            // console.log(tweet.coordinates);
            io.emit('newTweet', tweet);
        }
    });
}
app.get('/', function(req, res) {
    console.log('Client connected');
    //  initStream(coordinates);
    res.sendFile(path.join(__dirname + '/index.html'));
});;
