$(document).ready(function () {
    function getURL() {
        let url = "/?";
        const sortVal = $('#unAuthSortPost').val()
        const searchVal = $('#unAuthSearchPost').val()
        if (sortVal) {
            url += `sortPost=${sortVal}&`
        }
        if (searchVal) {
            url += `searchVal=${searchVal}&`
        }
        return url
    }

    $(document).on('change', '#unAuthSortPost', function () {
        postOperation(getURL())
    });

    $(document).on('keyup', "#unAuthSearchPost", function () {
        postOperation(getURL())
    })

    function postOperation(url) {
        console.log(url);
        $.ajax({
            type: "get",
            async: true,
            url: url,
            success: function (res) {
                $('.filterData').html(res)
            },
            error: function (error) {
                alert(error)
            }
        })
    }
})