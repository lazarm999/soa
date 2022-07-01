const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'API Gateway',
    version: '1.0.0'
  },
  definitions: {
    Song: {
      type: 'object',
      required: ["_id", "name", "album", "artists", "release_date"],
      properties: {
          _id: {
            type: "string"
          },
          name: {
            type: "string"
          },
          album: {
            type: "string"
          },
          artists: {
            type: "string"
          },
          release_date: {
            type: "string"
          },
          lyrics:{
            type: "string"
          }
        }
    }, 
    Bwq: {
      type: 'object',
      required: ["beach_name", "water_temperature", "wave_height", "wave_period", "battery_life"],
      properties: {
          beach_name: {
            type: "string"
          },
          album: {
            type: "string"
          },
          water_temperature: {
            type: "number"
          },
          wave_height: {
            type: "number"
          },
          wave_period:{
            type: "number"
          },
          battery_life:{
            type: "number"
          }
        }
    }
  },
  paths: {}
};

module.exports = apiDoc;