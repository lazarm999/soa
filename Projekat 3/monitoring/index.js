const mqtt = require('mqtt') 
const mqttClient = mqtt.connect("mqtt://mqtt-edgex:1883/")
const axios = require('axios')

let dataTopic = 'environment-data', n = 10, th = 0.1, sum = 0
let smokeMes = [] // smoke measurements

mqttClient.on('connect', () => { 
  mqttClient.subscribe(dataTopic, (err, granted) => { 
    if(err) console.log('Error while subscribing to ', dataTopic, 'err')
    else console.log('Mqtt client subscribed ', dataTopic ,'topic')
  })
})

mqttClient.on("error", function(err) { 
    console.log("Error: " + err) 
    if(err.code == "ENOTFOUND") { 
        console.log("Network error, make sure you have an active internet connection") 
    } 
}) 

mqttClient.on("close", function() { 
    console.log("Connection closed by client") 
}) 

mqttClient.on("reconnect", function() { 
    console.log("Client trying a reconnection") 
}) 

mqttClient.on("offline", function() { 
    console.log("Client is currently offline") 
})

mqttClient.on('message', async (topic, binMessage, packet) => { //binMessage = binaryMessage 
  if(topic === dataTopic) {
    reading = JSON.parse(binMessage.toString()).readings[0]
    if(reading.name === "smoke") {
      smoke = base64ToFloat(reading.value)
      smokeMes.push(smoke)
      sum += smoke
      if(smokeMes.length > n){
        sum -= smokeMes.shift()
        console.log(sum / smokeMes.length)
        if(sum / smokeMes.length > th){
          axios.put('http://edgex-core-command:48082/api/v1/device/e25eb231-7866-4eae-a058-118c403e0fac/command/6324b2ff-1ce3-4565-bd65-9b8b4606c164', 
              { "state": "on" }).then((data) => {
                console.log(data.status)
            }).catch(error => {
              console.log(error)
            })
        }
      }
    }
  } 
})

function base64ToFloat(str){
    return Buffer.from(str, 'base64').readDoubleBE(0)
}