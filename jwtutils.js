const jwt = require('jsonwebtoken')

const config = require('./config')

module.exports = {
    signToken: (payload) => {
        try {
            return jwt.sign(
                payload,
                config.privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: '24h'
                }
            );
        } catch (err) {
            /*
                TODO throw http 500 here
                ! Dont send JWT error messages to the client
                ! Let exception handler handles this error
            */
            throw err
        }
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(
                token,
                config.publicKey,
                {
                    algorithm: 'RS256'
                }
            );
        } catch (err) {
            /*
                TODO throw http 500 here
                ! Dont send JWT error messages to the client
                ! Let exception handler handles this error
            */
            throw err
        }
    }
}