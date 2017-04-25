var parseXlsx = require('excel');
var path = require("path");
var fs = require("fs");

function readxls(){};

readxls.read = function(url, res) {
	var filename = path.basename(url);
	var filedir = path.normalize(__dirname+'/'+'../docs/' + filename + ".xlsx");
	if(!fs.existsSync(filedir)) {
		filedir = path.normalize(__dirname+'/'+'../docs/' + filename + ".xls");
		if(!fs.existsSync(filedir)) {			
			return res.render("badurl");
		}
	}
	console.log(filedir);

	parseXlsx(filedir, 1, function(err, data) {
		if(err) throw err;
		// data is an array of arrays
		//return data;
		var result = [];
		for(var i=1; i<data.length; i++) {
			result.push([data[i][0], data[i][1], data[i][2]]);
		}
		res.render('index', { title: 'Express', data: result });
	});
}

module.exports = readxls;

//readxls.read({url: "/report/test"});