var data = {
    labels: [],
    datasets: [
        {
            label: "1 minute",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
        }
//        {
//            label: "5 minute",
//            fillColor: "rgba(151,187,205,0.2)",
//            strokeColor: "rgba(151,187,205,1)",
//            pointColor: "rgba(151,187,205,1)",
//            pointStrokeColor: "#fff",
//            pointHighlightFill: "#fff",
//            pointHighlightStroke: "rgba(151,187,205,1)",
//            data: []
//        },
//        {
//            label: "15 minute",
//            fillColor: "rgba(151,167,215,0.2)",
//            strokeColor: "rgba(151,167,215,1)",
//            pointColor: "rgba(151,167,215,1)",
//            pointStrokeColor: "#fff",
//            pointHighlightFill: "#fff",
//            pointHighlightStroke: "rgba(151,187,205,1)",
//            data: []
//        }
    ]
};

var last1MinDataSet = null;
var alertMessageQueue = [];
var alertOccured = false;

$( document ).ready(function() {
   var ctx = $("#myChart").get(0).getContext("2d");

   var options = {
         ///Boolean - Whether grid lines are shown across the chart
         scaleShowGridLines : true,

         //String - Colour of the grid lines
         scaleGridLineColor : "rgba(0,0,0,.05)",

         //Number - Width of the grid lines
         scaleGridLineWidth : 1,

         //Boolean - Whether to show horizontal lines (except X axis)
         scaleShowHorizontalLines: true,

         //Boolean - Whether to show vertical lines (except Y axis)
         scaleShowVerticalLines: true,

         //Boolean - Whether the line is curved between points
         bezierCurve : true,

         //Number - Tension of the bezier curve between points
         bezierCurveTension : 0.4,

         //Boolean - Whether to show a dot for each point
         pointDot : true,

         //Number - Radius of each point dot in pixels
         pointDotRadius : 4,

         //Number - Pixel width of point dot stroke
         pointDotStrokeWidth : 1,

         //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
         pointHitDetectionRadius : 20,

         //Boolean - Whether to show a stroke for datasets
         datasetStroke : true,

         //Number - Pixel width of dataset stroke
         datasetStrokeWidth : 2,

         //Boolean - Whether to fill the dataset with a colour
         datasetFill : true,

         //String - A legend template
         legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

   };

   var myLineChart = null;

   function updateData(frequency) {
   //update the data every 2 seconds, we can change it to 10 seconds later
        setTimeout(function() {
            $.get( "/uptime", function( dataList ) {
              data.datasets[ 0 ].data = [];
//              data.datasets[ 1 ].data = [];
//              data.datasets[ 2 ].data = [];

              dataList.forEach(function(loadData, index) {
                    myLineChart.datasets[ 0 ].points[ index ].value = loadData.last1Min;
//                    myLineChart.datasets[ 1 ].points[ index ].value = loadData.last5Min;
//                    myLineChart.datasets[ 2 ].points[ index ].value = loadData.last15Min;
              });
              last1MinDataSet = myLineChart.datasets[0];

              myLineChart.update();
            });
            updateData(frequency);
        }, frequency);
   }

   $.get( "/config", function( config ) {
       data.labels = [];
       data.datasets[ 0 ].data = [];
//       data.datasets[ 1 ].data = [];
//       data.datasets[ 2 ].data = [];
       for(var i=0; i< config.size; i++) {
            data.labels.push( (i * config.factor));
            data.datasets[ 0 ].data.push(0);
//            data.datasets[ 1 ].data.push(0);
//            data.datasets[ 2 ].data.push(0);
       }
       myLineChart = new Chart(ctx).Line(data, options);
       updateData(config.frequency);
   });

   setTimeout(showAlert, 30000);
});

function updateAlertQueue(list, data) {
    if ( list.length === 12 ) {
        list.shift();
    }
    list.push(data);
}

function showAlert() {
    var alertQueue = [];
    last1MinDataSet.points.forEach(function(barData){
        updateAlertQueue(alertQueue, barData.value);
    });
    var sum = alertQueue.reduce(function(pre, cur) {
        return pre + parseFloat(cur);
    }, 0);
    var loadAverage = sum / 12;
    if (loadAverage > 2) {
        alertOccured = true;
        var message = "High load generated an alert - load = " + loadAverage + ", triggered at " + new Date();
        alertMessageQueue.push(message);
        var alertElement = document.getElementById("alert");
        if (alertElement)
            alertElement.innerHTML = alertMessageQueue;
        alert(message);
    }
    //only shows this message when load average is lower than 2 and the load average was higher than 2 previously
    if (loadAverage < 2 && alertOccured) {
        alertOccured = false;
        alert("Load is back to normal at " + new Date());
    }
    //check showAlert() every 30 seconds, we can change it to 2 minutes later
    setTimeout(showAlert, 30000);
}

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