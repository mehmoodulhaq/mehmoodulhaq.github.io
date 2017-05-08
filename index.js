var express = require('express');
var app = express();

var path = require('path');
app.use(express.static(path.join(__dirname)));
app.get('*', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
});
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('app is running :' + port)
});