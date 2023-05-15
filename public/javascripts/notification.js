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
    });

    $(document).on('click', '.list-group-item', function () {
        const id = $(this).data('id');
        const postId = $(this).data('postid');
        $.ajax({
            type: 'put',
            url: `/notification?id=${id}&postId=${postId}`,
            async: true,
            success: function (res) {
                $(`#notification-${res.id}`).remove();
                window.location.href = `/post?postId=${res.postId}`
            },
            error: function (err) {

            }
        })
    })
})