const woizipass = function (obj) {
    if (obj instanceof woizipass) return obj
    if (!(this instanceof woizipass)) return new woizipass(obj)
}
window.woizipass = woizipass;

woizipass.greenIcon = async function (tabId) {
    await chrome.browserAction.setIcon({ path: "icons/icon19g.png", tabId: tabId })
}

woizipass.resetIcon = async function (tabId) {
    await chrome.browserAction.setIcon({ path: "icons/icon19.png", tabId: tabId })
}

woizipass.http = async function (method, url, headers, body) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.responseType = "json";
        for (let header of Object.getOwnPropertyNames(headers)) {
            xhr.setRequestHeader(header, headers[header]);
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.response);
                }
                else {
                    reject(new Error(xhr.status));
                }
            }
        };
        xhr.send(body ? JSON.stringify(body) : undefined);
    })
}

woizipass.loadSettings = async function () {
    return new Promise(r => chrome.storage.local.get({ url: '' }, r));
}

woizipass.login = async function (password) {
    woizipass.clientKey = await createClientKey(password);
    apiKey = await createApiKey(password);
    const settings = await woizipass.loadSettings();
    const loginResponse = await woizipass.http("POST", settings.url + "/api/login", {}, { username: "woizipass", password: apiKey })
    if (!loginResponse) {
        throw new Error('invalid response');
    }
    woizipass.idToken = loginResponse.idToken;
}

woizipass.loadCredentials = async function (tab) {
    try {
        if (!woizipass.idToken) {
            throw new Error('unauthorized');
        }

        const settings = await woizipass.loadSettings();
        const credentialsResponse = await woizipass.http("GET", settings.url + "/api/credential", { authorization: 'Bearer ' + woizipass.idToken })

        const match = /^https?:\/\/([\w-\.]+)/.exec(tab.url);
        if (!match) {
            return [];
        }

        const domain = match[1];
        const domains = [domain];
        const split = domain.split('.');
        while (split.length > 2) {
            split.shift();
            domains.push(split.join('.'));
        }
        if (split.length === 2) {
            domains.push(split[0]);
        }

        const credentials = credentialsResponse.credentials.filter(x => domains.indexOf(x.provider) >= 0);

        if (credentials.length > 0) {
            await woizipass.greenIcon(tab.id);
        }
        else {
            await woizipass.resetIcon(tab.id);
        }

        return credentials;
    }
    catch {
        await woizipass.resetIcon(tab.id);
        throw e;
    }
}

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        try {
            await woizipass.loadCredentials(tab);
        }
        catch {
        }
    }
});