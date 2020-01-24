var fdChart = {
    //holds data
    rawDataObject: {},
    rawDataArray: [],
    formattedDataArray: [],
    stackedYValues: [],

    //label data - loaded in from central config
    labels: [],
    keys: [],
    column: [],
    currencies: [],
    noColumns: 0,
    hasHeaderRows: false,
    headerRows: [],
    currency: '',

    //internal temp
    _tmpField: '',
    //chart components
    svg: '',
    margin: '',
    width: '',
    height: '',
    g: '',
    x0: '',
    x1: '',
    y: '',
    z: '',
    legend: '',
    xAxis: '',
    yAxis: '',
    title: '',
    toolTip: '',
    chartContainer: '',
    legendContainer:'',
    initLegend: '',
    yAxisLabel: '',
    months: '',
    rects:'',
    legendEntries: '',
    //used to offset the key on the right hand side
    legendOffset: 0,
    dataValidation: true,
    summaryColumns: [],
    configVersion: 0
}


function cInitApp(initChart){
    //based on config version
    fdChart.configVersion = uAppConfigObject.version
    switch(Math.floor(+(fdChart.configVersion))) {
        case 1:
            cBuildfdChartVariableVersion1(initChart)
        break;
        default:
            console.log('Unable to Load Config - Chart Initialisation failed, please contact your System Administrator')
        break;
    }
}

function cBuildfdChartVariableVersion1(initChart) {
    //reset values
    fdChart.timeFieldIds = [];
    fdChart.keys = [];
    fdChart.labels = [];
    fdChart.rows = [];
    // fdChart.currencies = [];
    fdChart.noColumns = 0;
    fdChart.headerRows = [];
    fdChart.hasHeaderRows = false;
    fdChart.legendOffset = 0;
    fdChart.svgId = 'cbarChartSvg'

    //load config from central config file
    fdChart.rows = uAppConfigObject.tableConfig.rows;
    fdChart.summaryColumns = uAppConfigObject.tableConfig.summaryColumns;

    //build array of columns
    fdChart.column = [];
    for(var i=0; i<uAppConfigObject.tableConfig.columns.length ;i++) {
        fdChart.column.push(uAppConfigObject.tableConfig.columns[i].label);
    }
    
    // fdChart.currencies = uAppConfigObject.currencies;
    fdChart.yAxisLabel = uAppConfigObject.yAxisLabel;    

    fdChart.noColumns = fdChart.column.length;

    //build header row config
    for(i=0;i<fdChart.rows.length;i++) {
        if(fdChart.rows[i].headerRow) {
            fdChart.headerRows.push(fdChart.rows[i].label)
        }
    }

    fdChart.headerRows.length > 0
    ? fdChart.hasHeaderRows = true
    : fdChart.headerRows = false

    //reset _tmpField
    fdChart._tmpField = ''
    for(i=0;i<fdChart.rows.length;i++) {
        
        //we want to capture the current header row and add it to the label of child rows
        if(fdChart.rows[i].headerRow) {
            fdChart._tmpField = fdChart.rows[i].label + ' - '
        }

        //don't want to include header rows in calcuation
        if(!fdChart.rows[i].headerRow) {
            fdChart.keys.push(fdChart.rows[i].key)
            fdChart.labels.push(fdChart._tmpField + fdChart.rows[i].label)
        }
    }

    //identify legend offset
    for (var i=0; i<fdChart.labels.length; i++){
      if (fdChart.labels[i].length > fdChart.legendOffset){
        fdChart.legendOffset = fdChart.labels[i].length;
      }
    }
    //reset _tmpField
    fdChart._tmpField = ''

    fdChart.timeFieldIds = uAppConfigObject.timeFieldIds;
    fdChart.currency = mYearData.currency

    cGetData(initChart)
}

function cGetData(initChart) {
    $(document).ready(function () {
        fdChart.rawDataObject = {}
        //don't want to include header rows in calcuation
        for(var j=0; j<fdChart.labels.length;j++) {
            fdChart.rawDataObject[fdChart.keys[j]] = {}
            fdChart.rawDataObject[fdChart.keys[j]].category = fdChart.labels[j];
        }

        for(var i=0; i<fdChart.timeFieldIds.length; i++) {
            fdChart._tmpField = ''
            //load field value into _tmp variable
            fdChart._tmpField = 
            $("#" + fdChart.timeFieldIds[i]).val() 
            || $("#" + fdChart.timeFieldIds[i]).text();
            
            if(fdChart._tmpField) {
                //convert to number and trim currency symbol if there is one
                // if(fdChart.currencies.indexOf((fdChart._tmpField.substr(0,1))) !== -1) {
                //strip out currency field if exists
                if(isNaN(fdChart._tmpField.substr(0,1))) {
                    //place into object using key and column properties
                    fdChart.rawDataObject[fdChart.keys[Math.floor(i/fdChart.noColumns)]][fdChart.column[i%fdChart.noColumns]] = +(fdChart._tmpField.substr(1))
                } else {
                    fdChart.rawDataObject[fdChart.keys[Math.floor(i/fdChart.noColumns)]][fdChart.column[i%fdChart.noColumns]] = +(fdChart._tmpField)
                }
            } else {
                console.log('ERROR: unable to determine value for field with field ID', fdChart.timeFieldIds[i])
            }
        }
        cConstructFinanceData(initChart)
    });
}


function cConstructFinanceData(initChart) {

    //reset raw data array
    fdChart.rawDataArray = [];

    //generate raw data array
    Object.getOwnPropertyNames(fdChart.rawDataObject).map(function(value) {
        fdChart.rawDataArray.push(
            fdChart.rawDataObject[value]
        )
    })

    //reset formatted data array
    fdChart.formattedDataArray = []

    //generate formatted data array
    //re-cast data in form of an array of objects containing the column value and each cost metric
    for(m=0;m<fdChart.column.length;m++) {
        //iterate through each column
        fdChart.formattedDataArray.push({
            m: fdChart.column[m],
        })
        //iterate through the properties of that column
        for(n=0;n<fdChart.keys.length;n++) {
            //add to last object in array which is the most recently added object
            fdChart.formattedDataArray[fdChart.formattedDataArray.length-1][fdChart.keys[n]] = 
                fdChart.rawDataObject[fdChart.keys[n]][fdChart.column[m]];
        }
    }

    cValidateData(initChart)
}

function cValidateData(initChart) {
    fdChart.dataValidation = true
    for(m=0;m<fdChart.column.length;m++) {
        for(n=0;n<fdChart.keys.length;n++) {
            if(isNaN(+(fdChart.rawDataObject[fdChart.keys[n]][fdChart.column[m]]))) {
                //REFACTOR THIS INTO MESSAGING COMPONENT
                console.log('ERROR: ELEMENT IS NOT A NUMBER ')
                fdChart.dataValidation = false
            }
        }
    }

    //chart not supported in IE
    if(fdChart.dataValidation && 
        initChart) {
        cCreateChart()
    } else if (fdChart.dataValidation && 
        initChart === false){
        cUpdateChart()
    }    
}

function cCreateChart() {
    fdChart.svg = d3
                    .select(".barChart")
                    .append('svg')
                    .attr('height', 300)
                    .attr('width', 900)
                    .attr('id', fdChart.svgId);
    fdChart.margin = {top: 20, right: 20, bottom: 30, left: 40};
    fdChart.width = +fdChart.svg.attr("width") - fdChart.margin.left - fdChart.margin.right;
    fdChart.height = +fdChart.svg.attr("height") - fdChart.margin.top - fdChart.margin.bottom;
    fdChart.g = fdChart.svg.append("g").attr("transform", "translate(" + fdChart.margin.left + "," + fdChart.margin.top + ")");

    fdChart.x0 = d3.scaleBand()
        .rangeRound([0, fdChart.width - (fdChart.legendOffset * 7)])
        .paddingInner(0,1)

    fdChart.x1 = d3.scaleBand()
        .padding(0.05);

    fdChart.y = d3.scaleLinear()
        .rangeRound([fdChart.height, 10]);

    fdChart.z = d3.scaleOrdinal()
        .range(d3.schemeCategory20)

    fdChart.toolTip = d3.select(".barChartTooltip")

    fdChart.x0.domain(fdChart.column);

    //chart container
    fdChart.chartContainer = fdChart.g.append("g")
        .attr('class', 'barChartContainer')

    fdChart.legendContainer = fdChart.g.append("g")
        .attr('class', 'legendContainer')
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")

    fdChart.legend = d3.select('.legendContainer')
        .selectAll("g")
        .data(fdChart.labels.slice())

    fdChart.initLegend = fdChart.legend.enter().append("g")
    .attr('class', 'legendEntry')
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });


    fdChart.initLegend.append("rect")
        .attr('class', 'legendRect')
        .attr("x", fdChart.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", fdChart.z);

    fdChart.initLegend.append("text")
        .attr('class', 'legendText')
        .attr("x", fdChart.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
    
    fdChart.xAxis = fdChart.g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + fdChart.height + ")")
        .call(d3.axisBottom(fdChart.x0));

    fdChart.y.domain([
        0, 
        d3.max(fdChart.formattedDataArray, function(d) { 
            return d3.max(fdChart.keys, function (key) {
                return d[key]
            })
        })
    ]).nice();

    fdChart.yAxis = fdChart.g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(fdChart.y).ticks(null, "s"))

    fdChart.yAxis.append("text")
        .attr("x", 2)
        //need to define the y domain before calculating this attribute
        //.attr("y", fdChart.y(fdChart.y.ticks().pop()) + 0.5)
        .attr("y", "0")
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text(fdChart.yAxisLabel);
        
        
    cInitChart()
}

function cInitChart() {
    fdChart.x1.domain(fdChart.labels).rangeRound([0, fdChart.x0.bandwidth()]);
    fdChart.y.domain([
        0, 
        d3.max(fdChart.formattedDataArray, function(d) { 
            return d3.max(fdChart.keys, function(key) {
                return d[key]
            })
        })
    ]).nice();
    fdChart.yAxis.transition().call(d3.axisLeft(fdChart.y).ticks(null, "s"))
        //add new groups
        //chart g tag
    fdChart.months = 
            fdChart.chartContainer
            .selectAll("g")
            .attr('class','monthContainer')
            .data(fdChart.column)
            .enter()
            .append("g")
            .attr('class', 'column')
            .attr("transform", function(value) { 
                return "translate(" + fdChart.x0(value) + ",0)"; })
            .selectAll("rect")
            .data(function(value) {
                    return fdChart.rawDataArray.map(function(d) {
                        return { key: d.category, value: d[value] }
                })
            })
            .enter()
            .append("rect")
            .attr('class','monthRoleValue')
            .attr("x", function(d) { 
                return fdChart.x1(d['key']); 
            }) 
            .attr('height', 0)
            .attr('y', fdChart.height)
            .on("mouseover", function(d) {		
                // fdChart.toolTip.transition()
                //     .duration(200)
                //     .style("opacity", .9);
                // fdChart.toolTip.html((d['key']).trim() + '<br>' + fdChart.currency  + mNumberWithCommas(d['value']))	
                //     .style("position", "absolute")
                    
                //     // .style("left", (d3.event.pageX) + "px")		
                //     // .style("top", (d3.event.pageY) + "px")
                //     // .style("top", (fdChart.y) + "px")
                //     .style("left", (d3.event.pageX) + "px")
                //     .style("top",  (document.getElementById(fdChart.svgId).getBoundingClientRect().y) + "px")
                //     .style('height', (((d['key']).trim() + '<br>' + fdChart.currency  + mNumberWithCommas(d['value'])).length * 1.5) + 'pt')
                d3.select(this).style('cursor', 'pointer')
                d3.select(this).style('opacity', 0.5);
                })					
            .on("mouseout", function(d) {		
                // fdChart.toolTip.transition()		
                //     .duration(500)		
                //     .style("opacity", 0)
                d3.select(this).style('opacity', 1);	
            })        
            .transition().duration(3000)
            .attr("width", fdChart.x1.bandwidth())
            .attr("height", function(d) { 
                return fdChart.height - fdChart.y(d['value']); 
            })
            .attr("y", function(d) { return fdChart.y(d['value']); })
            .attr("fill", function(d) { return fdChart.z(d['key']); });

            //register keyup
            d3.selectAll("input")
            .on("keyup", function() {
                cGetData(false)
            });
}
function cUpdateChart() {
    fdChart.x1.domain(fdChart.labels).rangeRound([0, fdChart.x0.bandwidth()]);
    fdChart.y.domain([
        0, 
        d3.max(fdChart.formattedDataArray, function(d) { 
            return d3.max(fdChart.keys, function(key) {
                return d[key]
            })
        })
    ]).nice();
    fdChart.yAxis.transition().call(d3.axisLeft(fdChart.y).ticks(null, "s"))
    
    //build months based on current data
    fdChart.months = 
            fdChart.chartContainer
            .selectAll("g")
            .attr('class','monthContainer')
            .data(fdChart.column)

    //create any potential new months
    fdChart.months
        .enter()
        .append("g")
        .attr('class', 'column')
        .attr("transform", function(value) { 
            return "translate(" + fdChart.x0(value) + ",0)"; })

    //do we need to delete any potential excess months??

    //get bars
    fdChart.rects = 
            fdChart.months
            .selectAll("rect")
            .data(function(value) {
                return fdChart.rawDataArray.map(function(d) {
                    return { key: d.category, value: d[value] }
                })
            })

    //delete excess bars
    fdChart.rects
        .exit()
        .remove()
        .transition()
        .duration(500)

    //update existing rects
    fdChart.rects
        .transition().duration(500)
        .attr("x", function(d) { return fdChart.x1(d['key']); }) 
        .attr("width", fdChart.x1.bandwidth())
        .attr("height", function(d) { 
            return fdChart.height - fdChart.y(d['value']); 
        })
        .attr("y", function(d) { return fdChart.y(d['value']); })


    //create new rects
    fdChart.rects
        .enter()
        .append("rect")
        .attr('class', 'monthRoleValue')
        .attr("x", function(d) { return fdChart.x1(d['key']); }) 
        .attr('height', 0)
        .attr('y', fdChart.height)
        .on("mouseover", function(d) {
            // fdChart.toolTip.transition()
            //     .duration(200)
            //     .style("opacity", .9);
            // fdChart.toolTip.html((d['key']).trim() + '<br>' + fdChart.currency  + mNumberWithCommas(d['value']))	
            //     .style("left", (d3.event.pageX) + "px")
            //     .style("top",  (document.getElementById(fdChart.svgId).getBoundingClientRect().y) + "px")
            //     .style('height', (((d['key']).trim() + '<br>' + fdChart.currency  + mNumberWithCommas(d['value'])).length * 1.5) + 'pt')
            d3.select(this).style('cursor', 'pointer')
            d3.select(this).style('opacity', 0.5);
            })					
        .on("mouseout", function(d) {		
            // fdChart.toolTip.transition()		
            //     .duration(500)		
            //     .style("opacity", 0)
            d3.select(this).style('opacity', 1);	
        })        
        .transition().duration(3000)
        .attr("width", fdChart.x1.bandwidth())
        .attr("height", function(d) { 
            return fdChart.height - fdChart.y(d['value']); 
        })
        .attr("y", function(d) { return fdChart.y(d['value']); })
        .attr("fill", function(d) { return fdChart.z(d['key']); });        


        ///update legend
        fdChart.legendEntries = 
            d3.select('.legendContainer')
                .selectAll('.legendEntry')
                // .data(this.labels.slice().reverse())
                .data(fdChart.labels)
                .enter()
                .append("g")
                .attr('class', 'legendEntry')
                .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; })

        fdChart.legendEntries.append("rect")
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .attr('class', 'legendRect')
            .attr("x", fdChart.width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", fdChart.z)
            .style('opacity', 1)

        fdChart.legendEntries.append("text")
            .style('opacity', 0)
            .transition()
            .duration(1000)  
            .attr('class', 'legendText')
            .attr("x", fdChart.width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; })
            .style('opacity', 1);            
}


function cGenerateRawDummyData() {
    for(i=0;i<fdChart.keys.length;i++) {
        fdChart.rawDataObject[fdChart.keys[i]] = {}
        fdChart.rawDataObject[fdChart.keys[i]]["category"] = fdChart.labels[i]
        for(j=0;j<fdChart.column.length;j++) {
            fdChart.rawDataObject[fdChart.keys[i]][fdChart.column[j]]
                = Math.round((Math.random()*50))
        }
    }
}