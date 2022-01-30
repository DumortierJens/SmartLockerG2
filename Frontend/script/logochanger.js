let images = ['/img/logo/Sportinnovatiecampus_Logo-_003_.png',
    '/img/logo/logo-sport-en-bewegen.png',
    '/img/logo/Opleidingslogo_Howest_Multimedia_en_Communicatietechnologie_liggend_ZWART.png'
];

let index = 0;
let imgElement;

function change() {
    console.log(imgElement)
    imgElement.src = images[index];
    index > 1 ? index = 0 : index++;
}

document.addEventListener('DOMContentLoaded', function() {
    imgElement = document.querySelector('.js-logo');
    setInterval(change, 5000);
});