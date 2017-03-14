var userJs = (function($) {

    function init() {
        bindEvents();
    }

    function bindEvents() {
        $(".addUser").off("click").on("click", addUser);
        $(".modal-user").on('show.bs.modal', afterUserOpenModal);
        $(".modal-user-permissions").on('show.bs.modal', afterUserPermissionOpenModal);
        $(".model-update").off("click").on("click", updateUser);
        $(".deleteUser").off("click").on("click", deleteUser);
    }

    function afterUserOpenModal(e) {
        var user = JSON.parse($(e.relatedTarget).attr("data-user"));
        $(".modal-username").val(user.username);
        $(".modal-password").val(user.password);
        $(".modal-userid").val(user.userid);
    }

    function afterUserPermissionOpenModal(e) {
        var user = JSON.parse($(e.relatedTarget).attr("data-user"));
        // $(".userpermission-userid").html(user.userid);
        $(".userpermission-username").html(user.username + " kullanıcısının yetkileri");
        getUserPermission(user.userid);
    }

    function addUser() {
        var newUser = {
            username: $(".username").val(),
            password: $(".password").val()
        };

        if (!validateNewUser(newUser)) {
            toastr.warning("Kullanıcı adı ya da şifre boş.", "Uyarı!");
            return;
        }

        $(".addUserBlock").block({ message: '' });
        $.ajax({
            url: '/Kullanici/Ekle',
            type: 'post',
            data: newUser,
            success: function(response) {
                if (!response) {
                    toastr.warning("Kullanıcı eklenemedi.", "UYARI!");
                    return;
                } else {
                    if (response.resultCode === 0) {
                        toastr.success(response.message, "BAŞARILI!");
                        setTimeout(function() { window.location.reload(); }, 1000);
                    } else {
                        toastr.info(response.message, "BİLGİ!");
                    }
                }
            },
            error: function() {
                toastr.error(JSON.stringify(arguments), "HATA!");
            },
            complete: function() {
                $(".addUserBlock").unblock();
            }
        })
    }

    function validateNewUser(user) {
        return user && user.username && user.password;
    }

    function validateUpdateUser(user) {
        return user && user.userid && user.username && user.password;
    }

    function deleteUser() {
        var userid = $(this).parents("tr").attr("data-id");
        if (!userid) {
            toastr.warning("KullınıcId boş", "UYARI!");
            return;
        }

        $.ajax({
            url: '/Kullanici/Sil',
            type: 'post',
            data: { userid: userid },
            success: function(response) {
                if (!response) {
                    toastr.warning("Kullanıcı silinemedi.", "UYARI!");
                } else {
                    if (response.resultCode === 0) {
                        toastr.success("Kullanıcı başarıyla silindi.", "BAŞARILI");
                        window.location.reload();
                    } else {
                        toastr.info(response.message, "BİLGİ!");
                    }
                }
            },
            error: function() { toastr.error(JSON.stringify(arguments), "HATA!"); }
        })
    }

    function updateUser() {

        var updateUser = {
            userid: $(".modal-userid").val(),
            username: $(".modal-username").val(),
            password: $(".modal-password").val()
        };

        if (!validateUpdateUser(updateUser)) {
            toastr.warning("Kullanıcı adı ve şifre alanını boş bırakmayınız.", "UYARI!");
            return;
        }

        $(".modal-user").block({ message: '' });
        $.ajax({
            url: '/Kullanici/Guncelle',
            type: 'post',
            data: updateUser,
            success: function(response) {
                if (!response) {
                    toastr.warning("Kullanıcı güncellenemedi.", "UYARI!");
                    return;
                } else {
                    if (response.resultCode === 0) {
                        toastr.success(response.message, "BAŞARILI!");
                        setTimeout(function() { window.location.reload(); }, 1000);
                    } else {
                        toastr.info(response.message, "BİLGİ!");
                    }
                }
            },
            error: function() {
                toastr.error(JSON.stringify(arguments), "UYARI!")
                return;
            },
            complete: function() {
                $(".modal-user").unblock();
            }
        });
    }

    function getUserPermission(userid) {

        if (userid) {

            $(".modal-user-permissions").block({ message: '' });
            var url = "".concat("/Kullanici/izinler/", userid);
            $(".userPermissionBody").empty();

            $.ajax({
                url: url,
                type: 'get',
                success: function(response) {
                    $(".userPermissionBody").append(response);
                },
                error: function() {
                    toastr.error(JSON.stringify(arguments));
                },
                complete: function() {
                    $(".modal-user-permissions").unblock();
                }
            });
        }
    }

    return {
        init: init
    }
})($);