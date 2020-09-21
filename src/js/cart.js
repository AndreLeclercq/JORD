function refreshCart() {
    cartLocal = localStorage.getItem('cartLocal') ? localStorage.getItem('cartLocal') : 'null'

    const buttonCart = document.getElementById('buttonCart')
    const carts = document.querySelectorAll('.cart')

    carts.forEach(e => {
        const tbody = e.getElementsByTagName('tbody')[0]
        tbody.innerHTML = ''
        let totalPrice = 0
        buttonCart.classList.add('tooltip')
        buttonCart.classList.remove('buttonModal')
        buttonCart.removeAttribute('data-modaltarget')

        if (JSON.parse(cartLocal) !== null) {

            buttonCart.classList.remove('tooltip')
            buttonCart.classList.add('buttonModal')
            buttonCart.dataset.modaltarget = 'cart'
            JSON.parse(cartLocal).forEach(e => {

                tbody.innerHTML += cartRowHTML

                let optsName = ''
                if (e.optName !== undefined){
                    optsName = ` Options : ${e.optName}`
                    optsName = optsName.replace(/,/g, ', ')
                }

                let imgProd = ''
                productsData.forEach(prod => {
                    e.ref === prod.ref ? imgProd = prod.images[0] : null
                })

                tbody.lastElementChild.querySelector('.refLabel > .value').innerHTML = e.ref
                tbody.lastElementChild.querySelector('.imgLabel > img').src = imgProd
                tbody.lastElementChild.querySelector('.productLabel > .value').innerHTML = `${e.name} <br><small>${optsName}</small>`
                tbody.lastElementChild.querySelector('.priceLabel > .value').innerHTML = Number(Math.round(e.price + 'e2') + 'e-2').toFixed(2)
                tbody.lastElementChild.querySelector('.qtyLabel > .value').innerHTML = e.qty
                tbody.lastElementChild.querySelector('.totalLabel > .value').innerHTML = Number(Math.round((e.price * e.qty) + 'e2') + 'e-2').toFixed(2)

                if (e.options.length > 0) {

                    let optionDiv = document.createElement('div')
                    optionDiv.innerHTML = e.options
                    optionDiv.classList.add('optionsList')
                    tbody.lastElementChild.querySelector('.refLabel > .value').after(optionDiv)

                }

                totalPrice += e.price * e.qty

            })

            document.querySelector('.cartPrice').innerHTML = Number(Math.round(totalPrice + 'e2') + 'e-2').toFixed(2)

            document.getElementById('buttonCart').querySelector('svg').setAttribute('data-modaltarget', 'cart')

        } else {

            document.getElementById('buttonCart').querySelector('svg').removeAttribute('data-modaltarget')

        }
    });

    userData !== null ? saveCart() : null
    refreshCounter()

}

async function addCartFromProductPage(e) {

    let productElem = e.closest('[data-template]')
    let productAdd = {}
    let data = []
    let optionsList = []
    let optionsName = []
    let validity = true

    productAdd = {
        "ref": productElem.querySelector('[data-prodRef]').innerHTML,
        "name": productElem.querySelector('[data-prodName]').innerHTML,
        "price": parseFloat(productElem.querySelector('[data-prodPrice]').innerHTML) / parseFloat(productElem.querySelector('[data-prodqty]').value),
        "qty": parseFloat(productElem.querySelector('[data-prodqty]').value)
    }

    let prodVar = new Promise(resolve => {
        productsData.forEach(prod => {
            prod.ref === productElem.querySelector('[data-prodRef]').innerHTML ? resolve(prod.variables) : null
        })
    })

    if(await prodVar !== null)
        Object.getOwnPropertyNames(await prodVar).length > 0 ? productAdd.var = await prodVar : null

    if (productElem.querySelector('[data-prodoptions]')) {
        productElem.querySelectorAll('[data-optProduct]').forEach(opt => {
            if( opt.required === true && opt.validity.valid !== true ){
                validity = false
            } else {
                if ((opt.selected === true || opt.checked === true) && opt.value !== '' ){
                    console.log(opt.closest('.optGrp').firstElementChild.innerHTML)
                    optionsList.push(`${opt.id}: ${opt.value}`)
                    optionsName.push(`${opt.closest('.optGrp').firstElementChild.innerHTML}: ${opt.dataset.name}`)
                } else if( opt.type === 'number' && opt.value !== '' && opt.value != 0 ){
                    optionsList.push(`${opt.id}: ${opt.value}`)
                    optionsName.push(`${opt.placeholder}: ${opt.value}`)
                }
            }
        })
        productAdd.options = optionsList
        productAdd.optName = optionsName
    }

    if ( validity === true ){
        if (!cartLocal || JSON.parse(cartLocal) === null || cartLocal.length <= 2) {

            await data.push(productAdd)
            localStorage.setItem('cartLocal', JSON.stringify(data))
            refreshCart()

        } else {
            data = JSON.parse(cartLocal)
            let newItem = true
            data.forEach(e => {
                (productAdd.ref === e.ref && String(productAdd.options) === String(e.options)) ? (e.qty += productAdd.qty, newItem = false) : null;
            })
            newItem ? (data.push(productAdd), localStorage.setItem('cartLocal', JSON.stringify(data))) : localStorage.setItem('cartLocal', JSON.stringify(data))
            refreshCart()

        }
        showPushNotification('success', 'Nouveau produit ajouté à votre panier')
    } else {
        showPushNotification('error', 'Veuillez remplir tous les champs correctement.')
    }

}

async function addCart(ref, qty, opt='') {
    let productAdd = {}
    let data = []

    let prod = new Promise(resolve => {
        productsData.forEach(prod => {
            prod.ref === ref ? resolve(prod) : null
        })
    })

    let product = await prod

    productAdd = {
        "ref": ref,
        "qty": qty,
        "name": product.name,
        "price": product.price,
        "options": opt
    }

    if (!cartLocal) {

        await data.push(productAdd)
        localStorage.setItem('cartLocal', JSON.stringify(data))
        refreshCart()

    } else {

        data = JSON.parse(localStorage.getItem('cartLocal'))
        let newItem = true

        data.forEach(e => {
            (productAdd.ref === e.ref && String(productAdd.options) === String(e.options)) ? (e.qty += productAdd.qty, newItem = false) : null;
        })
        newItem ? (data.push(productAdd), localStorage.setItem('cartLocal', JSON.stringify(data))) : localStorage.setItem('cartLocal', JSON.stringify(data))
        refreshCart()

    }

}

function removeCart(ref, opt) {

    let newData = [ ]
    JSON.parse( cartLocal ).forEach( e => {
        let optList = ''
        e.options.forEach(op => optList += `${op},`),
            (e.ref === ref && optList.slice(0, -1) === opt) ? null : newData.push(e)
    })
    newData.length <= 0 ? ( localStorage.removeItem( 'cartLocal' ), refreshCart( ), hideModal( ) ) : ( localStorage.setItem( 'cartLocal', JSON.stringify( newData ) ), refreshCart( ) )

}

function refreshCounter() {

    let cartCount = document.getElementById('buttonCart')
    let modalCart = document.getElementById('cartModal')

    cartCount ? cartCount.dataset['badge'] = modalCart.querySelectorAll('.productLabel').length : null

}

function plusMinusProduct(e, type) {

    let refLabel = e.parentElement.querySelector('.refLabel' ).firstElementChild.innerHTML
    let refOptions = e.parentElement.querySelector('.optionsList' ) ? e.parentElement.querySelector('.optionsList' ).innerHTML : ''
    let value = type === 'plus' ? parseInt( e.querySelector('.value' ).innerHTML ) + 1 : parseInt( e.querySelector('.value' ).innerHTML ) - 1

    value === 0 ? value = 1 : null

    e.querySelector('.value' ).innerHTML = value

    cartLocal = JSON.parse( localStorage.getItem( 'cartLocal' ) )
    cartLocal.forEach( e => {
        let optList = ''
        e.options.forEach(op => optList += `${op},`)
        e.ref === refLabel && optList.slice(0, -1) === refOptions ? e.qty = value : null
    })

    localStorage.setItem( 'cartLocal', JSON.stringify( cartLocal ) )
    refreshCart( )

}

async function saveCart() {
    let cartLocal = localStorage.getItem('cartLocal') ? localStorage.getItem('cartLocal') : 'null'
    if( userData !== null){
        await fetch(`/api?action=cart&token=${userData.token}&email=${userData.email}&state=saveCart`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: cartLocal,
        })
    }

}

function getCart() {

    let cartLocal = localStorage.getItem('cartLocal') ? localStorage.getItem('cartLocal') : '{}'
    let userLocal = JSON.parse(localStorage.getItem('userLocal'))

    fetch(`/api?action=cart&token=${userLocal.token}&email=${userLocal.email}&state=getCart`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: cartLocal,
    })
        .then(res => {
            return res.json()
        }).then(data => {
        if (data === false) {
            showPushNotification('error', "Session expirée")
        } else if (data !== 'null') {
            localStorage.setItem('cartLocal', JSON.stringify(data))
        } else if (data === null ){
            localStorage.removeItem('cartLocal')
        }
    }).then(() => refreshCart())

}