const bcrypt = require('bcrypt')

const hashPassword = (password) =>
    bcrypt.hashSync(password, 7)
const checkPassword = (password, passwordHash) =>
    bcrypt.compareSync(password, passwordHash)

module.exports = {
    hashPassword,
    checkPassword
}