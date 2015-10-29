var cities = {
  berlin: {
    lng: 13.4,
    lat: 52.4
  },
  london: {
    lng: -0.1,
    lat: 51.5
  },
  paris: {
    lng: 2.35,
    lat: 48.86
  },
  madrid: {
    lng: -3.7,
    lat: 40.4
  },
  dublin: {
    lng: -6.3,
    lat: 53.3
  },
  hamburg: {
    lng: 10,
    lat: 53.6
  },
  frankfurt: {
    lng: 8.7,
    lat: 50.1
  },
  munich: {
    lng: 11.6,
    lat: 48.1
  }
};

var cityNames = Object.keys(cities);
for (var name in cities) {
  cities[name].pattern = new RegExp(name, 'i');
}
var center = cities[Object.keys(cities)[0]];

L.mapbox.accessToken = 'pk.eyJ1IjoiYnJpYW5zaGFsZXIiLCJhIjoiY2lnYml5OWZlMG1pa3U1bHlxbGFrZXB3MCJ9.j-aTJBjdHQMV4wa0RXuV3Q';
// Replace 'mapbox.streets' with your map id.
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/brianshaler.cigbiy7n10kurtwj69oc15wdq/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken);
//
var map = L.map('map')
    .addLayer(mapboxTiles)
    .setView([center.lat, center.lng], 4);

var currentMarkers = [];
var currentItems = [];

var showOverlay = false;

var setMarkers = function (map, items) {
  currentItems = items;
  var bounds = [
    [Infinity, Infinity],
    [-Infinity, -Infinity]
  ];

  for (var i = 0; i < currentMarkers.length; i++) {
    map.removeLayer(currentMarkers[i]);
  }
  currentMarkers = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var city = item.city;
    if (item.hide !== true) {
      console.log('city', city);
      if (city.lat < bounds[0][0]) {
        bounds[0][0] = city.lat;
      }
      if (city.lat > bounds[1][0]) {
        bounds[1][0] = city.lat;
      }
      if (city.lng < bounds[0][1]) {
        bounds[0][1] = city.lng;
      }
      if (city.lng > bounds[1][1]) {
        bounds[1][1] = city.lng;
      }
    }
    var icon = './images/' + (item.icon || 'point') + '.png';
    var marker = L.marker(new L.LatLng(city.lat, city.lng), {
      icon: L.icon({
        iconUrl: icon,
        iconSize: item.iconSize || [50, 62.5],
        iconAnchor: item.iconAnchor || [25, 31]
      })
    });
    if (item.onClick) {
      marker.on('click', item.onClick);
    } else {
      marker.bindPopup('<div style="width: 196px;"><img src="./images/popupcontent.png"><a href="#" onclick="javascript: this.setAttribute(\'class\', \'is-confirmed\'); var sts = document.getElementById(\'dynamic-status\'); sts.innerHTML = \'0\'; sts.setAttribute(\'class\', \'status\'); return false;"><img class="transferbtn" src="./images/transferbtn.png" /><img class="confirmed" src="./images/confirmed.png" /></a></div>');
    }
    currentMarkers.push(marker);
    marker.addTo(map);
  }

  if (showOverlay) {
    bounds[0][1] -= bounds[1][1] - bounds[0][1];
  }

  bounds[0][0] -= 1;
  bounds[1][0] += 1;
  bounds[0][1] -= 1;
  bounds[1][1] += 1;

  map.fitBounds(bounds);
}

var currentItem = null;
var selectFactory = function (item) {
  return function (e) {
    // showOverlay = true;
    showOverlay = false;
    var fs = document.getElementById('fullscreen');
    fs.style.display = 'block';
    console.log('currentItem', item);
    currentItem = item;
  }
}

var getFactories = function () {
  return [
    {
      city: cities.berlin,
      icon: 'factory_' + berlinStatus,
      iconSize: [50, 62.5],
      iconAnchor: [25, 31],
      onClick: selectFactory(cities.berlin)
    }, {
      city: cities.paris,
      icon: 'factory_green',
      iconSize: [50, 62.5],
      iconAnchor: [25, 31],
      onClick: selectFactory(cities.paris)
    }, {
      city: cities.london,
      icon: 'factory_green',
      iconSize: [50, 62.5],
      iconAnchor: [25, 31],
      onClick: selectFactory(cities.london)
    }, {
      city: cities.madrid,
      icon: 'factory_green',
      iconSize: [50, 62.5],
      iconAnchor: [25, 31],
      onClick: selectFactory(cities.madrid)
    }
  ];
}

var filterFactories = function (city) {
  return getFactories()
    .map(function (item) {
      console.log('item', item, city);
      var obj = {};
      for (var k in item) {
        obj[k] = item[k];
      }
      if (obj.city.lng != city.lng) {
        obj.hide = true;
      }
      return obj;
    })
}

var setFactoryMarkers = function () {
  setMarkers(map, getFactories());
}

var berlinStatus = 'green';
setTimeout(function () {
  berlinStatus = 'red';
  setFactoryMarkers();
}, 15000);

setFactoryMarkers();

var lines = []
drawLine = function (city1, city2, color) {
  line_points = [
    [city1.lat, city1.lng],
    [city2.lat, city2.lng]
  ];

  // Define polyline options
  // http://leafletjs.com/reference.html#polyline
  var polyline_options = {
      color: color
  };

  // Defining a polygon here instead of a polyline will connect the
  // endpoints and fill the path.
  // http://leafletjs.com/reference.html#polygon
  var polyline = L.polyline(line_points, polyline_options).addTo(map)
  lines.push(polyline);
};

// var selectSupplier = function (city) {
//   return function (e) {
//     var pop = L.Popup()
//       .setLngLat(new L.LatLng(city.lat, city.lng))
//       .setHTML('<img src="./image/popupcontent.png">')
//       .addTo(map);
//   }
// };

['card1', 'card2', 'card3'].forEach(function (cardName) {
  var el = document.getElementById(cardName);
  el.addEventListener('click', function (e) {
    console.log('click', currentItem);
    var fs = document.getElementById('fullscreen');
    fs.style.display = 'none';
    showOverlay = true;
    var ov = document.getElementById('overlay');
    ov.style.display = 'block';
    setMarkers(map, filterFactories(currentItem)
      .concat([{
        city: cities.hamburg//,
        // onClick: selectSupplier(cities.hamburg)
      }, {
        city: cities.munich//,
        // onClick: selectSupplier(cities.munich)
      }, {
        city: cities.frankfurt//,
        // onClick: selectSupplier(cities.frankfurt)
      }]));

    lines.forEach(function (line) {
      map.removeLayer(line);
    });
    lines = []
    drawLine(currentItem, cities.hamburg, '#0A495F');
    drawLine(currentItem, cities.munich, '#0A495F');
    drawLine(currentItem, cities.frankfurt, '#0A495F');
  });

});
