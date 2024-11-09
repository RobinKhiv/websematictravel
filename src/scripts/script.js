const getTravelForm = () => {
    return `
    <div class="container-sm mt-4">
        <form class="row g-3">
            <div class="col-md-6">
            <div class="col-md-12">
                <label for="customRange1" class="form-label">Days on Vacation</label> <span id="vacationrangeval">6</span></br>
                <input type="range" id="vacationrangecontrol" class="form-range" min="0" max="12" step="1" id="customRange1" onChange="document.getElementById('vacationrangeval').innerText = document.getElementById('vacationrangecontrol').value">
            </div>
            <div class="col-12">
                <label for="customRange3" class="form-label">Budget</label> <span>$ <span id="budgetrangeval">2500</span></span></br>
                <input type="range" id="budgetrangecontrol" class="form-range" min="0" max="5000" step="0.5" id="customRange3" onChange="document.getElementById('budgetrangeval').innerText = document.getElementById('budgetrangecontrol').value">
            </div>
            <div class="col-md-6 mb-2">
                <label for="inputHotel" class="form-label">Hotel</label>
                <input type="text" class="form-control" id="inputHotel">
            </div>
            <div class="col-12">
                <button type="submit" class="btn btn-primary">Submit</button>
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
       <div id="results"><div>
    </main>`
    );
}

document.getElementById('root').innerHTML = render();