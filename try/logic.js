// Step 1: Initialize the map
const map = L.map('map').setView([0, 0], 2); // Center map at 0,0 with zoom level 2

// Step 2: Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Step 3: Fetch the JSON file
fetch('../Resources/points.json') // Replace 'shipwrecks.json' with the actual path to your JSON file
  .then(response => {
    if (!response.ok) throw new Error("Failed to load JSON file");
    return response.json(); // Parse JSON
  })
  .then(data => {
    // Step 4: Loop through the shipwrecks and add markers to the map
    for (let i = 0; i < 94000; i++) {
      L.marker([data[i].lat, data[i].lon])
        .bindPopup(`<b>${data[i].wreck_id}</b><br>Lat: ${data[i].lat}<br>Lon: ${data[i].lon}`)
        .addTo(map);
      console.log('ship loaded');
    }
    // data.forEach(shipwreck => {
    //   L.marker([shipwreck.lat, shipwreck.lon])
    //     .bindPopup(`<b>${shipwreck.name}</b><br>Lat: ${shipwreck.lat}<br>Lon: ${shipwreck.lon}`)
    //     .addTo(map);
    //   console.log('ship loaded');
    // });
  })
  .catch(error => console.error('Error loading JSON:', error));
