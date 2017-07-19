var express = require('express')
var fs = require('fs');
var path = require('path');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser')
var shortid = require('shortid');

var app = express()
var port =  process.env.PORT || "3389";

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
  console.log('Running on: ' + __dirname);
})

/* TODO: Make Login submission
*/
app.post('/login', function(req, res) {
  console.log("========DIR NAME:");
  // console.log(__dirname);
  // if (__dirname == '/app') {
  //   prefixDir = 'app/' + prefixDir;
  // }
  console.log('prefixDir: ' + prefixDir);
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
    //console.log(req.headers)
    var fstream ;
    var problemName = req.headers.problem;
    if(problemName == null) {
      res.send('No problem specified');
    }
    var problemDir = prefixDir + problemName;
    //console.log(problemDir);
    if(!fs.existsSync(problemDir)) {
      res.send('Can\'t find problem ' + problemName);
    }
    else {
      try {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            var name = shortid.generate();
            var path = prefixDir + problemName + suffixDir
            var problemDir = prefixDir + problemName;
            console.log(path);
            var subPath = path + name + ".py";
            fstream = fs.createWriteStream(subPath);
            file.pipe(fstream);

            fstream.on('close', function () {
              run_program(path, name, problemDir, function ()
              {
                fs.unlink(subPath, (err) => {
                  if (err) throw err;
                  console.log('successfully deleted ' + subPath);
                });
                console.log(results);
                res.send(results);
              });
            });
        });
      } catch (e) {
        console.log(e);
        res.send('Error reading file.');
      }
    }
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

    console.log("Running script...");
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
  - Has correct name: check
  - Has tests
  - Has folders: check
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
          console.log(msg);
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
* Check folder structure
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
      + '\n\nFolder Structure Status:' + status + '\n';

  var tests_msg_sam = sync_check_tests(problem_path+'/data/sample');
  var tests_msg_sec = sync_check_tests(problem_path+'/data/secret');

  msg += tests_msg_sam;
  msg += tests_msg_sec;

  return msg;
}

/*
* Tests
*/
function sync_check_tests(tests_path) {
  var dict = {};
  /* Obtain tests */
  fs.readdirSync(tests_path).forEach( file => {
    var extension = path.extname(file);
    var name = path.basename(file, extension);
    if(extension === '.in' || extension === '.ans') {
      if(dict[name] === undefined) {
        dict[name] = [];
        dict[name].push(extension);
      }
      else {
        dict[name].push(extension);
      }
    }
  });

  var msg = "\nFolder " + tests_path + " has:\n";
  /* Check tests without .in and check tests without .ans */
  for (var key in dict) {
    msg += " Test " + key + ":\n";
    if (dict.hasOwnProperty(key)) {

      if(dict[key].includes('.in')) {
        msg += "  Has .in\n";
      }
      else {
        msg += "  WARNING: Has not .in\n";
      }
      if(dict[key].includes('.ans')) {
        msg += "  Has .ans\n";
      }
      else {
        msg += "  WARNING: Has not .ans\n";
      }
    }
  }

  /* Return Info */
  return msg;
}

/*
* TODO: Upload problem.yaml, edit remotely
*/

/*
* TODO: get inputs of problem
*/

/*
* TODO: get answer of problem
*/

/* ========= Testing paths ============= */
app.post('/test', function (req, res) {
  var problemName = 'mult';
  var path_sam = prefixDir + problemName + '/data/sample';
  var path_sec = prefixDir + problemName + '/data/secret';
  sync_check_tests(path_sam);
  sync_check_tests(path_sec);
});
