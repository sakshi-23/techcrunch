var group_messages =[{'msg':['Peter: The best party ever'],'time':["9/16/2017, 9:55:53 PM"],'from':['joe']},{'msg':['Hey Guys!'],'time':["9/16/2017, 8:15:13 PM"],'from':['Joe']},{'msg':['Kim: It was fun! '],'time':["9/6/2017, 9:15:13 AM"],'from':['Joe']}]
var messages =['I am so happy','TechCrunch is awesome','How are you?','How do I work when I am hungry...','I was wondering...',"Its dinner time","Sushi was awesome"]
var images=['https://s3.postimg.org/h9q4sm433/img3.jpg','https://s3.postimg.org/quect8isv/img4.jpg','https://s16.postimg.org/ete1l89z5/img5.jpg','https://s3.postimg.org/yf86x7z1r/img2.jpg','https://s13.postimg.org/ih41k9tqr/img1.jpg','https://s3.postimg.org/h9q4sm433/img3.jpg']
var group_images='https://image.flaticon.com/icons/png/512/32/32441.png'
var ids=[];
var getRoasters = function () {
    var option = {
        success: function (roster) {
            for (var o in roster) {
                name =  roster[o].name;
                ids.push(name);
                $(".people").append('<li mid='+o+' id='+name+' class="person single" data-chat="person'+o+'"><img src="'+images[o]+'" alt="" /><span class="name">'+name+'</span><span class="time">9/15/2017, 4:55:53 PM</span><span class="preview">'+messages[o]+'</span> </li>')

            }
        }
    };
    conn.getRoster(option);
};

var listGroups;
var conn = new WebIM.connection({
    isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
    https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
    url: WebIM.config.xmppURL,
    heartBeatWait: WebIM.config.heartBeatWait,
    autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
    autoReconnectInterval: WebIM.config.autoReconnectInterval,
    apiUrl: WebIM.config.apiURL,
    isAutoLogin: true
});

conn.listen({
    onOpened: function ( message ) {          // callback for successful login
        // if isAutoLogin is false, users need to manually update online status by setting, conn.setPresence();
                // Skip the following line if isAutoLogin is true
        conn.setPresence();
        listGroups()
        getRoasters();
    },
    onClosed: function ( message ) {},         // callback for connection closed

    onOnline: function () {},                  // the local host has connected to the Internet
    onOffline: function () {},                 // the local host has disconnected from the Internet
    onError: function ( message ) {} ,          // callback failure

    onPresence: function ( message ) {},       // receive a user subscription request, dismissed by a group or chat room, group or chat room is deleted.

    onTextMessage: function ( message ) {

//         callRestaurants
        d = new Date();
        time = d.toLocaleString();
        message.time= time;
        $(".m"+message.from).addClass("active");
        setTimeout(function () {
                    return  $(".m"+message.from).removeClass("active");
                }, 500);
        callRestaurants(message);



    },    // receive a text message
    onEmojiMessage: function ( message ) {},   // receive a emoji message
    onPictureMessage: function ( message ) {}, // receive an image message
    onCmdMessage: function ( message ) {},     // receive a command message
    onAudioMessage: function ( message ) {},   // receive an audio message
    onLocationMessage: function ( message ) {},// receive a location message
    onFileMessage: function ( message ) {},    // receive a file message
    onVideoMessage: function ( message ) {},   // receive a video message

    onRoster: function ( message ) {},         // handle a friend request
    onInviteMessage: function ( message ) {},  // handle a group invitation
});


function callRestaurants(message){

    var id  = $('#'+to).attr("mid");
        $(".glyphicon-record").show();
        group_messages[id].msg.push(message.data);
        group_messages[id].time.push(message.time);
        group_messages[id].from.push(message.from);
        if(message.id)
            $('#'+to).trigger("click");
        $.ajax({url: "https://ketch-up.herokuapp.com/suggestions/"+to, success: function(result){
           showRestaurants(result);

}})
}
url="https://ketch-up.herokuapp.com/vote"
user ='kim'
pswd ='kim'
$("#signin").on("click",function(){
    $(".show_signin").hide();
    $(".show_message_list").show();
    var options = {
    apiUrl: WebIM.config.apiURL,
    user: user,
    pwd: pswd,
    appKey: WebIM.config.appkey
    };

    conn.open(options);



});




//$("#signin").trigger("click");




var listGroups = function () {
    var option = {
        success: function (rooms) {
            for (var o in rooms){
                if(o==1)
                    continue;
            $(".people").prepend('<li mid='+o+' id='+rooms[o].roomId+' class="groupperson person" data-chat="person'+o+'"><img src="'+group_images+'" alt="" /><span class="name">'+rooms[o].name+'</span><span class="time">'+group_messages[o].time[0]+'</span><span class="preview">'+group_messages[o].from[0]+" : "+group_messages[o].msg[0]+'</span> </li>')
            ids.push(rooms[o].roomId);


            }

            o=1;

            $(".people").prepend('<li mid='+o+' id='+rooms[o].roomId+' class="groupperson person" data-chat="person'+o+'"><img src="'+group_images+'" alt="" /><span class="name">'+rooms[o].name+'</span><span class="time">'+group_messages[o].time[0]+'</span><span class="preview">'+group_messages[o].from[0]+" : "+group_messages[o].msg[0]+'</span> </li>')
            ids.push(rooms[o].roomId);


            queryRoomMember(rooms[1].roomId);
        },
        error: function () {
            console.log('Failed to get a list of groups');
        }
    };
    conn.listRooms(option);
};

var queryRoomMember = function (id) {
            var member = '';
            conn.queryRoomMember({
                roomId: id,
                success: function (members) {
                    for (var fruit in members) {
                        member = members[fruit];
                        console.log(member);
                        temp = member.jid.split("groupplan_")[1]
                        name = temp.split("@")[0];
                        $(".people-list").append("<span class='m"+name+"'>"+name+"</span>");
                    }
                }
            });
            };


var sendPrivateText = function (to,msg) {
    var id = conn.getUniqueId();                    // generate a local message id
    var message = new WebIM.message('txt', id);     // create a text message
    var options = {
        msg: msg,                     // message content
        to: to,                             // receiver's Hyphenate ID or group id
        chatType: 'singleChat',                     // singleChat, groupChat, chatRoom
        roomType: false,                            // False for single and group chat. True for chat room.
        success: function (id, serverMsgId) {
            console.log(id);
            console.log(serverMsgId);
        },
        fail: function () {
            console.log('send text failed');
        }
    };
    message.set(options);
   // message.setGroup('groupchat')                   // Add this line for group chat and chat room,
    conn.send(message.body);
};


var sendGroupText = function (to,msg) {
    var id = conn.getUniqueId();                    // generate a local message id
    var message = new WebIM.message('txt', id);     // create a text message
    var options = {
        msg: msg,                     // message content
        to: to,                             // receiver's Hyphenate ID or group id
        chatType: 'groupChat',                     // singleChat, groupChat, chatRoom
        roomType: false,                            // False for single and group chat. True for chat room.
        success: function (id, serverMsgId) {
            console.log(id);
            console.log(serverMsgId);
        },
        fail: function () {
            console.log('send text failed');
        }
    };
    message.set(options);
   message.setGroup('groupchat')                   // Add this line for group chat and chat room,
    conn.send(message.body);
};


 $(".glyphicon-record").on("click",function(){
    $(this).hide();
 });


