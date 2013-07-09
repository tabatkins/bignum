Bignum - a JS library for extra-large numbers
=============================================

Javascript's native Number type is a double: a 64-bit floating point number.  This implies certain limitations in the range of values it can support: it can only hold integers smaller than +/- 2^53 without losing precision, and it can only go up to +/- 2^1024 total.  Sometimes, you need more power than that, which means a bignum library.

Currently, the library consists of one class, named Z after the common name for the integers.  Z can hold arbitrary-sized integers with perfect precision.  Soon I plan to add a Q class for ratios, then likely a C class for complex numbers, and finally might look into either an algebraic number class or a limited (but arbitrarily-high) precision floating-point class.

Arbitrary-size Integers - the Z class
-------------------------------------

The Z class is used for any integer-based calculations.

The Z constructor can be called without `new`, like `var x = Z(5);`, so it doesn't intrude too much visually.  It accepts numbers, strings, or arrays of digits - the latter two can be accompanied with the base they should be interpreted in as a second argument, like `Z("1a2", 16)`, or else they'll be assumed to be base 10.  It also accepts another Z and produces a clone of it, though this is not the idiomatic way to clone a Z (instead, use Z#clone(), Z#lift(), or Z#adopt(), as appropriate).

All of the basic mathematical operations exist on Z:

* .add(n) - addition
* .sub(n) - subtraction
* .mul(n) - multiplication
* .div(n) - (integer) division
* .mod(n, positive?) - modulus.  If the positiveAllowed argument is set to the string `"positive"`, this will only return the positive modulus.  (Otherwise, `Z(-12).mod(10)` will return -2, same as `-12 % 10` in normal JS math.)
* .divmod(n, positive?) - both div and mod at the same time (returns an array).  The positive argument is the same as in mod().
* .pow(exp) - exponentiation
* .square() - squaring (slightly faster than `x.mul(x)` - automatically used when you do `x.pow(2)`)
* .powmod(exp, mod) - exponentiation with a modulus (*much* faster than calling .pow().mod())

Note that all of these operations (all the operations, actually) can take any "Z-like" as their argument - Z instances, obviously, but also numbers, string, and arrays of digits.  Anything that can be passed to the Z constructor can be used directly as an argument to a Z method.

The basic comparison operations are also defined:

* .eq(n) - equality
* .ne(n) - non-equality
* .lt(n) - less than
* .le(n) - less than or equal
* .gt(n) - greater than
* .ge(n) - greater than or equal

There are several ways to create a new Z out of an existing value:

* Z(n, base?) - takes a JS number, string, array, or Z.  If you pass a Z, the return value is a clone of the argument.
* Z.of(n) - just calls the constructor.  Useful for passing to Array#map, for example, because it ignores any additional arguments.  (Passing the constructor to Array#map, like `[1,2,3].map(Z)`, may fail badly as the map() function passes the current index as the second argument, and the constructor will attempt to interpret that as the base argument.  Instead, call `[1,2,3].map(Z.of)`.)
* .clone() - returns a clone of the number.
* .adopt(n) - mutates the number in-place to be a clone of the argument
* Z.lift(n) - if the argument is a Z, just returns it (no cloning).  Otherwise, returns a fresh Z constructed from the argument.

Finally, several utility functions exist:

* .sign - An attribute, not a function, containing -1, 0, or 1, if the number is negative, zero, or positive, respectively.  This can be directly set, as well.
* .negate() - Negates the number. (Faster than calling `x.mul(-1)`.)
* .isPos() - True if the number is positive (`x.sign` returns 1), false otherwise.
* .isNeg() - True if the number is negative, false otherwise.
* .isZero() - True if the number is zero, false otherwise.
* .toNum() - If the number fits in the JS precise integer bounds, returns the value as a JS number.  Otherwise returns false.
* .digitsInBase(base?) - Returns an array containing the digits of the number interpreted in the given base, most significant digit first.  If no base is given, uses the number's default base (which defaults to 10 unless it was set in the constructor, or manually adjusted by setting `x.base`).
* .toString(base?) - Returns the number in string form in the given base.  Again, if the base isn't given, uses the number's default base.  Unlike digitsInBase(), toString() requires 2 <= base <= 36, so it can reasonably print it.

A Z can also be used directly in expressions with strings or JS numbers - it'll autoconvert itself into the appropriate type.  (Possible issue - when concatenated with a string, it appears to trigger .valueOf() first, which means it'll concat "NaN" rather than a string version of the number when the number is large enough.  I might just need to remove the .valueOf() entirely.)

**Important note:**  All of the Z instance methods that return a Z do so by *mutating the this argument directly, and returning it*.  That is, in `var y = x.mul(3);` not only is y set to x*3, but x itself now equals three times what it used to.  To avoid this, use the static variants of the methods.

### Using the Z methods statically ###

Every method defined on a Z *instance* also exists on the Z *class object*, taking an additional first argument.  For example, instead of `x.mul(y)`, you can call `Z.mul(x,y)`.  Even `.sign` has a static variant in `Z.sign(n)`.

The static variants work the same as their instance variants, except that they **don't** mutate any of their arguments.  This is usually accomplished by just cloning the first argument, so most of the static variants imply an extry object creation over their instance variant.

The static variants are often most convenient for just constructing a large number directly, like `Z.pow(3, 1000)` (rather than `Z(3).pow(1000)`, which I find slightly clumsier to read and write).