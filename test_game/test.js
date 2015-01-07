var config = require('./config');
var mongoose = require('mongoose');
var moment = require('moment');


//mongoose
mongoose.connect('mongodb://' + config.host + '/' + config.db);

require('./models/user.js');
require('./models/category.js');


var User = mongoose.model('User');
var Category = mongoose.model('Category');

/*
var parent = new Category({
    text: '测试题目分类',
    leaf : false
});

parent.save(function(err, doc){

    var child = new Category({
        text : '子项分类',
        leaf : true
    })

    child.parent = parent;

    child.save(function(err, doc){
        console.log(doc);
    });

});
*/

Category.find({
    _id : '54acdf08e5040b4c275e11f0'
}).populate('parent') .exec(function(err, doc){
    console.log(doc);
})






