const axios = require('axios')

module.exports = function() {
    let operations = {
      POST
    };
  
    function POST(req, res, next) {
      axios.post('http://api_db:5000/song', req.body).then((data) => {
          res.send(200)
      }).catch(error => {
        if(error.response !== undefined)
          res.sendStatus(error.response.status)
        else
          res.sendStatus(500)
      })
    }

    POST.apiDoc = {
      operationId: 'postSong',
      consumes: ['application/json'],
      parameters: [
        {
          in: 'body',
          name: 'song',
          required: true,
          schema:{
            $ref: '#/definitions/Song'
          }
        }
      ],
      responses: {
        200: {
          description: "/song POST",
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