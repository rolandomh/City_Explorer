'use strict';


// Bring in our dependencies
const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Declare our port for our server to listen on
const PORT = process.env.PORT || 3000;

// start/instanciate Express
const app = express();

// Use CORS (cross origin resource sharing)
app.use(cors());

// Routes
app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', (request, response) => {
  let city = request.query.city;
  // getting the data from a database or API, using a flat file
  let data = require('./data/location.json')[0];
  let location = new Location(data, city);
  response.send(location);
});

app.get('/restaurants', (request, response) => {
  let data = require('./data/restaurants.json');
  let restaurantArray = [];
  data.nearby_restaurants.forEach(value => {
    let restaurant = new Restaurant(value);
    restaurantArray.push(restaurant);
  })
  console.log(restaurantArray);
  response.send(restaurantArray);

});

// Constructor to tailor our incoming raw data

function Location(obj, query){
  this.lat = obj.lat;
  this.lon = obj.lon;
  this.search_query = query;
  this.location = obj.display_name;
}

function Restaurant(obj) {
  this.url = obj.restaurant.url;
  this.name = obj.restaurant.name;
  this.rating = obj.restaurant.user_rating.aggregate_rating;
  this.cost = obj.price_range;
  this.image_url = obj.restaurant.thumb;
}


// Start our server!
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});
