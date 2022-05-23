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
    }
  },
  paths: {}
};

module.exports = apiDoc;