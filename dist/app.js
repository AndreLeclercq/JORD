let dbReady = new CustomEvent( 'dbReady', { bubbles: true } )
let pageReady = new CustomEvent( 'pageReady', { bubbles: true } )
let initWebsite = new CustomEvent( 'initWebsite', { bubbles: true } )
class Router {

    constructor( routes ) {

        this.routes = routes
        this.cache = {}

        window.addEventListener( 'hashchange', this.loadPage.bind( this ) )
        document.addEventListener( 'dbReady', this.loadPage.bind( this ) )
    }

    async loadPage( e ){

        let route = location.hash || '#'

        if( !this.routes.hasOwnProperty( route ) )
            route = '#404'

        history.pushState( '', '', route.replace( '#', '/' ) )

        if( !this.cache.hasOwnProperty( route ) ) {

            let res = await fetch( this.routes[route] )
            this.cache[route] = await res.text()

        }

        document.getElementById( 'content' ).innerHTML = this.cache[route]

        document.dispatchEvent( pageReady )

    }
}

let routes = {}

function createRoutesObject( rootFolder, routeList ){
    for ( let [ key, value ] of Object.entries( routeList ) ) {
        routeList[key] = rootFolder + value + '.html'
    }
    Object.assign( routes, routeList )
}

let pagesList = {
    '#': 'home',
    '#404': '404',
    '#about-me': 'about'
}

createRoutesObject( '../views/pages/', pagesList )

let pagesRoutes = new Router( routes );
(() => { fetch( '/api/productsList' )

    .then( res => { return res.json() } )

    .then( data => {

        localStorage.setItem( 'products', JSON.stringify( data ) )
        let productRoutes = {}

        data.forEach( e => {
            productRoutes['#' + e.slug] = 'product'
        })

        createRoutesObject( '../views/templates/', productRoutes )
        document.dispatchEvent( dbReady )
    })

})()

window.addEventListener( 'pageReady', e => buildProduct() )

function buildProduct(){

    let target = location.pathname.split( '/' ).pop()
    let productList = localStorage.getItem( 'products' )

    JSON.parse( productList ).forEach( elt => {

        if( elt.slug === target ){
            console.log( elt )
            document.querySelector( 'h1' ).innerHTML = elt.name
        }

    })

    document.dispatchEvent( initWebsite )
}

fetch( '../views/parts/navbar.html', { mode: 'no-cors' } )
    .then( response => response.text() )
    .then( data=> document.getElementById( 'navbar' ).innerHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/footer.html', { mode: 'no-cors' } )
    .then( response => response.text() )
    .then( data=> document.getElementById( 'footer' ).innerHTML = data )
    .catch( error => console.error( error ) )
let userLocal = localStorage.getItem('userLocal')

document.addEventListener( 'initWebsite', function() {

    if ( userLocal ) {

        console.log( userLocal )
        userIsLog()

    } else {
        const loginForm = document.getElementById( 'loginRegisterForm' )
        const switchForm = document.getElementById( 'switchForm' )
        const buttonSubmit = document.getElementById( 'buttonSend' )

        switchForm.addEventListener('click', (e) => {
            e.preventDefault()

            buttonSubmit.classList.contains('loginSubmit') ? switchToRegister() : switchToLogin()

            function switchToLogin(){
                switchForm.innerHTML = "Pas encore enregistré"
                loginForm.querySelector('legend').innerHTML = "S'identifier"
                loginForm.confirmPassword.hidden = true
                loginForm.email.hidden = true
                buttonSubmit.value = "Connexion"
                buttonSubmit.classList.toggle('loginSubmit')
            }

            function switchToRegister(){
                switchForm.innerHTML = "J'ai déjà un compte"
                loginForm.querySelector('legend').innerHTML = "S'enregistrer"
                loginForm.confirmPassword.hidden = false
                loginForm.email.hidden = false
                buttonSubmit.value = "Inscription"
                buttonSubmit.classList.toggle('loginSubmit')
            }
        })

        if ( loginForm ){

            loginForm.addEventListener( 'submit', async( e ) => {

                e.preventDefault()
                let param = '?'

                if( e.target.monprenom.value === '' & e.target.monadresse.value === 'ceci est mon adresse' ) {
                    let data = new FormData(e.target)

                    if (buttonSubmit.classList.contains('loginSubmit')) {
                        for ( var [key, value] of data.entries() ) {
                            param = param.concat( `${key}=${value}&` )
                        }

                        param = param.slice( 0, -1 )

                        fetch( `/api/login${param}` )
                            .then(res => {
                                return res.json()
                            })
                            .then(data => {
                                if ( data === 'user not found' ) {
                                    console.log( 'user not found' )
                                } else if ( data === 'incorrect password' ) {
                                    console.log( 'incorrect password' )
                                } else {
                                    localStorage.setItem( 'userLocal', data )
                                    userIsLog()
                                }
                            })
                    } else {

                        let dataSend = {}

                        for ( var [key, value] of data.entries() ) {
                            dataSend[key] = value
                            param = param.concat( `${key}=${value}&` )
                        }

                        if( dataSend.password === dataSend.confirmPassword ){
                            param = param.slice( 0, -1 )

                            fetch( `/api/register${param}` )
                                .then( res => {
                                    return res.json()
                                }).then( data => {
                                    console.log( JSON.stringify( data ) )
                            })
                        }
                    }
                }
            })
        }
    }
})

function userIsLog(){

    document.getElementById( 'loginRegister' ).hidden = true

}