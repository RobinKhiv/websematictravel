const getTravelForm = () => {
    return `
    <div class="container-sm mt-4">
        <form class="filmform row g-3">
            <div class="col-md-6">
            <div class="col-12 mb-2">
                <label for="inputFilm" class="form-label">Favorite movie</label>
                <input type="text" class="form-control" id="inputFilm" required>
            </div>
            <div class="col-12">
                <button id="filmform__submit" type="submit" class="btn btn-primary">Submit</button>
            </div>
            </div>
        </form>
    </div>
    `;
}

// Fetch film locations from DBpedia
const getFilmLocations = async film => {
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
    filmList.innerHTML = '';  // Clear existing list
    submitbutton.disabled = true;
    img.src = './assets/loading.gif';
    img.alt = 'Loading...';
    img.classList.add('mx-auto');
    filmList.appendChild(img);

    await fetch(`${sparqlEndpoint}?query=${encodeURIComponent(query)}&format=json`)
        .then(response => {return response.json()})
        .then(data => {
            const countries = data.results.bindings;     
            const h1 = document.createElement('h1');
            const listgroup = document.createElement('div');
            filmList.innerHTML = '';  // Clear existing list
            h1.textContent = `Countries where ${film} movie was filmed:`;
            listgroup.classList.add('list-group','col-6');
            filmList.appendChild(h1);
            filmList.appendChild(listgroup);
           
            // If no results found, display message
            if (countries.length === 0) {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item','list-group-item-action','list-group-item-warning');
                listItem.textContent = 'No results found... Try another movie.';
                listgroup.appendChild(listItem);
                return;
            }

            // Display results
            for (let i = 0; i < countries.length; i++) {
                let text = countries[i].countryStr.value;
                if (text === "") continue;
                // Remove the URL prefix
                else if (text.includes("http://dbpedia.org/resource/")) 
                    text = text.replace("http://dbpedia.org/resource/", "");
                // Replace underscores with spaces
                if (text.includes("_")) text = text.replace(/_/g, " ");

                const listItem = document.createElement('a');
                listItem.classList.add('list-group-item','list-group-item-action');
                listItem.textContent = text; // Display country name
                text = text.replace(/ /g, "%20"); // Replace spaces with %20
                listItem.href = `https://www.expedia.com/Hotel-Search?destination=${text}&adults=2&rooms=1&sort=RECOMMENDED`;
                listItem.target = '_blank';
                listItem.rel = 'noopener noreferrer';
                listgroup.appendChild(listItem);
            }
        })
        .catch(error => console.error('Error querying SPARQL endpoint:', error));
    
    submitbutton.disabled = false;
}

// Render the page
const render = () => {
    return (`
    <h1 class="text-center mt-4">Heads in the Cloud</h1>
    <main>
       ${getTravelForm()}
       <div class="container-sm mt-4" id="results"><div>
    </main>`
    );  
}

// Main function
const main = () => {
    document.getElementById('root').innerHTML = render();
    const form = document.querySelector('form.filmform');
    // Event listener for form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('inputFilm');
        const value = input.value;
        getFilmLocations(value);
        input.value = '';
    });
}

main();
