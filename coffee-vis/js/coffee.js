var chart;
var height = 500; 
var width = 800;   
var margin = {top: 20, right: 30, bottom: 50, left: 60}; 

// Setting up the scales and axes
var xScale = d3.scaleBand().padding(0.1);  
var yScale = d3.scaleLinear();  
var xAxis = d3.axisBottom(xScale); 
var yAxis = d3.axisLeft(yScale); 

// Defining a color scale for the bars
var colorScale = d3.scaleOrdinal()
                   .domain(["Central", "East", "South", "West"])
                   .range(["#4682B4", "#FFA500", "#32CD32", "#DC143C"]); // Blue, Orange, Green, Red (Chose to match demo vid)

// This function runs when the page loads
function init() {
    chart = d3.select('#vis')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Adding the axes
    chart.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')');
    chart.append('g').attr('class', 'y axis');
}

// function for "Update" button is click
function updateClicked() {
    d3.csv('data/CoffeeData.csv').then(function(data) {
        update(data);  // Passing the data to the update function
    }).catch(function(error) {
        console.error("Error loading CSV file:", error);  // Logging any errors
    });
}

// function processes the data and updates the chart
function update(rawdata) {
    var xOption = getXSelectedOption();
    var yOption = getYSelectedOption();

    
    // Filtering out any empty objects
    rawdata = rawdata.filter(d => Object.keys(d).length > 0);
    

    // Grouping and summing the data using d3 functions
    var nestedData = d3.nest()
        .key(function(d) { return d[xOption]; })  // Group by the selected X axis option
        .rollup(function(leaves) { 
            return d3.sum(leaves, function(d) { return +d[yOption]; });  // Sum the selected Y axis option
        })
        .entries(rawdata);


    // Updating the scales with the new data
    xScale.domain(nestedData.map(function(d) { return d.key; }))
          .range([0, width]);

    yScale.domain([0, d3.max(nestedData, function(d) { return d.value; })])
          .range([height, 0]);

    // Binding the data to the bars
    var bars = chart.selectAll('.bar')
                    .data(nestedData);

    // Adding new bars
    bars.enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return xScale(d.key); })
        .attr('width', xScale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', function(d) { return colorScale(d.key); })  // Setting the bar color based on region
        .transition()
        .duration(1000)
        .attr('y', function(d) { return yScale(d.value); })
        .attr('height', function(d) { return height - yScale(d.value); });

    // Updating existing bars
    bars.transition()
        .duration(1000)
        .attr('x', function(d) { return xScale(d.key); })
        .attr('width', xScale.bandwidth())
        .attr('y', function(d) { return yScale(d.value); })
        .attr('height', function(d) { return height - yScale(d.value); })
        .attr('fill', function(d) { return colorScale(d.key); });  // Updating the bar color

    // Removing old bars
    bars.exit().transition()
        .duration(1000)
        .attr('y', height)
        .attr('height', 0)
        .remove();

    // Updating the axes with the new data
    chart.select('.x.axis').call(xAxis);
    chart.select('.y.axis').call(yAxis);
}

// Getting the selected option from the X-axis dropdown
function getXSelectedOption(){
    var node = d3.select('#xdropdown').node();
    var i = node.selectedIndex;
    return node.options[i].value;
}

// Getting the selected option from the Y-axis dropdown 
function getYSelectedOption(){
    var node = d3.select('#ydropdown').node();
    var i = node.selectedIndex;
    return node.options[i].value;
}

// Initializing the chart when the page loads
init();
