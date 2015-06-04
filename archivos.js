for(name in instance){
        method = instance[name];
        if (typeof method == "function") {//Aregar metodos al objeto
          instance[name] = function(name, method) {
            var evname =name.toLowerCase();//Formato de nombre de Evento
            return function(){
                salida = method.apply(this, arguments);//Aplicar argumentos al metodo               
                return salida;
             
            }(name, method);
          }
        }
      }


<script src="resources/js/jquery.js" type="text/javascript" charset="utf-8"></script>  
 <!--<script src="app/plugins/HolaMundo.js" type="text/javascript"></script>-->
<script src="app/libs/handlebars-v3.0.3.js" type="text/javascript"></script>
<script src="app/libs/underscore.js" type="text/javascript"></script>
<script src="app/libs/backbone.js" type="text/javascript"></script>
<script src="app/plugins/Donec.js" type="text/javascript"></script>