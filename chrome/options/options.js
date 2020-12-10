$(function () {

    const url = $('#url')[0]

    chrome.storage.local.get(
        {
            url: ''
        }, function (items) {
            url.value = items.url
        })

    $('#button-group').on('click', 'button', (e) => {
        const action = $(e.target).data('action')

        if (action == 'close') {
            close()
        }

        if (action == 'save') {
            if ($('#options')[0].checkValidity() == false) {
                $('#save').click()
            }
            $(this).blur();
            e.preventDefault()
            chrome.storage.local.set({
                url: url.value,
            })
        }
    })


    function close() {
        chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove(tab.id)
        })
    }

})