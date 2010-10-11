var EventEmitter = require('events').EventEmitter;
var Hash = require('traverse').Hash;

Lazy.prototype = new EventEmitter;
module.exports = Lazy;
function Lazy (em) {
    if (!(this instanceof Lazy)) return new Lazy(em);
    var self = this;

    function newLazy (g, h) {
        if (!g) g = function () { return true };
        if (!h) h = function (x) { return x };
        var lazy = new Lazy;
        self.on('data', function (x) {
            if (g.call(lazy, x)) lazy.emit('data', h(x));
        });
        self.on('end', function () { lazy.emit('end') });
        return lazy;
    }

    self.filter = function (f) {
        return newLazy(function (x) {
            return f(x);
        });
    }

    self.forEach = function (f) {
        return newLazy(function (x) {
            f(x);
            return true;
        });
    }

    self.map = function (f) {
        return newLazy(
            function () { return true },
            function (x) { return f(x) }
        );
    }

    self.take = function (n) {
        return newLazy(function () {
            return n-- > 0;
        });
    }

    self.takeWhile = function (f) {
        var cond = true;
        return newLazy(function (x) {
            if (cond && f(x)) return true;
            cond = false;
            return false;
        });
    }

    self.join = function (f) {
        var data = []
        var lazy = newLazy(function (x) {
            data.push(x);
            return true;
        });
        lazy.on('end', function () { f(data) });
        return lazy;
    }
}

