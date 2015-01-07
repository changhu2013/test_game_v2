var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 试卷
 * 每个试卷属于一个特定的题库
 * 随机生成试卷的时候，从题库的所有考题中随机选取一定数量的题目即可
 * @type {exports.Mixed|*}
 */

var Paper = new Schema({
    text : String,
    store : {type: Schema.Types.ObjectId, ref: 'Store'}, //题库
    questions : [{type: Schema.Types.ObjectId, ref: 'Questions'}] //题目
});

mongoose.model('Paper', Paper, 'papers');
