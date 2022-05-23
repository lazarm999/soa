const express = require('express')
const expressOpenApi = require('express-openapi')
const axios = require('axios')
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

expressOpenApi.initialize({
    app,
    apiDoc: require('./api-doc'),
    paths: './paths/'
});

app.listen(8080, () => {
    console.log("Slusam na portu 8080")
})