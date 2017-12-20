var express = require("express");
var app = express();
var path                = require('path');
var cookieParser        = require('cookie-parser') ;
var fs 					= require('fs');
var bodyParser 			= require('body-parser');
var nodeExcel           = require('excel-export');
/*var moment 				= require("moment");*/
app.use(express.static(path.join(__dirname)));//静态文件服务器指定目录
//app.engine('html', require('ejs').__express);
//指定模板引擎
app.set("view engine", 'ejs');
//指定模板位置
app.set('views', __dirname + '/');
app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({extended: false})); //此项必须在 bodyParser.json 下面,为参数编码.获取方式req.body.data.name

//连接数据库
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'shop',
    connectionLimit: 5,//连接池 最多可以创建几个连接
    queueLimit: 10//等待队伍中最多有几个连接
});

function mysqlOperation(sql, callback) {
    pool.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err);
        } else {
            return callback(err, rows);
        }
    });
}




//添加新的书籍的接口
app.post('/user_add',function(req, res){
    mysqlOperation("INSERT INTO `integral`(`id`, `username`, `userIntegral`) VALUES ('"+req.body.userid+"','"+req.body.username+"','"+req.body.userintegral+"')", function (err, rows) {
	//  rows为数据库返回来的内容
 
    	if (rows.affectedRows == "1") {
            res.send({"status":"success"});
        } else if (rows.affectedRows == "0") {
            res.send({"status":"false"});
        } else {
            res.send({"status":"error"});
        }
    })
});
//添加新的书籍的接口
app.post('/userintegral_list',function(req, res){
    var query = req.body.query,    //搜索框内容
        size  = req.body.size,     //每页展示的内容
        pageSize = req.body.page,  //当前第几页
        classV = req.body.classV,  //类型
        statusV = req.body.statusV;//状态
    var totalSql;                  //查询数量的sql
    var searchSql;                 //查询列表
    var total;                     //总数量
    var startTotal = size*pageSize; 
    totalSql ="SELECT count( * ) as count FROM `integral` WHERE 1=1 ";
    searchSql = "SELECT * FROM `integral` WHERE 1=1 ";
    if(query){   //有搜索内容的时候
        totalSql +="and name like '%"+query+"%' ";
        searchSql += "and name like '%"+query+"%' ";
    }
    searchSql+="ORDER BY id desc LIMIT "+startTotal+","+size+"";
    
    //先查询总共有多少条数据
    mysqlOperation(totalSql, function (err, rows) {
        
        total = rows[0].count;
        //然后查询列表
        mysqlOperation(searchSql, function (err, rows) {
            var goodsList = [];
            if(rows){
                for(var i = 0;i<rows.length;i++){
                    var goodsO = {};
                    for(var key in rows[i]){
                        
                            goodsO[key] = rows[i][key];
                        
                        
                    }
                    goodsList.push(goodsO);
                }
                res.send({"status":"success","total":total,"data":goodsList});
            }else{
                res.send({"status":"error"});
            }
            
        })
    });
    
});






var server = app.listen(3000, function() {
    console.log("请在浏览器访问：http://localhost:3000/");
});