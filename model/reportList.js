//var parseXlsx = require('excel');

var path = require("path");
var fs = require("fs");

function reportList(){};

reportList.getList = function() {
	var docDir = path.normalize(__dirname+'/'+"../docs/products/");
	//stats = fs.lstatSync(docDir);	//	查看文件属性
	var fileList = fs.readdirSync(docDir);	//	罗列文件夹下面文件，


	docDir = path.normalize(__dirname+'/'+"../docs/bases/");
	var baseList = fs.readdirSync(docDir);	//	罗列文件夹下面文件，

	console.log(fileList);
	console.log(baseList);

	return {
		fileList: fileList,
		baseList: baseList
	};
}

reportList.editList = function(data, folder) {
	var docDir = path.normalize(__dirname+'/'+"../docs/" + folder + data);
	console.log(docDir);
	fs.unlinkSync(docDir);
	return 1;
}

module.exports = reportList;

//reportList.getList();