let fbbtn;

function ListenToLogin(){
    fbbtn.addEventListener('click',function(){
        window.location.replace(`http://${window.location.hostname}:5500/overzichtpagina.html`);
    })
}

function init(){
    console.log('Dom geladen')
    fbbtn = document.querySelector('.js-loginbtn')
    ListenToLogin();
}

document.addEventListener('DOMContentLoaded',init)