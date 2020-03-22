var request = require('request');


async function processDataType(type, url) {

    var recordList = [];
    let {response, body } = await get(url)

    if (response.statusCode !== 200) {
        return response
    }

    var csv = body.split('\n')
    csv.pop() // remove last null element //todo

    csv = csv.map(row => CSVtoArray(row))
    let header = csv.shift();
    header.splice(0, 4)
    let headerDates = header.map(row => new Date(row))

    csv.forEach(row => {
        // console.log(row)  
        var dataPoint = {
            provinceState: row[0] ? row[0] : "n/a",
            countryRegion: row[1] ? row[1] : "n/a",
            lat: row[2] ? row[2] : "n/a",
            long: row[3] ? row[3] : "n/a",
            type: type,
        }
        var dataCasePair = {}
        headerDates.forEach((date, i) => {
            dataCasePair[date.toISOString().split('T')[0]] = parseInt(row[i + 4]) || 0 // header is ahead :)
        })
        dataPoint['dataPoints'] = dataCasePair
        recordList.push(dataPoint)
    });

    // console.log(recordList)
    return {
        recordList,
        headerDates
    }

}

export default processDataType;

 async function get(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (error) return reject(error)
            return resolve({
                body,
                response
            })
        })
    })
}

function CSVtoArray(text) {
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    var a = []; 
    text.replace(re_value, 
        function (m0, m1, m2, m3) {
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; 
        });
    if (/,\s*$/.test(text)) a.push('');
    return a;
}
