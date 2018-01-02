/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		} else if (!args[0] && deps[0] === "exports") {
			// Babel uses the exports and module object.
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
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
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{ "can-namespace": "can" },
	typeof self == "object" && self.Object == Object ? self : window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*can-namespace@1.0.0#can-namespace*/
define('can-namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-assign@1.1.1#can-assign*/
define('can-assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-util@3.10.18#js/assign/assign*/
define('can-util/js/assign/assign', [
    'require',
    'exports',
    'module',
    'can-assign'
], function (require, exports, module) {
    'use strict';
    module.exports = require('can-assign');
});
/*can-symbol@1.5.0#can-symbol*/
define('can-symbol', [
    'require',
    'exports',
    'module',
    'can-namespace'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var namespace = require('can-namespace');
        var CanSymbol;
        if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
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
                CanSymbol[name] = CanSymbol('Symbol.' + name);
            });
        }
        [
            'isMapLike',
            'isListLike',
            'isValueLike',
            'isFunctionLike',
            'getOwnKeys',
            'getOwnKeyDescriptor',
            'proto',
            'getOwnEnumerableKeys',
            'hasOwnKey',
            'size',
            'getName',
            'getIdentity',
            'assignDeep',
            'updateDeep',
            'getValue',
            'setValue',
            'getKeyValue',
            'setKeyValue',
            'updateValues',
            'addValue',
            'removeValues',
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
            'onKeysRemoved',
            'onPatches'
        ].forEach(function (name) {
            CanSymbol.for('can.' + name);
        });
        module.exports = namespace.Symbol = CanSymbol;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-reflect@1.12.0#reflections/helpers*/
define('can-reflect/reflections/helpers', [
    'require',
    'exports',
    'module',
    'can-symbol'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    module.exports = {
        makeGetFirstSymbolValue: function (symbolNames) {
            var symbols = symbolNames.map(function (name) {
                return canSymbol.for(name);
            });
            var length = symbols.length;
            return function getFirstSymbol(obj) {
                var index = -1;
                while (++index < length) {
                    if (obj[symbols[index]] !== undefined) {
                        return obj[symbols[index]];
                    }
                }
            };
        },
        hasLength: function (list) {
            var type = typeof list;
            var length = list && type !== 'boolean' && typeof list !== 'number' && 'length' in list && list.length;
            return typeof list !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in list);
        }
    };
});
/*can-reflect@1.12.0#reflections/type/type*/
define('can-reflect/reflections/type/type', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect/reflections/helpers'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var helpers = require('can-reflect/reflections/helpers');
    var plainFunctionPrototypePropertyNames = Object.getOwnPropertyNames(function () {
    }.prototype);
    var plainFunctionPrototypeProto = Object.getPrototypeOf(function () {
    }.prototype);
    function isConstructorLike(func) {
        var value = func[canSymbol.for('can.new')];
        if (value !== undefined) {
            return value;
        }
        if (typeof func !== 'function') {
            return false;
        }
        var prototype = func.prototype;
        if (!prototype) {
            return false;
        }
        if (plainFunctionPrototypeProto !== Object.getPrototypeOf(prototype)) {
            return true;
        }
        var propertyNames = Object.getOwnPropertyNames(prototype);
        if (propertyNames.length === plainFunctionPrototypePropertyNames.length) {
            for (var i = 0, len = propertyNames.length; i < len; i++) {
                if (propertyNames[i] !== plainFunctionPrototypePropertyNames[i]) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }
    var getNewOrApply = helpers.makeGetFirstSymbolValue([
        'can.new',
        'can.apply'
    ]);
    function isFunctionLike(obj) {
        var result, symbolValue = obj[canSymbol.for('can.isFunctionLike')];
        if (symbolValue !== undefined) {
            return symbolValue;
        }
        result = getNewOrApply(obj);
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
    function isBuiltIn(obj) {
        if (isPrimitive(obj) || Array.isArray(obj) || isPlainObject(obj) || Object.prototype.toString.call(obj) !== '[object Object]' && Object.prototype.toString.call(obj).indexOf('[object ') !== -1) {
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
        if (isPrimitive(obj)) {
            return false;
        }
        var isMapLike = obj[canSymbol.for('can.isMapLike')];
        if (typeof isMapLike !== 'undefined') {
            return !!isMapLike;
        }
        var value = obj[canSymbol.for('can.getKeyValue')];
        if (value !== undefined) {
            return !!value;
        }
        return true;
    }
    var onValueSymbol = canSymbol.for('can.onValue'), onKeyValueSymbol = canSymbol.for('can.onKeyValue'), onPatchesSymbol = canSymbol.for('can.onPatches');
    function isObservableLike(obj) {
        if (isPrimitive(obj)) {
            return false;
        }
        return Boolean(obj[onValueSymbol] || obj[onKeyValueSymbol] || obj[onPatchesSymbol]);
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
        return helpers.hasLength(list);
    }
    var supportsSymbols = typeof Symbol !== 'undefined' && typeof Symbol.for === 'function';
    var isSymbolLike;
    if (supportsSymbols) {
        isSymbolLike = function (symbol) {
            return typeof symbol === 'symbol';
        };
    } else {
        var symbolStart = '@@symbol';
        isSymbolLike = function (symbol) {
            if (typeof symbol === 'object' && !Array.isArray(symbol)) {
                return symbol.toString().substr(0, symbolStart.length) === symbolStart;
            } else {
                return false;
            }
        };
    }
    var coreHasOwn = Object.prototype.hasOwnProperty;
    var funcToString = Function.prototype.toString;
    var objectCtorString = funcToString.call(Object);
    function isPlainObject(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        var proto = Object.getPrototypeOf(obj);
        if (proto === Object.prototype || proto === null) {
            return true;
        }
        var Constructor = coreHasOwn.call(proto, 'constructor') && proto.constructor;
        return typeof Constructor === 'function' && Constructor instanceof Constructor && funcToString.call(Constructor) === objectCtorString;
    }
    module.exports = {
        isConstructorLike: isConstructorLike,
        isFunctionLike: isFunctionLike,
        isListLike: isListLike,
        isMapLike: isMapLike,
        isObservableLike: isObservableLike,
        isPrimitive: isPrimitive,
        isBuiltIn: isBuiltIn,
        isValueLike: isValueLike,
        isSymbolLike: isSymbolLike,
        isMoreListLikeThanMapLike: function (obj) {
            if (Array.isArray(obj)) {
                return true;
            }
            if (obj instanceof Array) {
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
        },
        isPlainObject: isPlainObject
    };
});
/*can-reflect@1.12.0#reflections/call/call*/
define('can-reflect/reflections/call/call', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect/reflections/type/type'
], function (require, exports, module) {
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
/*can-reflect@1.12.0#reflections/get-set/get-set*/
define('can-reflect/reflections/get-set/get-set', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect/reflections/type/type'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    var setKeyValueSymbol = canSymbol.for('can.setKeyValue'), getKeyValueSymbol = canSymbol.for('can.getKeyValue'), getValueSymbol = canSymbol.for('can.getValue'), setValueSymbol = canSymbol.for('can.setValue');
    var reflections = {
        setKeyValue: function (obj, key, value) {
            if (typeReflections.isSymbolLike(key)) {
                if (typeof key === 'symbol') {
                    obj[key] = value;
                } else {
                    Object.defineProperty(obj, key, {
                        enumerable: false,
                        configurable: true,
                        value: value,
                        writable: true
                    });
                }
                return;
            }
            var setKeyValue = obj[setKeyValueSymbol];
            if (setKeyValue !== undefined) {
                return setKeyValue.call(obj, key, value);
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
        },
        splice: function (obj, index, removing, adding) {
            var howMany;
            if (typeof removing !== 'number') {
                var updateValues = obj[canSymbol.for('can.updateValues')];
                if (updateValues) {
                    return updateValues.call(obj, index, removing, adding);
                }
                howMany = removing.length;
            } else {
                howMany = removing;
            }
            var splice = obj[canSymbol.for('can.splice')];
            if (splice) {
                return splice.call(obj, index, howMany, adding);
            }
            return [].splice.apply(obj, [
                index,
                howMany
            ].concat(adding));
        },
        addValues: function (obj, adding, index) {
            var add = obj[canSymbol.for('can.addValues')];
            if (add) {
                return add.call(obj, adding, index);
            }
            if (Array.isArray(obj) && index === undefined) {
                return obj.push.apply(obj, adding);
            }
            return reflections.splice(obj, index, [], adding);
        },
        removeValues: function (obj, removing, index) {
            var removeValues = obj[canSymbol.for('can.removeValues')];
            if (removeValues) {
                return removeValues.call(obj, removing, index);
            }
            if (Array.isArray(obj) && index === undefined) {
                removing.forEach(function (item) {
                    var index = obj.indexOf(item);
                    if (index >= 0) {
                        obj.splice(index, 1);
                    }
                });
                return;
            }
            return reflections.splice(obj, index, removing, []);
        }
    };
    reflections.get = reflections.getKeyValue;
    reflections.set = reflections.setKeyValue;
    reflections['delete'] = reflections.deleteKeyValue;
    module.exports = reflections;
});
/*can-reflect@1.12.0#reflections/observe/observe*/
define('can-reflect/reflections/observe/observe', [
    'require',
    'exports',
    'module',
    'can-symbol'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var slice = [].slice;
    function makeFallback(symbolName, fallbackName) {
        return function (obj, event, handler, queueName) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                return method.call(obj, event, handler, queueName);
            }
            return this[fallbackName].apply(this, arguments);
        };
    }
    function makeErrorIfMissing(symbolName, errorMessage) {
        return function (obj) {
            var method = obj[canSymbol.for(symbolName)];
            if (method !== undefined) {
                var args = slice.call(arguments, 1);
                return method.apply(obj, args);
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
        getWhatIChange: makeErrorIfMissing('can.getWhatIChange', 'can-reflect: can not determine dependencies'),
        getChangesDependencyRecord: function getChangesDependencyRecord(handler) {
            var fn = handler[canSymbol.for('can.getChangesDependencyRecord')];
            if (typeof fn === 'function') {
                return fn();
            }
        },
        keyHasDependencies: makeErrorIfMissing('can.keyHasDependencies', 'can-reflect: can not determine if this has key dependencies'),
        onValue: makeErrorIfMissing('can.onValue', 'can-reflect: can not observe value change'),
        offValue: makeErrorIfMissing('can.offValue', 'can-reflect: can not unobserve value change'),
        getValueDependencies: makeErrorIfMissing('can.getValueDependencies', 'can-reflect: can not determine dependencies'),
        valueHasDependencies: makeErrorIfMissing('can.valueHasDependencies', 'can-reflect: can not determine if value has dependencies'),
        onPatches: makeErrorIfMissing('can.onPatches', 'can-reflect: can not observe patches on object'),
        offPatches: makeErrorIfMissing('can.offPatches', 'can-reflect: can not unobserve patches on object'),
        onInstancePatches: makeErrorIfMissing('can.onInstancePatches', 'can-reflect: can not observe onInstancePatches on Type'),
        offInstancePatches: makeErrorIfMissing('can.offInstancePatches', 'can-reflect: can not unobserve onInstancePatches on Type'),
        onInstanceBoundChange: makeErrorIfMissing('can.onInstanceBoundChange', 'can-reflect: can not observe bound state change in instances.'),
        offInstanceBoundChange: makeErrorIfMissing('can.offInstanceBoundChange', 'can-reflect: can not unobserve bound state change'),
        isBound: makeErrorIfMissing('can.isBound', 'can-reflect: cannot determine if object is bound'),
        onEvent: function (obj, eventName, callback, queue) {
            if (obj) {
                var onEvent = obj[canSymbol.for('can.onEvent')];
                if (onEvent !== undefined) {
                    return onEvent.call(obj, eventName, callback, queue);
                } else if (obj.addEventListener) {
                    obj.addEventListener(eventName, callback, queue);
                }
            }
        },
        offEvent: function (obj, eventName, callback, queue) {
            if (obj) {
                var offEvent = obj[canSymbol.for('can.offEvent')];
                if (offEvent !== undefined) {
                    return offEvent.call(obj, eventName, callback, queue);
                } else if (obj.removeEventListener) {
                    obj.removeEventListener(eventName, callback, queue);
                }
            }
        },
        setPriority: function (obj, priority) {
            if (obj) {
                var setPriority = obj[canSymbol.for('can.setPriority')];
                if (setPriority !== undefined) {
                    setPriority.call(obj, priority);
                    return true;
                }
            }
            return false;
        },
        getPriority: function (obj) {
            if (obj) {
                var getPriority = obj[canSymbol.for('can.getPriority')];
                if (getPriority !== undefined) {
                    return getPriority.call(obj);
                }
            }
            return undefined;
        }
    };
});
/*can-reflect@1.12.0#reflections/shape/shape*/
define('can-reflect/reflections/shape/shape', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect/reflections/get-set/get-set',
    'can-reflect/reflections/type/type',
    'can-reflect/reflections/helpers'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var getSetReflections = require('can-reflect/reflections/get-set/get-set');
    var typeReflections = require('can-reflect/reflections/type/type');
    var helpers = require('can-reflect/reflections/helpers');
    var shapeReflections;
    var shiftFirstArgumentToThis = function (func) {
        return function () {
            var args = [this];
            args.push.apply(args, arguments);
            return func.apply(null, args);
        };
    };
    var getKeyValueSymbol = canSymbol.for('can.getKeyValue');
    var shiftedGetKeyValue = shiftFirstArgumentToThis(getSetReflections.getKeyValue);
    var setKeyValueSymbol = canSymbol.for('can.setKeyValue');
    var shiftedSetKeyValue = shiftFirstArgumentToThis(getSetReflections.setKeyValue);
    var sizeSymbol = canSymbol.for('can.size');
    var serializeMap = null;
    var hasUpdateSymbol = helpers.makeGetFirstSymbolValue([
        'can.updateDeep',
        'can.assignDeep',
        'can.setKeyValue'
    ]);
    var shouldUpdateOrAssign = function (obj) {
        return typeReflections.isPlainObject(obj) || Array.isArray(obj) || !!hasUpdateSymbol(obj);
    };
    function isSerializable(obj) {
        if (typeReflections.isPrimitive(obj)) {
            return true;
        }
        if (hasUpdateSymbol(obj)) {
            return false;
        }
        return typeReflections.isBuiltIn(obj) && !typeReflections.isPlainObject(obj);
    }
    var Object_Keys;
    try {
        Object.keys(1);
        Object_Keys = Object.keys;
    } catch (e) {
        Object_Keys = function (obj) {
            if (typeReflections.isPrimitive(obj)) {
                return [];
            } else {
                return Object.keys(obj);
            }
        };
    }
    function makeSerializer(methodName, symbolsToCheck) {
        return function serializer(value, MapType) {
            if (isSerializable(value)) {
                return value;
            }
            var firstSerialize;
            if (MapType && !serializeMap) {
                serializeMap = {
                    unwrap: new MapType(),
                    serialize: new MapType()
                };
                firstSerialize = true;
            }
            var serialized;
            if (typeReflections.isValueLike(value)) {
                serialized = this[methodName](getSetReflections.getValue(value));
            } else {
                var isListLike = typeReflections.isIteratorLike(value) || typeReflections.isMoreListLikeThanMapLike(value);
                serialized = isListLike ? [] : {};
                if (serializeMap) {
                    if (serializeMap[methodName].has(value)) {
                        return serializeMap[methodName].get(value);
                    } else {
                        serializeMap[methodName].set(value, serialized);
                    }
                }
                for (var i = 0, len = symbolsToCheck.length; i < len; i++) {
                    var serializer = value[symbolsToCheck[i]];
                    if (serializer) {
                        var result = serializer.call(value, serialized);
                        if (firstSerialize) {
                            serializeMap = null;
                        }
                        return result;
                    }
                }
                if (typeof obj === 'function') {
                    if (serializeMap) {
                        serializeMap[methodName].set(value, value);
                    }
                    serialized = value;
                } else if (isListLike) {
                    this.eachIndex(value, function (childValue, index) {
                        serialized[index] = this[methodName](childValue);
                    }, this);
                } else {
                    this.eachKey(value, function (childValue, prop) {
                        serialized[prop] = this[methodName](childValue);
                    }, this);
                }
            }
            if (firstSerialize) {
                serializeMap = null;
            }
            return serialized;
        };
    }
    var makeMap;
    if (typeof Map !== 'undefined') {
        makeMap = function (keys) {
            var map = new Map();
            shapeReflections.eachIndex(keys, function (key) {
                map.set(key, true);
            });
            return map;
        };
    } else {
        makeMap = function (keys) {
            var map = {};
            keys.forEach(function (key) {
                map[key] = true;
            });
            return {
                get: function (key) {
                    return map[key];
                },
                set: function (key, value) {
                    map[key] = value;
                },
                keys: function () {
                    return keys;
                }
            };
        };
    }
    var fastHasOwnKey = function (obj) {
        var hasOwnKey = obj[canSymbol.for('can.hasOwnKey')];
        if (hasOwnKey) {
            return hasOwnKey.bind(obj);
        } else {
            var map = makeMap(shapeReflections.getOwnEnumerableKeys(obj));
            return function (key) {
                return map.get(key);
            };
        }
    };
    function addPatch(patches, patch) {
        var lastPatch = patches[patches.length - 1];
        if (lastPatch) {
            if (lastPatch.deleteCount === lastPatch.insert.length && patch.index - lastPatch.index === lastPatch.deleteCount) {
                lastPatch.insert.push.apply(lastPatch.insert, patch.insert);
                lastPatch.deleteCount += patch.deleteCount;
                return;
            }
        }
        patches.push(patch);
    }
    function updateDeepList(target, source, isAssign) {
        var sourceArray = this.toArray(source);
        var patches = [], lastIndex = -1;
        this.eachIndex(target, function (curVal, index) {
            lastIndex = index;
            if (index >= sourceArray.length) {
                if (!isAssign) {
                    addPatch(patches, {
                        index: index,
                        deleteCount: target.length - index + 1,
                        insert: []
                    });
                }
                return false;
            }
            var newVal = sourceArray[index];
            if (typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false) {
                addPatch(patches, {
                    index: index,
                    deleteCount: 1,
                    insert: [newVal]
                });
            } else {
                this.updateDeep(curVal, newVal);
            }
        }, this);
        if (sourceArray.length > lastIndex) {
            addPatch(patches, {
                index: lastIndex + 1,
                deleteCount: 0,
                insert: sourceArray.slice(lastIndex + 1)
            });
        }
        for (var i = 0, patchLen = patches.length; i < patchLen; i++) {
            var patch = patches[i];
            getSetReflections.splice(target, patch.index, patch.deleteCount, patch.insert);
        }
        return target;
    }
    shapeReflections = {
        each: function (obj, callback, context) {
            if (typeReflections.isIteratorLike(obj) || typeReflections.isMoreListLikeThanMapLike(obj)) {
                return this.eachIndex(obj, callback, context);
            } else {
                return this.eachKey(obj, callback, context);
            }
        },
        eachIndex: function (list, callback, context) {
            if (Array.isArray(list)) {
                return this.eachListLike(list, callback, context);
            } else {
                var iter, iterator = list[canSymbol.iterator];
                if (typeReflections.isIteratorLike(list)) {
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
                    this.eachListLike(list, callback, context);
                }
            }
            return list;
        },
        eachListLike: function (list, callback, context) {
            var index = -1;
            var length = list.length;
            if (length === undefined) {
                var size = list[sizeSymbol];
                if (size) {
                    length = size.call(list);
                } else {
                    throw new Error('can-reflect: unable to iterate.');
                }
            }
            while (++index < length) {
                var item = list[index];
                if (callback.call(context || item, item, index, list) === false) {
                    break;
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
            if (obj) {
                var enumerableKeys = this.getOwnEnumerableKeys(obj);
                var getKeyValue = obj[getKeyValueSymbol] || shiftedGetKeyValue;
                return this.eachIndex(enumerableKeys, function (key) {
                    var value = getKeyValue.call(obj, key);
                    return callback.call(context || obj, value, key, obj);
                });
            }
            return obj;
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
                return Object_Keys(obj);
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
        unwrap: makeSerializer('unwrap', [canSymbol.for('can.unwrap')]),
        serialize: makeSerializer('serialize', [
            canSymbol.for('can.serialize'),
            canSymbol.for('can.unwrap')
        ]),
        assignMap: function (target, source) {
            var hasOwnKey = fastHasOwnKey(target);
            var getKeyValue = target[getKeyValueSymbol] || shiftedGetKeyValue;
            var setKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;
            this.eachKey(source, function (value, key) {
                if (!hasOwnKey(key) || getKeyValue.call(target, key) !== value) {
                    setKeyValue.call(target, key, value);
                }
            });
            return target;
        },
        assignList: function (target, source) {
            var inserting = this.toArray(source);
            getSetReflections.splice(target, 0, inserting, inserting);
            return target;
        },
        assign: function (target, source) {
            if (typeReflections.isIteratorLike(source) || typeReflections.isMoreListLikeThanMapLike(source)) {
                this.assignList(target, source);
            } else {
                this.assignMap(target, source);
            }
            return target;
        },
        assignDeepMap: function (target, source) {
            var hasOwnKey = fastHasOwnKey(target);
            var getKeyValue = target[getKeyValueSymbol] || shiftedGetKeyValue;
            var setKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;
            this.eachKey(source, function (newVal, key) {
                if (!hasOwnKey(key)) {
                    getSetReflections.setKeyValue(target, key, newVal);
                } else {
                    var curVal = getKeyValue.call(target, key);
                    if (newVal === curVal) {
                    } else if (typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false) {
                        setKeyValue.call(target, key, newVal);
                    } else {
                        this.assignDeep(curVal, newVal);
                    }
                }
            }, this);
            return target;
        },
        assignDeepList: function (target, source) {
            return updateDeepList.call(this, target, source, true);
        },
        assignDeep: function (target, source) {
            var assignDeep = target[canSymbol.for('can.assignDeep')];
            if (assignDeep) {
                assignDeep.call(target, source);
            } else if (typeReflections.isMoreListLikeThanMapLike(source)) {
                this.assignDeepList(target, source);
            } else {
                this.assignDeepMap(target, source);
            }
            return target;
        },
        updateMap: function (target, source) {
            var sourceKeyMap = makeMap(this.getOwnEnumerableKeys(source));
            var sourceGetKeyValue = source[getKeyValueSymbol] || shiftedGetKeyValue;
            var targetSetKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;
            this.eachKey(target, function (curVal, key) {
                if (!sourceKeyMap.get(key)) {
                    getSetReflections.deleteKeyValue(target, key);
                    return;
                }
                sourceKeyMap.set(key, false);
                var newVal = sourceGetKeyValue.call(source, key);
                if (newVal !== curVal) {
                    targetSetKeyValue.call(target, key, newVal);
                }
            }, this);
            this.eachIndex(sourceKeyMap.keys(), function (key) {
                if (sourceKeyMap.get(key)) {
                    targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key));
                }
            });
            return target;
        },
        updateList: function (target, source) {
            var inserting = this.toArray(source);
            getSetReflections.splice(target, 0, target, inserting);
            return target;
        },
        update: function (target, source) {
            if (typeReflections.isIteratorLike(source) || typeReflections.isMoreListLikeThanMapLike(source)) {
                this.updateList(target, source);
            } else {
                this.updateMap(target, source);
            }
            return target;
        },
        updateDeepMap: function (target, source) {
            var sourceKeyMap = makeMap(this.getOwnEnumerableKeys(source));
            var sourceGetKeyValue = source[getKeyValueSymbol] || shiftedGetKeyValue;
            var targetSetKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;
            this.eachKey(target, function (curVal, key) {
                if (!sourceKeyMap.get(key)) {
                    getSetReflections.deleteKeyValue(target, key);
                    return;
                }
                sourceKeyMap.set(key, false);
                var newVal = sourceGetKeyValue.call(source, key);
                if (typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false) {
                    targetSetKeyValue.call(target, key, newVal);
                } else {
                    this.updateDeep(curVal, newVal);
                }
            }, this);
            this.eachIndex(sourceKeyMap.keys(), function (key) {
                if (sourceKeyMap.get(key)) {
                    targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key));
                }
            });
            return target;
        },
        updateDeepList: function (target, source) {
            return updateDeepList.call(this, target, source);
        },
        updateDeep: function (target, source) {
            var updateDeep = target[canSymbol.for('can.updateDeep')];
            if (updateDeep) {
                updateDeep.call(target, source);
            } else if (typeReflections.isMoreListLikeThanMapLike(source)) {
                this.updateDeepList(target, source);
            } else {
                this.updateDeepMap(target, source);
            }
            return target;
        },
        'in': function () {
        },
        getAllEnumerableKeys: function () {
        },
        getAllKeys: function () {
        },
        assignSymbols: function (target, source) {
            this.eachKey(source, function (value, key) {
                var symbol = typeReflections.isSymbolLike(canSymbol[key]) ? canSymbol[key] : canSymbol.for(key);
                getSetReflections.setKeyValue(target, symbol, value);
            });
            return target;
        },
        isSerializable: isSerializable,
        size: function (obj) {
            var size = obj[sizeSymbol];
            var count = 0;
            if (size) {
                return size.call(obj);
            } else if (helpers.hasLength(obj)) {
                return obj.length;
            } else if (typeReflections.isListLike(obj)) {
                this.each(obj, function () {
                    count++;
                });
                return count;
            } else if (obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        count++;
                    }
                }
                return count;
            } else {
                return undefined;
            }
        },
        defineInstanceKey: function (cls, key, properties) {
            var defineInstanceKey = cls[canSymbol.for('can.defineInstanceKey')];
            if (defineInstanceKey) {
                return defineInstanceKey.call(cls, key, properties);
            }
            var proto = cls.prototype;
            defineInstanceKey = proto[canSymbol.for('can.defineInstanceKey')];
            if (defineInstanceKey) {
                defineInstanceKey.call(proto, key, properties);
            } else {
                Object.defineProperty(proto, key, shapeReflections.assign({
                    configurable: true,
                    enumerable: !typeReflections.isSymbolLike(key),
                    writable: true
                }, properties));
            }
        }
    };
    shapeReflections.keys = shapeReflections.getOwnEnumerableKeys;
    module.exports = shapeReflections;
});
/*can-reflect@1.12.0#reflections/get-name/get-name*/
define('can-reflect/reflections/get-name/get-name', [
    'require',
    'exports',
    'module',
    'can-symbol',
    'can-reflect/reflections/type/type'
], function (require, exports, module) {
    var canSymbol = require('can-symbol');
    var typeReflections = require('can-reflect/reflections/type/type');
    var getNameSymbol = canSymbol.for('can.getName');
    function setName(obj, nameGetter) {
        if (typeof nameGetter !== 'function') {
            var value = nameGetter;
            nameGetter = function () {
                return value;
            };
        }
        Object.defineProperty(obj, getNameSymbol, { value: nameGetter });
    }
    function getName(obj) {
        var nameGetter = obj[getNameSymbol];
        if (nameGetter) {
            return nameGetter.call(obj);
        }
        if (typeof obj === 'function') {
            return obj.name;
        }
        if (obj.constructor && obj !== obj.constructor) {
            var parent = getName(obj.constructor);
            if (parent) {
                if (typeReflections.isValueLike(obj)) {
                    return parent + '<>';
                }
                if (typeReflections.isMoreListLikeThanMapLike(obj)) {
                    return parent + '[]';
                }
                if (typeReflections.isMapLike(obj)) {
                    return parent + '{}';
                }
            }
        }
        return undefined;
    }
    module.exports = {
        setName: setName,
        getName: getName
    };
});
/*can-reflect@1.12.0#types/map*/
define('can-reflect/types/map', [
    'require',
    'exports',
    'module',
    'can-reflect/reflections/shape/shape',
    'can-symbol'
], function (require, exports, module) {
    var shape = require('can-reflect/reflections/shape/shape');
    var CanSymbol = require('can-symbol');
    function keysPolyfill() {
        var keys = [];
        var currentIndex = 0;
        this.forEach(function (val, key) {
            keys.push(key);
        });
        return {
            next: function () {
                return {
                    value: keys[currentIndex],
                    done: currentIndex++ === keys.length
                };
            }
        };
    }
    if (typeof Map !== 'undefined') {
        shape.assignSymbols(Map.prototype, {
            'can.getOwnEnumerableKeys': Map.prototype.keys,
            'can.setKeyValue': Map.prototype.set,
            'can.getKeyValue': Map.prototype.get,
            'can.deleteKeyValue': Map.prototype['delete'],
            'can.hasOwnKey': Map.prototype.has
        });
        if (typeof Map.prototype.keys !== 'function') {
            Map.prototype.keys = Map.prototype[CanSymbol.for('can.getOwnEnumerableKeys')] = keysPolyfill;
        }
    }
    if (typeof WeakMap !== 'undefined') {
        shape.assignSymbols(WeakMap.prototype, {
            'can.getOwnEnumerableKeys': function () {
                throw new Error('can-reflect: WeakMaps do not have enumerable keys.');
            },
            'can.setKeyValue': WeakMap.prototype.set,
            'can.getKeyValue': WeakMap.prototype.get,
            'can.deleteKeyValue': WeakMap.prototype['delete'],
            'can.hasOwnKey': WeakMap.prototype.has
        });
    }
});
/*can-reflect@1.12.0#types/set*/
define('can-reflect/types/set', [
    'require',
    'exports',
    'module',
    'can-reflect/reflections/shape/shape',
    'can-symbol'
], function (require, exports, module) {
    var shape = require('can-reflect/reflections/shape/shape');
    var CanSymbol = require('can-symbol');
    if (typeof Set !== 'undefined') {
        shape.assignSymbols(Set.prototype, {
            'can.isMoreListLikeThanMapLike': true,
            'can.updateValues': function (index, removing, adding) {
                if (removing !== adding) {
                    shape.each(removing, function (value) {
                        this.delete(value);
                    }, this);
                }
                shape.each(adding, function (value) {
                    this.add(value);
                }, this);
            },
            'can.size': function () {
                return this.size;
            }
        });
        if (typeof Set.prototype[CanSymbol.iterator] !== 'function') {
            Set.prototype[CanSymbol.iterator] = function () {
                var arr = [];
                var currentIndex = 0;
                this.forEach(function (val) {
                    arr.push(val);
                });
                return {
                    next: function () {
                        return {
                            value: arr[currentIndex],
                            done: currentIndex++ === arr.length
                        };
                    }
                };
            };
        }
    }
    if (typeof WeakSet !== 'undefined') {
        shape.assignSymbols(WeakSet.prototype, {
            'can.isListLike': true,
            'can.isMoreListLikeThanMapLike': true,
            'can.updateValues': function (index, removing, adding) {
                if (removing !== adding) {
                    shape.each(removing, function (value) {
                        this.delete(value);
                    }, this);
                }
                shape.each(adding, function (value) {
                    this.add(value);
                }, this);
            },
            'can.size': function () {
                throw new Error('can-reflect: WeakSets do not have enumerable keys.');
            }
        });
    }
});
/*can-reflect@1.12.0#can-reflect*/
define('can-reflect', [
    'require',
    'exports',
    'module',
    'can-reflect/reflections/call/call',
    'can-reflect/reflections/get-set/get-set',
    'can-reflect/reflections/observe/observe',
    'can-reflect/reflections/shape/shape',
    'can-reflect/reflections/type/type',
    'can-reflect/reflections/get-name/get-name',
    'can-namespace',
    'can-reflect/types/map',
    'can-reflect/types/set'
], function (require, exports, module) {
    var functionReflections = require('can-reflect/reflections/call/call');
    var getSet = require('can-reflect/reflections/get-set/get-set');
    var observe = require('can-reflect/reflections/observe/observe');
    var shape = require('can-reflect/reflections/shape/shape');
    var type = require('can-reflect/reflections/type/type');
    var getName = require('can-reflect/reflections/get-name/get-name');
    var namespace = require('can-namespace');
    var reflect = {};
    [
        functionReflections,
        getSet,
        observe,
        shape,
        type,
        getName
    ].forEach(function (reflections) {
        for (var prop in reflections) {
            reflect[prop] = reflections[prop];
        }
    });
    require('can-reflect/types/map');
    require('can-reflect/types/set');
    module.exports = namespace.Reflect = reflect;
});
/*can-globals@0.3.0#can-globals-proto*/
define('can-globals/can-globals-proto', [
    'require',
    'exports',
    'module',
    'can-reflect'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var canReflect = require('can-reflect');
        function dispatch(key) {
            var handlers = this.eventHandlers[key];
            if (handlers) {
                var handlersCopy = handlers.slice();
                var value = this.getKeyValue(key);
                for (var i = 0; i < handlersCopy.length; i++) {
                    handlersCopy[i](value);
                }
            }
        }
        function Globals() {
            this.eventHandlers = {};
            this.properties = {};
        }
        Globals.prototype.define = function (key, value, enableCache) {
            if (enableCache === undefined) {
                enableCache = true;
            }
            if (!this.properties[key]) {
                this.properties[key] = {
                    default: value,
                    value: value,
                    enableCache: enableCache
                };
            }
            return this;
        };
        Globals.prototype.getKeyValue = function (key) {
            var property = this.properties[key];
            if (property) {
                if (typeof property.value === 'function') {
                    if (property.cachedValue) {
                        return property.cachedValue;
                    }
                    if (property.enableCache) {
                        property.cachedValue = property.value();
                        return property.cachedValue;
                    } else {
                        return property.value();
                    }
                }
                return property.value;
            }
        };
        Globals.prototype.makeExport = function (key) {
            return function (value) {
                if (arguments.length === 0) {
                    return this.getKeyValue(key);
                }
                if (typeof value === 'undefined' || value === null) {
                    this.deleteKeyValue(key);
                } else {
                    if (typeof value === 'function') {
                        this.setKeyValue(key, function () {
                            return value;
                        });
                    } else {
                        this.setKeyValue(key, value);
                    }
                    return value;
                }
            }.bind(this);
        };
        Globals.prototype.offKeyValue = function (key, handler) {
            if (this.properties[key]) {
                var handlers = this.eventHandlers[key];
                if (handlers) {
                    var i = handlers.indexOf(handler);
                    handlers.splice(i, 1);
                }
            }
            return this;
        };
        Globals.prototype.onKeyValue = function (key, handler) {
            if (this.properties[key]) {
                if (!this.eventHandlers[key]) {
                    this.eventHandlers[key] = [];
                }
                this.eventHandlers[key].push(handler);
            }
            return this;
        };
        Globals.prototype.deleteKeyValue = function (key) {
            var property = this.properties[key];
            if (property !== undefined) {
                property.value = property.default;
                property.cachedValue = undefined;
                dispatch.call(this, key);
            }
            return this;
        };
        Globals.prototype.setKeyValue = function (key, value) {
            if (!this.properties[key]) {
                return this.define(key, value);
            }
            var property = this.properties[key];
            property.value = value;
            property.cachedValue = undefined;
            dispatch.call(this, key);
            return this;
        };
        Globals.prototype.reset = function () {
            for (var key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    this.properties[key].value = this.properties[key].default;
                    this.properties[key].cachedValue = undefined;
                    dispatch.call(this, key);
                }
            }
            return this;
        };
        canReflect.assignSymbols(Globals.prototype, {
            'can.getKeyValue': Globals.prototype.getKeyValue,
            'can.setKeyValue': Globals.prototype.setKeyValue,
            'can.deleteKeyValue': Globals.prototype.deleteKeyValue,
            'can.onKeyValue': Globals.prototype.onKeyValue,
            'can.offKeyValue': Globals.prototype.offKeyValue
        });
        module.exports = Globals;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-globals@0.3.0#can-globals-instance*/
define('can-globals/can-globals-instance', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-globals/can-globals-proto'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var namespace = require('can-namespace');
        var Globals = require('can-globals/can-globals-proto');
        var globals = new Globals();
        if (namespace.globals) {
            throw new Error('You can\'t have two versions of can-globals, check your dependencies');
        } else {
            module.exports = namespace.globals = globals;
        }
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-globals@0.3.0#global/global*/
define('can-globals/global/global', [
    'require',
    'exports',
    'module',
    'can-globals/can-globals-instance'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var globals = require('can-globals/can-globals-instance');
        globals.define('global', function () {
            return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : typeof process === 'object' && {}.toString.call(process) === '[object process]' ? global : window;
        });
        module.exports = globals.makeExport('global');
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-util@3.10.18#js/global/global*/
define('can-util/js/global/global', [
    'require',
    'exports',
    'module',
    'can-globals/global/global'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        module.exports = require('can-globals/global/global');
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-dom-mutate@0.1.0#-observer*/
define('can-dom-mutate/-observer', [
    'require',
    'exports',
    'module',
    'can-util/js/global/global',
    'can-symbol'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var getRoot = require('can-util/js/global/global');
        var canSymbol = require('can-symbol');
        var observer;
        var listeners = [];
        function getGlobalDefault(root) {
            root = root || getRoot();
            return root.MutationObserver || root.WebKitMutationObserver || root.MozMutationObserver;
        }
        function reflect(obj, methodName, method) {
            obj[methodName] = obj[canSymbol.for('can.' + methodName)] = method;
        }
        function ref(obj) {
            return function _ref(methodName, method) {
                reflect(obj, methodName, method);
                return _ref;
            };
        }
        var domMutateObserver = {};
        ref(domMutateObserver)('getValue', function () {
            return observer;
        })('setValue', function (newObserver) {
            observer = newObserver;
            listeners.forEach(function (listener) {
                listener(observer);
            });
        })('onValue', function (listener) {
            listeners.push(listener);
        })('offValue', function (listener) {
            var index = listeners.indexOf(listener);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        });
        domMutateObserver.setValue(getGlobalDefault());
        module.exports = domMutateObserver;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-util@3.10.18#js/is-array-like/is-array-like*/
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
/*can-util@3.10.18#js/is-iterable/is-iterable*/
define('can-util/js/is-iterable/is-iterable', [
    'require',
    'exports',
    'module',
    'can-symbol'
], function (require, exports, module) {
    'use strict';
    var canSymbol = require('can-symbol');
    module.exports = function (obj) {
        return obj && !!obj[canSymbol.iterator || canSymbol.for('iterator')];
    };
});
/*can-util@3.10.18#js/each/each*/
define('can-util/js/each/each', [
    'require',
    'exports',
    'module',
    'can-util/js/is-array-like/is-array-like',
    'can-util/js/is-iterable/is-iterable',
    'can-symbol'
], function (require, exports, module) {
    'use strict';
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var has = Object.prototype.hasOwnProperty;
    var isIterable = require('can-util/js/is-iterable/is-iterable');
    var canSymbol = require('can-symbol');
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
                var iter = elements[canSymbol.iterator || canSymbol.for('iterator')]();
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
/*can-cid@1.1.2#can-cid*/
define('can-cid', [
    'require',
    'exports',
    'module',
    'can-namespace'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    var _cid = 0;
    var domExpando = 'can' + new Date();
    var cid = function (object, name) {
        var propertyName = object.nodeName ? domExpando : '_cid';
        if (!object[propertyName]) {
            _cid++;
            object[propertyName] = (name || '') + _cid;
        }
        return object[propertyName];
    };
    cid.domExpando = domExpando;
    cid.get = function (object) {
        var type = typeof object;
        var isObject = type !== null && (type === 'object' || type === 'function');
        return isObject ? cid(object) : type + ':' + object;
    };
    if (namespace.cid) {
        throw new Error('You can\'t have two versions of can-cid, check your dependencies');
    } else {
        module.exports = namespace.cid = cid;
    }
});
/*can-dom-data-state@0.2.0#can-dom-data-state*/
define('can-dom-data-state', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-cid'
], function (require, exports, module) {
    'use strict';
    var namespace = require('can-namespace');
    var CID = require('can-cid');
    var data = {};
    var isEmptyObject = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
    var setData = function (name, value) {
        var id = CID(this);
        var store = data[id] || (data[id] = {});
        if (name !== undefined) {
            store[name] = value;
        }
        return store;
    };
    var deleteNode = function () {
        var id = CID.get(this);
        var nodeDeleted = false;
        if (id && data[id]) {
            nodeDeleted = true;
            delete data[id];
        }
        return nodeDeleted;
    };
    var domDataState = {
        _data: data,
        getCid: function () {
            return CID.get(this);
        },
        cid: function () {
            return CID(this);
        },
        expando: CID.domExpando,
        get: function (key) {
            var id = CID.get(this), store = id && data[id];
            return key === undefined ? store : store && store[key];
        },
        set: setData,
        clean: function (prop) {
            var id = CID.get(this);
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
    if (namespace.domDataState) {
        throw new Error('You can\'t have two versions of can-dom-data-state, check your dependencies');
    } else {
        module.exports = namespace.domDataState = domDataState;
    }
});
/*can-globals@0.3.0#document/document*/
define('can-globals/document/document', [
    'require',
    'exports',
    'module',
    'can-globals/global/global',
    'can-globals/can-globals-instance'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        require('can-globals/global/global');
        var globals = require('can-globals/can-globals-instance');
        globals.define('document', function () {
            return globals.getKeyValue('global').document;
        });
        module.exports = globals.makeExport('document');
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-globals@0.3.0#mutation-observer/mutation-observer*/
define('can-globals/mutation-observer/mutation-observer', [
    'require',
    'exports',
    'module',
    'can-globals/global/global',
    'can-globals/can-globals-instance'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        require('can-globals/global/global');
        var globals = require('can-globals/can-globals-instance');
        globals.define('MutationObserver', function () {
            var GLOBAL = globals.getKeyValue('global');
            return GLOBAL.MutationObserver || GLOBAL.WebKitMutationObserver || GLOBAL.MozMutationObserver;
        });
        module.exports = globals.makeExport('MutationObserver');
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-cid@1.1.2#helpers*/
define('can-cid/helpers', function (require, exports, module) {
    module.exports = {
        each: function (obj, cb, context) {
            for (var prop in obj) {
                cb.call(context, obj[prop], prop);
            }
            return obj;
        }
    };
});
/*can-cid@1.1.2#set/set*/
define('can-cid/set/set', [
    'require',
    'exports',
    'module',
    'can-cid',
    'can-cid/helpers'
], function (require, exports, module) {
    'use strict';
    var getCID = require('can-cid').get;
    var helpers = require('can-cid/helpers');
    var CIDSet;
    if (typeof Set !== 'undefined') {
        CIDSet = Set;
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
            helpers.each(this.values, cb, thisArg);
        };
        CIDSet.prototype.has = function (value) {
            return getCID(value) in this.values;
        };
        CIDSet.prototype.clear = function () {
            return this.values = {};
        };
        Object.defineProperty(CIDSet.prototype, 'size', {
            get: function () {
                var size = 0;
                helpers.each(this.values, function () {
                    size++;
                });
                return size;
            }
        });
    }
    module.exports = CIDSet;
});
/*can-util@3.10.18#js/make-array/make-array*/
define('can-util/js/make-array/make-array', [
    'require',
    'exports',
    'module',
    'can-util/js/each/each',
    'can-util/js/is-array-like/is-array-like'
], function (require, exports, module) {
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
/*can-util@3.10.18#js/is-container/is-container*/
define('can-util/js/is-container/is-container', function (require, exports, module) {
    'use strict';
    module.exports = function (current) {
        return /^f|^o/.test(typeof current);
    };
});
/*can-util@3.10.18#js/get/get*/
define('can-util/js/get/get', [
    'require',
    'exports',
    'module',
    'can-util/js/is-container/is-container'
], function (require, exports, module) {
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
/*can-log@0.1.2#can-log*/
define('can-log', function (require, exports, module) {
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
/*can-log@0.1.2#dev/dev*/
define('can-log/dev/dev', [
    'require',
    'exports',
    'module',
    'can-log'
], function (require, exports, module) {
    'use strict';
    var canLog = require('can-log');
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
/*can-util@3.10.18#js/is-array/is-array*/
define('can-util/js/is-array/is-array', [
    'require',
    'exports',
    'module',
    'can-log/dev/dev'
], function (require, exports, module) {
    'use strict';
    var dev = require('can-log/dev/dev');
    var hasWarned = false;
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.10.18#js/string/string*/
define('can-util/js/string/string', [
    'require',
    'exports',
    'module',
    'can-util/js/get/get',
    'can-util/js/is-container/is-container',
    'can-log/dev/dev',
    'can-util/js/is-array/is-array'
], function (require, exports, module) {
    'use strict';
    var get = require('can-util/js/get/get');
    var isContainer = require('can-util/js/is-container/is-container');
    var canDev = require('can-log/dev/dev');
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
/*can-util@3.10.18#dom/mutation-observer/document/document*/
define('can-util/dom/mutation-observer/document/document', [
    'require',
    'exports',
    'module',
    'can-globals/document/document',
    'can-dom-data-state',
    'can-globals/mutation-observer/mutation-observer',
    'can-util/js/each/each',
    'can-cid/set/set',
    'can-util/js/make-array/make-array',
    'can-util/js/string/string'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var getDocument = require('can-globals/document/document');
        var domDataState = require('can-dom-data-state');
        var getMutationObserver = require('can-globals/mutation-observer/mutation-observer');
        var each = require('can-util/js/each/each');
        var CIDStore = require('can-cid/set/set');
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
                var MO = getMutationObserver();
                if (MO) {
                    var documentElement = getDocument().documentElement;
                    var globalObserverData = domDataState.get.call(documentElement, 'globalObserverData');
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
                        domDataState.set.call(documentElement, 'globalObserverData', globalObserverData);
                    }
                    globalObserverData.handlers.push(handler);
                }
            },
            remove: function (handler) {
                var documentElement = getDocument().documentElement;
                var globalObserverData = domDataState.get.call(documentElement, 'globalObserverData');
                if (globalObserverData) {
                    var index = globalObserverData.handlers.indexOf(handler);
                    if (index >= 0) {
                        globalObserverData.handlers.splice(index, 1);
                    }
                    if (globalObserverData.handlers.length === 0) {
                        globalObserverData.observer.disconnect();
                        domDataState.clean.call(documentElement, 'globalObserverData');
                    }
                }
            }
        };
        var makeMutationMethods = function (name) {
            var mutationName = name.toLowerCase() + 'Nodes';
            var getMutationData = function () {
                var documentElement = getDocument().documentElement;
                var mutationData = domDataState.get.call(documentElement, mutationName + 'MutationData');
                if (!mutationData) {
                    mutationData = {
                        name: mutationName,
                        handlers: [],
                        afterHandlers: [],
                        hander: null
                    };
                    if (getMutationObserver()) {
                        domDataState.set.call(documentElement, mutationName + 'MutationData', mutationData);
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
                    domDataState.clean.call(documentElement, mutationName + 'MutationData');
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
    }(), require, exports, module));
});
/*can-util@3.10.18#dom/data/data*/
define('can-util/dom/data/data', [
    'require',
    'exports',
    'module',
    'can-dom-data-state',
    'can-util/dom/mutation-observer/document/document'
], function (require, exports, module) {
    'use strict';
    var domDataState = require('can-dom-data-state');
    var mutationDocument = require('can-util/dom/mutation-observer/document/document');
    var elementSetCount = 0;
    var deleteNode = function () {
        elementSetCount -= 1;
        return domDataState.delete.call(this);
    };
    var cleanupDomData = function (node) {
        if (domDataState.get.call(node) !== undefined) {
            deleteNode.call(node);
        }
        if (elementSetCount === 0) {
            mutationDocument.offAfterRemovedNodes(cleanupDomData);
        }
    };
    module.exports = {
        getCid: domDataState.getCid,
        cid: domDataState.cid,
        expando: domDataState.expando,
        clean: domDataState.clean,
        get: domDataState.get,
        set: function (name, value) {
            if (elementSetCount === 0) {
                mutationDocument.onAfterRemovedNodes(cleanupDomData);
            }
            elementSetCount += domDataState.get.call(this) ? 0 : 1;
            domDataState.set.call(this, name, value);
        },
        delete: deleteNode,
        _getElementSetCount: function () {
            return elementSetCount;
        }
    };
});
/*can-cid@1.1.2#map/map*/
define('can-cid/map/map', [
    'require',
    'exports',
    'module',
    'can-cid',
    'can-cid/helpers'
], function (require, exports, module) {
    'use strict';
    var getCID = require('can-cid').get;
    var helpers = require('can-cid/helpers');
    var CIDMap;
    if (typeof Map !== 'undefined') {
        CIDMap = Map;
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
            helpers.each(this.values, function (pair) {
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
        CIDMap.prototype.clear = function () {
            return this.values = {};
        };
        Object.defineProperty(CIDMap.prototype, 'size', {
            get: function () {
                var size = 0;
                helpers.each(this.values, function () {
                    size++;
                });
                return size;
            }
        });
    }
    module.exports = CIDMap;
});
/*can-util@3.10.18#js/cid-map/cid-map*/
define('can-util/js/cid-map/cid-map', [
    'require',
    'exports',
    'module',
    'can-cid/map/map'
], function (require, exports, module) {
    'use strict';
    module.exports = require('can-cid/map/map');
});
/*can-util@3.10.18#js/set-immediate/set-immediate*/
define('can-util/js/set-immediate/set-immediate', [
    'require',
    'exports',
    'module',
    'can-globals/global/global'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var global = require('can-globals/global/global')();
        module.exports = global.setImmediate || function (cb) {
            return setTimeout(cb, 0);
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-dom-mutate@0.1.0#can-dom-mutate*/
define('can-dom-mutate', [
    'require',
    'exports',
    'module',
    'can-util/js/each/each',
    'can-util/dom/data/data',
    'can-util/js/cid-map/cid-map',
    'can-util/js/set-immediate/set-immediate',
    'can-dom-mutate/-observer'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var each = require('can-util/js/each/each');
        var domData = require('can-util/dom/data/data');
        var CIDMap = require('can-util/js/cid-map/cid-map');
        var setImmediate = require('can-util/js/set-immediate/set-immediate');
        var observer = require('can-dom-mutate/-observer');
        var domMutate;
        function eliminate(array, item) {
            var index = array.indexOf(item);
            if (index >= 0) {
                array.splice(index, 1);
            }
        }
        function batch(processBatchItems) {
            var waitingBatch = [];
            var waitingCalls = [];
            var isPrimed = false;
            return function batchAdd(items, callback) {
                waitingBatch = waitingBatch.concat(items);
                if (callback) {
                    waitingCalls.push(callback);
                }
                var shouldPrime = !isPrimed && waitingBatch.length > 0;
                if (shouldPrime) {
                    isPrimed = true;
                    setImmediate(function processBatch() {
                        var currentBatch = waitingBatch;
                        waitingBatch = [];
                        var currentCalls = waitingCalls;
                        waitingCalls = [];
                        isPrimed = false;
                        processBatchItems(currentBatch);
                        currentCalls.forEach(function (callback) {
                            callback();
                        });
                    });
                }
            };
        }
        function getDocument(target) {
            return target.ownerDocument || target.document || target;
        }
        function isDocumentElement(node) {
            return getDocument(node).documentElement === node;
        }
        function getDocumentListeners(target, key) {
            var doc = getDocument(target);
            var data = domData.get.call(doc, key);
            if (data) {
                return data.listeners;
            }
        }
        function getTargetListeners(target, key) {
            var doc = getDocument(target);
            var targetListenersMap = domData.get.call(doc, key);
            if (!targetListenersMap) {
                return;
            }
            return targetListenersMap.get(target);
        }
        function addTargetListener(target, key, listener) {
            var doc = getDocument(target);
            var targetListenersMap = domData.get.call(doc, key);
            if (!targetListenersMap) {
                targetListenersMap = new CIDMap();
                domData.set.call(doc, key, targetListenersMap);
            }
            var targetListeners = targetListenersMap.get(target);
            if (!targetListeners) {
                targetListeners = [];
                targetListenersMap.set(target, targetListeners);
            }
            targetListeners.push(listener);
        }
        function removeTargetListener(target, key, listener) {
            var doc = getDocument(target);
            var targetListenersMap = domData.get.call(doc, key);
            if (!targetListenersMap) {
                return;
            }
            var targetListeners = targetListenersMap.get(target);
            if (!targetListeners) {
                return;
            }
            eliminate(targetListeners, listener);
            if (targetListeners.size === 0) {
                targetListenersMap['delete'](target);
                if (targetListenersMap.size === 0) {
                    domData.clean.call(doc, key);
                }
            }
        }
        function dispatch(listenerKey, documentDataKey, isAttributes) {
            return function dispatchEvents(events) {
                for (var e = 0; e < events.length; e++) {
                    var event = events[e];
                    var target = isAttributes ? event.node : event;
                    var targetListeners = getTargetListeners(target, listenerKey);
                    if (targetListeners) {
                        for (var t = 0; t < targetListeners.length; t++) {
                            targetListeners[t](event);
                        }
                    }
                    if (!documentDataKey) {
                        return;
                    }
                    var documentListeners = getDocumentListeners(target, documentDataKey);
                    if (documentListeners) {
                        for (var l = 0; l < documentListeners.length; l++) {
                            documentListeners[l](event);
                        }
                    }
                }
            };
        }
        function observeMutations(target, observerKey, config, handler) {
            var MutationObserver = observer.getValue();
            if (!MutationObserver) {
                return function () {
                };
            }
            var observerData = domData.get.call(target, observerKey);
            if (!observerData) {
                var targetObserver = new MutationObserver(handler);
                targetObserver.observe(target, config);
                observerData = {
                    observer: targetObserver,
                    observingCount: 0
                };
                domData.set.call(target, observerKey, observerData);
            }
            observerData.observingCount++;
            return function stopObservingMutations() {
                var observerData = domData.get.call(target, observerKey);
                if (observerData) {
                    observerData.observingCount--;
                    if (observerData.observingCount <= 0) {
                        observerData.observer.disconnect();
                        domData.clean.call(target, observerKey);
                    }
                }
            };
        }
        function handleTreeMutations(mutations) {
            mutations.forEach(function (mutation) {
                each(mutation.addedNodes, function (node) {
                    domMutate.dispatchNodeInsertion(node);
                });
                each(mutation.removedNodes, function (node) {
                    domMutate.dispatchNodeRemoval(node);
                });
            });
        }
        function handleAttributeMutations(mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes') {
                    var node = mutation.target;
                    var attributeName = mutation.attributeName;
                    var oldValue = mutation.oldValue;
                    domMutate.dispatchNodeAttributeChange(node, attributeName, oldValue);
                }
            });
        }
        var treeMutationConfig = {
            subtree: true,
            childList: true
        };
        var attributeMutationConfig = {
            attributes: true,
            attributeOldValue: true
        };
        function subscription(fn) {
            return function _subscription() {
                var disposal = fn.apply(this, arguments);
                var isDisposed = false;
                return function _disposal() {
                    if (isDisposed) {
                        var fnName = fn.name || fn.displayName || 'an anonymous function';
                        var message = 'Disposal function returned by ' + fnName + ' called more than once.';
                        throw new Error(message);
                    }
                    disposal.apply(this, arguments);
                    isDisposed = true;
                };
            };
        }
        function addNodeListener(listenerKey, observerKey, isAttributes) {
            return subscription(function _addNodeListener(target, listener) {
                var stopObserving;
                if (isAttributes) {
                    stopObserving = observeMutations(target, observerKey, attributeMutationConfig, handleAttributeMutations);
                } else {
                    stopObserving = observeMutations(getDocument(target).documentElement, observerKey, treeMutationConfig, handleTreeMutations);
                }
                addTargetListener(target, listenerKey, listener);
                return function removeNodeListener() {
                    stopObserving();
                    removeTargetListener(target, listenerKey, listenerKey);
                };
            });
        }
        function addGlobalListener(globalDataKey, addNodeListener) {
            return subscription(function addGlobalGroupListener(documentElement, listener) {
                if (!isDocumentElement(documentElement)) {
                    throw new Error('Global mutation listeners must pass a documentElement');
                }
                var doc = getDocument(documentElement);
                var documentData = domData.get.call(doc, globalDataKey);
                if (!documentData) {
                    documentData = { listeners: [] };
                    domData.set.call(doc, globalDataKey, documentData);
                }
                var listeners = documentData.listeners;
                if (listeners.length === 0) {
                    documentData.removeListener = addNodeListener(doc, function () {
                    });
                }
                listeners.push(listener);
                return function removeGlobalGroupListener() {
                    var documentData = domData.get.call(doc, globalDataKey);
                    if (!documentData) {
                        return;
                    }
                    var listeners = documentData.listeners;
                    eliminate(listeners, listener);
                    if (listeners.length === 0) {
                        documentData.removeListener();
                        domData.clean.call(doc, globalDataKey);
                    }
                };
            });
        }
        function toNodes(child) {
            var isFragment = child.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
            if (!isFragment) {
                return [child];
            }
            var children = [];
            var node = child.firstChild;
            while (node) {
                var nodes = toNodes(child);
                for (var i = 0; i < nodes.length; i++) {
                    children.push(nodes[i]);
                }
                node = node.nextSibling;
            }
            return children;
        }
        var domMutationPrefix = 'domMutation';
        var insertionDataKey = domMutationPrefix + 'InsertionData';
        var removalDataKey = domMutationPrefix + 'RemovalData';
        var attributeChangeDataKey = domMutationPrefix + 'AttributeChangeData';
        var documentRemovalDataKey = domMutationPrefix + 'DocumentRemovalData';
        var treeDataKey = domMutationPrefix + 'TreeData';
        var attributeDataKey = domMutationPrefix + 'AttributeData';
        var dispatchInsertion = batch(dispatch(insertionDataKey));
        var dispatchRemoval = batch(dispatch(removalDataKey, documentRemovalDataKey));
        var dispatchAttributeChange = batch(dispatch(attributeChangeDataKey, null, true));
        var addNodeInsertionListener = addNodeListener(insertionDataKey, treeDataKey);
        var addNodeRemovalListener = addNodeListener(removalDataKey, treeDataKey);
        var addNodeAttributeChangeListener = addNodeListener(attributeChangeDataKey, attributeDataKey, true);
        var addRemovalListener = addGlobalListener(documentRemovalDataKey, addNodeRemovalListener);
        domMutate = {
            dispatchNodeInsertion: function (node, callback) {
                dispatchInsertion(toNodes(node), callback);
            },
            dispatchNodeRemoval: function (node, callback) {
                dispatchRemoval(toNodes(node), callback);
            },
            dispatchNodeAttributeChange: function (node, attributeName, oldValue, callback) {
                dispatchAttributeChange({
                    node: node,
                    attributeName: attributeName,
                    oldValue: oldValue
                }, callback);
            },
            onNodeInsertion: addNodeInsertionListener,
            onNodeRemoval: addNodeRemovalListener,
            onNodeAttributeChange: addNodeAttributeChangeListener,
            onRemoval: addRemovalListener
        };
        module.exports = domMutate;
    }(function () {
        return this;
    }(), require, exports, module));
});
/*can-dom-mutate@0.1.0#node*/
define('can-dom-mutate/node', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign',
    'can-dom-mutate/-observer',
    'can-dom-mutate'
], function (require, exports, module) {
    'use strict';
    var assign = require('can-util/js/assign/assign');
    var observer = require('can-dom-mutate/-observer');
    var domMutate = require('can-dom-mutate');
    function isInDocument(node) {
        var root = node.ownerDocument.documentElement;
        if (root === node) {
            return true;
        }
        return root.contains(node);
    }
    var synthetic = {
        dispatchNodeInsertion: function (container, node) {
            if (isInDocument(node)) {
                domMutate.dispatchNodeInsertion(node);
            }
        },
        dispatchNodeRemoval: function (container, node) {
            if (isInDocument(container) && !isInDocument(node)) {
                domMutate.dispatchNodeRemoval(node);
            }
        }
    };
    var compat = {
        replaceChild: function (newChild, oldChild) {
            var result = this.replaceChild(newChild, oldChild);
            synthetic.dispatchNodeRemoval(this, oldChild);
            synthetic.dispatchNodeInsertion(this, newChild);
            return result;
        },
        setAttribute: function (name, value) {
            var oldAttributeValue = this.getAttribute(name);
            var result = this.setAttribute(name, value);
            domMutate.dispatchNodeAttributeChange(this, name, oldAttributeValue);
            return result;
        }
    };
    var compatData = [
        [
            'appendChild',
            'Insertion'
        ],
        [
            'insertBefore',
            'Insertion'
        ],
        [
            'removeChild',
            'Removal'
        ]
    ];
    compatData.forEach(function (pair) {
        var nodeMethod = pair[0];
        var dispatchMethod = 'dispatchNode' + pair[1];
        compat[nodeMethod] = function (node) {
            var result = this[nodeMethod].apply(this, arguments);
            synthetic[dispatchMethod](this, node);
            return result;
        };
    });
    var normal = {};
    var nodeMethods = [
        'appendChild',
        'insertBefore',
        'removeChild',
        'replaceChild',
        'setAttribute'
    ];
    nodeMethods.forEach(function (methodName) {
        normal[methodName] = function () {
            return this[methodName].apply(this, arguments);
        };
    });
    var mutate = {};
    function setMutateStrategy(observer) {
        var strategy = observer ? normal : compat;
        assign(mutate, strategy);
    }
    setMutateStrategy(observer.getValue());
    observer.onValue(setMutateStrategy);
    module.exports = mutate;
});
/*can-view-nodelist@4.0.0-pre.3#can-view-nodelist*/
define('can-view-nodelist', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-dom-mutate/node'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    var domMutate = require('can-dom-mutate/node');
    var nodeMap = new Map(), splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
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
            var map = new Map();
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
            var arr = [];
            for (var i = 0, ref = arr.length = newNodes.length; i < ref; i++) {
                arr[i] = newNodes[i];
            }
            newNodes = arr;
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
            for (var n = 0; n < nodeList.length; n++) {
                var node = nodeList[n];
                if (node.nodeType) {
                    if (!nodeList.replacements) {
                        nodeMap['delete'](node);
                    }
                    nodes.push(node);
                } else {
                    push.apply(nodes, nodeLists.unregister(node, true));
                }
            }
            var deepChildren = nodeList.deepChildren;
            if (deepChildren) {
                for (var l = 0; l < deepChildren.length; l++) {
                    nodeLists.unregister(deepChildren[l], true);
                }
            }
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
            for (var i = 0; i < elementsToBeRemoved.length; i++) {
                domMutate.removeChild.call(parent, elementsToBeRemoved[i]);
            }
        },
        nodeMap: nodeMap
    };
    module.exports = namespace.nodeLists = nodeLists;
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : window);