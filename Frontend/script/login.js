// Facebook login
window.fbAsyncInit = function() {
    FB.init({
        appId: '4670544903052300',
        cookie: true,
        xfbml: true,
        version: 'v12.0'
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

const statusChangeCallback = function(response) {
    if (response.status === 'connected') {
        if (document.querySelector('.js-login-page')) loginFacebookUser(response.authResponse.accessToken);
    }
};

const checkLoginState = function() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

const callbackLoginFacebookSucceed = function(response) {
    console.log("Login succeed");
    sessionStorage.setItem("usertoken", response.token);

    FB.logout();
    console.log('User signed out of facebook.');
    goToCorrectPage();
};

const loginFacebookUser = function(accessToken) {
    console.log(accessToken);
    const body = JSON.stringify({
        socialType: "facebook",
        accessToken: accessToken
    });
    handleData(`${APIURI}/users/login`, callbackLoginFacebookSucceed, callbackLoginFailed, 'POST', body);
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Google login
const callbackLoginGoogleSucceed = function(response) {
    console.log("Login succeed");
    sessionStorage.setItem("usertoken", response.token);

    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out of google.');
        goToCorrectPage();
    });
};

const loginGoogleUser = function(accessToken) {
    console.log(accessToken);
    const body = JSON.stringify({
        socialType: 'google',
        accessToken: accessToken
    });
    handleData(`${APIURI}/users/login`, callbackLoginGoogleSucceed, callbackLoginFailed, 'POST', body);
};

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    loginGoogleUser(id_token);
}

const callbackLoginFailed = function(response) {
    console.log(response);
};

const goToCorrectPage = function() {
    const userToken = sessionStorage.getItem("usertoken");
    const lockerId = urlParams.get('lockerId');
    sessionStorage.setItem("lockerid", lockerId);
    if (userToken) {
        const payload = parseJwt(userToken);
        if (payload.isBlocked) window.location.href = `${location.origin}/geblokkeerd${WEBEXTENTION}`;
        else if (payload.role == "User" && payload.tel == null) window.location.href = `${location.origin}/gsm-nummer${WEBEXTENTION}`;
        else if (payload.role == "User" && lockerId == null) window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
        else if (payload.role == "User" && lockerId != null) window.location.href = `${location.origin}/locker${WEBEXTENTION}?lockerId=${lockerId}`;
        else if (payload.role == "Admin") window.location.href = `${location.origin}/adminmenu${WEBEXTENTION}`;
    }
};

document.addEventListener('DOMContentLoaded', goToCorrectPage);