// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
// const domReady = require('domready');
// const d3 = Object.assign({}, require("d3-selection"), require("d3-scale"), require("d3-shape"), 
//   require("d3-array"), require("d3-axis"), require("d3-fetch"), require("d3-time-format"));


// domReady(() => {
  // const path = '../data/bench.csv';

  // d3.csv(path).then(data => {
  //   const quantityData = data.filter(d => d.gdp !== 'NA' && d.yrs !== 'NA');
  //   const qualityData = data.filter(d => d.gdp !== "NA" && d.score !== "NA");
  //   return [ quantityData, qualityData ];
  // })
  // .then(data => myVis(data));

  Promise.all([
    d3.csv('data/bench.csv'),
    d3.csv('data/returns.csv')
  ])
  .then(data => {
    console.log(data);
      const quantityData = data[0].filter(d => d.gdp !== 'NA' && d.yrs !== 'NA');
      const qualityData = data[0].filter(d => d.gdp !== 'NA' && d.score !== 'NA');
      const returnsData = data[1].filter(d => d.overall!== 'NA');
      return [ quantityData, qualityData, returnsData ];
    })
  .then(data => myVis(data));
// });

function createBenchmark(data, xVar, yVar){
  const width = 500;
  const height = 500;
  const padding = 50;

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
    .domain([0, xMax])
    .range([padding, width - padding])
    .nice();

  // Define Y Scale
  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height - padding, padding])
    .nice();

  // Map scales to axes
  const xAxis = d3.axisBottom(xScale)
      .ticks(5);
    //.tickFormat(function(d) {
      //return "e" + formatPower(Math.round(Math.log(d)));
    //});
  const yAxis = d3.axisLeft(yScale);

  // Define svg
  const svg = d3.select("body")
    .append("svg")
    .attr("class", yVar)
    .attr("height", height)
    .attr("width", width);

  // Map data to circles + use scales to map to variables
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => {
        return xScale(d[xVar]);
      })
      .attr("cy", d => {
        return yScale(d[yVar]);
      })
      .attr("r", 5)

  // Group together elements of axes
  svg.append("g")
    .attr("transform", "translate(0," + (height - (padding+10)) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("transform", "translate(" + padding + "," + (padding-60)  + ")")
    .call(yAxis);

  // x Axis Title - Same for both
  svg.append('text')
    .attr('class', 'text')
    .attr('y', height - (padding/2))
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('GDP per capita, (constant 2010 US$), 2017');

  // y Axis Title - Differs
  svg.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', padding - 40)
    .attr('x', -(height/2))
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
      return 'Years of Schooling, 2010'} 
      else {
        return 'Harmonized Test Scores, 2017'};})

  // Source
  svg.append('text')
    .attr('class', 'text source')
    .attr('y', height)
    .attr('x', width/2)
    .style('text-anchor', 'right')
    .text('Source: World Development Indicators, World Bank Education Statistics')

  // Title - Differs
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', padding)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
      return 'Benchmarking the Quantity of Schooling'} 
      else {
        return 'Benchmarking the Quality of Schooling'};})
}

function createBar(data, yVarBar, xVarBar, country) {
  const width = 700;
  const height = 500;
  const padding = 50;

  d3.selectAll('svg.bar').remove();

  // // Define max
  // const yMax = (() => {
  //   if(d.year===year) {
  //   return d3.max(data, (d) => {
  //     return d[yVarBar]}
  //   )}})();

  // Define max - Filter then find max?
  // const yMax = data.filter(d => d.year === year).then(d => d3.max(data, (d) => {
  //   return d[yVarBar]
  //   }));

  const selectedCountry = data.filter(d => {
    return d.country === country;
  });

  selectedCountry.sort((a, b) => a.year - b.year);

  const years = selectedCountry.map(d => d.year);
  console.log(selectedCountry);
  console.log(years);

  const yMaxBar = d3.max(selectedCountry, (d) => {
    return d[yVarBar];
  });

  const xExtentBar = d3.extent(selectedCountry, (d) => {
    return d[xVarBar];
  });

   // Define Y Scale
   const yScaleBar = d3.scaleLinear()
     .domain([0, yMaxBar])
     .range([height - padding, padding])
     .nice();

  const xMaxBar = d3.max(selectedCountry, (d) => {
    return d[xVarBar];
  });

 const xMinBar = d3.min(selectedCountry, (d) => {
    return d[xVarBar];
  });

 // REFERENCED THE FOLLOWING URL FOR GETTING X-AXIS SCALE
 // https://plnkr.co/edit/HQz1BL9SECFIsQ5bG8qb?p=preview
 const xScaleBar = d3.scaleBand()
  .rangeRound([0, width - (padding * 2)])
  .domain(years)
  .paddingInner(0.05);


  // Map scales to axes
  const yAxisBar = d3.axisLeft(yScaleBar);
  const xAxisBar = d3.axisBottom(xScaleBar).tickFormat(d3.timeFormat("%Y"));

  // Define svg
  const svgbar = d3.select('body')
    .append('svg')
    .attr('class', 'bar')
    .attr("height", height)
    .attr("width", width);

  // const barWidth = (width - padding) / (xMaxBar - xMinBar);

  // Map data to bars + use scales to map to variables
  const bars = svgbar.selectAll("rect")
    .data(selectedCountry)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr("x", (d) => {
      return xScaleBar(d[xVarBar]) + padding;
      })
    .attr("y", (d) => {
      return yScaleBar(d[yVarBar]);
      })
    .attr("width", xScaleBar.bandwidth())
    .attr("height", (d) => {
      return yScaleBar(0) - yScaleBar(d[yVarBar]);
    });

  // g groups together all elements of axis - ticks, values, etc.
  svgbar.append("g")
    .attr("transform", "translate(" + padding + "," + (height - padding) + ")")
    .call(xAxisBar)
    .selectAll("text")
    .attr("y", 9)
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  svgbar.append("g")
    .attr("transform", "translate(" + (padding) + ", 0)")
    .call(yAxisBar);

  // x Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('y', height - (padding/4))
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Year');

  // y Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', padding - 40)
    .attr('x', -(height/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling');

  // Source
  svgbar.append('text')
    .attr('class', 'text source')
    .attr('y', height)
    .attr('x', width/2)
    .style('text-anchor', 'right')
    .text('Source: Psacharopoulos & Patrinos, 2018');

  // Title
  svgbar.append('text')
    .attr('class', 'text title')
    .attr('y', padding)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling: ' + country);
    // .text(function(title) {
    //   if (country==='country') {
    //   return 'country'}});

}

function createDropdown(list){
// Reference for how to remove duplicate items from array:
// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  const countries = list.map(l => l.country);
  const uniqueCountries = countries.filter(function(country, index, arr) {
    return arr.indexOf(country) === index;
  });

  d3.select('#countryDD')
    .selectAll('a')
    .data(uniqueCountries)
    .enter()
    .append('a')
      .attr('class', 'dropdown-item')
      .attr('href', '#')
      .append('text')
      .text(country => country)
      .on('click', (country) => createBar(list, 'overall', 'year', country));


}


function myVis(d) {
  // Parse the date / time
  var parseDate = d3.timeParse("%Y");

  const quantityData = d[0].map(data => {
    return {
      gdp: +data.gdp,
      yrs: +data.yrs,
      country: data.country
    };
  });

  const qualityData = d[1].map(data => {
    return {
      gdp: +data.gdp,
      score: +data.score,
      country: data.country
    };
  });

  const returnsData = d[2].map(data => {
    return {
      country: data.country,
      overall: +data.overall,
      year: parseDate(data.year)
    };
  });

  createBenchmark(quantityData, 'gdp', 'yrs');
  createBenchmark(qualityData, 'gdp', 'score');
  // createBar(returnsData, 'overall', 'year', 'Bolivia');

  createDropdown(returnsData);



// Legend
// First, add rectangles, then add text labels
// const legend = svg.append("g");

//   legend.append("rect")
//     .attr("class", "eastasia")
//     .attr("y", (height/2) - padding)
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - 60)
//     .attr("x", padding + (padding/3))
//     .text("East Asia");


//   legend.append("rect")
//     .attr("class", "europe")
//     .attr("y", (height/2) - (padding + 15))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 5))
//     .attr("x", padding + (padding/3))
//     .text("Europe & Central Asia");


//   legend.append("rect")
//     .attr("class", "lat")
//     .attr("y", (height/2) - (padding + 30))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 20))
//     .attr("x", padding + (padding/3))
//     .text("Latin America");

//   legend.append("rect")
//     .attr("class", "mena")
//     .attr("y", (height/2) - (padding + 45))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 35))
//     .attr("x", padding + (padding/3))
//     .text("Middle East & North Africa");

//   legend.append("rect")
//     .attr("class", "ssa")
//     .attr("y", (height/2) - (padding + 60))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 50))
//     .attr("x", padding + (padding/3))
//     .text("Sub-Saharan Africa");


}


//////////////////////////////
// EXAMPLE CODE STARTS HERE //
/////////////////////////////
// domReady(() => {
//   // this is just one example of how to import data. there are lots of ways to do it!
//   fetch('./data/wdi.json')
//     .then(response => response.json())
//     .then(data => myVis(data));

// });


// function myVis(data) {

//   const width = 600;
//   const height = 600;
//   const padding = 70;

// // Define X Scale
//   const xScale = d3.scaleLinear()
//     .domain([d3.max(data, (d) => d.gdp), 0])
//     .range([padding, width - padding]);

// // Define Y Scale
//   const yScale = d3.scaleLinear()
//     .domain([d3.max(data, (d) => d.litrate), 0])
//     .range([height - padding, padding*2]);

// // Map scales to axes
//   const xAxis = d3.axisTop(xScale);
//   const yAxis = d3.axisRight(yScale);

// // Define svg
//   const svg = d3.select('svg.svg-scatter')
//     .attr("height", height)
//     .attr("width", width);

// // Map data to circles + use scales to map to variables
//   const circles = svg.selectAll("circle")
//     .data(data)
//     .enter()
//     .append("circle")
//       .attr("class", d => {
//         if(d.Region === "East Asia & Pacific"){
//             return "eastasia";
//         } else if (d.Region === "Europe & Central Asia"){
//             return "europe";
//         } else if (d.Region === "Latin America & Caribbean") {
//             return "lat";
//         } else if (d.Region === "Middle East & North Africa") {
//             return "mena";
//         } 
//         else {
//             return "ssa"
//         }
//       })
//       .attr("cx", d => {
//         return xScale(d.gdp);
//       })
//       .attr("cy", d => {
//         return yScale(d.litrate);
//       })
//       .attr("r", 5)

// // g groups together all elements of axis - ticks, values, etc.
//   svg.append("g")
//     .attr("transform", "translate(0," + (padding*2) + ")")
//     .call(xAxis);

//   svg.append("g")
//     .attr("transform", "translate(" + (width - padding) + ", 0)")
//     .call(yAxis);

// // Y Axis Title
//   svg.append("text")
//     .attr("class", "text")
//     .attr("transform", "rotate(90)")
//     .attr("y", -(width - padding + (padding/2)))
//     .attr("x", ((height - padding)/2))
//     .text("Literacy Rate (%)");

// // X Axis Title
//   svg.append("text")
//     .attr("class", "text")
//     .attr("y", padding + (padding/2))
//     .attr("x", (width/2) - padding)
//     .text("GDP per capita, (constant 2010 US$)");

// // Title
//   svg.append("text")
//     .attr("class", "text title")
//     .attr("y", padding - (padding/3))
//     .attr("x", padding)
//     .text("Most countries have achieved full literacy")

// // Subtitle
//   svg.append("text")
//     .attr("class", "text subtitle")
//     .attr("y", padding)
//     .attr("x", padding)
//     .text("Adult Literacy Rate vs GDP per capita, 2015")

// // Source
//   svg.append("text")
//     .attr("class", "text source")
//     .attr("y", height - padding + (padding/2))
//     .attr("x", padding)
//     .text("Source: World Development Indicators, World Bank")

// // Legend
// // First, add rectangles, then add text labels
// const legend = svg.append("g");

//   legend.append("rect")
//     .attr("class", "eastasia")
//     .attr("y", (height/2) - padding)
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - 60)
//     .attr("x", padding + (padding/3))
//     .text("East Asia");


//   legend.append("rect")
//     .attr("class", "europe")
//     .attr("y", (height/2) - (padding + 15))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 5))
//     .attr("x", padding + (padding/3))
//     .text("Europe & Central Asia");


//   legend.append("rect")
//     .attr("class", "lat")
//     .attr("y", (height/2) - (padding + 30))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 20))
//     .attr("x", padding + (padding/3))
//     .text("Latin America");


//   legend.append("rect")
//     .attr("class", "mena")
//     .attr("y", (height/2) - (padding + 45))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 35))
//     .attr("x", padding + (padding/3))
//     .text("Middle East & North Africa");


//   legend.append("rect")
//     .attr("class", "ssa")
//     .attr("y", (height/2) - (padding + 60))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 50))
//     .attr("x", padding + (padding/3))
//     .text("Sub-Saharan Africa");

// /// Bar Chart Practice

// // Define Y Scale
// const yScalebar = d3.scaleLinear()
//   .domain([0, d3.max(data, (d) => d.litrate)])
//   .range([height - padding, padding]);

// // Define X Scale
// const bandScalebar = d3.scaleBand()
//   .domain(data.map(d => d.country))
//   .range([padding, width - padding]);
    
// // Map scales to axes
// const yAxisbar = d3.axisLeft(yScalebar);
// const xAxisbar = d3.axisBottom(bandScalebar);

// // Define svg
// const svgbar = d3.select('svg.svg-bar')
//   .attr("height", height)
//   .attr("width", width);

// // Map data to bars + use scales to map to variables
// const bars = svgbar.selectAll("rect")
//   .data(data)
//   .enter()
//   .append("rect")
//   .attr("class", d => {
//     if(d.Region === "East Asia & Pacific"){
//       return "eastasia";
//     } else if (d.Region === "Europe & Central Asia"){
//       return "europe";
//     } else if (d.Region === "Latin America & Caribbean") {
//       return "lat";
//     } else if (d.Region === "Middle East & North Africa") {
//       return "mena";
//     } 
//       else {
//             return "ssa"
//     }
//       })
//   .attr("x", (d) => {
//     return bandScalebar(d.country);
//     })
//   .attr("y", (d) => {
//     return yScalebar(d.litrate);
//     })
//   .attr("width", 10)
//   .attr("height", (d) => {
//     return yScalebar(0) - yScalebar(d.litrate);
//       });

// // g groups together all elements of axis - ticks, values, etc.
//   svgbar.append("g")
//     .attr("transform", "translate(0," + (height - padding) + ")")
//     .call(xAxisbar)
//   .selectAll("text")
//     .attr("y", 9)
//     .attr("x", 0)
//     .attr("dy", ".35em")
//     .attr("transform", "rotate(45)")
//     .style("text-anchor", "start");

//   svgbar.append("g")
//     .attr("transform", "translate(" + (padding) + ", 0)")
//     .call(yAxisbar);


// }

