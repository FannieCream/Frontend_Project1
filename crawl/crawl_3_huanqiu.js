// practice 03:Crawl Website and Saved into Mysql

// 引入模块
var myFs = require('fs');
var myRequest = require('request');
var myCheerio = require('cheerio');
var myIconv = require('iconv-lite');
require('date-utils');
// 写入数据库
var mysql = require('./mysql.js');
// 定时功能
var schedule = require('node-schedule');


// 定义要访问的网站
var source_name = "环球网国际新闻";
var domain = "https://world.huanqiu.com/";
var myEncoding = "utf-8";
var seedURL =  "https://world.huanqiu.com/";

// var seedURL_format = "$('.list-item-txt').eq(1).attr('href')";
var seedURL_format = "$('a')";
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
var desc_format = " $('meta[name=\"description\"]').eq(0).attr(\"content\")";
var content_format = "$('article').text()";
var author_format = "$('.author').text()";
// 包含date & source
var date_format = "$('.time').text()";
var source_format = "$('.source').text()";
var url_reg = /article\/([0-9a-zA-Z]{11})/;
var type_reg = /cs\-link/
var date_reg = /(\d{4})\-(\d{2})\-(\d{2})/;
var source_reg = /^来源\：/
var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/;

//防止网站屏蔽我们的爬虫
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
};

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
        timeout: 10000 //
    }
    myRequest(options, callback)
};

// Function: 定时执行
var rule = new schedule.RecurrenceRule();
var myhour = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; //每天4次自动执行
var myminute = 5; //定义在第几分钟执行
rule.hour = myhour;
rule.minute = myminute;

//定时执行httpGet()函数
// schedule.scheduleJob(rule, function() {
//     seedGet();
// });

seedGet();

// Function: 读取种子页面
function seedGet(){
    request(seedURL, function(error, response, body){
        // 1.用iconv转换编码
        var html = myIconv.decode(body, myEncoding);
        // console.log(html);
    
        // 2.用cheerio解析html
        var $ = myCheerio.load(html, { decodeEntities: true });
        var seedURL_news;
        try {
            seedURL_news = eval(seedURL_format);
        } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
        console.log(seedURL_news);
    
        // 3.遍历种子页面中的所有<a href>链接
        seedURL_news.each(function(i, e){
            var myURL = "";
            try{
                // 得到具体的url
                var href = "";
                href = $(e).attr("href");
                console.log(href)
                if(href.toLowerCase().indexOf("https://") >=0 ){
                    myURL = href;
                } else if (href.startsWith("//")){
                    myURL = 'http:'+ href;
                }else{
                    myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href; 
                }
            } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) };
    
            
             //检验是否符合新闻url的正则表达式
            if (url_reg.test(myURL)) {
                var fetch_url_Sql = 'select url from fetches where url=?';
                var fetch_url_Sql_Params = [myURL];
                // 查询数据库是否插入过相同的url
                mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function(qerr, vals, fields) {
                    if (vals.length > 0) {
                        // console.log("---------------------------")
                        // console.log(vals)
                        console.log('URL duplicate!')
                    }
                    //读取新闻页面 
                    else {
                        newsGet(myURL);
                    }
                });  

            }    
           
        })
    });
    
}


// Function: 读取新闻页面
function newsGet(myURL){
    request(myURL, function(error, response, body){
         // 1.用iconv转换编码
        var html_news = myIconv.decode(body, myEncoding);
         // 2.用cheerio解析html_news
        var $ = myCheerio.load(html_news, { decodeEntities: true });
        // myhtml = html_news;
        console.log("转码读取成功：" + myURL);

        
        if(eval(content_format) == "undefined") return;
        console.log("22222222222222222")
        console.log()

        //3.动态执行format字符串，构建json对象准备写入文件
        // 初始化
        var fetch = {};
        fetch.title = "";
        fetch.content = "";
        fetch.publish_date = (new Date()).toFormat("YYYY-MM-DD");
        fetch.url = myURL;
        fetch.source_name = source_name;
        fetch.source_encoding = myEncoding;
        fetch.crawltime = new Date();

        // 处理数据格式       
        
        // 内容信息
        var mycontent = eval(content_format);
        if (mycontent == "") return;
        console.log("222222222222")
        console.log(mycontent)
        if(mycontent == ""){
              fetch.content = fetch.title;
        }else{
              fetch.content = mycontent;
        }
  
        // 标题
        var mytitle = eval(title_format);
        if(mytitle == ""){
            fetch.title = "THIS IS NEWS";
        }else {
            fetch.title = mytitle;
        };

         // 关键字
         var mykeywords = eval(keywords_format);
         if(mykeywords == ""){
            fetch.keywords = source_name;
        }else {
            fetch.keywords = mykeywords;
        };
        
        console.log("keywords: ", mykeywords)

        // 时间
        var mydate = eval(date_format);
        console.log("--------------------1111111-------------------")
        console.log("date: ", mydate)
        if(mydate == ""){
            fetch.publish_date = "no details";
        }else {
            mydate = mydate.split(" ")[0]
            fetch.publish_date = new Date(mydate).toFormat("YYYY-MM-DD");
        };

        // 来源
        var mysource = eval(source_format);
        console.log("source: ", mysource);
        if(mysource == ""){
            fetch.source = fetch.source_name;
        }else {
            fetch.source = new Date(mydate).toFormat("YYYY-MM-DD");
        };

        // 作者信息
        var myauthor = eval(author_format);
        console.log("author: ", myauthor);
        if(myauthor == ""){
            fetch.author = "Anonym";
        }else{
            fetch.author = myauthor;
        }

        // 摘要信息
        var mydesc = eval(desc_format);
        if(mydesc == ""){
            fetch.description = fetch.title;
        }else {
            fetch.description = mydesc;
        }


        // 写入数据库
        var fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
        'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
        var fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
        fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
        fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content];

        // 执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
        mysql.query(fetchAddSql, fetchAddSql_Params, function(qerr, vals, fields) {
            if (qerr) {
                // console.log(qerr);
            }
            else{
                console.log("存储成功")
            }
        }); //mysql写入

    })


}