var fs = require('fs'); 
var { parse } = require('csv-parse');
var axios = require('axios')
var parser = parse({columns: true}, async function (err, records) {
	const allowed = ["id", "name", "album", "artists", "release_date"]
	const filtered = []
	records.forEach(record => {
		filtered.push(Object.keys(record)
		.filter(key => allowed.includes(key))
		.reduce((obj, key) => {
			if(key === "id") obj["_id"] = record[key]
			else obj[key] = record[key]
			return obj
		}, {}))
	});
	for(let i = 2000; i < 10000; i++){
		await new Promise(r => setTimeout(r, 4000));
		axios.post('http://localhost:8080/song', filtered[i]).then((data) => {
			console.log(data.data)
		}).catch(error => {
			console.log(error)
		})
	}
});

fs.createReadStream("../../../tracks_features.csv").pipe(parser);