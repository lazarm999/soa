var fs = require('fs'); 
var { parse } = require('csv-parse');
var axios = require('axios')
var parser = parse({columns: true}, async function (err, records) {
	let allowed, filtered = []
	allowed = ["device", "co", "humidity", "temp", "smoke"]
	records.forEach(record => {
        if(record.device === "b8:27:eb:bf:9d:51"){
            filtered.push(Object.keys(record)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                if(key === "temp")
                    obj["temperature"] = record[key]
                else if(key !== "device")
                    obj[key] = record[key]
                return obj
            }, {}))
        }
	});
	for(let i = 0; i < 1000; i++){
        console.log(filtered[i])
        var config = {
            headers: {
                'Content-Type': 'text/plain'
            },
           responseType: 'text'
        };
        smoke = (i % 3 == 0) ? filtered[i].smoke * 15 : filtered[i].smoke
		await axios.post('http://localhost:49986/api/v1/resource/environmentDevice/co', filtered[i].co, config)
        await axios.post('http://localhost:49986/api/v1/resource/environmentDevice/temperature', filtered[i].temperature, config)
        await axios.post('http://localhost:49986/api/v1/resource/environmentDevice/humidity', filtered[i].humidity, config)
        await axios.post('http://localhost:49986/api/v1/resource/environmentDevice/smoke', smoke.toString(), config)
		await new Promise(r => setTimeout(r, 2000))
	}
});
fs.createReadStream("../iot_telemetry_data.csv").pipe(parser);