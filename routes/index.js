var express = require('express');
var router = express.Router();
var readxls = require('../model/readxls');
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
	readxls.read(res);
});

router.get('/admin', function(req, res, next) {
	res.render('admin');
});

router.post('/submitxls', function(req, res, next) {
	// console.log(req.body);
	// res.send("success");
	var form = new formidable.IncomingForm();
    var uploadDir = path.normalize(__dirname+'/'+"../docs");
    form.uploadDir = uploadDir;
    console.log(uploadDir);
    form.parse(req, function(err, fields, files) {
        for(item in files){
            (function(){
                var oldname = files[item].name;
                var oldpath = files[item].path;
                var newpath = path.join(path.dirname(oldpath), oldname);
                // var newname = files[item].name === 'blob' ? oldname+'.xml' : oldname+"."+files[item].name.split('.')[1];
                fs.rename(oldpath, newpath, function(err){
                    if(err) console.log(err);
                    console.log('修改成功');
                })
            })(item);
        }
        console.log(util.inspect({fields: fields, files: files}));
        res.send('2');
    });
});



module.exports = router;
