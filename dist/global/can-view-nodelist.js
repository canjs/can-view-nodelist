/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({"can-namespace":"can"},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-util@3.9.0-pre.4#js/is-array-like/is-array-like*/
define('can-util/js/is-array-like/is-array-like', function (require, exports, module) {
    'use strict';
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        } else if (type === 'number') {
            return false;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof obj !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-namespace@1.0.0#can-namespace*/
define('can-namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-symbol@1.0.0-pre.0#can-symbol*/
define('can-symbol', function (require, exports, module) {
    (function (global) {
        var CanSymbol;
        if (typeof Symbol !== 'undefined') {
            CanSymbol = Symbol;
        } else {
            var symbolNum = 0;
            CanSymbol = function CanSymbolPolyfill(description) {
                var symbolValue = '@@symbol' + symbolNum++ + description;
                var symbol = {};
                Object.defineProperties(symbol, {
                    toString: {
                        value: function () {
                            return symbolValue;
                        }
                    }
                });
                return symbol;
            };
            var descriptionToSymbol = {};
            var symbolToDescription = {};
            CanSymbol.for = function (description) {
                var symbol = descriptionToSymbol[description];
                if (!symbol) {
                    symbol = descriptionToSymbol[description] = CanSymbol(description);
                    symbolToDescription[symbol] = description;
                }
                return symbol;
            };
            CanSymbol.keyFor = function (symbol) {
                return symbolToDescription[symbol];
            };
            [
                'hasInstance',
                'isConcatSpreadable',
                'iterator',
                'match',
                'prototype',
                'replace',
                'search',
                'species',
                'split',
                'toPrimitive',
                'toStringTag',
                'unscopables'
            ].forEach(function (name) {
                CanSymbol[name] = CanSymbol.for(name);
            });
        }
        [
            'isMapLike',
            'isListLike',
            'isValueLike',
            'getOwnKeys',
            'getOwnKeyDescriptor',
            'proto',
            'getOwnEnumerableKeys',
            'hasOwnKey',
            'getValue',
            'setValue',
            'getKeyValue',
            'setKeyValue',
            'apply',
            'new',
            'onValue',
            'offValue',
            'onKeyValue',
            'offKeyValue',
            'getKeyDependencies',
            'getValueDependencies',
            'keyHasDependencies',
            'valueHasDependencies',
            'onKeys',
            'onKeysAdded',
            'onKeysRemoved'
        ].forEach(function (name) {
            CanSymbol.for('can.' + name);
        });
        module.exports = CanSymbol;
    }(function () {
        return this;
    }()));
});
/*can-reflect@1.0.0-pre.2#reflections/type/type*/
define('can-reflect/reflections/type/type', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var check = function (symbols, obj) {
        for (var i = 0, len = symbols.length; i < len; i++) {
            var value = obj[canSymbol.for(symbols[i])];
            if (value !== undefined) {
                return value;
            }
        }
    };
    function isConstructorLike(func) {
        var value = func[canSymbol.for('can.new')];
        if (value !== undefined) {
            return value;
        }
        if (typeof func !== 'function') {
            return false;
        }
        for (var prop in func.prototype) {
            return true;
        }
        return false;
    }
    function isFunctionLike(obj) {
        var result = check([
            'can.new',
            'can.apply'
        ], obj);
        if (result !== undefined) {
            return !!result;
        }
        return typeof obj === 'function';
    }
    function isPrimitive(obj) {
        var type = typeof obj;
        if (obj == null || type !== 'function' && type !== 'object') {
            return true;
        } else {
            return false;
        }
    }
    function isValueLike(obj) {
        var symbolValue;
        if (isPrimitive(obj)) {
            return true;
        }
        symbolValue = obj[canSymbol.for('can.isValueLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = obj[canSymbol.for('can.getValue')];
        if (value !== undefined) {
            return !!value;
        }
    }
    function isMapLike(obj) {
        var symbolValue;
        if (isPrimitive(obj)) {
            return false;
        }
        symbolValue = obj[canSymbol.for('can.isMapLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = obj[canSymbol.for('can.getKeyValue')];
        if (value !== undefined) {
            return !!value;
        }
        return true;
    }
    function isObservableLike(obj) {
        if (isPrimitive(obj)) {
            return false;
        }
        var result = check([
            'can.onValue',
            'can.onKeyValue',
            'can.onKeys',
            'can.onKeysAdded'
        ], obj);
        if (result !== undefined) {
            return !!result;
        }
    }
    function isListLike(list) {
        var symbolValue, type = typeof list;
        if (type === 'string') {
            return true;
        }
        if (isPrimitive(list)) {
            return false;
        }
        symbolValue = list[canSymbol.for('can.isListLike')];
        if (typeof symbolValue !== 'undefined') {
            return symbolValue;
        }
        var value = list[canSymbol.iterator];
        if (value !== undefined) {
            return !!value;
        }
        if (Array.isArray(list)) {
            return true;
        }
        var length = list && type !== 'boolean' && typeof list !== 'number' && 'length' in list && list.length;
        return typeof list !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in list);
    }
    var symbolStart = '@@symbol';
    function isSymbolLike(symbol) {
        if (typeof symbol === 'symbol') {
            return true;
        } else {
            return symbol.toString().substr(0, symbolStart.length) === symbolStart;
        }
    }
    module.exports = {
        isConstructorLike: isConstructorLike,
        isFunctionLike: isFunctionLike,
        isListLike: isListLike,
        isMapLike: isMapLike,
        isObservableLike: isObservableLike,
        isPrimitive: isPrimitive,
        isValueLike: isValueLike,
        isSymbolLike: isSymbolLike,
        isMoreListLikeThanMapLike: function (obj) {
            if (Array.isArray(obj)) {
                return true;
            }
            var value = obj[canSymbol.for('can.isMoreListLikeThanMapLike')];
            if (value !== undefined) {
                return value;
            }
            var isListLike = this.isListLike(obj), isMapLike = this.isMapLike(obj);
            if (isListLike && !isMapLike) {
                return true;
            } else if (!isListLike && isMapLike) {
                return false;
            }
        },
        isIteratorLike: function (obj) {
            return obj && typeof obj === 'object' && typeof obj.next === 'function' && obj.next.length === 0;
        },
        isPromise: function (obj) {
            return obj instanceof Promise || Object.prototype.toString.call(obj) === '[object Promise]';
        }
    };
});
/*can-reflect@1.0.0-pre.2#reflections/call/call*/
define('can-reflect/reflections/call/call', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    module.exports = {
        call: function (func, context) {
            var args = [].slice.call(arguments, 2);
            var apply = func[canSymbol.for('can.apply')];
            if (apply) {
                return apply.call(func, context, args);
            } else {
                return func.apply(context, args);
            }
        },
        apply: function (func, context, args) {
            var apply = func[canSymbol.for('can.apply')];
            if (apply) {
                return apply.call(func, context, args);
            } else {
                return func.apply(context, args);
            }
        },
        'new': function (func) {
            var args = [].slice.call(arguments, 1);
            var makeNew = func[canSymbol.for('can.new')];
            if (makeNew) {
                return makeNew.apply(func, args);
            } else {
                var context = Object.create(func.prototype);
                var ret = func.apply(context, args);
                if (typeReflections.isPrimitive(ret)) {
                    return context;
                } else {
                    return ret;
                }
            }
        }
    };
});
/*can-reflect@1.0.0-pre.2#reflections/get-set/get-set*/
define('can-reflect/reflections/get-set/get-set', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    var setKeyValueSymbol = canSymbol.for('can.setKeyValue'), getKeyValueSymbol = canSymbol.for('can.getKeyValue'), getValueSymbol = canSymbol.for('can.getValue'), setValueSymbol = canSymbol.for('can.setValue');
    var reflections = {
        setKeyValue: function (obj, key, value) {
            if (typeof key === 'symbol') {
                obj[key] = value;
                return;
            }
            var setKeyValue = obj[setKeyValueSymbol];
            if (setKeyValue) {
                return setKeyValue.call(obj, key, value);
            } else if (typeof key !== 'symbol' && typeReflections.isSymbolLike(key)) {
                Object.defineProperty(obj, key, {
                    enumerable: false,
                    configurable: true,
                    value: value,
                    writable: true
                });
            } else {
                obj[key] = value;
            }
        },
        getKeyValue: function (obj, key) {
            var getKeyValue = obj[getKeyValueSymbol];
            if (getKeyValue) {
                return getKeyValue.call(obj, key);
            }
            return obj[key];
        },
        deleteKeyValue: function (obj, key) {
            var deleteKeyValue = obj[canSymbol.for('can.deleteKeyValue')];
            if (deleteKeyValue) {
                return deleteKeyValue.call(obj, key);
            }
            delete obj[key];
        },
        getValue: function (value) {
            if (typeReflections.isPrimitive(value)) {
                return value;
            }
            var getValue = value[getValueSymbol];
            if (getValue) {
                return getValue.call(value);
            }
            return value;
        },
        setValue: function (item, value) {
            var setValue = item && item[setValueSymbol];
            if (setValue) {
                return setValue.call(item, value);
            } else {
                throw new Error('can-reflect.setValue - Can not set value.');
            }
        }
    };
    reflections.get = reflections.getKeyValue;
    reflections.set = reflections.setKeyValue;
    reflections.delete = reflections.deleteKeyValue;
    module.exports = reflections;
});
/*can-reflect@1.0.0-pre.2#reflections/observe/observe*/
define('can-reflect/reflections/observe/observe', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var slice = [].slice;
    function makeFallback(symbolName, fallbackName) {
        return function (obj, event, handler) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                return method.call(obj, event, handler);
            }
            return this[fallbackName].apply(this, arguments);
        };
    }
    function makeErrorIfMissing(symbolName, errorMessage) {
        return function (obj, arg1, arg2) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                return method.call(obj, arg1, arg2);
            }
            throw new Error(errorMessage);
        };
    }
    module.exports = {
        onKeyValue: makeFallback('can.onKeyValue', 'onEvent'),
        offKeyValue: makeFallback('can.offKeyValue', 'offEvent'),
        onKeys: makeErrorIfMissing('can.onKeys', 'can-reflect: can not observe an onKeys event'),
        onKeysAdded: makeErrorIfMissing('can.onKeysAdded', 'can-reflect: can not observe an onKeysAdded event'),
        onKeysRemoved: makeErrorIfMissing('can.onKeysRemoved', 'can-reflect: can not unobserve an onKeysRemoved event'),
        getKeyDependencies: makeErrorIfMissing('can.getKeyDependencies', 'can-reflect: can not determine dependencies'),
        keyHasDependencies: makeErrorIfMissing('can.keyHasDependencies', 'can-reflect: can not determine if this has key dependencies'),
        onValue: makeErrorIfMissing('can.onValue', 'can-reflect: can not observe value change'),
        offValue: makeErrorIfMissing('can.offValue', 'can-reflect: can not unobserve value change'),
        getValueDependencies: makeErrorIfMissing('can.getValueDependencies', 'can-reflect: can not determine dependencies'),
        valueHasDependencies: makeErrorIfMissing('can.valueHasDependencies', 'can-reflect: can not determine if value has dependencies'),
        onEvent: function (obj, eventName, callback) {
            if (obj) {
                var onEvent = obj[canSymbol.for('can.onEvent')];
                if (onEvent !== undefined) {
                    return onEvent.call(obj, eventName, callback);
                } else if (obj.addEventListener) {
                    obj.addEventListener(eventName, callback);
                }
            }
        },
        offEvent: function (obj, eventName, callback) {
            if (obj) {
                var offEvent = obj[canSymbol.for('can.offEvent')];
                if (offEvent !== undefined) {
                    return offEvent.call(obj, eventName, callback);
                } else if (obj.removeEventListener) {
                    obj.removeEventListener(eventName, callback);
                }
            }
        }
    };
});
/*can-reflect@1.0.0-pre.2#reflections/shape/shape*/
define('can-reflect/reflections/shape/shape', function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var getSetReflections = require('can-reflect/reflections/get-set/get-set');
    var typeReflections = require('can-reflect/reflections/type/type');
    var shapeReflections = {
        each: function (obj, callback, context) {
            if (typeReflections.isIteratorLike(obj) || typeReflections.isMoreListLikeThanMapLike(obj)) {
                return this.eachIndex(obj, callback, context);
            } else {
                return this.eachKey(obj, callback, context);
            }
        },
        eachIndex: function (list, callback, context) {
            var iter, iterator = list[canSymbol.iterator];
            if (Array.isArray(list)) {
            } else if (typeReflections.isIteratorLike(list)) {
                iter = list;
            } else if (iterator) {
                iter = iterator.call(list);
            }
            if (iter) {
                var res, index = 0;
                while (!(res = iter.next()).done) {
                    if (callback.call(context || list, res.value, index++, list) === false) {
                        break;
                    }
                }
            } else {
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i];
                    if (callback.call(context || item, item, i, list) === false) {
                        break;
                    }
                }
            }
            return list;
        },
        toArray: function (obj) {
            var arr = [];
            this.each(obj, function (value) {
                arr.push(value);
            });
            return arr;
        },
        eachKey: function (obj, callback, context) {
            var enumerableKeys = this.getOwnEnumerableKeys(obj);
            return this.eachIndex(enumerableKeys, function (key) {
                var value = getSetReflections.getKeyValue(obj, key);
                return callback.call(context || obj, value, key, obj);
            });
        },
        'hasOwnKey': function (obj, key) {
            var hasOwnKey = obj[canSymbol.for('can.hasOwnKey')];
            if (hasOwnKey) {
                return hasOwnKey.call(obj, key);
            }
            var getOwnKeys = obj[canSymbol.for('can.getOwnKeys')];
            if (getOwnKeys) {
                var found = false;
                this.eachIndex(getOwnKeys.call(obj), function (objKey) {
                    if (objKey === key) {
                        found = true;
                        return false;
                    }
                });
                return found;
            }
            return obj.hasOwnProperty(key);
        },
        getOwnEnumerableKeys: function (obj) {
            var getOwnEnumerableKeys = obj[canSymbol.for('can.getOwnEnumerableKeys')];
            if (getOwnEnumerableKeys) {
                return getOwnEnumerableKeys.call(obj);
            }
            if (obj[canSymbol.for('can.getOwnKeys')] && obj[canSymbol.for('can.getOwnKeyDescriptor')]) {
                var keys = [];
                this.eachIndex(this.getOwnKeys(obj), function (key) {
                    var descriptor = this.getOwnKeyDescriptor(obj, key);
                    if (descriptor.enumerable) {
                        keys.push(key);
                    }
                }, this);
                return keys;
            } else {
                return Object.keys(obj);
            }
        },
        getOwnKeys: function (obj) {
            var getOwnKeys = obj[canSymbol.for('can.getOwnKeys')];
            if (getOwnKeys) {
                return getOwnKeys.call(obj);
            } else {
                return Object.getOwnPropertyNames(obj);
            }
        },
        getOwnKeyDescriptor: function (obj, key) {
            var getOwnKeyDescriptor = obj[canSymbol.for('can.getOwnKeyDescriptor')];
            if (getOwnKeyDescriptor) {
                return getOwnKeyDescriptor.call(obj, key);
            } else {
                return Object.getOwnPropertyDescriptor(obj, key);
            }
        },
        'in': function () {
        },
        getAllEnumerableKeys: function () {
        },
        getAllKeys: function () {
        }
    };
    shapeReflections.keys = shapeReflections.getOwnEnumerableKeys;
    module.exports = shapeReflections;
});
/*can-reflect@1.0.0-pre.2#can-reflect*/
define('can-reflect', function (require, exports, module) {
    var functionReflections = require('can-reflect/reflections/call/call');
    var getSet = require('can-reflect/reflections/get-set/get-set');
    var observe = require('can-reflect/reflections/observe/observe');
    var shape = require('can-reflect/reflections/shape/shape');
    var type = require('can-reflect/reflections/type/type');
    var reflect = {};
    [
        functionReflections,
        getSet,
        observe,
        shape,
        type
    ].forEach(function (reflections) {
        for (var prop in reflections) {
            reflect[prop] = reflections[prop];
        }
    });
    module.exports = reflect;
});
/*can-util@3.9.0-pre.4#js/log/log*/
define('can-util/js/log/log', function (require, exports, module) {
    'use strict';
    exports.warnTimeout = 5000;
    exports.logLevel = 0;
    exports.warn = function (out) {
        var ll = this.logLevel;
        if (ll < 2) {
            Array.prototype.unshift.call(arguments, 'WARN:');
            if (typeof console !== 'undefined' && console.warn) {
                this._logger('warn', Array.prototype.slice.call(arguments));
            } else if (typeof console !== 'undefined' && console.log) {
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS WARNING: ' + out);
            }
        }
    };
    exports.log = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.log) {
                Array.prototype.unshift.call(arguments, 'INFO:');
                this._logger('log', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('CanJS INFO: ' + out);
            }
        }
    };
    exports.error = function (out) {
        var ll = this.logLevel;
        if (ll < 1) {
            if (typeof console !== 'undefined' && console.error) {
                Array.prototype.unshift.call(arguments, 'ERROR:');
                this._logger('error', Array.prototype.slice.call(arguments));
            } else if (window && window.opera && window.opera.postError) {
                window.opera.postError('ERROR: ' + out);
            }
        }
    };
    exports._logger = function (type, arr) {
        try {
            console[type].apply(console, arr);
        } catch (e) {
            console[type](arr);
        }
    };
});
/*can-util@3.9.0-pre.4#js/dev/dev*/
define('can-util/js/dev/dev', function (require, exports, module) {
    'use strict';
    var canLog = require('can-util/js/log/log');
    module.exports = {
        warnTimeout: 5000,
        logLevel: 0,
        stringify: function (value) {
            var flagUndefined = function flagUndefined(key, value) {
                return value === undefined ? '/* void(undefined) */' : value;
            };
            return JSON.stringify(value, flagUndefined, '  ').replace(/"\/\* void\(undefined\) \*\/"/g, 'undefined');
        },
        warn: function () {
        },
        log: function () {
        },
        error: function () {
        },
        _logger: canLog._logger
    };
});
/*can-types@1.1.0-pre.2#can-types*/
define('can-types', function (require, exports, module) {
    var namespace = require('can-namespace');
    var canReflect = require('can-reflect');
    var canSymbol = require('can-symbol');
    var dev = require('can-util/js/dev/dev');
    var types = {
        isMapLike: function (obj) {
            return canReflect.isObservableLike(obj) && canReflect.isMapLike(obj);
        },
        isListLike: function (obj) {
            return canReflect.isObservableLike(obj) && canReflect.isListLike(obj);
        },
        isPromise: function (obj) {
            return canReflect.isPromise(obj);
        },
        isConstructor: function (func) {
            return canReflect.isConstructorLike(func);
        },
        isCallableForValue: function (obj) {
            return obj && obj[canSymbol.for('getValue')];
        },
        isCompute: function (obj) {
            return obj && obj.isComputed;
        },
        get iterator() {
            return canSymbol.iterator || canSymbol.for('iterator');
        },
        DefaultMap: null,
        DefaultList: null,
        queueTask: function (task) {
            var args = task[2] || [];
            task[0].apply(task[1], args);
        },
        wrapElement: function (element) {
            return element;
        },
        unwrapElement: function (element) {
            return element;
        }
    };
    if (namespace.types) {
        throw new Error('You can\'t have two versions of can-types, check your dependencies');
    } else {
        module.exports = namespace.types = types;
    }
});
/*can-util@3.9.0-pre.4#js/is-iterable/is-iterable*/
define('can-util/js/is-iterable/is-iterable', function (require, exports, module) {
    'use strict';
    var types = require('can-types');
    module.exports = function (obj) {
        return obj && !!obj[types.iterator];
    };
});
/*can-util@3.9.0-pre.4#js/each/each*/
define('can-util/js/each/each', function (require, exports, module) {
    'use strict';
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var has = Object.prototype.hasOwnProperty;
    var isIterable = require('can-util/js/is-iterable/is-iterable');
    var types = require('can-types');
    function each(elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else if (isIterable(elements)) {
                var iter = elements[types.iterator]();
                var res, value;
                while (!(res = iter.next()).done) {
                    value = res.value;
                    callback.call(context || elements, Array.isArray(value) ? value[1] : value, value[0]);
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (has.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.9.0-pre.4#js/make-array/make-array*/
define('can-util/js/make-array/make-array', function (require, exports, module) {
    'use strict';
    var each = require('can-util/js/each/each');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    function makeArray(element) {
        var ret = [];
        if (isArrayLike(element)) {
            each(element, function (a, i) {
                ret[i] = a;
            });
        } else if (element === 0 || element) {
            ret.push(element);
        }
        return ret;
    }
    module.exports = makeArray;
});
/*can-util@3.9.0-pre.4#js/global/global*/
define('can-util/js/global/global', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL;
        module.exports = function (setGlobal) {
            if (setGlobal !== undefined) {
                GLOBAL = setGlobal;
            }
            if (GLOBAL) {
                return GLOBAL;
            } else {
                return GLOBAL = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : typeof process === 'object' && {}.toString.call(process) === '[object process]' ? global : window;
            }
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#js/set-immediate/set-immediate*/
define('can-util/js/set-immediate/set-immediate', function (require, exports, module) {
    (function (global) {
        'use strict';
        var global = require('can-util/js/global/global')();
        module.exports = global.setImmediate || function (cb) {
            return setTimeout(cb, 0);
        };
    }(function () {
        return this;
    }()));
});
/*can-cid@1.0.3#can-cid*/
define('can-cid', function (require, exports, module) {
    var namespace = require('can-namespace');
    var _cid = 0;
    var cid = function (object, name) {
        if (!object._cid) {
            _cid++;
            object._cid = (name || '') + _cid;
        }
        return object._cid;
    };
    if (namespace.cid) {
        throw new Error('You can\'t have two versions of can-cid, check your dependencies');
    } else {
        module.exports = namespace.cid = cid;
    }
});
/*can-util@3.9.0-pre.4#dom/mutation-observer/mutation-observer*/
define('can-util/dom/mutation-observer/mutation-observer', function (require, exports, module) {
    (function (global) {
        'use strict';
        var global = require('can-util/js/global/global')();
        var setMutationObserver;
        module.exports = function (setMO) {
            if (setMO !== undefined) {
                setMutationObserver = setMO;
            }
            return setMutationObserver !== undefined ? setMutationObserver : global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#dom/child-nodes/child-nodes*/
define('can-util/dom/child-nodes/child-nodes', function (require, exports, module) {
    'use strict';
    function childNodes(node) {
        var childNodes = node.childNodes;
        if ('length' in childNodes) {
            return childNodes;
        } else {
            var cur = node.firstChild;
            var nodes = [];
            while (cur) {
                nodes.push(cur);
                cur = cur.nextSibling;
            }
            return nodes;
        }
    }
    module.exports = childNodes;
});
/*can-util@3.9.0-pre.4#dom/contains/contains*/
define('can-util/dom/contains/contains', function (require, exports, module) {
    'use strict';
    module.exports = function (child) {
        return this.contains(child);
    };
});
/*can-util@3.9.0-pre.4#dom/document/document*/
define('can-util/dom/document/document', function (require, exports, module) {
    (function (global) {
        'use strict';
        var global = require('can-util/js/global/global');
        var setDocument;
        module.exports = function (setDoc) {
            if (setDoc) {
                setDocument = setDoc;
            }
            return setDocument || global().document;
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#js/is-browser-window/is-browser-window*/
define('can-util/js/is-browser-window/is-browser-window', function (require, exports, module) {
    (function (global) {
        'use strict';
        module.exports = function () {
            return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof SimpleDOM === 'undefined';
        };
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#js/is-plain-object/is-plain-object*/
define('can-util/js/is-plain-object/is-plain-object', function (require, exports, module) {
    'use strict';
    var core_hasOwn = Object.prototype.hasOwnProperty;
    function isWindow(obj) {
        return obj !== null && obj == obj.window;
    }
    function isPlainObject(obj) {
        if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj) || obj.constructor && obj.constructor.name !== 'Object') {
            return false;
        }
        try {
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || core_hasOwn.call(obj, key);
    }
    module.exports = isPlainObject;
});
/*can-util@3.9.0-pre.4#dom/events/events*/
define('can-util/dom/events/events', function (require, exports, module) {
    'use strict';
    var _document = require('can-util/dom/document/document');
    var isBrowserWindow = require('can-util/js/is-browser-window/is-browser-window');
    var isPlainObject = require('can-util/js/is-plain-object/is-plain-object');
    var fixSyntheticEventsOnDisabled = false;
    function isDispatchingOnDisabled(element, ev) {
        var isInsertedOrRemoved = isPlainObject(ev) ? ev.type === 'inserted' || ev.type === 'removed' : ev === 'inserted' || ev === 'removed';
        var isDisabled = !!element.disabled;
        return isInsertedOrRemoved && isDisabled;
    }
    module.exports = {
        addEventListener: function () {
            this.addEventListener.apply(this, arguments);
        },
        removeEventListener: function () {
            this.removeEventListener.apply(this, arguments);
        },
        canAddEventListener: function () {
            return this.nodeName && (this.nodeType === 1 || this.nodeType === 9) || this === window;
        },
        dispatch: function (event, args, bubbles) {
            var ret;
            var dispatchingOnDisabled = fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(this, event);
            var doc = this.ownerDocument || _document();
            var ev = doc.createEvent('HTMLEvents');
            var isString = typeof event === 'string';
            ev.initEvent(isString ? event : event.type, bubbles === undefined ? true : bubbles, false);
            if (!isString) {
                for (var prop in event) {
                    if (ev[prop] === undefined) {
                        ev[prop] = event[prop];
                    }
                }
            }
            ev.args = args;
            if (dispatchingOnDisabled) {
                this.disabled = false;
            }
            ret = this.dispatchEvent(ev);
            if (dispatchingOnDisabled) {
                this.disabled = true;
            }
            return ret;
        }
    };
    (function () {
        if (!isBrowserWindow()) {
            return;
        }
        var testEventName = 'fix_synthetic_events_on_disabled_test';
        var input = document.createElement('input');
        input.disabled = true;
        var timer = setTimeout(function () {
            fixSyntheticEventsOnDisabled = true;
        }, 50);
        var onTest = function onTest() {
            clearTimeout(timer);
            module.exports.removeEventListener.call(input, testEventName, onTest);
        };
        module.exports.addEventListener.call(input, testEventName, onTest);
        try {
            module.exports.dispatch.call(input, testEventName, [], false);
        } catch (e) {
            onTest();
            fixSyntheticEventsOnDisabled = true;
        }
    }());
});
/*can-util@3.9.0-pre.4#dom/dispatch/dispatch*/
define('can-util/dom/dispatch/dispatch', function (require, exports, module) {
    'use strict';
    var domEvents = require('can-util/dom/events/events');
    module.exports = function () {
        return domEvents.dispatch.apply(this, arguments);
    };
});
/*can-util@3.9.0-pre.4#js/is-empty-object/is-empty-object*/
define('can-util/js/is-empty-object/is-empty-object', function (require, exports, module) {
    'use strict';
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-util@3.9.0-pre.4#dom/data/core*/
define('can-util/dom/data/core', function (require, exports, module) {
    'use strict';
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var data = {};
    var expando = 'can' + new Date();
    var uuid = 0;
    var setData = function (name, value) {
        var id = this[expando] || (this[expando] = ++uuid), store = data[id], newStore = false;
        if (!data[id]) {
            newStore = true;
            store = data[id] = {};
        }
        if (name !== undefined) {
            store[name] = value;
        }
        return newStore;
    };
    var deleteNode = function () {
        var id = this[expando];
        var nodeDeleted = false;
        if (id && data[id]) {
            nodeDeleted = true;
            delete data[id];
        }
        return nodeDeleted;
    };
    module.exports = {
        _data: data,
        getCid: function () {
            return this[expando];
        },
        cid: function () {
            return this[expando] || (this[expando] = ++uuid);
        },
        expando: expando,
        get: function (key) {
            var id = this[expando], store = id && data[id];
            return key === undefined ? store || setData(this) : store && store[key];
        },
        set: setData,
        clean: function (prop) {
            var id = this[expando];
            var itemData = data[id];
            if (itemData && itemData[prop]) {
                delete itemData[prop];
            }
            if (isEmptyObject(itemData)) {
                deleteNode.call(this);
            }
        },
        delete: deleteNode
    };
});
/*can-util@3.9.0-pre.4#js/cid/get-cid*/
define('can-util/js/cid/get-cid', function (require, exports, module) {
    'use strict';
    var CID = require('can-cid');
    var domDataCore = require('can-util/dom/data/core');
    module.exports = function (obj) {
        if (typeof obj.nodeType === 'number') {
            return domDataCore.cid.call(obj);
        } else {
            var type = typeof obj;
            var isObject = type !== null && (type === 'object' || type === 'function');
            return type + ':' + (isObject ? CID(obj) : obj);
        }
    };
});
/*can-util@3.9.0-pre.4#js/cid-set/cid-set*/
define('can-util/js/cid-set/cid-set', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL = require('can-util/js/global/global');
        var each = require('can-util/js/each/each');
        var getCID = require('can-util/js/cid/get-cid');
        var CIDSet;
        if (GLOBAL().Set) {
            CIDSet = GLOBAL().Set;
        } else {
            var CIDSet = function () {
                this.values = {};
            };
            CIDSet.prototype.add = function (value) {
                this.values[getCID(value)] = value;
            };
            CIDSet.prototype['delete'] = function (key) {
                var has = getCID(key) in this.values;
                if (has) {
                    delete this.values[getCID(key)];
                }
                return has;
            };
            CIDSet.prototype.forEach = function (cb, thisArg) {
                each(this.values, cb, thisArg);
            };
            CIDSet.prototype.has = function (value) {
                return getCID(value) in this.values;
            };
            CIDSet.prototype.clear = function (key) {
                return this.values = {};
            };
            Object.defineProperty(CIDSet.prototype, 'size', {
                get: function () {
                    var size = 0;
                    each(this.values, function () {
                        size++;
                    });
                    return size;
                }
            });
        }
        module.exports = CIDSet;
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#js/is-container/is-container*/
define('can-util/js/is-container/is-container', function (require, exports, module) {
    'use strict';
    module.exports = function (current) {
        return /^f|^o/.test(typeof current);
    };
});
/*can-util@3.9.0-pre.4#js/get/get*/
define('can-util/js/get/get', function (require, exports, module) {
    'use strict';
    var isContainer = require('can-util/js/is-container/is-container');
    function get(obj, name) {
        var parts = typeof name !== 'undefined' ? (name + '').replace(/\[/g, '.').replace(/]/g, '').split('.') : [], length = parts.length, current, i, container;
        if (!length) {
            return obj;
        }
        current = obj;
        for (i = 0; i < length && isContainer(current); i++) {
            container = current;
            current = container[parts[i]];
        }
        return current;
    }
    module.exports = get;
});
/*can-util@3.9.0-pre.4#js/is-array/is-array*/
define('can-util/js/is-array/is-array', function (require, exports, module) {
    'use strict';
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.9.0-pre.4#js/string/string*/
define('can-util/js/string/string', function (require, exports, module) {
    'use strict';
    var get = require('can-util/js/get/get');
    var isContainer = require('can-util/js/is-container/is-container');
    var canDev = require('can-util/js/dev/dev');
    var isArray = require('can-util/js/is-array/is-array');
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        }, deleteAtPath = function (data, path) {
            var parts = path ? path.replace(/\[/g, '.').replace(/]/g, '').split('.') : [];
            var current = data;
            for (var i = 0; i < parts.length - 1; i++) {
                if (current) {
                    current = current[parts[i]];
                }
            }
            if (current) {
                delete current[parts[parts.length - 1]];
            }
        };
    var string = {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots) {
            roots = isArray(roots) ? roots : [roots || window];
            var result, l = roots.length;
            for (var i = 0; i < l; i++) {
                result = get(roots[i], name);
                if (result) {
                    return result;
                }
            }
        },
        capitalize: function (s, cache) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        camelize: function (str) {
            return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        },
        hyphenate: function (str) {
            return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
                return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
            });
        },
        underscore: function (s) {
            return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
        },
        sub: function (str, data, remove) {
            var obs = [];
            str = str || '';
            obs.push(str.replace(strReplacer, function (whole, inside) {
                var ob = get(data, inside);
                if (remove === true) {
                    deleteAtPath(data, inside);
                }
                if (ob === undefined || ob === null) {
                    obs = null;
                    return '';
                }
                if (isContainer(ob) && obs) {
                    obs.push(ob);
                    return '';
                }
                return '' + ob;
            }));
            return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
        },
        replacer: strReplacer,
        undHash: strUndHash
    };
    module.exports = string;
});
/*can-util@3.9.0-pre.4#dom/mutation-observer/document/document*/
define('can-util/dom/mutation-observer/document/document', function (require, exports, module) {
    (function (global) {
        'use strict';
        var getDocument = require('can-util/dom/document/document');
        var domDataCore = require('can-util/dom/data/core');
        var MUTATION_OBSERVER = require('can-util/dom/mutation-observer/mutation-observer');
        var each = require('can-util/js/each/each');
        var CIDStore = require('can-util/js/cid-set/cid-set');
        var makeArray = require('can-util/js/make-array/make-array');
        var string = require('can-util/js/string/string');
        var dispatchIfListening = function (mutatedNode, nodes, dispatched) {
            if (dispatched.has(mutatedNode)) {
                return true;
            }
            dispatched.add(mutatedNode);
            if (nodes.name === 'removedNodes') {
                var documentElement = getDocument().documentElement;
                if (documentElement.contains(mutatedNode)) {
                    return;
                }
            }
            nodes.handlers.forEach(function (handler) {
                handler(mutatedNode);
            });
            nodes.afterHandlers.forEach(function (handler) {
                handler(mutatedNode);
            });
        };
        var mutationObserverDocument = {
            add: function (handler) {
                var MO = MUTATION_OBSERVER();
                if (MO) {
                    var documentElement = getDocument().documentElement;
                    var globalObserverData = domDataCore.get.call(documentElement, 'globalObserverData');
                    if (!globalObserverData) {
                        var observer = new MO(function (mutations) {
                            globalObserverData.handlers.forEach(function (handler) {
                                handler(mutations);
                            });
                        });
                        observer.observe(documentElement, {
                            childList: true,
                            subtree: true
                        });
                        globalObserverData = {
                            observer: observer,
                            handlers: []
                        };
                        domDataCore.set.call(documentElement, 'globalObserverData', globalObserverData);
                    }
                    globalObserverData.handlers.push(handler);
                }
            },
            remove: function (handler) {
                var documentElement = getDocument().documentElement;
                var globalObserverData = domDataCore.get.call(documentElement, 'globalObserverData');
                if (globalObserverData) {
                    var index = globalObserverData.handlers.indexOf(handler);
                    if (index >= 0) {
                        globalObserverData.handlers.splice(index, 1);
                    }
                    if (globalObserverData.handlers.length === 0) {
                        globalObserverData.observer.disconnect();
                        domDataCore.clean.call(documentElement, 'globalObserverData');
                    }
                }
            }
        };
        var makeMutationMethods = function (name) {
            var mutationName = name.toLowerCase() + 'Nodes';
            var getMutationData = function () {
                var documentElement = getDocument().documentElement;
                var mutationData = domDataCore.get.call(documentElement, mutationName + 'MutationData');
                if (!mutationData) {
                    mutationData = {
                        name: mutationName,
                        handlers: [],
                        afterHandlers: [],
                        hander: null
                    };
                    if (MUTATION_OBSERVER()) {
                        domDataCore.set.call(documentElement, mutationName + 'MutationData', mutationData);
                    }
                }
                return mutationData;
            };
            var setup = function () {
                var mutationData = getMutationData();
                if (mutationData.handlers.length === 0 || mutationData.afterHandlers.length === 0) {
                    mutationData.handler = function (mutations) {
                        var dispatched = new CIDStore();
                        mutations.forEach(function (mutation) {
                            each(mutation[mutationName], function (mutatedNode) {
                                var children = mutatedNode.getElementsByTagName && makeArray(mutatedNode.getElementsByTagName('*'));
                                var alreadyChecked = dispatchIfListening(mutatedNode, mutationData, dispatched);
                                if (children && !alreadyChecked) {
                                    for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                                        dispatchIfListening(child, mutationData, dispatched);
                                    }
                                }
                            });
                        });
                    };
                    this.add(mutationData.handler);
                }
                return mutationData;
            };
            var teardown = function () {
                var documentElement = getDocument().documentElement;
                var mutationData = getMutationData();
                if (mutationData.handlers.length === 0 && mutationData.afterHandlers.length === 0) {
                    this.remove(mutationData.handler);
                    domDataCore.clean.call(documentElement, mutationName + 'MutationData');
                }
            };
            var createOnOffHandlers = function (name, handlerList) {
                mutationObserverDocument['on' + name] = function (handler) {
                    var mutationData = setup.call(this);
                    mutationData[handlerList].push(handler);
                };
                mutationObserverDocument['off' + name] = function (handler) {
                    var mutationData = getMutationData();
                    var index = mutationData[handlerList].indexOf(handler);
                    if (index >= 0) {
                        mutationData[handlerList].splice(index, 1);
                    }
                    teardown.call(this);
                };
            };
            var createHandlers = function (name) {
                createOnOffHandlers(name, 'handlers');
                createOnOffHandlers('After' + name, 'afterHandlers');
            };
            createHandlers(string.capitalize(mutationName));
        };
        makeMutationMethods('added');
        makeMutationMethods('removed');
        module.exports = mutationObserverDocument;
    }(function () {
        return this;
    }()));
});
/*can-util@3.9.0-pre.4#dom/data/data*/
define('can-util/dom/data/data', function (require, exports, module) {
    'use strict';
    var domDataCore = require('can-util/dom/data/core');
    var mutationDocument = require('can-util/dom/mutation-observer/document/document');
    var deleteNode = function () {
        return domDataCore.delete.call(this);
    };
    var elementSetCount = 0;
    var cleanupDomData = function (node) {
        elementSetCount -= deleteNode.call(node) ? 1 : 0;
        if (elementSetCount === 0) {
            mutationDocument.offAfterRemovedNodes(cleanupDomData);
        }
    };
    module.exports = {
        getCid: domDataCore.getCid,
        cid: domDataCore.cid,
        expando: domDataCore.expando,
        clean: domDataCore.clean,
        get: domDataCore.get,
        set: function (name, value) {
            if (elementSetCount === 0) {
                mutationDocument.onAfterRemovedNodes(cleanupDomData);
            }
            elementSetCount += domDataCore.set.call(this, name, value) ? 1 : 0;
        },
        delete: deleteNode
    };
});
/*can-util@3.9.0-pre.4#dom/mutate/mutate*/
define('can-util/dom/mutate/mutate', function (require, exports, module) {
    'use strict';
    var makeArray = require('can-util/js/make-array/make-array');
    var setImmediate = require('can-util/js/set-immediate/set-immediate');
    var CID = require('can-cid');
    var getMutationObserver = require('can-util/dom/mutation-observer/mutation-observer');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    var domContains = require('can-util/dom/contains/contains');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var DOCUMENT = require('can-util/dom/document/document');
    var domData = require('can-util/dom/data/data');
    var mutatedElements;
    var checks = {
        inserted: function (root, elem) {
            return domContains.call(root, elem);
        },
        removed: function (root, elem) {
            return !domContains.call(root, elem);
        }
    };
    var fireOn = function (elems, root, check, event, dispatched) {
        if (!elems.length) {
            return;
        }
        var children, cid;
        for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
            cid = CID(elem);
            if (elem.getElementsByTagName && check(root, elem) && !dispatched[cid]) {
                dispatched[cid] = true;
                children = makeArray(elem.getElementsByTagName('*'));
                domDispatch.call(elem, event, [], false);
                if (event === 'removed') {
                    domData.delete.call(elem);
                }
                for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                    cid = CID(child);
                    if (!dispatched[cid]) {
                        domDispatch.call(child, event, [], false);
                        if (event === 'removed') {
                            domData.delete.call(child);
                        }
                        dispatched[cid] = true;
                    }
                }
            }
        }
    };
    var fireMutations = function () {
        var mutations = mutatedElements;
        mutatedElements = null;
        var firstElement = mutations[0][1][0];
        var doc = DOCUMENT() || firstElement.ownerDocument || firstElement;
        var root = doc.contains ? doc : doc.documentElement;
        var dispatched = {
            inserted: {},
            removed: {}
        };
        mutations.forEach(function (mutation) {
            fireOn(mutation[1], root, checks[mutation[0]], mutation[0], dispatched[mutation[0]]);
        });
    };
    var mutated = function (elements, type) {
        if (!getMutationObserver() && elements.length) {
            var firstElement = elements[0];
            var doc = DOCUMENT() || firstElement.ownerDocument || firstElement;
            var root = doc.contains ? doc : doc.documentElement;
            if (checks.inserted(root, firstElement)) {
                if (!mutatedElements) {
                    mutatedElements = [];
                    setImmediate(fireMutations);
                }
                mutatedElements.push([
                    type,
                    elements
                ]);
            }
        }
    };
    module.exports = {
        appendChild: function (child) {
            if (getMutationObserver()) {
                this.appendChild(child);
            } else {
                var children;
                if (child.nodeType === 11) {
                    children = makeArray(childNodes(child));
                } else {
                    children = [child];
                }
                this.appendChild(child);
                mutated(children, 'inserted');
            }
        },
        insertBefore: function (child, ref, document) {
            if (getMutationObserver()) {
                this.insertBefore(child, ref);
            } else {
                var children;
                if (child.nodeType === 11) {
                    children = makeArray(childNodes(child));
                } else {
                    children = [child];
                }
                this.insertBefore(child, ref);
                mutated(children, 'inserted');
            }
        },
        removeChild: function (child) {
            if (getMutationObserver()) {
                this.removeChild(child);
            } else {
                mutated([child], 'removed');
                this.removeChild(child);
            }
        },
        replaceChild: function (newChild, oldChild) {
            if (getMutationObserver()) {
                this.replaceChild(newChild, oldChild);
            } else {
                var children;
                if (newChild.nodeType === 11) {
                    children = makeArray(childNodes(newChild));
                } else {
                    children = [newChild];
                }
                mutated([oldChild], 'removed');
                this.replaceChild(newChild, oldChild);
                mutated(children, 'inserted');
            }
        },
        inserted: function (elements) {
            mutated(elements, 'inserted');
        },
        removed: function (elements) {
            mutated(elements, 'removed');
        }
    };
});
/*can-util@3.9.0-pre.4#js/cid-map/cid-map*/
define('can-util/js/cid-map/cid-map', function (require, exports, module) {
    (function (global) {
        'use strict';
        var GLOBAL = require('can-util/js/global/global');
        var each = require('can-util/js/each/each');
        var getCID = require('can-util/js/cid/get-cid');
        var CIDMap;
        if (GLOBAL().Map) {
            CIDMap = GLOBAL().Map;
        } else {
            var CIDMap = function () {
                this.values = {};
            };
            CIDMap.prototype.set = function (key, value) {
                this.values[getCID(key)] = {
                    key: key,
                    value: value
                };
            };
            CIDMap.prototype['delete'] = function (key) {
                var has = getCID(key) in this.values;
                if (has) {
                    delete this.values[getCID(key)];
                }
                return has;
            };
            CIDMap.prototype.forEach = function (cb, thisArg) {
                each(this.values, function (pair) {
                    return cb.call(thisArg || this, pair.value, pair.key, this);
                }, this);
            };
            CIDMap.prototype.has = function (key) {
                return getCID(key) in this.values;
            };
            CIDMap.prototype.get = function (key) {
                var obj = this.values[getCID(key)];
                return obj && obj.value;
            };
            CIDMap.prototype.clear = function (key) {
                return this.values = {};
            };
            Object.defineProperty(CIDMap.prototype, 'size', {
                get: function () {
                    var size = 0;
                    each(this.values, function () {
                        size++;
                    });
                    return size;
                }
            });
        }
        module.exports = CIDMap;
    }(function () {
        return this;
    }()));
});
/*can-view-nodelist@3.1.0-pre.0#can-view-nodelist*/
define('can-view-nodelist', function (require, exports, module) {
    var makeArray = require('can-util/js/make-array/make-array');
    var each = require('can-util/js/each/each');
    var namespace = require('can-namespace');
    var domMutate = require('can-util/dom/mutate/mutate');
    var CIDMap = require('can-util/js/cid-map/cid-map');
    var nodeMap = new CIDMap(), splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
            var count = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (item.nodeType) {
                    count++;
                } else {
                    count += itemsInChildListTree(item);
                }
            }
            return count;
        }, replacementMap = function (replacements) {
            var map = new CIDMap();
            for (var i = 0, len = replacements.length; i < len; i++) {
                var node = nodeLists.first(replacements[i]);
                map.set(node, replacements[i]);
            }
            return map;
        }, addUnfoundAsDeepChildren = function (list, rMap) {
            rMap.forEach(function (replacement) {
                list.newDeepChildren.push(replacement);
            });
        };
    var nodeLists = {
        update: function (nodeList, newNodes) {
            var oldNodes = nodeLists.unregisterChildren(nodeList);
            newNodes = makeArray(newNodes);
            var oldListLength = nodeList.length;
            splice.apply(nodeList, [
                0,
                oldListLength
            ].concat(newNodes));
            if (nodeList.replacements) {
                nodeLists.nestReplacements(nodeList);
                nodeList.deepChildren = nodeList.newDeepChildren;
                nodeList.newDeepChildren = [];
            } else {
                nodeLists.nestList(nodeList);
            }
            return oldNodes;
        },
        nestReplacements: function (list) {
            var index = 0, rMap = replacementMap(list.replacements), rCount = list.replacements.length;
            while (index < list.length && rCount) {
                var node = list[index], replacement = rMap.get(node);
                if (replacement) {
                    rMap['delete'](node);
                    list.splice(index, itemsInChildListTree(replacement), replacement);
                    rCount--;
                }
                index++;
            }
            if (rCount) {
                addUnfoundAsDeepChildren(list, rMap);
            }
            list.replacements = [];
        },
        nestList: function (list) {
            var index = 0;
            while (index < list.length) {
                var node = list[index], childNodeList = nodeMap.get(node);
                if (childNodeList) {
                    if (childNodeList !== list) {
                        list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                    }
                } else {
                    nodeMap.set(node, list);
                }
                index++;
            }
        },
        last: function (nodeList) {
            var last = nodeList[nodeList.length - 1];
            if (last.nodeType) {
                return last;
            } else {
                return nodeLists.last(last);
            }
        },
        first: function (nodeList) {
            var first = nodeList[0];
            if (first.nodeType) {
                return first;
            } else {
                return nodeLists.first(first);
            }
        },
        flatten: function (nodeList) {
            var items = [];
            for (var i = 0; i < nodeList.length; i++) {
                var item = nodeList[i];
                if (item.nodeType) {
                    items.push(item);
                } else {
                    items.push.apply(items, nodeLists.flatten(item));
                }
            }
            return items;
        },
        register: function (nodeList, unregistered, parent, directlyNested) {
            nodeList.unregistered = unregistered;
            nodeList.parentList = parent;
            nodeList.nesting = parent && typeof parent.nesting !== 'undefined' ? parent.nesting + 1 : 0;
            if (parent) {
                nodeList.deepChildren = [];
                nodeList.newDeepChildren = [];
                nodeList.replacements = [];
                if (parent !== true) {
                    if (directlyNested) {
                        parent.replacements.push(nodeList);
                    } else {
                        parent.newDeepChildren.push(nodeList);
                    }
                }
            } else {
                nodeLists.nestList(nodeList);
            }
            return nodeList;
        },
        unregisterChildren: function (nodeList) {
            var nodes = [];
            each(nodeList, function (node) {
                if (node.nodeType) {
                    if (!nodeList.replacements) {
                        nodeMap['delete'](node);
                    }
                    nodes.push(node);
                } else {
                    push.apply(nodes, nodeLists.unregister(node, true));
                }
            });
            each(nodeList.deepChildren, function (nodeList) {
                nodeLists.unregister(nodeList, true);
            });
            return nodes;
        },
        unregister: function (nodeList, isChild) {
            var nodes = nodeLists.unregisterChildren(nodeList, true);
            if (nodeList.unregistered) {
                var unregisteredCallback = nodeList.unregistered;
                nodeList.replacements = nodeList.unregistered = null;
                if (!isChild) {
                    var deepChildren = nodeList.parentList && nodeList.parentList.deepChildren;
                    if (deepChildren) {
                        var index = deepChildren.indexOf(nodeList);
                        if (index !== -1) {
                            deepChildren.splice(index, 1);
                        }
                    }
                }
                unregisteredCallback();
            }
            return nodes;
        },
        after: function (oldElements, newFrag) {
            var last = oldElements[oldElements.length - 1];
            if (last.nextSibling) {
                domMutate.insertBefore.call(last.parentNode, newFrag, last.nextSibling);
            } else {
                domMutate.appendChild.call(last.parentNode, newFrag);
            }
        },
        replace: function (oldElements, newFrag) {
            var selectedValue, parentNode = oldElements[0].parentNode;
            if (parentNode.nodeName.toUpperCase() === 'SELECT' && parentNode.selectedIndex >= 0) {
                selectedValue = parentNode.value;
            }
            if (oldElements.length === 1) {
                domMutate.replaceChild.call(parentNode, newFrag, oldElements[0]);
            } else {
                nodeLists.after(oldElements, newFrag);
                nodeLists.remove(oldElements);
            }
            if (selectedValue !== undefined) {
                parentNode.value = selectedValue;
            }
        },
        remove: function (elementsToBeRemoved) {
            var parent = elementsToBeRemoved[0] && elementsToBeRemoved[0].parentNode;
            each(elementsToBeRemoved, function (child) {
                domMutate.removeChild.call(parent, child);
            });
        },
        nodeMap: nodeMap
    };
    module.exports = namespace.nodeLists = nodeLists;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();