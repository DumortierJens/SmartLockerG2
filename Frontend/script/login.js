window.fbAsyncInit = function () {
    FB.init({
        appId: '614695093159122',
        cookie: true,
        xfbml: true,
        version: 'v12.0'
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

const statusChangeCallback = function (response) {
    if (response.status === 'connected') {
        console.log('Logged in with Facebook and authenticated');
        if (document.querySelector('.js-login-page')) window.location.replace(`https://${window.location.hostname}/overzicht.html`);
        getUserDetails();

    } else {
        console.log('Not authenticated with Facebook');
        if (document.querySelector('.js-login-page') === null) window.location.replace(`https://${window.location.hostname}/`);
    }
};

const checkLoginState = function () {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

const logout = function () {
    FB.logout(function (response) {
        console.log('Logged out');
        statusChangeCallback(response);
    });
};

const getUserDetails = function () {
    FB.api('/me?fields=name,email,birthday,location,picture', function (response) {
        if (response && !response.error) {
            console.log(response);
        }
    });
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));