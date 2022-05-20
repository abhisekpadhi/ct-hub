const genieUrl = 'https://rapydgenie.netlify.app'; // frontend url
const apiUrl = 'https://rapydgenie-nodejs-api.onrender.com'; // backend api url

// emits a user trait to backend
function emitTrait(traits) {
    const viewerId = localStorage.getItem('viewerId');
    console.log(`emitting traits: ${traits} for viewerId ${viewerId}`)
    fetch(apiUrl + '/trait', {
        method: 'POST',
        body: JSON.stringify({viewerId, traits}),
    }).then(_ => {});
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function hideGenie() {
    const genieEl = document.getElementById('rapydgenie');
    genieEl.style.display = 'none';
}

// injects the ad iframe
function handleIframeEmbed(link = '') {
    const genieEl = document.getElementById('rapydgenie');
    genieEl.textContent = 'Complete the following task to continue <br />';
    const iframeUrl = (link.length === 0) ? genieUrl : link;
    const iframe = document.createElement('iframe');
    iframe.width="480px";
    iframe.height="620px";
    iframe.id="genie123";
    iframe.setAttribute("src", iframeUrl);
    genieEl.appendChild(iframe);
}

// fetches checkoutId and embeds ad iframe
function prepareAd(userId, viewerId) {
    fetch(apiUrl + '/ads', {
        method: 'POST',
        body: JSON.stringify({userId, viewerId}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(r => r.json())
        .then(res => {
            console.log(`get ads res: ${JSON.stringify(res)}`);
            handleIframeEmbed(genieUrl + `/?id=${res.id}`);
        })
        .catch(console.log)
}

// decides what iframe to embed for ad
function processGenie(userId = '', viewerId = '') {
    if (userId.length > 0 && viewerId.length > 0) {
        // show abandoned cart
        prepareAd(userId, viewerId);
    } else  {
        // if identity not found, show an pic ad
        handleIframeEmbed();
    }
}

// Immediate executing
(() => {
    const viewerId = localStorage.getItem('viewerId')
    if (viewerId === null) {
        const uid = uuidv4();
        localStorage.setItem('viewerId', uid);
        console.log(`viewerId set to ${uid}`);
    } else {
        console.log(`viewerId found: ${viewerId}`);
    }
    hideGenie();
})();
