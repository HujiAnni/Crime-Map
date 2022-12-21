mapboxgl.accessToken = 'pk.eyJ1IjoiaHVqaWFubmkiLCJhIjoiY2xiZnU2cDY0MDlwZjN2cGRkcmRtbWJlYSJ9.yLDlhYiJ2xJNrNUMZtEqFQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-73.930618,40.786696],
  zoom: 11
});


// const url = "https://data.cityofnewyork.us/resource/uip8-fykc.json";
const url = "https://data.cityofnewyork.us/resource/qgea-i56i.json?$limit=50000"
let nycCrime = [];

// var GeoJSON = require('geojson');

fetch(url)
.then((response) => {
  return response.json();
})
.then((data) => {
  nycCrime = data;
})


map.on('load', function() {

    const crimes = [];
    nycCrime.forEach((crime,i) =>{
        crimes.push({ 
            "type":"Feature",
            "properties":{"dbh":(60*(Math.random()))},
            "geometry":{
                "type":"Point",
                // "coordinates":crime.geocoded_column.coordinates
                "coordinates":[crime.longitude,crime.latitude]
            }
        });            
    });

    const geojson = {
        "type":"FeatureCollection","features":crimes
    };


    map.addSource('crime', {
      'type': 'geojson',
      'data': geojson
    });

    map.addLayer(
      {
        'id': 'crime-heat',
        'type': 'heatmap',
        'source': 'crime',
        'maxzoom': 15,
        'paint': {
          // increase weight as diameter increases
          'heatmap-weight': {
            'property': 'dbh',
            'type': 'exponential',
            'stops': [
              [1, 0],
              [62, 1]
            ]
          },
          // increase intensity as zoom level increases
          'heatmap-intensity': {
            'stops': [
              [11, 1],
              [15, 3]
            ]
          },
          // use sequential color palette to use exponentially as the weight increases
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            'rgb(103,169,207)',
            0.4,
            'rgb(209,229,240)',
            0.6,
            'rgb(253,219,199)',
            0.8,
            'rgb(239,138,98)',
            1,
            'rgb(178,24,43)'
          ],
          // increase radius as zoom increases
          'heatmap-radius': {
            'stops': [
              [11, 15],
              [15, 20]
            ]
          },
          // decrease opacity to transition into the circle layer
          'heatmap-opacity': {
            'default': 1,
            'stops': [
              [14, 1],
              [15, 0]
            ]
          }
        }
      },
      'waterway-label'
    );


  });

