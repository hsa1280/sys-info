"use strict";

require('shelljs/global');

var Data = require('./data.js');

var DataProcessor = function(size) {
    return {
        queue: [],
        alertQueue: [],
        size: size,
        addData: function(data) {
            if ( this.queue.length === this.size ) {
                this.queue.shift();
            }
            this.queue.push(data);
        },

        clearQueue() {
            this.queue = [];
        },

        getServerLoad: function() {
            var execCmd = exec('uptime | sed -e \'s/\\(.*\\)\\(load averages\\: \\)\\(.*\\)/\\3/\' | cut -d" " -f1,2,3');

            if ( execCmd.code === 0 ) {
                let data = execCmd.output.split(' ');
                this.alertQueue.push(data[0]);
                this.addData(new Data(data[ 0 ], data[ 1 ], data[ 2 ].replace(/\n/,'') ));
            }
            console.log(this.queue);
        }
    }
}

module.exports = DataProcessor;