
module.exports = function(http){
	http.get("/", function(req,res){
		res.render("index");
	});

}
