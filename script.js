/* Implements Karatsuba multiplication for two integers, input into two
text boxes on the HTML page.

This script works for input numbers of different sizes. The explanation
of Karatsuba in class, and the test case we've been asked to do, has the input
values x and y of equal length, and always of length = 2^n. When executing
the "Karatsuba split" (which, incidentally, is also my favorite floor element
in gymnastics), this algorithm always splits by creating a right-hand piece that
has length 2^n, and then using the left-hand piece directly. So, x = AAABBBB and
y = CDDDD would be split to a = AAA, b = BBBB, c = C, and d = DDD. */

function karatsuba() {
  /* When called by the HTML "Submit" button, gets two numbers from two input
  boxes, and sends the numbers to the multiply() function.
  performs the first recursive function call. */
  var input1 = document.getElementById("inputNum1").value;
  var input2 = document.getElementById("inputNum2").value;
  var karatsubaTarget = document.getElementById("karatsubaOutput");
  var bigJSTarget = document.getElementById("bigJSOutput");
  if ((((((input1 == "") || (input2 == "")) || isNaN(input1)) || isNaN(input2)) || input1.includes(".")) || input2.includes(".")) {
    karatsubaTarget.textContent = "Please input an integer in each of the boxes above.";
    return;
  } else {
    var num1 = input1.split("").map(Number);
    var num2 = input2.split("").map(Number);
    karatsubaTarget.textContent = multiply(num1, num2).map(String).join("");
    bigJSTarget.textContent = Big(input1).times(input2).toFixed();
    return;
  }
}

function multiply(x, y) {
  /* Checks to see if either input is a single-digit number (single-element
  array). If so, arrays are sent to singleMultiply(). Otherwise, arrays are
  sent to recursMultiply(). */
  if ((x.length == 0) || (y.length == 0)) {
    return [];
  } else if (x.length == 1) {
    return simpleMultiply(y, x);
  } else if (y.length == 1) {
    return simpleMultiply(x, y);
  } else {
    return recursMultiply(x, y);
  }
}

function simpleMultiply(long, short) {
  /* Mutliplies a number-array by a one-digit number-array. */
  var productArray = [];
  var carry = 0;
  var singleDigitProduct;
  for (var i = (long.length - 1); i >= 0; i--) {
    singleDigitProduct = long[i] * short[0] + carry;
    productArray.unshift(singleDigitProduct % 10);
    carry = Math.floor(singleDigitProduct / 10); // Integer division
  }
  if (carry > 0) {
    productArray.unshift(carry);
  }
  return productArray;
}

function arrayAdd(e, f) {
  /* Adds two number-arrays. */
  var augend, addend, extra;
  /* First task: determine which array is longer. I've defined the augend as
  the longer array. Not sure that's the actual definition of "augend". */
  if (f.length > e.length) {
    augend = f;
    addend = e;
    extra = f.slice(0, (f.length - e.length));
  } else {
    augend = e;
    addend = f;
    extra = e.slice(0, (e.length - f.length));
  }
  var sumArray = [];
  var carry = 0;
  var singleDigitSum;
  for (var i = 1; i <= addend.length; i++) {
    singleDigitSum = augend[(augend.length - i)] + addend[(addend.length - i)] + carry;
    sumArray.unshift(singleDigitSum % 10);
    carry = Math.floor(singleDigitSum / 10);
  }
  if (carry == 1) {
    /* Tricky. What if x ="" and y = "9999"? Carried 1 will cascade carries.
    I've dealt with this by using a recursive call. */
    return arrayAdd(extra, [1]).concat(sumArray);
  }
  else {
    return extra.concat(sumArray);
  }
}

function arraySubtract(g, h) {
  /* Subtracts number-array h from g. Assumes g is longer than h. */
  var diffArray = [];
  var borrow = 0;
  var singleDigitDiff;
  for (var i = 1; i <= h.length; i++) {
    singleDigitDiff = g[(g.length - i)] - h[(h.length - i)] - borrow;
    if (singleDigitDiff >= 0) {
      diffArray.unshift(singleDigitDiff);
      borrow = 0;
    } else {
      borrow = 1;
      diffArray.unshift(singleDigitDiff + 10);
    }
  }
  if (borrow == 1) {
    return arraySubtract(g.slice(0, (g.length - h.length)), [1]).concat(diffArray);
  } else {
    return g.slice(0, (g.length - h.length)).concat(diffArray);
  }
}

function recursMultiply(m, n) {
  /* The recursive Karatsuba function call. Assumes neither number-array is
  empty or is one digit long. First, perform the Karatsuba split. */
  var splitLength = Math.pow(2, Math.ceil(Math.log2((Math.max(m.length, n.length)) / 2)));
  // Guarantees that split is at position 2^n from the right.
  var a, b, c, d;
  if (splitLength >= m.length) {
    a = [];
    b = m;
  } else {
    a = m.slice(0, (m.length - splitLength));
    b = m.slice(m.length - splitLength);
  }
  if (splitLength >= n.length) {
    c = [];
    d = n;
  } else {
    c = n.slice(0, (n.length - splitLength));
    d = n.slice(n.length - splitLength);
  }
  // And then compute ac, bd, and (a+b)(c+d)-ac-bd.
  var ac = multiply(a, c);
  var bd = multiply(b, d);
  var middleTerm = arraySubtract(arraySubtract(multiply(arrayAdd(a, b), arrayAdd(c, d)), ac), bd);
  // Sometimes middleTerm has some leading zeroes. Let's get rid of them.
  while (middleTerm[0] == 0) {
    middleTerm.shift();
  }
  /* Append (2 * splitLength) zeroes to ac, and splitLength zeroes to middleTerm,
  as required by the Karatsuba method. */
  var acZeroes;
  if (ac == []) {
    acZeroes = [];
  } else {
    acZeroes = ac;
    for (var i = 1; i <= (2 * splitLength); i++) {
      acZeroes.push(0);
    }
  }
  var middleTermZeroes = middleTerm;
  for (var i = 1; i <= splitLength; i++) {
    middleTermZeroes.push(0);
  }
  // And then do the final combination of terms.
  return arrayAdd(arrayAdd(acZeroes, bd), middleTermZeroes);
}
