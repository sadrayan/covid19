/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT */


const DBHelper = require('./dbHelper')

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const moment = require('moment')
const ma = require('moving-averages').ma

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
      'deaths': '$__alias_4',
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
  const query = [{
    "$match": {
      "countryRegion": {
        "$in": [
          country
        ]
      }
    }
  }, {
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
      'deaths': '$__alias_4',
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
 * Get top 10 infected stats method *
 **********************/
app.get('/casePoint/overviewRollingAvgStats', async (req, res) => {
  let queryTopImpactedCountries = await getListAllCountriesQuery()
  let topImpactedResult = await DBHelper.executeAggregate(queryTopImpactedCountries)
  let topImpacted = topImpactedResult.body.slice(0, 10) // choose top most infected regions
  topImpacted =  topImpacted.map(el => el.country)
  console.log(topImpacted)
  
  let queryListAllCountries = [{
     '$match': {
      'countryRegion': {
        '$in': topImpacted
      }}
   },
    {
      '$group': {
        '_id': {
          '__alias_0': '$date', 
          'countryRegion': '$countryRegion'
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
        'countryRegion': '$_id.countryRegion', 
        '__alias_1': 1, 
        '__alias_2': 1, 
        '__alias_3': 1, 
        '__alias_4': 1
      }
    }, {
      '$project': {
        'countryRegion': '$countryRegion', 
        'date': '$__alias_0', 
        'confirmed': '$__alias_1', 
        'recovered': '$__alias_2', 
        'active': '$__alias_3', 
        'deaths': '$__alias_4', 
        '_id': 0
      }
    }, {
      '$sort': {
        'date': -1,
      }
    }
  ]

  let result = await DBHelper.executeAggregate(queryListAllCountries)

  let rollingAvgResult = {}
  topImpacted.forEach(country => {
    let countryCase = result.body.filter(el => el.countryRegion === country)
    // update active cases
    countryCase.forEach(el => { el.active = el.confirmed - el.recovered - el.deaths })
    countryCase.reverse(); //oldest date first 
    rollingAvgResult[country] = {}
    for (let caseType of ['confirmed', 'recovered', 'active', 'deaths']){
      let deltaCasePerDay = diff(countryCase.map(el => el[caseType]))
      let movingAvg = ma(deltaCasePerDay, 7)
      rollingAvgResult[country][caseType] = movingAvg
    }
  })

  res.json({
        statusCode: 200,
        body: rollingAvgResult
    })
})

// get the delta on reported cases
function diff(A) { return A.slice(1).map(function (n, i) { return n - A[i] }) }

/**********************
 * Get stats method *
 **********************/
app.get('/casePoint/overviewStats', async (req, res) => {

  let queryListAllCountries = await getListAllCountriesQuery()

  let result = await DBHelper.executeAggregate(queryListAllCountries)
  res.json(result)
});

app.get('/casePoint/mapCasePoint', async function (req, res) {
  var lastDate = await DBHelper.getLatestDay()
  let query = [{
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
    '$project': {
      '__alias_0': '$confirmed',
      '__alias_1': '$lat',
      '__alias_2': '$lat',
      '__alias_3': '$long',
      '__alias_4': '$countryRegion',
      '__aliast_5': '$combinedKey'
    }
  }, {
    '$project': {
      'intensity': '$__alias_0',
      'geopoint': '$__alias_1',
      'latitude': '$__alias_2',
      'longitude': '$__alias_3',
      'countryRegion': '$__alias_4',
      'combinedKey': '$__aliast_5',
      '_id': 0
    }
  }, {
    '$addFields': {
      'geopoint': {
        'type': 'Point',
        'coordinates': [
          '$longitude', '$latitude'
        ]
      }
    }
  }, {
    '$project': {
      'latitude': false,
      'longitude': false
    }
  }, {
    '$match': {
      'geopoint.type': 'Point',
      'geopoint.coordinates': {
        '$type': 'array'
      },
      'geopoint.coordinates.0': {
        '$type': 'number'
      },
      'geopoint.coordinates.1': {
        '$type': 'number'
      }
    }
  }]

  let result = await DBHelper.executeAggregate(query)
  res.json(result)
})


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

  res.json({
    statusCode: 200,
    body: []
  })
});



/****************************
 * Forecasts method *
 ****************************/
app.get('/casePoint/forecasts/:country', async function (req, res) {
  
  let country = req.params.country
  
  let latestForecastDate = await DBHelper.getLatestForecastDay()
  let query = [
    {
      '$match': {
        'country': {
          '$in': [
            country
          ]
        }, 
        '$expr': {
          '$and': [
            {
              '$cond': [
                {
                  '$not': {
                    '$isArray': [
                      '$date'
                    ]
                  }
                }, {
                  '$gte': [
                    '$date', {
                      '$dateFromString': {
                        'dateString': latestForecastDate, 
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
                                'dateString': latestForecastDate, 
                                'timezone': 'UTC'
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ]
            }, {
              '$cond': [
                {
                  '$not': {
                    '$isArray': [
                      '$date'
                    ]
                  }
                }, {
                  '$lte': [
                    '$date', {
                      '$dateFromString': {
                        'dateString': latestForecastDate, 
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
                          '$lte': [
                            '$$this', {
                              '$dateFromString': {
                                'dateString': latestForecastDate, 
                                'timezone': 'UTC'
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ]
            }, true
          ]
        }
      }
    }, {
      '$group': {
        '_id': {
          '__alias_0': '$ds', 
          '__alias_1': '$case_type', 
          '__alias_5': '$model'
        }, 
        '__alias_2': {
          '$sum': '$yhat'
        }, 
        '__alias_3': {
          '$sum': '$yhat_lower'
        }, 
        '__alias_4': {
          '$sum': '$yhat_upper'
        }
      }
    }, {
      '$project': {
        '_id': 0, 
        '__alias_0': '$_id.__alias_0', 
        '__alias_1': '$_id.__alias_1', 
        '__alias_2': 1, 
        '__alias_3': 1, 
        '__alias_4': 1, 
        '__alias_5': '$_id.__alias_5'
      }
    }, {
      '$project': {
        'ds': '$__alias_0', 
        'y_hat': '$__alias_2', 
        'y_hat_lower': '$__alias_3', 
        'y_hat_upper': '$__alias_4', 
        'case_type': '$__alias_1', 
        'model': '$__alias_5', 
        '_id': 0
      }
    }, {
      '$sort': {
        'ds': -1
      }
    }
  ]

  let result = await DBHelper.executeForecastAggregate(query);
  result['lastUpdateDate'] = latestForecastDate
  res.json(result)

})

app.listen(3001, function () { // put back 3000
  console.log("App started")
});

module.exports = app

async function getListAllCountriesQuery() {
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
  return queryListAllCountries
}
