//Shows Population of different states of US by age group
//Mouseovering on grouped  bar shows tool tip containing its pouplation size and age year
//Add color legend show diiferent age size with different colors

var outerWidth = 700;
var outerHeight = 450;
var margin = {top: 30, bottom: 40,left: 100, right: 80};
var innerHeight = outerHeight - margin.top - margin.bottom;
var innerWidth = outerWidth - margin.left - margin.right;
var barPadding = 0.3;
var xColumn = 'state';
var yColumn = 'population';
var colorColumn = 'year';
var layerColumn = colorColumn;

//Adding svg element
var svg = d3.select('.container').append('svg')
	           .attr('height',outerHeight)
	           .attr('width',outerWidth);

//Adding g element
var g = svg.append('g')
	         .attr("transform","translate(" + margin.left + "," + margin.top + ")");

	//Adding xAxis Group element
var xAxisG = g.append('g')
               .attr('class','x axis')
               .attr('transform','translate(0,'+ innerHeight  +')');

//Adding yAxis Group element
var yAxisG = g.append('g')
              .attr('class','y axis');

//Adding legend
var colorLegendG = g.append("g")
                    .attr("class", "color_legend")
                    .attr("transform","translate(450, 40)");

// Set xScale ordinal,yScale linear,colorScale ordinal
var xScale = d3.scale.ordinal().rangeBands([0,innerWidth],barPadding);
var yScale = d3.scale.linear().range([innerHeight,0]);
var rScale = d3.scale.ordinal()
               .range(["#99d8c9", "#2ca25f", "#bcbddc", "#756bb1","#ffeda0","#feb24c","#f03b20"]);

var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
                  .outerTickSize(0);

var yAxis = d3.svg.axis().scale(yScale).orient('left')
                 .outerTickSize(0)
                 .ticks(5)
                 .tickFormat(d3.format("s"))

var colorLegend = d3.legend.color()
                    .scale(rScale)
                    .shapePadding(4)
                    .shapeHeight(15)
                    .shapeWidth(15);

//Adding tool tip
var tip = d3.tip()
            .attr('class', 'd3_tip')
            .html(function(d) {
             var text = "<strong>Population:</strong>  <span style='color:white'>" + d.population + "</span><br>";
             text += "<strong>YEAR:</strong> <span style='color:white'>" + d.year + "</span><br>";
            return text;
})

function update(data) {

//Adding Layers 
var nested = d3.nest()
               .key(function(d){
                return d[layerColumn]; })
               .entries(data)

var stack = d3.layout.stack()
              .y(function(d){
                return d[yColumn];
              })
              .values( function(d){
                return d.values;
              })

var layers = stack(nested);

xScale.domain(layers[0].values.map(function(d){ return d[xColumn]}));

//Each call return max values of age years in different states
yScale.domain([
      0,
      d3.max(layers, function (layer){
        return d3.max(layer.values, function (d){
          return d.y;
        });
      })
    ]);

rScale.domain(layers.map(function (layer){
return layer.key; }));
    
//Adding xAxis and yAxis properties to to xAxis and yAxis Group elements
xAxisG.call(xAxis);
yAxisG.call(yAxis);
g.call(tip);

//Adding LayerGroup for each age years
var layerG = g.selectAll('.layer').data(layers);
                 layerG.enter().append('g').attr('class','layer');
                 layerG.exit().remove();
                 layerG.style('fill',function(d){ return rScale(d.key); });
    
// Selecting,data binding,enter and appending bars with layers
// MouseOut and MouseOver Events for tool tip show and hiding
var bars = layerG.selectAll('rect').data(function (d){ return d.values; });
var barWidth = xScale.rangeBand() / rScale.domain().length; 
               bars.enter().append('rect')
               bars.exit().remove();
bars.attr("x", function (d, i, j){
    return xScale(d[xColumn]) + barWidth * j; })
        .attr('y', function(d){ return yScale(d.y); })
        .attr('width',barWidth)
        .attr('height',function(d){ return innerHeight - yScale(d.y); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
         colorLegendG.call(colorLegend);
                   
}

function type(d) {
d.population = +d.population;
return d;
}

d3.csv("State.csv", type, update);
