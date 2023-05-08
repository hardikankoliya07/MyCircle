$(function () {

    $(document).on('change', '#postImg', function () {
        const file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                $('#imgPost').attr('src', event.target.result);
            };
            reader.readAsDataURL(file);
        };
    });

    function getURL() {
        let url = window.location.search;
        if (url == "") {
            url = "timeline?";
        };
        const filterVal = $('#filterPost').val();
        const sortVal = $('#sortPost').val();
        const searchVal = $('#searchPost').val();
        if (filterVal) {
            url += `&filterPost=${filterVal}`;
        };
        if (sortVal) {
            url += `&sortPost=${sortVal}`;
        };
        if (searchVal) {
            url += `&searchVal=${searchVal}`;
        };
        return url
    };

    $(document).on('change', '#filterPost', function () {
        postOperation();
    });

    $(document).on('change', '#sortPost', function () {
        postOperation();
    });

    $(document).on('keyup', "#searchPost", debounce(function () {
        postOperation();
    }, 300));

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

    function postOperation() {
        $.ajax({
            type: "get",
            async: true,
            url: getURL(),
            success: function (res) {
                $('.filterData').html(res)
            },
            error: function (error) {
                console.log(error);
            }
        });
    };

    $('#postForm').submit(function (e) {
        e.preventDefault();
    }).validate({
        rules: {
            title: {
                required: true,
                minlength: 5,
                maxlength: 30
            },
            desc: {
                required: true,
                minlength: 5,
                maxlength: 300
            },
            postImg: {
                required: true,
                extension: "jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF"
            },
            messages: {
                title: {
                    required: "Please enter your first name",
                    minlength: "Enter minimum 5 characters",
                    maxlength: "Max 30 characters allowed"
                },
                desc: {
                    required: "Please enter your last name",
                    minlength: "Enter minimum 5 characters",
                    maxlength: "Max 300 characters allowed"
                },
                postImg: {
                    required: "select your post image",
                    extension: "Only jpg, jpeg, png, gif Images are allowed."
                }
            }
        },
        submitHandler: function () {
            let formData = new FormData()
            formData.append('title', $("#title").val().trim());
            formData.append('desc', $('#desc').val().trim());
            formData.append('postImg', $('#postImg')[0].files[0])
            $.ajax({
                type: 'post',
                async: true,
                url: '/post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.type == 'success') {
                        notify('success', res.message);
                        $("#addPostModel").modal("hide");
                        $('#addPost').off('click');
                        postOperation()
                    } else {
                        notify('error', res.message);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
    });

    $(document).on('change', '#editPostImg', function () {
        const file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                $('#imgEditPost').attr('src', event.target.result)
            }
            reader.readAsDataURL(file)
        }
    });

    $(document).on("click", '#editPost', function () {
        $.ajax({
            type: 'get',
            async: true,
            url: `/post/getEdit/${$(this).data('postid')} `,
            success: function (res) {
                $("#editTitle").val(res.data.title);
                $("#editDesc").val(res.data.desc);
                $('#imgEditPost').attr('src', `/images/posts/${res.data.postImg}`);
                $('#updatePost').data("post", res.data._id)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    });

    $(document).on('click', '#updatePost', function () {
        let formData = new FormData()
        formData.append('title', $("#editTitle").val().trim());
        formData.append('desc', $('#editDesc').val().trim());
        formData.append('postId', $(this).data('post'));
        formData.append('editPostImg', $('#editPostImg')[0].files[0])
        $.ajax({
            type: 'put',
            async: true,
            url: '/post/',
            data: formData,
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.type == 'success') {
                    notify('success', res.message);
                    $("#editPostModel").modal("hide");
                    postOperation()
                } else {
                    notify('error', res.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    });

    $(document).on('click', "#savedPost", function () {
        const id = $(this).data('postid');
        $.ajax({
            type: 'put',
            async: true,
            url: `/post/${$(this).data('postid')}`,
            success: function (res) {
                if (res.type == 'success') {
                    $("#savedDiv").load(" #savedDiv");
                    notify('success', res.message);
                } else {
                    notify('error', res.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    });

    $(document).on('click', "#archivePost", function () {
        const id = $(this).data('postid');
        $.ajax({
            type: 'put',
            async: true,
            url: "/post/",
            data: {
                postId: $(this).data('postid'),
                archive: $(this).data('archive')
            },
            success: function (res) {
                if (res.type == 'success') {
                    $(`#post-${id}`).parent().remove()
                    notify('success', res.message);
                } else {
                    notify('error', res.message)
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    });

    $(document).on('click', '#like', function () {
        const id = $(this).data('postid');
        $.ajax({
            type: 'put',
            async: true,
            url: `/post?likePostId=${id}`,
            success: function (res) {
                if (res.type == 'success') {
                    notify('success', res.message);
                    postOperation();
                } else {
                    notify('error', res.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $(document).on('click', '.commentIcon', function () {
        const id = $(this).data('postid');
        const postById = $(this).data('postby');
        $("#btnComment").data('postid', id);
        $.ajax({
            type: 'get',
            async: true,
            url: `/post?postId=${id}&postById=${postById}`,
            success: function (res) {
                if (res == "" || res == null) {
                    $("#commentBody").html("No Comment Found");
                } else {
                    $("#commentBody").html(res);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    })

    $(document).on('click', '#commentModal', function () {
        $('#commentArea').val("")
    })

    $(document).on('click', '#btnComment', function () {
        const id = $(this).data('postid');
        const comment = $('#commentArea').val();
        const data = {
            postId: id,
            comment: comment.trim()
        }
        if (data.comment == "" || data.comment == null) {
            notify('error', "Write Comment...");
            return false;
        }
        $.ajax({
            type: 'put',
            async: true,
            url: "/post/",
            data: data,
            success: function (res) {
                $("#commentBody").html(res);
            },
            error: function (err) {
                console.log(err);
            }
        });
    })

    $(document).on('click', '#subCommentBox', function () {
        $(`#comment-${$(this).data('comment')}`).toggle();
    })

    $(document).on('click', '#btnSubComment', function () {
        const _this = this;
        const data = {
            comment: $(this).parent().siblings().children("#subCommentArea").val(),
            parent: $(this).data('comment'),
            postId: $('#btnComment').data('postid')
        }
        if (data.comment == "" || data.comment == null) {
            notify('error', "Write Comment...");
            return false;
        }
        $.ajax({
            type: 'put',
            async: true,
            url: "/post/",
            data: data,
            success: function (res) {
                notify('success', "Comment...");
                $(`#comment-${$(_this).data('comment')}`).toggle();
                $(this).parent().siblings().children("#subCommentArea").val("")
                $("#commentBody").html(res);
            },
            error: function (err) {
                console.log(err);
            }
        });
    })

    $(document).on('click', '#mainComment', function () {
        const maincommentId = $(this).data('maincommentid');
        const postid = $(this).data('postid');
        $.ajax({
            type: 'delete',
            async: true,
            url: `/post?comment=${maincommentId}&postid=${postid}`,
            success: function (res) {
                $("#commentBody").html(res);
            },
            error: function (err) {
                console.log(err);
            }
        });
    })

    $(document).on('click', '#subComment', function () {
        const subcommentid = $(this).data('subcommentid');
        const postid = $(this).data('postid');
        $.ajax({
            type: 'delete',
            async: true,
            url: `/post?comment=${subcommentid}&postid=${postid}`,
            success: function (res) {
                $("#commentBody").html(res);
            },
            error: function (err) {
                console.log(err);
            }
        });
    })

});