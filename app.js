
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side,this.time=arg.time, this.from=arg.from;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                 $message.find('.time').html(_this.time);
                 $message.find('.from').html(_this.from);
                 $message.find('.avatar').addClass(_this.from);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };

        var getMessageText, message_side, sendMessage;
        message_side = 'left';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            message_side = 'right';
            return $message_input.val();
        };
        sendMessage = function (text,time,from) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');

            message = new Message({
                text: text,
                time:time,
                from:from,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        $('.send_message').click(function (e) {

             message_side = 'left';
                val = getMessageText()
                send(to,val);
                d = new Date();
                time = d.toLocaleString();
                var message={
                    'data':val,
                    'time':time,
                    'from':user
                }
                callRestaurants(message)
            return sendMessage(val,time,user);


        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                message_side = 'left';
                val = getMessageText()
                send(to,val);
                d = new Date();
                time = d.toLocaleString();
                var message={
                    'data':val,
                    'time':time,
                    'from':user
                }
                callRestaurants(message)
                return sendMessage(val,time,user);

            }
        });





$('body').on('click','.person.single',function(){
    to=$(this).attr("id");
     $(".title-groups").hide();
    id=$(this).attr("mid");
    send=sendPrivateText
    $(".show_messages").show();
    $(".show_message_list").hide();
     $('.messages').html('');
     var message = messages[parseInt(id)]
    for (var i in message.msg){
         sendMessage(message.msg[i],message.time[i],message.from[i]);
    }


});


$(".title-groups span").on("click",function(){
    $(".title-groups span").removeClass("active");
    $(this).addClass("active");
    $(".show").hide();
    $("."+$(this).attr("id")).show();
})


function showRestaurants(result){
     $('.restaurants').html("");
     $(".count").html("");
     setTimeout(function () {
                    return  $(".count").html("<small>("+result.total+")</small>");
                }, 500);
    for(var index in result.places){
        var $message;
        i =result.places[index]
        $message = $($('.restaurant_template').clone().html());
        $message.attr("id",index)
        $message.find('.image').attr("src",i.image_url);
        $message.find('.name').html(i.name);
        $message.find('.rating').attr("src",i.rating_img_url);
        $message.find('.reviews').html(i.review_count+" reviews");
        if(i.votes.length>0)
            $message.find('.vote-count').html(i.votes.length).prop('title',i.votes.join(" , "));
        if(i.votes.length>=3){
            $message.find('.book').html('<button data-toggle="modal" data-target="#myModal" class="btn btn-success btn-sm">Reserve Now</button>')
        d = new Date();
        time = d.toLocaleString();

        var message={
                    'data':"Seems like the majority has voted for "+i.name+". Want to reserve it?",
                    'time':time,
                    'from':'Arby'
                }
        group_messages[id].msg.push(message.data);
        group_messages[id].time.push(message.time);
        group_messages[id].from.push(message.from);
        $('#'+to).trigger("click");

        }


        for (var m in i.category){
            $message.find('.category').append('<span class="label label-primary">'+i.category[m][0]+'</span>');
        }
        $('.restaurants').append($message);
    }

}

$("body").on("click",".Arby",function(){
    $('#myModal').modal('show');

})

$("body").on("click",".votes",function(){
   data={
    "group_id" : to,
    "user_id" : user,
    "place_id" : $(this).parent().attr("id")
};

    $.ajax({
      url:url,
      type:"POST",
      data:JSON.stringify(data),
      contentType:"application/json",
      dataType:"json",
      error: function(result1){
        console.log(result1);
         $.ajax({url: "https://ketch-up.herokuapp.com/suggestions/"+data.group_id, success: function(result){
               showRestaurants(result);
        }});
      },
      success:function(result1){
        console.log(result1);
         $.ajax({url: "https://ketch-up.herokuapp.com/suggestions/"+data.group_id, success: function(result){
               showRestaurants(result);
        }});
      }
    })


})



$('body').on('click','.person.groupperson',function(){
    to=$(this).attr("id");
    id=$(this).attr("mid");
    $(".title-groups").show();
    send=sendGroupText
    $(".show_messages").show();
    $(".show_message_list").hide();
    $('.messages').html('');
    var message = group_messages[parseInt(id)]
    for (var i in message.msg){
        if(message.from[i]==user)
            message_side ='right';
         else
             message_side ='left';
         sendMessage(message.msg[i],message.time[i],message.from[i]);
    }



});

$(".buttons").on('click',function(){
    $(".show").hide();
     $(".title-groups").hide();
    $(".show_message_list").show();
})




