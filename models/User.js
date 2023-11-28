const { Schema, model } = require('mongoose')

const User = new Schema({
    // неявно создастся поле _id
    username: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true},
    roles: [{type: Schema.Types.ObjectId, ref: 'Role' }],
    name: { type: String },
    about: { type: String },
    // TODO: ссылка на картинку аватарки, мб заюзать S3 или чето вручную сделать
    // image: { type: String }
})

const isUsernameValid = (username) => {
    const requirements =
        'Usernames can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Numbers (0-9)' +
        '\n' + 'Usernames should have length from 3 to 15'

    const res = /^[a-zA-Z0-9]{3,15}$/.exec(username);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const isPasswordValid = (password) => {
    const requirements =
        'Passwords can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + ' - Numbers (0-9)' +
        '\n' + 'Passwords should have length from 3 to 15'

    const res = /^[a-zA-Z0-9]{3,15}$/.exec(password);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const isNameValid = (name) => {
    const requirements =
        'Name can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + 'Name should have length 0 to 50'

    const res = /^[a-zA-Z]{0,50}$/.exec(name);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}
const isAboutValid = (about) => {
    const requirements =
        'About can only have:' +
        '\n' + ' - Lowercase Letters (a-z)' +
        '\n' + ' - Uppercase Letters (A-Z)' +
        '\n' + 'About should have length 0 to 500'

    const res = /^[a-zA-Z]{0,500}$/.exec(name);
    const valid = !!res;

    //return valid;
    if(!valid)
        throw `USERMESSAGE ${requirements}`
}

module.exports = {
    User: model('User', User),
    isUsernameValid,
    isPasswordValid,
    isNameValid,
    isAboutValid
}