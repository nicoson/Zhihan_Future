
$(document).ready(function(){
	rawData = rawData.replace(/&#34;/g, "\"");
	rawData = JSON.parse(rawData);

	productData = rawData.prod;
	baseData = rawData.base;

	for (var i=0; i<productData.length; i++) {
		var adjbaseData = generateBaseData(productData[i].data, baseData[0].data);

		var baseObj = new ratioGenerator(adjbaseData, 1);
		baseObj.init();
		var reportObj = new ratioGenerator(productData[i], 1);
		reportObj.init();
		
		reportObj.DOMGenerator(baseObj);
		$("section").append(reportObj.domEle);
	}
});





/*===============================*\
|=====  Core functions Objects ===|
\*===============================*/

function ratioGenerator(item, scope) {
	this.sheet = item.sheetname;
	this.data = item.data;
	this.scope = scope;	//	days

	this.risklessRate = 0.03;

	this.dateArr = [];			//	Date type date array
	this.dateArrStr = [];		//	formated date string array
	this.dateIndexYear = [];
	this.dateIndexMonth = [];
	this.qy = [];				//	quan yi
	this.crj = [];				//	chu ru jin
	this.fe = [];				//	fen e
	this.jz = [1];				//	jing zhi
	this.syl = [];				//	shou yi lv

	this.ratioObj = {
		bd			: "",	//	calendar days
		qjsyl		: "",	//	qu jian shou yi lv
		nhsyl		: "",	//	nian hua shou yi lv
		bdl			: "",	//	bo dong lv
		zdhc		: "",	//	zui da hui che
		xpz			: "",	//	sharpe ratio
		calmar		: "",	//	calmar ratio

		statYear	: "",	//	statistic value yearly
		statMonth	: ""	//	statistic value monthly
	};

	this.domEle = "";		//	virtual dom element for binding tables and charts

	this.init = function() {
		if(this.data.length == 0) return;
		this.dataHandler();
		this.ratioCalculator();
		// this.DOMGenerator();
	}
	
	//	deal with raw data
	this.dataHandler = function() {
		for(var i=0; i<this.data.length; i++) {
			var tempDay = new Date(1900, 0, 0, 0, 0, 0);
			tempDay.setDate(tempDay.getDate() + (parseInt(this.data[i][0]) - 1));
			this.data[i] = [tempDay, parseFloat(this.data[i][1]), parseFloat(this.data[i][2])];
			this.dateArr.push(tempDay);
			this.dateArrStr.push([tempDay.getFullYear(), tempDay.getMonth() + 1, tempDay.getDate()].join('/'));
			this.qy.push(parseFloat(this.data[i][1]));
			this.crj.push(parseFloat(this.data[i][2]));

			//	calculate the index of each year/month
			var tempYear = tempDay.getFullYear();
			var tempMonth = [tempDay.getFullYear(), tempDay.getMonth() + 1].join('/');
			if(i == 0) {
				this.dateIndexYear.push([tempYear, 0]);
				this.dateIndexMonth.push([tempMonth, 0]);
			}else{
				if(tempYear != this.dateIndexYear.slice(-1)[0][0]) {
					this.dateIndexYear.push([tempYear, i]);
				}

				if(tempMonth != this.dateIndexMonth.slice(-1)[0][0]) {
					this.dateIndexMonth.push([tempMonth, i]);
				}
			}
		}

		this.fe.push(this.crj[0]);
		for(var i=1; i<this.qy.length; i++) {
			this.crj[i] ? this.fe.push(this.fe[i-1] + this.crj[i]/this.jz[i-1]) : this.fe.push(this.fe[i-1]);
			this.jz.push(this.qy[i]/this.fe[i]);
		}

		for(var i=1; i<this.jz.length; i++) {
			this.syl.push((this.jz[i]-this.jz[i-1])/this.jz[i-1]);
		}
	}

	//	table ratio calculation
	this.ratioCalculator = function() {
		this.ratioObj.bd = (this.data.slice(-1)[0][0] - this.data[0][0])/24/3600000;	// calendar days
		this.ratioObj.qjsyl = (this.jz.slice(-1)[0] - this.jz[0])/this.jz[0];
		this.ratioObj.nhsyl = this.ratioObj.qjsyl*365/this.ratioObj.bd;
		this.ratioObj.bdl = std(this.syl);
		this.ratioObj.zdhc = maxDrawDone(this.jz);
		this.ratioObj.xpz = (avg(this.syl) - this.risklessRate/365) / std(this.syl) * Math.sqrt(365);
		this.ratioObj.calmar = Math.abs(this.ratioObj.nhsyl/this.ratioObj.zdhc);

		this.ratioObj.statYear = rateCal(this.dateIndexYear, this.jz);
		this.ratioObj.statMonth = rateCal(this.dateIndexMonth, this.jz);
	}

	//	generate DOM element
	this.DOMGenerator = function(baseData) {
		this.domEle = reportTemplate();

		//	add sheet name for report
		this.domEle.find("p.productTitle").eq(0).html(this.sheet);

		//	append ratio to DOM elements
		this.domEle.find(".period > p > span").eq(0).html(this.dateArrStr[0] + " - " + this.dateArrStr.slice(-1));

		var tableEle = this.domEle.find(".table_all tr").eq(1).find("td");
		tableEle.eq(0).html((this.ratioObj.qjsyl*100).toFixed(2)+"%");
		tableEle.eq(1).html((this.ratioObj.nhsyl*100).toFixed(2)+"%");
		tableEle.eq(2).html(this.ratioObj.bdl.toFixed(4));
		tableEle.eq(3).html((this.ratioObj.zdhc*100).toFixed(2)+"%");
		tableEle.eq(4).html(this.ratioObj.xpz.toFixed(3));
		tableEle.eq(5).html(this.ratioObj.calmar.toFixed(3));

		if(baseData) {
			tableEle = this.domEle.find(".table_all tr").eq(2).find("td");
			tableEle.eq(0).html((baseData.ratioObj.qjsyl*100).toFixed(2)+"%");
			tableEle.eq(1).html((baseData.ratioObj.nhsyl*100).toFixed(2)+"%");
			tableEle.eq(2).html(baseData.ratioObj.bdl.toFixed(4));
			tableEle.eq(3).html((baseData.ratioObj.zdhc*100).toFixed(2)+"%");
			tableEle.eq(4).html(baseData.ratioObj.xpz.toFixed(3));
			tableEle.eq(5).html(baseData.ratioObj.calmar.toFixed(3));
		}

		//	for yearly table
		for(var i=0; i<this.ratioObj.statYear.length; i++) {
			var template = "<tr><td>" + this.ratioObj.statYear[i][0] + "</td>" +
				    		"<td>" + (this.ratioObj.statYear[i][1]*100).toFixed(2) +"%</td>" +
				    		"<td>" + (this.ratioObj.statYear[i][2]*100).toFixed(2) +"%</td></tr>";
			this.domEle.find(".table_year").eq(0).append(template);
		}

		// //	for monthly table
		// for(var i=0; i<this.ratioObjstatMonth.length; i++) {
		// 	var template = "<tr><td>" + this.ratioObjstatMonth[i][0] + "</td>" +
		// 		    		"<td>" + (this.ratioObjstatMonth[i][1]*100).toFixed(2) +"%</td>" +
		// 		    		"<td>" + (this.ratioObjstatMonth[i][2]*100).toFixed(2) +"%</td></tr>";
		// 	this.domEle.find("#table_month").eq(0).append(template);
		// }


		//	generate charts
		//	for summary chart
		var chartEle = document.createElement("div");
		$(chartEle).attr("style", "width: 600px;height:400px;");
		drawChart(this.jz, this.dateArrStr, chartEle, baseData?baseData.jz:null);
		this.domEle.find(".content-item").eq(1).append(chartEle);
		//	for monthly rate
		var chartEle2 = document.createElement("div");
		$(chartEle2).attr("style", "width: 600px;height:400px;");
		drawChart2(this.ratioObj.statMonth, chartEle2);
		this.domEle.find(".content-item").eq(1).append(chartEle2);
	}
}










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

function generateBaseData(base, raw) {
	var target = base.map(function(e){return [e[0], 0, 0];});
	var baseArr = base.map(function(e){return e[0];});
	var rawArr = raw.map(function(e){return e[0];});

	if(base[0][0] <= raw.slice(-2)[0][0]){
		var pos = -1;
		var temp = [];
		if(base[0][0] < raw[0][0]) {
			var pos = baseArr.indexOf(rawArr[0]);
			temp = target.splice(0,pos);
			baseArr.splice(0,pos);
		}

		var ind = 0;
		var indList = [];

		for(var i=0; i<rawArr.length; i++) {
			ind = baseArr.indexOf(rawArr[i]);
			if(ind > -1) {
				target[ind][1] = raw[i][1];
				indList.push(ind);
			}else{
				console.warn("warning: data missing ......");
			}
		}

		var step = 0;
		var pace = 0;
		for(var i=1; i<indList.length; i++) {
			//	deal with data body
			step = indList[i] - indList[i-1];
			pace = (target[indList[i]][1] - target[indList[i-1]][1]) / step;
			for(var j=1; j<step; j++) {
				target[indList[i] - j][1] = target[indList[i]][1] - pace*j;
			}

			//	deal with head data
			if(i == 1 && indList[0] != 0) {
				for(var j=1; j<(indList[0]+1); j++) {
					target[indList[0] - j][1] = target[indList[0]][1] - pace*j;
				}
			}

			//	deal with tail data
			if(i == indList.length-1 && indList[i] < target.length-1) {
				for(var j=1; j < (target.length - indList[i]); j++) {
					target[indList[i] + j][1] = target[indList[i]][1] + pace*j;
				}
			}
		}

		temp.map(e => e[1] = target[0][1]);
		target = temp.concat(target);
	}else{
		target.map(e => e[1]=1);
	}

	target[0][2] = target[0][1];

	return {
		sheetname: "baseLine",
		data: target
	};

}

function drawChart(ydata, xdata, ele, zdata) {
	//var myChart = echarts.init(document.getElementById('chart_1'));
	var myChart = echarts.init(ele);
	for(var i=0; i<ydata.length; i++) {
		ydata[i] = parseFloat(ydata[i].toFixed(4));
		zdata[i] = parseFloat(zdata[i].toFixed(4));
	}

	var option = {
	    title: {
	        text: '净值曲线',
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
	        data: xdata
	    },
	    yAxis: {
	        type: 'value',
	        scale: true
	    },
	    series: [
	        {
	            name:'收益率（累计）',
	            type:'line',
	            data: ydata
	        }
	    ]
	};

	if(zdata){
		option.series.push(
		    {
		    	name:'基准收益率（累计）',
		    	type: 'line',
		    	data: zdata
		    }
	    );
	}

	myChart.setOption(option);
}


function drawChart2(data, ele) {
	var myChart = echarts.init(ele);
	var xdata = [],
		ydata = [];
	for(var i=0; i<data.length; i++) {
		xdata.push(data[i][0]);
		ydata.push(parseFloat(data[i][1].toFixed(4)));
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
	            itemStyle: {
	            	normal: {
	            		color: function(param) {
	            			var colorlist = ['#d48265', '#6e7074'];
	            			if(param.data >= 0)
	            				return colorlist[0];
	            			else
	            				return colorlist[1];
	            		}
	            	}
	            },
	            data: ydata
	        }
	    ],
	    color:['#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
	};
	myChart.setOption(option);
}


function reportTemplate() {
	return $(`
		    <div class="content">
		    	<p class="productTitle">Subtitle</p>
		    	<div class="content-item">
		            <div class="period">
		                <p>报告区间: <span></span></p>
		            </div>
		    		<ol>
		    			<li>
		    				<span class="table-title">统计汇总</span>
		    				<table class="table_all">
		    					<tr>
		    						<th></th>
		    						<th>区间收益率</th>
		    						<th>年化收益率</th>
		    						<th>波动率</th>
		    						<th>最大回撤</th>
		    						<th>夏普值</th>
		    						<th>calmar值</th>
		    					</tr>
		    					<tr>
		    						<th>样本</th>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    					</tr>
		    					<tr>
		    						<th>基准</th>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    						<td></td>
		    					</tr>
		    				</table>
		    			</li>
		    			<li>
		    				<span class="table-title">年度统计</span>
		    				<table class="table_year">
		    					<tr>
		    						<th>时间</th>
		    						<th>收益率</th>
		    						<th>回撤</th>
		    					</tr>
		    				</table>
		    			</li>
		<!--     			<li>
		    				<span class="table-title">月度统计</span>
		    				<table class="table_month">
		    					<tr>
		    						<th>时间</th>
		    						<th>收益率</th>
		    						<th>回撤</th>
		    					</tr>
		    				</table>
		    			</li> -->
		    		</ol>
		    	</div>
		    	<div class="content-item">
		    	<!--<div class="chart_1" style="width: 600px;height:400px;"></div>
		    		<div class="chart_2" style="width: 600px;height:400px;"></div>-->
		    	</div>
		    </div>
		`);
}