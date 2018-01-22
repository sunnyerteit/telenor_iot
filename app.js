var express = require('express');
var socket = require('socket.io');
fs = require('fs');

// Load json file, might be redundant
let bins_json = JSON.parse(fs.readFileSync('bins.json').toString());

// Set up server
var view = express();

// Listening
var server = view.listen(4000, function () {
    console.log('listening to port 4000');
});



// Adds static folder
view.use(express.static('public'));

// Socket
var io = socket(server);

io.on('connection', function (socket) {
    // Socket on-load listener
    socket.on('loaded', function () {
        console.log('has loaded');
        io.sockets.emit('json_send', bins_json);
    });

    socket.on('data_req', function () {
        bins_json = JSON.parse(fs.readFileSync('bins.json').toString());
        io.sockets.emit('json_req', bins_json)
    });

    //Listener for compress
    socket.on('compress', function (data) {
        bins_json = JSON.parse(fs.readFileSync('bins.json').toString());
        console.log(data);
        if (data == 'bin1') {
            bins_json[data].start_compress = 1;
        } else {
            bins_json[data].compress = 1;
        }
        let json = JSON.stringify(bins_json, null, 4);
        fs.writeFile('bins.json', json, 'utf8');
    });

});

setInterval(function () {
    bins_json = JSON.parse(fs.readFileSync('bins.json').toString());
    for (var bin in bins_json) {
        if (bin == 'bin1') {
        } else {
            if (bins_json[bin].battery < 1) {
                bins_json[bin].battery = Math.random() * 50 + 50;
            } else {
                bins_json[bin].battery -= Math.random() * 0.5;
            }
            if (bins_json[bin].compress == 1) {
                bins_json[bin].saturation = 0;
                bins_json[bin].compress = 0;
                bins_json[bin].start_compress = 0;
                bins_json[bin].cycles += 1;
                event = new Date();
                bins_json[bin].timestamp = event.toJSON();
            } else {
                bins_json[bin].saturation += Math.random() * 0.5;
            };
        }
    }
    let json = JSON.stringify(bins_json, null, 4);
    fs.writeFile('bins.json', json, 'utf8');
}, 60000);




////////////////BACK-END////////////

let m = JSON.parse(fs.readFileSync('bins.json').toString());

// Updates original object
function update_json(original, incoming) {
    Object.keys(incoming).forEach(function (key_1) {
        Object.keys(original[key_1]).forEach(function (key_2) {
            if (key_2 in incoming[key_1]) {
                original[key_1][key_2] = incoming[key_1][key_2];
            }
        })
    });
}

function update_bin(original, incoming) {
    Object.keys(incoming).forEach(function (key) {
        // Update if previous value is string
        if (typeof original[key] === 'string' || original[key] instanceof String) {
            original[key] = incoming[key];
        }
        // Update if previous value is num
        else if (!isNaN(incoming[key])) {
            original[key] = parseFloat(incoming[key]);
        }
    });
}

// Check if bin is compressing
function compress_cycle(original, incoming) {
    if (original.compress == 1 && parseFloat(incoming.compress) == 0) {
        original.start_compress = 0;
        // Add compress cycle
        original.cycles += 1;


        // Resert start_compress

        // Add new timestamp
        var timestamp = new Date();
        original.timestamp = timestamp;
    }
}

// Create back-end server
var app = express();

app.get('/send/', function (req, res) {
    // Read json
    let m = JSON.parse(fs.readFileSync('bins.json').toString());

    // Check if compress is changed from active to inactive
    compress_cycle(m.bin1, req.query);
    // Update data based on query string
    update_bin(m.bin1, req.query);

    // Send updated start_compress
    res.send({ start_compress: m.bin1.start_compress });
    let json = JSON.stringify(m, null, 4);
    // Write beautified json
    fs.writeFile('bins.json', json, 'utf8');
});

app.get('/data/', function (req, res) {
    let m = JSON.parse(fs.readFileSync('bins.json').toString());
    // Export beautified json
    let json = JSON.stringify(m, null, 4);
    res.set({ 'Content-Type': 'application/json; charset=utf-8' }).send(json);
});

app.listen(3000);