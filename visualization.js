//'use strict';

// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width")
    height = +svg.attr("height") 
    active = d3.select(null);    
   
// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth1()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var colorScheme = d3.schemeReds[7];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([ 0, 1, 2, 3, 4, 5, 7])
    .range(colorScheme);

// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Happiness Index");
var labels = ['0', '1', '2', '3', '4', '5', '6', '7+'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
svg.select(".legendThreshold")
    .call(legend);

// zoom the map
var zoom = d3.zoom()
    .on("zoom", zoomed);

var initialTransform = d3.zoomIdentity
    .translate(0,0)
    .scale(1);
   
svg.call(zoom)
    .call(zoom.transform, initialTransform); 

// Load external data and boot
d3.queue()
    .defer(d3.json, "./world-110m.geojson")
    .defer(d3.csv, "./Happiness2018.csv",  function(d) { data.set(d.code, +d.points); })
    .await(ready);

function ready(error, topo) {
if (error) throw error;

// Draw the map
svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(topo.features)
    .enter().append("path")
        .attr("fill", function (d){
        // Pull data for this country
        d.points = data.get(d.id);
        // Set the color
        return colorScale(d.points);
        })
        .attr("d", path)
        .style("stroke", "white") 
        .on("click", clicked)
        .attr("class", "feature")
        

// tooltip mouse events
      
        .on("mouseover", function(){
          return tooltip.style("display", null);})
        .on("mousemove", function(d){ 
          var xPos = d3.mouse(this)[0] - 15;
          var yPos = d3.mouse(this)[1] - 55;
          tooltip.attr("transform", "translate(" + xPos + "," + yPos + ")"); 
          tooltip.select("text").text("The index is:" + d.points + " for  " + d.id);
        })
        .on("mouseout", function(){
          return tooltip.style("display", "none");
        })
       

// adding tooltip here
var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");   

    tooltip.append("text")
           .style("fill", "blue");
        
}       
// zoom in
function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  var transform = d3.zoomIdentity
    .translate(translate[0], translate[1])
    .scale(scale);

  svg.transition()
    .duration(750)
    .call(zoom.transform, transform);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
    .duration(750)
    .call(zoom.transform, initialTransform);
}

function zoomed() {
  var transform = d3.event.transform; 
  svg.style("stroke-width", 2 / transform.k + "px");
  svg.append("g").attr("transform", transform);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


