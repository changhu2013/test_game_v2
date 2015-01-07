var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Mixed = mongoose.Schema.Types.Mixed;

/**
 * 练习
 *
 * @type {exports.Mixed|*}
 */
var Practice = new Schema({
    paper : {type: Schema.Types.ObjectId, ref: 'Paper'}, //试卷
    user : {type: Schema.Types.ObjectId, ref: 'User'}, //练习人
    score : Number, //得分
    answer : Mixed  //用户的答案记录
});

mongoose.model('Practice', Practice, 'practices');
