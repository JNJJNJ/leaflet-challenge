// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
// Once we get a response, send the data.features object to the createFeatures function.
createFeatures(data.features);
});

function createFeatures(earthquakeData) {

// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
function onEachFeature(feature, layer) {
layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
<p>Magnitude: ${feature.properties.mag}</p>
<p>Depth: ${feature.geometry.coordinates[2]} km</p>
<p>${new Date(feature.properties.time)}</p>`);
}

// Create a GeoJSON layer that contains the features array on the earthquakeData object.
// Run the onEachFeature function once for each piece of data in the array.
let earthquakes = L.geoJSON(earthquakeData, {
pointToLayer: function (feature, latlng) {
// Determine marker size based on magnitude
let magnitude = feature.properties.mag;
let size = magnitude * 5; 

// Determine marker color based on depth
let depth = feature.geometry.coordinates[2];
let color = getColor(depth);

return L.circleMarker(latlng, {
radius: size,
fillColor: color,
color: "#000",
fillOpacity: 0.8
});
},
onEachFeature: onEachFeature
});

// Send our earthquakes layer to the createMap function
createMap(earthquakes);
}

function createMap(earthquakes) {

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
"Street Map": street,
"Topographic Map": topo
};

// Create an overlay object to hold our overlay.
let overlayMaps = {
Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
center: [37.09, -95.71],
zoom: 5,
layers: [street, earthquakes]
});

// Add legend to map
addLegend(myMap);
}

// Function to get color based on depth
function getColor(depth) {
return depth > 100 ? '#FF0000' : 
depth > 50 ? '#FF7F00' : 
depth > 20 ? '#FFFF00' : 
'#00FF00'; 
}

// Function to add legend to map
function addLegend(map) {
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
let div = L.DomUtil.create('div', 'info legend');
const depths = [0, 20, 50, 100];
const labels = ['<strong>Depth (km)</strong>',
'<span style="background-color:#00FF00"></span> <20',
'<span style="background-color:#FFFF00"></span> 20-50',
'<span style="background-color:#FF7F00"></span> 50-100',
'<span style="background-color:#FF0000"></span> >100'];

depths.forEach((depth, index) => {
div.innerHTML += labels[index] + '<br>';
});

return div;
};

legend.addTo(map);
}

// Create a layer control. 
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map. 
L.control.layers(baseMaps, overlayMaps, { 
    collapsed: false 
}).addTo(myMap);