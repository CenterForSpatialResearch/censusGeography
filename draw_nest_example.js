var files = [
	d3.json("example_nesting/example_county.geojson"),
	d3.json("example_nesting/example_tract.geojson"),
	d3.json("example_nesting/example_blockGroup.geojson"),
	d3.json("example_nesting/example_block.geojson")
]
var projection = null
Promise.all(files)
.then(function(data){
	var width = 500
	var height = 500
	var padding = 20
	
	var county = data[0]
    var countyProjection= d3.geoAlbers()
            .fitExtent([[padding,padding],[width-padding,height-padding]],county)
	var svg = 	d3.select("#diagram").append("svg").attr("width",width).attr("height",height)
	
	var labelPosition={
		counties:{x:40,y:100},
		tracts:{x:40,y:120},
		blockGroups:{x:40,y:140},
		blocks:{x:40,y:160}		
	}
	
	svg.append("text").text("An example of how").attr("x",20).attr("y",60)
		.style("font-size","14px")
	
	svg.append("text").text("geographies are nested").attr("x",20).attr("y",75)
		.style("font-size","14px")
	
	for(var l in layers){
		var layer = layers[l]
		var color = colorDictionary[layer]
		drawOutline(l,data[l],countyProjection,svg,layer)
		
		var label = data[l].features[0].properties["NAMELSAD10"]
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
        .attr("fill", colorDictionary[className])
        .attr("stroke",colorDictionary[className])
		.attr("id",className)
	.attr("opacity",1)
	 .attr("stroke-width","2px")    
}