var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
var uuidv4 = require('uuid').v4;
const moment = require('moment')

module.exports = async function batchedAsync({
    list,
    chunkSize = 25,
    msDelayBetweenChunks = 100
}) {
    const emptyList = new Array(Math.ceil(list.length / chunkSize)).fill();
    const clonedList = list.slice(0);
    const chunks = emptyList.map(_ => clonedList.splice(0, chunkSize));

    const docClient = new AWS.DynamoDB();

    for (let chunk of chunks) {
        if (msDelayBetweenChunks)
            await new Promise(resolve => setTimeout(resolve, msDelayBetweenChunks));
        await writeItems(docClient, chunk, chunks);
    }
}

async function writeItems(docClient, chunk, chunks) {
    let dataPoints = []
    chunk.forEach(dataPoint => {
        dataPoints.push({
            'PutRequest': {
                'Item': {
                    id: { S: uuidv4()},
                    FIPS: { S: dataPoint['FIPS']},
                    admin2: { S: dataPoint['admin2']},
                    provinceState: { S: dataPoint['provinceState']},
                    countryRegion: { S: dataPoint['countryRegion']},
                    lastUpdate: { S: moment.utc(dataPoint['lastUpdate']).format()  },
                    lat: { S: dataPoint['lat']},
                    long: { S: dataPoint['long']},
                    confirmed: { S: dataPoint['confirmed']},
                    deaths: { S: dataPoint['deaths']},
                    recovered: { S: dataPoint['recovered']},
                    active: { S: dataPoint['active']},
                    combinedKey: { S: dataPoint['combinedKey']},
                    date: { S: moment.utc(dataPoint['lastUpdate']).endOf('day').format()  },
                }
            }
        })
    })
    
    const params = {
        RequestItems: {
            'CasePoint-vp7kqxl6obe4dal7zjxc6rnvie-dev': dataPoints
        }
    };
    
    const { UnprocessedItems } = await docClient.batchWriteItem(params).promise();
    if (UnprocessedItems.length) {
        chunks.push(UnprocessedItems);
    }
}