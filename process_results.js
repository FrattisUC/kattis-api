/* Process Results into nice JSON
*  https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
*/

var express = require('express')

class Test {
  constructor() {
    this.number = 0;
    this.value = 'value';
  }
}

/* sub ID, boolean, tests results (array), full string */
class Results {
  constructor() {
    this.sub_id = 'sub_id';
    this.overall = 'false'
    this.tests = [];
    this.comments = 'comment';
  }
}


/*
FILE:
WA [CPU: 0.01s @ test case sample/02]
WA [CPU: 0.01s @ test case secret/01]
WA [CPU: 0.01s @ test case secret/03]


   Slowest AC runtime: 0.012, setting timelim to 1 secs, safety margin to 2 secs
mult tested: 0 errors, 0 warnings
*/

/* TODO: dar numero a los cases por orden alfabetico */

export function process_results(sub_id, string) {
  console.log(results)
  let ret = new Results();
  ret.sub_id = sub_id;
  for (var i = 0; i < array.length; i++) {
    array[i]
  }
  console.log(ret)
  return ret;
}

function getTestsResults(string) {
  var tests = string.split("\n");
}
