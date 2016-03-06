"use strict";

require('shelljs/global');

var Data = require('./data.js');

var DataProcessor = function(size) {
    return {
        queue: [],
        size: size,
        addData: function(data) {
            if ( this.queue.length === this.size ) {
                this.queue.pop();
            }
            this.queue.push(data);
        },

        getServerLoad: function() {
            var execCmd = exec('uptime | tr -s " " " " | cut -d" " -f10,11,12');

            if ( execCmd.code === 0 ) {
                let data = execCmd.output.split(' ');
                this.addData(new Data(data[ 0 ], data[ 1 ], data[ 2 ].replace(/\n/,'') ));
            }
            console.log(this.queue);
        }
    }
}

module.exports = DataProcessor;