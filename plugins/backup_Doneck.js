/*
  Ejemplo de Donec
*/
var debug = false;
/*Objeto sandbox o Delegate, Es el encargado de delegar eventos y funciones a cada uno de los módulos enlazados*/
var Sandbox = function() {
  var listeners = {};

  return {
    addEventListener: function(name, func){//Agregar un nuevo detector de Eventos
      if (typeof listeners == 'undefined') return;
      if (typeof listeners[name] == 'undefined') listeners[name] = new Array();
      listeners[name].push(func);
    },
    removeListener: function(name, func){//Eliminar detector de Eventos
      if (typeof listeners[name] == 'undefined') return;
      var j = 0;
      while (j < listeners[name].length) {
          if (listeners[name][j] == func) {//Eliminar elemento del Array de Eventos
           listeners[name].splice(j, 1);
          }
          else { 
            j++; 
          }
        }//end while
    },
    dispatchEvent: function(name, args){//Disparar Evento
      // console.log(listeners);
      if (typeof listeners == 'undefined' || (!listeners[name]  || typeof listeners[name] == 'undefined')) return;
        for (var x=0; x<listeners[name].length; x++){
             // console.log(x+": "+listeners[name][x]);
            listeners[name][x].call(this, args);//llamar funcion          
        }
    },
    loadData:function(xml_url){
      
      var $s=this;
      
       $.ajax({
          type: "GET",          
          url: xml_url+"?nocache="+Math.random(),
          dataType: "xml",
          success: function(xml){
            data=xmlToJson(xml);
            //console.log("Cargado con éxito!");  
            $s.dispatchEvent("onLoadData",data);          
          },    
        error: function() {
          alert("An error occurred while processing XML file.");
        }
       });
    },
    sendAndLoad:function(arguments){
      
      /*@Method: sendAndLoad, recibe un parámetro de tipo objeto: arguments
      en el cual requiere dos atributos obligatorios, estos son url y callback, el primero
      es una cadena que representa la ruta URL, donde se realizará el evio de datos HTTP, a través de
      la función ajax de jquery. El segundo parámetro debe ser una funcion, con el nombre de "callback",
      la cual representa la funcion, que se va a realizar al momento de recibir la respuesta del envio.
      Esta función tambíen permite, configurar los atributos básicos de la funcion ajax, como lo es:
      type,url,data,dataType. Example:
      sandbox.sendAndLoad({
          url:"data/modules.xml",
          callback:function(data){
            console.log("---Este es la respuesta ---");
            console.log(data);
          }
      });*/
      
      var $s=this;
      var fun=arguments.callback;
      
      /*console.log(arguments);*/
      try{

        if(arguments.url=="undefined" || arguments.callback=="undefined"){
          throw new Error("Url argument undefined.");
        } 

         $s.removeListener("onSuccess");
         $.ajax({
            type:(arguments.type!="undefined")?arguments.type:"GET",
            url:arguments.url+"?nocache="+Math.random(),
            data:(arguments.data!="undefined")?arguments.data:{},
            dataType: (arguments.dataType!="undefined")?arguments.dataType:"xml",
            success: function(xml){
             data_xml=xmlToJson(xml);
              //console.log("Cargado con éxito!");  
              //console.log($s+", "+callback);
              count_listeners++;
              $s.addEventListener("onSuccess_"+count_listeners,fun,arguments.params);
              $s.dispatchEvent("onSuccess_"+count_listeners,data_xml);
             
            },    
          error: function() {
            alert("An error occurred while processing XML file.");
          }
         });

      }catch(e){
        console.warn(""+e);
      }
    },
    loadjscssfile:function(url){
      
      var filetype=url.substr((~-url.lastIndexOf(".")>>>0)+2);
      var model;
      switch(filetype){
        case "css":
          
          model={
            tag:"link",
            rel:"stylesheet",
            type:"text/css",
            href:"${url}"
          }         

        break;
        case "js":

          model={
            tag:"script",
            language:"JavaScript",
            type:"text/javascript",
            src:"${url}"
          } 
        //<script type="text/javascript" language="JavaScript" src="js/html5.js"></script>  
        break;
        default:

        break;
      }
      
      //$("head").json2html({url:url_template+"/styles/style.css"},css_style);
      return this.transform({url:url},model);
    },
    console:function(msg){
      console.log(msg);
    },
    listeners:listeners
  };
};


/*Función autoejecutable Donec.*/
var Donec = function(){

    /*Propieades privadas base*/
    var ready=false, modules = {}, sandbox = new Sandbox(this);
    var component=function(ID,args){
      var instance=modules[ID].creator(sandbox);
      instance['addEventListener']=sandbox.addEventListener;     
      instance['removeListener']=sandbox.removeListener;     
      instance['dispatchEvent']=sandbox.dispatchEvent;
      instance["getID"]=function(){
        return ID;
      }     

      return instance; 
    }
    /*Metodos privados*/
    function createInstance(moduleID,args){
      // var instance = modules[moduleID].creator(sandbox),name, method;
      var instance = new component(moduleID,args),name, method;
      
      if (!debug) {
          for (name in instance){
            method = instance[name];
            /*Agregar metodos que vienen de la definición de cada módulo*/
            if (typeof method == "function") {//Aregar metodos al objeto
               //console.log("*name: "+name+", method: "+method+", moduleID: "+moduleID);
              instance[name] = function(name, method) {
              var evname = moduleID + ":" + name;//Formato de nombre de Evento
              return function(){
                try {//agreagar puntos de enlace(prev-,post-), para los metodos de todos los módulos
          
                  /*PROCESO DE CREACiÓN DE EVENTOS,
                  Aqui se puede ejecutar odisparar eventos, predeterminados o personalizados para cada módulo,
                  por ejemplo, para cada módulo se ejecutaran dos eventos a la espera de ser escuchados,
                  para detectar el momento antes de su creación y despues de la creación.
                  La forma de acceder o detectar estos eventos sería: "pre-" seguido de nombredelevento*/
                  sandbox.dispatchEvent("pre-" + evname, arguments);//Disparr evento prev: Se ejecuta antes de la ejecución del modulo.
                  salida = method.apply(this, arguments);//Aplicar argumentos al metodo               
                  sandbox.dispatchEvent("post-" + evname, salida);//Disparar evento post: Se ejecuta despues de la ejecución del modulo.
      
                  return salida;
                }catch(ex) {
                  if (typeof instance["onerror"] == 'function') instance["onerror"].apply(this, [ex]);
                  console.warn("[Error]" +moduleID +" - "+name + "(): " + ex.message);
                }
              }
            }(name, method);
          }

          /*Agregar propiedades o  funciones por defecto para todos los módulos*/
          
          //Redefinir comportamiento de instancia
          if(typeof args!='undefined'){
             for(var s in args){
                instance[s]=args[s];
             }
          }          
      }
      
      return instance;
    }
  };//end function

  function loadStyle(filename,url_complement){
    url_complement=(url_complement!=undefined)?(url_complement+"/"+filename):filename;
    $("head").append(sandbox.loadjscssfile(url_styles+"/"+url_complement));
  };//end function

  /*Agregar Eventos Personalizados*/
  sandbox.addEventListener("onReady",function(){
    console.log("Donec Inicializado!");
    ready=true;
  });
  function init(){
    sandbox.dispatchEvent("onReady",this);//Disparar evento onReady
  };//end function

  function create(moduleID,args) {//Creación de un módulo e inicialización.
    modules[moduleID].instance = createInstance(moduleID,args);//se crea la instancia    
    modules[moduleID].instance.init();//Se llama el metodo init:Que es el constructor del módulo, y se llama para iniciar el módulo
    return  modules[moduleID].instance;
  };//end function

  //Inicializar el Donec
  init();

  // Método públicos
  return {
      define: function(moduleID, creator) {//Agrega un nuevo módulo al arreglo de modulos
        if(typeof creator == 'object'){
          var config=creator;
          config['sandbox']=sandbox;
          creator=function(sandbox){
           return config;
          };
        }

        /*moduleID: Es el nombre que recibe el módulo, y creator, es una funcion, que le da la funcionalidad del módulo.*/
        modules[moduleID] = {
        /*Creo un nuevo miembro en el objeto, de módulos, con los valores por defecto:
        creator: Es la funcion, que define al módulo,
        instnce: Es la instancia del módulo, que por defecto es null, ya que aún no ha sido creado, solo agregado al registro.
          */
            creator: creator,
            instance: null
        };
      },
      create: create,
      remove: function(moduleID){
        var data = modules[moduleID];
        if (data.instance) {
            data.instance.destroy();
            data.instance = null;
        }
      },
      startAll: function(){
        for (var moduleID in modules) {
            if (modules.hasOwnProperty(moduleID)) {
              this.create(moduleID);
            }
        }
      },
      removeAll: function() {
        for (var moduleID in modules) {
            if (modules.hasOwnProperty(moduleID)) {
              this.remove(moduleID);
            }
        }
      },
      getModule:function(moduleID){
        return modules[moduleID].instance;
      },
      onReady:function(fn){
        if(ready){
          fn.call(this,fn);
        }
      }
  };
}();



/*
  Ejemplo de Módulo
*/
/*Donec.define("hola-mundo", function(sandbox){
  // Variables privadas
  var priv = "Privada";

  // Método privados
  return {
    init: function(){
      try{
        sandbox.console("iniciamos el módulo");
      } catch(ex) {
        alert("No se ha encontrado sandbox"); 
      }
    },
    destroy: function(){
      // destructor
    }
  };
});*/



var Module=function(moduleID,fn,auto_create){
  auto_create=(auto_create!=undefined)?auto_create:false;
  var instance={}; 
  function createInstance(){
    
    var module={};
    try{
      if(!(typeof(fn)=="function")){
        throw new Error("fn no es una funcion");
      }
      Donec.define(moduleID,fn); 
      //if(auto_create) Donec.create(moduleID);
      
      module=Donec.getModule(moduleID);
      //module.id=moduleID;
      // if(module!=null) return;
      
      /*module.beforeRender(function(){
        console.log("---prev---")
      });

      module.addEventListener("creado",function(){
        console.log("Hola!!");
      });
      module.dispatchEvent("creado");*/

    }catch(e){
      console.warn(""+e);
    }
    return module;
  }
  //console.log(Donec.getModule(moduleID).console("Dime!"));
  instance=createInstance();
  return instance;
}


//var mod=new Module("mod_01");
var mod_slide=new Module("mod_slide", function(sandbox){
  // Variables privadas
  var priv = "Privada";
  var data={};
  var params={};
  var module=this;
  
  // Método privados

    
  return {
    init: function(){
      /*create modules*/
      this.algo();
         
      //sandbox.dispatchEvent("hola-mundo:init", this);
    
        
        
        //loadData("data/data.xml");
        
        

        //this.setLayout("myLayout");

        /*sandbox.sendAndLoad({
          url:"data/modules.xml",
          callback:function(data){
            console.log("---Este es la respuesta ---");
            console.log(data);
          }
        });*/

        //sandbox.dispatchEvent("pre-hola-mundo:init", this);
        /*sandbox.addEventListener("post-hola-mundo:init",function(){
          console.log("Hola!!");
        });*/
        console.log("---> iniciamos el módulo mod_slide");
        Donec.create("mod_footer");
        Donec.create("mod_header");   
        // Ejecutamos el evento "mievento"
        //sandbox.dispatchEvent("hola-mundo:mievento", this);       
        //console.log(this);  
        sandbox.addEventListener("mievento", function(){
          console.log("Bla bla");
        });
        sandbox.dispatchEvent("mievento", this);
        //sandbox.dispatchEvent("pre-hola-mundo", this);

    }
  };
},true);

var mod_footer=new Module("mod_footer",function(sandbox){
  return {
    init:function(){
      console.log("iniciamos modulo mod_footer");
      //sandbox.transform model
      
      
      //$("#"+this.moduleID).html(this["datasource"].value);
      //module.instance["tag-render"]=sandbox.transform(modules_layouts[i].model);
    }
  }

});

var mod_header=new Module("mod_header",function(sandbox){
  return {
    init:function(){
      console.log("iniciamos modulo mod_header")
      //sandbox.transform model
      
      //module.instance["tag-render"]=sandbox.transform(modules_layouts[i].model);
    }
  }

});
//console.log(md1.instance.console("Algo"));
//md1.console("Dime algo!");
//console.log(md1.plug.publicolugin1());
Donec.onReady(function(){
  Donec.define('mod_test',{

      init:function(){
        var me=this;
        me.addEventListener('pre-mod_test:algo',function(self){
          alert("before algo!");
        });
        me.addEventListener('post-mod_test:algo',function(self){
          alert("after algo!");
        });  
        console.log(this.sandbox);
        me.algo();   
      },
      algo:function(){
        
        //this.sandbox.dispatchEvent('post-mod_test:algo',this);
      }       
  });
  var m=Donec.create("mod_test",{
    extend:'grilla',
    init:function(){
      var me=this;
      
        me.addEventListener('pre-mod_test:algo',function(self){
          alert("before algo!");
        });
        me.addEventListener('post-mod_test:algo',function(self){
          alert("after algo!");
        });  
        me.algo();
      // console.log(this.getID());
    },
    algo:function(){}
  });
});
