/*
#################################################
SECTION 1: HELPER FUNCTIONS
To-Dos: 1.
#################################################
*/
  //CREATE CHARTING VARIABLES
//Creating the SVG using margin convention(source: http://bl.ocks.org/mbostock/3019563)
const createSVG = (id, margin, padding) => {
  const outerWidth = d3.select(id).node().clientWidth,
      outerHeight = d3.select(id).node().clientHeight,
      innerWidth = outerWidth - margin.left - margin.right,
      innerHeight = outerHeight - margin.top -margin.bottom,
      width = innerWidth - padding.left - padding.right,
      height = innerHeight - padding.top - padding.bottom,
      plotVar = d3.select(id).append('svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight)
      .append('g')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      const xScale = d3.scaleLinear()
          .range([0, width]);
      const yScale = d3.scaleLinear()
          .range([height, 0]);
      const svgProps = {width: width, height: height, plotVar: plotVar, xScale: xScale, yScale: yScale}

  return svgProps
}

        //DATA MANIPULATION HELPERS
//Convert strings to numbers
const deString = (d) => {
    if (d === "") {
        return NaN;
    } else {
        return +d;
    }
}

//Create a unique array (use map)
const unique = (xs) => {
    let seen = {}
    return xs.filter((x) => {
        if (seen[x])
            return
        seen[x] = true
        return x
    })
}

// Round to decimals
const round = (value, decimals) => {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


//get the data filtered based on input parameters
const calcVizAllGrData = (data, startYear, endYear, xVar, yVar) => {
	const array = [];
	const tempData = data.filter(function(d) {
			return d.year >= startYear && d.year <= endYear && !isNaN(d[yVar]) && !isNaN(d[xVar]);
	})
	tempData.forEach(function(d) {
		array.push({
			country: d.country,
      year: d.year,
      region: d.region,
      conflictProne: d.conflictProne,
      resourceRich: d.resourceRich,
      aging: d.aging,
      youth: d.youth,
			incomeClass: d.incomeClass,
			yVarRate: (d[yVar]),
			xVarRate: (d[xVar])
		})
	})
  if($('input[type="checkbox"]').prop('checked')){
    return array;
  } else {
    return removeOutliers(array);
  }
}

//Remove outliers
const removeOutliers = (data) => {
  const yDeviation = d3.deviation(data, function(d) {return d.yVarRate}) * 2.5;
  const xDeviation = d3.deviation(data, function(d) {return d.xVarRate}) * 2.5;
  return data.filter(function(d) {return d.yVarRate < yDeviation && d.yVarRate > -yDeviation && d.xVarRate < xDeviation && d.xVarRate > -xDeviation})
}

        //MAP CONTROLS TO DATA VARIABLES
// Create global variables to map html inputs to data and to update titles
const countryClassMap = {
  defaultCountryClass: {
    'All Countries': "W"
  },
  incomeClass : {
    'Low Income': "L",
    'Lower Middle Income': 'LM',
    'Upper Middle Income': 'UM',
    'High Income': 'H'
  },
  region: {
    'East Asia &amp; Pacific': 'East Asia & Pacific',
    'Europe &amp; Central Asia': 'Europe & Central Asia',
    'Latin America &amp; Caribbean': 'Latin America & Caribbean',
    'Middle East &amp; North Africa': 'Middle East & North Africa',
    'North America': 'North America',
    'Sub-Saharan Africa': 'Sub-Saharan Africa',
    'South Asia': 'South Asia'
  },
  resourceRich: {
    'Resource Rich': 'Yes',
    'Not Resource Rich': 'No'
  },
  aging: {
    'Aging': 'Yes',
    'Not Aging': 'No'
  },
  youth: {
    'Young': 'Yes',
    "Not Young": 'No'
  },
  conflictProne: {
    'Conflict Prone': 'Yes',
    'Not Conflict Prone': 'No'
  }
}

const xProdVarKey = {
  "Total Productivity (per year growth)": "prodTot",
  "Agricultural Productivity (per year growth)": "prodAg",
  "Industrial Productivity (per year growth)": "prodInd",
  "Services Productivity (per year growth)": "prodServ"
}
const yEmpVarKey = {
  "Total Productivity (per year growth)": "empTot",
  "Agricultural Productivity (per year growth)": "empAg",
  "Industrial Productivity (per year growth)": "empInd",
  "Services Productivity (per year growth)": "empServ"
}

const prodTitleKey = {
  "Total Productivity (per year growth)": "Total Productivity",
  "Agricultural Productivity (per year growth)": "Ag. Productivity",
  "Industrial Productivity (per year growth)": "Ind. Productivity",
  "Services Productivity (per year growth)": "Serv. Productivity"
}
const empTitleKey = {
  "Total Productivity (per year growth)": "Total Employment",
  "Agricultural Productivity (per year growth)": "Ag. Employment",
  "Industrial Productivity (per year growth)": "Ind. Employment",
  "Services Productivity (per year growth)": "Serv. Employment"
}

        //FUNCTIONS TO EXTEND D3 FUNCTIONALITY
// Extend D3 to move elements to the front/background
d3.selection.prototype.moveToFront = () => {
    return this.each(() => {
        this.parentNode.appendChild(this);
    });
};
d3.selection.prototype.moveToBack = () => {
    return this.each(() => {
        const firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

        // DATA PROCESSING FUNCTIONS FOR INITIAL LOAD
// process the country gdp and productivity csv

const generateDropDown = (empData, prodData) => {

	//generate the unique list of values.
  const empListVals = empData.map(function(d) { return d.country; })
  const prodListVals = prodData.map(function(d) { return d.country; })
  const listVals = unique(empListVals.concat(prodListVals)).sort()

  // var listVals = unique(data.map(function(d) { return d.country; })).sort()
  const listData = [{id: "None", text: "None"}];

  listVals.forEach(function(d) {
    listData.push({
      id: d,
      text: d
    })
  })

  $("#countryList").select2({
    data: listData
  })
  $("#countryList").select2('val', "None");
}

const processScatterData = (data) => {
    const array = {
        country: data.country,
        year: deString(data.year),
        region: data.region,
        conflictProne: data.conflictProne,
        resourceRich: data.resourceRich,
        aging: data.aging,
        youth: data.youth,
        incomeClass: data.incomeClass,
        gdp: deString(data.gdpGr),
        prodTot: deString(data.prodTotGr),
        prodAg: deString(data.prodAgGr),
        prodInd: deString(data.prodIndGr),
        prodServ: deString(data.prodServGr),
        empTot: deString(data.empTotGr),
        empAg: deString(data.empAgGr),
        empInd: deString(data.empIndGr),
        empServ: deString(data.empServGr)
    }
    return array
}

// process the world gdp per cap data for the brush
const processallBrushData = (data) => {
    const array = {
        countryGroup: data.countryGroup,
        year: new Date(deString(data.year), 1, 1),
        gdpPc: deString(data.gdpPerCap)
    }
    return array
}

//process country countryClassification
const processCountryClass = (data) => {
  const array = {
    country: data.country,
    year: new Date(deString(data.year), 1, 1),
    classification: data.type
  }
  return array;
}



/*
#################################################
SECTION 2: LOAD THE DATA FILES AND PROCESS THEM
#################################################
*/
const ready = (error, dataAll, allBrushData) => {
    draw(dataAll, allBrushData);
}

d3.queue()
    .defer(d3.csv, "data/allGrData.csv", processScatterData)
    .defer(d3.csv, "data/gdpPerCapData.csv", processallBrushData)
    .await(ready);



const draw = (dataAll, allBrushData) => {

  /*
  #################################################
  SECTION 3: GET THE DATA READY
  #################################################
  */
  //Identify the start year and end year of the data (the two dates should never be updated)
  const startYear = d3.min(dataAll, function(d) {
      return d.year;
  })

  const endYear = d3.max(dataAll, function(d) {
      return d.year;
  })

  let yearDomainRange = [new Date(startYear, 1, 1), new Date(endYear, 1, 1)] //updated through brush events

  //Selected x variable for productivity
  let selProdXVar = document.getElementById('xProdDropDown');
  let currentProdX = xProdVarKey[selProdXVar.options[selProdXVar.selectedIndex].value];
  let currentProdY = 'gdp'

  //Selected x variable for employment
  let selEmpXVar = document.getElementById('xEmpDropDown');
  let currentEmpX;

  if (selEmpXVar.options[selEmpXVar.selectedIndex].value === "Productivity (per year growth)") {
    currentEmpX = currentProdX
  } else {
    currentEmpX = currentProdY
  }
  // Selected y variable for the employment chart
  let currentEmpY = yEmpVarKey[selProdXVar.options[selProdXVar.selectedIndex].value];

  //Selected country grouping (update this when there is a change in the selection)
  let varType = "defaultCountryClass"
  let currentCountryGroup = "W";

  // incomeClassKey[selCountryGroup.options[selCountryGroup.selectedIndex].value];

  //Create the datasets for charting
  let prodData = (calcVizAllGrData(dataAll, startYear, endYear, currentProdX, currentProdY));
  let empData = (calcVizAllGrData(dataAll, startYear, endYear, currentEmpX, currentEmpY));
  let currBrushData = allBrushData.filter(function(d) {return d.countryGroup === currentCountryGroup;});
  generateDropDown(empData, prodData)
  /*
  #################################################
  SECTION 3.1: SETTING UP THE GLOBAL VARIABLES AND DRAWING AREAS
  To-Dos: 1.
  #################################################
  */
        //PRODUCTIVITY CHART
  //Creating the svg
  const prodChartVars = createSVG('#prodChart', margin = {top: 5, right: 5, bottom: 0, left: 40}, padding = {top: 5, right: 15, bottom: 2, left: 2}),
      prodWidth = prodChartVars.width,
      prodHeight = prodChartVars.height,
      prodPlot = prodChartVars.plotVar,
      xProdScale = prodChartVars.xScale,
      yProdScale = prodChartVars.yScale;

  prodChartVars.plotVar.attr("id", "prodChartSVG")

        //EMPLOYMENT CHART
  //Creating the svg
  const empChartVars = createSVG('#empChart', margin = {top: 5, right: 5, bottom: 0, left: 40}, padding = {top: 5, right: 2, bottom: 2, left: 15}),
      empWidth = empChartVars.width,
      empHeight = empChartVars.height,
      empPlot = empChartVars.plotVar,
      xEmpScale = empChartVars.xScale,
      yEmpScale = empChartVars.yScale;

  empChartVars.plotVar.attr("id", "empChartSVG")

  // Creating the tool tip for both the scatter plots
  const toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .attr('id', 'popUp')
    .offset([10, 5])
      .direction('e');

      //CREATE BRUSH
  //Creating the svg
  var brushVars = createSVG('#brushDiv', margin = {top: 5, right: 24, bottom: 20, left: 40}, padding = {top: 2, right: 2, bottom: 2, left: 10}),
      brushWidth = brushVars.width,
      brushHeight = brushVars.height,
      brushSvg = brushVars.plotVar;
  brushVars.plotVar.attr("id", "brushSVG")

  //Create the X and Y scales
  var xBrushScale = d3.scaleTime()
      .domain([new Date(startYear, 1, 1), new Date(endYear, 1, 1)]) //based on the entire range of the dataset
      .rangeRound([0, brushWidth]);

  var yBrushScale = d3.scaleLinear() //based on the max and min values of the world gdp data
      .range([brushHeight, 0]);

  //Create the brush
  var brush = d3.brushX()
      .extent([
          [0, 0],
          [brushWidth, brushHeight]
      ])
      .on("brush end", brushended);

  // Draw the x axis for the brush (only drawn once)
  brushSvg.append("g")
      .attr("class", "brushAxis brushAxis--x")
      .attr("transform", "translate(0," + brushHeight + ")")
      .call(d3.axisBottom(xBrushScale)
          .ticks(d3.timeYear)
          .tickPadding(2)
          .tickFormat(d3.timeFormat("%y")))
      .attr("text-anchor", null)
      .selectAll("text")
      .attr("x", -10); //offset the tick labels to the left of the ticks

  //Call the brush on the svg (only called once)
  var gBrush = brushSvg.append("g")
      .attr("class", "brush")
      .call(brush)

  // Draw the brush handle
  var handle = gBrush.selectAll(".handle--custom")
      .data([{type: "w"}, {type: "e"}])
      .enter().append("path")
        .attr("class", "handle--custom")
        .attr("fill", "#666")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("cursor", "ew-resize")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(brushHeight / 2)
            .startAngle(0)
            .endAngle(function(d, i) { return i ? Math.PI : -Math.PI; }))
        .attr("display", "none");

  // Draw the default charts for employment
  drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
  drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
  drawRegressLine(empData, 'main',empPlot, xEmpScale, yEmpScale, 'emp')
  // Draw the default charts for productivity
  drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
  drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
  drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')



  //Draw the brush line
  drawBrushLine(currBrushData, currentCountryGroup, brushSvg, xBrushScale, yBrushScale, brushHeight, 'main')


  /*
  #################################################
  SECTION 3.4: EVENT HANDLER FOR THE X AXIS DROPDOWNS
  To-Dos: 1.
  #################################################
  */
  // Event listener for x Axis dropdown FOR productivity
  d3.select('#xProdDropDown').on('change.line', function() {
    // update the x variable for the productivity chart (based on sector selected)
    selProdXVar = document.getElementById('xProdDropDown');
    currentProdX = xProdVarKey[selProdXVar.options[selProdXVar.selectedIndex].value];
    //update the data based on the new x variable
    prodData = (calcVizAllGrData(dataAll, startYear, endYear, currentProdX, currentProdY));

    // update the y variable for the employment chart
    currentEmpY = yEmpVarKey[selProdXVar.options[selProdXVar.selectedIndex].value];
    // update the data based on the new employment data
    empData = (calcVizAllGrData(dataAll, startYear, endYear, currentEmpX, currentEmpY));

    generateDropDown(empData, prodData)

    //Redraw existing productivity plot elements
    drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
    drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
    drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')

    //Redraw existing employment plot elements
    drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
    drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
    drawRegressLine(empData, 'main', empPlot, xEmpScale, yEmpScale, 'emp')

    // Reflect existing inputs on new data
    scatterHandler()
  })

  // Event listener for x Axis dropdown FOR employment
  d3.select('#xEmpDropDown').on('change.line', function() {
    // update the x variable (gdp or productivity)
    if (selEmpXVar.options[selEmpXVar.selectedIndex].value === "Productivity (per year growth)") {
      currentEmpX = currentProdX
    } else {
      currentEmpX = currentProdY
    }
    // update the data based on the new x variable
    empData = (calcVizAllGrData(dataAll, startYear, endYear, currentEmpX, currentEmpY));

    generateDropDown(empData, prodData)
    //Redraw existing productivity plot elements
    drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
    drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
    drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')

    //Remove existing plot elements
    drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
    drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
    drawRegressLine(empData, 'main', empPlot, xEmpScale, yEmpScale, 'emp')

    // Reflect existing inputs on new data
    scatterHandler()
    // d3.select('.brush').call(brush.move, null)
  })


  /*
  #################################################
  SECTION 3.4: EVENT HANDLER FOR THE OUTLIERS SWITCH
  To-Dos: 1.
  #################################################
  */

  d3.select('#outlierCheck').on('change', function(){
    generateDropDown(empData, prodData)
    if($('input[type="checkbox"]').prop('checked')) { //checkbox is checked then redraw
      // update the two data sets
      prodData = calcVizAllGrData(dataAll, startYear, endYear, currentProdX, currentProdY);
      empData = calcVizAllGrData(dataAll, startYear, endYear, currentEmpX, currentEmpY);

      ///Redraw existing productivity plot elements
      drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
      drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
      drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')

      //Redraw existing employment plot elements
      drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
      drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
      drawRegressLine(empData, 'main', empPlot, xEmpScale, yEmpScale, 'emp')

      //Apply existing inputs on new charts
      scatterHandler();

    } else{
      // update the two data sets
      prodData = (calcVizAllGrData(dataAll, startYear, endYear, currentProdX, currentProdY));
      empData = (calcVizAllGrData(dataAll, startYear, endYear, currentEmpX, currentEmpY));

      ///Redraw existing productivity plot elements
      drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
      drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
      drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')

      //Redraw existing employment plot elements
      drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
      drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
      drawRegressLine(empData, 'main', empPlot, xEmpScale, yEmpScale, 'emp')

      //Apply existing inputs on new charts
      scatterHandler();
    }
  })
  /*
  #################################################
  SECTION 3.4: BRUSH End EVENT HANDLERS
  To-Dos: 1.
  #################################################
  */
  function brushended() {
    // generateDropDown(empData, prodData)
      if (!d3.event.sourceEvent) return; // Only transition after input.

      // Keep default styling if selection is empty i.e no brush
      if (!d3.event.selection){
        yearDomainRange = [new Date(startYear, 1, 1), new Date(endYear, 1, 1)]; //reset the domain variables
        scatterHandler()
        handle.attr("display", "none");
        return; // Ignore empty selections i.e exit
      }
      var domain0 = d3.event.selection.map(xBrushScale.invert)//invert the scale to get the domain value
      yearDomainRange = domain0.map(d3.timeYear.round);

      // If empty when rounded, use floor & ceil instead.
      if (yearDomainRange[0] >= yearDomainRange[1]) {
          yearDomainRange[0] = d3.timeYear.floor(domain0[0]);
          yearDomainRange[1] = d3.timeYear.ceil(domain0[1]);
      }

      //implement a smooth transition to year domain
      d3.select(this)
          .transition()
          .duration(5)
          .ease(d3.easeExpIn)
          .call(brush.move, yearDomainRange.map(xBrushScale))

      handle.transition().duration(5).ease(d3.easeExpIn).attr("display", null).attr("transform", function(d, i) { return "translate(" + yearDomainRange.map(xBrushScale)[i] + "," + brushHeight / 2 + ")"; })
      //call the redraw function
      scatterHandler()

      // generateDropDown(empData, prodData)
  }

  /*
  #################################################
  SECTION 3.4: COUNTRY GROUPS DROPDOWN
  To-Dos: 1.
  #################################################
  */
  $('#countryClassDropdown li').on('click', function(){
    varType = this.classList[0];
    // update the values of control variables
    currentCountryGroup = countryClassMap[varType][this.innerHTML];

    function dropdown(val) {
      var y = document.getElementsByClassName('btn btn-default dropdown-toggle');
      var aNode = y[0].innerHTML = val + ' <span class="caret"></span>'; // Append
    }
    dropdown(this.innerHTML)
    scatterHandler()
  })

  $("#countryList").on('change', function(d) {
    var tempCountry = this.value;

    //Redraw existing productivity plot elements
    drawScatterAxis(prodData, prodPlot, xProdScale, yProdScale, prodWidth, prodHeight, 'prod')
    drawScatterPlot(prodData, prodPlot, xProdScale, yProdScale, toolTip, 'prod')
    drawRegressLine(prodData, 'main', prodPlot, xProdScale, yProdScale, 'prod')

    //Redraw existing employment plot elements
    drawScatterAxis(empData, empPlot, xEmpScale, yEmpScale, empWidth, empHeight, 'emp')
    drawScatterPlot(empData, empPlot, xEmpScale, yEmpScale, toolTip, 'emp')
    drawRegressLine(empData, 'main', empPlot, xEmpScale, yEmpScale, 'emp')

    // Reflect existing inputs on new data
    scatterHandler()
    if(tempCountry != "None"){
      // d3.selectAll(".dots").filter(function(e) {return e.country != tempCountry; }).style("fill-opacity", 0.1).moveToBack()
      d3.selectAll(".dots").filter(function(e) {return e.country === tempCountry; }).style("fill", "red").style("fill-opacity", 0.9).moveToFront()
    }


    // console.log(test)
  })

  d3.select("#saveChartsButton").on("click", function(){
    // saveSvgAsPng(document.getElementById("brushSVG"), "brush.png", {left : -30})
    saveSvgAsPng(document.getElementById("prodChartSVG"), "prodChart.png", {left : -15})
    saveSvgAsPng(document.getElementById("empChartSVG"), "empChart.png", {left : -15})

  });

  /*
  #################################################
  SECTION 3.4: SCATTER EVENT HANDLER
  To-Dos: 1. Update the observation text
  "#63AAC8"

  #################################################
  */

  var fillColour = 'rgb(33, 150, 200)';
  var tempProdData, tempEmpData;
  function scatterHandler() {
    if(currentCountryGroup === 'W'){
      if(startYear === yearDomainRange[0].getFullYear() && endYear === yearDomainRange[1].getFullYear()) { //no inputs; draw default
        // set to default view
        d3.selectAll('.tempregLine').remove() //remove the previous temp line
        d3.selectAll('.dots').classed('selected', false).classed('default', true);

        // update number of obsText
        nObs(prodData, prodPlot, prodWidth, prodHeight, 'prod')
        nObs(empData, empPlot, empWidth, empHeight, 'emp')
      } else {
        // Hide or show scatterCircles based on the start and end year of the brush
        d3.selectAll('.dots').filter(function(d) { return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear()}).classed('default', false).classed('selected', true).attr('fill', fillColour).moveToFront();
        d3.selectAll('.dots').filter(function(d) { return d.year <= yearDomainRange[0].getFullYear() || d.year > yearDomainRange[1].getFullYear()}).classed('selected', false).classed('default', true).lower();

        // Draw a temparory regression line for each brush end event
        tempProdData = prodData.filter(function(d) {return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear()})
        tempEmpData = empData.filter(function(d) {return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear()})
        drawRegressLine(tempProdData, 'temp', prodPlot, xProdScale, yProdScale, 'prod')
        drawRegressLine(tempEmpData, 'temp', empPlot, xEmpScale, yEmpScale, 'emp')

        // update number of obsText
        nObs(tempProdData, prodPlot, prodWidth, prodHeight, 'prod')
        nObs(tempEmpData, empPlot, empWidth, prodHeight, 'emp')
      }
    } else {
      // Hide or show scatterCircles based on the start and end year of the brush
      d3.selectAll('.dots').filter(function(d) { return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear() && d[varType] === currentCountryGroup}).classed('default', false).classed('selected', true).attr('fill', fillColour).moveToFront()
      d3.selectAll('.dots').filter(function(d) { return d.year <= yearDomainRange[0].getFullYear() || d.year > yearDomainRange[1].getFullYear() || d[varType] !== currentCountryGroup} ).classed('selected', false).classed('default', true).lower();



      // Draw a temparory regression line for each brush end event
      tempProdData = prodData.filter(function(d) {return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear() && d[varType] === currentCountryGroup})
      tempEmpData = empData.filter(function(d) {return d.year > yearDomainRange[0].getFullYear() && d.year <= yearDomainRange[1].getFullYear() && d[varType] === currentCountryGroup})

      drawRegressLine(tempProdData, 'temp', prodPlot, xProdScale, yProdScale, 'prod')
      drawRegressLine(tempEmpData, 'temp', empPlot, xEmpScale, yEmpScale, 'emp')

      // update number of obsText
      nObs(tempProdData, prodPlot, prodWidth, prodHeight, 'prod')
      nObs(tempEmpData, empPlot, empWidth, prodHeight, 'emp')
    }
  }

  /*
  #################################################
  SECTION 3.2: DRAW THE SCATTER PLOT
  To-Dos: 1.
  #################################################
  */
  function drawScatterPlot(data, plotVar, xScale, yScale, toolTip, varType) {

      var className = varType + 'Dots'
      //Remove existing elements
      d3.selectAll('.' + className).remove()

      //drawing the plot
      plotVar.append('g').selectAll('.dots').data(data)
          .enter().append('circle')
          .attr('r', 3.5)
          .attr('cx', function(d) {
              return xScale(d.xVarRate);
          })
          .attr('cy', function(d) {
              return yScale(d.yVarRate);
          })
          .attr('class', 'dots default ' + className )
          .on('mouseover', mouseoverDots)
          .on('mouseout', mouseoutDots)
          .call(toolTip);

      //Draw titles
      var tempProdXVar = document.getElementById('xProdDropDown');
      var currentProdTitle = prodTitleKey[tempProdXVar.options[tempProdXVar.selectedIndex].value];
      if(varType === 'prod'){
        d3.select('#prodChartXVar').html(currentProdTitle)
      } else {
        var tempEmpYVar = document.getElementById('xEmpDropDown');
        var currentEmpTitle = empTitleKey[tempProdXVar.options[tempProdXVar.selectedIndex].value];
        if(tempEmpYVar.options[tempEmpYVar.selectedIndex].value === "Productivity (per year growth)") {
          d3.select('#empChartXVar').html(currentProdTitle)
          d3.select('#empChartYVar').html(currentEmpTitle)
        } else {
          d3.select('#empChartXVar').html("GDP Growth")
          d3.select('#empChartYVar').html(currentEmpTitle)
        }
      }

      function mouseoverDots(d){
        d3.selectAll('.dots').filter(function(e) {return e.country === d.country}).classed('default', false).classed('selected', true).attr('fill', fillColour).raise()
        d3.selectAll('.dots').filter(function(e) {return e.country != d.country}).classed('selected', false).classed('default', true).lower()
        if(varType === 'prod'){
          toolTip.html(function(d) {return "<strong>Country:</strong> <span style='color:silver'>" + d.country + "</span>" + "<br>" +
            "<strong>Year:</strong> <span style='color:silver'>" + d.year + "</span>" + "<br>" +
              "<strong>GDP Growth:</strong> <span style='color:silver'>" + round(d.yVarRate, 1) + "</span>" + "<br>" +
                "<strong>Prod Gr:</strong> <span style='color:silver'>" + round(d.xVarRate, 1)+ "</span>"})
        } else if(tempEmpYVar.options[tempEmpYVar.selectedIndex].value === "Productivity (per year growth)") {
          toolTip.html(function(d) {return "<strong>Country:</strong> <span style='color:silver'>" + d.country + "</span>" + "<br>" +
            "<strong>Year:</strong> <span style='color:silver'>" + d.year + "</span>" + "<br>" +
              "<strong>Emp. Growth:</strong> <span style='color:silver'>" + round(d.yVarRate, 1) + "</span>" + "<br>" +
                "<strong>Prod Gr:</strong> <span style='color:silver'>" + round(d.xVarRate, 1)+ "</span>"})
        } else {
          toolTip.html(function(d) {return "<strong>Country:</strong> <span style='color:silver'>" + d.country + "</span>" + "<br>" +
            "<strong>Year:</strong> <span style='color:silver'>" + d.year + "</span>" + "<br>" +
              "<strong>Emp. Growth:</strong> <span style='color:silver'>" + round(d.yVarRate, 1) + "</span>" + "<br>" +
                "<strong>GDP Gr:</strong> <span style='color:silver'>" + round(d.xVarRate, 1)+ "</span>"})
        }

        toolTip.show(d)
      }
      // Mouseout function fo scatter plot
      function mouseoutDots(d){
        scatterHandler()
        toolTip.hide(d)
      }

      d3.selectAll('.tick').selectAll('text').raise()
  }
}


/*
#################################################
SECTION 3.2: DRAW THE AXIS
To-Dos: 1.
#################################################
*/
function drawScatterAxis(data, plotVar, xScale, yScale, width, height, varType) {
  var className = varType + 'Axis';
  //Remove existing elements
  d3.selectAll('.' + className).remove()

  //setting the domains for the x and y scales
  xScale.domain([d3.min(data, function(d) {
      return d.xVarRate;
  }), d3.max(data, function(d) {
      return d.xVarRate;
  })])
  yScale.domain([d3.min(data, function(d) {
      return d.yVarRate;
  }), d3.max(data, function(d) {
      return d.yVarRate;
  })])
  //Calling the axis
  var xAxis = d3.axisBottom(xScale).ticks(8);
  var yAxis = d3.axisLeft(yScale).ticks(6);

  // Draw the axis
  plotVar.append('g')
      .call(yAxis)
      .attr('class', 'y--scatterAxis '+ className)
      .raise()

  plotVar.append('g')
      .call(xAxis)
      .attr('transform', 'translate(0,' + yScale(0) + ")")
      .attr('class', 'x--scatterAxis ' + className)
      .lower()

  // Draw the labels
  var yAxisText;
  if(varType === "prod"){
    yAxisText1 = "% GDP Growth";
    yAxisText2 = "(Yearly)"
  } else {
    yAxisText1 = "% Emp. Growth";
    yAxisText2 = "(Yearly)";
  }
  plotVar.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ 12 +","+(height/5)+")rotate(-90)")
        .attr('dx', 2)
        .attr('class', 'y--scatterTitle ' + className)
        .text(yAxisText1);

  plotVar.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ 12 +","+(height/5)+")rotate(-90)")
        .attr('dy', 12)
        .attr('class', 'y--scatterTitle ' + className)
        .text(yAxisText2);

  // Add text for observations
  nObs(data, plotVar, width, height, varType)

}
//Scatter Helper for number of observations
function nObs(data, plotVar, width, height, varType) {
  // create plot specific unique class
  var obsClass = varType + "obsText"
  // remove existing text for specified chart
  d3.selectAll('.' + obsClass).remove()

  // Create first line
  var nObsText = "No of obs: " + data.length;

  // create second line
  var uniqueText = "Countries: " + unique(data.map(function(d) { return d.country;})).length
  // Append the text to the plot
  plotVar.append('g')
        .append('text')
        .attr('x', width - 100)
        .attr('y', height - 0)
        .attr('dy', -2)
        .text(nObsText)
        .attr('class', 'obsText '+ obsClass)
        .raise();

  plotVar.append('g')
        .append('text')
        .attr('x', width - 100)
        .attr('y', height - 0)
        .attr('dy', -14)
        .text(uniqueText)
        .attr('class', 'obsText '+ obsClass)
        .raise();
}


/*
#################################################
SECTION 3.3: DRAW THE REGRESSION LINE
To-Dos: 1.
#################################################
*/
function drawRegressLine(data, type, plotVar, xScale, yScale, varType) {
    var className = varType + type +'regLine ';

    //Remove existing elements
    d3.selectAll('.' + className).remove()

    //Calling the d3 line function
    var line = d3.line()
        .x(function(d) {
            return xScale(d.xVarRate);
        })
        .y(function(d) {
            return yScale(d.yVarRate);
        });

    // Derive a linear regression using the simple stats library
    var regression = ss.linearRegression(data.map(function(d) {
        return [d.xVarRate, d.yVarRate];
    }));

    //function that maps x values to y
    var regLineCreater = ss.linearRegressionLine(regression);

    // Create a line based on the beginning and endpoints of the range
    var regLineData = xScale.domain().map(function(x) {
        return {
            xVarRate: x,
            yVarRate: regLineCreater(+x)
        };
    });

    var lineType = type + 'regLine'
    // Creating an id variable for the line
    plotVar.append('g').append("path")
        .datum(regLineData)
        .attr("class", className + lineType)
        .attr("d", line);
}

/*
#################################################
SECTION 3.4: CREATE A LINE CHART ON TOP OF THE BRUSH
To-Dos: 1.
#################################################
*/
function drawBrushLine(brushData, countryGroup, plotVar, xScale, yScale, height) {
  // Remove existing elements
  d3.select('.brushAxis--y').remove();
  d3.select('.tempbrushLine').remove();
  d3.select('.mainbrushLine').remove();
  d3.selectAll('.y--brushTitle').remove();

  //update the scale domains
  yScale.domain([d3.min(brushData, function(d) {
      return d.gdpPc
  }), d3.max(brushData, function(d) {
      return d.gdpPc
  })])

  //Draw the Y-Axis
  plotVar.append('g')
      .attr('class', 'brushAxis brushAxis--y')
      .call(d3.axisLeft(yScale)
          .ticks(3)
          .tickPadding(2));

  // Axis title
  plotVar.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ 10 +","+(height/2)+")rotate(-90)")
        .attr('class', 'y--brushTitle')
        .attr("dy", "0em")
        .text("GDP per cap.")
  plotVar.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ 10 +","+(height/2)+")rotate(-90)")
        .attr('class', 'y--brushTitle')
        .attr("dy", "1em")
        .text("(in ,100s)")

    //The line function for the brush chart
    var gdpLine = d3.line()
        .x(function(d) {
            return xScale(d.year);
        })
        .y(function(d) {
            return yScale(d.gdpPc);
        });

    //Draw the brush line
    if(countryGroup === 'W') {
      plotVar.append('g').append('path')
          .datum(brushData)
          .attr('d', gdpLine)
          .attr('class', 'mainbrushLine');
    } else {
      plotVar.append('g').append('path')
          .datum(brushData.filter(function(d) {return d.countryGroup === 'W'}))
          .attr('d', gdpLine)
          .attr('class', 'mainbrushLine');

      plotVar.append('g').append('path')
          .datum(brushData.filter(function(d) {return d.countryGroup != 'W'}))
          .attr('d', gdpLine)
          .attr('class', 'tempbrushLine');
    }

}
