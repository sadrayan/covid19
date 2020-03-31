const mongoose = require('mongoose');
const moment = require('moment')
const CaseDataPoint = require('./models/CaseDataPoint')
const BatchProcess = require('./models/BatchProcess')

require('dotenv').config({
    path: './variables.env'
});

// Connect to Mongodb
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


exports.saveCaseDataPoints = async (data) => {
    try {
        let result = await CaseDataPoint.insertMany(data)
        return {
            statusCode: 200,
            body: result
        }
    } catch (error) {
        console.log('something bad happened', error)
        return {
            statusCode: error.statusCode || 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Could not create the caseDataPoint.'
        }
    }
}


exports.getLastBatchProcess = async () => {
    try {
        let result = await BatchProcess.find().sort({
            reportDate: -1
        })
        // console.log(result)
        return result
    } catch (error) {
        console.log('something bad happened', error)
        return {
            statusCode: error.statusCode || 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Could not create the caseDataPoint.'
        }
    }
}

exports.executeAggregate = async (query) => {
    try {
        let result = await CaseDataPoint.aggregate(query).exec();
        return {
            statusCode: 200,
            body: result
        }
    } catch (error) {
        console.log('something bad happened', error);
        return {
            statusCode: error.statusCode || 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Could not create the caseDataPoint.'
        }
    }
}

exports.getLatestDay = async () => {
    try {
        let result = await CaseDataPoint.find().sort({
            date: -1
        }).limit(1)
        console.log(result[0].date)
        return moment.utc(result[0].date).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
    } catch (error) {
        console.log('something bad happened', error)
        return {
            statusCode: error.statusCode || 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Could not create the caseDataPoint.'
        }
    }
}

exports.saveProcessBatch = async (date) => {
    await BatchProcess.create({
        reportDate: date.format('MM-DD-YYYY'),
        isProcessed: true,
        createdAt: moment().utc()
    })
}