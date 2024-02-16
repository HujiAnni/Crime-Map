mapboxgl.accessToken =
  "pk.eyJ1IjoiaHVqaWFubmkiLCJhIjoiY2xiZnU2cDY0MDlwZjN2cGRkcmRtbWJlYSJ9.yLDlhYiJ2xJNrNUMZtEqFQ";

// const url =
//   "https://data.cityofnewyork.us/resource/qgea-i56i.json?$limit=50000";
// const url =
//   "https://data.cityofnewyork.us/resource/qgea-i56i.json?$limit=50000";

// const urls = [];
// for (let i = 1; i <= 10; i++) {
//   urls.push(
//     `https://data.cityofnewyork.us/resource/uip8-fykc.json?$limit=${
//       50000 * i
//     }&$offset=${50000 * (i - 1)}`
//   );
// }

// let nycCrime = [];

// var GeoJSON = require('geojson');

// fetch(url)
//   .then((response) => {
//     return response.json();
//   })
//   .then((data) => {
//     nycCrime = data;
//   });

const url =
  "https://data.cityofnewyork.us/resource/833y-fsy8.json?$limit=50000";
let nycCrime = [];

// var GeoJSON = require('geojson');
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    nycCrime = data;
    // console.log(nycCrime);
  });

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [-74.006, 40.77128],
  zoom: 12,
});

map.on("load", () => {
  const crimes = [];
  nycCrime.forEach((crime, i) => {
    crimes.push({
      type: "Feature",
      properties: {
        dbh: 60 * Math.random(),
        victim_age: crime.vic_age_group,
        victim_sex: crime.vic_sex,
        victim_race: crime.vic_race,
        case_status: crime.statistical_murder_flag,
        boro: crime.boro,
        year: crime.occur_date.slice(0, 4),
      },

      geometry: {
        type: "Point",
        coordinates: [crime.longitude, crime.latitude],
      },
    });
  });

  const geojson = {
    type: "FeatureCollection",
    features: crimes,
  };

  map.addSource("crime", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "crime",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Yellow, 20px circles when point count is less than 100
      //   * Pink, 30px circles when point count is between 100 and 750
      //   * Purple, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#FFAB4C",
        100,
        "#FF5F7E",
        750,
        "#B000B9",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "crime",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "crime",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // inspect a cluster on click
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("crime").getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
      });
    });
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const year = e.features[0].properties.year;
    const victim_age = e.features[0].properties.victim_age;
    const victim_sex = e.features[0].properties.victim_sex;
    const victim_race = e.features[0].properties.victim_race;
    const status = e.features[0].properties.case_status;
    const boro = e.features[0].properties.boro;
    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `In ${year}, this shooting incident happended to a ${victim_race} victim (${victim_sex}) in the ${victim_age} age group. The crime was commited in ${boro}.`
      )
      .addTo(map);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});
