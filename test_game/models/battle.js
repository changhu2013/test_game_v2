var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Mixed = mongoose.Schema.Types.Mixed;

/**
 * 对战
 *
 */
var Battle = new Schema({
    store : {type: Schema.Types.ObjectId, ref: 'Store'}, //题库
    paper: {type: Schema.Types.ObjectId, ref: 'Paper'}, //试卷

    owner: {type: Schema.Types.ObjectId, ref: 'User'}, //对战创建人
    users: [{type: Schema.Types.ObjectId, ref: 'User'}], //参加人

    status: String,  //挑战状态：N - 未开始 F - 已经完成 I - 正在进行中 E-跑路(所有人跑路)

    start: Date, //开始时间
    end: Date, //结束时间

    grade: Mixed, //每个人的得分
    answer: Mixed,  //每个用户的答案记录

    createTime: Date //该对战的创建时间
});

mongoose.model('Battle', Battle, 'battles');
