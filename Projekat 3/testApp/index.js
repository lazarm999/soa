const express = require('express')
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let state = 'off'

app.put("/state", (req, res) => {
    state = req.body.state
    if(state === "on") console.log("Alarm turned on!")
    else if (state === "off") console.log("Alarm turned off...")
    else { res.sendStatus(400); return }
    res.sendStatus(201)
})

app.get("/state", (req, res) => {
    res.send(state)
})

port = 8088
app.listen(port, () => {
    console.log("Slusam na portu ", port)
})