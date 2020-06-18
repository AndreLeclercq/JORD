async function get(){
    let today = new Date()
    let addZero = e => e >= 10 ? e : `0${ e }`
    return `${ today.getFullYear() }-${ addZero(today.getMonth() + 1 ) }-${addZero( today.getDate() ) } ${ addZero( today.getHours() ) }:${ addZero( today.getMinutes() ) }:${ addZero( today.getSeconds() ) }`
}

module.exports = {
    get,
}