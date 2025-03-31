Parallax = function(){}

Parallax.prototype = {
	lastScrollY:0 ,
	ticking:false,
	parallaxElements: [],

	//
	//	Initiate
	//
	init: function() {
		var p = this
		parallaxElements = [] // reset
		ticking=false
		lastScrollY=0

		this.sceneSetup()
		//
		//	Get all the parallax enabled objects
		//
		var allElements = document.getElementsByTagName("*");
		for (var i=0; i < allElements.length; i++) {
			var obj = allElements[i]
			if (obj.dataset.parallax) {
				obj.parallax({})
				p.parallaxElements.push(obj)
			//	p.magic(obj)
			}
		}
		//
		//	Set the scroll listener
		//
		var frame = window.requestAnimationFrame,
			lastPos = -1,
			length = p.parallaxElements.length
		function onFrameUpdate() {
			if (lastPos == window.pageYOffset) {
				frame(onFrameUpdate)
				return false
			} else lastPos = window.pageYOffset

			for (var i=0; i < length; i++) {
				var obj = p.parallaxElements[i]
				p.magic(obj)
			}
			p.ticking=false;

			//frame(onFrameUpdate)
		}
	//	onFrameUpdate()

		// window.addEventListener("scroll", function() {
		// 	var length = p.parallaxElements.length
		// 	for (var i=0; i < length; i++) {
		// 		var obj = p.parallaxElements[i]
		// 		p.magic(obj)
		// 	}
		// });
		window.addEventListener('scroll', onScroll, false);
		function onScroll(){

			p.lastScrollY = window.scrollY
			if(!p.ticking) {
				frame(onFrameUpdate)
				 p.ticking = true;
		 }
		}

	},

	//
	//	Set the scene
	//
	sceneSetup: function() {
		console.log("Set the scene");
		var allScenes = document.getElementsByClassName("scene");
		for (var i=0; i < allScenes.length; i++) {
			var scene = allScenes[i]
			scene.style.height = "100vh"
			scene.style.width = "100vw"
		}
	},

	//
	//	Get the magic started
	//
	magic: function(obj) {
		var p = this;
		obj.style.transform = "translateZ(0) " // Attempt at enabling hardware accelleration

		var parent = obj.parentElement
		var relativeLocation = -parent.getBoundingClientRect().top

		var tx = 0
		var ty = 0
		var tz = 0

		//
		// X path calculation
		//
		if (obj.dataset.startX && obj.dataset.endX) {
			var startX = obj.dataset.startX
			var endX   = obj.dataset.endX
			var value = p.modulate(relativeLocation, [0, parent.clientHeight], [p.convertPosition(startX, parent.clientWidth), p.convertPosition(endX, parent.clientWidth)], p.getLimiter(obj))

			if (obj.dataset.midX) {
				value -= p.convertMidpoint(obj.dataset.midX, obj.clientWidth)
			}

			tx = value
		}

		//
		// Y path calculation
		//
		if (obj.dataset.startY && obj.dataset.endY) {
			var startY = obj.dataset.startY
			var endY   = obj.dataset.endY
			var value = p.modulate(relativeLocation, [0, parent.clientHeight], [p.convertPosition(startY, parent.clientHeight), p.convertPosition(endY, parent.clientHeight)], p.getLimiter(obj))

			if (obj.dataset.midY) {
				value -= p.convertMidpoint(obj.dataset.midY, obj.clientHeight)
			}

			ty = value
		}

		//
		//	Scale calculation
		//	TODO: This doesn't work currently :\
		//
		if (obj.dataset.scaleStart && obj.dataset.scaleEnd) {
			var startS = obj.dataset.scaleStart
			var endS   = obj.dataset.scaleEnd
			var value = p.modulate(relativeLocation, [0, parent.clientHeight], [startS, endS], true) // TODO: Fix this because for some reason it's broken...
			obj.style.transform += "scale("+value+") "
		}

		//
		// TODO: Rotation calculation
		//

		//
		//	Put it all together
		//
		obj.style.transform = p.configureTransforms(tx, ty, tz)
	},
	//
	//	Utilities
	//
	modulate: function(value, rangeA, rangeB, limit) {
		var fromLow = rangeA[0]
		var fromHigh = rangeA[1]
		var toLow = rangeB[0]
		var toHigh = rangeB[1]
		var result = toLow + (((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow))

		if (limit == true) {
			if (toLow < toHigh) {
				if (result < toLow) { return toLow; }
				if (result > toHigh) { return toHigh; }
			} else {
				if (result > toLow) { return toLow; }
				if (result < toHigh) { return toHigh; }
			}
		}
		return result
	},
	convertPosition: function(input, max) {
		return (input*max)
	},
	convertMidpoint: function(midpoint, size) {
		return midpoint*size
	},
	getLimiter: function (obj) {
		return obj.dataset.limit == "true" ? true : false
	},
	configureTransforms: function(tx, ty, tz) {
		var translate3d = "translate3d("+tx+"px, "+ty+"px, "+tz+"px)"
		return translate3d
	},
}

Element.prototype.parallax = function(properties) {

	d = this.dataset;

	d.parallax	= "true";
	d.startX	= properties.startX		|| d.startX		|| 0;
	d.endX 		= properties.endX		|| d.endX		|| 0;
	d.startY	= properties.startY		|| d.startY		|| 0;
	d.endY 		= properties.endY		|| d.endY		|| 0;
	d.limit		= properties.limit		|| d.limit		|| false;
	d.midX		= properties.midX		|| d.midX		|| 0;
	d.midY		= properties.midY		|| d.midY		|| 0;
	d.rotation	= properties.rotation	|| d.rotation	|| 0;

	this.style.position = "absolute"
}
