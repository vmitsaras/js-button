/* global jQuery:true */

(function( w, $ ){
	"use strict";
	var name = "button",
		componentName = name + "-component",
		utils = w.utils,
		cl = {
			iconOnly: "icon-only",
			withIcon: "icon",
			toggleState: "toggle-state",
			showHide: "visible-on-active"
		};

	w.componentNamespace = w.componentNamespace || {};

	var Button = w.componentNamespace.Button = function( element, options ){
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
		this._create();

	};

	Button.prototype._create = function(){
		var options = this.options,
			buttonClasses = [options.baseClass],
			buttonTextClasses = [options.baseClass + '__text'];

		if ( options.label === null ) {
			options.label = this.$element.html();
		}

		this.$buttonText = $( '<span></span>' ).html( options.label ).appendTo(this.$element.empty());

		if ( options.icon ) {

			this.$buttonIcon = $( "<span class='"+ options.iconFamily +' ' + utils.createModifierClass(options.iconFamily, options.icon)+"'></span>" ).prependTo(this.$element);
			buttonClasses.push( utils.createModifierClass(options.baseClass,cl.withIcon) );

			if ( options.iconActive ) {
				options.toggle = true;
				this.$buttonIconActive = $( "<span class='"+ options.iconFamily  + ' ' + utils.createModifierClass(options.iconFamily, options.iconActive)+ ' ' +utils.createModifierClass(options.iconFamily, cl.showHide)+ "'></span>" ).insertAfter(this.$buttonIcon);
				buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );
			}
			if ( options.hideText ) {
				buttonTextClasses.push(utils.classes.hiddenVisually );
				buttonClasses.push( utils.createModifierClass(options.baseClass,cl.iconOnly) );
			}
		}

		if ( options.modifiers ) {
			utils.cssModifiers(options.modifiers,buttonClasses,options.baseClass);
		}

		this.$buttonText.addClass( buttonTextClasses.join( " " ) );

		if ( options.textActive ) {
			options.toggle = true;
			buttonTextClasses.push( utils.createModifierClass(options.baseClass+'__text',cl.showHide) );
			buttonClasses.push( utils.createModifierClass(options.baseClass,cl.toggleState) );

			this.$buttonTextActive = $( '<span></span>' )
				.addClass( buttonTextClasses.join( " " ) )
				.html( options.textActive )
				.insertAfter(this.$buttonText);
			this.$element.attr('aria-live','polite');
		}

		this.$element.addClass( buttonClasses.join( " " ) );

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
		if ( options.ripple && w.componentNamespace.Ripple ) {
			new w.componentNamespace.Ripple( this.element ).init();
		}
		this.$element.trigger( "create." + name );
	};

	Button.prototype._isPressed = function(state){
		this.isPressed = state;
		this.$element.attr( "aria-pressed", state )[ state ? "addClass" : "removeClass" ](utils.classes.isActive);
	};

	Button.prototype._isExpanded = function(state){
		this._isPressed(state);
		this.$element.attr( "aria-expanded", state );
	};

	Button.prototype.controls = function(el){
		this.$element.attr( "aria-controls", el );
	};

	Button.prototype.defaults = {
		baseClass:"c-button",
		role: "button",
		label: null,
		modifiers: null,
		controls: null,
		textActive: null,
		hideText: false,
		hideTitle: false,
		icon: null,
		iconActive: null,
		iconFamily: "o-icon",
		iconPosition: null,
		pressed: false,
		expanded: false,
		ripple: false
	};

	Button.defaults = Button.prototype.defaults;

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "jsButton",
		initSelector = ".js-button";

	$.fn[ pluginName ] = function(){
		return this.each( function(){
			new w.componentNamespace.Button( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});
})(this, jQuery);
