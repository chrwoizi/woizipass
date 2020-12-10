'use strict';

const triggerInput = function (element) {
    element.dispatchEvent(new Event('input', { 'bubbles': true }))
    element.dispatchEvent(new Event('change', { 'bubbles': true }))
    element.dispatchEvent(new Event('focus', { 'bubbles': true }))
}

const typeUsername = function (field, value) {
    jQuery(field).val(value)
    triggerInput(field)
    jQuery(field).val(value)
}

const typePassword = function (field, value) {
    jQuery(field).val(value)
    triggerInput(field)
}

const hideLabels = function (inputFields) {
    const labels = jQuery('label[for]').filter(':inuserview')
    inputFields.each(function () {
        const elem = this
        labels.each(function () {
            if (this.control == elem) {
                jQuery(this).hide()
            }
        })
    })
}

const findUsernameElements = function (form) {
    let username = form
        .find('input[type!=button][type!=checkbox][type!=color][type!=date][type!=datetime][type!=datetime-local][type!=file][type!=image][type!=month][type!=password][type!=radio][type!=range][type!=reset][type!=submit][type!=search][type!=tel][type!=time][type!=url][type!=week]')
        .not('[aria-hidden="true"]').not(':hidden')
    const username_inview = username.filter(':inuserview')

    if (!username_inview.length) {
        logger.log('trying to show username field')
        hideLabels(username);

        username = username.filter(':inuserview')
    }

    return username;
}

const findPasswordElements = function () {
    let password = jQuery(':password').not(':hidden').not('[aria-hidden="true"]')
    const password_inview = password.filter(':inuserview')

    if (!password_inview.length) {
        logger.log('trying to show password field')
        hideLabels(password);

        password = jQuery(':password').show()
        password = password.filter(':inuserview')
    }

    return password;
}

const fillSinglePasswordAndBestUsername = function (usernameElements, passwordElements, request) {
    typePassword(passwordElements[0], request.password)

    if (usernameElements.length) {
        const candidates = []
        usernameElements.each(function () {
            const distance = Math.abs(jQuery(passwordElements).parents().length - jQuery(this).parents().length)
            candidates.unshift({ distance: distance, user: this });
        })
        const min = Math.min.apply(Math, candidates.map(function (c) { return c.distance; }))
        candidates.reverse()
        const best = candidates.find(function (c) { return c.distance == min; })
        typeUsername(best.user, request.username)
    }
}

const fillAllPasswordsAndUsernames = function (usernameElements, passwordElements, request) {
    passwordElements.each(function () {
        const passfield = this
        typePassword(this, request.password)

        usernameElements.each(function () {
            const userfield = this
            if (Math.abs(jQuery(passfield).parents().length - jQuery(userfield).parents().length) <= 3) {
                typeUsername(userfield, request.username)
            }
        })
    })
}

const fillBoth = function (request) {
    const passwordElements = findPasswordElements();

    if (!passwordElements.length) {
        logger.log('did not find password')
        return false
    }

    let form = passwordElements.closest('form')
    if (!form.length) {
        // no form present. estimate form root 4 levels above password field.
        form = passwordElements.parents().eq(4)
    }

    const usernameElements = findUsernameElements(form);

    if (passwordElements.length == 1) {
        fillSinglePasswordAndBestUsername(usernameElements, passwordElements, request);
    }

    if (passwordElements.length > 1) {
        fillAllPasswordsAndUsernames(usernameElements, passwordElements, request)
    }

    if (request.method) {
        if (form.length) {
            const button = form.find('input[type=submit],input[type=image],input[type=button],button')
                .not(':hidden')
                .filter(':inuserview')

            button.removeAttr('disabled')

            if (button.length === 1 && request.method === 'click') {
                button.click()
            }

            if (request.method === 'submit') {
                try {
                    form.submit()
                } catch { }
            }
        }
        else {
            logger.log('no form')
        }
    }

    return passwordElements.length
}

const fillOnlyUsername = function (request) {
    let form = jQuery('form')

    if (!form.length) {
        logger.log('could not find form')
        form = jQuery('body')
    }

    const username = findUsernameElements(form);

    if (username.length != 1) {
        logger.log('did not find exactly one user', username.length)
        return false
    }

    typeUsername(username[0], request.username)

    return true
}

chrome.runtime.onMessage.addListener(async function woizipassContent(request, _sender, sendResponse) {
    try {
        logger.level = request.logLevel || logger.DEBUG

        if (request.ping) {
            sendResponse({ status: "pong" })
            return { status: "pong" }
        }

        sendResponse({ status: "woizipass in progress" })

        if (window.top !== window.self) {
            if (!jQuery(document).find('body').filter(':inuserview').length) {
                chrome.runtime.sendMessage({ status: "finished", reason: "skipped frame", filled: 0, tabId: request.tabId, frameId: -1 })
                return true
            }
        }

        let result = fillBoth(request)
        if (!result) {
            // maybe the password field shows up after the username is filled
            result = fillOnlyUsername(request)
            if (result) {
                result = fillBoth(request)
            }
        }

        chrome.runtime.sendMessage({ status: "finished", reason: "end of script", filled: result, tabId: request.tabId, frameId: -1 })
        return true
    }
    catch (e) {
        logger.error(e);
        throw e;
    }
})
