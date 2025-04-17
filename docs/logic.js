// Global variable to store shipwreck data
let shipwreckData = null;
let trianglesData = null;

// Step 1: Initialize the map
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

  var worldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Add default layer and define base layers
  streetLayer.addTo(map);
  let baseMaps = {
    "Streets": streetLayer,
    "Satellite": satelliteLayer,
    "Earth At Night": earthAtNight,
    "World Imagery": worldImagery
  };

  console.log('Map successfully initialized!')
  return { map, baseMaps };
};

// Step 2: Add overlays
let createOverlays = () => {
  let shipwrecks = new L.LayerGroup();
  let triangles = new L.LayerGroup();

  console.log('Overlays successfully created!')
  return { shipwrecks, triangles };
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
    else {
      trianglesData = data;
      console.log('Triangles data successfully fetched and stored!');
    }
  } catch (error) {
    console.error(error);
  }
};

// Step 4: Add shipwreck markers
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
      let waterDepth = point.water_depth || 'Unknown';
      let yearSunk = point.year_sunk || 'Unknown';

      let marker = L.marker([point.lat, point.lon])
      .bindPopup(
        `<b>${wreckName}</b><br>
        Lat: ${lat}<br>
        Lon: ${lon}<br>
        Vessel Type: ${vesselType}<br>
        Flag: ${flag}<br>
        Depth: ${waterDepth}<br>
        Year: ${yearSunk}`
      );
    markers.addLayer(marker); // Add marker to cluster group
    }
  });

  document.getElementById("resetButton").disabled = !filter;

  shipwreckLayer.addLayer(markers); // Add cluster group to shipwrecks layer
  console.log('Shipwreck successfully added!');
};

// Step 5: Add triangle polygons
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

// Function to reset and show all shipwrecks
let resetShipwrecks = (shipwreckLayer) => {

  document.getElementById("Start Date").value = "";
  document.getElementById("End Date").value = "";

  addShipwrecks(shipwreckLayer);
};

// Main logic to initialize buttons
document.addEventListener("DOMContentLoaded", () => {
  let { map, baseMaps } = initializeMap();
  let { shipwrecks, triangles } = createOverlays();

  let overlays = {
    "Shipwrecks": shipwrecks,
    "Triangles": triangles
  };

  // Add layer control
  L.control.layers(baseMaps, overlays).addTo(map);

  fetchData('../Resources/triangles.json').then(() => {
    if (trianglesData) {
      addTriangles(triangles);
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