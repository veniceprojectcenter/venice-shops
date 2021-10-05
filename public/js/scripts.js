let centerX = 12.34
let centerY = 45.436

let map = new ol.Map({
  target: 'map',
  controls: ol.control.defaults({ attribution: false }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([centerX, centerY]),
    zoom: 14.8
  })
});

var layer = new ol.layer.Vector({
  source: new ol.source.Vector({
      features: [
          new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat([centerX, centerY])),
              name: "Point 1"
          }),
          new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat([centerX + 0.01, centerY])),
              name: "Point 2"
          })
      ]
  })
});
map.addLayer(layer);

map.on('moveend', function(e) {
  let mapX = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[0]
  let mapY = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[1]

  if (mapX < 12.2915){ mapX = 12.2915 }
  if (mapX > 12.379){ mapX = 12.379 }
  if (mapY > 45.453){ mapY = 45.453 }
  if (mapY < 45.425){ mapY = 45.415 }
  
  map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));

  if (map.getView().getZoom() < 14.5) {
    map.getView().setZoom(14.5)
    map.getView().setCenter(ol.proj.transform([centerX, centerY], 'EPSG:4326', 'EPSG:3857'));
  }
  if (map.getView().getZoom() > 21) {
    map.getView().setZoom(21)
    map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));
  }
});

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

map.on('singleclick', function (event) {
  if (map.hasFeatureAtPixel(event.pixel) === true) {
      var coordinate = event.coordinate;

      let pointName = map.getFeaturesAtPixel(event.pixel)[0].A.name

      content.innerHTML = '<b>Hello world!</b><br />I am ' + pointName;
      overlay.setPosition(coordinate);
  } else {
      overlay.setPosition(undefined);
      closer.blur();
  }
});