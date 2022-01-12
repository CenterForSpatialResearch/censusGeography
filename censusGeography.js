var geos =["counties","tracts","blockGroups","blocks"]
var columns = ["SE_T002_001","SE_T002_002","SE_T002_006"]
var files = []
var root = "histogram/"
var chartList = []
var dataDictionary = {"SE_T002_001":"Total Population",
            "SE_T002_002":"Population Density (Persons Per Square Mile)",
            "SE_T002_006":"Land Area in Square Miles"}
			
	var totals = {
		SE_T002_001:
			{blocks:11453047,
			blockGroups:220335,
			tracts:74003,
			counties:3222},
		SE_T002_002:
			{blocks:11453047,
			blockGroups:220335,
			tracts:74003,
			counties:3222},
		SE_T002_006:
			{blocks:11453047,
			blockGroups:220335,
			tracts:74003,
			counties:3222}	
	}
var zeros ={
	SE_T002_001:
		{blocks:4897549,
		blockGroups:930,
		tracts:576,
		counties:0},
	SE_T002_002:
		{blocks:4897549,
		blockGroups:930,
		tracts:576,
		counties:0},
	SE_T002_006:
		{blocks:4897549,
		blockGroups:930,
		tracts:576,
		counties:0}
}

for(var g in geos){
	var geo = geos[g]
	for(var c in columns){
		var column = columns[c]
		var fileName = geo+"_"+column+".csv"
		//console.log(fileName)
		files.push(d3.csv(root+fileName))
		chartList.push([geo,column])
	}
}
var rangeMarkers = {
	"SE_T002_001":{
		counties:[[0,99999],[100000,1000000]]
	}
}

function getOutliers(data,limit){
	var outliers = 0
	for(var i in data){
		if(i>limit){
			outliers+=parseInt(data[i]["quantity"])
			// if(data[i]["gids"].length>0 && data[i]["gids"]!="[]"){
// 				outliers.push(data[i]["gids"])
// 				//console.log(outliers)
// 			}
		}
	}
	return outliers
}

Promise.all(files)
.then(function(d){
	var xStops = {
		"SE_T002_001":{counties:50,tracts:180,blockGroups:80,blocks:31},
		"SE_T002_002":{counties:240,tracts:100,blockGroups:80,blocks:31},
		"SE_T002_006":{counties:60,tracts:60,blockGroups:40,blocks:15}
	}
	//
	 //console.log(chartList)
	// console.log(d)
	
	for(var c in chartList){
		//console.log(chartList[c][0])
		barGraph(d[c],chartList[c][1],chartList[c][0],xStops[chartList[c][1]][chartList[c][0]])	
		var tops = tops_bottoms[chartList[c][0]+"_"+chartList[c][1]+"_top"]
		var bottoms = tops_bottoms[chartList[c][0]+"_"+chartList[c][1]+"_bottom"]
		
		drawList(bottoms,chartList[c][0],chartList[c][1],"#top")
		drawList(tops,chartList[c][0],chartList[c][1],"#bottom")
	}		
})
function drawList(list,geo,column,divName){
	//console.log(geo+"_list",column)	
	var listDiv = d3.select("#"+geo+"_"+column).append("div").attr("id",divName)
	if(divName=="#top"){
		listDiv.append("div").html("What do "+geo+" look like when they have a lot of residents?").attr("class","list_title")
	}else{
		listDiv.append("div").html("When they have a few?").attr("class","list_title")
		
	}
	
	for(var i in list.slice(0,10)){
		//console.log(geo,column)
		var listItem = listDiv.append("div").attr("class","list_item")
		//console.log(list[i])
		listItem.append("div")
		.attr("class","list_image")
		.html("<img src=\"test.png\">")
		// .append("svg:image")
// 		.attr("xlink:href","test.png")
        //
        // .attr("width", 100)
        // .attr("height", 100)
		
		listItem.append("div")
		.attr("class","list_label")
		.html(list[i].name+"<br>"+dataDictionary[column]+": "+list[i].value)
	}
}
function barGraph(data,column,geo,maxXbin){
//	console.log(maxXbin)
	var outliers = getOutliers(data,maxXbin)
	//console.log(outliers)
	var height = 200
	var width = 400
	var padding = 55
	

	var yMax =d3.max(data, function(d){return parseInt(d.quantity)})
	var yMin =d3.min(data, function(d){return parseInt(d.quantity)})
	//console.log(yMax,yMin)
	
	var xMax =parseFloat(data[data.length-1].endValue)
	var xMin =1
	
	var xScale =d3.scaleLinear().domain([0,maxXbin]).range([0,width])
	var yScale =d3.scaleLinear().domain([0,yMax]).range([0,height])
	var yScaleInvert =d3.scaleLinear().domain([0,yMax]).range([height,0])
	var interval = parseFloat(data[1]["startValue"])
	
	var xAxis = d3.axisBottom().scale(xScale)
	.tickFormat(function(d){
		if(d*interval==1000000){
			return "1 million"
		}else if(d*interval<5000){
			return d*interval
		}
		return (d*interval)/1000+"k"
	})
	.ticks(10)
	var yAxis = d3.axisLeft().scale(yScaleInvert).ticks(5)
	.tickFormat(function(d){
		if(d/1000000>=.5){
			return d/1000000+ " million"
		}
		return d
	})
	
	var svg = d3.select("#"+geo+"_chart")
		.append("div").attr("id",geo+"_"+column)
		.append("svg")
		.attr("width",width+padding*2)
		.attr("height",height+padding*2)
	
	svg.append("text").text(dataDictionary[column]+" for "+toTitleCase(geo))
	.attr("x",0).attr("y",25)
	.style("font-size","16px")
	
	svg.append("text").text(toTitleCase(geo)+" "+dataDictionary[column])
	.attr("x",width/2).attr("y",height+padding*1.6).attr('text-anchor',"middle")
	.attr("fill",colorDictionary[geo])
	
	svg.append("text").text("# of "+toTitleCase(geo)).attr("x",0).attr("y",45)
	.attr("fill",colorDictionary[geo])
	//.attr("transform","rotate(90)")
	
	d3.select("#"+geo+"_chart").append("div")
	.html(
		function(){
			var text = "<i><strong>Off the chart:</strong></i><br>"
	+Math.round(outliers/totals[column][geo]*10000)/100+"% ("+outliers+") "+geo+" have "
	+dataDictionary[column]+" that is higher than "+maxXbin*interval+"."
			
			if(zeros[column][geo]>0){
				text+="<br>"+zeros[column][geo]+" "+geo+" have zero "+dataDictionary[column]+"."
			}
			
			return text
			
		}
	)
	// .attr("text-anchor","end")
// 	.attr("x",width+padding).attr("y",height/2)
	
	svg.append("g").attr("transform","translate("+padding+","+(padding+height)+")")
	.call(xAxis)
	
	svg.append("g")
	.attr("transform","translate("+padding+","+padding+")")
	.call(yAxis)
	
	svg.selectAll(".bars")
		.data(data)
		.enter()
		.append("rect")
		.attr("id","bars")
		.attr("x",function(d,i){return xScale(i)})
		.attr("y",function(d,i){return height- yScale(d.quantity)})
		.attr("height",function(d,i){
			if(i>maxXbin-1){
				return 0
			}
				return yScale(d.quantity)
		})
		.attr("width",width/maxXbin-1)
		.attr("fill",colorDictionary[geo])
		.attr("transform","translate("+padding+","+padding+")")
		.attr("opacity",.8)
		.on("mouseover",function(d){
			d3.select(this).attr("opacity",1)
			var text = d.quantity+" "+geo+" have between "+d.startValue+"-"+d.endValue+" "+dataDictionary[column]
			d3.select("#tooltip")
			.style("visibility","visible")
			.style("left",window.event.clientX+20+"px")
			.style("top",window.event.clientY+"px")
			.html(text)
		})
		.on("mouseout",function(d){
			d3.select(this).attr("opacity",.8)

			d3.select("#tooltip")
			.style("visibility","hidden")
		})
}
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
function histogram(data,column){
	var height = 300
	var width = 1500
	var padding = 40
	var max =d3.max(data, function(d){return parseInt(d[column])})
	var min =d3.min(data, function(d){return parseInt(d[column])})
	var numBins = 100
	var interval = max/numBins
	console.log(max,min)
	var histogram = d3.histogram()
 	    .value(function(d) { return parseFloat(d[column]); })   // I need to give the vector of value
 	    .domain([min,max])  // then the domain of the graphic
 	    .thresholds(numBins); // then the numbers of bins

// 	// And apply this function to data to get the bins
 	var bins = histogram(data);
 //	console.log(bins)
	var maxLength = d3.max(bins, function(d){return d.length})
	//console.log(maxLength)
	
	var yScale = d3.scaleLinear().domain([0,maxLength]).range([0,height])
	var xScale = d3.scaleLinear().domain([0,bins.length]).range([0,width])
	
	var yAxis = d3.axisLeft().scale(yScale).ticks(10)
	var xAxis = d3.axisBottom().scale(xScale).ticks(10).tickFormat(function(d,i){return i*interval})
	
	var svg = d3.select("#charts")
		.append("svg")
		.attr("width",width+padding*2)
		.attr("height",height+padding*2)

	svg.selectAll(".bars")
	.data(bins)
	.enter()
	.append("rect")
	.attr("id","bars")
	.attr("x",function(d,i){return xScale(i)})
	.attr("y",function(d,i){return height- yScale(d.length)})
	.attr("height",function(d,i){return yScale(d.length)})
	.attr("width",width/bins.length-1)
	.attr("fill","black")
	.attr("transform","translate("+padding+","+padding+")")
	
	var yG = svg.append("g").call(yAxis)//.attr("transform","translate(20,10)")
	var xG = svg.append("g").call(xAxis)//.attr("transform","translate(20,10)")
	
	yG.attr("transform","translate("+(padding-1)+","+padding+")")
	xG.attr("transform","translate("+padding+","+(height+padding)+")")
//
}
