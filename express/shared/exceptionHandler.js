const exceptionHandler = (e, request, response) => {
    const exceptionString = `${e}`
    // решение не лучшее, но если проблемы с валидацией,
    // и нужно отправить пользователю сообщение, то строка начинается с 'USERMESSAGE'
    // (а фронт может обработать уже - вывести пользователю без этого префикса)
    const messageToUser = exceptionString.startsWith('USERMESSAGE')

    if(!messageToUser) {
        const devMessage = `Ошибка на сервере по пути ${request.path}: ${exceptionString}`
        console.log(devMessage)
    }

    const returnedMessage = messageToUser
        ? exceptionString
        : '400: Ошибка на стороне сервера'

    response.status(400).json(returnedMessage)
}

module.exports = { exceptionHandler }