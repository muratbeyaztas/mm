var eventJs = (function () {


    function init() {
        bindEvents();
    }

    function bindEvents() {
        

        $('#events-modal').on('shown.bs.modal', function () {
            var eventId = $(".eventContainer").data("id");
            if (eventId) {
                $("#eventSilBtn").attr("href", "/sil/" + eventId);
            }
        });
    }

    return {
        init: init
    }
})();