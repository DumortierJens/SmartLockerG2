ListenToClickDoorgaanBtn = function() {
    document.querySelector('.js-doorgaan').addEventListener('click', function() {
        if (phonenumber(htmlInputPhoneNumber.value)) {
            console.log(true)
        }
    })
}

function phonenumber(inputtxt) {
    var phoneno = /^\+?([0-9]{2})\)?([0-9]{9})$/;
    if (inputtxt.match(phoneno)) {
        return true;
    } else {
        window.alert("Fout telefoonnummer")
        return false;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    htmlInputPhoneNumber = document.querySelector('.js-input-phonenumber')
    ListenToClickDoorgaanBtn()
});