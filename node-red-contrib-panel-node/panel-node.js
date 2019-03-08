module.exports = function(RED) {
    function showPanel(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msgdata = msg;
            // node.send(msgdata);
            initPanel(RED.httpNode || RED.httpAdmin, config.url || "/myui");
        })
    }
    RED.nodes.registerType("panel-node",showPanel);
}

var serveStatic = require('serve-static');
var path = require('path');
var msgdata = null;

function initPanel(app, url) {
    app.use(url, function(req, res) {
         var data = {
        "time": msgdata.payload,
        "cpu": msgdata.osInfo.cpuUsage/100
        };
        res.send(data);
    });
    app.use(serveStatic(path.join(__dirname,'public')));
}