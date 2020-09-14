import logSys from '../server/msgSystem.js'

/**
 * Manage Products
 * @class
 */
export default class Prod {

    /**
     * Calcul price (tax, margin, variable...) and return data object
     * @method
     * @param {object} [db] product collection
     * @returns {*}
     */
    calc(db) {
        try {
            db.forEach(prod => {
                this.totalVarPrice = 0
                this.prodPrice = parseFloat(prod.price)
                if (prod.priceRules)
                    prod.priceRules.forEach(rule => {
                        this.prodPrice = eval(rule.replace(new RegExp(/\$p/g), this.prodPrice))
                    })
                if (prod.variables) {
                    for (const [key, value] of Object.entries(prod.variables)) {
                        db.forEach(p => {
                            if (p.ref === key) {
                                this.calcVarPrice = parseFloat(p.price)
                                p.priceRules
                                    ? p.priceRules.forEach(rule => {
                                        this.calcVarPrice = eval(rule.replace(new RegExp(/\$p/g), this.calcVarPrice))
                                    })
                                    : this.calcVarPrice = p.price
                                this.totalVarPrice = this.totalVarPrice + (this.calcVarPrice * value)
                            }
                        })
                    }
                }
                prod.price = Number(Math.round((parseFloat(this.prodPrice) + this.totalVarPrice) + 'e2') + 'e-2').toFixed(2)
                delete prod._id
                delete prod.priceRules
            })
            return db
        } catch (e) {
            return e
        }
    }

}