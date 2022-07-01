const mqtt = require('mqtt') 
const mqttClient = mqtt.connect("mqtt://mqtt:1883/") 
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const express = require('express')
const bodyParser = require("body-parser")
const app = express()
const {InfluxDB} = require('@influxdata/influxdb-client')
const {Point} = require('@influxdata/influxdb-client')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Influxdb setup
const token = '6BUqH5kMgpbuI5UhqmGXlrJGTbSLgfS2glBNQE34k_eFLitmkJjlJSmCgXMTirP-_WyTJu2xFOmtOAgraY795Q=='
const org = 'eVeL'
const bucket = 'soa'
const influxClient = new InfluxDB({url: 'http://influxdb:8086', token: token})
writeApi = influxClient.getWriteApi(org, bucket)
writeApi.useDefaultTags({tag: 'defualt'})

//grpc setup
const packageDef = protoLoader.loadSync("notification.proto", {})
const package = grpc.loadPackageDefinition(packageDef).default;
const grpcClient = new package.Notification("notification:8085",  grpc.credentials.createInsecure())

let dataTopic = '/data', eventTopic = '/event', analizeTopic = '/analize'

mqttClient.on('connect', () => { 
  mqttClient.subscribe(dataTopic, (err, granted) => { 
    if(err) console.log('Error while subscribing to /data topic', 'err')
    else console.log('Mqtt client subscribed /data topic') 
  })
  mqttClient.subscribe(eventTopic, (err, granted) => { 
    if(err) console.log('Error while subscribing to /event topic', 'err')
    else console.log('Mqtt client subscribed to /event topic') 
  }) 
}) 

mqttClient.on('message', async (topic, binMessage, packet) => { //binMessage = binaryMessage 
  if(topic === dataTopic) {
    mqttClient.publish(analizeTopic, binMessage)
  } else if (topic === eventTopic){
    message = bufferTojson(binMessage)[0]
    const point = new Point('bwq')
                .stringField('beach_name', message.beach_name)
                .floatField('water_temperature', message.water_temperature)
                .floatField('wave_height', message.wave_height)
                .floatField('wave_period', message.wave_period)
                .floatField('battery_life', message.battery_life)
    if(message.battery_life < 10 && message.wave_height > 0.2){
      let point2 = new Point('bwq')
                  .stringField('beach_name', message.beach_name)
                  .floatField('water_temperature', message.water_temperature)
                  .floatField('wave_height', message.wave_height)
                  .floatField('wave_period', message.wave_period)
                  .floatField('battery_life', message.battery_life)
                  .stringField('eventType', 'lowBattery')
      point.stringField('eventType', 'highWaves')
      writeApi.writePoint(point2)
      console.log(point2)
    } else if (message.battery_life < 10) {
      point.stringField('eventType', 'lowBattery')
    } else if (message.wave_height > 0.2){
      point.stringField('eventType', 'highWaves')
    }
    writeApi.writePoint(point)
    console.log(point)
    grpcClient.sendEvent(message, (err, response) => {
      if(err) console.log("Grpc error: sendEvent method ", err)
    })
  }
})

function bufferTojson(buff){
  return JSON.parse(buff.toString())
}

app.listen(1999, () => {
  console.log("Slusam na portu 1999")
})