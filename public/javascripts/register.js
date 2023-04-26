$(document).ready(function () {

    $('#registerForm').validate({
        rules: {
            Rfirst_name: 'required',
            Rlast_name: 'required',
            Rgender: 'required',
            Remail: {
                required: true,
                email: true,
                remote: '/getEmail'
            },
            password: {
                required: true,
                minlength: 8
            },
            confirm_password: {
                required: true,
                minlength: 8,
                equalTo: "#password"
            }
        },
        messages: {
            Rfirst_name: "Please enter your first name",
            Rlast_name: "Please enter your last name",
            Rgender: "select any one option",
            Remail: {
                required: "Please enter a valid email address",
                remote: "That email is already Registered"
            },
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 8 characters long"
            },
            confirm_password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 8 characters long",
                equalTo: "password dose not match"
            }
        },
        submitHandler: function () {
            $.ajax({
                type: "post",
                async: true,
                url: "/register",
                data: {
                    first_name: $('#Rfirst_name').val(),
                    last_name: $('#Rlast_name').val(),
                    email: $('#Remail').val(),
                    gender: $('input[name=Rgender]:checked').val(),
                    password: $('#password').val()
                },
                success: function (res) {
                    if (res.type == 'success') {
                        alert(res.message);
                        window.location.href = '/login'
                    } else {
                        alert(res.message)
                    }
                },
                error: function (error) {
                    alert(error.message)
                },
            });
        }
    })
})