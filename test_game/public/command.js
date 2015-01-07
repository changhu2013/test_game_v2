;(function(name, definition){
    if(typeof module !== 'undefined' && module.exports){
        module.exports = definition();
    }else {
        this[name] = definition();
    }
}('Command', function(){

    return {
        SERVER_READY : 'server_ready', //服务器准备好了
        CLIENT_READY : 'client_ready', //客户端准备好了
        BROADCAST : 'broadcast',  //-- msg:'XXXXXXX'  -- 表示广播发送一条信息  在某题集内广播，或在全局广播

        JOIN_WARZONE: 'join_warzone', //进入战场

        JOIN_BATTLE : 'join_battle', // -- msg:'XXXXX' --  进入某挑战  当客户端接收到该消息的时候更新战场局势
        JOIN_DRILL : 'join_drill', // -- 进入某题集下的练习

        START_BATTLE: 'start_battle', //开始战斗

        BATTLE_NEWS : 'battle_new', // -- {sid:{}} -- 用户挑战信息

        FIEE_BATTLE : 'flee_battle', //-- msg:'XXXXX' --  逃离挑战  当客户端接收到该消息的时候更新战场局势

        ANSWER_RIGHT : 'answer_right',  //-- sid:1 progress:5 -- 表示某人答题正确 当客户端接收到该消息的时候更新对应客户的进度
        USE_PROPERTY : 'use_property', //-- sid:1 tosid:2 action:delay放慢速度 -- 表示用户1对用户2使用道具 将进度拖慢

        BATTLE_OK : 'battle_ok', //-- sid:1 score:100 time:120 breakRecord:true record:99 -- 表示用户1挑战成功以及其成绩和用时 record为该题集的记录 breakRecord为true表示破记录
        BREAK_RECORD : 'break_record', //-- sid:1 score:100 record:99 -- 表示用户1以得分100破了最高记录99  在某题集内广播

        JOIN_STORE : 'join_store', //-- qsid:88 sid:1 -- 表示用户1进入题集88 在全局广播
        FIEE_STORE : 'flee_store', //-- qsid:88 sid:1 -- 表示用户1退出体积88 在全局广播

        CHALLENGE : 'challenge', //-- sid:1 tosid:2 -- 表示用户1向用户2发起挑战
        START_BATTLE : 'start_battle' //-- bid:1 -- 表示战场1开始战斗，由战场创建人点击开始按钮
    };
}));