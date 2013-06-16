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
	//since we've eliminated the other 4/6 numbers.
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
	for(var i = maxPrime + 2; i < 1e6; i+=2) {
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
	if(startIndex == undefined) startIndex = 0;
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