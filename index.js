const autoCompleteConfig = {
	renderOption(movie) {
		const imgSRC = movie.Poster === 'N/A' ? '' : movie.Poster;
		return `
		<img src="${imgSRC}"/>
		${movie.Title} (${movie.Year})
		`;
	},
	inputValue(movie) {
		return movie.Title;
	},
	async fetchData(searchTerm) {
		const response = await axios.get('https://www.omdbapi.com/', {
			params : {
				apikey : '84c16bef',
				s      : searchTerm
			}
		});
		if (response.data.Error) {
			return [];
		}
		return response.data.Search;
	}
};

createAutoComplete({
	...autoCompleteConfig,
	root           : document.querySelector('#left-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
	}
});
createAutoComplete({
	...autoCompleteConfig,
	root           : document.querySelector('#right-autocomplete'),
	onOptionSelect(movie) {
		document.querySelector('.tutorial').classList.add('is-hidden');
		onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
	}
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
	const response = await axios.get('https://www.omdbapi.com/', {
		params : {
			apikey : '84c16bef',
			i      : movie.imdbID
		}
	});
	summaryElement.innerHTML = movieTemplate(response.data);

	if (side === 'left') {
		leftMovie = response.data;
	} else {
		rightMovie = response.data;
	}

	if (leftMovie && rightMovie) {
		runComparison();
	}
};

const runComparison = () => {
	const leftSideStats = document.querySelectorAll('#left-summary .notification');
	const rightSideStats = document.querySelectorAll('#right-summary .notification');

	leftSideStats.forEach((leftStat, index) => {
		const rightStat = rightSideStats[index];

		const leftSideValue = parseInt(leftStat.dataset.value);
		const rightSideValue = parseInt(rightStat.dataset.value);
		leftStat.classList.remove('is-primary');
		leftStat.classList.add('is-dark');
		rightStat.classList.remove('is-primary');
		rightStat.classList.add('is-dark');

		if (leftSideValue > rightSideValue) {
			leftStat.classList.remove('is-dark');
			leftStat.classList.add('is-primary');
		} else {
			rightStat.classList.remove('is-dark');
			rightStat.classList.add('is-primary');
		}
	});
};

const movieTemplate = (movieDetail) => {
	const rotten = parseInt(movieDetail.Ratings[1].Value.replace(/%/g, '').replace(/\/100/g, ''));
	const metascore = parseInt(movieDetail.Metascore);
	const imdbRating = parseFloat(movieDetail.imdbRating);
	const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
	const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
		const value = parseInt(word);
		if (isNaN(value)) {
			return prev;
		} else {
			return prev + value;
		}
	}, 0);

	return `
		<article class="media">
			<figure class="media-left">
				<p class="image">
					<img src="${movieDetail.Poster}"/>
				</p>
			</figure>
			<div class="media-content">
				<div class="content">
					<h1>${movieDetail.Title} (${movieDetail.Year})</h1>
					<h4>${movieDetail.Genre}</h4>
					<p>${movieDetail.Plot}</p>
					<p>${movieDetail.Actors}</p>
				</div>
			</div>
		</article>
		<article data-value="${awards}" class="notification is-dark">
			<p class="title">${movieDetail.Awards}</p>
			<p class="subtitle">Awards</p>
		</article>
		<article data-value="${rotten}" class="notification is-dark">
			<p class="title">${rotten}%</p>
			<p class="subtitle">Rotten Tomatoes</p>
		</article>
		<article data-value="${metascore}" class="notification is-dark">
			<p class="title">${metascore}</p>
			<p class="subtitle">Metascore</p>
		</article>
		<article data-value="${imdbRating}" class="notification is-dark">
			<p class="title">${movieDetail.imdbRating}</p>
			<p class="subtitle">IMDB Rating</p>
		</article>
		<article data-value="${imdbVotes}" class="notification is-dark">
			<p class="title">${movieDetail.imdbVotes}</p>
			<p class="subtitle">IMDB Votes</p>
		</article>
	
	`;
};
