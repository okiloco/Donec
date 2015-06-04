/*
  Ejemplo de Donec
*/
var debug = false;
/*Objeto sandbox o Delegate, Es el encargado de delegar eventos y funciones a cada uno de los módulos enlazados*/
var Sandbox = function() {
  var listeners = {}, dispatchs={};
  var data={};
  var count_listeners=0;
  var me =this;
  function EventArgs(name,target,data){
    this.name=name;
    this.data=data;
    this.cancelled=false;
    this.removed=false;
    this.target=target;
  };
  EventArgs.prototype={
    cancel:function(){
    },
    remove:function(){
    }
  };

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
    dispatchEvent: function(name,target, args){//Disparar Evento
      dispatchs[name]=args;

      if (typeof listeners == 'undefined' || (!listeners[name]  || typeof listeners[name] == 'undefined')) return;
        for (var x=0; x<listeners[name].length; x++){
           /* evt=new EventArgs(name,target,args);
              return function(){
                salida = method.apply(this, arguments);
              }(name, method);*/

            //listeners[name][x].apply(this, args(evt));
            listeners[name][x].call(this, args);//llamar funcion          
            // listeners[name][x].call(this, evt);//llamar funcion          
              // listeners[name][x].apply(this, listeners[name][x](evt));                
        }
    },
    console:function(msg){
      console.log(msg);
    },
    Ajax:function(arguments){
      
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
    loadDataSource:function(xml_url){

      this.loadData(xml_url);
      this.addEventListener("onLoadData",function(data){
        this.addProperty("ova",data.ova);
      });
    },
    getOva:function(){
      return this.ova;
    },
    getData:function(idValue){
      return this.ova[idValue];
    },
    listeners:listeners,
    dispatchs:dispatchs
  };
};


/*Función autoejecutable Donec.*/
 Donec = function(){

    /*Propieades privadas base*/
    var modules = {}, sandbox = new Sandbox(this);
    var ready=false;
    /*Metodos privados*/
    function createInstance(moduleID,args,component){

      var instance =new ComponentFactory(moduleID,args,component),name, method;
      moduleID=instance.getId();
      if (!debug) {
        
        if(typeof(instance['listeners']) != 'undefined'){
          var listeners=instance['listeners'];
          function fn(name,method){
            return function(){
              out=method.apply(instance, arguments);
              return out;
            }(name,method);
          };
          
          for(var s in listeners){
            instance['sandbox'].addEventListener(s,listeners[s]);
          }
        }

        for (name in instance){
          method = instance[name];
          /*Agregar metodos que vienen de la definición de cada módulo*/
          if (typeof method == "function") {//Aregar metodos al objeto
            
            //console.log("*name: "+name+", method: "+method+", moduleID: "+moduleID);
            instance[name] = function(name, method) {
            // var evname = moduleID + ":" + name;//Formato de nombre de Evento
            var evname =name.toLowerCase();//Formato de nombre de Evento
        
            return function(){
              try {//agreagar puntos de enlace(prev-,after), para los metodos de todos los módulos
        
                /*PROCESO DE CREACiÓN DE EVENTOS,
                Aqui se puede ejecutar odisparar eventos, predeterminados o personalizados para cada módulo,
                por ejemplo, para cada módulo se ejecutaran dos eventos a la espera de ser escuchados,
                para detectar el momento antes de su creación y despues de la creación.
                La forma de acceder o detectar estos eventos sería: "before" seguido de nombredelevento*/
                //console.log('arguments');
                //console.log(arguments);
                instance['sandbox'].dispatchEvent("before" + evname, instance,arguments);//Disparr evento prev: Se ejecuta antes de la ejecución del modulo.
                instance['sandbox'].target=instance;
                /*Agregar listeners del sandobox*/

                salida = method.apply(this, arguments);//Aplicar argumentos al metodo               
                
                instance['sandbox'].dispatchEvent("after" + evname,instance, salida);//Disparar evento post: Se ejecuta despues de la ejecución del modulo.
                
                return salida;
              }catch(ex) {
                if(typeof instance["onerror"] == 'function') instance["onerror"].apply(this, [ex]);
                  console.warn("[Error] " +moduleID +" - "+name + "(): " + ex.message);
                }
              }
            }(name, method);
          }
          /*Agregar propiedades o  funciones por defecto para todos los módulos*/
        }
       
      return instance;
    }
  };//end function
  function ComponentFactory(moduleID,args,component){
    var instance={},
    control=new Sandbox();
    var count='',
    $className=moduleID;
    
    if(modules[moduleID].instance!=null){

      var parent=modules[moduleID].parent; 
      var config=creator(args);
      config=new config();
      var temp=new parent();

      for(var s in config){
        temp[s]=config[s];
      }
      $className=moduleID+'-'+(modules[moduleID].count++);
      define($className,creator(temp));
    }else{
      modules[moduleID].parent=creator(modules[moduleID].creator);
    }

    if(typeof args != 'undefined'){
      
      var parent=modules[moduleID].parent; 
     
      var config=creator(args);
      config=new config(control);
      var temp=new parent(control);

      for(var s in config){
        temp[s]=config[s];
      }
      /*var tp=creator(new parent(control),new creator(args));
      console.log("tp");
      console.log(new tp(control));*/

      modules[$className].creator=function(sandbox){
        temp['sandbox']=control;
        return temp;
      }
    }
    
    instance=modules[$className].creator(control);
    instance['addEventListener']=control.addEventListener;
    instance['dispatchEvent']=control.dispatchEvent;
    instance['removeListener']=control.removeListener;
    instance['$className']=moduleID;
    instance['getId']=function(){
      return  $className;
    };
    instance['getParent']=function(){
        return new modules[moduleID].parent();        
    };
    _.extend(instance,Backbone.Events);//Agregar Eventos de underscore
    return instance;      
  }
  function creator(args,config){
    var instance=args;
    if(typeof args == 'object'){
      instance=function(sandbox){
        return args;
      }
    }

    if(typeof config != 'undefined'){
     var parent=function(){
       var construct=new creator(args)();
       for(var s in construct){
          this[s]=construct[s];
        }
     };
     function child(){
        parent.call(this);
        for(var s in config){
          this[s]=config[s];
        } 
     };
      instance=child;
    }
    return instance;
  }
  function manager(instance){
    var name;
    for(name in instance){
      var method=instance[name];
      if(typeof(method) == 'function'){
        var evname=name.toLowerCase();
        instance[name]=function(name,method){
          return function(self){
              instance['sandbox'].dispatchEvent(evname, instance,arguments);
              salida = method.apply(this, arguments);
              return salida;
          }(name,method);          
        }
      }
      if(typeof(instance['listeners']) != 'undefined'){
        var listeners=instance['listeners'];
        for(var s  in listeners){
          instance['sandbox'].addEventListener(s,listeners[s]);
        }             
      }
    }
    return instance;
  };
  function loadStyle(filename,url_complement){
    url_complement=(url_complement!=undefined)?(url_complement+"/"+filename):filename;

    $("head").append(sandbox.loadjscssfile(url_styles+"/"+url_complement));
  };//end function
  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  /*Agregar Eventos Personalizados*/
  
  function initialize(){
    try{
     
        ready=true;
        console.info("Donec started.");
        _.extend(Donec,Backbone.Events);//Agregar Eventos de underscore
        Donec.on('onReady',function(){
          console.log("Ready!");
          Donec.off('onReady');
        });
        Donec.trigger('onReady',$(this));
        sandbox.dispatchEvent("onReady",$(this));//Disparar evento onReady
      
    }catch(e){
      console.error("[No se encontró Librería Jquery].","Donec necesita cargar previamente JQuery para funcionar correctamente.")
    }
    
  };//end function

  function create(moduleID,args,component) {//Creación de un módulo e inicialización.
    if(typeof(component)!='undefined'){
      component.components[moduleID].instance = createInstance(moduleID,args,component);//se crea la instancia    
      component.components[moduleID].instance.initialize();
    }else{
      modules[moduleID].instance = createInstance(moduleID,args);//se crea la instancia    
      modules[moduleID].instance.initialize();//Se llama el metodo initialize:Que es el constructor del módulo, y se llama para iniciar el módulo
    }
  };//end function
  function define(moduleID, args,component) {//Agrega un nuevo módulo al arreglo de modulos
    /*moduleID: Es el nombre que recibe el módulo, y creator, es una funcion, que le da la funcionalidad del módulo.*/
   if(typeof(component)!='undefined'){
    component.components[moduleID] = {/*Creo un nuevo miembro en el objeto, de módulos, con los valores por defecto:
    creator: Es la funcion, que define al módulo,
    instnce: Es la instancia del módulo, que por defecto es null, ya que aún no ha sido creado, solo agregado al registro.
      */
      count:1,
      creator: creator(args),
      instance: null
    };
   }else{
    modules[moduleID] = {/*Creo un nuevo miembro en el objeto, de módulos, con los valores por defecto:
    creator: Es la funcion, que define al módulo,
    instnce: Es la instancia del módulo, que por defecto es null, ya que aún no ha sido creado, solo agregado al registro.
      */
      count:1,
      creator: creator(args),
      instance: null
    };    
   }
  }
  function View(config){
    
    this.className=config.className;
    this.id=config.id;
    this.tagName=config.tagName;

    var fn=(function(){
      
      var instance={
        initialize : function(){
          this.template = Handlebars.compile( $("#home-template").html() );
        },
        render : function(){
          this.$el.html(this.template());
          $('#main').append(this.$el);
          return this;
        }
      };
      
      try{

        if(this.className==null ||  this.id==null || this.tagName==null){
          throw new Error("Faltan algunas propiedades requeridas por la vista.");
        }
        for(var s in config){
          if(this.hasOwnProperty(s)){
            console.log(s,"is property.");
          }
          instance[s]=config[s];
        }
        return instance;
      }catch(e){
        console.warn("Error [View] ",e.message);
      } 
    }).call(this,arguments[0]);
   
    
      /*initialize : function(){
          this.template = Handlebars.compile( $("#home-template").html() );
        },
        render : function(){
          this.$el.html(this.template({
            columns:[
              {
                text:'Columna 1'
              },
              {
                text:'Columna 2'
              },
            ]
          }));
          $('#main').append(this.$el);
          return this;
        }*/
      return Backbone.View.extend(fn);
    
  }
  //Inicializar el Donec
  // initialize();
  // Método públicos
  return {
      define: define,
      create: create,
      stop: function(moduleID){
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
      stopAll: function() {
        for (var moduleID in modules) {
            if (modules.hasOwnProperty(moduleID)) {
              this.stop(moduleID);
            }
        }
      },
      getModule:function(moduleID){
        return modules[moduleID].instance;
      },
      onReady:function(fn){
        sandbox.addEventListener("onReady",function(){
          if(ready){
           fn.call(this,arguments);  
          }      
        });
      },
      View:View,
      initialize:initialize

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
    initialize: function(){
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
      if(module!=null) console.log(module);
      
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

  var button_next=$("#button_next");
  var button_prev=$("#button_prev");

  var plug= (function () {
   
         //creamos variables o atributos para nuestro plugin  
          var atributoPlugin1 = 'un valor deseado';
     
         //creamos metodos publicos o privados
         var privadoPlugin1 = function(){
             //contenido
         }
     
        return {
            publicolugin1 : function(){
              return 'hola mundo';
            }
        }
     
  }());
  
  // Método privados
  function loadData(xml_url){
    sandbox.loadData(xml_url);
    sandbox.addEventListener("onLoadData",function(data){     
      initializeComponent(data.ova);
    });
  };

    
  return {
    initialize: function(){
      /*create modules*/
        Donec.create("mod_footer");
        Donec.create("mod_header");   
      //sandbox.dispatchEvent("hola-mundo:initialize", this);
      try{

        
        
        //loadData("data/data.xml");
        
        

        //this.setLayout("myLayout");

        /*sandbox.sendAndLoad({
          url:"data/modules.xml",
          callback:function(data){
            console.log("---Este es la respuesta ---");
            console.log(data);
          }
        });*/

        //sandbox.dispatchEvent("beforehola-mundo:initialize", this);
        /*sandbox.addEventListener("afterhola-mundo:initialize",function(){
          console.log("Hola!!");
        });*/
        sandbox.console("---> iniciamos el módulo mod_slide");

          

        // Ejecutamos el evento "mievento"
        //sandbox.dispatchEvent("hola-mundo:mievento", this);       
        //console.log(this);  
        /*sandbox.addEventListener("mievento", function(){
          console.log("Bla bla");
        });
        sandbox.dispatchEvent("mievento", this);*/
        //sandbox.dispatchEvent("beforehola-mundo", this);

      } catch(ex) {
        console.warn("No se ha encontrado sandbox");  
      }
    },
    destroy: function(){
      console.log("Algo")
    },
    console:function (msg) {
      // console
      /*console.log("?"+msg);*/
    },plug:plug
  };
},true);

var mod_footer=new Module("mod_footer",function(sandbox){
  return {
    initialize:function(){
      console.log("iniciamos modulo mod_footer");
    }
  }

});

var mod_header=new Module("mod_header",function(sandbox){
  return {
    initialize:function(){
      console.log("iniciamos modulo mod_header")
      //sandbox.transform model
      sandbox.addEventListener('aftermod_header:render',function(){
        console.log("post render.");
      });
      this.render();
      //module.instance["tag-render"]=sandbox.transform(modules_layouts[i].model);
    },
    render:function(){}
  }

});

Donec.onReady(function(){
  Donec.create('mod_slide',{
    initialize:function(){
      var me=this;
      this.sandbox.addEventListener('beforerender',function(self){
        console.log("ID:: "+me.getId());
      });
      this.render();
    },
    render:function(){}
  });
  Donec.create('mod_slide',function(sandbox){

    return {
      initialize:function(){
        var me=this;
        sandbox.addEventListener('beforedihola',function(e,param1,param2){
          console.log("ID::"+me.getId());
        });
        this.render();
        this.diHola();
      },
      listeners:{
        beforerender:function(e,param1,param2){
        },
        afterrender:function(self){
        }
      },
      render:function(self){},
      diHola:function(){}      
    }
  });
  Donec.create('mod_slide',function(sandbox){
    return {
      initialize:function(){
        var me=this;
        try{
           sandbox.addEventListener('beforerender',function(self){
            console.log('ID:: '+me.getId());
          });
          this.render();
        }catch(e){
          console.log(e.message);
        }
      },
      render:function(){},
      diHola:function(){}      
    }
  });
  Donec.define('mod_test',function(sandbox){
    function View(config){
      var HomeView = Donec.View(config);

      return HomeView;
    }
    return {
      initialize:function(){
        var me=this;
        try{
           sandbox.addEventListener('beforerender',function(self){
            console.log('ID:: '+me.getId());
          });
           me.on('beforerender',function(){
              alert("beforerender with Backbone!");
           });
          this.render();
        }catch(e){
          console.log(e.message);
        }
      },
      render:function(){
      
          //Backbone code - end
          var HomeView=new View({
            id: "hello-world-id", 
            tagName: "div", 
            className: "hello-world", 
            template: null,        
          });

          var test = new HomeView();
         
          test.render();

      },
      diHola:function(){}
    }
  });
  Donec.create('mod_test',function(sandbox){
      return{
        initialize:function(){
          var me=this;
          try{
            this.sandbox.addEventListener('beforerender',function(self){
              console.log('ID:: '+me.getId());
              me.addEventListener('afterrender',function(self){
                console.log('---> ID:: '+me.getId());
              });
            });
            this.render();
          }catch(e){
            console.log(e.message);
          }
        }        
      }
  });

});

//console.log(md1.instance.console("Algo"));
//md1.console("Dime algo!");
//console.log(md1.plug.publicolugin1());

//md1.plugin.console("Dime algo plugin!");
//Donec.create("hola-mundo");
//console.log(md1)
