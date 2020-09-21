import nodeMailer   from 'nodemailer'
import fs           from 'fs'
import logSys       from './msgSystem.js'
import { config }   from '../assets/config.js'

/**
 * Manage email sending
 * @class
 */
export default class Email {

    constructor() {
        this.transporter = nodeMailer.createTransport( {
            host: config.mail.host,
            port: config.mail.port,
            auth: {
                user: config.mail.user,
                pass: config.mail.pass
            }
        } )
    }

    /**
     * Sending email
     * @method
     * @param {object} [data] to create and send email
     * @returns {Promise<void>}
     */
    async send( data ){
        await logSys( 'EMAIL: Generate email' )
        this.msgTxt = data.msg
        this.msgHtml = data.msg
        fs.access(`./assets/views/email/${ data.model }.txt`, fs.F_OK, (err) => {
            if(!err)
                this.msgTxt = { path: `./assets/views/email/${ data.model }.txt` }
            this.msgHtml = { path: `./assets/views/email/${ data.model }.html` }
        })

        this.message = {
            from: config.mail.email_adress,
            to: data.email,
            subject: data.subject,
            text: ( this.msgTxt ),
            html: ( this.msgHtml )
        }

        this.resp = new Promise( async resolve => {
            await this.transporter.sendMail( this.message, function( err, res ) {
                if ( err ) {
                    logSys( err, 'error' )
                    resolve('error')
                } else {
                    logSys( 'EMAIL: Email SEND', 'success' )
                    logSys( `EMAIL: Response >> ${ res.response }`)
                    logSys( `EMAIL: MessageID >> ${ res.messageId }` )
                    resolve('send')
                }
            })
        })

        return await this.resp


    }
}