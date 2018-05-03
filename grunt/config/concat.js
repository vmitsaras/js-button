module.exports = {
	js: {
		src: [
			"src/<%= pkg.name %>.js"
		]
	},
	pkgd: {
		src: [
			"node_modules/js-utilities/utils.js",
			"src/<%= pkg.name %>.js"
		]
	}
};
