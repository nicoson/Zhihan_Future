//	deal with raw data
rawData = rawData.split(",");
var data = [],
	dateArr = [],
	dateArrStr = [],
	dateIndexYear = [],
	dateIndexMonth = [],
	qy = [],
	crj = [],
	fe = [],
	jz = [1];
for(var i=0; i<(rawData.length/3); i++) {
	var tempDay = new Date(1900, 0, 0, 0, 0, 0);
	tempDay.setDate(tempDay.getDate() + (parseInt(rawData[i*3]) - 1));
	data.push([tempDay, parseFloat(rawData[i*3+1]), parseFloat(rawData[i*3+2])]);
	dateArr.push(tempDay);
	dateArrStr.push([tempDay.getFullYear(), tempDay.getMonth() + 1, tempDay.getDate()].join('/'));
	qy.push(parseFloat(rawData[i*3+1]));
	crj.push(parseFloat(rawData[i*3+2]));

	//	calculate the index of each year/month
	var tempYear = tempDay.getFullYear();
	var tempMonth = [tempDay.getFullYear(), tempDay.getMonth() + 1].join('/');
	if(i == 0) {
		dateIndexYear.push([tempYear, 0]);
		dateIndexMonth.push([tempMonth, 0]);
	}else{
		if(tempYear != dateIndexYear.slice(-1)[0][0]) {
			dateIndexYear.push([tempYear, i]);
		}

		if(tempMonth != dateIndexMonth.slice(-1)[0][0]) {
			dateIndexMonth.push([tempMonth, i]);
		}
	}	
}

fe.push(crj[0]);
for(var i=1; i<qy.length; i++) {
	crj[i] ? fe.push(fe[i-1] + crj[i]/jz[i-1]) : fe.push(fe[i-1]);
	jz.push(qy[i]/fe[i]);
}

var syl = [];
for(var i=1; i<jz.length; i++) {
	syl.push((jz[i]-jz[i-1])/jz[i-1]);
}


//	table ratio calculation
var bd = (data.slice(-1)[0][0]-data[0][0])/24/3600000;	// days
var qjsyl = (jz.slice(-1)[0]-jz[0])/jz[0];
var nhsyl = qjsyl*365/bd;
var bdl = std(syl);
var zdhc = maxDrawDone(jz);
var xpz = (avg(syl) - 0.03/365) / std(syl) * Math.sqrt(365);
var calmar = Math.abs(nhsyl/zdhc);

var statYear = rateCal(dateIndexYear, jz);
var statMonth = rateCal(dateIndexMonth, jz);




//	append ratio to DOM elements
$("#period > p > span").html(dateArrStr[0] + " - " + dateArrStr.slice(-1));

$("#table_all tr").eq(1).find("td").eq(0).html((qjsyl*100).toFixed(2)+"%");
$("#table_all tr").eq(1).find("td").eq(1).html((nhsyl*100).toFixed(2)+"%");
$("#table_all tr").eq(1).find("td").eq(2).html(bdl.toFixed(4));
$("#table_all tr").eq(1).find("td").eq(3).html((zdhc*100).toFixed(2)+"%");
$("#table_all tr").eq(1).find("td").eq(4).html(xpz.toFixed(3));
$("#table_all tr").eq(1).find("td").eq(5).html(calmar.toFixed(3));

//	for yearly table
for(var i=0; i<statYear.length; i++) {
	var template = "<tr><td>" + statYear[i][0] + "</td>" +
		    		"<td>" + (statYear[i][1]*100).toFixed(2) +"%</td>" +
		    		"<td>" + (statYear[i][2]*100).toFixed(2) +"%</td></tr>";
	$("#table_year").append(template);
}

// //	for monthly table
// for(var i=0; i<statMonth.length; i++) {
// 	var template = "<tr><td>" + statMonth[i][0] + "</td>" +
// 		    		"<td>" + (statMonth[i][1]*100).toFixed(2) +"%</td>" +
// 		    		"<td>" + (statMonth[i][2]*100).toFixed(2) +"%</td></tr>";
// 	$("#table_month").append(template);
// }



//	draw charts
//	for summary chart
drawChart(jz, dateArrStr);
//	for monthly rate
drawChart2(statMonth);












/*==========================*\
|=====  Helper functions  ===|
\*==========================*/

function rateCal(data, price) {
	var stat = [];
	for(var i=0; i<data.length; i++) {
		var p = [];
		if(i == data.length - 1) {
			p = price.slice(data[i][1], price.length);
		}else{
			p = price.slice(data[i][1], data[i+1][1]);
		}

		stat.push([data[i][0], (p.slice(-1)-p[0])/p[0], maxDrawDone(p)]);
	}
	return stat;
}

function maxDrawDone(price) {
	if(price.length <= 0) return 0;

	var bt = [];
	for(var i=0; i<price.length-1; i++) {
		// for(var j=1; j<price.length; j++) {
		// 	bt.push((price[i]-price[j])/price[i]);
		// }
		var tempmin = min(price.slice(i+1));
		bt.push((price[i] - tempmin) / price[i]);
	}

	return max(bt);
}

function min(x) {
    var xmin = x[0];
    for(var i=1; i<x.length; i++) {
        if(x[i] < xmin) xmin = x[i];
    }
    return xmin;
}

function max(x) {
    var xmax = x[0];
    for(var i=1; i<x.length; i++) {
        if(x[i] > xmax) xmax = x[i];
    }
    return xmax;
}

function sum(x) {
	var sum = 0;
	for(var i=0; i<x.length; i++) {sum += x[i];}
	return sum;
}

function avg(x) {
	return sum(x)/x.length;
}

function std(x) {
	var avgx = avg(x);

	var vari = 0;
	for(var i=0; i<x.length; i++) {
		vari += (x[i]-avgx)*(x[i]-avgx);
	}

	return Math.sqrt(vari/x.length);
}

function drawChart(xdata, ydata) {
	var myChart = echarts.init(document.getElementById('chart_1'));

	var option = {
	    title: {
	        text: '组合管理业绩图',
	        //textAlign: 'right'
	    },
	    tooltip: {
	        trigger: 'axis'
	    },
	    legend: {
	        data:['收益率（累计）']
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    toolbox: {
	        feature: {
	            dataZoom: {
	                yAxisIndex: 'none'
	            },
	            restore: {},
	            saveAsImage: {}
	        }
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: ydata
	    },
	    yAxis: {
	        type: 'value'
	    },
	    series: [
	        // {
	        //     name:'邮件营销',
	        //     type:'line',
	        //     data:[120, 132, 101, 134, 90, 230, 210]
	        // },
	        {
	            name:'收益率（累计）',
	            type:'line',
	            data: xdata
	        }
	    ]
	};

	myChart.setOption(option);
}


function drawChart2(data) {
	var myChart = echarts.init(document.getElementById('chart_2'));
	var xdata = [],
		ydata = [];
	for(var i=0; i<data.length; i++) {
		xdata.push(data[i][0]);
		ydata.push(data[i][1]);
	}

	var labelRight = {
	    normal: {
	        position: 'right'
	    }
	};
	option = {
	    title: {
	        text: '管理账户月度收益',
	    },
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        }
	    },
	    grid: {
	        top: 80,
	        bottom: 30
	    },
	    toolbox: {
	        feature: {
	            dataZoom: {
	                yAxisIndex: 'none'
	            },
	            restore: {},
	            saveAsImage: {}
	        }
	    },
	    yAxis: {
	        type : 'value',
	        position: 'top',
	        splitLine: {lineStyle:{type:'dashed'}},
	    },
	    xAxis: {
	        type : 'category',
	        axisLine: {show: false},
	        // axisLabel: {show: false},
	        axisTick: {show: false},
	        splitLine: {show: false},
	        data : xdata
	    },
	    series : [
	        {
	            name:'收益率',
	            type:'bar',
	            stack: '总量',
	            // label: {
	            //     normal: {
	            //         show: true,
	            //         formatter: '{b}'
	            //     }
	            // },
	            data: ydata
	        }
	    ],
	    color:['#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
	};
	myChart.setOption(option);
}