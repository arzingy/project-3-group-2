// Global variable to store shipwreck data
let shipwreckData = null;
let trianglesData = null;

// Step 1: Initialize the map
const initializeMap = () => {
  const map = L.map('map').setView([0, 0], 2); // Center map at 0,0 with zoom level 2

  // Tile layers
  const satelliteLayer = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
  });

  const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
  satelliteLayer.addTo(map);
  const baseMaps = {
    "Satellite": satelliteLayer,
    "Streets": streetLayer,
    "Earth At Night": earthAtNight
  };

  console.log('Map successfully initialized!')
  return { map, baseMaps };
};

// Step 2: Add overlays
const createOverlays = () => {
  const shipwrecks = new L.LayerGroup();
  const triangles = new L.LayerGroup();

  console.log('Overlays successfully created!')
  return { shipwrecks, triangles };
};

// Function to fetch and store data
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load JSON file: ${url}`);
    const data = await response.json();
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
const addShipwrecks = (shipwreckLayer) => {

  shipwreckLayer.clearLayers(); // Clear existing markers

  const markers = L.markerClusterGroup(); // Cluster group for shipwrecks
  let startYear = parseInt(document.getElementById("Start Date").value, 10) || 0;
  let endYear = parseInt(document.getElementById("End Date").value, 10) || 0;

  let filter = (startYear != 0);

  shipwreckData.forEach(point => {
    if (!filter || (
      filter && point.year_sunk && point.year_sunk >= startYear && point.year_sunk <= endYear
    )) {
      const marker = L.marker([point.lat, point.lon])
        .bindPopup(`<b>${point.wreck_name ? point.wreck_name : point.wreck_id}
        </b><br>Lat: ${point.lat}
        <br>Lon: ${point.lon}
        ${point.vessel_type ? `<br>Vessel Type: ${point.vessel_type}` : ''}
        ${point.flag ? `<br>Flag: ${point.flag}` : ''}
        ${point.water_depth ? `<br>Depth: ${point.water_depth}` : ''}
        ${point.year_sunk ? `<br>Year: ${point.year_sunk}` : ''}`);
      markers.addLayer(marker); // Add marker to cluster group
    }
  });

  document.getElementById("resetButton").disabled = !filter;

  shipwreckLayer.addLayer(markers); // Add cluster group to shipwrecks layer
  console.log('Shipwreck successfully added!');
};

// Step 5: Add triangle polygons
const addTriangles = (trianglesLayer) => {
  trianglesData.forEach(triangle => {
    const polygonCoordinates = triangle.points.map(coord => [coord.latitude, coord.longitude]);
    const polygon = L.polygon(polygonCoordinates, {
      color: 'red',
      weight: 2,
      fillOpacity: 0.3
    }).bindPopup(`<b>${triangle.name}</b>
      <br>History: undefined`);

    trianglesLayer.addLayer(polygon);
  });
  console.log('Triangles successfully added!')
};

// Function to reset and show all shipwrecks
const resetShipwrecks = (shipwreckLayer) => {

  document.getElementById("Start Date").value = "";
  document.getElementById("End Date").value = "";

  addShipwrecks(shipwreckLayer);
};

// Main logic to initialize buttons
document.addEventListener("DOMContentLoaded", () => {
  const { map, baseMaps } = initializeMap();
  const { shipwrecks, triangles } = createOverlays();

  const overlays = {
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