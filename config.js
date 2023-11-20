const fs = require('fs')
const path = require('path')

const development = true
const port = process.env.PORT || 5000

// generate new keys you can in: https://travistidwell.com/jsencrypt/demo/
const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key.pub'), 'utf8')
//console.log(privateKey + " " + publicKey)

const mongo_user = 'testuser'
const mongo_pass = 'testpassword'
const mongo_cluster_url = 'myfreecluster.ugjdqge.mongodb.net/'
const mongo_conn_str =
    `mongodb+srv://${mongo_user}:${mongo_pass}` +
    `@${mongo_cluster_url}?retryWrites=true&w=majority`;

module.exports = {
    port,
    mongo_conn_str,
    development,
    publicKey,
    privateKey
}