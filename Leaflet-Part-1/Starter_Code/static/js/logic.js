// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://stamen.com/">Stamen Design</a>'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [37.0902, -95.7129], // Coordinates for the center of the map (USA)
  zoom: 4,
  layers: [basemap] // Initially show only the basemap
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let baseMaps = {
  "Basemap": basemap,
  "Street": street
};

// We will define earthquakesLayer and tectonicPlatesLayer here for use later in the overlayMaps.
let earthquakesLayer, tectonicPlatesLayer;

let overlayMaps = {};

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      color: "#000000", // Black outline color
      weight: 1,         // Set the outline thickness
      opacity: 1,        // Set the opacity of the outline
      fillColor: getColor(feature.geometry.coordinates[2]), // Fill color based on depth
      fillOpacity: 0.8,  // Set the opacity of the fill color
      radius: getRadius(feature.properties.mag) // Set the size of the circle based on magnitude
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth <= 10) {
      return "#98ee00"; // Shallow earthquakes
    } else if (depth <= 30) {
      return "#d4ee00"; 
    } else if (depth <= 50) {
      return "#eecc00";
    } else if (depth <= 70) {
      return "#ee9c00";
    } else if (depth <= 90) {
      return "#ea822c";
    } else {
      return "#ea2c2c"; // Deep earthquakes
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  earthquakesLayer = L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(map);

  overlayMaps["Earthquakes"] = earthquakesLayer;

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    div.style.backgroundColor = "white";
    div.style.padding = "6px 8px";
    div.style.fontSize = "12px";
    div.style.lineHeight = "18px";
    div.style.color = "#555";
    div.style.borderRadius = "5px";
    div.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";
    div.style.width = "auto";
    div.style.minWidth = "130px";
    // Initialize depth intervals and colors for the legend
    let depthIntervals = [0, 10, 30, 50, 70, 90];
    let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

   // Loop through our depth intervals to generate a label with a colored square for each interval.
   for (let i = 0; i < depthIntervals.length; i++) {
    let colorBox = L.DomUtil.create("i"); // Create the colored square
    colorBox.style.backgroundColor = colors[i];
    colorBox.style.width = "15px";
    colorBox.style.height = "15px";
    colorBox.style.marginRight = "8px";
    colorBox.style.borderRadius = "3px";
    colorBox.style.display = "inline-block";
    colorBox.style.verticalAlign = "middle";
    
    // Add the color box and label to the legend div
    div.innerHTML += colorBox.outerHTML + " " + depthIntervals[i] + (depthIntervals[i + 1] ? '&ndash;' + depthIntervals[i + 1] : '+') + "<br>";
  }
  return div;
};

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    tectonicPlatesLayer = L.geoJson(plate_data, {
      color: "orange",
      weight: 2
    }).addTo(map);

    overlayMaps["Tectonic Plates"] = tectonicPlatesLayer;

    // Then add the tectonic_plates layer to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(map);
  });

});