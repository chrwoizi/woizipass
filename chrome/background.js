try {
  importScripts('./node_modules/argon2-browser/dist/argon2-bundled.min.js');
} catch (e) {
  console.error(e);
}

const argon2Params = {
  time: 1,
  mem: 100 * 1024,
  hashLen: 32,
};

async function createApiKey(password) {
  const hash = await argon2.hash({
    ...argon2Params,
    type: argon2.ArgonType.Argon2id,
    pass: password,
    salt: 'api-salt', // at least 8 characters
  });
  return hash.hashHex;
}

async function createClientKey(password) {
  const hash = await argon2.hash({
    ...argon2Params,
    type: argon2.ArgonType.Argon2id,
    pass: password,
    salt: 'cli-salt', // at least 8 characters
  });
  return hash.hashHex;
}

var idToken;
var clientKey;

const logMessage = (message, data) => {
  //console.log(message, data);
};

const setGreenIcon = (tabId) =>
  chrome.action.setIcon({ path: 'icons/icon19g.png', tabId });

const resetIcon = (tabId) =>
  chrome.action.setIcon({ path: 'icons/icon19.png', tabId });

const http = async (method, url, headers, body) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(response.status);
  }
  return response.json();
};

const loadSettings = () =>
  new Promise((resolve) => chrome.storage.local.get({ url: '' }, resolve));

const login = async (password) => {
  clientKey = await createClientKey(password);
  const apiKey = await createApiKey(password);
  const { url } = await loadSettings();
  const loginResponse = await http(
    'POST',
    `${url}/api/login`,
    {},
    { username: 'woizipass', password: apiKey }
  );
  if (!loginResponse) throw new Error('invalid response');
  idToken = loginResponse.idToken;
};

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const loadCredentials = async (tabUrl, tabId) => {
  try {
    if (!idToken) throw new Error('unauthorized');
    const { url } = await loadSettings();
    const credentialsResponse = await http('GET', `${url}/api/credential`, {
      authorization: `Bearer ${idToken}`,
    });

    const matchDomain = () => {
      const match = /^https?:\/\/([\w-\.]+)/.exec(tabUrl);
      if (!match) return [];
      const domain = match[1];
      const domains = [
        domain,
        ...domain
          .split('.')
          .slice(1)
          .map((_, i, arr) => arr.slice(i).join('.').toLowerCase()),
        domain.split('.').slice(-2, -1).join('.').toLowerCase(),
      ].filter((x) => x.length > 0);
      return credentialsResponse.credentials.filter((x) => {
        if (domains.indexOf(x.provider.toLowerCase()) !== -1) {
          return true;
        }
        return false;
      });
    };

    const matchUrl = () => {
      const buildUrlRegExp = (s) =>
        new RegExp(escapeRegExp(s).replace('\\*', '.*'));
      return credentialsResponse.credentials.filter((x) => {
        if (
          x.url?.length > 0 &&
          x.url.split(';').some((y) => buildUrlRegExp(y).test(tabUrl))
        ) {
          return true;
        }
        return false;
      });
    };

    const credentials = [...new Set([...matchUrl(), ...matchDomain()])];

    await (credentials.length > 0 ? setGreenIcon(tabId) : resetIcon(tabId));
    return credentials;
  } catch (e) {
    await resetIcon(tabId);
    throw e;
  }
};

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    try {
      await loadCredentials(tab.url, tab.id);
    } catch {}
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logMessage('Received message:', message);
  const sendMessage = (action, response) => {
    logMessage(`Send message: ${action}`, { action, response });
    chrome.runtime.sendMessage(sender.id, { action, response }, (res) => {
      if (chrome.runtime.lastError) {
        //console.error(chrome.runtime.lastError.message);
      }
    });
  };

  try {
    switch (message.action) {
      case 'loadSettings':
        const settings = await loadSettings();
        sendMessage(`${message.action}Response`, JSON.stringify(settings));
        break;
      case 'login':
        await login(message.password);
        sendMessage(`${message.action}Response`, 'success');
        break;
      case 'logout':
        idToken = undefined;
        clientKey = undefined;
        sendMessage(`${message.action}Response`, 'success');
        break;
      case 'getIdToken':
        sendMessage(`${message.action}Response`, idToken);
        break;
      case 'loadCredentials':
        const credentials = await loadCredentials(
          message.tabUrl,
          message.tabId
        );
        sendMessage(`${message.action}Response`, JSON.stringify(credentials));
        break;
      case 'getCredential':
        const { url } = await loadSettings();
        const credentialResponse = await http(
          'GET',
          `${url}/api/credential/${message.credentialId}`,
          { authorization: `Bearer ${idToken}` }
        );
        sendMessage(
          `${message.action}Response`,
          JSON.stringify({
            clientKey: clientKey,
            password: credentialResponse.password,
            tabId: message.tabId,
            username: message.username,
          })
        );
        break;
      default:
        break;
    }
  } catch (e) {
    sendMessage(`${message.action}Response`, e.message);
  }
  sendResponse();
  return true;
});
