var date, hours, minutes, seconds, t;
var startPosition;
var position;
var currentLat, currentLon;
var userPosition;
var mc = false;
var myMap;
var canvas;
//var mappa = new Mappa("Leaflet");

// var poliLat = 45.5848188;
// var poliLon = 9.1629839;
var mappa = new Mappa('MapboxGL', "pk.eyJ1IjoiZ2lhbmx1Y2E5MyIsImEiOiJjazJ1end4b3AxOXc5M2Rudjh1ZGx1MGR6In0.14BaSO5w76xUgZbtkRk-TQ");


var options = {
  lat: 0,
  lng: 0,
  // lat: poliLat,
  // lng: poliLon,
  zoom: 4,
  style: "mapbox://styles/gianluca93/ck2vtr91p11ru1cmm0he3rxwb"
}

// userMissile initial values
var beginX; // Initial x-coordinate
var beginY; // Initial y-coordinate
var endX; // Final x-coordinate
var endY; // Final y-coordinate
var distX; // X-axis distance to move
var distY; // Y-axis distance to move
var exponent = 4; // Determines the curve
var x; // Current x-coordinate
var y; // Current y-coordinate
var step = 0.02; // Size of each step along the path
var pct = 0.0; // Percentage traveled (0.0 to 1.0)

var launchBomb = false;
var mouseClick = false;

var cityName = 'click on a city';
var population;
var coordinateX;
var coordinateY;
var cityPosition;
var citySize;


function preload() {
  startPosition = getCurrentPosition();
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight)

  options.lat = startPosition.latitude;
  options.lng = startPosition.longitude;

  //mapCanvas = select('.mapboxgl-control-container');

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  console.log(startPosition);

  intervalCurrentPosition(showPosition, 1000);

  worldcities = loadTable('assets/worldcities.csv', 'csv', 'header');

  // date = new Date(position.timestamp); // object built in p5
  // console.log(date);
  // hours = date.getHours();
  // minutes = "0" + date.getMinutes();
  // seconds = "0" + date.getSeconds();
  //
  // var formattedTime = hours + ":" + minutes.substr(-2) + ':' + seconds.substr(-2);  // magical code that will turn a timestamp in a legible time format


}

function showPosition(position) {
  //console.log("Checking position");
  currentLat = position.latitude;
  currentLon = position.longitude;

  t = new Date;
  //
  // select("#lat").html(currentLat); // rimpiazzo con questo valore
  // select("#lon").html(currentLon);
  // select("#timestamp").html(t);

  var distance = calcGeoDistance(currentLat, currentLon, 45.4640976, 9.18969, "km");
  //console.log(distance);
}

function draw() {

  clear();

  userPosition = myMap.latLngToPixel(currentLat, currentLon);
  fill('blue');

  // Adjusting the size of the user marker according to the zoom
  var zoom = myMap.zoom();
  //console.log(zoom);
  if (zoom > 14) {
    userSize = width / 10 / myMap.zoom();
  } else if (zoom > 10) {
    userSize = width / 15 / myMap.zoom();
  } else if (zoom >= 4) {
    userSize = width / 20 / myMap.zoom();
  } else if (zoom == 3) {
    userSize = width / 28 / myMap.zoom();
  } else if (zoom == 2) {
    userSize = width / 40 / myMap.zoom();
  } else if (zoom < 2) {
    userSize = width / 500 / myMap.zoom();
  }
  ellipse(userPosition.x, userPosition.y, userSize);

  for (let i = 0; i < worldcities.getRowCount(); i += 1) {
    // Get the lat/lng of each meteorite
    const latitude = Number(worldcities.getString(i, 'lat'));
    const longitude = Number(worldcities.getString(i, 'lng'));

    // Transform lat/lng to pixel position
    const pos = myMap.latLngToPixel(latitude, longitude);
    // size of the cities based on their population
    let size = worldcities.getString(i, 'population');
    size = map(size, 0, 27000000, 1, myMap.zoom() * width / 192);
    fill(58, 235, 52);
    ellipse(pos.x, pos.y, size);

    // Interaction with the cities
    // if the mouse over the city the user can launch the bomb

    if (dist(pos.x, pos.y, mouseX, mouseY) < size * 4) {
      launchBomb = true;

      cityName = worldcities.getString(i, 'city_ascii');
      population = worldcities.getString(i, 'population');
      citySize = map(size, 0, 27000000, 1, myMap.zoom() * width / 192);
      coordinateX = worldcities.getString(i, 'lat');
      coordinateY = worldcities.getString(i, 'lng');

      cityPosition = myMap.latLngToPixel(coordinateX, coordinateY);


    }

  }

  // Top bar with stats

  fill(40, 84, 65);
  stroke(58, 235, 52);
  rect(-width / 192, 0, width * 1.5, height / 21.6);
  line(width / 3, 0, width / 3, height / 21.6);
  line(2 * width / 3, 0, 2 * width / 3, height / 21.6);

  // Target City
  textFont("Verdana");
  textSize(width / 105);
  fill('white');
  text("Target: " + cityName, width / 2.9, 29);
  text("Population: " + population, width / 2, 29);

  // User location
  textSize(width / 170);
  text("Lat: " + currentLat, width*0.01, 17.5);
  text("Lng: " + currentLon, width*0.01, 37.5);
  text(t, width*0.1, 17.5);


  // Launch the Bomb pressing the mouse
  if (mouseClick == true && launchBomb == true) {
    pct += step;
    if (pct < 1.0) {
      x = beginX + pct * distX;
      y = beginY + pow(pct, exponent) * distY;
    }
    userMissile(x, y);
  }
  
  console.log(launchBomb);
}

function userMissile(x, y) {

  push();
  translate(x, y);

  x = 0;
  y = 0;
  exponent = 4; // Determines the curve
  step = 0.02; // Size of each step along the path
  //pct = 0.0; // Percentage traveled (0.0 to 1.0)
  fill('yellow');
  stroke('red');
  strokeWeight('yellow');
  ellipse(x, y, myMap.zoom() * width / 960);
  pop();

}



function mouseClicked() {
  mouseClick = true;
  // if (dist(cityPosition.x, cityPosition.y, mouseX, mouseY) <) {

  // }
  console.log('launch');
  pct = 0.0;
  beginX = userPosition.x;
  beginY = userPosition.y;
  endX = cityPosition.x;
  endY = cityPosition.y;
  distX = endX - beginX;
  distY = endY - beginY;

}
