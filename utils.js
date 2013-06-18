function print(str) {
	document.body.appendChild(document.createTextNode(str));
	return str;
}

function time(func/*, args*/) {
	var args = [].slice.call(arguments,1);
	var start = +new Date;
	var answer = func.apply(undefined, args);
	var end = +new Date;
	print(answer);
	print("\nTook " + (end-start) + "ms.");
	return answer;
}

function isIterable(x) {
	if(x && typeof x.forEach == 'function') return true;
	if(typeof x == 'object') return true;
	return false;
}
function toIterable(x) {
	if(x && typeof x.forEach == 'function') return x;
	if(typeof x == 'object') {
		var map = new Map();
		for(var k in x) {
			map.set(k, x[k]);
		}
		return map;
	}
	return new Map();
}

function Set(iter) {
	this._data = {};
	if(isIterable(iter)) {
		toIterable(iter).forEach(this.add.bind(this));
	}
}
Set.prototype.constructor = Set;
Set.prototype.add = function(x) {
	this._data[x] = true;
}
Set.prototype.has = function(x) {
	return !!this._data[x];
}
Set.prototype.delete = function(x) {
	if(this.has(x)) {
		delete this._data[x];
		return true;
	}
	return false;
}
Set.prototype.clear = function() {
	var hasItems = !!this._data.length;
	this._data = {};
	return hasItems;
}
Set.prototype.forEach = function(func) {
	for(var v in this._data) {
		func.call(this, v);
	}
}
Set.prototype.values = function() {
	var arr = [];
	this.forEach(function(x){ arr.push(x); });
	return arr;
}
Set.prototype.union = function(that) {
	for(var x in that._data) {
		this.add(x);
	}
	return this;
}
Set.prototype.minus = function(that) {
	for(var x in that._data) {
		this.delete(x);
	}
	return this;
}
Set.prototype.intersect = function(that) {
	var self = this;
	this.values.forEach(function(x){ if(!that.has(x)) self.delete(x); });
}
Set.prototype.clone = function() {
	return new Set(this);
}
Set.prototype.toString = function() {
	return "Set(["+this.values()+"])";
}


function Map(iter) {
	this._data = {};
	if(isIterable(iter)) {
		var self = this;
		toIterable(iter).forEach(function(v,k){ self.set(k,v); });
	}
}
Map.prototype.constructor = Map;
Map.prototype.get = function(k) {
	return this._data[k];
}
Map.prototype.set = function(k,v) {
	this._data[k] = v;
}
Map.prototype.has = function(k) {
	return k in this._data;
}
Map.prototype.delete = function(k) {
	if(this.has(k)) {
		delete this._data[k];
		return true;
	}
	return false;
}
Map.prototype.clear = function() {
	var hasItems = !!this._data.length;
	this._data = {};
	return hasItems;
}
Map.prototype.forEach = function(func) {
	for(var k in this._data) {
		func.call(this, this._data[k], k);
	}
}
Map.prototype.reduce = function(func, accum) {
	this.forEach(function(v,k) {
		if(accum === undefined) {
			accum = v;
			return;
		}
		accum = func(accum, v, k);
	});
	return accum;
}
Map.prototype.keys = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push(k); });
	return arr;
}
Map.prototype.values = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push(v); });
	return arr;
}
Map.prototype.items = function() {
	var arr = [];
	this.forEach(function(v,k){ arr.push([k,v]); });
	return arr;
}
Map.prototype.union = function(iter, conflictFunc) {
	// conflictFunc is called whenever a key exists in both maps.
	// It's passed (thisv, thatv, k, this, that), and must return a new v.
	var that = new Map(iter);
	var self = this;
	that.forEach(function(v,k) {
		if(self.has(k)) {
			var newv = conflictFunc(self.get(k), v, k, self, that);
			self.set(k, newv);
		} else {
			self.set(k,v);
		}
	});
	return this;
}
Map.prototype.intersect = function(iter, conflictFunc) {
	// conflictFunc same as in Map#union
	var that = new Map(iter);
	var self = this;
	this.items().forEach(function(i) {
		var k = i[0], v = i[1];
		if(that.has(k)) {
			var newv = conflictFunc(v, that.get(k), k, self, that);
			set.set(k, newv);
		} else {
			set.delete(k,v);
		}
	})
}
Map.prototype.clone = function() {
	return new Map(this);
}
Map.prototype.toString = function() {
	var arr = [];
	this.forEach(function(v,k) {
		arr.push("'"+k+"':'"+v+"'");
	});
	return "Map({" + arr.join(', ') + "})";
}


function Counter(iter) {
	if(iter === undefined) iter = [];
	if(isIterable(iter)) {
		var newiter = new Map();
		toIterable(iter).forEach(function(v,k) {
			newiter.set(k, +v);
		});
		return Map.call(this, newiter);
	} else {
		return Map.call(this);
	}
}
Counter.prototype = Object.create(Map.prototype);
Counter.prototype.constructor = Counter;
Counter.prototype.get = function(k) {
	if(this.has(k)) {
		return +Map.prototype.get.call(this, k);
	} else {
		return 0;
	}
}
Counter.prototype.set = function(k,v) {
	v = +v;
	Map.prototype.set.call(this, k, v);
}
Counter.prototype.inc = function(k,v) {
	if(v === undefined) v = 1;
	v = +v;
	if(this.has(k)) {
		this.set(k, this.get(k) + v);
	} else {
		this.set(k, v);
	}
	return this.get(k);
}
Counter.prototype.dec = function(k,v) {
	if(v === undefined) v = 1;
	return this.inc(k,-v);
}
Counter.prototype.add = function(iter) {
	var that = new Counter(iter);
	var self = this;
	that.forEach(function(v,k) {
		self.inc(k,v);
	});
	return this;
}
Counter.prototype.sub = function(iter) {
	var that = new Counter(iter);
	var self = this;
	that.forEach(function(v,k) {
		self.dec(k,v);
	});
	return this;
}
Counter.prototype.min = function(iter) {
	return Map.prototype.union.call(this, iter, function(a,b){return Math.min(a,b);});
}
Counter.prototype.max = function(iter) {
	return Map.prototype.union.call(this, iter, function(a,b){return Math.max(a,b);});
}
Counter.prototype.clone = function() {
	return new Counter(this);
}
Counter.prototype.toString = function() {
	var arr = [];
	this.forEach(function(v,k) {
		arr.push("'"+k+"':"+v);
	});
	return "Counter({" + arr.join(', ') + "})";
}

function Factors(num) {
	Counter.call(this);
	if(num !== undefined) this.of(num);
}
Factors.prototype = Object.create(Counter.prototype);
Factors.prototype.constructor = Factors;
Factors.prototype.of = function(x, startIndex) {
	if(startIndex === undefined) {
		startIndex = 0;
		this.clear();
	}
	if(x == 1) return this;
	for(var i = startIndex; i < primes.length; i++) {
		var prime = primes[i];
		if(x%prime == 0) {
			this.inc(prime);
			return this.of(x/prime, i);
		}
	}
}
Factors.prototype.toNum = function() {
	var product = 1;
	this.forEach(function(e,b) {
		product *= Math.pow(b, e);
	});
	return product;
}
Factors.prototype.toString = function() {
	var arr = [];
	this.forEach(function(e,b) {
		arr.push(b+"^"+e);
	});
	return arr.join(' * ');
}
Factors.prototype.countDivisors = function() {
	var count = 1;
	this.forEach(function(e,b) {
		count *= e+1;
	});
	return count;
}

function isPrime(x) {
	if(x <= maxPrime) return !!primeMap[x];
	if(x <= maxPrime*maxPrime) return isPrimeUsingList(x);
	return isPrimeManually(x);
}

function isPrimeUsingList(x) {
	var limit = Math.sqrt(x);
	for(var i = 0; i < primes.length; i++) {
		var prime = primes[i];
		if(x % prime == 0) return false;
		if(prime > limit) return true;
	}
	return true;
}

function isPrimeManually(x) {
	// Hit the easiest cases.
	if(x%2 == 0 || x%3 == 0) return false;

	// Otherwise, we're doing the mod6 +- 1 trick,
	// since we've eliminated the other 4/6 numbers.
	var start = maxPrime + 2;
	start = Math.floor(start/6)*6;
	var limit = Math.sqrt(x);
	for(var i = start; i < limit; i++) {
		if(x % (i+1) == 0) return false;
		if(x % (i+5) == 0) return false;
		if(i > limit) return true;
	}
}

function regenPrimeList(end) {
	// Bootstrap this with:
	// var primes = [2,3,5];
	// var primeMap = {2:1,3:1,5:1};
	// var maxPrime = 5;
	for(var i = maxPrime + 2; i < end; i+=2) {
		if(isPrime(i)) primes.push(i);
	}
	print("var primes = [");
	for(var i = 0; i < primes.length; i+=100) {
		print(primes.slice(i, i+100) + ',');
	}
	print("];\n");

	print("var primeMap = {");
	for(var i = 0; i < primes.length; i+=100) {
		print(primes.slice(i, i+100).map(function(x){return x+":1"}) + ',');
	}
	print("};\n");
	print("var maxPrime = " + primes[primes.length-1] + ";");
}

function factorize(x, startIndex) {
	if(startIndex === undefined) startIndex = 0;
	if(x == 1) return [];
	for(var i = startIndex; i < primes.length; i++) {
		var prime = primes[i];
		if(x%prime == 0) {
			var factors = factorize(x/prime, i);
			factors.push(prime);
			return factors;
		}
	}
}


function fibLimit(limit) {
	var a = 1;
	var b = 2;
	var c;
	var fibs = [a,b];
	while((c = a+b) < limit) {
		a = b;
		b = c;
		fibs.push(c);
	}
	return fibs;
}


function isPalindrome(x) {
	var str = x+'';
	var len = str.length;
	for(var i = 0; i < len/2; i++) {
		if(str[i] != str[len-i-1]) return false;
	}
	return true;
}

var op = {};
op.add = op['+'] = function(a,b) { return a+b; }
op.sub = op['-'] = function(a,b) { return a-b; }
op.mul = op['*'] = function(a,b) { return a*b; }
op.div = op['/'] = function(a,b) { return a/b; }
op.num = function(a) { return +a; }
op.neg = function(a) { return -a; }
op.str = function(a) { return a+''; }

function isValidSquarePath(point, path, rows, cols) {
	for(var i in path) {
		var p = path[i];
		var n = [point[0]+p[0], point[1]+p[1]];
		if(n[0] < 0 || n[1] < 0 || n[0] >= rows || n[1] >= cols)
			return false;
	}
	return true;
}

function Bignum(num, base) {
	if(!(this instanceof Bignum)) return new Bignum(num, base);
	if(num === undefined) num = 0;
	if(base === undefined) base = num.base || Bignum.defaultBase;
	this.base = base;

	if(typeof num == "number" || num instanceof Number) {
		if(num < 0) {
			var neg = true;
			num *= -1;
		}
		this.digits = [];
		do {
			this.digits.push(num % Bignum.innerBase);
			num = Math.floor(num / Bignum.innerBase);
		} while(num > 0);
		if(neg) {
			this.digits = this.digits.map(op.neg);
		}
	} else if(num instanceof Array) {
		var digits = num.slice().reverse();
		// First, collect input digits together into a larger base,
		// as large as I can get without overshooting innerBase,
		// for better efficiency (less steps later).
		// Then, just use Bignum math to do the conversion for me;
		// nothing particularly clever going on here.
		var size = Math.floor(Math.log(Bignum.innerBase) / Math.log(base));
		var bigDigits = Math.ceil(digits.length / size);
		var pieces = [];
		for(var i = 0; i < bigDigits; i++) {
			var offset = i*size;
			var sum = 0;
			for(var j = 0; j < size; j++) {
				sum += (digits[offset+j]||0) * Math.pow(base, j);
			}
			pieces.push(Bignum(sum).mul(Bignum(base).pow(offset)));
		}
		return pieces.reduce(function(a,b){return a.add(b);}, Bignum(0));
	} else if(typeof num == "string" || num instanceof String) {
		if(num[0] == -1) {
			var neg = true;
			num = num.slice(1);
		}
		var digits = num.split('').map(function(x){return parseInt(x,base);});
		if(neg) {
			digits = digits.map(op.neg);
		}
		return new Bignum(digits, base);
	} else if(num instanceof Bignum) {
		this.digits = num.digits.slice();
	} else {
		throw TypeError("Can't understand type of first argument.");
	}
	return this.normalize();
}
Bignum.fromDigits = function(digits) {
	// This function does nothing intelligent.
	// It assumes that the digit array is in innerBase already.
	var result = new Bignum(0);
	result.digits = digits;
	return result;
}
Bignum.innerBase = Math.pow(2,25);
Bignum.defaultBase = 10;
Object.defineProperty(Bignum.prototype, "length", {
	get: function() { return this.digits.length; }
});
Object.defineProperty(Bignum.prototype, "sign", {
	get: function() {
		if(this.digits[this.length-1] < 0)
			return -1;
		if(this.length == 1 && this.digits[0] == 0)
			return 0
		return 1;
	}
});
Bignum.prototype.add = function(that) {
	that = new Bignum(that);
	var len = Math.max(this.length, that.length);
	for(var i = 0; i < len; i++) {
		this.digits[i] = (this.digits[i]||0) + (that.digits[i]||0);
	}
	return this.normalize();
}
Bignum.prototype.normalize = function() {
	var carry = 0;
	for(var i = 0; i < this.length; i++) {
		var digit = this.digits[i] + carry;
		carry = Math.floor(digit / Bignum.innerBase);
		this.digits[i] = (digit % Bignum.innerBase + Bignum.innerBase) % Bignum.innerBase;
	}
	while(carry > 0) {
		this.digits.push(carry % Bignum.innerBase);
		carry = Math.floor(carry / Bignum.innerBase);
	}
	while(this.digits[this.length-1] == 0)
		this.digits.pop();
	return this;
}
Bignum.prototype.mul = function(that) {
	that = new Bignum(that);
	var result = this.digits.map(function(d, i) {
		var digits = that.digits.map(function(d2){return d*d2;}).reverse();
		for(;i > 0;i--) digits.push(0);
		return Bignum.fromDigits(digits.reverse());
	}).reduce(function(a,b){ return a.add(b); }, Bignum(0)).normalize()
	this.digits = result.digits;
	return this;
}
Bignum.prototype.pow = function(exp) {
	if(exp != Math.floor(exp)) throw "Bignum#pow() must be called with integer exponent.";
	if(exp == 0) return new Bignum(1);
	var self = this.clone();
	for(var i = 0; i < exp-1; i++) {
		this.mul(self);
	}
	return this;
}
Bignum.prototype.divmod = function(div) {
	div = new Bignum(div);
	if(div.length == 1) {
		div = div.digits[0];
		var mod = 0;
		for(var i = this.length-1; i >= 0; i--) {
			var digit = this.digits[i] + mod * Bignum.innerBase;
			mod = digit % div;
			this.digits[i] = Math.floor(digit / div);
		}
		return [this.normalize(), mod];
	}
	throw RangeError("Division not yet implemented for numbers greater than the innerBase.");
}
Bignum.prototype.lt = function(that) {
	that = new Bignum(that);
	if(this.length < that.length)
		return true;
	if(this.length > that.length)
		return false;
	for(var i = this.length - 1; i >= 0; i--) {
		if(this.digits[i] < that.digits[i])
			return true;
		if(this.digits[i] > that.digits[i])
			return false;
	}
	return false;
}
Bignum.prototype.eq = function(that) {
	that = new Bignum(that);
	if(this.length != that.length)
		return false;
	for(var i = 0; i < this.length; i++) {
		if(this.digits[i] != that.digits[i])
			return false;
	}
	return true;
}
Bignum.prototype.neq = function(that) { return !this.eq(that); }
Bignum.prototype.gte = function(that) { return !this.lt(that); }
Bignum.prototype.lte = function(that) { return this.eq(that) || this.lt(that); }
Bignum.prototype.gt = function(that) { return !this.lte(that); }
Bignum.prototype.clone = function() {
	return new Bignum(this);
}
Bignum.prototype.digitsInBase = function(base) {
	base = Math.floor(base || this.base);
	var zero = new Bignum(0);
	var num = new Bignum(this);
	var digits = [];
	do {
		var result = num.divmod(base);
		digits.push(result[1]);
		num = result[0];
	} while(num.neq(zero));
	return digits.reverse();
}
Bignum.prototype.toString = function(base) {
	base = Math.floor(base || this.base);
	if(base < 2 || base > 36)
		throw TypeError("Can only toString a Bignum when 2 <= base <= 36.");
	return this.digitsInBase(base).map(function(x){return x.toString(base);}).join('');
}


function memoize(func) {
	var memo = new Map();
	var newfunc = function() {
		var args = [].slice.call(arguments);
		if(memo.has(args))
			return memo.get(args);
		var result = func.apply(this, args);
		memo.set(args, result);
		return result;
	}
	newfunc.memo = memo;
	return newfunc;
}
