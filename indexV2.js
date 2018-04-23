const express = require('express');
const fs = require('fs');
const path = require('path');
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const http = require('http');
const querystring = require('querystring');
const request = require('request');
const cp = require('child_process');

const app = express();
const port = process.env.PORT || '3389';

const prefixDir = 'kattis-problemtools/problemtools/';
const suffixDir = '/submissions/accepted/';
const verificationScript = 'verifyproblem.py';

const resultsPath = 'Results/';

app.use(busboy());
app.use(bodyParser());

app.get('/', (req, res) => res.send('Done!'));

app.listen(port, () => {
  console.log('Example app listening on port '+ port +'!');
  console.log('Running on: ' + __dirname + '\n\n');
});

/* TODO: Make Login submission
*/
app.post('/login', (req, res) => {
  console.log('========DIR NAME:');
  console.log('prefixDir: ' + prefixDir);
  console.log('========SENDER:');
  console.log(req.connection.remoteAddress);

  http_request('3000', '1', 'webapi', 'SJnr1hrF-');

  res.send('Logged in!');
});

/* ========= Error Handling ============= */

process.on('uncaughtException', (err) => {
  console.log('Caught exception: ' + err);
});

/* ========= Submissions ============= */

/* Make program submission
*/
app.post('/submit', (req, res) => {
  // console.log(req.headers)
  // console.log(req.connection.remoteAddress)
  // console.log(req.socket.remotePort);

  let fstream;
  const problemName = req.headers.problem;
  const subID = req.headers.subid;
  const authToken = req.headers.authorization;
  // var reqPort = req.socket.remotePort;
  // var address = req.connection.remoteAddress;

  let reqPort = 3000;
  let address = 'webapi';

  if (problemName == null) {
    res.send('No problem specified');
  }

  let problemDir = prefixDir + problemName;
  if (!fs.existsSync(problemDir)) {
    res.send('Can\'t find problem ' + problemName);
  } else {
    try {
      req.pipe(req.busboy);
      req.busboy.on('file', (fieldname, file, filename) => {
        // console.log('Uploading: ' + filename);
        res.send('Evaluating...');

        let name = shortid.generate();
        let orig_name = name + '.py';
        let path = prefixDir + problemName + suffixDir;
        let problemDir = prefixDir + problemName;
        // console.log(path);
        let subPath = path + name + '.py';
        // console.log('subPath:' + subPath);
        fstream = fs.createWriteStream(subPath);
        file.pipe(fstream);

        fstream.on('close', () => {
          run_program(path, name, problemDir, () => {
            // console.log("bloop")
            http_request(reqPort, subID, address, name, authToken, (name) => {
              let resultSubPath = resultsPath + name;
              /* Delete submission and its results */
              fs.unlink(subPath, (err) => {
                if (err) throw err;
                console.log('successfully deleted ' + path + orig_name);
              });
              fs.unlink(resultSubPath, (err) => {
                if (err) throw err;
                console.log('successfully deleted ' + resultSubPath);
              });
            });
          });
        });
        // console.log('bleep');
      });
    } catch (e) {
      console.log(e);
      res.send('Error reading file.');
    }
  }
});


/* Make HTTP request to Ruby
*/
function http_request(port, subID, address, problemName, authToken, callback) {
  /* https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener */
  let filename = '';
  let testFolder = './Results';
  // console.log("bloop2")
  fs.watch('./Results', (eventType, filename) => {
    // console.log(`event type is: ${eventType}`);

    if (eventType=='change' && filename) {
      // console.log('Reading ' + filename);

      fs.readFile('./Results/'+filename, 'utf8', (err, data) => {
        if (!err) {
          // console.log('FILE:\n\r'+data);
          process_data(data, (pData) => {
            console.log(pData);
            /* Send request */
            request.post({
              headers: { 'content-type': 'application/json', 'Authorization': authToken },
              url: 'http://webapi:3000/api/v1/online_judge_submissions/'+subID+'/node_result',
              form: pData,
            }, (error, response, body) => {
              // console.log("callback")
              callback(filename);
            });
          });
        } else {
          return console.log('READ ERROR:' + err);
        }
      });

    }
  });
}

function process_data(data, callback) {
  let tests = data.split('\n');
  let online_judge_submissions = {};
  let sub_test_att = {};

  /* Build basic Online Judge Submission values */
  let total_sucess = true;
  let status = 'Done';

  /* Build tests array */
  for (let i = 0; i < tests.length;) {
    if (!tests[i]) {
      tests.splice(i, 1);
    } else {
      let success = false;
      /* Obtain judge result and test name */
      tests[i] = tests[i].replace('test case', '').replace('[', '').replace(']', '').split('  ');

      /* Build test's json */
      if (tests[i][0] === 'AC') {
        success = true;
      } else {
        total_sucess = false;
      }

      sub_test_att[i] = { 'testnumber':i+1, 'result':tests[i][0], 'success':success }
      i++;
    }
  }

  /* Set array of tests insisde corresponding json object */
  online_judge_submissions['submission_tests_attributes'] = sub_test_att;
  online_judge_submissions['status'] = status;
  online_judge_submissions['success'] = total_sucess;


  // console.log({'online_judge_submissions':online_judge_submissions})
  let ret = { 'online_judge_submission': online_judge_submissions };
  callback(ret);
}

/* Run python program
*/
function run_program(path, script_name, problemName, callback) {
  // console.log(path)
  if (!fs.existsSync(path+'/submissions')) {
    fs.mkdirSync(path+'/submissions');
  }
  // console.log('python ' + prefixDir + verificationScript + ' ' + problemName + ' -s ' + script_name);
  cp.exec('python ' + prefixDir + verificationScript + ' ' + problemName + ' -s ' + script_name);

  // console.log('Finished running script');

  callback();
}

/* ========= Validate Problem ============= */

app.post('/validate', (req, res) => {
  let problemName = req.headers.problem;
  is_program_valid(problemName, (msg) => {
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
  fs.readdir(prefixDir, (err, files) => {
    if (!err) {
      let path = prefixDir + problemName;
      let msg;
      console.log(path);
      try {
        if (fs.existsSync(path)) {
          msg = 'Problem exists';
          // Check folder structure
          msg += '\n'+ sync_check_folder_structure(path);
          console.log(msg);
        } else {
          msg = 'No problem name provided';
        }
      } catch (err) {
        //console.log(problemName);
        msg = 'Problem doesnt exist';
      }
    }
    else {
      let msg = 'An error ocurred';
    }
    callback(msg);
  });
}

/*
* Check folder structure
*/
function sync_check_folder_structure(problem_path) {
  let data_stat = fs.existsSync(problem_path+'/data');
  let ifv_stat = fs.existsSync(problem_path+'/input_format_validators');
  let ov_stat = fs.existsSync(problem_path+'/output_validators');
  let ps_stat = fs.existsSync(problem_path+'/problem_statement');
  let subs_stat = fs.existsSync(problem_path+'/submissions');

  let sample_data_stat = fs.existsSync(problem_path+'/data/sample');
  let secret_data_stat = fs.existsSync(problem_path+'/data/secret');

  let acc_subs_stat = fs.existsSync(problem_path+'/submissions');

  let status = 'OK!';

  if (data_stat == null || ifv_stat == null || ov_stat == null || ps_stat == null || subs_stat == null) {
    status = 'Main folders missing.';
  }

  if (sample_data_stat == null || secret_data_stat == null) {
    status = 'Data subfolders missing.';
  }

  let msg = 'Folder structure:'
      + '\nData: ' + (data_stat) + '\n\tSample: ' + (sample_data_stat) + '\n\tSecret: ' + (secret_data_stat)
      + '\nInputFormatValidator: ' + (ifv_stat)
      + '\nOutputValidator: ' + (ov_stat)
      + '\nProblemStatement: ' + (ps_stat)
      + '\nSubmissions: ' + (subs_stat) + '\n\tAccepted: ' + (acc_subs_stat)
      + '\n\nFolder Structure Status:' + status + '\n';

  let tests_msg_sam = sync_check_tests(problem_path+'/data/sample');
  let tests_msg_sec = sync_check_tests(problem_path+'/data/secret');

  msg += tests_msg_sam;
  msg += tests_msg_sec;

  return msg;
}

/*
* Tests
*/
function sync_check_tests(tests_path) {
  let dict = {};
  /* Obtain tests */
  fs.readdirSync(tests_path).forEach((file) => {
    let extension = path.extname(file);
    let name = path.basename(file, extension);
    if (extension === '.in' || extension === '.ans') {
      if (dict[name] === undefined) {
        dict[name] = [];
        dict[name].push(extension);
      } else {
        dict[name].push(extension);
      }
    }
  });

  let msg = '\nFolder ' + tests_path + ' has:\n';
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
app.post('/test', (req, res) => {
  let problemName = 'mult';
  let path_sam = prefixDir + problemName + '/data/sample';
  let path_sec = prefixDir + problemName + '/data/secret';
  sync_check_tests(path_sam);
  sync_check_tests(path_sec);
});
