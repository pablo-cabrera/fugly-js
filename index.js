require('./fugly');

module.exports = {
	// nodejs support
	Template : fugly.Template,

	// express support
	compile : function(stream, context) {
		var template = new fugly.Template(stream);
		var result = template.render(context);
		return function() {
			return result;
		};
	}
};
