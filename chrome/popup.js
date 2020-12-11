(async function () {

    await new Promise(r => document.addEventListener('DOMContentLoaded', r));

    const background = await chrome.runtime.getBackgroundPage();
    const woizipass = background.woizipass;

    const tab = await new Promise(r => chrome.tabs.getSelected(null, r));

    const loginDiv = document.getElementById('unauthorized');
    const loginButton = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const credentialsDiv = document.getElementById('credentials');
    const noneDiv = document.getElementById('none');
    const credentialTemplate = document.getElementById('template');
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    const logoutButton = document.getElementById('logout');

    loginButton.onclick = async () => {
        await login();
    }

    logoutButton.onclick = async () => {
        woizipass.idToken = undefined;
        woizipass.clientKey = undefined;
        location.reload();
    }

    passwordInput.onkeyup = async (e) => {
        if (e.keyCode == '13') {
            await login();
        }
        else {
            showError('');
        }
    }

    try {
        if (woizipass.idToken) {
            try {
                const credentials = await woizipass.loadCredentials(tab);
                await setAuthorized(true);
                await showCredentials(credentials);
            }
            catch (e) {
                await setAuthorized(false);
            }
        }
        else {
            await setAuthorized(false);
        }
    }
    finally {
        loadingDiv.style.display = 'none';
    }

    function showError(msg) {
        errorDiv.innerText = msg;
    }

    async function login() {
        if (!passwordInput.value) return;
        const password = passwordInput.value;
        passwordInput.value = '';

        loadingDiv.style.display = 'block';
        loginDiv.style.display = 'none';
        await new Promise(r => setTimeout(r, 1)); // render ui

        try {
            try {
                await woizipass.login(password);
                showError('');
                await setAuthorized(true);
            }
            catch (e) {
                if (e.message === 'invalid response') {
                    showError('Please check the woizipass URL in the chrome extension options.');
                }
                if (e.message === '403') {
                    showError('Incorrect password.');
                }
                await setAuthorized(false);
                return;
            }

            const credentials = await woizipass.loadCredentials(tab);
            await showCredentials(credentials);
        }
        finally {
            loadingDiv.style.display = 'none';
        }
    }

    async function setAuthorized(authorized) {
        loginDiv.style.display = authorized ? 'none' : 'block';
        if (!authorized) {
            passwordInput.focus();
        }
    }

    async function showCredentials(credentials) {
        credentialsDiv.style.display = 'block';
        noneDiv.style.display = credentials.length === 0 ? "block" : "none";

        for (const credential of credentials) {
            if (credential.username) {
                await createCredentialButton(credential.id, credential.username);
            }
            if (credential.email) {
                await createCredentialButton(credential.id, credential.email);
            }
        }

        credentialTemplate.remove();
    }

    async function executeScripts(scripts) {
        const file = scripts.files.shift();
        const details = { file: file, runAt: "document_idle", allFrames: true }

        try {
            await chrome.tabs.executeScript(scripts.tabId, details)
        }
        catch (e) {
            logger.error('executeScripts error:', e.message)
        }

        if (scripts.files.length > 0) {
            await executeScripts(scripts);
        }
    }

    async function fillCredentialForm(tabId, credentialId, username) {
        loadingDiv.style.display = 'block';
        credentialsDiv.style.display = 'none';
        try {
            const settings = await woizipass.loadSettings();
            const credentialResponse = await woizipass.http("GET", settings.url + "/api/credential/" + credentialId, { authorization: 'Bearer ' + woizipass.idToken })

            const password = decrypt(credentialResponse.password, woizipass.clientKey);

            const message = {
                username: username,
                password: password,
                method: '' /* click or submit */,
                tabId: tabId,
                logLevel: logger.level
            }

            let pong;
            try {
                pong = await chrome.tabs.sendMessage(tabId, { "ping": true })
            }
            catch (e) {
            }

            if (!pong || !pong.status == "pong") {
                await executeScripts(
                    {
                        tabId: tabId,
                        files: ['js/jquery.slim.min.js', 'logger.js', 'inuserview.js', 'page.js']
                    }
                )
            }

            await chrome.tabs.sendMessage(tabId, message)

            window.close();
        }
        finally {
            loadingDiv.style.display = 'none';
            credentialsDiv.style.display = 'block';
        }
    }

    async function createCredentialButton(credentialId, username) {
        const item = credentialTemplate.cloneNode();

        item.innerText = username;

        item.onclick = async () => await fillCredentialForm(tab.id, credentialId, username);

        credentialTemplate.parentNode.insertBefore(item, credentialTemplate);
    }
})();