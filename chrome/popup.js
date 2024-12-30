(async function () {
  function decrypt(cipher, key) {
    return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
  }

  const logMessage = (message, data) => {
    //console.log(message, data);
  };

  await new Promise((r) => document.addEventListener('DOMContentLoaded', r));

  const [tab] = await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  });

  const loginDiv = document.getElementById('unauthorized');
  const loginButton = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const credentialsDiv = document.getElementById('credentials');
  const noneDiv = document.getElementById('none');
  const credentialTemplate = document.getElementById('template');
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');
  const logoutLink = document.getElementById('logout');
  const woizipassLink = document.getElementById('woizipass');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logMessage('Received message:', message);
    if (message.action === 'loadSettingsResponse') {
      const settings =
        message.response === 'undefined'
          ? undefined
          : JSON.parse(message.response);
      woizipassLink.href = settings.url;
      sendResponse();
    } else if (message.action === 'getIdTokenResponse') {
      handleIdTokenResponse(message.response);
      sendResponse();
    } else if (message.action === 'loadCredentialsResponse') {
      const credentials =
        message.response === 'undefined'
          ? undefined
          : JSON.parse(message.response);
      showCredentials(credentials);
      sendResponse();
    } else if (message.action === 'loginResponse') {
      handleLoginResponse(message.response);
      sendResponse();
    } else if (message.action === 'getCredentialResponse') {
      const credentialResponse =
        message.response === 'undefined'
          ? undefined
          : JSON.parse(message.response);
      fillCredentialFormWithResponse(credentialResponse);
      sendResponse();
    }
  });

  logMessage('Send message: loadSettings', { action: 'loadSettings' });
  chrome.runtime.sendMessage({ action: 'loadSettings' }, (response) => {
    if (chrome.runtime.lastError) {
      //console.error(chrome.runtime.lastError.message);
    }
  });

  loginButton.onclick = async () => {
    await login();
  };

  logoutLink.onclick = async (e) => {
    e.preventDefault();
    logMessage('Send message: logout', { action: 'logout' });
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'logout' }, (response) => {
        if (chrome.runtime.lastError) {
          //console.error(chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
    location.reload();
  };

  passwordInput.onkeydown = async (e) => {
    if (e.keyCode == '9' || e.keyCode == '13') {
      await login();
    } else {
      showError('');
    }
  };

  async function handleIdTokenResponse(idToken) {
    if (idToken) {
      try {
        logMessage('Send message: loadCredentials', {
          action: 'loadCredentials',
          tabUrl: tab.url,
          tabId: tab.id,
        });
        chrome.runtime.sendMessage(
          {
            action: 'loadCredentials',
            tabUrl: tab.url,
            tabId: tab.id,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              //console.error(chrome.runtime.lastError.message);
            }
          }
        );
        await setAuthorized(true);
      } catch (e) {
        console.log(e);
        await setAuthorized(false);
      }
    } else {
      await setAuthorized(false);
    }
    loadingDiv.style.display = 'none';
  }

  logMessage('Send message: getIdToken', { action: 'getIdToken' });
  chrome.runtime.sendMessage({ action: 'getIdToken' }, (response) => {
    if (chrome.runtime.lastError) {
      //console.error(chrome.runtime.lastError.message);
    }
  });

  function showError(msg) {
    errorDiv.innerText = msg;
  }

  async function login() {
    if (!passwordInput.value) return;
    const password = passwordInput.value;
    passwordInput.value = '';

    loadingDiv.style.display = 'block';
    loginDiv.style.display = 'none';
    await new Promise((r) => setTimeout(r, 1)); // render ui

    logMessage('Send message: login', { action: 'login', password });
    chrome.runtime.sendMessage({ action: 'login', password }, (response) => {
      if (chrome.runtime.lastError) {
        //console.error(chrome.runtime.lastError.message);
      }
    });
  }

  async function handleLoginResponse(response) {
    try {
      if (response === 'success') {
        showError('');
        await setAuthorized(true);
        logMessage('Send message: loadCredentials', {
          action: 'loadCredentials',
          tabUrl: tab.url,
          tabId: tab.id,
        });
        chrome.runtime.sendMessage(
          {
            action: 'loadCredentials',
            tabUrl: tab.url,
            tabId: tab.id,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              //console.error(chrome.runtime.lastError.message);
            }
          }
        );
      } else {
        throw new Error(response);
      }
    } catch (e) {
      if (e.message === 'invalid response') {
        showError(
          'Please check the woizipass URL in the chrome extension options.'
        );
      }
      if (e.message === '403') {
        showError('Incorrect password.');
      }
      await setAuthorized(false);
    } finally {
      loadingDiv.style.display = 'none';
    }
  }

  async function setAuthorized(authorized) {
    loginDiv.style.display = authorized ? 'none' : 'block';
    if (!authorized) {
      credentialsDiv.style.display = 'none';
      passwordInput.focus();
    }
  }

  async function showCredentials(credentials) {
    credentialsDiv.style.display = 'block';
    noneDiv.style.display = credentials.length === 0 ? 'block' : 'none';

    for (const credential of credentials) {
      if (credential.username) {
        await createCredentialButton(
          credential.id,
          credential.username,
          credential.comment
        );
      }
      if (credential.email) {
        await createCredentialButton(
          credential.id,
          credential.email,
          credential.comment
        );
      }
    }
  }

  async function executeScripts(scripts) {
    const file = scripts.files.shift();

    try {
      await chrome.scripting.executeScript({
        target: { tabId: scripts.tabId, allFrames: true },
        files: [file],
      });
    } catch (e) {
      logger.error('executeScript error for tab ' + scripts.tabId, e.message);
    }

    if (scripts.files.length > 0) {
      await executeScripts(scripts);
    }
  }

  async function fillCredentialForm(tabId, credentialId, username) {
    loadingDiv.style.display = 'block';
    credentialsDiv.style.display = 'none';
    logMessage('Send message: getCredential', {
      action: 'getCredential',
      credentialId,
      tabId,
      username,
    });
    chrome.runtime.sendMessage(
      {
        action: 'getCredential',
        credentialId,
        tabId,
        username,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          //console.error(chrome.runtime.lastError.message);
        }
      }
    );
  }

  async function fillCredentialFormWithResponse(credentialResponse) {
    const password = decrypt(
      credentialResponse.password,
      credentialResponse.clientKey
    );

    const message = {
      username: credentialResponse.username,
      password: password,
      method: '' /* click or submit */,
      tabId: credentialResponse.tabId,
      logLevel: logger.level,
    };

    let pong;
    try {
      logMessage('Send message: ping', { ping: true });
      pong = await chrome.tabs.sendMessage(credentialResponse.tabId, {
        ping: true,
      });
    } catch (e) {}

    if (!pong || !pong.status == 'pong') {
      await executeScripts({
        tabId: credentialResponse.tabId,
        files: [
          'js/jquery.slim.min.js',
          'logger.js',
          'inuserview.js',
          'page.js',
        ],
      });
    }

    logMessage('Send message:', message);
    await chrome.tabs.sendMessage(credentialResponse.tabId, message);

    //window.close();
  }

  async function createCredentialButton(credentialId, username, comment) {
    const item = credentialTemplate.cloneNode(true);

    item.style.display = 'block';
    const button = item.querySelector('button');
    const text = item.querySelector('div');
    button.innerText = username;
    text.innerText = comment || '';

    button.onclick = async () =>
      await fillCredentialForm(tab.id, credentialId, username);

    credentialTemplate.parentNode.insertBefore(item, credentialTemplate);
  }
})();
