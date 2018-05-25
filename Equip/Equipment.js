var server = localStorage.getItem('server')
var server = '192.168.1.241:50155'
var isFetching = false
var equipid

function _getDataById(){
	if(!isFetching){
		isFetching = true
		$.ajax({
			type:"get",
			data:{
				nodename:'dyysjz'
			},
			dataType:"json",
			url: "http://" + this.server + "/api/equipment/getequipmentinfo",
			async:true
		}).done((res)=>{
			console.log(res)
			isFetching = false
		}).fail((err)=>{
			console.log(err)
			isFetching = false
		})
	}
}