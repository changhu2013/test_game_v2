var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 题库
 * @type {Schema}
 */
var Store = new Schema({

    category: {type: Schema.Types.ObjectId, ref: 'Category'}, //题库分类
    text: String, //题库名称

    drill : Number, //参加该题库的练习，可得积分数
    score : Number, //参加该题库的挑战，第一名可得积分数

    duration: Number, // 最大挑战时间
    bounty: Number, // 悬赏分

    record : {type: Schema.Types.ObjectId, ref: 'User'}, //最高记录人
    bestBattle : {type: Schema.Types.ObjectId, ref: 'Battle'}, //产生最高成绩的那次挑战
    bestScore : Number //最高挑战积分
});

mongoose.model('Store', Store, 'stores');