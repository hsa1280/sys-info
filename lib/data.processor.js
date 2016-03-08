"use strict";

require('shelljs/global');

var Data = require('./data.js');

var DataProcessor = function(size) {
    return {
        queue: [],
        size: size,
        addData: function(data) {
            if ( this.queue.length === this.size ) {
                this.queue.shift();
            }
            this.queue.push(data);
        },

        getServerLoad: function() {
            var execCmd = exec('uptime | sed -e \'s/\\(.*\\)\\(load average[s]*\\: \\)\\(.*\\)/\\3/\' | cut -d" " -f1');

            if ( execCmd.code === 0 ) {
                let data = execCmd.output.split(' ');
                this.addData(new Data(data[ 0 ].replace(/\n/,'') ));
            }
            console.log(this.queue);
        }
    }
}

module.exports = DataProcessor;