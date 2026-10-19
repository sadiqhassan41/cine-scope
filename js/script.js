const apiUrl = 'https://ghibliapi.vercel.app/films';
const form = document.querySelector('#search-form');
const titleInput = document.querySelector('#movie-title');
const searchButton = document.querySelector('#search-button');
const sortOrder = document.querySelector('#sort-order');
const results = document.querySelector('#movie-results');
const resultsHeading = document.querySelector('#results-heading');
const statusMessage = document.querySelector('#status-message');
const cardTemplate = document.querySelector('#movie-card-template');
let movies = [];

titleInput.addEventListener('input', function () {
  titleInput.setCustomValidity('');
  titleInput.removeAttribute('aria-invalid');
});

titleInput.addEventListener('invalid', function () {
  titleInput.setAttribute('aria-invalid', 'true');
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title.length < 2) {
    titleInput.setCustomValidity('Please enter at least two characters of a movie title.');
    titleInput.reportValidity();
    return;
  }
  if (!searchButton.disabled) searchMovies(title);
});

sortOrder.addEventListener('change', function () {
  displayMovies();
  if (movies.length) {
    const count = `${movies.length} film${movies.length === 1 ? '' : 's'}`;
    showMessage(`${count} sorted by ${sortOrder.selectedOptions[0].text.toLowerCase()}.`);
  }
});

function showMessage(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

async function searchMovies(title = '') {
  searchButton.disabled = true;
  sortOrder.disabled = true;
  searchButton.textContent = 'Searching…';
  results.setAttribute('aria-busy', 'true');
  results.replaceChildren();
  movies = [];
  resultsHeading.textContent = title ? 'Search results' : 'Explore the collection';
  showMessage(title ? `Searching for “${title}”…` : 'Loading the film collection…');

  try {
    // The API uses a regular expression for title_like; escape it for a literal title search.
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parameters = new URLSearchParams({ title_like: escapedTitle });
    const response = await fetch(`${apiUrl}?${parameters}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('The film request failed.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected film data.');
    movies = data;
    displayMovies();

    if (!movies.length) {
      showMessage(`No films found for “${title}”. Try Totoro, Castle or Spirited Away.`);
    } else {
      const count = `${movies.length} film${movies.length === 1 ? '' : 's'}`;
      showMessage(title ? `${count} found for “${title}”.` : `${count} to explore. Open a film’s details to read more.`);
    }
  } catch (error) {
    showMessage('We could not load the films. Check your connection and try searching again.', true);
  } finally {
    searchButton.disabled = false;
    sortOrder.disabled = false;
    searchButton.textContent = 'Search films';
    results.setAttribute('aria-busy', 'false');
  }
}

function displayMovies() {
  const sortedMovies = [...movies];
  if (sortOrder.value === 'year') {
    sortedMovies.sort((a, b) => Number(b.release_date) - Number(a.release_date));
  } else if (sortOrder.value === 'rating') {
    sortedMovies.sort((a, b) => Number(b.rt_score) - Number(a.rt_score));
  } else {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
  }
  results.replaceChildren();

  for (const movie of sortedMovies) {
    const card = cardTemplate.content.cloneNode(true);
    const poster = card.querySelector('.movie-poster');
    const fallback = card.querySelector('.poster-fallback');
    // API text is inserted with textContent rather than interpreted as HTML.
    card.querySelector('.movie-title').textContent = movie.title;
    card.querySelector('.movie-year').textContent = movie.release_date || 'Year unavailable';
    card.querySelector('.movie-score').textContent = movie.rt_score ? `RT ${movie.rt_score}%` : 'Not rated';
    card.querySelector('.movie-director').textContent = `Directed by ${movie.director || 'unknown'}`;
    card.querySelector('.movie-accessible-title').textContent = ` for ${movie.title}`;
    poster.alt = `Poster for ${movie.title}`;
    poster.addEventListener('error', function () {
      poster.hidden = true;
      fallback.hidden = false;
    });
    if (movie.image && movie.image.startsWith('https://')) {
      poster.src = movie.image;
    } else {
      poster.hidden = true;
      fallback.hidden = false;
    }

    const details = card.querySelector('details');
    details.addEventListener('toggle', function () {
      if (details.open && !details.dataset.loaded && !details.dataset.loading) {
        loadMovieDetails(movie.id, details);
      }
    });
    results.appendChild(card);
  }
}

async function loadMovieDetails(id, details) {
  const message = details.querySelector('.detail-status');
  details.dataset.loading = 'true';
  message.textContent = 'Loading film details…';
  try {
    const response = await fetch(`${apiUrl}/${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('The film details request failed.');
    const movie = await response.json();
    details.querySelector('.movie-description').textContent = movie.description || 'No description available.';
    details.querySelector('.original-title').textContent = movie.original_title || 'Not available';
    details.querySelector('.running-time').textContent = movie.running_time ? `${movie.running_time} minutes` : 'Not available';
    details.querySelector('.movie-producer').textContent = movie.producer || 'Not available';
    details.querySelector('.detail-content').hidden = false;
    details.dataset.loaded = 'true';
    message.textContent = '';
  } catch (error) {
    message.textContent = 'Details could not be loaded. Close and reopen to try again.';
  } finally {
    delete details.dataset.loading;
  }
}

searchMovies();
