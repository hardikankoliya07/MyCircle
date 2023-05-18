$(function () {

    $(document).on('click', '.userList', function () {
        const uId = $(this).data('uid');
        $(`#seen-${uId}`).remove();
        $.ajax({
            type: 'put',
            url: '/chat',
            async: true,
            data: {
                uId: uId
            },
            success: function (res) {
                $('.chatBox').html(res);
                $("#chatMsg").focus();
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

    socket.on("message", function (args) {
        const uId = $('.userList').data('uid');
        const boxId = $('.chatBox').children().attr('id');
        if (uId == boxId) {
            $('.messageBox').prepend(`<div class="card float-left mt-2 ms-2 mb-2" style="margin-right: auto;">
                <div class="card-body">
                    <p class="card-text" style="text-overflow: ellipsis; max-width: 50ch; word-wrap:break-word; overflow:hidden;">
                        ${args.message}
                    </p>
                </div>
            </div>`);
        } else {
            let count = 0 | Number($(`#seen-${args.sendBy}`).text())
            count++;
            $(`#isSeen-${args.sendBy}`).html(`<span id=seen-${args.sendBy} class="badge bg-red">${count}</span>`);
        }
    });

    $(document).on('keyup', "#chatMsg", function (event) {
        if (event.keyCode === 13) {
            $("#sendMsg").click();
        }
    });

    $(document).on('keyup', "#searchChatUser", function () {
        $.ajax({
            type: "get",
            async: true,
            url: `/chat?searchUser=${$(this).val()}`,
            success: function (res) {
                let data = $(res).find(".filterUser > *");
                $('.filterUser').html(data)
            },
            error: function (error) {
                console.log(error)
            }
        })
    });

    $(document).on('click', '#sendMsg', function () {
        const msg = $('#chatMsg').val().trim();
        if (msg == "" || msg == null) {
            notify('error', 'write something...');
            return;
        }
        const uId = $(this).data('uid');
        $.ajax({
            type: 'post',
            url: '/chat',
            async: true,
            data: {
                msg: msg,
                uId: uId
            },
            success: function (res) {
                $('#chatMsg').val("");
                $('.messageBox').prepend(`<div class="card float-right me-2 mt-2 mb-2" style="margin-left: auto;">
                <div class="card-body">
                <p class="card-text" style="text-overflow: ellipsis; max-width: 50ch; word-wrap:break-word; overflow:hidden;">
                ${res.data.message}
                </p>
                </div>
                </div>`);
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

});