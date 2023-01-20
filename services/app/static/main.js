import { lineChart } from './linechart.js';

var chartDiv = d3.select("#chart");
var width = chartDiv.node().getBoundingClientRect().width;

d3.select("#ticker").on("change", function () {
    var ticker = d3.select(this).property("value")

    d3.json(`http://localhost:8001/data?symbol=${ticker}`).then(function (d) {
        if (d.data.length == 0) {
            alert(`No data found for ${d.symbol} 😢.`)
            return
        }

        var chart = lineChart().height(250).width(width).symbol(d.symbol).data(d.data)

        chartDiv.call(chart);
    })
})