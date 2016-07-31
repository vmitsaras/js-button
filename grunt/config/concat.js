module.exports = {
	js: {
		src: [
			"src/<%= pkg.name %>.js"
		]
	},
	pkgd: {
		src: [
			"bower_components/js-utilities/utils.js",
			"bower_components/js-ripple/dist/_js/js-ripple.js",
			"src/<%= pkg.name %>.js"
		]
	}
};
