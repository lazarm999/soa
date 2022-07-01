const mqtt = require('mqtt') 
const mqttClient = mqtt.connect("mqtt://mqtt-edgex:1883/") 
const {InfluxDB} = require('@influxdata/influxdb-client')
const {Point} = require('@influxdata/influxdb-client')

// Influxdb setup
const token = 'iywxqGm1kE1DW-tJdkUwSdZ7lznjIurOdDKoMtl57OsBcYMGpphh6UtIhfO8taAPOidLt_lPtoy0st0H2Fc9xg=='
const org = 'soa'
const bucket = 'soa'
const influxClient = new InfluxDB({url: 'http://influx:8086', token: token})
writeApi = influxClient.getWriteApi(org, bucket)
writeApi.useDefaultTags({tag: 'defualt'})

let dataTopic = 'environment-data'

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
    console.log("on message ", dataTopic)
    reading = JSON.parse(binMessage.toString()).readings[0]
    const point = new Point('env').floatField(reading.name, base64ToFloat(reading.value))
    writeApi.writePoint(point)
    console.log(point)
  } 
})

function base64ToFloat(str){
  return Buffer.from(str, 'base64').readDoubleBE(0)
}