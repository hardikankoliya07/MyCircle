$(function () {

    function closeModal() {
        $("#staticBackdrop").modal("hide");
    };

    $(document).on("click", '#profile', function () {
        $.ajax({
            type: 'get',
            async: true,
            url: "/user/getData",
            success: function (res) {
                $("#first_name").val(res.data.first_name);
                $("#last_name").val(res.data.last_name);
                $("#email").val(res.data.email);
                $(`[name='gender'][value='${res.data.gender}']`).prop('checked', true)
                $(`[name='account_status'][value='${res.data.account_status}']`).prop('checked', true)
            },
            error: function (error) {
                alert(error.message)
            }
        })
    });

    $(document).on('change', '#profilePic', function () {
        const file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                $('#userProf').attr('src', event.target.result)
            }
            reader.readAsDataURL(file)
        } else {
            alert("Something when wrong")
        }
    });

    $('#editProf').submit(function (e) {
        e.preventDefault();
    }).validate({
        rules: {
            first_name: {
                required: true
            },
            last_name: {
                required: true
            },
            gender: {
                required: true
            },
            account_status: {
                required: true
            },
            email: {
                required: true,
                email: true,
            },
            profile: {
                extension: "jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF"
            },
            messages: {
                first_name: "Please enter your first name",
                last_name: "Please enter your last name",
                gender: "select any one option",
                account_status: "select any one option",
                email: {
                    required: "Please enter a valid email address"
                },
                profile: {
                    extension: "Only jpg, jpeg, png, gif Images are allowed."
                }
            }
        },
        submitHandler: function () {
            let formData = new FormData()
            formData.append('first_name', $("#first_name").val().trim());
            formData.append('last_name', $('#last_name').val().trim());
            formData.append('email', $('#email').val().trim())
            formData.append('gender', $("[name=gender]:checked").val())
            formData.append('account_status', $("[name=account_status]:checked").val())
            formData.append('profile', $('#profilePic')[0].files[0])
            $.ajax({
                type: 'put',
                async: true,
                url: './user/',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.type == 'success') {
                        closeModal();
                        toastr.success(res.message);
                    } else {
                        toastr.error(res.message);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
    });

    $(document).on('keyup', "#searchUser", function () {
        $.ajax({
            type: "get",
            async: true,
            url: `/user/?searchUser=${$(this).val()}`,
            success: function (res) {
                $('.filterUser').html(res)
            },
            error: function (error) {
                alert(error)
            }
        })
    });

    $(document).on("click", '#logout', function () {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "get",
                    async: true,
                    url: "/logout",
                    success: function (res) {
                        Swal.fire(
                            'Logout!',
                            'Your are logout.',
                            'success'
                        ).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload()
                            }
                        })
                    },
                    error: function (error) {
                        alert(error)
                    }
                })
            }
        })
    });


    $(document).on('click', '.btn-follow', function () {
        const userId = $(this).data('userid');
        $.ajax({
            type: 'post',
            async: true,
            url: `/user?userid=${userId}`,
            success: function (res) {
                $('#userList').html(res)
            },
            error: function (error) {
                console.log(error.message);
            }
        })
    })

})