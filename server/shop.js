import logSys from './msgSystem.js'
import Database from './database.js'
import dateTime from "./dateTime.js"

let db = new Database()

/**
 * Manage Shop features
 * @class
 */
export default class Shop {

    /**
     * Manage cart
     * @method
     * @param [state] {string} saveCart or getCart
     * @param [primaryKey] {object} key: value
     * @param [data] {object} object with cart
     * @returns {Promise<*>}
     */
    async cart(state, primaryKey, data) {
        try {
            let cart = JSON.stringify(data) === 'null' ? 'null' : JSON.stringify(data)
            let resp = state === 'saveCart'
                ? await db.editDocument('users', primaryKey, `{"cart":${cart}}`)
                : state === 'getCart'
                    ? await db.getDocument('users', primaryKey)
                    : null
            return typeof resp === 'object' ? resp.cart : resp
        } catch (error) {
            let err = new Error()
            await logSys((`${err.stack}\n${error}`), 'error')
        }
    }

    /**
     * Manage Order
     * @method
     * @param [primaryKey] {object} key: value
     * @returns {Promise<string>}
     */
    async order(primaryKey) {
        try {
            let userInfo = await db.getDocument('users', primaryKey)
            let infos = {}
            for (let [k, v] of Object.entries(userInfo))
                k !== 'password' && k !== 'cart' ? infos[k] = v : null

            let order = {
                'status': 'paid',
                'cart': userInfo.cart,
                'infos': infos,
                'dateCreate': await dateTime()
            }
            return await db.createDocument('orders', {_id: '000'}, order)
        } catch (error) {
            let err = new Error()
            await logSys((`${err.stack}\n${error}`), 'error')
        }
    }
}