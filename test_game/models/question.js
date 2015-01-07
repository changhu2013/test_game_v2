var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Mixed = mongoose.Schema.Types.Mixed;

/**
 * 试题
 * 每个考题属于一个特定的题库
 * 不在试题中设置属于哪一个试卷，因为一个考题可以属于不同的多个试卷
 * 随机生成试卷的时候，从试题中随机选取一些就行
 * @type {exports.Mixed|*}
 */
var Question = new Schema({
    store : {type: Schema.Types.ObjectId, ref: 'Store'}, //题库
    text: String, //题干
    answer: Mixed, //答案
    options: Mixed //选项
});

mongoose.model('Question', Question, 'questions');
