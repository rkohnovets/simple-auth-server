const bcrypt = require('bcrypt')

const hashPassword = (password) => {
    return bcrypt.hashSync(password, 7)
}
const validatePassword = (password, passwordHash) => {
    return bcrypt.compareSync(password, passwordHash)
}

module.exports = {
    hashPassword,
    validatePassword
}