// Fetch film locations from DBpedia 
const getFilmLocations = async film => {
    const results = document.getElementById('results'); // selector for results container
    const submitbutton = document.getElementById('filmform__submit'); //selector for submit button
    const img = document.createElement('img'); //create img we can add loading icon
    const locationlist = new Set(); // Create SET for results so there is no repeating data

    results.innerHTML = '';  // Clear existing list
    submitbutton.disabled = true; // disable submit button
    
    //inject loading icon while we query for results
    img.src = './assets/loading.gif'; 
    img.alt = 'Loading...';
    img.classList.add('mx-auto');
    results.appendChild(img);
    
    await getdbpediaresults(locationlist, film); // get dbpedia results
    await getwikidataresults(locationlist, film); // get wikidata results
    
    results.innerHTML = '';  // Clear existing loading image
    
    // create container for list
    const listgroup = document.createElement('ul'); 
    
    // create title for results
    const h1 = document.createElement('h1');   
    h1.textContent = `Countries where ${film} movie was filmed:`;
    listgroup.classList.add('list-group','col-6');
    
    // add tile and list to results
    results.appendChild(h1);
    results.appendChild(listgroup)
    
    // If no results found, display No results found... Try another movie.
    if (locationlist.size === 0) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item','list-group-item-action','list-group-item-danger');
        listItem.textContent = 'No results found... Try another movie.';
        listgroup.appendChild(listItem);
    }
    // loop through results and display on page
    else {
        for (let key of locationlist){
            let text = key;
            const listItemli = document.createElement('li'); // create list element
            listItemli.style = "list-style:none;";
            const listItem = document.createElement('a'); // anquor tag for link
            listItem.classList.add('list-group-item','list-group-item-action'); //styles for link
            listItem.textContent = text; // Display country name
            text = text.replace(/ /g, "%20"); // Replace spaces with %20
            listItem.href = `https://www.expedia.com/Hotel-Search?destination=${text}&adults=2&rooms=1&sort=RECOMMENDED`;
            listItem.target = '_blank'; // open in new page
            listItem.rel = 'noopener noreferrer'; // open in new page
            listItemli.appendChild(listItem); // add item to list 
            listgroup.appendChild(listItemli); // add list to page
        }
    }
    // enable the submit button
    submitbutton.disabled = false;
}

// function to get results from dbpedia
const getdbpediaresults = async(locationlist, film) => {
    const dbpediaEnpoint = 'https://dbpedia.org/sparql';
    const dbpediaquery = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT DISTINCT ?countryStr WHERE {
            ?film a dbo:Film.
            ?film dbp:country ?country.
            ?film rdfs:label ?label.
            FILTER (CONTAINS(LCASE(STR(?label)), LCASE("${film}"))).
            BIND(STR(?country) AS ?countryStr)
        }
    `;
    
    await fetch(`${dbpediaEnpoint}?query=${encodeURIComponent(dbpediaquery)}&format=json`)
        .then(response => response.json())
        .then(data => {
            // filter out response to have only country results
            const countries = data.results.bindings;
            // loop through data 
            for (let i = 0; i < countries.length; i++) {
                // get text value
                let text = countries[i].countryStr.value;
                // if text is empty we don't need the data
                if (text === "") continue;
                // Remove the URL prefix so we get only the location
                else if (text.includes("http://dbpedia.org/resource/")) 
                    text = text.replace("http://dbpedia.org/resource/", "");
                // Replace underscores with spaces
                if (text.includes("_")) text = text.replace(/_/g, " ");
                // add location to list
                locationlist.add(text);
            }
        })
        .catch(error => console.error('Error querying dbpedia endpoint:', error));
}

// function to get results from wikidata
const getwikidataresults = async(locationlist, film) => {
    const wikidataEndpoint = 'https://query.wikidata.org/sparql';
    const wikidataQuery = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT  ?locationName
    WHERE {
        # Get films and their narrative locations
        ?film wdt:P31 wd:Q11424;   # The film is an (P31)instance of a movie(Q11424)
            rdfs:label ?filmTitle;
            wdt:P840 ?narrativeLocation.  # P840 is the property for narrative location
        ?narrativeLocation rdfs:label ?locationName. # Get the name of the narrative location
        FILTER(LANG(?locationName) = "en") # Filters to ensure English language labels
        FILTER (CONTAINS(LCASE(STR(?filmTitle)), LCASE("${film}"))).
    }`;
    

    await fetch(`${wikidataEndpoint}?query=${encodeURIComponent(wikidataQuery)}`,
        { headers:{ 'Accept': 'application/sparql-results+json' }})
        .then(response => response.json())
        .then( data => {
            // filter out response to have only country results
            const countries = data.results.bindings; 
            // loop through data 
            for (let i = 0; i < countries.length; i++){
                let text = countries[i].locationName.value;
                // add location to list
                locationlist.add(text);
            }
        })
        .catch(error => console.error('Error querying wikidata endpoint:', error));
}

// Render film location form
const filmLocationForm = () => {
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

// Render the form and container for results
const render = () => {
    return (`
    <h1 class="text-center mt-4">Heads in the Cloud</h1>
    <main>
       ${filmLocationForm()}
       <div class="container-sm mt-4" id="results"><div>
    </main>`
    );  
}

// Main function
const main = () => {
    // grab empty element then inject containers for form and results
    document.getElementById('root').innerHTML = render();
    // Event listener for form submission
    const form = document.querySelector('form.filmform');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        //get text input
        const input = document.getElementById('inputFilm');
        getFilmLocations(input.value);
        // empty text box
        input.value = '';
    });
}

main();
