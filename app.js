var express = require('express')
var fs = require('fs');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser')
var shortid = require('shortid');

var app = express()
var port =  process.env.HOST || "3000";

var prefixDir = 'kattis-problemtools/problemtools/';
var suffixDir = '/submissions/accepted/';
var verificationScript = 'verifyproblem.py'
var results = [];

app.use(busboy());
app.use(bodyParser());

app.get('/', function (req, res) {
  res.send('Done!')
})

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
})

/* TODO: Make Login submission
*/
app.post('/login', function(req, res) {
  results = [];
  res.send('Logged in!')
})

/* TODO: Make logout
*/

/*
* Make program submission
*/
app.post('/submit', function(req, res) {
    var fstream ;
    var problemName = req.headers.problem;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        var name = shortid.generate();
        var path = prefixDir + problemName + suffixDir
        var problemDir = prefixDir + problemName;
        console.log(path);

        fstream = fs.createWriteStream(path + name + ".py");
        file.pipe(fstream);

        fstream.on('close', function () {
          run_program(path, name, problemDir, function ()
          {
            res.send(results);
          });
        });
    });


});

/*
* Run python program
*/
function run_program(path, script_name, problemName, callback) {
    var PythonShell = require('python-shell');
    var options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'],
    scriptPath: prefixDir,
    args: [problemName, '-s', script_name]
    };

    var pyshell = new PythonShell(verificationScript, options);


    pyshell.on('message', function (message) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
      results.push(message);
    });

    pyshell.end(function (err) {
      if (err) {
        //console.log(err);
        //throw err;
      }
      callback();
      console.log('finished');
    });
}

/*
* TODO: check if problem is valid
  - Has correct name
  - Has tests
  - Has folders
*/

/*
* TODO: Set config limits
*/

/*
* TODO: get inputs of problem
*/

/*
* TODO: get answer of problem
*/
