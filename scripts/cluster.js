mapboxgl.accessToken =
  "pk.eyJ1IjoiaHVqaWFubmkiLCJhIjoiY2xiZnU2cDY0MDlwZjN2cGRkcmRtbWJlYSJ9.yLDlhYiJ2xJNrNUMZtEqFQ";

// const url =
//   "https://data.cityofnewyork.us/resource/qgea-i56i.json?$limit=50000";
// const url =
//   "https://data.cityofnewyork.us/resource/qgea-i56i.json?$limit=50000";

const urls = [
  "https://data.cityofnewyork.us/resource/8h9b-rp9u.json?$limit=50000",
  "https://data.cityofnewyork.us/resource/8h9b-rp9u.json?$limit=50000&$offset=50000",
  "https://data.cityofnewyork.us/resource/8h9b-rp9u.json?$limit=50000&$offset=100000",
];

let nycCrime = [];

// var GeoJSON = require('geojson');

// fetch(url)
//   .then((response) => {
//     return response.json();
//   })
//   .then((data) => {
//     nycCrime = data;
//   });

urls.forEach((url) => {
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      nycCrime = [...data];
    });
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
        ofns_desc: crime.ofns_desc,
        victim: crime.vic_age_group,
        case_status: crime.crm_atpt_cptd_cd,
        cat: crime.law_cat_cd,
        // year: crime.cmplnt_fr_dt.slice(0, 4),
        year: crime.arrest_date.slice(0, 4),
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
    const ofns_desc = e.features[0].properties.ofns_desc;
    const victim = e.features[0].properties.victim;
    const status = e.features[0].properties.case_status;
    const category = e.features[0].properties.cat;
    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `In ${year}, this incident ${ofns_desc} happended to a victim in the ${victim} age group. The crime was defined as ${category}. The crime was ${status}.`
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
