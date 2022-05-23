const axios = require('axios')
const scraper = require('genius-scraper')
const GENIUS_ACCESS_TOKEN = 'In1kGHzEuFgcbGnMkQd4g7EAxeOF1X5s_K4bNg1ssv5MCapdu_R2aAxM8DgkIJPY'

var key = "6e82ba24e02447e8912be688fd25104e"
var endpoint = "https://api.cognitive.microsofttranslator.com"
var location = "westeurope"

module.exports = function() {
    let operations = {
      GET,
      DELETE,
      PATCH
    };
  
    function replaceAt(i, str, char){
      return str.substring(0, i) + char + str.substring(i + 1);
    }

    function parseArtists(artists){
      artists = artists.substring(1, artists.length - 1)
      isOpen = false
      for (let i = 0; i  < artists.length; i++) {
          let el = artists.charAt(i)
          if(el === "\'" && isOpen === false){
              isOpen = true
              artists = replaceAt(i, artists, "")
          } 
          if((el === "\'" && i === artists.length - 1) || (el === "\'" && artists[i+1] === ",")){
              isOpen = false
              artists = replaceAt(i, artists, "")
          }
      }
      return artists.split(",")
    }

    function GET(req, res) {
      let lan = req.query.lan
      axios.get('http://api_db:5000/song/' + req.params.id).then((data) => {
          let song = data.data
          let q = song.name
          let artists = parseArtists(song.artists)
          q += " " + artists[0]
          axios.get('http://api.genius.com/search', {params: { q: q, access_token: GENIUS_ACCESS_TOKEN } }).then((data) => {
              let lyricsUrl = data.data.response.hits[0].result.url
              scraper.getLyrics(lyricsUrl).then(lyrics => {
                if (lan !== undefined){
                  axios({
                      baseURL: endpoint,
                      url: '/translate',
                      method: 'post',
                      headers: {
                          'Ocp-Apim-Subscription-Key': key,
                          'Ocp-Apim-Subscription-Region': location,
                          'Content-type': 'application/json'
                      },
                      params: {
                          'api-version': '3.0',
                          'to': [lan]
                      },
                      data: [{
                          'text': lyrics
                      }],
                      responseType: 'json'
                  }).then(function(response){
                      song.lyrics = response.data[0].translations[0].text
                      res.send(song)
                  })
                } else { 
                  song.lyrics = lyrics
                  res.send(song)
                }
              })
          }).catch(error => {
            console.log(error)
            if(error.response !== undefined)
              res.sendStatus(error.response.status)
            else
              res.sendStatus(500)
          })
      }).catch(error => {
        if(error.response !== undefined)
          res.sendStatus(error.response.status)
        else
          res.sendStatus(500)
      })
    }

    function DELETE(req, res){
      axios.delete('http://api_db:5000/song/' + req.params.id).then((data) => {
        res.sendStatus(data.status)
      }).catch(error => {
        console.log(error)
        if(error.response !== undefined)
          res.sendStatus(error.response.status)
        else
          res.sendStatus(500)
      })
    }

    function PATCH(req, res){
      if(req.body.name === undefined){
        res.sendStatus(400)
        return
      }
      axios.patch('http://api_db:5000/song/' + req.params.id, req.body).then((data) => {
        res.sendStatus(data.status)
      }).catch(error => {
        console.log(error)
        if(error.response !== undefined)
          res.sendStatus(error.response.status)
        else
          res.sendStatus(500)
      })
    }

    GET.apiDoc = {
      operationId: 'getSong',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          type: "string"
        },
        {
          in: 'query',
          name: 'lan',
          required: false,
          type: "string"
        }
      ],
      responses: {
        200: {
          description: "/song/{id} GET",
          schema: {
            $ref: '#/definitions/Song'
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

    DELETE.apiDoc = {
      operationId: 'deleteSong',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          type: "string"
        }
      ],
      responses: {
        200: {
          description: "/song/{id} DELETE",
          schema: {
            type: "string"
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

    PATCH.apiDoc = {
      operationId: 'patchSong',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          type: "string"
        },
        {
          in: 'body',
          name: 'name',
          required: true,
          schema:{
            type: 'object',
            required: ["name"],
            properties: {
                name: {
                  type: "string"
                }
            }
          }
        }
      ],
      responses: {
        200: {
          description: "/song/{id} PATCH",
          schema: {
            type: "string"
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