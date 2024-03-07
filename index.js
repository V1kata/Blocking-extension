console.log('index.js working');
let regex = /http[s]?:\/\/[\w.,]+\//gi;

let button = document.querySelector('button');
button.addEventListener('click', blockSites);

const textArea = document.querySelector('textarea');
let input = document.querySelector('input');
let h1 = document.querySelector('h1')
const p = document.querySelector('p');
const indexChannel = new BroadcastChannel('testChannel');

textArea.addEventListener('change', textAreaChange);
document.addEventListener('DOMContentLoaded', load);
setInterval(checkEndTime, 3000);

async function load(e) {
    let { parContent, btn, textAreaStyle, urls, endTimeOfBlock } = await chrome.storage.session.get(['parContent', 'btn', 'textAreaStyle', 'urls', 'endTimeOfBlock'])

    if (parContent) {
        p.textContent = parContent;
    } else {
        p.textContent = 'Working!';
    }

    if (btn && textAreaStyle) {
        button.textContent = btn;
        textArea.style.display = textAreaStyle;
    }

    if (!urls) {
        return;
    }

    if (typeof urls == 'object') {
        textArea.value = urls.join('\n');
    } else {
        textArea.value = urls;
    }

    input.value = endTimeOfBlock;
    if (!endTimeOfBlock) {
        input.removeAttribute('disabled');
        return;
    }

    input.setAttribute('disabled', true);
}

indexChannel.onmessage = async (event) => {
    let data = event.data;

    switch (data.reason) {
        case 'parContent':
            let { parContent } = await chrome.storage.session.get(['parContent'])
            p.textContent = parContent;
            break;
        default:
            onsole.log('not working')
            break;
    }
    if (data.reason == 'parContent') {
        let { parContent } = await chrome.storage.session.get(['parContent'])
        p.textContent = parContent;
    } else {
        console.log('not working')
    }
};

function blockSites(e) {
    let blocker;
    if (button.textContent == 'Unblock') {
        blocker = changeText();
        indexChannel.postMessage({ blocker })
        return;
    }

    let tabs = textArea.value.match(regex);
    let endHour = input.value;

    if (!tabs?.length) {
        p.textContent = 'Url needs to be valid';
        if (!endHour) {
            let message = 'Please put end time';
            if (p.textContent.startsWith('Url')) {
                p.textContent += ' ' + message;
            } else {
                p.textContent = message;
            }
        }

        return
    }

    blocker = changeText();

    indexChannel.postMessage({ tabs, blocker, endHour });
}

function changeText() {
    if (button.textContent == "Block") {
        textArea.style.display = 'none';
        input.setAttribute('disabled', true);
    } else {
        textArea.style.display = 'block';
        input.removeAttribute('disabled');
    }

    button.textContent = button.textContent == "Block" ? "Unblock" : "Block";

    chrome.storage.session.set({ btn: button.textContent, textAreaStyle: textArea.style.display });

    return button.textContent == "Block" ? false : true
}

function textAreaChange(e) {
    chrome.storage.session.set({ urls: e.target.value });
}

async function checkEndTime() {
    let { endTimeOfBlock } = await chrome.storage.session.get(['endTimeOfBlock']);
    if (hourToMinutes(endTimeOfBlock)) {
        endTimeOfBlock = null;
        chrome.storage.session.set({ endTimeOfBlock });
        changeText();
    }
}