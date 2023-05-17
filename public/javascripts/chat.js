$(function () {

    $(document).on('click', '#userList', function () {
        const uId = $(this).data('uid');
        $.ajax({
            type: 'put',
            url: '/chat',
            async: true,
            data: {
                uId: uId
            },
            success: function (res) {
                $('.chatBox').html(res)
            },
            error: function (error) {
                console.log(error);
            }
        })
    });

    socket.on("message", function (args) {
        $('.messageBox').append(`<div class="card float-left mt-2 ms-2 mb-2" style="margin-right: auto;">
            <div class="card-body">
                <p class="card-text" style="text-overflow: ellipsis; max-width: 50ch; word-wrap:break-word; overflow:hidden;">
                    ${args}
                </p>
            </div>
        </div>`);
    });

    $(document).on('click', '#sendMsg', function () {
        const msg = $('#chatMsg').val();
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
                $('.messageBox').append(`<div class="card float-right me-2 mt-2 mb-2" style="margin-left: auto;">
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