var eventJs = (function() {

    function init() {
        bindEvents();
    }

    function bindEvents() {

        $('body').on('shown.bs.modal', onModalOpen);
        $('body').on("click", "#eventUpdate", updateEvent);
    }

    function updateEvent() {
        var eventId = $(this).data("id");
        var event = {};
        event.id = $(this).data("id");
        event.boatId = $("#selectedBoat").val();
        event.subject = $("#subject").val();
        event.description = $("#description").val();
        event.startDate = $("#startDateTime").val();
        event.startTime = $("#startTime").val().split("-")[0].replace(/\s/g, '');
        event.endTime = $("#startTime").val().split("-")[1].replace(/\s/g, '');
        event.personCount = $("#personCount").val();
        event.startLocation = $("#startLocation").val().split("-")[0].replace(/\s/g, '');
        event.endLocation = $("#startLocation").val().split("-")[1].replace(/\s/g, '');
        event.fee = $("#fee").val();
        event.sell = $("#sell").val();
        event.earnestMoney = $("#earnestMoney").val();
        event.moneyType1 = $("#moneyType1").val();
        event.moneyType2 = $("#moneyType2").val();
        event.moneyType3 = $("#moneyType3").val();
        event.hasDinner = $("#hasDinner").val();

        toastr.options = {
            "positionClass": "toast-top-center",
            "timeOut": "1000"
        };

        $.ajax({
            url: '/update',
            method: 'post',
            data: event,
            success: function(response) {                
                toastr.success("Event başarıyla güncellendi.", "BAŞARILI!");
                shuldRefreshPage();
            },
            error: function() {
                toastr.error("Event güncellenirken server tarafında hata alındı.", "HATA!");
            },
            complete: function() {}

        });

        //console.log(event);
    }


    function onModalOpen() {
        getCurrentValues();
    }

    function shuldRefreshPage() {
        var newDatetime = $("#startDateTime").val();
        var newSubject = $("#subject").val();
        if (currentValues.startDate !== newDatetime || currentValues.subject !== newSubject) {
            window.location.reload();
        }
    }

    var currentValues = {};

    function getCurrentValues() {
        currentValues.startDate = $("#startDateTime").val();
        currentValues.subject = $("#subject").val();
    }

    return {
        init: init
    }
})();


