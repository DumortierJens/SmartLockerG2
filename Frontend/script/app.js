'use strict';

const showBestemmishowLockerngen = function(jsonObject) {
    console.log(jsonObject);
};

const init = function() {
    handleData(`http://127.0.0.1:5000/api/v1/bestemmingen`, showLocker);
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');
    init();
});