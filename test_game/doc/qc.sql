use test_game;
db.createCollection(questioncategorys);
db.questioncategorys.insert({qcid: "10", pid: "0", title: "财务审计部", isParent: true}});
db.questioncategorys.insert({qcid: "11", pid: "0", title: "市场客服部", isParent: true});
db.questioncategorys.insert({qcid: "12", pid: "0", title: "车队运营部", isParent: true});
db.questioncategorys.insert({qcid: "13", pid: "0", title: "安全监管部", isParent: true});

db.questioncategorys.insert({qcid: "20", pid: "10", title: "财务会计", isParent: true});
db.questioncategorys.insert({qcid: "21", pid: "10", title: "财务会计", isParent: true});
db.questioncategorys.insert({qcid: "22", pid: "11", title: "客服开发", isParent: true});
db.questioncategorys.insert({qcid: "23", pid: "11", title: "客服代表", isParent: true});

db.questioncategorys.insert({qcid: "24", pid: "12", title: "调度主管", isParent: true});
db.questioncategorys.insert({qcid: "25", pid: "12", title: "车务主管", isParent: true});
db.questioncategorys.insert({qcid: "26", pid: "13", title: "押运员", isParent: true});
db.questioncategorys.insert({qcid: "27", pid: "13", title: "安全主任", isParent: true});

db.questioncategorys.insert({qcid: "30", pid: "24", title: "调度助理", isParent: true});
db.questioncategorys.insert({qcid: "31", pid: "25", title: "驾驶员", isParent: true});
