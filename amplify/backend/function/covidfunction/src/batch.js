const csvjson = require("csvtojson");
var request = require('request');
const moment = require('moment')

// eslint-disable-next-line no-undef
module.exports = batchHandler = async (date) => {

    let baseURL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{fileName}.csv'

    console.log(date)
    let url = baseURL.replace('{fileName}', date)
    let json = await readURLAndGetJSON(url, date)

    // console.log(json[0])
    return json
}

async function readURLAndGetJSON(url, date) {
    let recordList = []
    let {
        response,
        body
    } = await readURL(url)

    if (response.statusCode !== 200) {
        console.log('error', url, body)
        return ['404: Not Found']
    }

    await csvjson()
        .fromString(body)
        .then((csvRow) => {
            recordList = csvRow
        })

    // console.log(recordList[0])
    return dataPointAdapter(recordList, date)
}


function dataPointAdapter(dataJSON, date) {
    let adaptedData = dataJSON.map(el => {
        return {
            FIPS: el['FIPS'] || 'n/a',
            admin2: el['Admin2'] || 'n/a',
            provinceState: el['Province_State'] || el['Province/State'] || 'n/a',
            countryRegion: getCountry(el),
            lastUpdate: moment.utc(el['Last_Update'] || el['Last Update']).format(),
            lat: el['Lat'] || el['Latitude'] || '0', 
            long: el['Long_'] || el['Longitude'] || '0', 
            confirmed: el['Confirmed'] || '0',
            deaths: el['Deaths'] || '0',
            recovered: el['Recovered'] || '0',
            active: el['Active'] || '0',
            combinedKey: el['Combined_Key'] || `${el['Province/State']}, ${el['Country/Region']}`,
            date: moment.utc(date, 'MM-DD-YYYY').endOf('day').format()  
        }
    })

    return adaptedData
}

function getCountry (el) {
    let country = el['Country_Region'] || el['Country/Region'] || 'n/a'
    if (country === 'Mainland China')
        return 'China'
    return country
}

async function readURL(url) {
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