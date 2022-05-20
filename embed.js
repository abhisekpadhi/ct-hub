const genieUrl = 'https://rapydgenie.netlify.app'; // frontend url
const apiUrl = 'https://02b7-49-37-44-182.ngrok.io'; // backend api url

// emits a user trait to backend
function emitTrait(traits) {
    const viewerId = localStorage.getItem('viewerId');
    console.log(`[embed] emitting traits: ${traits} for viewerId ${viewerId}`)
    fetch(apiUrl + '/trait', {
        method: 'POST',
        body: JSON.stringify({viewerId, traits}),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(_ => {});
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function hideGenie() {
    console.log(`[embed] hideGenie called`)
    const genieEl = document.getElementById('rapydgenie');
    genieEl.style.display = 'none';
}

// injects the ad iframe
function handleIframeEmbed(link = '') {
    console.log(`[embed] handleIframeEmbed called with link: ${link}`);
    const genieEl = document.getElementById('rapydgenie');
    genieEl.textContent = 'Complete the following task to continue';
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
    console.log(`[embed] prepare ad called`)
    fetch(apiUrl + '/ads', {
        method: 'POST',
        body: JSON.stringify({userId, viewerId}),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(r => r.json())
        .then(res => {
            console.log(`[embed] get ads res: ${JSON.stringify(res)}`);
            handleIframeEmbed(genieUrl + `/?id=${res.id}`);
        })
        .catch(console.log)
}

// decides what iframe to embed for ad
function processGenie(userId = '', viewerId = '') {
    console.log(`[embed] process genie called userId ${userId} viewerId ${viewerId}`);
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
        console.log(`[embed] viewerId set to ${uid}`);
    } else {
        console.log(`[embed] viewerId found: ${viewerId}`);
    }
    // hideGenie();
})();
