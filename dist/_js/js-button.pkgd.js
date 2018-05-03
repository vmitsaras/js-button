;(function( window ){
	"use strict";

	var utils = window.utils || {};

	utils.classes = {
		hiddenVisually: "u-hidden-visually",
		modifier: "--",
		isActive: "is-active",
		isClosed: "is-closed",
		isOpen: "is-open",
		isClicked: "is-clicked",
		isAnimating: "is-animating",
		isVisible: "is-visible",
		hidden: "u-hidden"
	};

	utils.keyCodes = {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	};

	utils.a11yclick = function(event) {
		var code = event.charCode || event.keyCode,
			type = event.type;

		if (type === 'click') {
			return true;
		} else if (type === 'keydown') {
			if (code === utils.keyCodes.SPACE || code === utils.keyCodes.ENTER) {
				return true;
			}
		} else {
			return false;
		}
	};

	utils.a11yclickBind = function(el, callback, name) {
		el.on("click." + name + " keydown." + name,function(event){
			if ( utils.a11yclick(event)) {
				event.preventDefault(event);
				if( callback && typeof callback === 'function' ) { callback.call(); }
				el.trigger('clicked.'+name);
			}
		});
	};

	utils.supportTransition = ('transition' in document.documentElement.style) || ('WebkitTransition' in document.documentElement.style);

	utils.whichTransitionEvent = function () {
		var el = document.createElement('fakeelement'),
			transitions = {
				'transition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};

		for (var t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	};

	utils.transEndEventName = utils.whichTransitionEvent();

	utils.onEndTransition = function( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( utils.supportTransition ) {
				if( ev.target != this ) return;
				this.removeEventListener( utils.transEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};
		if( utils.supportTransition ) {
			el.addEventListener( utils.transEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	};

	utils.createModifierClass = function( cl, modifier ){
		return cl + utils.classes.modifier + modifier
	};

	utils.cssModifiers = function( modifiers, cssClasses, baseClass ){
		var arr = modifiers.split(",");
		for(var i=0, l = arr.length; i < l; i++){
			cssClasses.push( utils.createModifierClass(baseClass,arr[i]) );
		}
	};

	utils.getMetaOptions = function( el, name, metadata ){
		var dataAttr = 'data-' + name,
			dataOptionsAttr = dataAttr + '-options',
			attr = el.getAttribute( dataAttr ) || el.getAttribute( dataOptionsAttr );
		try {
			return attr && JSON.parse( attr ) || {};
		} catch ( error ) {
			// log error, do not initialize
			if ( console ) {
				console.error( 'Error parsing ' + dataAttr + ' on ' + el.className + ': ' + error );
			}
			return;
		}
	};

	window.utils = utils;

})(this);


(function( window, $ ){
	"use strict";
	var name = "button",
		componentName = name + "-component",
		utils = window.utils,
		cl = {
			iconOnly: "icon-only",
			withIcon: "icon",
			toggleState: "toggle-state",
			showHide: "visible-on-active"
		};

	window.componentNamespace = window.componentNamespace || {};

	var Button = window.componentNamespace.Button = function( element, options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		this.options = options = options || {};
		this.metadata = utils.getMetaOptions( this.element, name );
		this.options = $.extend( {}, this.defaults, this.metadata, options );
	};

	Button.prototype.init = function(){

		if ( this.$element.data( componentName ) ) {
			return;
		}

		this.$element.data( componentName, this );
		this.hasTitle = !!this.$element.attr( "title" );
		this.$element.trigger( "beforecreate." + name );
		this.isPressed = false;
		this.isExpanded = false;
		this._create();

	};

	Button.prototype._create = function(){
		var options = this.options,
			buttonTextClasses = [options.baseClass + '__text'];

		this._buttonClasses = [options.baseClass];
		if ( options.label === null ) {
			options.label = this.$element.html();
		}

		if ( options.wrapText ) {
			this.$buttonText = $( '<span></span>' ).html( options.label ).appendTo(this.$element.empty());
		}

		if ( options.icon ) {

			this.$buttonIcon = $( "<span class='"+ options.iconFamily +' ' + utils.createModifierClass(options.iconFamily, options.icon)+"'></span>" ).prependTo(this.$element);
			this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.withIcon) );

			if ( options.iconActive ) {
				options.toggle = true;
				this.$buttonIconActive = $( "<span class='"+ options.iconFamily  + ' ' + utils.createModifierClass(options.iconFamily, options.iconActive)+ ' ' +utils.createModifierClass(options.iconFamily, cl.showHide)+ "'></span>" ).insertAfter(this.$buttonIcon);
				this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );
			}
			if ( options.hideText ) {
				buttonTextClasses.push(utils.classes.hiddenVisually );
				this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.iconOnly) );
			}
		}

		if ( options.modifiers ) {
			utils.cssModifiers(options.modifiers,this._buttonClasses,options.baseClass);
		}
		if ( options.wrapText ) {
			this.$buttonText.addClass( buttonTextClasses.join( " " ) );
		}

		if ( options.textActive && options.wrapText ) {
			options.toggle = true;
			buttonTextClasses.push( utils.createModifierClass(options.baseClass+'__text',cl.showHide) );
			this._buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );

			this.$buttonTextActive = $( '<span></span>' )
				.addClass( buttonTextClasses.join( " " ) )
				.html( options.textActive )
				.insertAfter(this.$buttonText);
			this.$element.attr('aria-live','polite');
		}

		this.$element.addClass( this._buttonClasses.join( " " ) );

		if ( options.role) {
			this.$element.attr( "role", options.role );
		}
		if ( options.controls ) {
			this.controls(options.controls);
		}
		if ( options.pressed ) {
			this._isPressed(options.pressed);
		}
		if ( options.expanded ) {
			this.isPressed = true;
			this._isExpanded(options.expanded);
		}
		if ( !this.hasTitle && options.hideText && !options.hideTitle ) {
			this.$element.attr('title',this.$element.text());
		}
		this.$element.trigger( "create." + name );
	};

	Button.prototype._isPressed = function(state){
		this.isPressed = state;
		this.$element.attr( "aria-pressed", state )[ state ? "addClass" : "removeClass" ](utils.classes.isActive);
	};

	Button.prototype._isExpanded = function(state){
		this.isExpanded = state;
		this.$element.attr( "aria-expanded", state )[ state ? "addClass" : "removeClass" ](utils.classes.isActive);
	};

	Button.prototype.controls = function(el){
		this.$element.attr( "aria-controls", el );
	};

	Button.prototype.destroy = function(){
		var options = this.options;

		this.$element
			.removeData(componentName)
			.removeAttr('role')
			.removeAttr('aria-pressed')
			.removeAttr('aria-expanded')
			.removeAttr('aria-controls')
			.removeClass( this._buttonClasses.join( " " ) )
			.removeClass( utils.classes.isActive)
			.off("."+name);
		if ( this.options.icon ) {
			this.$element.find('[class^="'+this.options.iconFamily+'"]').remove();
		}

		if ( options.wrapText ) {
			var btnHtml = this.$buttonText.html();
			this.$element.empty().html(btnHtml);
		}

		this.element = null;
		this.$element = null;
	};

	Button.prototype.defaults = {
		baseClass:"c-button",
		role: "button",
		label: null,
		modifiers: null,
		controls: null,
		textActive: null,
		wrapText: true,
		hideText: false,
		hideTitle: false,
		icon: null,
		iconActive: null,
		iconFamily: "o-icon",
		iconPosition: null,
		pressed: false,
		expanded: false
	};

	Button.defaults = Button.prototype.defaults;

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "jsButton",
		initSelector = ".js-button";

	$.fn[ pluginName ] = function(){
		return this.each( function(){
			new window.componentNamespace.Button( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});
})(this, jQuery);
