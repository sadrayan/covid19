const DBHelper = require('./dbHelper') 

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const moment = require('moment')

const batchHandler = require('./batch')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

app.get('/casePoint/totalStat', async (req, res) => {
  const query = [{
    '$group': {
      '_id': {
        '__alias_0': '$date'
      },
      '__alias_1': {
        '$sum': '$confirmed'
      },
      '__alias_2': {
        '$sum': '$recovered'
      },
      '__alias_3': {
        '$sum': '$active'
      },
      '__alias_4': {
        '$sum': '$deaths'
      }
    }
  }, {
    '$project': {
      '_id': 0,
      '__alias_0': '$_id.__alias_0',
      '__alias_1': 1,
      '__alias_2': 1,
      '__alias_3': 1,
      '__alias_4': 1
    }
  }, {
    '$project': {
      'confirmed': '$__alias_1',
      'date': '$__alias_0',
      'recovered': '$__alias_2',
      'active': '$__alias_3',
      'death': '$__alias_4',
      '_id': 0
    }
  }, {
    '$sort': {
      'date': -1
    }
  }]
  let result = await DBHelper.executeAggregate(query);
  res.json(result)
});

app.get('/casePoint/totalStat/:country', async (req, res) => {

  let country = req.params.country
  const query = [ {
      "$match": {
        "countryRegion": {
          "$in": [
            country
          ]
        }
      }
    },{
    '$group': {
      '_id': {
        '__alias_0': '$date'
      },
      '__alias_1': {
        '$sum': '$confirmed'
      },
      '__alias_2': {
        '$sum': '$recovered'
      },
      '__alias_3': {
        '$sum': '$active'
      },
      '__alias_4': {
        '$sum': '$deaths'
      }
    }
  }, {
    '$project': {
      '_id': 0,
      '__alias_0': '$_id.__alias_0',
      '__alias_1': 1,
      '__alias_2': 1,
      '__alias_3': 1,
      '__alias_4': 1
    }
  }, {
    '$project': {
      'confirmed': '$__alias_1',
      'date': '$__alias_0',
      'recovered': '$__alias_2',
      'active': '$__alias_3',
      'death': '$__alias_4',
      '_id': 0
    }
  }, {
    '$sort': {
      'date': -1
    }
  }]

  let result = await DBHelper.executeAggregate(query);
  res.json(result)
});


/**********************
 * Get stats method *
 **********************/
app.get('/casePoint/overviewStats', async (req, res) => {

  var lastDate = await DBHelper.getLatestDay()

  let queryListAllCountries = [{
    '$match': {
      '$expr': {
        '$and': [{
          '$cond': [{
            '$not': {
              '$isArray': [
                '$date'
              ]
            }
          }, {
            '$gte': [
              '$date', {
                '$dateFromString': {
                  'dateString': lastDate,
                  'timezone': 'UTC'
                }
              }
            ]
          }, {
            '$reduce': {
              'input': '$date',
              'initialValue': false,
              'in': {
                '$or': [
                  '$$value', {
                    '$gte': [
                      '$$this', {
                        '$dateFromString': {
                          'dateString': lastDate,
                          'timezone': 'UTC'
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }]
        }, true]
      }
    }
  }, {
    '$group': {
      '_id': {
        '__alias_0': '$countryRegion'
      },
      'confirmed': {
        '$sum': '$confirmed'
      },
      'recovered': {
        '$sum': '$recovered'
      },
      'deaths': {
        '$sum': '$deaths'
      }
    }
  }, {
    '$project': {
      '_id': 0,
      'country': '$_id.__alias_0',
      'confirmed': '$confirmed',
      'recovered': '$recovered',
      'deaths': '$deaths'
    }
  }, {
    '$sort': {
      'confirmed': -1
    }
  }]

  let result = await DBHelper.executeAggregate(queryListAllCountries)
  res.json(result)
});



/****************************
 * Batch method *
 ****************************/
app.post('/casePoint/batchCasePoint', async function (req, res) {

  var processDateResult = await DBHelper.getLastBatchProcess()

  let date
  let reportDates = []
  // initial date to kick off batch
  if (!processDateResult.length)
    date = moment("01-22-2020", 'MM-DD-YYYY').utc()
  else {
    reportDates = processDateResult.map(el => moment(el.reportDate).utc().format('MM-DD-YYYY'))
    date = moment(processDateResult[0].reportDate).utc()
    date.add(1, 'days')
  }

  console.log(date.format(), date.isBefore(moment(new Date()).utc()))
  console.log(reportDates)

  while (date.isBefore(moment.utc(new Date()))) {

    var data = await batchHandler(date.format('MM-DD-YYYY'))
    if (data[0] === '404: Not Found' || reportDates.includes(date.format('MM-DD-YYYY'))) // check 
      break

    console.log('Processing: ', date.format('MM-DD-YYYY'), 'with datapoints: ', data.length)

    let result = await DBHelper.saveCaseDataPoints(data)
    if (result.statusCode === 200) {
      console.log('Processed: ', date.format('MM-DD-YYYY'), 'with datapoints: ', data.length)

      await DBHelper.saveProcessBatch(date)

    }
    // increment for next day
    date.add(1, 'days')
  }

  res.json({ statusCode: 200, body: [] })
});

app.listen(3001, function () { // put back 3000
  console.log("App started")
});

module.exports = app



