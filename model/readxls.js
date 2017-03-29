var parseXlsx = require('excel');

function readxls(){};

readxls.read = function(res) {
	parseXlsx('../test.xlsx', 1, function(err, data) {
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

//readxls.read();