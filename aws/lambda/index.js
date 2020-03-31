// var AWS = require('aws-sdk');
// AWS.config.update({    region: 'us-east-1'});
var batchedAsync = require('./db')
// require csvtojson
const csvjson = require("csvtojson");
var request = require('request');
const moment = require('moment')
// var fs = require('fs')

exports.handler = async (event) => {

    let baseURL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{fileName}.csv'

    var daylist = getDaysArray(new Date("03-25-2020"), new Date("03-25-2020"))
    daylist = daylist.map((v)=> moment(v).format('MM-DD-YYYY') )
    // console.log(daylist)


    for (const date of daylist) {
        let json = await readURLAndGetJSON(baseURL.replace('{fileName}', date))
        console.log(json[0])
        // dataPoints[date] = json.slice(0,5)
        console.log('Processing: ', date, 'with datapoints: ', json.length)
        // await batchedAsync({ list: json.slice(0,5) } )
        await batchedAsync({ list: json } )
    }

    // console.log(dataPoints['03-24-2020'])
    

}

var getDaysArray = function(s,e) {for(var a=[],d=s;d<=e;d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};

async function readURLAndGetJSON(url) {
    let recordList = []
    let {
        response,
        body
    } = await readURL(url)

    if (response.statusCode !== 200) {
        console.log('error',url, body)
        return {
            url,
            body
        }
    }

    await csvjson()
        .fromString(body)
        .then((csvRow) => {
            recordList = csvRow
        })

    // console.log(recordList[0])
    return dataPointAdapter(recordList) 
}


function dataPointAdapter(dataJSON) {
    let adaptedData = dataJSON.map(el => {
        return {
            FIPS: el['FIPS'] ||  'n/a',
            admin2: el['Admin2'] || 'n/a',
            provinceState: el['Province_State'] || el['Province/State'] || 'n/a',
            countryRegion: el['Country_Region'] || el['Country/Region'] || 'n/a',
            lastUpdate: el['Last_Update'] || el['Last Update'],
            lat: el['Lat'] || el['Latitude'] || '0', // earliers
            long: el['Long_'] || el['Longitude'] || '0', //earlier data
            confirmed: el['Confirmed'],
            deaths: el['Deaths'],
            recovered: el['Recovered'],
            active: el['Active'] || '0',
            combinedKey: el['Combined_Key'] || `${el['Province/State']}, ${el['Country/Region']}`
        }
    })

    return adaptedData
}

// new data 
// {
//     FIPS: '45001',
//     Admin2: 'Abbeville',
//     Province_State: 'South Carolina',
//     Country_Region: 'US',
//     Last_Update: '2020-03-24 23:37:31',
//     Lat: '34.22333378',
//     Long_: '-82.46170658',
//     Confirmed: '1',
//     Deaths: '0',
//     Recovered: '0',
//     Active: '0',
//     Combined_Key: 'Abbeville, South Carolina, US'
//   }

// old data
// {
//     'Province/State': 'Hubei',
//     'Country/Region': 'China',
//     'Last Update': '2020-03-20T07:43:02',
//     Confirmed: '67800',
//     Deaths: '3133',
//     Recovered: '58382',
//     Latitude: '30.9756',
//     Longitude: '112.2707'
//   }


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

this.handler()