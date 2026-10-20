# CineScope

Live website: [CineScope on GitHub Pages](https://sadiqhassan41.github.io/cine-scope/)

## Brief description

CineScope is a responsive movie search website for exploring Studio Ghibli films. Users can search by title, sort results alphabetically, by release year or by rating, and expand films to view additional details.

## Technologies used

- HTML5 for page structure and form controls.
- CSS3 for styling and responsive layouts.
- Vanilla JavaScript for search, sorting, validation and dynamic content.
- Browser Fetch API for requesting film data.

## API information

The website uses the free [Studio Ghibli API](https://ghibliapi.vercel.app/), which requires no API key and contains Studio Ghibli films only.
- `/films?title_like=TITLE` returns films matching part or all of a title.
- `/films/ID` returns details for an individual film.
The API supplies descriptions, release years, ratings and poster URLs. Posters are served by TMDB.

## How to run the website

Open `index.html` in a current web browser. An internet connection is required to load film data and posters.
If your browser blocks requests from local files, run `python3 -m http.server 8000` inside the `cine-scope` folder (with Python installed), then open `http://localhost:8000`.

## Basic testing instructions

1. Open the website and check that film cards and posters load.
2. Search for `Totoro` or `Castle`, try each sorting option, and expand a film's details.
3. Submit empty, one-character and whitespace-only input to check validation.
4. Search for `zzzznotafilm` and check the no-results message.
5. Set the browser's developer tools Network panel to Offline, search, and check the error message. Reconnect and search again.
6. Check the layout on a narrow screen and use Tab, Enter and Space to navigate the form and film details.
