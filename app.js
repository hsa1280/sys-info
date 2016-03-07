require('shelljs/global');

var size = 20
var DataProcessor = new require('./lib/data.processor.js')(size);

var express = require('express');
var app = express();
var cron = require('cron');

app.use('/lib/chart.js', express.static(__dirname + '/node_modules/chartjs/chart.js'));
app.use('/lib/jquery.js', express.static(__dirname + '/node_modules/jquery/dist/jquery.js'));
app.use('/index.html', express.static(__dirname + '/index.html'));

app.use('/scripts', express.static(__dirname + '/scripts'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/uptime', (req, res) => {
    res.send(DataProcessor);
});

app.get('/stop', (req, res) => {
    cronJob.stop();
    res.send("Cronjob stopped");
});

app.get('/config', (req, res) => {
    res.send({
        size: size,
        frequency: 2000,
        factor: 10
    });
});

app.get('/start', (req, res) => {
    cronJob.start();
    res.send("Cronjob started");
});

var cronJob = cron.job("*/2 * * * * *", () => {
    DataProcessor.getServerLoad();
    console.log(DataProcessor);
    console.log('cron job completed');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
