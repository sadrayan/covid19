const mongoose = require('mongoose');
const ForecastSchema = new mongoose.Schema({  
    id: String,
    model: String,
    case_type: String,
    country: String,
    ds: Date,
    date: Date,
    yhat: Number,
    yhat_upper: Number,
    yhat_lower: Number,
});
module.exports = mongoose.model('Forecast', ForecastSchema);