// Global variables to store data
let shipwreckData = null;
let trianglesData = null;
let hotspotsData = null;
let circumstanceData = null;

// Initialize the map
let initializeMap = () => {
  let map = L.map('map').setView([0, 0], 2); // Center map at 0,0 with zoom level 2

  // Tile layers
  let satelliteLayer = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
  });

  let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
    maxZoom: 18
  });

  var earthAtNight = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    minZoom: 1,
    maxZoom: 8,
    format: 'jpg',
    time: '',
    tilematrixset: 'GoogleMapsCompatible_Level'
  });

  // Add default layer and define base layers
  streetLayer.addTo(map);
  let baseMaps = {
    "Streets": streetLayer,
    "Satellite": satelliteLayer,
    "Earth At Night": earthAtNight
  };

  console.log('Map successfully initialized!')
  return { map, baseMaps };
};

// Add overlays
let createOverlays = () => {
  let shipwrecks = new L.LayerGroup();
  let triangles = new L.LayerGroup();
  let hotspots = new L.LayerGroup();
  let circumstances = new L.LayerGroup();

  console.log('Overlays successfully created!')
  return { shipwrecks, triangles, hotspots, circumstances };
};

// Step 3: Function to fetch and store data
let fetchData = async (url) => {
  try {
    let response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load JSON file: ${url}`);
    let data = await response.json();
    if (url == '../Resources/points.json') {
      shipwreckData = data;
      console.log('Shipwrecks data successfully fetched and stored!');
    }
    else if (url == '../Resources/hotspots.json') {
      hotspotsData = data;
      console.log('Hotspots data successfully fetched and stored!')
    }
    else if (url == '../Resources/circumstances.json') {
      circumstanceData = data;
      console.log('Circumstance data successfully fetched and stored!')
    }
    else {
      trianglesData = data;
      console.log('Triangles data successfully fetched and stored!');
    }
  } catch (error) {
    console.error(error);
  }
};

// Add shipwreck markers
let addShipwrecks = (shipwreckLayer) => {

  shipwreckLayer.clearLayers(); // Clear existing markers

  let markers = L.markerClusterGroup(); // Cluster group for shipwrecks
  let startYear = parseInt(document.getElementById("Start Date").value, 10) || 0;
  let endYear = parseInt(document.getElementById("End Date").value, 10) || 0;

  let filter = (startYear != 0);

  shipwreckData.forEach(point => {

    if (!filter || (
      filter && point.year_sunk && point.year_sunk >= startYear && point.year_sunk <= endYear
    )) {
      let wreckName = point.wreck_name || point.wreck_id || 'Unknown';
      let lat = point.lat ?? 'Unknown';
      let lon = point.lon ?? 'Unknown';
      let vesselType = point.vessel_type || 'Unknown';
      let flag = point.flag || 'Unknown';
      let cargo = point.cargo || 'Unknown';
      let waterDepth = point.water_depth || 'Unknown';
      let yearSunk = point.year_sunk || 'Unknown';

      let marker = L.marker([point.lat, point.lon])
        .bindPopup(
          `<b>${wreckName}</b><br>
        Lat: ${lat}<br>
        Lon: ${lon}<br>
        Vessel Type: ${vesselType}<br>
        Flag: ${flag}<br>
        Cargo: ${cargo}<br>
        Depth: ${waterDepth}<br>
        Year: ${yearSunk}`
        );
      markers.addLayer(marker); // Add marker to cluster group
    }
  });

  document.getElementById("resetButton").disabled = !filter;

  shipwreckLayer.addLayer(markers); // Add cluster group to shipwrecks layer
  console.log('Shipwrecks successfully added!');
};

// Add triangle polygons
let addTriangles = (trianglesLayer) => {
  trianglesData.forEach(triangle => {
    let polygonCoordinates = triangle.points.map(coord => [coord.latitude, coord.longitude]);
    let polygon = L.polygon(polygonCoordinates, {
      color: 'red',
      weight: 2,
      fillOpacity: 0.3
    }).bindPopup(`<b>${triangle.name}</b>
      <br><b>Story:</b><br>${triangle.story}`);

    trianglesLayer.addLayer(polygon); // Add polygon to triangles layer
  });
  console.log('Triangles successfully added!')
};

// Add circle polygons
let addHotspots = (hotspotsLayer) => {
  hotspotsData.features.forEach(hotspot => {
    let centerCoordinates = hotspot.properties.center_coordinates;
    let areaName = hotspot.properties.area;
    let wreckCount = hotspot.properties.wreck_count;

    let hotspotCircle = L.circle(centerCoordinates, {
      color: 'blue',
      weight: 2,
      fillOpacity: 0.3,
      radius: Math.sqrt(wreckCount) * 1600
    }).bindPopup(`<b>${areaName}</b>
      <br>Wreck count: ${wreckCount}`);

    hotspotsLayer.addLayer(hotspotCircle);
  });

  console.log('Hotspots successfully added!');
};

let addCircumstances = (circumstancesLayer) => {
  circumstanceData.forEach(circumstance => {
    let wreckid = circumstance.wreck_id;
    let circumstan = circumstance.circumstan_known;


    let circumstanceMarkers = L.marker([circumstance.latitude, circumstance.longitude])
      .bindPopup(
        `<b>${wreckid}</b><br>
        Circumstances:
        <br>${circumstan}`
      );
    circumstancesLayer.addLayer(circumstanceMarkers); // Add marker to cluster group
  });
  
  console.log(`Circumstances successfully added!`);
};


// Function to reset and show all shipwrecks
let resetShipwrecks = (shipwreckLayer) => {

  document.getElementById("Start Date").value = "";
  document.getElementById("End Date").value = "";
  document.getElementById("submitButton").disabled = true;
  submitBtn.style.backgroundColor = "gray";
  document.getElementById("resetButton").disabled = true;
  resetBtn.style.backgroundColor = "gray";

  shipwreckLayer.clearLayers(); // Clear existing markers
  // shipwreckLayer.remove(); // Remove the layer from the map

  //shipwreckLayer.clearLayers();
  requestAnimationFrame(() => addShipwrecks(shipwreckLayer));
  addShipwrecks(shipwreckLayer);
};

// --------------------------- Toggling buttons based on input values (START) ---------------------------
// Get references to inputs and buttons
let startDateInput = document.getElementById('Start Date');
let endDateInput = document.getElementById('End Date');
let submitBtn = document.getElementById('submitButton');
let resetBtn = document.getElementById('resetButton');

// Function to toggle buttons
function toggleButtons() {
  let startFilled = startDateInput.value !== '';
  let endFilled = endDateInput.value !== '';

  let enable = startFilled && endFilled;

  submitBtn.disabled = !enable;
  resetBtn.disabled = !enable;


}

// Attach event listeners to both inputs
startDateInput.addEventListener('input', toggleButtons);
endDateInput.addEventListener('input', toggleButtons);
// --------------------------- Toggling buttons based on input values (END) ---------------------------

// Main logic to initialize buttons
document.addEventListener("DOMContentLoaded", () => {
  let { map, baseMaps } = initializeMap();
  let { shipwrecks, triangles, hotspots, circumstances } = createOverlays();

  let overlays = {
    "Shipwrecks": shipwrecks,
    "Triangles": triangles,
    "Hotspots": hotspots,
    "Circumstances": circumstances
  };

  if (submitBtn.disabled == true) {
    submitBtn.style.backgroundColor = "gray";
  }
  else {
    submitBtn.style.backgroundColor = "#007BFF";
  }

  if (resetBtn.disabled == true) {
    resetBtn.style.backgroundColor = "gray";
  }
  else {
    resetBtn.style.backgroundColor = "#007BFF";
  }

  // Add layer control
  L.control.layers(baseMaps, overlays).addTo(map);

  fetchData('../Resources/triangles.json').then(() => {
    if (trianglesData) {
      addTriangles(triangles);
    }
  })

  fetchData('../Resources/circumstances.json').then(() => {
    if (circumstanceData) {
      addCircumstances(circumstances);
    }
  })

  fetchData('../Resources/hotspots.json').then(() => {
    if (hotspotsData) {
      addHotspots(hotspots);
    }
  })


  // Fetch data only once
  fetchData('../Resources/points.json').then(() => {
    if (shipwreckData) {
      addShipwrecks(shipwrecks);
    }
    shipwrecks.addTo(map); // Ensure shipwreck layer is added to the map

    // Add event listener for the "Submit" button
    document.getElementById("submitButton").addEventListener("click", () => {
      addShipwrecks(shipwrecks); // Add filtered shipwrecks to the map
    });

    // Add event listener for the "Reset" button
    document.getElementById("resetButton").addEventListener("click", () => {
      resetShipwrecks(shipwrecks); // Reset to show all shipwrecks
    });
  });
});