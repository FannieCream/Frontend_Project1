// practice 03:Crawl Website and Saved into Mysql

// 引入模块
var myFs = require('fs');
var myRequest = require('request');
var myCheerio = require('cheerio');
var myIconv = require('iconv-lite');
require('date-utils');
// 写入数据库
var mysql = require('./mysql.js');


// 定义要访问的网站
var source_name = "澎湃国际";
var domain = "https://www.thepaper.cn/list_25429";
var myEncoding = "utf-8";
var seedURL =  "https://www.thepaper.cn/list_25429";

var seedURL_format = "$('a')";
// var keywords_format = "$('meta[name=\"Keywords\"]')[\'0\'].attribs[\'content\']";
var keywords_format = " $('meta[name=\"Keywords\"]').eq(0).attr(\"content\")";
var title_format = "$('title').text()";
// var desc_format = " $('meta[name=\"Description\"]')[\'0\'].attribs[\'content\']";
var desc_format = " $('meta[name=\"Description\"]').eq(0).attr(\"content\")";
var content_format = "$('.news_txt').text()";
var author_format = "$('.infor_item').text()";
// 包含date & source
var info_format = "$('.news_about').text()";
// var source_format = "$('#source_baidu').text()";
var url_reg = /newsDetail\_forward\_(\d{7})/;
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
        // console.log(seedURL_news);
    
        // 3.遍历种子页面中的所有<a href>链接
        seedURL_news.each(function(i, e){
            var myURL = "";
            try{
                // 得到具体的url
                var href = "";
                href = $(e).attr("href");
                if(href.toLowerCase().indexOf("https://") >=0 ){
                    myURL = href;
                } else if (href.startsWith("//")){
                    myURL = 'http:'+ href;
                }else{
                    myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href; 
                }
            } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) };
    
             //检验是否符合新闻url的正则表达式
            if (!url_reg.test(myURL)) return;

            //
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
        // 标题
        if(title_format == ""){
            fetch.title = "THIS IS NEWS";
        }else {
            fetch.title = eval(title_format);
        };

         // 关键字
         if(keywords_format == ""){
            fetch.keywords = source_name;
        }else {
            fetch.keywords = eval(keywords_format);
        };

        // 处理时间数据
        if(info_format != ""){
            var info_content = eval(info_format);
            // var getDate = info_content.match(date_reg);
            // var regTime = /\s+/g;
            // var getInfo = info_content.split('\n') 
            // // 删除空格行
            // getInfo = getInfo.filter(function(e){
            //     e = e.replace(regTime, "")
            //     return e
            // });
            
            // var myInfo = getInfo[1];
            // console.log("111111111111111111")
            // console.log(info_content);
            // console.log(typeof myInfo, myInfo)
            // // 删去首尾空格
            // myInfo = myInfo.replace(/(^\s*)|(\s*$)/g, "");
            // myInfo = myInfo.split(' ');
            // // myInfo形如：[ '2020-05-05', '08:33', '来源：澎湃新闻' ]
            // getDate = myInfo[0];
            // getMinute = myInfo[1];
            var getDate = date_reg.exec(info_content);
            if(getDate){
                fetch.publish_date = getDate[0];
                fetch.publish_date = new Date(fetch.publish_date).toFormat("YYYY-MM-DD");
            }else {
                fetch.publish_date = "no details";
            }

            var getSource = source_reg.exec(info_content);
            if(getSource){
                fetch.source = getSource[0];
            }else {
                fetch.source = fetch.source_name;
            }

            // if(myInfo.length > 2){
            //     fetch.source = myInfo[2];
            // }else {
            //     fetch.source = fetch.source_name;
            // }
        };

        // 作者信息
        if(author_format == ""){
            fetch.author = "Anonym";
        }else{
            fetch.author = eval(author_format);
        }

        // 摘要信息
        if(desc_format == ""){
            fetch.description = fetch.title;
        }else {
            fetch.description = eval(desc_format);
        }

        // 内容信息
        if(content_format == ""){
            fetch.content = fetch.title;
        }else {
            fetch.content = eval(content_format);
        }

        // var filename ="./result/" + source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
        // "_" + myURL.substr(myURL.lastIndexOf('_') + 1,7) + ".json";
        // //存储json
        // myFs.writeFileSync(filename, JSON.stringify(fetch));
        // console.log("存储成功");

        // 写入数据库
        var fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
        'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
        var fetchAddSql_Params = [fetch.url, fetch.source_name, fetch.source_encoding,
        fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
        fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content];

        //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
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