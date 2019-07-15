// Color the graph according area
plot(carea_list);
function plot(carea_list){

    areacolors = (function(){
        let colors= []
        for (const area of carea_list) {
            let col = getColorByArea(area.y);
            colors.push(col);
        }

        return colors; 
    }());


    Highcharts.chart('piechart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Percentage Area'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                colors:areacolors,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                // showInLegend:true
            }
        },
        series: [{
            name: 'Area',
            colorByPoint: true,
            data:carea_list
        }]
    });

    // categories
    let const_list = [];
    carea_list.forEach(value => const_list.push(value.name));

    // Column plots
    Highcharts.chart('linegraph', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Sub-county Area'
        },
        xAxis: {
            categories:const_list,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Area (m sq)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} m sq</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                color:'#b30000'
            }
        },
        series: [{
            name: 'Area',
            data: carea_list
        }]
    });
}
	