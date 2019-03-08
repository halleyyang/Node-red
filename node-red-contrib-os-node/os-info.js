module.exports = function(RED) {
    function getOsInfo(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.previousTotalTick = []; 
        this.previousTotalIdle = [];
        node.on('input', function(msg) {
        	msg.osInfo = getInfo(this);
            node.send(msg);
        })
    }
    RED.nodes.registerType("os-info",getOsInfo);
}

function getInfo(node) {
    var osInfo = {
        "loadavg": loadAvg(),
        "cpuUsage": cpuUsage(node),
        "memory": memUsage()
    };
    return osInfo;
}

var os = require('os');
function loadAvg() {
    var loadavg = os.loadavg();
    return loadavg;
}

function memUsage() {
    var freemem = os.freemem();
    var totalmem = os.totalmem();
    var memUsage = (totalmem-freemem)/totalmem * 100;
    return memUsage;
}

function cpuUsage(node) {
    var currentTotalTick = [];
    var currentTotalIdle = [];
    var overallUsagePercentage = 0;
                  
    // Calculate the current CPU usage percentage (for each of the 4 CPU cores)
    for(var i = 0, len = os.cpus().length; i < len; i++) {
        currentTotalTick.push(0);
        currentTotalIdle.push(0);
                
        // Current total number of CPU ticks (spent in user, nice, sys, idle, and irq)
        for(var type in os.cpus()[i].times) {
            currentTotalTick[i] += os.cpus()[i].times[type];
        }
                
        // Current total idle time
        currentTotalIdle[i] += os.cpus()[i].times.idle;
                
        // Difference in idle and total time, compared to the previous calculation.
        // I.e. difference since the last time this node has been triggered!
        var totalTickDifference = currentTotalTick[i] - ( node.previousTotalTick[i] || 0 );
        var totalIdleDifference = currentTotalIdle[i] - ( node.previousTotalIdle[i] || 0 );
                
       // Average percentage CPU usage (of the period since the previous trigger of this node)
       var percentageCPU = 100 - ~~(100 * totalIdleDifference / totalTickDifference);
         
                
       overallUsagePercentage += percentageCPU;
    }
            
    // Store the current counters for the next calculation
    node.previousTotalTick = currentTotalTick;
    node.previousTotalIdle = currentTotalIdle;
    return overallUsagePercentage = overallUsagePercentage/os.cpus().length;

}