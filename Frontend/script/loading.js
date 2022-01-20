let htmlloading, htmllogin, htmlfbbtn;

function ShowLogin(){
    htmlloading.style = "display: none"
    htmllogin.style.opacity = "1"
    htmllogin.style.animation = "fadein 0.5s"
}

function ShowLoadingScreen(timeout,callbackfunction){
    htmllogin.style.opacity = "0"
    htmlloading.style.animation = "fadeout 0.8s"
    setTimeout(callbackfunction,timeout)
}

function init(){
    console.log('Dom geladen')
    htmlloading = document.querySelector('.loading_container')
    htmllogin = document.querySelector('.login_container')
    if(htmllogin){
        ShowLoadingScreen(800,ShowLogin);
    }
}

document.addEventListener('DOMContentLoaded',init)