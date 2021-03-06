
async function getUserProfilPage(content) {

    writeData()
    content.addEventListener('click', async e => {

        if (e.target.classList.contains('editProfil')) {

            let panel = e.target.closest('.panel')
            let inputs = panel.querySelectorAll('input')
            let labelsSpan = panel.querySelectorAll('.labelSpan')
            let button = panel.querySelector('.buttonSection')

            inputs.forEach(elt => {
                elt.hidden = false
            })
            labelsSpan.forEach(elt => {
                elt.hidden = true
            })
            button.hidden = false
        }

        if (e.target.closest('.saveProfil')) {

            let dataSend = {
                'email': userData.email,
                'firstname': document.getElementById('firstnameField').nextElementSibling.value,
                'lastname': document.getElementById('lastnameField').nextElementSibling.value,
                'phone': document.getElementById('phoneField').nextElementSibling.value,
                'address': document.getElementById('addressField').nextElementSibling.value,
                'postalCode': document.getElementById('postalcodeField').nextElementSibling.value,
                'town': document.getElementById('townField').nextElementSibling.value,
                'shipping_address': document.getElementById('addressShippingField').nextElementSibling.value,
                'shipping_postalCode': document.getElementById('postalcodeShippingField').nextElementSibling.value,
                'shipping_town': document.getElementById('townShippingField').nextElementSibling.value,
            }

            let fetchRes = await fetch(`/api?action=updateUser&token=${userData.token}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(dataSend),
            })
            let data = await fetchRes.json()
            if (data === false) {
                showPushNotification('error', "Session expirée")
            } else {
                dataSend.token = userData.token
                userData = dataSend
                localStorage.setItem('userLocal', JSON.stringify(dataSend))
                showPushNotification('success', "Informations sauvegardées")
                writeData()
                cancelEdit()
            }
        }

        if (e.target.classList.contains('editPassword')) {

            let newPass = document.getElementById('newPassword').value
            let confirmPass = document.getElementById('confirmPassword').value
            let oldPass = document.getElementById('oldPassword').value
            let email = document.getElementById('emailField').innerHTML
            let token = userData.token

            const regexPatPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+\-=]*.{8,25}$/
            const pwdCheck = regexPatPwd.test(newPass)

            pwdCheck ? editPassword() : showPushNotification('error', "Le mot de passe doit contenir 8 à 25 caractères et au moins 1 majuscule, 1 minuscule et 1 chiffre.")

            async function editPassword() {
                if (newPass === confirmPass) {

                    let fetchRes = await fetch(`/api?action=updatePwd&email=${email}&password=${encodeURIComponent(oldPass)}&newPassword=${encodeURIComponent(newPass)}&token=${token}`)
                    let data = await fetchRes.json()
                    if (data === 'user not found') {
                        showPushNotification('error', "Email incorrect")
                    } else if (data === 'incorrect password') {
                        showPushNotification('error', "Mauvais mot de passe")
                    } else if (data === 'edited document') {
                        showPushNotification('success', "Modification du mot de passe réussi")
                        document.getElementById('newPassword').value = ''
                        document.getElementById('confirmPassword').value = ''
                        document.getElementById('oldPassword').value = ''
                        cancelEdit()
                    }
                } else {
                    showPushNotification('error', "Le nouveau mot de passe n'est pas identique à la confirmation")
                }
            }


        }

        if (e.target.classList.contains('cancelSave'))
            cancelEdit()

    })

}

function cancelEdit() {
    let inputs = document.querySelectorAll('input')
    let labelsSpan = document.querySelectorAll('.labelSpan')
    let button = document.querySelectorAll('.buttonSection')
    inputs.forEach(elt => {
        elt.hidden = true
    })
    labelsSpan.forEach(elt => {
        elt.hidden = false
    })
    button.forEach(elt => {
        elt.hidden = true
    })
}

function writeData() {
    document.getElementById('emailField').innerHTML = userData.email
    document.getElementById('firstnameField').innerHTML = document.getElementById('firstnameField').nextElementSibling.value = userData.firstname === undefined ? '' : userData.firstname
    document.getElementById('lastnameField').innerHTML = document.getElementById('lastnameField').nextElementSibling.value = userData.lastname === undefined ? '' : userData.lastname
    document.getElementById('phoneField').innerHTML = document.getElementById('phoneField').nextElementSibling.value = userData.phone === undefined ? '' : userData.phone
    document.getElementById('addressField').innerHTML = document.getElementById('addressField').nextElementSibling.value = userData.address === undefined ? '' : userData.address
    document.getElementById('postalcodeField').innerHTML = document.getElementById('postalcodeField').nextElementSibling.value = userData.postalCode === undefined ? '' : userData.postalCode
    document.getElementById('townField').innerHTML = document.getElementById('townField').nextElementSibling.value = userData.town === undefined ? '' : userData.town
    document.getElementById('addressShippingField').innerHTML = document.getElementById('addressShippingField').nextElementSibling.value = userData.shipping_address === undefined ? '' : userData.shipping_address
    document.getElementById('postalcodeShippingField').innerHTML = document.getElementById('postalcodeShippingField').nextElementSibling.value = userData.shipping_postalCode === undefined ? '' : userData.shipping_postalCode
    document.getElementById('townShippingField').innerHTML = document.getElementById('townShippingField').nextElementSibling.value = userData.shipping_town === undefined ? '' : userData.shipping_town

}

function userIsLog() {

    localStorage.getItem('cartLocal') ? refreshCart() : getCart()
    document.getElementById('loginRegister').firstElementChild.innerHTML = userMenuHTML
    document.getElementById('logoutMenu').addEventListener('click', e => {
        e.preventDefault()
        localStorage.removeItem('userLocal')
        userData = ''
        userIsNotLog()
        showPushNotification('success', "Déconnection réussi !")
        document.dispatchEvent(dbReady)
    })

}

function userIsNotLog() {

    document.getElementById('loginRegister').firstElementChild.innerHTML = loginLogoutFormHTML
    localStorage.removeItem('cartLocal')
    refreshCart()


}

async function loginRegister(location) {

    let loginForms = document.querySelectorAll('.loginRegisterForm')

    loginForms.forEach(e => {
        let switchForm = e.querySelector('.switchForm')
        let buttonSubmit = e.querySelector('.buttonSend')
        let disclaimer = e.querySelector('.disclaimer')

        switchForm.addEventListener('click', elt => {

            elt.preventDefault()
            buttonSubmit.classList.contains('loginSubmit') ? switchToRegister() : switchToLogin()

            function switchToLogin() {
                switchForm.innerHTML = "Pas encore enregistré"
                e.querySelector('legend').innerHTML = "S'identifier"
                e.confirmPassword.hidden = disclaimer.hidden = true
                buttonSubmit.value = "Connexion"
                buttonSubmit.classList.toggle('loginSubmit')
            }

            function switchToRegister() {
                switchForm.innerHTML = "J'ai déjà un compte"
                e.querySelector('legend').innerHTML = "S'enregistrer"
                e.confirmPassword.hidden = disclaimer.hidden = false
                buttonSubmit.value = "Inscription"
                buttonSubmit.classList.toggle('loginSubmit')
            }
        })

        if (e) {
            e.addEventListener('submit', async (elt) => {
                elt.preventDefault()
                let param = ''

                if (elt.target.monprenom.value === '' & elt.target.monadresse.value === 'ceci est mon adresse') {
                    let dataForm = new FormData(elt.target)

                    if (buttonSubmit.classList.contains('loginSubmit')) {
                        for (let [key, value] of dataForm.entries()) {
                            param = param.concat(`${key}=${encodeURIComponent(value)}&`)
                        }

                        param = param.slice(0, -1)

                        let fetchResp = await fetch(`api?action=login&${param}`)
                        let data = await fetchResp.json()
                        if (data === 'document not found') {
                            showPushNotification('error', "Email incorrect")
                        } else if (data === 'password incorrect') {
                            showPushNotification('error', "Mauvais mot de passe")
                        } else if (typeof data === 'object') {
                            localStorage.setItem('userLocal', JSON.stringify(data))
                            showPushNotification('success', "Connexion réussi !")
                            location === 'modal' ? hideModal() : purchase('step2')
                            userIsLog()
                        }
                    } else {

                        let dataSend = {}

                        for (let [key, value] of dataForm.entries()) {
                            dataSend[key] = value
                            param = param.concat(`${key}=${encodeURIComponent(value)}&`)
                        }

                        const regexPatPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+\-=]*.{8,25}$/
                        const pwdCheck = regexPatPwd.test(dataSend.password)
                        pwdCheck ? null : showPushNotification('error', "Le mot de passe doit contenir 8 à 25 caractères et au moins 1 majuscule, 1 minuscule et 1 chiffre.")

                        if (pwdCheck && dataSend.password === dataSend.confirmPassword) {
                            param = param.slice(0, -1)
                            let fetchResp = await fetch(`api?action=register&${param}`)
                            let data = await fetchResp.json()
                            if (data === 'already existing document') {
                                showPushNotification('error', "Adresse email déjà utilisée")
                            } else if (data === 'create document') {
                                showPushNotification('success', "Compte créé, vous pouvez vous connecter")
                                hideModal()
                            }
                        }
                    }
                }
            })
        }
    })

}