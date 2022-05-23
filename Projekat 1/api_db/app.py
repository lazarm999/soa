from flask import Flask
from flask import request
from pymongo import MongoClient
from flask import abort

app = Flask(__name__)

client = MongoClient("mongodb+srv://evel:kecap123@oglasicluster.nvmh8.mongodb.net/Songs?retryWrites=true&w=majority")
songsCol = client.Songs.Songs

@app.route('/song/<id>', methods=['GET', 'DELETE', 'PATCH'])
def getSong(id):
    if request.method == 'GET':
        song = songsCol.find_one({"_id": id})
        if song is None:
            abort(404)
        else:
            return song
    elif request.method == 'DELETE':
        res = songsCol.delete_one({"_id": id})
        if res.deleted_count == 0:
            abort(404)
        else:
            return "OK"
    elif request.method == 'PATCH':
        name = request.json['name']
        if name is None:
            abort(400)
        res = songsCol.update_one({"_id": id}, { "$set": { 'name': name } })
        if res.modified_count == 0:
            abort(404)
        else:
            return "OK"

@app.route('/song', methods=['POST'])
def postSong():
    songsCol.insert_one(request.json)
    return "OK"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')