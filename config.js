const fs = require('fs')
const path = require('path')

const development = true
const port = process.env.PORT || 5000

// you can generate new keys for JWT in two ways:
// 1) https://travistidwell.com/jsencrypt/demo/
// 2) using script 'generate-keys' from package.json:
//      2.0) install openssl (on windows it's not so easy)
//      2.1) delete directory 'keys'
//      2.2) run command 'npm run generate-keys' in terminal (no passphrase)
const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key'), 'utf8')
const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'rsa.key.pub'), 'utf8')
// to use https on localhost you can generate your own certificate:
// 1) install openssl
// 2) delete directory 'cert'
// 3) run command 'npm run generate-cert' in terminal
// (some passphrase like '1234' and empty other fields to just generate cert)
const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/cert.pem');

// вообще это нужно как-то из переменных окружения доставать
// или еще как-то, а не прост вписывать, но пока что так
// (да я, где-то на энглише комменты, где-то на русском)
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