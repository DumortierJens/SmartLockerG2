'use strict';

const showBestemmishowLockerngen = function(jsonObject) {
    console.log(jsonObject);
};

const init = function() {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers`, showLocker);
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');
    init();
});