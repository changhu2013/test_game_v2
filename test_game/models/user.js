var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 用户
 *
 * @type {Schema}
 */
var User = new Schema({
    sid: String,
    name: String,
    job: String,
    score: Number,
    battles: Number
});

mongoose.model('User', User, 'users');