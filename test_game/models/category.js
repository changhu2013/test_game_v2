
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 题库分类
 * @type {Schema}
 */
var Category = new Schema({
    text: String, //名称
    leaf: Boolean, //是否是叶子节点
    parent: {type: Schema.Types.ObjectId, ref: 'Category'}
});

mongoose.model('Category', Category, 'categorys');