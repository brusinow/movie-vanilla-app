// The base of our API call
var baseURL = 'https://www.omdbapi.com/?';

// Our function for making the API call, checking if the response succeeded, and passing the data
// to the parseMovies function
var loadMovies = function(query, type) {

  // Remove any previous html from our movie-list dom element
  document.getElementById('movie-list').innerHTML = '';
  document.getElementById('movie-container').innerHTML = '';

  // Create a new AJAX request
  var xhttp = new XMLHttpRequest();

  // Create an event listener to check our data, gets called each time a packet is recieved
  // Since we're making an asynchronous call. Passes data when finished.
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     parseMovies(xhttp.responseText, type);
    }
  }

  // Search API url based on the input value and search type
  if (type === 'single') {
    var searchURL = baseURL + 't=' + query + '&plot=full&r=json';
  } else if (type === 'search') {
    var searchURL = baseURL + 's=' + query + '&r=json';
  }

  // Using GET to recieve data from the API
  xhttp.open("GET", searchURL , true);
  xhttp.send();
}

var getFavorites = function() {

  // Create a new AJAX request
  var xhttp = new XMLHttpRequest();

  // Create an event listener to check our data, gets called each time a packet is recieved
  // since we're making an asynchronous call. Passes data when finished.
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     loadFavorites(xhttp.responseText);
    }
  }

  // Search Favorites url
  var searchURL = 'http://localhost:3000/favorites';

  // Using GET to recieve data from the API
  xhttp.open("GET", searchURL , true);
  xhttp.send();
}

var loadFavorites = function(queries) {
  // Remove any previous html from our movie-list dom element
  document.getElementById('movie-list').innerHTML = '';
  document.getElementById('movie-container').innerHTML = '';

  var parsedQueries = JSON.parse(queries);

  parsedQueries.forEach(function(value, index) {

    // Create a new AJAX request
    var xhttp = new XMLHttpRequest();

    // Create an event listener to check our data, gets called each time a packet is recieved
    // Since we're making an asynchronous call. Passes data when finished.
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        parseMovies(xhttp.responseText, 'search');
      }
    }

    // Search API url based on the input value and search type
    var searchURL = baseURL + 'i=' + value.oid + '&r=json';

    // Using GET to recieve data from the API
    xhttp.open("GET", searchURL , true);
    xhttp.send();
  });
}

// Function for parsing JSON data retrieved from API call
var parseMovies = function(data, type) {

  // Parse JSON string into JS object for use
  var parsedData = JSON.parse(data);

  // forEach for looping through returned data in our Search array, pass individual movie objects
  // to the appendDom function each iteration
  if (parsedData.Search) {
    parsedData.Search.forEach(function(value, index) {
      appendDom(value, type);
    });
  } else {
    appendDom(parsedData, type);
  }
}

// Function for appending movie data to our movie-list element in the DOM
var appendDom = function(movieObj, type) {

  // Check if the Poster property is empty or has  a N/A value, replace with placeholder image
  if (!movieObj.Poster || movieObj.Poster === 'N/A') {
    movieObj.Poster = 'http://placehold.it/300x400';
  }

  // Create our HTML string using our movieObj properties
  if (type === 'search') {

    var parentElem = document.getElementById('movie-list');
    parentElem.className = '';
    document.getElementById('movie-container').className = 'hidden';

    var li = document.createElement('li');

    li.innerHTML = '<h3>' + movieObj.Title + '</h3><img src="' + movieObj.Poster + '" /><p>' + movieObj.Year + '</p>';

    // Event listener for each movie list item
    li.addEventListener('click', function(e) {
      e.preventDefault();

      var title = e.target.parentElement.firstChild.innerHTML;

      var query = title.replace(/ /g, '+');

      var type = 'single';

      location.hash = type + '/' + query;
    });
    
    // Append the new element to the movie-list
    parentElem.appendChild(li);

  } else if (type === 'single') {

    window.movieId = movieObj.imdbID;
    window.movieName = movieObj.Title;

    var parentElem = document.getElementById('movie-container');
    parentElem.className = '';
    document.getElementById('movie-list').className = 'hidden';

    var elem = document.createElement('div');

    elem.innerHTML = '<h3>' + movieObj.Title + '</h3><img src="' + movieObj.Poster + '" /><p>' + movieObj.Year + '</p>';

    var button = document.createElement('button');
    button.innerHTML = 'Favorite';
    button.className = 'favorite-button';
    button.addEventListener('click', function(e) {
      e.preventDefault();

      var favObj = {
        name: window.movieName,
        oid: window.movieId
      }

      var JSONObj = JSON.stringify(favObj);

      var xhttp = new XMLHttpRequest();

      // Using GET to recieve data from the API
      xhttp.open("POST", '/favorites', true);

      // Send the proper header information along with the request
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSONObj);
    });

    elem.appendChild(button);

    if (movieObj.Plot) {
      var p = document.createElement('p');
      p.innerHTML = movieObj.Plot;
      elem.appendChild(p);
    }

    // Append the new element to the movie-list
    parentElem.appendChild(elem);
  }
}

// Event listener for the search button
document.getElementById('loadButton').addEventListener('click', function(e) {
  e.preventDefault();

  var query = document.getElementById('search-field').value.replace(/ /g, '+');

  var type = 'search';

  location.hash = type + '/' + query;
});

// Event listener for the favorites button
document.getElementById('favorites-button').addEventListener('click', function(e) {
  e.preventDefault();

  location.hash = 'favorites/all'
});

// Hash change listener, calls API based on hash
window.onhashchange = function() {
  if (!location.hash) {
    document.getElementById('movie-list').innerHTML = '';
    document.getElementById('movie-container').innerHTML = '';
    document.getElementById('search-field').value = '';
  }

  var query = location.hash.split('/')[1];
  var type = location.hash.split('/')[0].replace('#', '');

  if (type === 'favorites') {
    getFavorites();
  } else {
    loadMovies(query, type);
  }
}
