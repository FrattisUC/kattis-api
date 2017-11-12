var express = require('express')
var fs = require('fs');
var path = require('path');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser')
var shortid = require('shortid');
var http = require('http');
var querystring = require('querystring');

var app = express();
var port =  process.env.PORT || '3389';

var prefixDir = 'kattis-problemtools/problemtools/';
var suffixDir = '/submissions/accepted/';
var verificationScript = 'verifyproblem.py'

var resultsPath = 'Results/out_';

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
  console.log('========DIR NAME:');
  console.log('prefixDir: ' + prefixDir);
  console.log('========SENDER:');
  console.log(req.connection.remoteAddress);

  http_request('3000', '1', 'webapi', 'SJnr1hrF-');

  res.send('Logged in!');
})

/* ========= Error Handling ============= */

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

/* ========= Submissions ============= */

/* Make program submission
*/
app.post('/submit', function(req, res) {
    // console.log(req.headers)
    // console.log(req.connection.remoteAddress)
    // console.log(req.socket.remotePort);

    var fstream ;
    var problemName = req.headers.problem;
    var subID = req.headers.subid;
    // var req_port = req.socket.remotePort;
    // var address = req.connection.remoteAddress;

    var req_port = 3000;
    var address = 'webapi';

    if(problemName == null) {
      res.send('No problem specified');
    }

    var problemDir = prefixDir + problemName;
    if(!fs.existsSync(problemDir)) {
      res.send('Can\'t find problem ' + problemName);
    }
    else {
      try {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log('Uploading: ' + filename);
            res.send('Evaluating...');

            var name = shortid.generate();
            var path = prefixDir + problemName + suffixDir
            var problemDir = prefixDir + problemName;
            console.log(path);
            var subPath = path + name + '.py';
            console.log('subPath:' + subPath);
            fstream = fs.createWriteStream(subPath);
            file.pipe(fstream);

            fstream.on('close', function () {
              run_program(path, name, problemDir, function ()
              {
                http_request(req_port, subID, address, name);
                // fs.readFile(resultsPath + name, 'utf8', function (err,data) {
                //   if (err) {
                //     return console.log('READ ERROR:' + err);
                //   }
                //
                //
                // });
                //
                // console.log('bloop');
                // fs.unlink(subPath, (err) => {
                //   if (err) throw err;
                //   console.log('successfully deleted ' + subPath);
                // });
                // //HTTP request to Ruby
                //
                // var resultSubPath = resultsPath + name;
                // fs.unlink(resultSubPath, (err) => {
                //   if (err) throw err;
                //   console.log('successfully deleted ' + resultSubPath);
                // });
              });
            });
            console.log('bleep');
        });
      } catch (e) {
        console.log(e);
        res.send('Error reading file.');
      }
    }
});


/* Make HTTP request to Ruby
*/
function http_request(port, subID, address, problemName) {

  /* https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener */
  let testFolder = './Results'

  fs.watch('./Results', (eventType, filename) => {
    console.log(`event type is: ${eventType}`);

    if(eventType=='change' && filename) {

      console.log('Reading ' + filename);

      fs.readFile('./Results/'+filename, 'utf8', function (err,data) {
        if (err) {
          return console.log('READ ERROR:' + err);
        }
        else {
          console.log('FILE:\n\r'+data);

          /* Send request */
          var request = require('request');
          request.post({
            headers: {'content-type' : 'application/json', 'Authorization': 'OQTIeuSRv4mWHNwUCmWgiQ' },
            url:     'http://webapi:3000/api/v1/online_judge_submissions/'+subID+'/node_result',
            form:    {'result': data, 'status': 'Done'}
          }, function(error, response, body){
            console.log(body);
          });


        }
      });

    }
  });

  // var path = '/api/v1/online_judge_submissions/' + subID
  //
  // Read result file
  // var results;
  // fs.readFile(resultsPath + problemName, 'utf8', function (err,data) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   results = data.split('\n');
  //   console.log(data);
  // var options = {
  //     host: 'http://web:3000/api/v1/online_judge_submissions/',
  //     path: path,
  //     port: port,
  //     method: 'PATCH',
  //     json:true,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': '1'
  //     },
  //     body: {
  //       "online_judge_submission":{
  //     		"result": 'pochoco',
  //     		"status": "Done"
  //     	}
  //     }
  //   };
  //
  // console.log(options);
  //
  // function callback(error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     var info = JSON.parse(body);
  //   }
  // }
  //
  // console.log('Sending request');
  // request(options, callback).on('response', function(response) {
  //   console.log('Fisrt attempt response:')
  //   console.log(response.statusCode);
  //   console.log(response);
  // });
  // request
  // .get('http://172.20.0.3')
  // .on('response', function(response) {
  //   console.log(response.statusCode) // 200
  //   console.log(response) // 'image/png'
  // })
  //
  // request
  // .get('http://web:3000/api/v1')
  // .on('response', function(response) {
  //   console.log(response.statusCode) // 200
  //   console.log(response) // 'image/png'
  // })
  //
  // request
  // .patch('http://web:3000/api/v1/online_judge_submissions/'+subID)
  // .on('response', function(response) {
  //   console.log(response.statusCode) // 200
  //   //console.log(response.) // 'image/png'
  // })
  //
  // request({
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': '1'
  //   },
  //   body: {
  //     "online_judge_submission":{
  //       "result": 'pochoco',
  //       "status": "Done"
  //     }
  //   },
  //   uri: 'http://web:3000/api/v1/online_judge_submissions/' + subID,
  //   method: 'PATCH'
  // }, function (err, res, body) {
  //   if (err) {
  //     return console.log(err);
  //   };
  //   console.log('BODY:' + body);
  // });
  //
  // const postData = querystring.stringify({
  //   'online_judge_submission':{
  //     'result': 'pochoco',
  //     'status': 'Done'
  //   }
  // });
  //
  // // An object of options to indicate where to post to
  // const post_options = {
  //     host: 'web',
  //     port: '3000',
  //     path: '/api/v1/online_judge_submissions/' + subID,
  //     method: 'PATCH',
  //     headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': '1'
  //     }
  // };
  //
  // Set up the request
  // var post_req = http.request(post_options, function(res) {
  //     res.on('data', function (chunk) {
  //         console.log('Response: ' + chunk);
  //     });
  // });
  //
  // const post_req = http.request(post_options);
  //
  // post_req.write(postData);
  //
  // post_req.end();
  //
  // var options = {
  //     host: 'web',
  //     port: 3000,
  //     path: '/api/v1/online_judge_submissions/' + subID,
  //     method: 'POST',
  //     headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": "1"
  //     },
  //     body: {
  //       "online_judge_submission":{
  //         "result": "pochoco",
  //         "status": "Done"
  //       }
  //     }
  // };
  //
  // var req = https.request(options, function(res) {
  //     console.log("statusCode: ", res.statusCode);
  //     console.log("headers: ", res);
  //
  //     res.on('data', function(d) {
  //         process.stdout.write(d);
  //     });
  // });
  //
  // req.end();
  //
  // var https = require('https');
  // var querystring = require('querystring');
  // const options = {
  //     port: 3000,
  //     hostname: 'web',
  //     path: '/api/v1/online_judge_submissions/'+ subID +'/node_result',
  //     method: 'POST',
  //     headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": "1",
  //     },
  // };
  //
  // const req = http.request(options);
  // const postData = querystring.stringify({
  //   'status' : '3', 'result': 'boo'
  // });
  //
  // console.log('Post Data:' + postData);
  //
  // req.write(postData);
  // console.log(req);
  // req.end();
}

/* Run python program
*/
function run_program(path, script_name, problemName, callback) {
    // var PythonShell = require('python-shell');
    // var options = {
    // mode: 'text',
    // pythonPath: 'python',
    // pythonOptions: ['-u'],
    // scriptPath: prefixDir,
    // args: [problemName, '-s', script_name]
    // };
    //
    // console.log('Running script yay...');
    //
    // var pyshell = new PythonShell(verificationScript, options);
    // console.log(pyshell);
    // pyshell.on('message', function (message) {
    //   // received a message sent from the Python script (a simple 'print' statement)
    //   console.log('mem ' + message);
    //   results.push(message);
    // });
    //
    //pyshell.end(function (err) {
    //   if (err) {
    //     //console.log(err);
    //     //throw err;
    //   }
    //   callback();
    //   console.log('finished');
    // });
    console.log(path)
    if (!fs.existsSync(path+'/submissions');) {
      fs.mkdirSync(path+'/submissions');
    }

    const cp = require('child_process');
    console.log('python ' + prefixDir + verificationScript + ' ' + problemName + ' -s ' + script_name);
    cp.exec('python ' + prefixDir + verificationScript + ' ' + problemName + ' -s ' + script_name);

    console.log('Finished running script');

    callback();
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

  var msg = '\nFolder ' + tests_path + ' has:\n';
  /* Check tests without .in and check tests without .ans */
  for (var key in dict) {
    msg += ' Test ' + key + ':\n';
    if (dict.hasOwnProperty(key)) {

      if(dict[key].includes('.in')) {
        msg += '  Has .in\n';
      }
      else {
        msg += '  WARNING: Has not .in\n';
      }
      if(dict[key].includes('.ans')) {
        msg += '  Has .ans\n';
      }
      else {
        msg += '  WARNING: Has not .ans\n';
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
