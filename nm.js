var netMeter = (function () {
    var _servers = [
        '127.0.0.1:5000' // Local Flask server
    ];

    var _uuidValidate = function (uuid) {
        var reg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return reg.exec(uuid) !== null;
    };

    var _setIcon = function () {
        try {
            chrome.storage.local.get({
                code: ''
            }, function (items) {
                var i = 'nm19x19d.png'; // Update this with some icon
                if (_uuidValidate(items.code)) {
                    i = 'nm19x19.png'; // Update this with some icon
                }
                chrome.action.setIcon({
                    path: {
                        19: i
                    }
                });
            });
        } catch (e) {
            console.log(e);
        }
        return true;
    };

    var _sendData = function (servers, version, items, request) {
        if (servers.length !== 0 && items.code.length !== 0) {
            var i = Math.floor(Math.random() * servers.length);
            var url = 'http://' + servers[i] + '/nmcollector'; // Using local Flask server
            servers.splice(i, 1);
            var data = JSON.stringify({
                v: version,
                id: 'CH',
                code: items.code,
                sessionId: items.sessionId,
                data: request
            });
            fetch(url, {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            }).then(response => {}).catch((error) => {
                console.log('Error sending data:', error);
            });
        } else {
            console.log('Unable to send data');
        }
    };

    function inject() {
        return {
            "referrer": document.referrer,
            "title": document.title
        };
    }

    var _webNavigation = function (details, source) {
        try {
            chrome.storage.local.get({
                uuid: '',
                code: 0,
                sessionId: 0
            }, function (items) {
                var servers = _servers.slice();
                var version = chrome.runtime.getManifest().version;
                var data = {
                    type: 1,
                    navType: source,
                    data: details
                };
                if (details.frameId === 0) {
                    chrome.scripting.executeScript({
                        target: {
                            tabId: details.tabId
                        },
                        func: inject,
                    }, (result) => {
                        if (!chrome.runtime.lastError && typeof result.length !== 'undefined') {
                            if (result.length === 1 && typeof result[0].result !== 'undefined') {
                                details.referrer = result[0].result.referrer;
                                details.title = result[0].result.title;
                            }
                            _sendData(servers, version, items, data);
                        } else {
                            _sendData(servers, version, items, data);
                        }
                    });
                } else {
                    _sendData(servers, version, items, data);
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    return {
        uuidValidate: _uuidValidate,
        setIcon: _setIcon,
        webNavigation: _webNavigation
    };
})();

chrome.runtime.onInstalled.addListener(function (details) {
    try {
        if (details.reason === 'install') {
            var installuuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => 
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
            chrome.storage.local.set({
                uuid: installuuid,
                code: '',
                sessionId: 1
            });
        }
        netMeter.setIcon();
    } catch (e) {
        console.log(e);
    }
});

chrome.runtime.onStartup.addListener(function () {
    try {
        chrome.storage.local.get({
            uuid: '',
            code: '',
            sessionId: 1
        }, function (items) {
            chrome.storage.local.set({
                sessionId: (items.sessionId + 1)
            });
            netMeter.setIcon();
        });
    } catch (e) {
        console.log(e);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.id === "validate") {
        sendResponse({
            status: netMeter.uuidValidate(request.value)
        });
    } else if (request.id === "icon") {
        sendResponse({
            status: netMeter.setIcon()
        });
    }
});

chrome.action.onClicked.addListener(function (tab) {
    chrome.runtime.openOptionsPage();
});

chrome.webNavigation.onCommitted.addListener(function (details) {
    netMeter.webNavigation(details, 1);
});

chrome.webNavigation.onReferenceFragmentUpdated.addListener(function (details) {
    netMeter.webNavigation(details, 2);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    netMeter.webNavigation(details, 3);
});
