const url = 'https://tosshub.netlify.app';

function init(payload) {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(_ => {});
}

function emit(payload) {
    fetch(url + '/trait', {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(_ => {});
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
function hideGenie() {
    const genieEl = document.getElementById('genie');
    genieEl.style.display = 'none';
}

function showGenie() {
    const genieEl = document.getElementById('genie');

    // show loading in genie container
    genieEl.textContent = 'Complete the following task to continue';

    // embed iframe that will perform following activities 👇

    // attempt to get user identity

    // if user identity found, try to fetch abandoned cart

    // show abandoned cart

    // if identity not found, show an ad

}

// Immediate executing
(() => {
    hideGenie();
    // generate a sessionId and emit trait events to genie backend
    const sessId = uuidv4();
    init(sessId);
})();
