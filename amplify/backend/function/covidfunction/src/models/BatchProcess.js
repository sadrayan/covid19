const mongoose = require('mongoose');
const BatchProcessSchema = new mongoose.Schema({  
    reportDate: Date,
    isProcessed: Boolean,
    createdAt: Date
});
module.exports = mongoose.model('BatchProcess', BatchProcessSchema);