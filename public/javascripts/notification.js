$(function () {

    $(document).on('click', '#notification', function () {
        $.ajax({
            type: "get",
            async: true,
            url: `/notification`,
            success: function (res) {
                $('#notification-body').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });

    $(document).on('click', '#accept', function () {
        const reqId = $(this).data('reqid')
        $.ajax({
            type: 'put',
            async: true,
            url: '/notification',
            data: {
                reqId: reqId
            },
            success: function (res) {
                console.log(res);
                $('#notification-body').html(res)
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
            url: '/notification',
            data: {
                reqId: reqId
            },
            success: function (res) {
                $('#notification-body').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });

})