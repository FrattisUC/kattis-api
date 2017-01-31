var express = require('express')
var fs = require('fs');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser')
var shortid = require('shortid');

var app = express()
var port =  process.env.HOST || "3000";

var prefixDir = '../../kattis-problemtools/problemtools/';
var suffixDir = '/submissions/accepted/';

app.use(busboy());
app.use(bodyParser());

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
    var problemName = req.headers.problem;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        /* TODO: get problem name and put submission in correct directory
         */
        var name = shortid.generate();
        console.log(prefixDir + problemName + suffixDir + name);
        fstream = fs.createWriteStream(prefixDir + problemName + suffixDir + name + ".py");
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
});

/* TODO: Run python program
*/
