let userToken;

window.fbAsyncInit = function () {
    FB.init({
        appId: '4670544903052300',
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
        if (document.querySelector('.js-login-page')) loginUser(response.authResponse.accessToken);
    } else {
        console.log('Not authenticated with Facebook');
    }
};

const checkLoginState = function () {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

const logout = function () {
    sessionStorage.removeItem("usertoken");

    FB.logout(function (response) {
        console.log('Logged out');
        statusChangeCallback(response);
    });
};

const callbackLoginSucceed = function (response) {
    console.log("Login succeed");
    sessionStorage.setItem("usertoken", response.token);
    window.location.replace(`${location.origin}/overzicht${WEBEXTENTION}`);
};

const callbackLoginFailed = function (response) {
    console.log(response);
};

const loginUser = function (accessToken) {
    console.log(accessToken);
    const body = JSON.stringify({
        accessToken: accessToken
    });
    handleData(`${APIURI}/users/login`, callbackLoginSucceed, callbackLoginFailed, 'POST', body);
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

document.addEventListener('DOMContentLoaded', function () {

    // user authentication
    userToken = sessionStorage.getItem("usertoken");
    if (userToken == null)
        // window.location.href = location.origin;
        userToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjMxNDQ2NDQxNTU3OTUzMjIiLCJuYW1lIjoiSmVucyBEdW1vcnRpZXIiLCJyb2xlIjoiQWRtaW4ifQ.6KsO3PS69GlRQRof23MuPKm69U6CEAdN03vbeTU8ZTQ";

});