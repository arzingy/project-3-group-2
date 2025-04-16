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

  var worldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Add default layer and define base layers
  satelliteLayer.addTo(map);
  const baseMaps = {
    "Satellite": satelliteLayer,
    "Streets": streetLayer,
    "Earth At Night": earthAtNight,
    "World Imagery": worldImagery
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

// // Step 4: Add shipwreck markers

// const addShipwrecks = (data, shipwreckLayer) => {
//   const markers = L.markerClusterGroup(); // Cluster group for shipwrecks

//   data.forEach(point => {
//     const marker = L.marker([point.lat, point.lon])
//       .bindPopup(`<b>${point.wreck_name ? point.wreck_name : point.wreck_id}
//         </b><br>Lat: ${point.lat}
//         <br>Lon: ${point.lon}
//         ${point.vessel_type ? `<br>Vessel Type: ${point.vessel_type}` : ''}
//         ${point.flag ? `<br>Flag: ${point.flag}` : ''}
//         ${point.water_depth ? `<br>Depth: ${point.water_depth}` : ''}
//         ${point.year_sunk ? `<br>Year: ${point.year_sunk}` : ''}`);
//     markers.addLayer(marker); // Add marker to cluster group
//   });

//   shipwreckLayer.addLayer(markers); // Add cluster group to shipwrecks layer
//   console.log('Shipwrecks added to layer group');
// };

function submitFunction() {
  const input1 = document.getElementById("Start Date").value;
  const input2 = document.getElementById("End Date").value;
  console.log("Start Year:", input1);
  console.log("End Year:", input2);
};

const addShipwrecks = (data, shipwreckLayer) => {
  const markers = L.markerClusterGroup(); // Cluster group for shipwrecks


  data.forEach(point => {
    if(
      point.year_sunk >= 1900 &&
      point.year_sunk <= 1900
    ){
    const wreckName = point.wreck_name || point.wreck_id || 'Unknown';
    const lat = point.lat ?? 'Unknown';
    const lon = point.lon ?? 'Unknown';
    const vesselType = point.vessel_type || 'Unknown';
    const flag = point.flag || 'Unknown';
    const waterDepth = point.water_depth || 'Unknown';
    const yearSunk = point.year_sunk || 'Unknown';


    const marker = L.marker([point.lat, point.lon])
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
  }});


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
    }).bindPopup(`<b>${triangle.name}</b>
      <br><b>Story:</b><br>${triangle.story}`);
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
  //triangles.addTo(map);
})();