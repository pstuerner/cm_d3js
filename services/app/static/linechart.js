const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");

function tweenDash() {
    var l = this.getTotalLength();
    return d3.interpolateString("0," + l, l + "," + l);
  }

function transition(path) {
    path.transition()
      .duration(1000)
      .attrTween("stroke-dasharray", tweenDash)
      .on("end", function () { d3.select(this).attr("stroke-dasharray", null); });
  }


export function lineChart() {
    var symbol = "";
    var data = [];
    var margin = { top: 20, right: 40, bottom: 20, left: 40 };
    var width = 900 - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
    var yExtent = [0,0];
    var xExtent = [0,0];

    var xValue = function(d) { return parseDate(d["Date"]); };
    var yValue = function(d) { return d["Close"]; };

    var xScale = d3.scaleTime();
    var xScaleZoom = d3.scaleTime();
    var yScale = d3.scaleLinear();
    var yScaleZoom = d3.scaleLinear();

    var xAxis = d3
        .axisBottom(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(d3.timeMonth.filter(function(d) { return d.getMonth() == 0; }))
    var yAxis = d3.axisLeft(yScale);

    var line = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    var updateData, updateSymbol, updateWidth, updateHeight;

    function chart(selection) {
        selection.each(function () {
            function zoomChart(event) {
                xScale.domain(event.transform.rescaleX(xScaleZoom).domain())
                yScale.domain(event.transform.rescaleY(yScaleZoom).domain())
                
                xAxisG.call(xAxis);
                yAxisG.call(yAxis);

                lines.selectAll("path").attr("d", d=>line(d.timeseries))
              }

            var zoom = d3.zoom()
              .scaleExtent([.5, 20])
              .on("zoom", zoomChart);

            xExtent = d3.extent(data, d=>xValue(d));
            yExtent = d3.extent(data, d=>yValue(d))
            
            xScale.range([0, width]).domain(xExtent);
            xScaleZoom.range([0, width]).domain(xExtent);
            yScale.range([height, 0]).domain(yExtent);
            yScaleZoom.range([height, 0]).domain(yExtent);

            var svg = d3.select(this).append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .call(zoom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
            
            svg
                .append("defs")
                .append("SVG:clipPath")
                .attr("id", "clip")
                .append("SVG:rect")
                .attr("width", width + margin.left + margin.right )
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);
            
            var lines = svg.append("g").attr("clip-path", "url(#clip)")
            
            var xAxisG = svg.append("g").attr("transform", `translate(0, ${height})`);
            xAxisG.transition().duration(1500).call(xAxis);
              
            var yAxisG = svg.append("g");
            yAxisG.transition().duration(1500).call(yAxis);

            var headline = svg
                .append("a")
                .attr("target", "_blank")
                .attr("xlink:href", `https://finance.yahoo.com/quote/${symbol}`)
                .append("text")
                .text(symbol)
                .attr("x", (width + margin.left + margin.right) / 2)
                .attr("y", 0)
                .attr("text-anchor", "middle"); 

            lines.selectAll(".line")
                .data([{timeseries: data}])
                .join(
                    enter => enter
                        .append("g")
                        .attr("class", "line")
                        .append("path")
                        .attr("d", d => line(d.timeseries))
                        .style('fill', 'none')
                        .style('stroke', "steelblue")
                        .style('stroke-width', 2)
                        .call(transition),
                    update => update.select("path").attr("d", d => line(d.timeseries)),
                    exit => {
                        exit.transition().duration(500).select("path").style("stroke", "white")
                        exit.transition().delay(500).remove();
                    }
                )
            
            updateData = function(value) {
            };

            updateSymbol = function(value) {
            };

            updateWidth = function() {
            }

            updateHeight = function() {
            }
        });
    }

    chart.width = function(value) {
    	if (!arguments.length) return width;
    	width = value - margin.left - margin.right;
    	if (typeof updateWidth === 'function') updateWidth();
    	return chart;
	};

    chart.height = function(value) {
    	if (!arguments.length) return height;
    	height = value - margin.top - margin.bottom;
    	if (typeof updateHeight === 'function') updateHeight();
    	return chart;
	};

    chart.symbol = function(value) {
    	if (!arguments.length) return title;
    	symbol = value;
    	if (typeof updateSymbol === 'function') updateSymbol();
    	return chart;
	};

    chart.data = function(value) {
    	if (!arguments.length) return data;
        data = value
    	if (typeof updateData === 'function') updateData(value);
    	return chart;
	};
    
    return chart;
}
    
