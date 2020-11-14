'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// Start express
const app = express();
const pg = require('pg');
const PORT = process.env.PORT || 3000;

// Error call on server
client.on('error', err => console.error(err));

// use CORS
app.use(cors());
app.use (express.static('./public'));

// Start Client and hope for the best
console.log(PORT, process.env.DATABASE_URL);
const client = new pg.Client(process.env.DATABASE_URL);

// Routes/Gets
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/yelp', yelpHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.use('*', notFoundHandler);
app.get('/', (request, response) => {
response.send('Hello World');
});

// Location Function
function locationHandler(request, response) {
let city = request.query.city;
let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;
let sql = 'SELECT * FROM locations WHERE search_query LIKE ($1);'
let safeValue = [city];
client.query(sql, safeValue)
.then(sqlResults => {
if (sqlResults.rowCount) {
response.status(200).send(sqlResults.rows[0]);
} else {
superagent.get(url)
.then(results => {
let finalObj = new Location(city, results.body[0]);
let sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
let safeValue = [finalObj.search_query, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
response.status(200).send(finalObj);
client.query(sql, safeValue);
}).catch(error => errorAlert(error, response));
}
}).catch(error => errorAlert(error, response));
}
// Weather Function
function weatherHandler(request, response) {
let search_query = request.query.search_query;
let url = 'https://api.weatherbit.io/v2.0/forecast/daily';
const queryParams = {
city: search_query,
key: process.env.WEATHER_API_KEY,
days: 8
}
  superagent.get(url)
.query(queryParams)
.then(results => {
let weatherResults = response.body.data.map(weatherResults => {
let day = new Weather(weatherResults);
return day;
});
response.status(200).send(weatherResults);
}).catch(error => errorAlert(error, response));
}

// Yelp {HANDLER} Function
function yelpHandler(request, response){
let city = request.query.search_query;
let url = 'https://api.yelp.com/v3/businesses/search';
const queryParams = {
location: city,
term: 'food',
limit: 5
}
  superagent.get(url)
.set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
.query(queryParams)
.then(data => {
let foodData = data.body.businesses;
let allRestuarants = foodData.map(food => new Restaurant(food));
// console.log('results from superagent', data.body);
response.status(200).send(allRestuarants);
}).catch(error => errorAlert(error, response));
}
// Movie Handler
function movieHandler(request, response) {
let search_query = req.query.search_query;
let url = 'https://api.weatherbit.io/v2.0/forecast/daily';
const queryParams = {
city: search_query,
key: process.env.WEATHER_API_KEY,
days: 8
}
  superagent.get(url)
.query(queryParams)
.then(results => {
let weatherResults = results.body.data.map(weatherResults => {
let day = new Weather(weatherResults);
return day;
});
response.status(200).send(weatherResults);
}).catch(error => errorAlert(error, response));

// Trails Handler

// Movie Handler
// Constructor Functions

// Location
function Location(searchQuery, obj) {
this.search_query = searchQuery;
this.formatted_query = obj.display_name;
this.latitude = obj.lat;
this.longitude = obj.lon;
}
// Weather
function Weather(obj) {
this.forecast = obj.weather.description;
this.time = obj.datetime;
}
// Yelp Restaurant Constructor
function Restaurant(obj) {
this.name = obj.name;
this.image_url = obj.image_url;
this.price = obj.price;
this.rating = obj.rating;
this.url = obj.url;
}
// Hike Constructor
function Hike(obj) {
this.name = obj.name;
this.location = obj.location;
this.length = obj.length;
this.stars = obj.stars;
this.star_votes = obj.starVotes;
this.summary = obj.summary;
this.trail_url = obj.url;
this.conditions = obj.conditions;
this.condition_date = new Date(obj.conditionDate).toLocaleDateString();
this.condition_time = new Date(obj.conditionDate).toLocaleTimeString();
}

// Movie Constructor
function Movie(obj) {
this.title = obj.original_title;
this.overview = obj.overview;
this.average_votes = obj.vote_average;
this.total_votes = obj.vote_count;
this.image_url = `https://image.tmdb.org/t/p/w500/${obj.poster_path}`;
this.popularity = obj.popularity;
this.released_on = obj.release_date;
}
//ERROR CALLBACK
function notFoundHandler(req, res) {
  res.status(404).send('Try again.');
}
// postgres
// .then startServer
function startServer() {

// client.connect()
// Make sure the server is listening for reqs
client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
});