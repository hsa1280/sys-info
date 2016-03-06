"use strict";

var Data = function(last1Min, last5Min, last15Min) {
    return {
        last1Min: last1Min,
        last5Min: last5Min,
        last15Min: last15Min
    };
}

module.exports = Data;