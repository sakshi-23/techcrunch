
    /**
     * Created by clock on 16-11-25.
     */
    var conn = {};
    conn = new WebIM.connection({
        isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
        https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
        url: WebIM.config.xmppURL,
        isAutoLogin: true,
        heartBeatWait: WebIM.config.heartBeatWait,
        autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
        autoReconnectInterval: WebIM.config.autoReconnectInterval
    });

    // callback listening
    conn.listen({
        onOpened: function (message) {          // connection established callback. Can only send message if connection established
            // If set isAutoLogin=false, then must re-login manually
            // Manually login using conn.setPresence(); in this example, conn init has isAutoLogin=true so no need to call conn.setPresence();
            console.log("%c [opened] 连接已成功建立", "color: green")
        },
        onTextMessage: function (message) {
            // process the message respect to its message.type. one-to-one chat, group chat, or chat room
            console.log(message.type);
            console.log('Text');
        }, // text message received
        onEmojiMessage: function (message) {
            // If WebIM has Emoji property, then connection will translate the character string to corresponding emojin in WebIM.Emoji automatically
            // the key-value structure is {type: 'emoji(or txt)', data:''}
            // If type='emoji', data represent the path to emoji. If type='txt', data is text message
            console.log('Emoji');
            var data = message.data;
            for (var i = 0, l = data.length; i < l; i++) {
                console.log(data[i]);
            }
        }, // Emoji message received
        onPictureMessage: function (message) {
            console.log('Picture');

            var options = {url: message.url};
            options.onFileDownloadComplete = function () {
                // 图片下载成功
                console.log('Image download complete!');
            };
            options.onFileDownloadError = function () {
                // 图片下载失败
                console.log('Image download failed!');
            };
            WebIM.utils.download.call(conn, options);       // TODO: check

        }, // image message received
        onCmdMessage: function (message) {
            console.log('CMD');
        }, // command message received
        onAudioMessage: function (message) {
            console.log("Audio");
        }, // audio message received
        onLocationMessage: function (message) {
            console.log("Location");
        }, // location message received
        onFileMessage: function (message) {
            console.log("File");
        }, // file received
        onVideoMessage: function (message) {
            var node = document.getElementById('privateVideo');
            var option = {
                url: message.url,
                headers: {
                    'Accept': 'audio/mp4'
                },
                onFileDownloadComplete: function (response) {
                    var objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
                    node.src = objectURL;
                },
                onFileDownloadError: function () {
                    console.log('File down load error.')
                }
            };
            WebIM.utils.download.call(conn, option);
        },   // video calling received
        onPresence: function (message) {
            switch (message.type) {
                case 'subscribe':                           // receiving user receives friend request
                    // receiving user accepts friend request
                    document.getElementById('agreeFriends').onclick = function (message) {
                        conn.subscribed({
                            to: 'orange',
                            message: "[resp:true]"
                        });
                        // need to send receiving user friend request
                        conn.subscribe({
                            to: message.from,
                            message: "[resp:true]"
                        });
                    };
                    // receiving user declines friend request
                    document.getElementById('rejectFriends').onclick = function (message) {
                        conn.unsubscribed({
                            to: message.from,
                            message: "rejectAddFriend"
                        });
                    };

                    break;
                case 'subscribed':                          // receiving user accepted friend request. requesting user accepts friend request
                    break;
                case 'unsubscribe':                         // receiving user remove friend
                    break;
                case 'unsubscribed':                        // receiving user declined friend request. requesting user declines friend request
                    break;
                case 'joinChatRoomSucceed':                 // join chat room succeed
                    console.log('join chat room succeed');
                    break;
                case 'joinChatRoomFailed':                   // join chat room failed
                    console.log('join chat room failed');
                    break;
                case 'joinPublicGroupSuccess':              // join public group success
                    console.log('join public group success', message.from);
                    break;
            }
        },  // receive friend request, group and chat room related updates
        onRoster: function (message) {
            console.log('Roster');
        }, // receive invitation
        onInviteMessage: function (message) {
            console.log('Invite');
        },  // receive group invitation
        onOnline: function () {
            console.log('onLine');
        }, // connection established
        onOffline: function () {
            console.log('offline');
        }, // connection dropped
        onError: function (message) {
            console.log('Error');
            console.log(message);
            if (message && message.type == 1) {
                console.warn('连接建立失败！请确认您的登录账号是否和appKey匹配。')
            }
        },           //失败回调
        onBlacklistUpdate: function (list) {
            // list contains list of user info from the blacklist
            console.log(list);
        } // update blacklist succeed
    });
    // 初始化WebRTC Call
    var rtcCall = null
    if (WebIM.WebRTC) {
        rtcCall = new WebIM.WebRTC.Call({
            connection: conn,

            mediaStreamConstaints: {
                audio: true,
                video: true
            },

            listener: {
                onAcceptCall: function (from, options) {
                    console.log('onAcceptCall::', 'from: ', from, 'options: ', options);
                },
                onGotRemoteStream: function (stream, streamType) {
                    console.log('onGotRemoteStream::', 'stream: ', stream, 'streamType: ', streamType);
                    var video = document.getElementById('video');
                    video.srcObject = stream;
                },
                onGotLocalStream: function (stream, streamType) {
                    console.log('onGotLocalStream::', 'stream:', stream, 'streamType: ', streamType);
                    var video = document.getElementById('localVideo');
                    video.srcObject = stream;
                },
                onRinging: function (caller) {
                    console.log('onRinging::', 'caller:', caller);
                },
                onTermCall: function (reason) {
                    console.log('onTermCall::');
                    console.log('reason:', reason);
                },
                onIceConnectionStateChange: function (iceState) {
                    console.log('onIceConnectionStateChange::', 'iceState:', iceState);
                },
                onError: function (e) {
                    console.log(e);
                }
            }
        });
    } else {
        console.warn('不能进行视频通话！您的浏览器不支持webrtc或者协议不是https。')
    }

    /**
     * Created by clock on 16-11-30.
     */
        // open，登录
    var options = {
            apiUrl: WebIM.config.apiURL,
            user: "mengyuanyuan",
            pwd: "123456",
            appKey: WebIM.config.appkey
        };


    var register = function () {
        var option = {
            username: 'apple',
            password: 'password',
            nickname: 'clock',
            appKey: WebIM.config.appkey,
            success: function () {
                console.log('registration succeed!');
            },
            error: function () {
                console.log('registration error');
            },
            apiUrl: WebIM.config.apiURL
        };
        conn.signup(option);
    };

    /*
     One-to-One Messaging
     */

    // Send a text message or emoji message. The characters associated with emoji will be translated to emoji automatically.
    var sendPrivateText = function () {
        var id = conn.getUniqueId();
        var msg = new WebIM.message('txt', id);
        msg.set({
            msg: 'good morning!',                       // message content
            to: 'orange',                               // receiver
            roomType: false,
            success: function (id, serverMsgId) {
                console.log("send private text Succeed");
            }
        });
        msg.body.chatType = 'singleChat';
        conn.send(msg.body);
    };

    // send command message
    var sendPrivateCmd = function () {
        var id = conn.getUniqueId();
        var msg = new WebIM.message('cmd', id);
        msg.set({
            msg: 'ls',
            to: 'orange',
            roomType: false,
            success: function (id, serverMsgId) {
                console.log('send private CMD Succeed');
            }
        });
        msg.body.chatType = 'singleChat';
        conn.send(msg.body);
    };

    // send image message
    var sendPrivateImg = function () {
        var id = conn.getUniqueId();
        var msg = new WebIM.message('img', id);
        var input = document.getElementById('image');               // get image input
        var file = WebIM.utils.getFileUrl(input);                   // convert image to binary file
        var allowType = {
            'jpg': true,
            'gif': true,
            'png': true,
            'bmp': true
        };
        if (file.filetype.toLowerCase() in allowType) {
            console.log('send');
            var option = {
                apiUrl: WebIM.config.apiURL,
                file: file,
                to: 'orange',
                roomType: false,
                chatType: 'singleChat',
                onFileUploadError: function () {
                    console.log('onFileUploadError');
                },
                onFileUploadComplete: function () {
                    console.log('onFileUploadComplete');
                },
                success: function () {
                    console.log('send image succeed');
                },
            };
            msg.set(option);
            conn.send(msg.body);
        }
    };

    // get a list of friends (roster)
    var getRoasters = function () {
        var option = {
            success: function (roster) {
                // roster is list of friends with following format
                /*
                 [
                 {
                 jid:"hyphenatedemo#chatdemoui_test1@hyphenate.io",
                 name:"orange",
                 subscription: "both"
                 // subscription with enum values{both, to, from, none},
                 // both - users added each other as friend
                 // to and from - pending definition
                 // none - if user declined to be friend
                 }
                 ]
                 */
                for (var o in roster) {
                    console.log("jid: ", roster[o].jid);
                    console.log("name: ", roster[o].name);
                    console.log("subscription: ", roster[o].subscription);
                }
            }
        };
        conn.getRoster(option);
    };

    // Add friend
    var addFriends = function () {
        conn.subscribe({
            to: "orange",
            message: "hello orange!"
        });
    };

    // remove friend
    var removeFriends = function () {
        conn.removeRoster({
            to: 'orange',
            success: function () {
                conn.unsubscribed({
                    to: 'orange'
                });
            },
            error: function () {
            }
        });
    };

    // If user A blocks user B, user A can still see user B, but user B is unable to sent message to user A.
    // The structure of a list {username_1: {}, username_2: {} ...}. If you want to add user C to the blacklist already contains user A and B, then pass user A, B, and C to the function.
    // The parameters, jid, username, and subscription, will be obtained during getting contact list. User can obtain list of contact respect to the parameters above. However, do not repeat the parameter, `order`.

    /*
     var list = {
     username_1:{
     jid: 'apiKey_'+username_1+'@hyphenate.io',
     name: username_1,
     subscription: 'both',
     order: 2
     },
     username_2:{
     jid: 'apiKey_'+username_2+'@hyphenate.io',
     name: username_2,
     subscription: 'both',
     order: 3,
     type: 'jid'
     },
     username_3:{
     jid: 'apiKey_'+username_3+'@hyphenate.io',
     name: username_3,
     subscription: 'both',
     order: 4,
     type: 'jid'
     }
     }
     jid, username, subscription均在获取好友列表时已获取到，用户可根据好友列表动态获取这些参数，
     order不重复即可
     */
    var addToBlackList = function () {
        var list = {
            // user_1
            orange: {
                jid: "hyphenatedemo#chatdemoui_orange@hyphenate.io",
                name: "orange",
                subscription: 'both',
                order: 2,
                type: 'jid'
            },
            // user_2
            apple: {
                jid: "hyphenatedemo#chatdemoui_apple@hyphenate.io",
                name: "apple",
                subscription: 'both',
                order: 3,
                type: 'jid'
            }
        };
        conn.addToBlackList({
            list: list,
            type: 'jid',
            success: function () {
                console.log('Add friend to blacklist succeed');
            },
            error: function () {
                console.log('Add friend to blacklist failed');
            }
        });
    }

    // Use the function getBlacklist to get the blacklist. Once completed, expect to receive variable onBlacklistUpdate from callback function conn.listen. Please see [Basic Operations](doc:web-basic-operations) for further details.    var getBlackList = function () {
    conn.getBlacklist();
    };

    // remove user from blacklist
    var removeFromBlackList = function () {
        var list = {};
        conn.removeFromBlackList({
            list: list,
            type: 'jid',
            success: function () {
                console.log('Remove from blacklist success.');
            },
            error: function () {
                console.log('Remove from blacklist error.')
            }
        });
    };


    /*
     Chat Room
     */

    // send text message
    var sendRoomText = function () {
        // leave chat room
        var id = conn.getUniqueId();
        var msg = new WebIM.message('txt', id);
        var option = {
            msg: 'good morning!',                       // message content
            to: '114715680632209992',                   // receiver. chat room ID
            roomType: true,
            chatType: 'chatRoom',
            success: function () {
                console.log('send room text succeed');
            },
            fail: function () {
                console.log('failed');
            }
        };
        msg.set(option);
        msg.setGroup('groupchat');
        conn.send(msg.body);
    };
    // join chat room
    var joinRoom = function () {
        conn.joinChatRoom({
            roomId: "114715680632209992"
        });
    };
    // leave chat room
    var quitRoom = function () {
        conn.quitChatRoom({
            roomId: "114715680632209992"
        });
    };
    // list all the chat rooms with pagination
    var listRooms = function () {
        var option = {
            apiUrl: 'https://api.hyphenate.io',
            pagenum: 1,                                 // page index
            pagesize: 20,                               // number of items on the page
            success: function (list) {
                console.log(list);
            },
            error: function () {
                console.log('List chat room error');
            }
        };
        conn.getChatRooms(option);
    }

    /*
     Group Chat
     */

    // send message
    var sendGroupText = function () {
        var id = conn.getUniqueId();
        var msg = new WebIM.message('txt', id);
        var option = {
            msg: 'good morning!',                       // message content
            to: '1480567165764',                     	// receiver. group id.
            roomType: false,
            chatType: 'chatRoom',
            success: function () {
                console.log('send room text succeed');
            },
            fail: function () {
                console.log('failed');
            }
        };
        msg.set(option);
        msg.setGroup('groupchat');
        conn.send(msg.body);
    };
    // Create a group
    var createGroup = function () {
        var option = {
            subject: 'groupName',                       // group name
            description: 'create a group test',         // group description
            members: ['apple', 'orange'],               // list to user to be added to group
            optionsPublic: true,                        // allow any user to joing
            optionsModerate: false,                     // require permission to join
            optionsMembersOnly: false,                  // require invitation to join
            optionsAllowInvites: false                  // allow member to invite
        };
        conn.createGroup(option);
    }
    // get group info
    var queryGroupInfo = function () {
        conn.queryRoomInfo({
            roomId: '1480747027186',
            // settings
            // members[0] including admin info with following format, {affiliation: "owner", jid: appKey + "_" + username + "@hyphenate.io"}
            // username of jid is admin ID
            // attributes：
            /*
             {
             affiliations: "2",                  // number of all member in group, including admin and owner
             description: "12311231313",         // group description
             maxusers: "200",                    // max number of group member in group
             name: "123",                        // group name
             occupants: "2",                     // number of group members, exclude admin and owner
             owner: "hyphenatedemo#chatdemoui_mengyuanyuan"               // 群主jid
             }
             */
            success: function (settings, members, fields) {
                console.log('settings: ', settings);
                console.log('members: ', members);
                console.log('fields: ', fields);
            },
            error: function () {
                console.log('Error!');
            }
        });
    };
    // group member leaves the group voluntarily
    var leaveGroup = function () {
        var option = {
            to: 'asdfghj',
            roomId: '1480747027186',
            success: function () {
                console.log('You leave room succeed!');
            },
            error: function () {
                console.log('Leave room faild');
            }
        };
        conn.leaveGroupBySelf(option);
    };
    // group member is removed from group and added to blacklist
    var addToGroupBlackList = function () {
        var option = {
            affiliation: "owner",                       // default as owner, cannot be altered
            roomId: "1480756943693",                    // group ID
            success: function () {
                console.log('add to black list succeed');
            },
            to: 'asdfghj'                               // group member's ID to be removed
        };
        conn.addToGroupBlackList(option);
    };
    // get a list of all groups
    var listGroups = function () {
        var option = {
            success: function (rooms) {
                console.log(rooms);
            },
            error: function () {
                console.log('List chat rooms error');
            }
        };
        conn.listRooms(option);
    };
    // update group info
    var changeGroupInfo = function () {
        var option = {
            roomId: '1480756943693',
            subject: 'ChangeTest',
            description: 'Change group information test',
            success: function () {
                console.log("Change Group Names Success!");
            }
        };
        conn.changeGroupSubject(option);
    };
    // get group blacklist
    var getGroupBlackList = function () {
        var option = {
            roomId: '1480758709661',
            success: function (list) {
                console.log('Get group blacklist: ', list);
            },
            error: function () {
                console.log('Get group blacklist error');
            }
        };
        conn.getGroupBlacklist(option);
    };
    // dismiss a group, destroy a group
    var destroyGroup = function () {
        var option = {
            reason: 'Test Destroy Group',
            roomId: '1480840256052',
            success: function () {
                console.log('Destroy group success!');
            }
        };
        conn.destroyGroup(option);
    };
    // add group member
    var addGroupMembers = function () {
        var option = {
            list: ['asdfghj', 'wjy6'],
            roomId: '1480841456167'
        };
        conn.addGroupMembers(option);
    };
    // remove member from blacklist
    var removeFromGroupBlackList = function () {
        var option = {
            roomId: '1480841456167',
            to: 'apple',
            success: function () {
                console.log('Remove from blacklist succeed!');
            }
        };
        conn.removeGroupMemberFromBlacklist(option);
    };

    // get group member info (also for chat room)
    // the response format of the inquery member is {affiliation: 'member', jid: "hyphenatedemo#chatdemoui_wjy6@hyphenate.io"}
    // Note: jid format, user's username is appending after "chatdemoui_" and before "@hyphenate.io", in this case "wjy6"
    var queryRoomMember = function () {
        var member = '';
        conn.queryRoomMember({
            roomId: '114715680632209992',
            success: function (members) {
                for (var o in members) {
                    member = members[o];
                    console.log(member);
                }
            }
        });
    };

    /*
     * WebRTC
     */
    // video call
    var call = function () {
        rtcCall.caller = 'mengyuanyuan';
        rtcCall.makeVideoCall('asdfghj');
    };
    // close or decline call
    var endCall = function () {
        rtcCall.endCall();
    }
    // accept call
    var acceptCall = function () {
        rtcCall.acceptCall();
    }

    // 语音呼叫对方
    var audioCall = function () {
        console.log('Audio Call');
        rtcCall.caller = 'wenke123';
        rtcCall.makeVoiceCall('asdfghj');
    };

    //
    var logout = function () {
//        conn.clear();
        conn.close('logout');
        conn.errorType = WebIM.statusCode.WEBIM_CONNCTION_CLIENT_LOGOUT;


    }

    var reConn = function () {
        //appkey： easemob-demo#vip5
        //xmppURL: 'im-api-vip5.easemob.com',
        //apiURL: (location.protocol === 'https:' ? 'https:' : 'http:') + '//a1-vip5.easemob.com',
        //账号：10vip5/123456 ,11vip5/123456
        options = {
            xmppURL: 'im-api-vip5.easemob.com',
            apiUrl: (location.protocol === 'https:' ? 'https:' : 'http:') + '//a1-vip5.easemob.com',
            appKey: "easemob-demo#vip5",
            user: "10vip5",
            pwd: "123456"
        };
        conn.open(options)

    }

    /**
     * Created by clock on 16-11-30.
     */
    window.onload = function () {
        document.getElementById('register').onclick = register;
        document.getElementById('privateText').onclick = sendPrivateText;
        document.getElementById('privateCmd').onclick = sendPrivateCmd;
        document.getElementById('privateImg').onclick = sendPrivateImg;
        document.getElementById('getBlackList').onclick = getBlackList;
        document.getElementById('addToBlackList').onclick = addToBlackList;
        document.getElementById('removeFromBlackList').onclick = removeBlackList;

        document.getElementById('roomText').onclick = sendRoomText;
        document.getElementById('roomJoin').onclick = joinRoom;
        document.getElementById('roomQuit').onclick = quitRoom;
        document.getElementById('listChatRooms').onclick = listRooms;

        document.getElementById('groupText').onclick = sendGroupText;
        document.getElementById('groupMember').onclick = queryRoomMember;
        document.getElementById('groupCreate').onclick = createGroup;
        document.getElementById('queryGroupInfo').onclick = queryGroupInfo;
        document.getElementById('leaveGroup').onclick = leaveGroup;
        document.getElementById('addToGroupBlackList').onclick = addToGroupBlackList;
        document.getElementById('listGroups').onclick = listGroups;
        document.getElementById('changeGroupInfo').onclick = changeGroupInfo;
        document.getElementById('getGroupBlackList').onclick = getGroupBlackList;
        document.getElementById('destroyGroup').onclick = destroyGroup;
        document.getElementById('addGroupMembers').onclick = addGroupMembers;
        document.getElementById('removeGroupMemberFromBlackList').onclick = removeFromGroupBlackList;

        document.getElementById('getRoasters').onclick = getRoasters;
        document.getElementById('addFriends').onclick = addFriends;
        document.getElementById('removeRoster').onclick = removeFriends;

        document.getElementById('rtCall').onclick = call;
        document.getElementById('rtEndCall').onclick = endCall;
        document.getElementById('rtAcceptCall').onclick = acceptCall;
        document.getElementById('rtAudioCall').onclick = audioCall;

        document.getElementById('logout').onclick = logout;
        document.getElementById('reConn').onclick = reConn;

        // 贴图发送（放到消息模块里）
        document.addEventListener('paste', function (e) {
            if (e.clipboardData && e.clipboardData.types) {
                if (e.clipboardData.items.length > 0) {
                    if (/^image\/\w+$/.test(e.clipboardData.items[0].type)) {
                        var blob = e.clipboardData.items[0].getAsFile();
                        var url = window.URL.createObjectURL(blob);
                        var id = conn.getUniqueId();//生成本地消息id

                        var msg = new WebIM.message('img', id);
                        msg.set({
                            apiUrl: WebIM.config.apiURL,
                            file: {data: blob, url: url},
                            to: 'asdfghj',
                            roomType: false,
                            chatType: 'singleChat',
                            onFileUploadError: function (error) {
                                console.log("Error");
                            },
                            onFileUploadComplete: function (data) {
                                console.log("Complete", data);
                            },
                            success: function (id) {
                                console.log("Success");
                            }
                        });
                        conn.send(msg.body);
                    }
                }
            }
        });

        options = {
            apiUrl: WebIM.config.apiURL,
            user: "zzf2",
            pwd: "z",
            appKey: WebIM.config.appkey
        };
        conn.open(options);
    };
