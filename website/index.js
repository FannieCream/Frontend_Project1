var http = require('http');
var fs = require('fs');
var url = require('url');
var mysql = require('./mysql.js');
var querystring = require('querystring')

// http.createServer(function(request, response){
//     var pathname = url.parse(request.url).pathname;
//     console.log("pathname: ", pathname)
//     var params = url.parse(request.url, true).query;
//     console.log("params: ",params)
//     var str = "";
//     // post方法传送数据是分段传输的
//     request.on('data', function(chunk){
//         // 获取所有数据
//         str += chunk;
//     })
    
//     request.on('end', function(){
//         // 传送成功通过querystring将数据转换成json格式
//         var mydata = querystring.parse(str);
//         console.log(mydata);
//         var search_type = mydata.type;
//         var search_text = mydata.text;
//         var select_Sql = "select title,author,publish_date from fetches " ;
//         if(search_type === "title"){
//             select_Sql += "where title like '%" + search_text + "%'";
//         }
//         else if(search_type === "keywords"){
//             select_Sql += "where keywords like '%" + search_text + "%'";
//         }
//         else {
//             select_Sql += "where source like '%" + search_text + "%'";
//         }
//         console.log(select_Sql)
                
//         mysql.query(select_Sql, function(qerr, vals, fields) {
//             console.log(vals);
//             response.write(JSON.stringify(vals));
//             response.end();
//     }); 

//         // response.write(JSON.stringify(mydata));   
//     })

//     fs.readFile(pathname.substr(1), function(err, data){
//         // response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//         if((typeof(params.type) == "undefined") && (typeof(data) !== "undefined")){
//             response.write(data.toString());
//             console.log("111111111");
//         }
//         else{
//             console.log("22222");
            
//             // response.write(JSON.stringify(params));
//             // if(pathname === '/home.html'){
//             //     console.log("33333");
//                 // response.writeHead(200, { 'Content-Type': 'charset=utf-8' });
//                 // 定义空字符串储存数据
//                 // var str = "";
//                 // // post方法传送数据是分段传输的
//                 // request.on('data', function(chunk){
//                 //     // 获取所有数据
//                 //     str += chunk;
//                 // })
//                 // response.write(JSON.stringify(params));
//                 // request.on('end', function(){
//                 //     // 传送成功通过querystring将数据转换成json格式
//                 //     var mydata = querystring.parse(str);
//                 //     console.log(mydata);
//                 //     response.write(JSON.stringify(mydata));
//                 //     response.end();
//                 // })
//             // }
//         }
//         response.end();
//     })
// }).listen(8081);


http.createServer(function(request, response){
    var pathname = url.parse(request.url).pathname;
    console.log("pathname: ", pathname)
    var params = url.parse(request.url, true).query;
    var search_type = params.type;
    var search_text = params.text;
    console.log("params: ",params)
    // if(typeof(search_type) !== "undefined" && typeof(search_text) !== "undefined"){
        fs.readFile(pathname.substr(1), function(err, data) {
            // 不注释的话看不到css样式
            // response.writeHead(200, { 'Content-Type': 'text/html ; charset=utf-8' });
            if(((params.type === undefined)|| (params.text === undefined)) && (data !== undefined)){
                response.write(data.toString());
                response.end();
            }
            else {
                // response.write(JSON.stringify(params));
                var select_Sql = "select url,source_name,title,author,publish_date from fetches " ;
                if(search_text === undefined || search_type === undefined) return;

                if(search_type === "title"){
                    select_Sql += "where title like '%" + search_text + "%'";
                }
                else if(search_type === "keywords"){
                    select_Sql += "where keywords like '%" + search_text + "%'";
                }
                else {
                    select_Sql += "where source like '%" + search_text + "%'";
                }
                console.log(select_Sql)
                mysql.query(select_Sql, function(qerr, vals, fields) {
                    console.log(vals);
                    response.write(JSON.stringify(vals));
                    response.end();
                });      
            }
            // response.end();
        })
    // }
}).listen(8081);
console.log('Server running at http://127.0.0.1:8081/');