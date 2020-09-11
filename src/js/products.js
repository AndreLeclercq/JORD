function buildProductPage() {

    let optionsList = {}
    let target = location.pathname.split('/').pop()

    productsData.forEach(elt => {

        if (elt.slug === target) {
            document.querySelector('[data-prodName]').innerHTML = elt.name
            document.querySelector('[data-prodRef]').innerHTML = elt.ref
            document.querySelector('[data-prodPrice]').innerHTML = elt.price

            let prodImg
            elt.images[0] ? prodImg = elt.images[0] : prodImg = 'assets/images/aucune-image.png'
            document.querySelector('[data-prodImg]').src = prodImg

            let tableTech = document.querySelector('[data-prodTech]').querySelector('tbody')
            elt.tech !== undefined ? tableTech.innerHTML = tableTech.innerHTML.concat(`<tr><td>${elt.tech}</td></tr>`) : null

            if (elt.variables) {
                for (const [key] of Object.entries(elt.variables)) {
                    productsData.forEach(prod => {
                        if (prod.ref === key) {
                            let rowHTML = `<tr><td>${prod.name} | ${prod.tech}</td></tr>`
                            tableTech.innerHTML = tableTech.innerHTML.concat(rowHTML)
                        }
                    })
                }
            }
            tableTech.childElementCount === 0 ? document.querySelector('[data-prodTech]').hidden = true : document.querySelector('[data-prodTech]').hidden = false

            let prodDesc = document.querySelector('[data-prodDesc]')
            elt.desc
                ? (prodDesc.querySelector('.desc').innerHTML = elt.desc, prodDesc.hidden = false)
                : prodDesc.hidden = true

            if (elt.options) {
                Object.values(elt.options).forEach(grp => {
                    const groupValues = grp.values
                    let divElem = document.createElement('div')
                    divElem.innerHTML = productsOptionsHTML
                    divElem.innerHTML = divElem.querySelector(`#${grp.type}`).innerHTML
                    divElem.querySelector(`.${grp.type}Group`).id = grp.ref
                    let optGrpHtml = divElem.querySelector(`.${grp.type}Group`).innerHTML

                    if (grp.type === 'checkbox') {
                        divElem.querySelector('.checkboxGroup').innerHTML = ''
                        groupValues.forEach(e => {
                            let optPrice = e.price
                            productsData.forEach(prod => {
                                prod.ref === e.ref ? optPrice = prod.price : null
                            })
                            optionsList[e.ref] = optPrice
                            let checkboxElem = document.createElement('div')
                            checkboxElem.innerHTML = optGrpHtml
                            let input = checkboxElem.querySelector('input')
                            let label = checkboxElem.querySelector('label')
                            input.id = input.value = e.ref
                            input.dataset.name = e.name
                            label.setAttribute('for', e.ref)
                            label.innerHTML = e.name

                            divElem.querySelector('.checkboxGroup').innerHTML = divElem.querySelector('.checkboxGroup').innerHTML.concat(checkboxElem.innerHTML)

                        })
                    } else if (grp.type === 'select') {
                        groupValues.forEach(e => {
                            optionsList[e.ref] = e.price
                            let optSelect = document.createElement('div')
                            optSelect.innerHTML = optGrpHtml
                            optSelect.querySelector('option').id = optSelect.querySelector('option').value = e.ref
                            optSelect.querySelector('option').dataset.name = e.name
                            optSelect.querySelector('option').innerHTML = e.name
                            divElem.querySelector('.selectGroup').innerHTML = divElem.querySelector('.selectGroup').innerHTML.concat(optSelect.innerHTML)
                        })

                    } else if (grp.type === 'radio') {
                        divElem.querySelector('.radioGroup').innerHTML = ''
                        groupValues.forEach(e => {
                            optionsList[e.ref] = e.price
                            let optRadio = document.createElement('div')
                            optRadio.innerHTML = optGrpHtml
                            let label = optRadio.querySelector('label')
                            let input = label.querySelector('input')
                            input.value = e.ref
                            input.name = grp.ref
                            input.dataset.name = e.name
                            label.querySelector('.label-name').innerHTML = e.name
                            divElem.querySelector('.radioGroup').innerHTML = divElem.querySelector('.radioGroup').innerHTML.concat(optRadio.innerHTML)
                        })
                        divElem.querySelector('input').defaultChecked = true
                    }
                    divElem.querySelector('.title').innerHTML = grp.name
                    document.querySelector('[data-prodOptions]').innerHTML = document.querySelector('[data-prodOptions]').innerHTML.concat(divElem.innerHTML)

                })
            } else
                document.querySelector('[data-prodOptions]').remove()

            calcProductPrice(elt.price, optionsList)
            document.querySelector('[data-template="product"]').addEventListener('input', () => calcProductPrice(elt.price, optionsList))
        }

    })

}

function calcProductPrice(price, options) {
    let totalPrice = parseFloat(price)
    document.querySelectorAll('[data-optProduct]').forEach(opt => {
        if ((opt.selected === true || opt.checked === true) && opt.value !== '')
            totalPrice += parseFloat(options[opt.value])
    })
    document.querySelector('[data-prodPrice]').innerHTML = Number(Math.round((totalPrice * document.querySelector('[data-prodQty]').value) + 'e2') + 'e-2').toFixed(2)
}

function getProductsByCat() {
    let cats = document.querySelectorAll('[data-cat]')

    cats.forEach(catNode => {

        let counter = 1
        let count = parseInt(catNode.dataset.count)
        let cat = catNode.dataset.cat

        productsData.forEach(prod => {

            let thisProd

            cat !== 'all' && prod.category === cat && parseFloat(prod.access) === 0 ? thisProd = prod : cat === 'all' ? thisProd = prod : null

            if (thisProd && (counter <= count || count === -1)) {
                counter++
                let prodImg
                let prodCardHTML = document.createElement('span')
                prodCardHTML.innerHTML = productCardHTML
                prodCardHTML.querySelector('[data-productCard]').href = `#${thisProd.slug}`
                prodCardHTML.querySelector('[data-productCard]').dataset.filters = `[${JSON.stringify(thisProd.filters)}]`
                prodCardHTML.querySelector('[data-productName]').innerHTML = thisProd.name
                thisProd.images[0] ? prodImg = thisProd.images[0] : prodImg = 'assets/images/aucune-image.png'
                prodCardHTML.querySelector('[data-productImg]').src = prodImg
                prodCardHTML.querySelector('[data-productPrice]').innerHTML = `${thisProd.price}€ TTC`
                catNode.insertAdjacentHTML('beforeend', prodCardHTML.innerHTML)
            }
        })
    })

}

function enableFilters() {
    if (document.querySelector('[data-filtersList]')) {
        document.querySelector('[data-filtersList]').addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-filter')) {
                let products = document.querySelectorAll('[data-filters]')
                products.forEach(prod => prod.hidden = false)
                document.querySelectorAll('[data-filter]').forEach(filter => {
                    if (filter.checked === false) {
                        let filterGroup = filter.closest('[data-filter-group]').attributes['data-filter-group'].nodeValue
                        let filterValue = filter.attributes['data-filter'].nodeValue
                        products.forEach(prod => {
                            let filtersList = JSON.parse(prod.attributes['data-filters'].nodeValue)
                            if (filtersList[0][`${filterGroup}`] === filterValue)
                                prod.hidden = true
                        })
                    }
                })
            }
        })
    }
}