$(function () {
    $(document).on('click', '#notification-icon', function () {
        const userId = $(this).data('user');
        $.ajax({
            type: 'get',
            async: true,
            url: `/notification?userId=${userId}`,
            success: function (res) {
                $('#notification-body').html(res)
            },
            error: function (err) {
                console.log(err);
            }
        });
    })
})