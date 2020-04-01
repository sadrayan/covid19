const mongoose = require('mongoose');
const CaseDataPointSchema = new mongoose.Schema({  
    id: String,
    FIPS: String,
    admin2: String,
    provinceState: String,
    countryRegion: String,
    lastUpdate: Date,
    lat: Number,
    long: Number,
    confirmed: Number,
    deaths: Number,
    recovered: Number,
    active: Number,
    combinedKey: String,
    date: Date,
    createdAt: Date
});
module.exports = mongoose.model('CaseDataPoint', CaseDataPointSchema);