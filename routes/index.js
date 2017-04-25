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
    readxls.read(req.url, res);
});

router.get('/admin', function(req, res, next) {
    res.render('admin');
});

router.get('/admin/getList', function(req, res, next) {
    res.send(reportList.getList());
});

router.post('/admin/removeFile', function(req, res, next) {
    console.log(req.body.file);
    reportList.editList(req.body.file);
    res.send(reportList.getList());
});

router.post('/submitxls', function(req, res, next) {
	var form = new formidable.IncomingForm();
    var uploadDir = path.normalize(__dirname+'/'+"../docs");
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

router.get('/badurl', function(req, res, next) {
    res.render("badurl");
});


module.exports = router;