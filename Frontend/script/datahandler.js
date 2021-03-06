'use strict';

const handleData = function(url, callbackFunctionName, callbackErrorFunctionName = null, method = 'GET', body = null, authToken = null) {
    fetch(url, {
            method: method,
            body: body,
            headers: {
                'content-type': 'application/json',
                Authorization: 'Bearer ' + authToken,
            },
        })
        .then(function(response) {
            if (!response.ok) {
                console.warn(`>> Probleem bij de fetch(). Statuscode: ${response.status}`);
                if (callbackErrorFunctionName) {
                    callbackErrorFunctionName(response);
                }
            } else {
                // console.info('>> Er is een response teruggekomen van de server');
                return response.json();
            }
        })
        .then(function(jsonObject) {
            if (jsonObject && callbackFunctionName) {
                // console.info('>> JSONobject is aangemaakt');
                // console.info(`>> Callbackfunctie ${callbackFunctionName.name}(response) wordt opgeroepen`);
                callbackFunctionName(jsonObject);
            }
        })
        .catch(function(error) {
            //console.warn(`>>fout bij verwerken json: ${error}`);
            if (callbackErrorFunctionName) {
                callbackErrorFunctionName(error);
            }
        });
};