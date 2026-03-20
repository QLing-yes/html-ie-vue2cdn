/**
 * ES标准库 Polyfill - 增强兼容性
 * 仅包含 core-js 完全未覆盖的
 */
(function (global) {
  /** @type {typeof Array.prototype} */
  var AP = Array.prototype;
  /** @type {typeof String.prototype} */
  var SP = String.prototype;

  /**
   * 定义属性
   * @param {object} obj 目标对象
   * @param {string} key 属性名
   * @param {*} value 属性值
   */
  function def(obj, key, value) { Object.defineProperty(obj, key, { value: value, writable: true, configurable: true }); }

  // ---------- Promise (ES2024 新特性，core-js 未覆盖) ----------
  /** @type {PromiseConstructor['withResolvers']} */
  if (!Promise.withResolvers) {
    Promise.withResolvers = function () { var r, j, p = new Promise(function (res, rej) { r = res; j = rej; }); return { promise: p, resolve: r, reject: j }; };
  }

  // ---------- String (ES2021 新特性，core-js 未覆盖) ----------
  /** @type {String['prototype']['replaceAll']} */
  if (!SP.replaceAll) {
    def(SP, 'replaceAll', function (search, replace) {
      return this.split(search).join(typeof replace === 'function' ? replace : replace);
    });
  }

  // ---------- Symbol (IE11 完全不存在) ----------
  if (typeof Symbol === 'undefined') {
    var id = 0;
    global.Symbol = function (d) { return '__symbol_' + (d || '') + '_' + ++id; };
    global.Symbol.iterator = global.Symbol('Symbol.iterator');
    def(Symbol.prototype, 'toString', function () { return this.toString(); });
  }

  // ---------- Set (IE11 完全不存在) ----------
  if (typeof Set === 'undefined') {
    global.Set = function (it) {
      this._v = [];
      if (it) { for (var i = 0; i < it.length; i++) this.add(it[i]); }
    };
    def(global.Set.prototype, 'add', function (v) { if (!this.has(v)) this._v.push(v); return this; });
    def(global.Set.prototype, 'has', function (v) { return this._v.indexOf(v) !== -1; });
    def(global.Set.prototype, 'delete', function (v) { var i = this._v.indexOf(v); if (i !== -1) { this._v.splice(i, 1); return true; } return false; });
    def(global.Set.prototype, 'clear', function () { this._v = []; });
    Object.defineProperty(global.Set.prototype, 'size', { get: function () { return this._v.length; }, configurable: true });
    def(global.Set.prototype, 'forEach', function (fn, ctx) { for (var i = 0; i < this._v.length; i++) fn.call(ctx, this._v[i], this._v[i], this); });
  }

  // ---------- Map (IE11 完全不存在) ----------
  if (typeof Map === 'undefined') {
    global.Map = function (it) {
      this._e = [];
      if (it) { for (var i = 0; i < it.length; i++) this.set(it[i][0], it[i][1]); }
    };
    def(global.Map.prototype, 'set', function (k, v) { var e; if ((e = this._e.find(function (x) { return x[0] === k; }))) e[1] = v; else this._e.push([k, v]); return this; });
    def(global.Map.prototype, 'get', function (k) { var e = this._e.find(function (x) { return x[0] === k; }); return e ? e[1] : undefined; });
    def(global.Map.prototype, 'has', function (k) { return this._e.some(function (x) { return x[0] === k; }); });
    def(global.Map.prototype, 'delete', function (k) { var i = this._e.findIndex(function (x) { return x[0] === k; }); if (i !== -1) { this._e.splice(i, 1); return true; } return false; });
    def(global.Map.prototype, 'clear', function () { this._e = []; });
    Object.defineProperty(global.Map.prototype, 'size', { get: function () { return this._e.length; }, configurable: true });
    def(global.Map.prototype, 'forEach', function (fn, ctx) { for (var i = 0; i < this._e.length; i++) fn.call(ctx, this._e[i][1], this._e[i][0], this); });
  }

  // ---------- WeakSet ----------
  if (typeof WeakSet === 'undefined') {
    global.WeakSet = function () { this._v = []; };
    def(global.WeakSet.prototype, 'add', function (v) { if (!this.has(v)) this._v.push(v); return this; });
    def(global.WeakSet.prototype, 'has', function (v) { return this._v.indexOf(v) !== -1; });
    def(global.WeakSet.prototype, 'delete', function (v) { var i = this._v.indexOf(v); if (i !== -1) { this._v.splice(i, 1); return true; } return false; });
  }

  // ---------- WeakMap ----------
  if (typeof WeakMap === 'undefined') {
    global.WeakMap = function () { this._e = []; };
    def(global.WeakMap.prototype, 'set', function (k, v) { var e; if ((e = this._e.find(function (x) { return x[0] === k; }))) e[1] = v; else this._e.push([k, v]); return this; });
    def(global.WeakMap.prototype, 'get', function (k) { var e = this._e.find(function (x) { return x[0] === k; }); return e ? e[1] : undefined; });
    def(global.WeakMap.prototype, 'has', function (k) { return this._e.some(function (x) { return x[0] === k; }); });
    def(global.WeakMap.prototype, 'delete', function (k) { var i = this._e.findIndex(function (x) { return x[0] === k; }); if (i !== -1) { this._e.splice(i, 1); return true; } return false; });
  }

})(typeof window !== 'undefined' ? window : global);