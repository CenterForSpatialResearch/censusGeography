var files = [
	d3.json("example_nesting/example_county.geojson"),
	d3.json("example_nesting/example_tract.geojson"),
	d3.json("example_nesting/example_blockGroup.geojson"),
	d3.json("example_nesting/example_block.geojson"),
	d3.json("example_nesting/example_zipcode.geojson"),
]
var projection = null
Promise.all(files)
.then(function(data){
	var width = 350
	var height = 350
	var padding = 20
	
	var county = data[0]
    var countyProjection= d3.geoAlbers()
            .fitExtent([[padding,padding],[width-padding,height-padding]],county)
	var svg = 	d3.select("#diagram").append("svg").attr("width",width).attr("height",height)
	
	var labelPosition={
		counties:{text:"County",x:30,y:75},
		tracts:{text:"Tract",x:30,y:90},
		blockGroups:{text:"Block Group",x:30,y:105},
		blocks:{text:"Block",x:30,y:120},		
		zipcodes:{text:"ZCTA",x:30,y:135}		
	}
	
	svg.append("text").text("An example of how").attr("x",20).attr("y",35)
		.style("font-size","14px")
	
	svg.append("text").text("geographies are nested").attr("x",20).attr("y",50)
		.style("font-size","14px")
	
	for(var l in layers){
		var layer = layers[l]
		if(layer!="zipcode"){
			var color = colorDictionary[layer]
			var strokeColor = "none"
		}else{
			var color = "none"
			var strokeColor = "black"
			
		}
		drawOutline(l,data[l],countyProjection,svg,layer)
	
		var label = labelPosition[layer].text//data[l].features[0].properties["NAMELSAD10"]
		if(label==undefined){
			label = "Block "+data[l].features[0].properties["BLOCKCE10"]
		}
		svg.append("circle")
		.attr("cx",labelPosition[layer].x-10).attr("cy",labelPosition[layer].y-5)
		.attr("r",5)
			.attr("fill",color)
		svg.append('text').text(label).style("font-weight",400)
			.attr("x",labelPosition[layer].x).attr("y",labelPosition[layer].y)
			.attr("fill",color)
			
		.attr("text-anchor","start")
		.style("font-size","16px")
		
	}
	
})
function drawOutline(index,data, countyProjection,svg,className){
	//console.log(data)
    var projection = d3.geoAlbers()
            .fitExtent([[10,10],[100,100]],data)
	
    var path = d3.geoPath().projection(countyProjection);
	// svg.append("text").attr("x",(index+1)*2+10).attr("y",(index+1)*2+10).text(className)

    svg.append("path")
        .attr("d", path(data))
	.attr("fill", function(){
		if(className=="zipcodes"){
			return "none"
		}
	return colorDictionary[className]	
	})
	.attr("stroke", function(){
		if(className!="zipcodes"){
			return "none"
		}
	return "black"
	})
       // .attr("stroke","#fff")
		.attr("id",className)
	.attr("opacity",1)
	 .attr("stroke-width","1px")    
}