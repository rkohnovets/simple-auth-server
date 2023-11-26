const fs = require('fs')
const path = require('path')

const development = true
const port = process.env.PORT || 5000

// generate new keys you can in: https://travistidwell.com/jsencrypt/demo/
const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key.pub'), 'utf8')

const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/cert.pem');

// вообще это нужно как-то из переменных окружения доставать
// или еще как-то, а не прост вписывать, но пока что так
const mongo_user = 'user'
const mongo_pass = '123pass789'
const mongo_cluster_url = 'myfreecluster.ugjdqge.mongodb.net/'
const mongo_conn_str =
    `mongodb+srv://${mongo_user}:${mongo_pass}` +
    `@${mongo_cluster_url}?retryWrites=true&w=majority`;

module.exports = {
    port,
    mongo_conn_str,
    development,
    publicKey,
    privateKey,
    key,
    cert
}