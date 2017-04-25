//var parseXlsx = require('excel');

var path = require("path");
var fs = require("fs");

function reportList(){};

reportList.getList = function() {
	var docDir = path.normalize(__dirname+'/'+"../docs");
	//stats = fs.lstatSync(docDir);	//	查看文件属性
	var fileList = fs.readdirSync(docDir);	//	罗列文件夹下面文件，
	console.log(fileList);
	return fileList;
}

reportList.editList = function(data) {
	var docDir = path.normalize(__dirname+'/'+"../docs/" + data);
	console.log(docDir);
	fs.unlinkSync(docDir);
	return 1;
}

module.exports = reportList;

//reportList.getList();