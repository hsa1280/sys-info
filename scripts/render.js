var data = {
    labels: [],
    datasets: [
        {
            label: "1 minute",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: []
        },
        {
            label: "5 minute",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: []
        },
        {
            label: "15 minute",
            fillColor: "rgba(151,167,195,0.5)",
            strokeColor: "rgba(151,167,195,0.8)",
            highlightFill: "rgba(151,167,195,0.75)",
            highlightStroke: "rgba(151,167,195,1)",
            data: []
        }
    ]
};

$( document ).ready(function() {
   var ctx = $("#myChart").get(0).getContext("2d");

   var options = {
        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero : true,

        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - If there is a stroke on each bar
        barShowStroke : true,

        //Number - Pixel width of the bar stroke
        barStrokeWidth : 2,

        //Number - Spacing between each of the X value sets
        barValueSpacing : 5,

        //Number - Spacing between data sets within X values
        barDatasetSpacing : 1,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

   var myLineChart = null;

   function updateData(frequency) {
        setTimeout(function() {
            $.get( "/uptime", function( dataProcessor ) {
              data.datasets[ 0 ].data = [];
              data.datasets[ 1 ].data = [];
              data.datasets[ 2 ].data = [];

              dataProcessor.queue.forEach(function(loadData, index) {


                    myLineChart.datasets[ 0 ].bars[ index ].value = loadData.last1Min;
                    myLineChart.datasets[ 1 ].bars[ index ].value = loadData.last5Min;
                    myLineChart.datasets[ 2 ].bars[ index ].value = loadData.last15Min;
              });

              myLineChart.update();
            });
            updateData(frequency);
        }, frequency);
   }

   function updateAlertQueue(list, data) {
        if ( list.length === 12 ) {
            list.shift();
        }
        list.push(data);
   }

   function showAlert() {
        var alertQueue = [];
        myLineChart.datasets[ 0 ].bars.forEach(function(barData){
            updateAlertQueue(alertQueue, barData.value);
        });
        if ( alertQueue.length === 12 ) {
            var sum = alertQueue.reduce(function(pre, cur) {
                return pre + parseFloat(cur);
            }, 0);
            if (sum / 12 > 1) {
                console.log("High average load!");
            }
        }
        setTimeout(showAlert, 30000);
   }

   $.get( "/config", function( config ) {
       data.labels = [];
       data.datasets[ 0 ].data = [];
       data.datasets[ 1 ].data = [];
       data.datasets[ 2 ].data = [];
       for(var i=0; i< config.size; i++) {
            data.labels.push( (i * config.factor) + ' secs');
            data.datasets[ 0 ].data.push(0);
            data.datasets[ 1 ].data.push(0);
            data.datasets[ 2 ].data.push(0);
       }
       myLineChart = new Chart(ctx).Bar(data, options);
       updateData(2000);
   });

   setTimeout(showAlert, 30000);
});


function startJob() {
    $.get( "/start", function( responseStr ) {
        console.log(responseStr);
    })
}

function stopJob() {
    $.get( "/stop", function( responseStr ) {
        console.log(responseStr);
    })
}

function clearQueue() {
    $.get( "/clear", function( responseStr ) {
        console.log(responseStr);
    })
}