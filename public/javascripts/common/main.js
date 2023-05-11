$(function () {

    $.ajax({
        type: 'get',
        async: true,
        url: `/notificationCount`,
        success: function (res) {
            $('#notification-count').html(`<span>${res.countNotification}</span>`)
        },
        error: function (err) {
            console.log(err);
        }
    });
})