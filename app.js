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

/* ========= Error Handling ============= */

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

/* ========= Submissions ============= */

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

/* ========= Validate Problem ============= */

app.post('/validate', function(req, res) {
  var problemName = req.headers.problem;

  is_program_valid(problemName, function (msg) {
    res.send('response: ' + msg);
  });
});

/*
* TODO: check if problem is valid
  - Has correct name
  - Has tests
  - Has folders
*/
function is_program_valid(problemName, callback) {

  /* Check if problem exists */
  fs.readdir(prefixDir, function (err, files) {
    if (!err) {
       var path = prefixDir + problemName;
       var msg;
       console.log(path);
       try {
        if (fs.existsSync(path)) {
          msg = 'Problem exists';
          // Check folder structure
          msg += '\n'+ sync_check_folder_structure(path);
          console.log('33 ' + msg);
          //
        }
        else {
          msg = 'No problem name provided';
        }
      }
      catch (err) {
        //console.log(problemName);
        msg = 'Problem doesnt exist';
      }
    }
    else {
      msg = 'An error ocurred';
    }
    callback(msg);
  })
}

/*
* TODO: check folder structure
*/
function sync_check_folder_structure(problem_path) {
  data_stat = fs.existsSync(problem_path+'/data');
  ifv_stat = fs.existsSync(problem_path+'/input_format_validators');
  ov_stat = fs.existsSync(problem_path+'/output_validators');
  ps_stat = fs.existsSync(problem_path+'/problem_statement');
  subs_stat = fs.existsSync(problem_path+'/submissions');

  sample_data_stat = fs.existsSync(problem_path+'/data/sample');
  secret_data_stat = fs.existsSync(problem_path+'/data/secret');

  acc_subs_stat = fs.existsSync(problem_path+'/submissions');

  status = 'OK!';
  // try {
  //   var1 = data_stat == null;
  //   console.log(var1);
  // } catch (e) {
  //   console.log('error:'+e);
  // } finally {
  //
  // }

  if(data_stat == null || ifv_stat == null || ov_stat == null || ps_stat == null || subs_stat == null) {
    status = 'Main folders missing.'
  }

  if(sample_data_stat == null || secret_data_stat == null) {
    status = 'Data subfolders missing.'
  }

  msg = 'Folder structure:'
      + '\nData: ' + (data_stat) + '\n\tSample: ' + (sample_data_stat) + '\n\tSecret: ' + (secret_data_stat)
      + '\nInputFormatValidator: ' + (ifv_stat)
      + '\nOutputValidator: ' + (ov_stat)
      + '\nProblemStatement: ' + (ps_stat)
      + '\nSubmissions: ' + (subs_stat) + '\n\tAccepted: ' + (acc_subs_stat)
      + '\n\nFolder Structure Status:' + status;
  return msg;
}

/*
* TODO: tests
*/

/*
* TODO: Upload problem.yaml
*/

/*
* TODO: get inputs of problem
*/

/*
* TODO: get answer of problem
*/
