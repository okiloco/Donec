requirejs.config({
    // enforceDefine: true,
  //By default load any module IDs from js/lib
    baseUrl: 'app',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        'jquery': 'libs/jquery',
        'underscore':'libs/underscore',
        'Handlebars':'libs/handlebars',
        'Backbone':'libs/backbone',
        'Donec':'Donec',
    },
    shim: {
        jquery: {
          exports: '$'
        },
        underscore: {
          deps:["jquery"],
          exports: '_'
        },
        backbone: {
          deps:["jquery"],
          exports: 'Backbone'
        },
        Handlebars:{
            deps:['underscore'],
            exports:'Handlebars'
        },
        Donec: {
            deps: ['underscore', 'jquery','Handlebars','Backbone'],
            exports: 'Donec'
        },
    },
    preserveLicenseComments: false,
    useStrict: true,
    wrap: true,
    wrapShim: true
});

require(
    [
    /*'jquery',
    'underscore',
    'Backbone',
    'Handlebars',*/
    'backbone',
    'Handlebars'
    ],
    function($,Backbone,Handlebars){
        
    }
);