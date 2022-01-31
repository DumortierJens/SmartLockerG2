let htmlInputPhoneNumber;

ListenToClickDoorgaanBtn = function() {
    document.querySelector('.js-doorgaan').addEventListener('click', function() {
        if (phonenumber(htmlInputPhoneNumber.value)) {
            console.log(true)
            body = { tel: htmlInputPhoneNumber.value }
            handleData(`${APIURI}/users/me/phonenumber`, CallBackPhoneNumber, null, 'PUT', JSON.stringify(body), userToken);
        }
    })
}

CallBackPhoneNumber = function() {
    const lockerId = sessionStorage.getItem("lockerid");
    if (payload.role == "User" && lockerId == null) window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
    else if (payload.role == "User" && lockerId != null) window.location.href = `${location.origin}/locker${WEBEXTENTION}?lockerId=${lockerId}`;
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