const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const voiceBtn = document.getElementById('voiceBtn');
const yearMinInput = document.getElementById('yearMin');
const yearMaxInput = document.getElementById('yearMax');
const resultsDiv = document.getElementById('results');

function getCoverURL(cover_i) {
  return cover_i
    ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
    : 'https://via.placeholder.com/120x180?text=Sin+portada';
}

function renderResults(docs) {
  if (docs.length === 0) {
    resultsDiv.innerHTML = '<p>No se encontraron libros.</p>';
    return;
  }

  resultsDiv.innerHTML = docs.map(book => {
    const title = book.title || "Título desconocido";
    const author = book.author_name ? book.author_name.join(', ') : "Autor desconocido";
    const firstPublish = book.first_publish_year || "Año desconocido";
    const coverURL = getCoverURL(book.cover_i);
    const openLibraryURL = book.key ? `https://openlibrary.org${book.key}` : '#';

    return `
      <div class="book-card animate__animated animate__fadeInUp">
        <img src="${coverURL}" alt="${title}" />
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>
        <div class="book-year">${firstPublish}</div>
        <a href="${openLibraryURL}" target="_blank" rel="noopener noreferrer">Ver más</a>
      </div>
    `;
  }).join('');
}

function filterByYear(docs, minYear, maxYear) {
  return docs.filter(book => {
    const year = book.first_publish_year;
    if (!year) return false;
    if (minYear && year < minYear) return false;
    if (maxYear && year > maxYear) return false;
    return true;
  });
}

async function searchBooks() {
  const query = searchInput.value.trim();
  const yearMin = parseInt(yearMinInput.value);
  const yearMax = parseInt(yearMaxInput.value);

  if (!query) {
    resultsDiv.innerHTML = '<p>Por favor ingresa un término de búsqueda.</p>';
    return;
  }

  resultsDiv.innerHTML = '<p>Cargando resultados...</p>';

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=50`);
    if (!response.ok) throw new Error('Error en la búsqueda');
    const data = await response.json();

    let filteredDocs = data.docs;
    if (!isNaN(yearMin) || !isNaN(yearMax)) {
      filteredDocs = filterByYear(filteredDocs, yearMin, yearMax);
    }

    renderResults(filteredDocs.slice(0, 20));
  } catch (error) {
    resultsDiv.innerHTML = `<p>Error al buscar libros: ${error.message}</p>`;
  }
}

function clearFilters() {
  searchInput.value = '';
  yearMinInput.value = '';
  yearMaxInput.value = '';
  resultsDiv.innerHTML = '';
}

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Tu navegador no soporta búsqueda por voz.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript;
    searchInput.value = result;
    searchBooks();
  };

  recognition.onerror = function () {
    alert("No se pudo reconocer tu voz.");
  };

  recognition.start();
}

searchBtn.addEventListener('click', searchBooks);
clearBtn.addEventListener('click', clearFilters);

if (voiceBtn) {
  voiceBtn.addEventListener('click', startVoiceRecognition);
}

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchBooks();
  }
});
