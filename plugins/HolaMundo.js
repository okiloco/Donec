(function($){
	$.fn.extend({
		hola:function(opciones){
			var me=this;
			var configuracion=$.extend({
				texto:'sin texto',
				color:null,
				fuente:null,
				estiloFuente:null,
				listeners:null
			}, opciones);
			$.each(configuracion.listeners, function(index, val) {
				$(this).on(index,val);
			});
			return this.each(function(index,val){
				$(this).click(function(event) {
					//$(this).parent().find('.descripcion').modificarTexto(configuracion.texto);
					// $(this).modificarTexto(configuracion.texto);
				});
			});
		},
		modificarTexto:function(texto){
			return this.each(function(index, el) {
				$(this).html(texto);
			});
		}
	});

})(jQuery);