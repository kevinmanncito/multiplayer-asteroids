var mongoose = require('mongoose');

module.exports = mongoose.model('Score', {
    name : String,
    score : Number
});