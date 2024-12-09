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

    const locationlist = new Set();
    await fetch(`${sparqlEndpoint}?query=${encodeURIComponent(query)}&format=json`)
        .then(response => {return response.json()})
        .then(data => {
            const countries = data.results.bindings;     
            
            

            // Display results
            for (let i = 0; i < countries.length; i++) {
                let text = countries[i].countryStr.value;
                if (text === "") continue;
                // Remove the URL prefix
                else if (text.includes("http://dbpedia.org/resource/")) 
                    text = text.replace("http://dbpedia.org/resource/", "");
                // Replace underscores with spaces
                if (text.includes("_")) text = text.replace(/_/g, " ");
                locationlist.add(text);
                
            }
        })
        .catch(error => console.error('Error querying SPARQL endpoint:', error));
    
    class SPARQLQueryDispatcher {
        constructor( endpoint ) {
            this.endpoint = endpoint;
        }
    
        query( sparqlQuery ) {
            const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
            const headers = { 'Accept': 'application/sparql-results+json' };
    
            return fetch( fullUrl, { headers } ).then( body => body.json() );
        }
    }
        
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT  ?locationName
    WHERE {
        # Get films and their narrative locations
        ?film wdt:P31 wd:Q11424;   # The film is an instance of a movie (Q11424)
            rdfs:label ?filmTitle;
            wdt:P840 ?narrativeLocation.  # P840 is the property for narrative location
        
        # Get the name of the narrative location
        ?narrativeLocation rdfs:label ?locationName.
        # Filters to ensure English language labels
        FILTER(LANG(?locationName) = "en")
        FILTER (CONTAINS(LCASE(STR(?filmTitle)), LCASE("${film}"))).
    }`;
    
    const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );

    await queryDispatcher.query( sparqlQuery )
        .then( data => {
            const countries = data.results.bindings; 
            for (let i = 0; i < countries.length; i++){
                let text = countries[i].locationName.value;
                locationlist.add(text);
            }
        });
    
    filmList.innerHTML = '';  // Clear existing list
    const h1 = document.createElement('h1');
    const listgroup = document.createElement('div');    
    h1.textContent = `Countries where ${film} movie was filmed:`;
    listgroup.classList.add('list-group','col-6');
    filmList.appendChild(h1);
    
    // If no results found, display message
    if (locationlist.size === 0) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item','list-group-item-action','list-group-item-danger');
        listItem.textContent = 'No results found... Try another movie.';
        listgroup.appendChild(listItem);
    }
    else {
        for (let key of locationlist){
            const listItem = document.createElement('li');
            
            listItem.classList.add('list-group-item','list-group-item-action');
            listItem.textContent = key; // Display country name
            filmList.appendChild(listItem);
        }
    }

    submitbutton.disabled = false;
}

// Render trave form
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
