var express = require('express')
var app = express()
var port =  process.env.HOST || "3000";
var fs = require('fs');
var busboy = require('connect-busboy');

app.use(busboy());

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
})

/* TODO: Make Login submission
*/
app.post('/login', function(req, res) {
  res.send('Logged in!')
})

/* TODO: Make logout
*/

/* TODO: Make program submission
*/
app.post('/submit', function(req, res) {
    var fstream ;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
});

/* TODO: Run python program
*/
