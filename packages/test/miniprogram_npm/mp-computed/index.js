module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1547629816737, function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dep_1 = require("./dep");
var watcher_1 = require("./watcher");
// merge mixins into page's options
function mergeOptions(origin, mixin) {
    var result = Object.assign({}, origin);
    Object.keys(mixin)
        .forEach(function (key) {
        var newProp = mixin[key];
        var oldProp = result[key];
        switch (Object.prototype.toString.call(newProp)) {
            case '[object Function]':
                result[key] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _a;
                    (_a = mixin[key]).call.apply(_a, [this].concat(args));
                    oldProp && (typeof oldProp === 'function') && oldProp.call.apply(oldProp, [this].concat(args));
                };
                break;
            case '[object Object]':
                result[key] = Object.assign({}, mixin[key], result[key]);
                break;
            default:
                result[key] = oldProp === undefined ? newProp : oldProp;
        }
    });
    return result;
}
exports.mergeOptions = mergeOptions;
// change page.data to reactive
function defineReactive(obj, key, val) {
    var property = Object.getOwnPropertyDescriptor(obj, key);
    var getter = property && property.get;
    var setter = property && property.set;
    var dep = new dep_1.default(key);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            var value = getter ? getter.call(this) : val;
            if (dep_1.default.target) {
                dep.depend();
            }
            return value;
        },
        set: function (newVal) {
            var value = getter ? getter.call(this) : val;
            if (value === newVal) {
                return;
            }
            if (setter) {
                setter.call(this, newVal);
            }
            else {
                val = newVal;
            }
            dep.notify();
        }
    });
    if (['[object Object]', '[object Array]'].indexOf(objToStringCall(val)) >= 0) {
        Object.keys(val)
            .forEach(function (subKey) { return defineReactive(obj[key], subKey, obj[key][subKey]); });
    }
}
exports.defineReactive = defineReactive;
function defineComputed(page, parent, key, userDef) {
    page.__watchers__ = page.__watchers__ || {};
    var watcher = page.__watchers__[key] = new watcher_1.default(page, key, userDef);
    var propertyDefinition = {
        enumerable: true,
        configurable: true,
        set: function () { },
        get: function () {
            dep_1.default.target = watcher;
            if (watcher.dirty) {
                watcher.evaluate();
            }
            dep_1.default.target = null;
            return watcher.value;
        }
    };
    Object.defineProperty(parent, key, propertyDefinition);
}
exports.defineComputed = defineComputed;
function createReactive() {
    var _this = this;
    if (this.data) {
        Object.keys(this.data)
            .forEach(function (key) {
            if (key !== '__webviewId__') {
                defineReactive(_this.data, key, _this.data[key]);
            }
        });
        Object.keys(this.computed)
            .filter(function (key) { return !_this.data.hasOwnProperty(key); })
            .forEach(function (key) { return defineComputed(_this, _this.data, key, _this.computed[key]); });
    }
}
exports.createReactive = createReactive;
function hookSetData() {
    var _this = this;
    var setData = this.setData;
    this.setData = function (newData, callback) {
        // 兼容调用 setData 时 key 为路径形式的写法
        Object.keys(newData)
            .forEach(function (key) {
            if (key.indexOf('.') > 0 || key.indexOf('[') > 0) {
                safeSet(_this.data, key, newData[key]);
            }
        });
        Object.assign(_this.data, newData);
        // 初始化计算属性，并收集依赖
        if (_this.__watchers__) {
            Object.keys(_this.__watchers__)
                .filter(function (currKey) { return _this.__watchers__[currKey].dirty; })
                .reduce(function (acc, currKey) {
                acc[currKey] = _this.data[currKey];
                return acc;
            }, newData);
        }
        setData.call(_this, newData, callback);
    };
    // 调用一次 setData，用于初始化计算属性和依赖收集
    this.setData({});
}
exports.hookSetData = hookSetData;
function objToStringCall(param) {
    return Object.prototype.toString.call(param);
}
exports.objToStringCall = objToStringCall;
function safeSet(obj, props, value) {
    var propsArr = props
        .replace(/\[([^\[\]]*)\]/g, '.$1.')
        .split('.')
        .filter(function (key) { return key !== ''; });
    var lastIdx = propsArr.length - 1;
    propsArr
        .reduce(function (prev, curr, idx) {
        if (idx !== lastIdx) {
            if (['[object Object]', '[object Array]'].indexOf(objToStringCall(prev[curr])) < 0) {
                prev[curr] = {};
            }
            return prev[curr];
        }
        prev[curr] = value;
    }, obj);
    return obj;
}

}, function(modId) {var map = {"./dep":1547629816738,"./watcher":1547629816739}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547629816738, function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uid = 0;
var Dep = /** @class */ (function () {
    function Dep(key) {
        this.sub = [];
        this.uid = ++uid;
        this.key = key;
    }
    Dep.prototype.depend = function () {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    };
    Dep.prototype.addSub = function (watcher) {
        this.sub.push(watcher);
    };
    Dep.prototype.notify = function () {
        this.sub.forEach(function (watcher) { return watcher.dirty = true; });
    };
    return Dep;
}());
exports.default = Dep;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1547629816739, function(require, module, exports) {
"use strict";
/// <reference path="../libs/page.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var Watcher = /** @class */ (function () {
    function Watcher(page, key, getter) {
        this.dirty = true;
        this.depIds = new Set();
        this.deps = [];
        this.page = page;
        this.key = key;
        this.getter = getter;
    }
    Watcher.prototype.evaluate = function () {
        if (this.dirty) {
            this.dirty = false;
            this.value = this.getter.call(this.page);
            return this.value;
        }
    };
    Watcher.prototype.addDep = function (dep) {
        var uid = dep.uid;
        if (!this.depIds.has(uid)) {
            this.depIds.add(uid);
            this.deps.push(dep);
            dep.addSub(this);
        }
    };
    return Watcher;
}());
exports.default = Watcher;
;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1547629816737);
})()
//# sourceMappingURL=index.js.map