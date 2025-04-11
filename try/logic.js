// Step 1: Initialize the map
const map = L.map('map').setView([0, 0], 2); // Center map at 0,0 with zoom level 2

// Step 2: Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Step 3: Initialize the marker cluster group
const markers = L.markerClusterGroup(); // Create a new cluster group

// Step 4: Fetch the JSON file
fetch('../Resources/points.json') // Replace 'points.json' with the actual path to your JSON file
  .then(response => {
    if (!response.ok) throw new Error("Failed to load JSON file");
    return response.json(); // Parse JSON
  })
  .then(data => {
    // Step 5: Loop through the data points and add markers to the cluster group
    for (let i = 0; i < data.length; i++) {
      const marker = L.marker([data[i].lat, data[i].lon])
        .bindPopup(`<b>${data[i].wreck_id}</b><br>Lat: ${data[i].lat}<br>Lon: ${data[i].lon}`);
      
      markers.addLayer(marker); // Add marker to the cluster group
    }
    
    // Step 6: Add the cluster group to the map
    map.addLayer(markers);
    console.log('All points clustered and loaded');
  })
  .catch(error => console.error('Error loading JSON:', error));
