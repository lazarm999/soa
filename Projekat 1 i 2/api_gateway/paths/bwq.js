const mqtt = require('mqtt') 
const mqttClient = mqtt.connect('mqtt://mqtt:1883/')

mqttClient.on("connect",function(connack){   
    console.log("mosquitto client connected"); 
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

module.exports = function() {
    let operations = {
      POST
    };
  
    function POST(req, res, next) {
        mqttClient.publish("/data", JSON.stringify(req.body))
        res.sendStatus(200)
    }

    POST.apiDoc = {
      operationId: 'postBwq',
      consumes: ['application/json'],
      parameters: [
        {
          in: 'body',
          name: 'bwq',
          required: true,
          schema:{
            $ref: '#/definitions/Bwq'
          }
        }
      ],
      responses: {
        200: {
          description: "/bwq POST",
          schema: {
            type: 'string'
          }
        },
        default: {
          description: 'An error occurred',
          schema: {
            additionalProperties: true
          }
        }
      }
    };
  
    return operations;
}