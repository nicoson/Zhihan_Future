var express = require('express');
var router = express.Router();
var readxls = require('../model/readxls');
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var util = require('util');
var reportList = require("../model/reportList");

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req);
    readxls.read(req, res);
});

router.get('/report/*', function(req, res, next) {
    console.log(req.url);
    var proddata = readxls.read(req.url, "products/");

    docDir = path.normalize(__dirname+'/'+"../docs/bases/");
    var baseList = fs.readdirSync(docDir)[0].split(".")[0];  //  罗列文件夹下面文件，
    var basedata = readxls.read(baseList, "bases/");
    
    var result = {
        prod: proddata,
        base: basedata
    };

    res.render('report', { title: 'Express', data: JSON.stringify(result) });
});

router.get('/admin', function(req, res, next) {
    res.render('admin');
});

router.get('/admin/getList', function(req, res, next) {
    res.send(reportList.getList());
});

router.post('/admin/removeFile', function(req, res, next) {
    console.log(req.body.file);
    reportList.editList(req.body.file, req.body.folder);
    res.send(reportList.getList());
});

router.post('/submitxls', function(req, res, next) {
    var form = new formidable.IncomingForm();
    var uploadDir = path.normalize(__dirname+'/'+"../docs/products");
    form.uploadDir = uploadDir;
    form.parse(req, function(err, fields, files) {
        for(item in files){
            (function(){
                var oldname = files[item].name;
                var oldpath = files[item].path;
                var newpath = path.join(path.dirname(oldpath), oldname);
                // var newname = files[item].name === 'blob' ? oldname+'.xml' : oldname+"."+files[item].name.split('.')[1];
                fs.renameSync(oldpath, newpath);
                console.log('修改成功');
            })(item);
        }
        console.log(util.inspect({fields: fields, files: files}));
        res.send(reportList.getList());
    });
});

router.post('/submitbasexls', function(req, res, next) {
    var form = new formidable.IncomingForm();
    var uploadDir = path.normalize(__dirname+'/'+"../docs/bases");
    form.uploadDir = uploadDir;
    form.parse(req, function(err, fields, files) {
        for(item in files){
            (function(){
                var oldname = files[item].name;
                var oldpath = files[item].path;
                var newpath = path.join(path.dirname(oldpath), oldname);
                fs.renameSync(oldpath, newpath);
                console.log('修改成功');
            })(item);
        }
        console.log(util.inspect({fields: fields, files: files}));
        res.send(reportList.getList());
    });
});

router.get('/badurl', function(req, res, next) {
    res.render("badurl");
});


module.exports = router;