

module.exports = function(loader, $paths){
	console.log("================= loader paths");
	loader.setPath([
		$paths.root('modules'),
		$paths.app('modules')
	]);
	console.log("================= loader paths upddated");
}