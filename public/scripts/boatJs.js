
var boatJs = (function(){


	function init(){
		bindEvents();
	}

	function bindEvents(){
		$(".addBoat").off("click").on("click",addBoat);
	}

	function addBoat(){
		var boat = {};
		boat.name = $(".boatName").val();

		$(".blockElement").block({message:''});
		$.ajax({
			url: '/ekle',
			type:'post',
			contentType:'application/json',
			dataContent: 'json',
			data: JSON.stringfy(boat),
			success:function(response){
				if(response){

					response.ErrCode == 0 ? toastr.success(response.Message, response.Title) : toastr.error(response.Message, response.Title);
				}
			},
			error: function(){
			},
			complete: function(){
				$(".blockElement").unblock();
			}
		});
	}

	return {
		init: init
	}
})();