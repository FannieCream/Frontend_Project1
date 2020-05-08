# Frontend-Project 1

#### 一、实验内容

1. 针对澎湃新闻、环球网、央视网三个新闻网站的页面进行分析，建立爬虫，爬取得到出编码、标题、作者、时间、关键词、摘要、内容、来源等结构化信息，存储在数据库中；
2. 使用node.js搭建后端服务器，能够实现前端传输数据给后端，并在数据库中查询数据，得到的结果再返回到前端；

3. 前端的搜索可以实现分类搜索；
4. 针对爬取的数据进行了时间热度分析，并将得到的结果可视化在网页上；
5. 针对爬取的新闻数据，绘制了新闻词云。



#### 二、项目结构

```
├── crawl                        // 项目根目录
│   ├── crawl                    // 爬虫实现目录
│   │   ├── crawl_1_pengpai.js   	// 澎湃新闻页面爬取
│   │   ├── crawl_2_.js             // 央视网新闻页面爬取
│   │   ├── crawl_3_huanqiu.js      // 环球网新闻页面爬取
│   │   ├── mysql.js                // 连接数据库
│   ├── website                  // 前端页面目录：由于搜索爬取的新闻
│   │   │   ├── home.html           // 主页面：用于搜索
│   │   │   ├── analysis.html       // 新闻事件时间热度可视化
│   │   │   ├── wordcloud.html      // 新闻关键词词云
│   │   │   ├── index.js         	// 后端页面：用于接受前端数据并在数据库查询
│   │   │   ├── mysql.js          	// 连接数据库
│   │   │   ├── assets              // css/js/images静态文件目录
│   ├── node_modules             // 项目依赖目录
│   ├── analysis                 // 对新闻的时间热度分析、关键词统计(python)目录
│   ├── mysql.js				 // 连接数据库
│   ├── package.json             // 配置文件
│   ├── package-lock.json        // 配置文件
```



#### 三、运行方法

1. 爬虫运行：

   `cd` 进入 `crawl` 文件夹，执行 `node crawl_x_xxxx.js` 即可

   前提：需要在数据库中建好表，数据库的名称、用户、密码要一致

   ```shell
   cd crawl
   node crawl_1_pengpai.js
   ```

2. 进入 website，运行搜索功能：

   ```shell
   cd website
   // 运行index.js文件，开启服务器端口
   node index.js
   
   在url中输入http:127.0.0.1/home/html 即可执行搜索功能
   ```



#### 四、项目体会

整个项目经过已记录在CSDN中，以下则为链接：

[Frontend-Pro1：实现Node.js爬取新闻网站（零）环境配置](https://blog.csdn.net/FannieCream/article/details/105110258)

[Frontend-Pro1：实现Node.js爬取新闻网站（一）由简至繁：以澎湃新闻为例的新闻页面爬取](https://blog.csdn.net/FannieCream/article/details/105986276)

[Frontend-Pro1：实现Node.js爬取新闻网站（二）Node.js搭建网站后端](https://blog.csdn.net/FannieCream/article/details/105986526)

[Frontend-Pro1：实现Node.js爬取新闻网站（三）美化前端页面](https://blog.csdn.net/FannieCream/article/details/105986645)