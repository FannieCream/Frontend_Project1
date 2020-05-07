var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('./mysql.js');

var select_Sql = "select keywords from fetches " ;
var data = ''
mysql.query(select_Sql, function(qerr, vals, fields) {
    console.log("22222", vals)
    data += JSON.stringify(vals) + ",";
}); 
console.log("11111", data)
var output = "./keywords.txt";
fs.writeSync(output, data);