// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

	// grab the classes mixins array list
	var superMixins = _super.mixins ? _super.mixins : [];

	
	// grab the extended class mixins list
	var mixins = prop.mixins ? prop.mixins : [];
	
	// combine them together	
	mixins = superMixins.concat(mixins);
		
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) && name != "mixins" ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
	
	// set the mixins for the new class of merged mixins
	prototype.mixins = mixins;
	
	// put the trait methods to the new class
	// only override if method isn't defined before	
	for (var i=0; i < mixins.length; i++) {
		var mixin = mixins[i];
		
		for(var prop in mixin) {
			if (typeof mixin[prop] == "function" && typeof prototype[prop] == "undefined") {
		        prototype[prop] = mixin[prop];
			}

		}
	}


	
	

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.initialize )
        this.initialize.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();
var Utils = {

	namespace: function(ns){
		var nsParts = ns.split(".");
		var root = window;
		
		for (var i = 0; i < nsParts.length; i++) {
			if (Utils.isUndefined(root[nsParts[i]])) {
				root[nsParts[i]] = {};
			}
			root = root[nsParts[i]];
		}
		
	},
	
	getKeys : function(ob) {
		var keys = [];
		for( var key in ob) {
			keys.push(key);
		}
		return keys;
	},
	
	merge: function(){
		return jQuery.merge.apply(jQuery, arguments);
	},
	
	extend: function(){
		return jQuery.extend.apply(jQuery, arguments);
	},
	
	wait : function (millis) {
		var date = new Date();
		var curDate = null;
		
		do { curDate = new Date(); } 
			while(curDate-date < millis);
		
	},
	
	arrayMap : function( arr, func ) {
		return jQuery.map(arr, func);
	},
 	
	isUndefined : function(ob) {
		return typeof ob == "undefined";
	},

	isDefined : function(ob) {
		return !Utils.isUndefined(ob);
	},
	
	isFunction: function(fn) {
		return typeof fn === "function";
	},
	
	isString: function(str) {
		return typeof str === "string";
	},
			
	isArray : function(ob) {
		return jQuery.isArray(ob);
	},
	
	inArray: function(value,arr) {
		return jQuery.inArray(value, arr) == -1 ? false : true;
	},
	
	forEach : function(arr, func) {
		var rtn = [];
		for( var i=0; i<arr.length; i++) {
			rtn.push(func(arr[i], i));
		}
		return rtn;
	},
	
	pluralize: function(length, title) {
		if (length > 1 || length == 0) {
			return length + " " + title+"s";
		} 
		return length + " " + title;

	},
	
	isObject : function(ob) {
		return jQuery.isPlainObject(ob);
	},
	
	objectIterator : function( obj, func ) {
		
		var rtn = [];
		
		for( key in obj ) {
			if( obj.hasOwnProperty(key)) {
				rtn.push( func(key,obj[key]) );
			}
		}
		
		return rtn;
	},
	
	serializeUrl :function( ob) {
		var paramString = "";
		for( var param in ob) {
			if (Utils.isArray(ob[param])) {
				Utils.forEach(ob[param], function(arrayParam){
					paramString += "&" + param + "=" + arrayParam;
				});
			}
			else {
				paramString += "&" + param + "=" + ob[param];
			}
		}		
		return paramString;
	},

	
	deserializeUrl :function( url ) {	
		var urlParameterStrings =  url.substr(url.indexOf("?")+1);		
		return urlParameterStrings.split("&").filter(function (ob) {
			return ob != null && ob != "";
		});		
	},
	
	log : function(){
		try {
			//solrSearch.log.apply(solrSearch,arguments);
		} catch(e){};
	},
	
	parseJSON: function(jsonString) {
		return JSONstring.toObject(jsonString);
	},
	
	size: function(obj) {
	  var size = 0;
	  for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      size++;
	    }
	  }
	  return size;
	},
	
	ellipsis : function(value, len, word){
        if(value && value.length > len){
            if(word){
                var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                if(index == -1 || index < (len - 15)){
                    return value.substr(0, len - 3) + "...";
                }else{
                    return vs.substr(0, index) + "...";
                }
            } else{
                return value.substr(0, len - 3) + "...";
            }
        }
        return value;
    },

    htmlEncode : function(value){
        return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },

    htmlDecode : function(value){
        return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    },

    fileSize : function(size){
         if(size < 1024) {
             return size + " bytes";
         } else if(size < 1048576) {
             return (Math.round(((size*10) / 1024))/10) + " KB";
         } else {
             return (Math.round(((size*10) / 1048576))/10) + " MB";
         }
     },
	
	getSuggestions: function(cache, collection, query, scoreFunc, sort) {
        if( typeof cache[query] !="undefined"){
                return cache[query];
        }

        var cacheKey = query.slice(0,-1)
        var cacheResult = cache[cacheKey];

        if(typeof cacheResult != "undefined") {
                collection = cacheResult;
				cache = collection;
        }

		var suggestions = Utils.getScores(query, collection, scoreFunc);
		
		if (sort) {
			var suggestions = suggestions.sort(function(a, b) { return b.score - a.score; });
		}
		
		cache[query] = suggestions;

		return suggestions;
	},
	
	getScores: function(query, collection,scoreFunc) {
		
		query = query.toLowerCase();
        var scores = [];
		
		if (Utils.isArray(collection) ) {
			
			for (var i =0; i<collection.length; i++) {
                var scoreItem = scoreFunc(query, i, collection[i]);
				if (scoreItem != false) {
					scores.push(scoreItem);
				}
			}
			
		} else {
			// iterate through an object
			
	        for (var name in collection) {
	                var scoreItem = scoreFunc(query, name, collection[name]);
					if (scoreItem != false) {
						scores.push(scoreItem);
					}
	        }
			
			
		}
		
		return scores;
		
	}
	
}

Utils.CookieUtils = function(cookieName) {
	this.cookieName = cookieName;
	this.cookieObject = {};
}

Utils.CookieUtils.prototype = {
	persist: function(name, object) {

		this.cookieObject[name] = object;
		this._create( this.cookieName, JSONstring.make(this.cookieObject) );
	},

	read: function(name) {
		this._readCookie();

		return this.cookieObject[name] ? this.cookieObject[name] : null;
	},
	
	erase: function(name) {
		this.persist(name, null);
		
	},
	
	_setCookieName: function(name) {
		this.cookieName = name || "notSet";
	},

	_readCookie: function() {
		var cookieString = this._read(this.cookieName);
	    if ( cookieString != null) {
		   this.cookieObject = JSONstring.toObject( cookieString );
		}
	},
	
    _create: function(name,value,days){
      if (days) {
         var date = new Date();
         date.setTime(date.getTime()+(days*24*60*60*1000));
         var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = name+"="+value+expires+"; path=/";
    },

    _read: function(name) {
       var nameEQ = name + "=";
       var ca = document.cookie.split(';');
       for(var i=0;i < ca.length;i++) {
         var c = ca[i];
         while (c.charAt(0)==' ') c = c.substring(1,c.length);
         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
       }
       return null;
    },

    _erase: function(name) {
      this.create(name,"",-1);
    }	
}



if( Utils.isUndefined(Array.prototype.indexOf) ) {
	Array.prototype.indexOf=function(o,i){for(var j=this.length,i=i<0?i+j<0?0:i+j:i||0;i<j&&this[i]!==o;i++);return j<=i?-1:i}
}

if( Utils.isUndefined(Array.prototype.remove) ) {
	
	Array.prototype.remove = function( value ) {
		var index = this.indexOf(value);
		if(index != -1) {
			this.splice(index,1);
		}
	}
	
}

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

if( Utils.isUndefined(Array.prototype.push) ) {
	
	Array.prototype.push = function( ob ) {
		this[this.length] = ob;
	}
	
}

Function.prototype.curry = function() {
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function() {
  		return fn.apply(this, args.concat(
    	Array.prototype.slice.call(arguments)));
	};
};

if( Utils.isUndefined(Function.prototype.bind) ) {

Function.prototype.bind = function(){ 
  var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift(); 
  return function(){ 
    return fn.apply(object, 
      args.concat(Array.prototype.slice.call(arguments))); 
  }; 
};

}


Function.prototype.defer = function(){ 
  var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift(); 
  setTimeout(function(){ 
    return fn.apply(object, 
      args.concat(Array.prototype.slice.call(arguments))); 
  },0); 
};

String.prototype.removeQuotes = function(){
	return this.replace(/"/g,"");
}

String.prototype.removeStrong = function(){
	return this.replace("&lt;strong&gt;","").replace("&lt;/strong&gt;","");
}


String.prototype.addQuotes = function(){
	
	if( !/^".+"$/.test(this) ) {
		return "\"" + this + "\"";
	}
	return this
}

String.prototype.xSplit = function(_regEx){
// Most browsers can do this properly, so let them — they'll do it faster
	if ('a~b'.split(/(~)/).length === 3) { return this.split(_regEx); }

	if (!_regEx.global) {
		 _regEx = new RegExp(_regEx.source, 'g' + (_regEx.ignoreCase ? 'i' : ""));
	}

	// IE (and any other browser that can't capture the delimiter)
	// will, unfortunately, have to be slowed down
	
	var start = 0, arr=[];
	var result;
	
	while((result = _regEx.exec(this)) != null){
		arr.push(this.slice(start, result.index));
		if(result.length > 1) arr.push(result[1]);
		start = _regEx.lastIndex;
	}
	
	if(start < this.length) arr.push(this.slice(start));
	if(start == this.length) arr.push(""); 
	
	return arr;
};


String.prototype.score = function(abbreviation,offset) {


 if(abbreviation.length >=7) {
       return (this.indexOf(abbreviation) != -1)?1:0;
 }
 offset = offset || 0 // TODO: I think this is unused... remove

 if(abbreviation.length == 0) return 0.9
 if(abbreviation.length > this.length) return 0.0

 for (var i = abbreviation.length; i > 0; i--) {
   var sub_abbreviation = abbreviation.substring(0,i)
   var index = this.indexOf(sub_abbreviation)


   if(index < 0) continue;
   if(index + abbreviation.length > this.length + offset) continue;

   var next_string       = this.substring(index+sub_abbreviation.length)
   var next_abbreviation = null

   if(i >= abbreviation.length)
     next_abbreviation = ''
   else
     next_abbreviation = abbreviation.substring(i)

   var remaining_score   = next_string.score(next_abbreviation,offset+index)

   if (remaining_score > 0) {
     var score = this.length-next_string.length;

     if(index != 0) {
       var j = 0;

       var c = this.charCodeAt(index-1)
       if(c==32 || c == 9) {
         for(var j=(index-2); j >= 0; j--) {
           c = this.charCodeAt(j)
           score -= ((c == 32 || c == 9) ? 1 : 0.15)
         }
       } else {
         score -= index
       }
     }

     score += remaining_score * next_string.length
     score /= this.length;
     return score
   }
 }


 return 0.0
}

if(typeof console === "undefined") {
	console ={
		log:function(){}
	}
}

Tuple = function(key,value) {
	this.key = key;
	this.value = unescape(value) || "";
};
Tuple.prototype = {
	equals : function(key, value) {
		return this.key == key && this.value == value;
	},
	toString: function(){
		var value = this.value + "";
			
		return this.key+"="+value.replace("&", "%26");
	}
}

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

if( Utils.isUndefined(Array.prototype.trim) ) {
	String.prototype.trim = function () {
	  return this.replace(/^ +/, '').replace(/ +$/, '');
	};
}

(function(){
	
	Utils.namespace("VYRE.ForeFront");
		
	VYRE.ForeFront.AbstractSimpleParameterMap = Class.extend({
				
		initialize : function(){
			this.map = {};
		},
		
		add: function(key, value) {
			
			if (typeof( this.map[key] ) != "undefined") {
				 console.log("Key: " + key + " already predefined");
			}
			
			this.map[key] = value;
		},
		
		get: function(local, defaultValue) {
			
			local = local.toLowerCase();
								
            return typeof(this.map[local]) != "undefined" ? this.map[local]  : (defaultValue || local);
		}

		
	});
	
})();

(function(){
	
	Utils.namespace("VYRE.ForeFront");
		
	VYRE.ForeFront.EventBus = Class.extend({
		
		initialize : function(){
			this.subscribedCollection = {};
		},
		
		registerEvents: function(events) {
			for (var i =0; i < events.length; i++) {
				this.registerEvent( events[i] );
			}
		},
		
		registerEvent: function(event) {
			this.subscribedCollection[event] = [];
		},
		
		subscribe: function(module) {
			var subsribedEvents = module["registerNotificationInterests"] ? module.registerNotificationInterests() : [];		
			var registeredEvents = module["registerNotifications"] ? module.registerNotifications() : [];
			
			this.registerEvents( registeredEvents );
									
			for (var i=0; i<subsribedEvents.length; i++) {
				var event = subsribedEvents[i];
				if (!Utils.isArray( this.subscribedCollection[event] )) {
					this.registerEvent(event);
				}
				this.subscribedCollection[event].push(module);
			}
						
			return module;
		},
		
		fire: function(event, payload) {
			var modules = this.subscribedCollection[event];
		//	console.log(event);						
			if ( Utils.isArray(modules) ) {
				for (var i=0; i<modules.length; i++) {
					modules[i].handleNotifications(event, payload);
				}
			}
		}
		
		
	});
	
	EventBus = new VYRE.ForeFront.EventBus();
	
})();
(function(){
	
	Utils.namespace("VYRE.ForeFront");
	
	VYRE.ForeFront.EventTarget = Class.extend({
		
		initialize : function(settings){
			this.eventCollection ={};
			Utils.extend(this, settings);
		},
		
		
		fire : function( eventKey, payload) {
			var events = this.eventCollection[eventKey];
						
			var args = Array.prototype.slice.call(arguments);
			args.shift();

			if( Utils.isDefined(events) ){
				Utils.forEach(events, function(eventFunction) {
					eventFunction.apply(this, args );
				});				
			};
	
		},
		
		on : function( eventName, fn ) {
			if( Utils.isDefined(eventName) 
				&& Utils.isFunction(fn)) {
				
				if( Utils.isUndefined(this.eventCollection[eventName])) {
					this.eventCollection[eventName] = [];
				}		
					
				this.eventCollection[eventName].push(fn);
			} 
		}, 
		
		clearAllEvents : function() {
			this.eventCollection = {};	
		},
		
		destroy : function() {
			this.clearAllEvents();
			return this;
		},
		
		registerNotifications: function() {
			return [];
		},
		
		registerNotificationInterests: function() {
			return [];
		},
		
		handleNotifications: function(event, payload) {
			throw new Error("Widget must implement handleNotification method to deal with events");
		}
		
		
	});
	
})();
