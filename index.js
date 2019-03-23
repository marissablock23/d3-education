  Promise.all([
    d3.csv('data/bench.csv'),
    d3.csv('data/returns.csv'),
    d3.csv('data/returns2.csv')
  ])
  .then(data => {
      const quantityData = data[0].filter(d => d.gdp !== 'NA' && d.yrs !== 'NA');
      const qualityData = data[0].filter(d => d.gdp !== 'NA' && d.score !== 'NA');
      const returnsData = data[1];
      const returnsCrossData = data[2];
      return [ quantityData, qualityData, returnsData, returnsCrossData ];
    })
  .then(data => myVis(data));

function createBenchmark(data, xVar, yVar, addedParams){
  d3.selectAll('.checkbox')
    .style('opacity', '.4');
  document.getElementById('regional').disabled = true;

  const margin = {top: 50, right: 50, bottom: 50, left: 50},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
  // const padding = 50;

  // Define max
  const xMax = d3.max(data, (d) => {
    return d[xVar]
  });

  const yMax = d3.max(data, (d) => {
    return d[yVar]
  });

  // Define X Scale
  const xScale = d3.scaleLinear()
    //.base(Math.E)
    .domain([4, xMax])
    .range([0, width])
    .nice();

  // TERNARY SAME AS IF-ELSE STATEMENT
  const yMin = (yVar === 'score') ? 250 : 0;

  // Define Y Scale
  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0])
    .nice();

  // Map scales to axes
  const xAxis = d3.axisBottom(xScale)
      .ticks(5);

  const yAxis = d3.axisLeft(yScale);


  // Define event handler mouseover
  function mouseOverIn (d) {
    d3.select(this)
      // .attr('r', 10)
      .style('fill', 'steelblue');

    // Specify where to put country label
    svg.append('text')
    .attr('class', 'label')
    .attr('x', xScale(d[xVar]) - 10)
    .attr('y', yScale(d[yVar]) - 15)
    .text(function () {
      return d.country;
    });
  }

  function mouseOverOut(d) {
    d3.select(this)
      // .attr('r', 5)
      .style('fill', '#bfb5b2');
    d3.select('.label')
      .remove();
  }

  // Define svg
  const svg = d3.select(".benchmark-container")
    .append("svg")
    .attr("class", yVar)
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // Map data to circles + use scales to map to variables
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr('cx', 0)
    .attr("cy", d => {
      return yScale(d[yVar]);
    })
    .attr('r', 1)
    .attr('class', 'dot')

  // Group together elements of axes
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  svg.append("g")
    .call(yAxis);

  // x Axis Title - Same for both
  svg.append('text')
    .attr('class', 'text')
    .attr('y', height + 35)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('Log of GDP per capita, (constant 2010 US$), 2017');

  // y Axis Title - Differs
  svg.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height/2)
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
      return 'Years of Schooling, 2010'} 
      else {
        return 'Harmonized Test Scores, 2017'};})

  // Source
  svg.append('text')
    .attr('class', 'text source')
    .attr('y', height + 45)
    .attr('x', 0)
    .style('text-anchor', 'right')
    .text('Source: World Development Indicators, World Bank Education Statistics')

  // Title - Differs
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', -10)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
        return 'Benchmarking the Quantity of Schooling'} 
      else {
        return 'Benchmarking the Quality of Schooling'};
    });

  // Note if country does not have data
  // should only display if above is true
  svg.append('text')
    .attr('class', yVar + '-note')
    .attr('y', margin.top/2)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('*Data not available for selected country')

  svg.selectAll('.dot')
    .data(data)
    .transition()
    .duration(1500)
    .attr("cx", d => {
      return xScale(d[xVar]);
    })
    .attr("cy", d => {
      return yScale(d[yVar]);
    })
    .attr("r", 5)
    .attr('class', 'dot')


  svg.selectAll('circle')
    .on('click', (data) => {
      document.getElementById('incgrp').checked = false;
      document.getElementById('regional').checked = false;
      triggerAllCharts(addedParams, data.country);
    })

    .on('mouseover', mouseOverIn)
    .on('mouseout', mouseOverOut);

  let regionChecked = false;
  let incomeChecked = false;

  d3.select('#regional')
    .on('change', () => {
      regionChecked = !regionChecked;
        toggleComparators(addedParams, 'region', regionChecked, incomeChecked)
    });

  d3.select('#incgrp')
    .on('change', () => {
      incomeChecked = !incomeChecked;
      toggleComparators(addedParams, 'incgrp', regionChecked, incomeChecked)
    });

}

function toggleComparators(data, type, regionChecked, incomeChecked){

  if(!regionChecked && !incomeChecked){
    d3.selectAll('.comparator-dot')
      .classed('comparator-dot', false);
    return;
  }

  const selectedCountry = d3.selectAll('.selected-dot').data();
  const countryName = selectedCountry[0].country;
  const selectedIncgrp = (selectedCountry[0] && selectedCountry[0]['incgrp']) ? selectedCountry[0]['incgrp'] : null;
  const selectedRegion = (selectedCountry[0] && selectedCountry[0]['region']) ? selectedCountry[0]['region'] : null;

  let filteredYrs;
  let filteredScore;

  selectedCountry.forEach(selected => {
    // IF REGION GOT CHECKED AND INCOME GROUP IS ALREADY CHECKED
    if(type === 'region' && regionChecked === true && incomeChecked === true){
      console.log('Region: true (checked), Income: true');
      if(selected.yrs){
        filteredYrs = data[2].filter(d => (d.region === selectedRegion) && (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }
      if(selected.score) {
        filteredScore = data[3].filter(d => (d.region === selectedRegion) && (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }
    // IF REGION GOT CHECKED AND INCOME GROUP IS NOT CHECKED
    } else if(type === 'region' && regionChecked === true && incomeChecked === false){
      console.log('Region: true (checked), Income: false');
      if(selected.yrs){
        filteredYrs = data[2].filter(d => (d.region === selectedRegion) && d.country !== countryName);
      }
      
      if(selected.score) {
        filteredScore = data[3].filter(d => (d.region === selectedRegion) && d.country !== countryName);
      }
    }

    // IF INCOME GROUP GOT CHECKED AND REGION IS ALREADY CHECKED
    if(type === 'incgrp' && incomeChecked === true && regionChecked === true){
      console.log('Region: true, Income: true (checked)');
      if (selected.yrs) {
        filteredYrs = data[2].filter(d => (d.region === selectedRegion) && (d.incgrp === selectedIncgrp) && d.country !== countryName);
      } 
      
      if(selected.score) {
        filteredScore = data[3].filter(d => (d.region === selectedRegion) && (d.incgrp === selectedIncgrp) && d.country !== countryName);
      } 
    // IF INCOME GROUP GOT CHECKED AND REGION IS NOT CHECKED
    } else if(type === 'incgrp' && incomeChecked === true && regionChecked === false){
      console.log('Region: false, Income: true (checked)');
      if (selected.yrs) {
        filteredYrs = data[2].filter(d => (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }

      if(selected.score) {
        filteredScore = data[3].filter(d => (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }
    }

    // IF REGION GOT UNCHECKED AND INCOME GROUP IS ALREADY CHECKED
    if(type === 'region' && regionChecked === false && incomeChecked === true){
      console.log('Region: false (unchecked), Income: true');
      if(selected.yrs){
        filteredYrs = data[2].filter(d =>  (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }

      if(selected.score) {
        filteredScore = data[3].filter(d => (d.incgrp === selectedIncgrp) && d.country !== countryName);
      }
    // IF INCOME GROUP GOT UNCHECKED AND REGION IS ALREADY CHECKED
    } else if(type === 'incgrp' && incomeChecked === false && regionChecked === true){
      console.log('Region: true, Income: false (unchecked)');
      if(selected.yrs){
        filteredYrs = data[2].filter(d => (d.region === selectedRegion) && d.country !== countryName);
      }

      if(selected.score) {
        filteredScore = data[3].filter(d => (d.region === selectedRegion) && d.country !== countryName);
      } 
    }

  });

  d3.selectAll('.dot')
    .classed('comparator-dot', d => {
      if(filteredYrs){
        if(d.yrs){
          if (filteredYrs.find(yrsObj => yrsObj === d)) {
            return true;
          }
        }
      }

      if(filteredScore){
        if(d.score){
          if (filteredScore.find(scoresObj => scoresObj === d)) {
            return true;
          }
        }
      }
    });
  
}



function createBar(data) {

  if(data.length < 1){
    return;
  }

  const margin = {top: 50, right: 50, bottom: 50, left: 50},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  d3.selectAll('svg.bar').remove();

  const selectedCountry = data;

  const years = selectedCountry.map(d => d.year);

  const yMaxBar = d3.max(selectedCountry, (d) => {
    return d.overall;
  });

  const xExtentBar = d3.extent(selectedCountry, (d) => {
    return d.year;
  });

  // Define Y Scale
  const yScaleBar = d3.scaleLinear()
    .domain([0, yMaxBar + 5])
    .range([height, margin.right])
    .nice();

  const xMaxBar = d3.max(selectedCountry, (d) => {
    return d.year;
  });

  const xMinBar = d3.min(selectedCountry, (d) => {
    return d.year;
  });

 // REFERENCED THE FOLLOWING URL FOR GETTING X-AXIS SCALE
 // https://plnkr.co/edit/HQz1BL9SECFIsQ5bG8qb?p=preview
  const xScaleBar = d3.scaleBand()
    .rangeRound([0, width])
    .domain(years)
    .paddingInner(0.05);

  // Map scales to axes
  const yAxisBar = d3.axisLeft(yScaleBar);
  const xAxisBar = d3.axisBottom(xScaleBar).tickFormat(d3.timeFormat("%Y"));

  // Define svg
  const svgbar = d3.select('.barchart-container')
    .append('svg')
    .attr('class', 'bar')
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Map data to bars + use scales to map to variables
  const bars = svgbar.selectAll("rect")
    .data(selectedCountry)
    .enter()
    .append('rect')
    .attr('class', 'rect')
    .attr("x", (d) => {
      return xScaleBar(d.year);
      })
    .attr("y", (d) => {
      return yScaleBar(0);
      })
    .attr("width", xScaleBar.bandwidth())
    .attr("height", (d) => {
      return yScaleBar(0) - yScaleBar(0);
    });

  svgbar.selectAll('rect')
    .transition()
    .duration(2500)
    .attr("y", (d) => {
      return yScaleBar(d.overall);
    })
    .attr("height", (d) => {
      return yScaleBar(0) - yScaleBar(d.overall);
    })


  // g groups together all elements of axis - ticks, values, etc.
  svgbar.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxisBar)
    .selectAll("text")
    .attr("y", 9)
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  svgbar.append("g")
    .call(yAxisBar);

  // x Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('y', height + 35)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Year');

  // y Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -(margin.right - 25))
    .attr('x', -(height/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling');

  // Source
  svgbar.append('text')
    .attr('class', 'text source')
    .attr('y', height + 45)
    .attr('x', 0)
    .style('text-anchor', 'right')
    .text('Source: Psacharopoulos & Patrinos, 2018');

  // Title
  svgbar.append('text')
    .attr('class', 'text title')
    .attr('y', 20)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling over time: ' + selectedCountry[0].country);
  
}

// Inspiration: https://www.d3-graph-gallery.com/graph/lollipop_horizontal.html
// https://bl.ocks.org/tlfrd/e1ddc3d0289215224a69405f5e538f51
function createLollipopChart(data, selectedCountry) {
  if(data.length < 1){
    return;
  }

  // set the dimensions and margins of the graph
  const margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  d3.selectAll('svg.lollipop').remove();

  // append the svg object to the body of the page
  const svg = d3.select(".lollipop-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr('class', 'lollipop')
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // X Max
  const xMaxLollipop = d3.max(data, (d) => {
    return d.value;
  });

  // X axis
  const x = d3.scaleLinear()
    // .domain([0, 20])
    .domain([0, xMaxLollipop + 5])
    .range([ 0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.type; }))
    .padding(1);

  svg.append("g")
    .call(d3.axisLeft(y));

  // Define event handler mouseover
  function mouseOverIn (d) {
    d3.select(this)
      // .attr('r', 10)
      .style('fill', 'steelblue');

    // Specify where to put country label
    svg.append('text')
    .attr('class', 'label')
    .attr('x', x(d.value) - 100)
    .attr('y', y(d.type) - 15)
    .text(function () {
      return "Source: " + d.source;
    });

    svg.append('text')
      .attr('class', 'sourcelabel')
      .attr('x', x(d.value) - 100)
      .attr('y', y(d.type) - 25)
      .text(function () {
        return "Year: " + new Date(d.year).getFullYear();
    });
  }

  function mouseOverOut(d) {
    d3.select(this)
      // .attr('r', 5)
      .style('fill', '#69b3a2');
    d3.select('.label')
      .remove();
    d3.select('.sourcelabel')
      .remove();
  }

  // TRANSITION
  // Lines and circles start at 0 on y axis
  svg.selectAll(".line")
    .data(data)
    .enter()
    .append('line')
      .attr('class', 'line')
      .attr('x1', x(0))
      .attr('x2', x(0))
      .attr("y1", function(d) { return y(d.type); })
      .attr("y2", function(d) { return y(d.type); })
      .attr("stroke", "black");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", x(0))
      .attr("cy", function(d) { return y(d.type); })
      .attr("r", "4")
      .style("fill", "#69b3a2")
      .style('z-index', 99)
      .attr("stroke", "black")
      .on('mouseover', mouseOverIn)
      .on('mouseout', mouseOverOut);

  // Transition circles and lines to their positions given by the data
  svg.selectAll('circle')
      .transition()
      .duration(3000)
      .attr("cx", function(d) { return x(d.value); });

  svg.selectAll('.line')
      .transition()
      .duration(3000)
      .attr("x1", function(d) { return x(d.value); });

  // Title
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', -30)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('Disaggregated Returns to Schooling,');

  // Subtitle
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', -10)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('most recent year: ' + data[0].country);

  // x Axis Title
  svg.append('text')
    .attr('class', 'text')
    .attr('y', height + 35)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling');

  // Source
  svg.append('text')
    .attr('class', 'text source')
    .attr('y', height + 45)
    .attr('x', 0)
    .style('text-anchor', 'right')
    .text('Source: Psacharopoulos & Patrinos, 2018');

  // Define global averages
  const globalAverages = [
    {type: "overall", value: 8.8},
    {type: "primary", value: 7.8},
    {type: "secondary", value: 10.5},
    {type: "higher", value: 12.9},
    {type: "male", value: 7.9},
    {type: "female", value: 9.6}
  ]; 

  d3.select('#global')
    .on('change', addGlobalAverages);


  d3.selectAll('.checkbox-lollipop')
    .style('opacity', '1');
  document.getElementById('global').disabled = false;

  let globalChecked = false;

  function addGlobalAverages(){
    console.log(globalAverages);
    globalChecked = !globalChecked;

    const yMaxBar = d3.max(selectedCountry, (d) => {
      return d.overall;
    });

    // Define Y Scale
  const yScaleBar = d3.scaleLinear()
    .domain([0, yMaxBar + 5])
    .range([height, margin.right])
    .nice();

    if (globalChecked){
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", x(0))
          .attr("cy", function(d) { return y(d.type); })
          .attr("r", "4")
          .style("fill", "#69b3a2")
          .attr("stroke", "black")

      svg.selectAll('.avg-data')
        .data(globalAverages)
        .enter()
        .append('circle')
          .attr('class', 'avg-data')
          .attr('cx', d => x(0))
          .attr('cy', d => y(d.type))
          .attr("r", "4")
          .style("fill", "#c7bbc9")
          .attr("stroke", "black")
          .transition()
          .duration(2000)
          .attr("cx", function(d) { return x(d.value); });

  // Line
      svg.selectAll("line")
        .data(data)
        .enter()
        .append("line")
          .attr('x1', x(0))
          .attr('x2', x(0))
          .attr("y1", function(d) { return y(d.type); })
          .attr("y2", function(d) { return y(d.type); })
          .attr("stroke", "black");

      svg.selectAll('.line-avg')
        .data(globalAverages)
        .enter()
        .append('line')
          .attr('class', 'line-avg')
          .attr('x1', d => x(0))
          .attr('x2', d => x(0))
          .attr("y1", function(d) { return y(d.type); })
          .attr("y2", function(d) { return y(d.type); })
          .attr("stroke", "black")   
          .transition()
          .duration(2000)
          .attr("x1", function(d) { return x(d.value); });


    // Legend
    // First, add rectangles, then add text labels
    const legend = svg.append("g");

      legend.append("circle")
        .attr("class", "country-circle")
        .attr("cy", 5)
        .attr("cx", width/5)
        .attr("r", "4")
        .style("fill", "#69b3a2")
        .attr("stroke", "black");

      legend.append("text")
        .attr("class", "text-legend")
        .attr("y", 10)
        .attr("x", (width/5) + 15)
        .text("Selected Country");


      legend.append("circle")
        .attr("class", "country-circle")
        .attr("cy", 5)
        .attr("cx", width/1.5)
        .attr("r", "4")
        .style("fill", "#c7bbc9")
        .attr("stroke", "black");

      legend.append("text")
        .attr("class", "text-legend")
        .attr("y", 10)
        .attr("x", (width/1.5) + 15)
        .text("Global Average");

      // Add global average lines
      // Pre-2000 Average
      d3.selectAll('.bar')
        .append('g')
        .attr('transform', 'translate(0, ' + yScaleBar(8.7) + ')')
        .append('line')
          .attr('class', 'avg-data')
          .transition()
          .duration(1500)
          .attr('x1', 50)
          .attr('x2', width + 60)
          // .attr('y1', yScaleBar(8.7))
          // .attr('y2', yScaleBar(8.7))
          .style("stroke", "#bfb5b2")
          .style('stroke-dasharray', '4,4')
          .style("stroke-width", "2px")
          .attr("data-legend", 'Pre-2000')

        // Post-2000 Average
      d3.selectAll('.bar')
        .append('g')
        .attr('transform', 'translate(0, ' + yScaleBar(9.1) + ')')
        .append('line')
          .attr('class', 'avg-data')
          .transition()
          .duration(1500)
          .attr('x1', 50)
          .attr('x2', width + 60)
          // .attr('y1', yScaleBar(9.1))
          // .attr('y2', yScaleBar(9.1))
          .style("stroke", "#2e4045")
          .style('stroke-dasharray', '2,2')
          .style("stroke-width", "2px")
          .attr("data-legend", 'Post-2000')

        // Legend
        // First, add rectangles, then add text labels
      const lineLegend = d3.selectAll('.bar').append('g');

      lineLegend.append("line")
        .attr("class", "country-line")
        .attr("x1", 100)
        .attr("x2", 120)
        .attr('y1', 85)
        .attr('y2', 85)
        .style("fill", "#69b3a2")
        .style("stroke", "#2e4045")
        .style('stroke-dasharray', '2,2')
        .style("stroke-width", "2px")
        .attr("data-legend", 'Post-2000');

      lineLegend.append("text")
        .attr("class", "text-legend")
        .attr("y", 90)
        .attr("x", 125)
        .text("Post-2000");


      lineLegend.append("line")
        .attr("class", "country-line")
        .attr("x1", 240)
        .attr("x2", 260)
        .attr('y1', 85)
        .attr('y2', 85)
        .style("fill", "#c7bbc9")
        .attr("stroke", "black")
        .style("stroke", "#bfb5b2")
        .style('stroke-dasharray', '4,4')
        .style("stroke-width", "2px")
        .attr("data-legend", 'Pre-2000')

      lineLegend.append("text")
        .attr("class", "text-legend")
        .attr("y", 90)
        .attr("x", 265)
        .text("Pre-2000");

        } else {

          d3.selectAll('.avg-data')
            .transition()
            .duration(1500)
            .attr('cx', width)
            .style('opacity', 0)
            .remove();

          d3.selectAll('.line-avg').remove();
          d3.selectAll('.text-legend, .country-circle, .country-line').remove();

      }

  }

}

function updateBenchmark(country) {
  d3.selectAll('.checkbox')
    .style('opacity', '1');
  document.getElementById('regional').disabled = false;

  d3.selectAll('.selected-dot')
    .classed('selected-dot', false)
    .transition()
    .duration(1000)
    .attr('r', 5)
    .style('opacity', .45)

  d3.selectAll('.dot')
    .classed('selected-dot', (data) => {
      if (data.country === country) {
        return true;
      } else {
        return false;
      }
    });

  d3.selectAll('.selected-dot')
    .transition()
    .duration(1000)
    .attr('r', 8)
    .style('opacity', 1);

  const selected = d3.selectAll('.selected-dot').data();
  console.log(selected);

  // INITIALIZE AN EMPTY OBJECT WITH PROPERTIES 'YRS' AND 'SCORE', SET THEM TO FALSE, 
  // SO THAT WHEN WE LOOP OVER THE CONST 'SELECTED', WE SET THE PROPERTIES OF 'YRS' 
  // AND 'SCORE' TO TRUE OR FALSE SO THAT WE KNOW WHICH SCATTER PLOT TO DISPLAY THE 'NOTE-VISIBLE' CLASS
  let availableData = {
      yrs: false,
      score: false
  };
     
  selected.forEach(data => {
    if(data.yrs){
      availableData.yrs = true;
    }

    if(data.score){
      availableData.score = true;
    }

  });

  // If yrs does not exist, display note-visible class for yrs-note class
  if(availableData.yrs === false){
    d3.select('.yrs-note')
      .classed('note-visible', true);
  } else {
    d3.select('.yrs-note')
      .classed('note-visible', false);
  }

  // If score does not exist, display note-visible class for score-note class
  if(availableData.score === false){
    d3.select('.score-note')
      .classed('note-visible', true);
  } else {
    d3.select('.score-note')
      .classed('note-visible', false);
  }

  // document.getElementById('region').value = false;
  // document.getElementById('incgrp').value = false;
  d3.selectAll('.comparator-dot')
    .classed('comparator-dot', false);

}

function createDropdown(list){
// Reference for how to remove duplicate items from array:
// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  const countries = [ list[2].map(l => l.country), list[3].map(l => l.country) ].flat();

  const uniqueCountries = countries.filter(function(country, index, arr) {
    return arr.indexOf(country) === index;
  });

  d3.select('#countryDD')
    .selectAll('option')
    .data(uniqueCountries)
    .join('option')
    .attr('value', d => d);

  d3.select('#selectedInput')
    .on('change', () => {


      const selectedInput = document.getElementById('selectedInput').value;
      console.log(selectedInput);
      if(selectedInput.length > 0){
        triggerAllCharts(list, selectedInput);
      } else {
        clearCharts();
      }
    });
}

function triggerAllCharts(list, country) {
  if(!country){
    clearCharts();
  }
  
  document.getElementById('selectedInput').value = country;
  document.getElementById('global').checked = false;

  const filteredSelection = list[0].filter(data => data.country === country && data.overall)
                                .sort((a, b) => a.year - b.year);
 
  const filteredCross = list[1].filter(data => data.country === country && data.value)
                                  .sort((a, b) => a.year - b.year);

  updateBenchmark(country);

  if(filteredSelection.length === 0 && filteredCross.length === 0){
    document.getElementById('no-data').style.display = 'inline-block';
    document.getElementsByClassName('inline-charts')[0].style.display = 'none';
    document.getElementsByClassName('inline-charts')[1].style.display = 'none';
    document.getElementsByClassName('checkbox-lollipop')[0].style.display = 'none';
  } else {
    document.getElementById('no-data').style.display = 'none';
    document.getElementsByClassName('inline-charts')[0].style.display = 'inline-block';
    document.getElementsByClassName('inline-charts')[1].style.display = 'inline-block';
    document.getElementsByClassName('checkbox-lollipop')[0].style.display = 'block';
    createBar(filteredSelection);
    createLollipopChart(filteredCross, filteredSelection);
  }

  

}

function clearCharts() {
  d3.selectAll('svg.lollipop').remove();
  d3.selectAll('svg.bar').remove();
  d3.selectAll('.selected-dot').remove();
}


function myVis(d) {
  // Parse the date / time
  var parseDate = d3.timeParse("%Y");

  const quantityData = d[0].map(data => {
    return {
      gdp: +data.gdp,
      yrs: +data.yrs,
      country: data.country,
      incgrp: data.incgrp,
      region: data.Region
    };
  });

  const qualityData = d[1].map(data => {
    return {
      gdp: +data.gdp,
      score: +data.score,
      country: data.country,
      incgrp: data.incgrp,
      region: data.Region
    };
  });

  const returnsData = d[2].map(data => {
    return {
      country: data.country,
      overall: +data.overall,

      year: parseDate(data.year)
    };
  });

  const returnsCrossData = d[3].map(data => {
    return {
      country: data.country,
      value: +data.value,
      type: data.type,
      source: data.source,
      year: parseDate(data.year)
    };
  });

  const inputArray = [returnsData, returnsCrossData, quantityData, qualityData];

  createBenchmark(quantityData, 'gdp', 'yrs', inputArray);
  createBenchmark(qualityData, 'gdp', 'score', inputArray);

  createDropdown(inputArray);
  console.log(quantityData);

 // https://www.w3schools.com/howto/howto_js_navbar_sticky.asp
  // Get the navbar
  const search = document.getElementById('stickyDropdown');
  const stickyTitle = document.getElementsByClassName('stickyTitle');

  // Get the offset position of the navbar
  let sticky = search.offsetTop;

  // When the user scrolls the page, execute setSticky 
  window.onscroll = function() {setSticky()};

  // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
  function setSticky() {

    if (window.pageYOffset >= sticky) {
      search.classList.add("sticky-search")
      stickyTitle[0].style.display = 'inline';
    } else {      search.classList.remove("sticky-search");
      stickyTitle[0].style.display = 'none';
    }
  }
}
