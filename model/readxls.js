//var parseXlsx = require('excel');
var parseXlsx = require('node-xlsx');
var path = require("path");
var fs = require("fs");

function readxls(){};

readxls.read = function(url, folder) {
	var filename = path.basename(url);
	console.log("readxls ====== " + filename);
	var filedir = path.normalize(__dirname+'/'+'../docs/' + folder + filename + ".xlsx");
	if(!fs.existsSync(filedir)) {
		filedir = path.normalize(__dirname+'/'+'../docs/' + folder + filename + ".xls");
		if(!fs.existsSync(filedir)) {			
			return null;
		}
	}
	console.log("readxls ====== " + filedir);

	// parseXlsx(filedir, 1, function(err, data) {
	// 	if(err) throw err;
	// 	// data is an array of arrays
	// 	//return data;
	// 	var result = [];
	// 	for(var i=1; i<data.length; i++) {
	// 		result.push([data[i][0], data[i][1], data[i][2]]);
	// 	}
	// 	res.render('index', { title: 'Express', data: result });
	// });

	var worksheets = parseXlsx.parse(filedir);
	var result = [];
	for(var i=0; i<worksheets.length; i++) {
		result.push({
			sheetname: worksheets[i].name,
			data: []
		});
		for(var j=1; j<worksheets[i].data.length; j++) {
			result[i].data.push([worksheets[i].data[j][0], worksheets[i].data[j][1], worksheets[i].data[j][2]]);
		}
	}
	//console.log(JSON.stringify(result[1]));
	return result;
}

module.exports = readxls;

//readxls.read({url: "/report/test"});