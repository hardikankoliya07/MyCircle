$(function () {

    $(document).on('click', '#request', function () {
        $.ajax({
            type: "get",
            async: true,
            url: `/request`,
            success: function (res) {
                $('#request-body').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });

    $(document).on('click', '#accept', function () {
        const reqId = $(this).data('reqid')
        const followingId = $(this).data('followingid')
        const followerId = $(this).data('followerid')
        $.ajax({
            type: 'put',
            async: true,
            url: '/request',
            data: {
                reqId: reqId,
                followingId: followingId,
                followerId: followerId
            },
            success: function (res) {
                $('#request-body').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });

    $(document).on('click', '#reject', function () {
        const reqId = $(this).data('reqid')
        $.ajax({
            type: 'delete',
            async: true,
            url: '/request',
            data: {
                reqId: reqId
            },
            success: function (res) {
                $('#request-body').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });
})