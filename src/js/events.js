window.addEventListener('pageChange', () => {

    // Product Page
    document.querySelector('[data-template="product"]') ? buildProductPage() : null

    // Products Category
    document.querySelector('[data-cat]') ? getProductsByCat() : null

    // Enable Filters
    document.querySelector('[data-filtersList]') ? enableFilters() : null

    // Add Cart event
    document.getElementById('addCart')
        ? document.getElementById('addCart').addEventListener('click', e => (addCartFromProductPage(e.target)))
        : null

    document.querySelectorAll('.accountUserPage').forEach(elt => {
        elt.innerHTML = userProfilHTML
        getUserProfilPage(document.getElementById('accountUserPage'))
    })

})

document.addEventListener('click', e => {

    if (e.target.closest('.removeCart')) {
        let ref = e.target.closest('.removeCart').parentElement.parentElement.parentElement.querySelector('.refLabel > .value').innerHTML
        let opt = e.target.closest('.removeCart').parentElement.parentElement.parentElement.querySelector('.refLabel > .optionsList') ? e.target.closest('.removeCart').parentElement.parentElement.parentElement.querySelector('.refLabel > .optionsList').innerHTML : ''
        removeCart(ref, opt)
    }

    e.target.closest('.plusProduct') ? plusMinusProduct(e.target.closest('.plusProduct').closest('.qtyLabel'), 'plus') : null
    e.target.closest('.minusProduct') ? plusMinusProduct(e.target.closest('.minusProduct').closest('.qtyLabel'), 'minus') : null

})