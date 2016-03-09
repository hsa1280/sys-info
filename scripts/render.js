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
    ]
};

var last1MinDataSet = null;
var alertOccurred = false;
var last2Min = 120000;

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
   //update the data every 10 seconds
        setTimeout(function() {
            $.get( "/uptime", function( dataList ) {
              data.datasets[ 0 ].data = [];

              dataList.forEach(function(loadData, index) {
                    myLineChart.datasets[ 0 ].points[ index ].value = loadData.last1Min;
              });
              //Assign data set to external variable so we can use it in showAlert()
              last1MinDataSet = dataList;

              myLineChart.update();
            });
            updateData(frequency);
        }, frequency);
   }

   $.get( "/config", function( config ) {
       data.labels = [];
       data.datasets[ 0 ].data = [];
       for(var i=0; i< config.size; i++) {
            data.labels.push( (i * config.factor));
            data.datasets[ 0 ].data.push(0);
       }
       myLineChart = new Chart(ctx).Line(data, options);
       updateData(config.frequency);
   });

   //Start the showAlert() when running the application, then showAlert() will be invoked every two minutes
   setTimeout(showAlert, last2Min);
});

//Save the past two minutes data into array
function updateAlertQueue(list, data) {
    if ( list.length === 12 ) {
        list.shift();
    }
    list.push(data);
}

//check if we want to show alert
function showAlert() {
    var alertQueue = [];
    //push the past two minutes data into alertQueue
    last1MinDataSet.forEach(function(data){
        updateAlertQueue(alertQueue, data.last1Min);
    });
    //Sum the past two minutes data up
    var sum = alertQueue.reduce(function(pre, cur) {
        return pre + parseFloat(cur);
    }, 0);
    var loadAverage = parseFloat( (sum / 12).toFixed(2) );
    if (loadAverage > 1) {
        //Set alertOccurred flag to true for later use
        alertOccurred = true;
        var alertMessage = "High load generated an alert - load = " + loadAverage + ", triggered at " + new Date();
        var alertElement = document.getElementById("alert");
        if (alertElement) {
            var alertDiv = document.createElement('div');
            alertDiv.innerHTML = alertMessage;
            alertElement.appendChild(alertDiv);
        }
        alert(alertMessage);
    }
    //only shows this message when load average is lower than 2 and the load average was higher than 2 previously
    if (loadAverage < 1 && alertOccurred) {
        alertOccurred = false;
        alert("Load is back to normal at " + new Date());
    }
    //call showAlert() every 120 seconds
    setTimeout(showAlert, last2Min);
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