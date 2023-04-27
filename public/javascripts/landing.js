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

    $(document).on('keyup', "#unAuthSearchPost", debounce(function () {
        postOperation(getURL())
    }, 300))

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

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