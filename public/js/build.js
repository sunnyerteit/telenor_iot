// Make connection
var socket = io.connect();


let div_cache = {};

// Route variable
var route = [];
var route_path;


// On load, ask for json
// This has to load after the map
function initial_json() {
    socket.emit('loaded');
}

let temp_data;

let socket_switch = 0;

socket.on('json_send', function (data) {
    if (socket_switch == 0) {
    temp_data = data;
    let div_items = document.getElementById("items");

    // Create div tags in the items div
    for (var bin in data) {
        // Reset html_string
        let html_string = "";

        let div_garbage;

        if (data[bin].saturation < 33) {
            div_garbage = '<object class="item_img1" data="images/icon_bin_green.svg" type="image/svg+xml">'
        } else if (data[bin].saturation < 66) {
            div_garbage = '<object class="item_img1" data="images/icon_bin_yellow.svg" type="image/svg+xml">'
        } else {
            div_garbage = '<object class="item_img1" data="images/icon_bin_red.svg" type="image/svg+xml">'
        };

        let div_type;

        if (data[bin].type == 'PAPIR') {
            div_type = '<object class="item_img2" data="images/icon_papir.svg" type="image/svg+xml"></object>'
        } else if (data[bin].type == 'MAT') {
            div_type = '<object class="item_img2" data="images/icon_mat.svg" type="image/svg+xml"></object>'
        } else if (data[bin].type == 'PANT') {
            div_type = '<object class="item_img2" data="images/icon_pant.svg" type="image/svg+xml"></object>'
        } else {
            div_type = '<object class="item_img2" data="images/icon_rest.svg" type="image/svg+xml"></object>'
        }

        let div_battery;

        if (data[bin].battery < 33) {
            div_battery = '<object class="item_img3" data="images/icon_battery_red.svg" type="image/svg+xml"></object>'
        } else if (data[bin].battery < 66) {
            div_battery = '<object class="item_img3" data="images/icon_battery_yellow.svg" type="image/svg+xml"></object>'
        } else {
            div_battery = '<object class="item_img3" data="images/icon_battery_green.svg" type="image/svg+xml"></object>'
        }

        let div_compress;

        if (data[bin].compress == 1) {
            div_compress = '<object class="item_img4" data="images/icon_compress_highlight.svg" type="image/svg+xml"></object>'
        } else {
            div_compress = '<object class="item_img4" data="images/icon_compress.svg" type="image/svg+xml"></object>'
        }

        div_timestamp = new Date(data[bin].timestamp)

        div_timestamp_text = ('0' + div_timestamp.getHours()).slice(-2) + ':' + ('0' + div_timestamp.getMinutes()).slice(-2);

        // Establish html_string
        html_string = '<div class="item" id="item_' + bin + '">' +
            '<div class="item_div">' +
            // Change bin image
            div_garbage +
            '</object>' +
            '</div>' +
            '<div class="item_div">' +
            // Change name
            '<p class="item_div_2_p">' + data[bin].bin_id + '</p>' +
            // Change place
            '<p>' + data[bin].name + '</p>' +
            // Change cycles
            '<p>' + data[bin].cycles + ' sykler</p>' +
            '</div>' +
            '<div class="item_div">' +
            // Change type image
            div_type +
            // Change type
            '<p class="item_div_3_p">' + data[bin].type + '</p>' +
            '</div>' +
            '<div class="item_div"></div>' +
            '<div class="item_div">' +
            // Change battery image
            div_battery +
            // Change battery percent
            '<p class="item_div_5_p">' + parseInt(data[bin].battery) + '%</p>' +
            '</div>' +
            '<div class="item_div">' +
            '<div class="item_div_6_div" id="compress_' + bin + '">' +
            '<div class="item_div_6_div_div">' +
            div_compress +
            '</div>' +
            '<div class="item_div_6_div_div">' +
            '<p class="item_div_6_p_1">KOMPRIMER</p>' +
            '</div>' +
            '</div>' +
            '<p class="item_div_6_p_2">forrige: ' + div_timestamp_text + '</p>' +
            '</div>' +
            '</div>'


        div_items.insertAdjacentHTML('beforeend', html_string);

        div_cache[bin] = html_string;

        // Add marker
        add_marker(bin, { lat: data[bin].lat, lng: data[bin].lng }, data[bin].saturation);

        // Add ourte point
        route.push({ lat: data[bin].lat, lng: data[bin].lng })

        // Avoid global
        const div_id = bin

        // Add div on click with div id
        $("#item_" + div_id).click(function () {
            // Resets css
            $(".item").css("background-color", "");
            // Add new color on click
            $("#item_" + div_id).css("background-color", "#1D1F3D");
            for (var key in markers) {
                if (markers[key].icon.strokeOpacity == 0.7) {
                    markers[key].icon.strokeOpacity = 0.0;
                    markers[key].setMap(map);
                }
            };
            markers[div_id].icon.strokeOpacity = 0.7;
            markers[div_id].setMap(map);
        });

        // Add click on compress button
        $("#compress_" + div_id).click(function () {
            // Add socket emit
            socket.emit('compress', div_id);
        });
    };


    // Add route data
    route_path = new google.maps.Polyline({
        path: route,
        geodesic: true,
        strokeColor: '#888CFF',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    socket_switch = 1;
};

});

setInterval(function () {
    socket.emit('data_req');
    socket.on('json_req', function (data) {
        let div_items = document.getElementById("items");

        // Create div tags in the items div
        for (var bin in data) {
            // Reset html_string
            let html_string = "";

            let div_garbage;
            let div_saturation_color;

            if (data[bin].saturation < 33) {
                div_garbage = '<object class="item_img1" data="images/icon_bin_green.svg" type="image/svg+xml">'
                div_saturation_color = '#B8E986';
            } else if (data[bin].saturation < 66) {
                div_garbage = '<object class="item_img1" data="images/icon_bin_yellow.svg" type="image/svg+xml">'
                div_saturation_color = '#F8E71C';
            } else {
                div_garbage = '<object class="item_img1" data="images/icon_bin_red.svg" type="image/svg+xml">'
                div_saturation_color = '#EE677E';
            };

            let div_type;

            if (data[bin].type == 'PAPIR') {
                div_type = '<object class="item_img2" data="images/icon_papir.svg" type="image/svg+xml"></object>'
            } else if (data[bin].type == 'MAT') {
                div_type = '<object class="item_img2" data="images/icon_mat.svg" type="image/svg+xml"></object>'
            } else if (data[bin].type == 'PANT') {
                div_type = '<object class="item_img2" data="images/icon_pant.svg" type="image/svg+xml"></object>'
            } else {
                div_type = '<object class="item_img2" data="images/icon_rest.svg" type="image/svg+xml"></object>'
            }

            let div_battery;

            if (data[bin].battery < 33) {
                div_battery = '<object class="item_img3" data="images/icon_battery_red.svg" type="image/svg+xml"></object>'
            } else if (data[bin].battery < 66) {
                div_battery = '<object class="item_img3" data="images/icon_battery_yellow.svg" type="image/svg+xml"></object>'
            } else {
                div_battery = '<object class="item_img3" data="images/icon_battery_green.svg" type="image/svg+xml"></object>'
            }

            let div_compress;

            if (data[bin].compress == 1) {
                div_compress = '<object class="item_img4" data="images/icon_compress_highlight.svg" type="image/svg+xml"></object>'
            } else {
                div_compress = '<object class="item_img4" data="images/icon_compress.svg" type="image/svg+xml"></object>'
            }

            div_timestamp = new Date(data[bin].timestamp)

            div_timestamp_text = ('0' + div_timestamp.getHours()).slice(-2) + ':' + ('0' + div_timestamp.getMinutes()).slice(-2);

            // Establish html_string
            html_string = '<div class="item" id="item_' + bin + '">' +
                '<div class="item_div">' +
                // Change bin image
                div_garbage +
                '</object>' +
                '</div>' +
                '<div class="item_div">' +
                // Change name
                '<p class="item_div_2_p">' + data[bin].bin_id + '</p>' +
                // Change place
                '<p>' + data[bin].name + '</p>' +
                // Change cycles
                '<p>' + data[bin].cycles + ' sykler</p>' +
                '</div>' +
                '<div class="item_div">' +
                // Change type image
                div_type +
                // Change type
                '<p class="item_div_3_p">' + data[bin].type + '</p>' +
                '</div>' +
                '<div class="item_div"></div>' +
                '<div class="item_div">' +
                // Change battery image
                div_battery +
                // Change battery percent
                '<p class="item_div_5_p">' + parseInt(data[bin].battery) + '%</p>' +
                '</div>' +
                '<div class="item_div">' +
                '<div class="item_div_6_div" id="compress_' + bin + '">' +
                '<div class="item_div_6_div_div">' +
                div_compress +
                '</div>' +
                '<div class="item_div_6_div_div">' +
                '<p class="item_div_6_p_1">KOMPRIMER</p>' +
                '</div>' +
                '</div>' +
                '<p class="item_div_6_p_2">forrige: ' + div_timestamp_text + '</p>' +
                '</div>' +
                '</div>'

            if (html_string == div_cache[bin]) {
            } else {
                // Avoid global
                const local_bin = bin;

                // Save background color
                div_backgroundcolor = $("#item_" + bin).css('background-color');

                // Append new html
                $("#item_" + bin).replaceWith(html_string);

                // Add old background color
                $("#item_" + bin).css('background-color', div_backgroundcolor);
                div_cache[bin] = html_string;

                // Change marker if needed

                if (markers[local_bin].icon.fillColor != div_saturation_color) {
                    markers[local_bin].icon.fillColor = div_saturation_color;
                    markers[local_bin].setMap(map);
                };

                // Click
                $("#item_" + bin).click(function () {
                    // Resets css
                    $(".item").css("background-color", "");
                    // Add new color on click
                    $("#item_" + local_bin).css("background-color", "#1D1F3D");
                    // Marker outline
                    for (var key in markers) {
                        if (markers[key].icon.strokeOpacity == 0.7) {
                            markers[key].icon.strokeOpacity = 0.0;
                            markers[key].setMap(map);
                        }
                    };
                    markers[local_bin].icon.strokeOpacity = 0.7;
                    markers[local_bin].setMap(map);

                });

                // Add click on compress button
                $("#compress_" + bin).click(function () {
                    // Add socket emit
                    socket.emit('compress', local_bin);
                });
            }





        };
    });

}, 1000);
