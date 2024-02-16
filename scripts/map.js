mapboxgl.accessToken =
  "pk.eyJ1IjoiaHVqaWFubmkiLCJhIjoiY2xiZnU2cDY0MDlwZjN2cGRkcmRtbWJlYSJ9.yLDlhYiJ2xJNrNUMZtEqFQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-74.006, 40.77128],
  zoom: 12,
});

map.on("load", function () {
  $("#datepicker").datepicker({ viewMode: "years", format: "mm-yyyy" });
});
// $("#datepicker").datepicker({ viewMode: "years", format: "mm-yyyy" });
