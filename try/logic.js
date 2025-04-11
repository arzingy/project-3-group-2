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

  // Add default layer and define base layers
  satelliteLayer.addTo(map);
  const baseMaps = {
    "Satellite": satelliteLayer,
    "Streets": streetLayer
  };

  return { map, baseMaps };
};

// Step 2: Add overlays
const createOverlays = () => {
  const shipwrecks = new L.LayerGroup();
  const triangles = new L.LayerGroup();

  return { shipwrecks, triangles };
};

// Step 3: Fetch and handle JSON data
const fetchData = async (url, callback) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load JSON file: ${url}`);
    const data = await response.json();
    callback(data);
  } catch (error) {
    console.error(error);
  }
};

// Step 4: Add shipwreck markers
const addShipwrecks = (data, shipwreckLayer) => {
  const markers = L.markerClusterGroup(); // Cluster group for shipwrecks

  data.forEach(point => {
    const marker = L.marker([point.lat, point.lon])
      .bindPopup(`<b>${point.wreck_name ? point.wreck_name : point.wreck_id}
        </b><br>Lat: ${point.lat}
        <br>Lon: ${point.lon}
        ${point.vessel_type ? `<br>Vessel Type: ${point.vessel_type}` : ''}
        ${point.flag ? `<br>Flag: ${point.flag}` : ''}
        ${point.water_depth ? `<br>Depth: ${point.water_depth}` : ''}
        ${point.year_sunk ? `<br>Year: ${point.year_sunk}` : ''}`);
    markers.addLayer(marker); // Add marker to cluster group
  });

  shipwreckLayer.addLayer(markers); // Add cluster group to shipwrecks layer
  console.log('Shipwrecks added to layer group');
};

// Step 5: Add triangle polygons
const addTriangles = (data, trianglesLayer) => {
  data.forEach(triangle => {
    const polygonCoordinates = triangle.points.map(coord => [coord.latitude, coord.longitude]);
    const polygon = L.polygon(polygonCoordinates, {
      color: 'red',
      weight: 2,
      fillOpacity: 0.3
    }).bindPopup(`<b>${triangle.name}</b>`);

    trianglesLayer.addLayer(polygon); // Add polygon to triangles layer
    console.log(`Polygon for ${triangle.name} added to triangles layer group`);
  });
};

// Main logic
(() => {
  const { map, baseMaps } = initializeMap();
  const { shipwrecks, triangles } = createOverlays();

  const overlays = {
    "Shipwrecks": shipwrecks,
    "Triangles": triangles
  };

  // Add layer control
  L.control.layers(baseMaps, overlays).addTo(map);

  // Fetch and add shipwrecks
  fetchData('../Resources/points.json', data => addShipwrecks(data, shipwrecks));
  shipwrecks.addTo(map);

  // Fetch and add triangles
  fetchData('../Resources/triangles.json', data => addTriangles(data, triangles));
  triangles.addTo(map);
})();