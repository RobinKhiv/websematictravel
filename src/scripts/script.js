const getTravelForm = () => {
    return `
    <div class="container-sm mt-4">
        <form class="filmform row g-3">
            <div class="col-md-6">
            <div class="col-12 mb-2">
                <label for="inputFilm" class="form-label">Favorite movie</label>
                <input type="text" class="form-control" id="inputFilm">
            </div>
            <div class="col-12">
                <button id="filmform__submit" type="submit" class="btn btn-primary">Submit</button>
            </div>
            </div>
        </form>
    </div>
    `;
}

const render = () => {
    return (`
    <h1 class="text-center mt-4">Heads in the Cloud</h1>
    <main>
       ${getTravelForm()}
       <div class="container-sm mt-4" id="results"><div>
    </main>`
    );  
}

const getFilmLocations = async film => {
    if (!film) {
        alert("Please enter a movie name.");
        return;
    }
    const filmList = document.getElementById('results');
    const submitbutton = document.getElementById('filmform__submit');
    const img = document.createElement('img');
    const sparqlEndpoint = 'https://dbpedia.org/sparql';
    const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT DISTINCT ?countryStr WHERE {
            ?film a dbo:Film.
            ?film dbp:country ?country.
            ?film rdfs:label ?label.
            FILTER (CONTAINS(LCASE(STR(?label)), LCASE("${film}"))).
            BIND(STR(?country) AS ?countryStr)
        }
    `;
    submitbutton.disabled = true;
    img.src = './assets/loading.gif';
    img.alt = 'Loading...';
    img.classList.add('mx-auto');
    filmList.appendChild(img);

    await fetch(`${sparqlEndpoint}?query=${encodeURIComponent(query)}&format=json`)
        .then(response => {return response.json()})
        .then(data => {
            const countries = data.results.bindings;     
            filmList.innerHTML = '';  // Clear existing list
            countries.forEach(country => {
                const listItem = document.createElement('li');
                listItem.textContent = country.countryStr.value; // Display country name
                filmList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error querying SPARQL endpoint:', error));
    
    submitbutton.disabled = false;
}

const main = () => {
    document.getElementById('root').innerHTML = render();
    const form = document.querySelector('form.filmform');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('inputFilm');
        
        const value = input.value;
        getFilmLocations(value);
        input.value = '';
    });
}

main();