var fs = require('fs'); 
var { parse } = require('csv-parse');
var axios = require('axios')
let parseSong = false
var parser = parse({columns: true}, async function (err, records) {
	let allowed, filtered = []
	if(parseSong) allowed = ["id", "name", "album", "artists", "release_date"]
	else allowed = ["Beach Name", "Water Temperature", "Wave Height", "Wave Period", "Battery Life"]
	records.forEach(record => {
		filtered.push(Object.keys(record)
		.filter(key => allowed.includes(key))
		.reduce((obj, key) => {
			if(parseSong){
				if(key === "id") obj["_id"] = record[key]
				else obj[key] = record[key]
			} else {
				var newKey = key.replace(/\s+/g, '_').toLowerCase()
				if(key === "Water Temperature" || key === "Wave Height" || key === "Wave Period" || key === "Battery Life")
					record[key] = parseFloat(record[key])
				obj[newKey] = record[key]
			}
			return obj
		}, {}))
	});
	for(let i = 0; i < 1000; i++){
		let path = parseSong ? "song" : "bwq"
		console.log(filtered[i])
		axios.post('http://localhost:8080/' + path, filtered[i]).then((data) => {
			console.log(data.data)
		}).catch(error => {
			console.log(error)
		})
		await new Promise(r => setTimeout(r, 3000))
	}
});
if(parseSong) fs.createReadStream("../../../../tracks_features.csv").pipe(parser);
else fs.createReadStream("../bwq.csv").pipe(parser);