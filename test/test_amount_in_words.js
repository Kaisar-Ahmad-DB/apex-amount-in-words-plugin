// node test_amount_in_words.js
var aiw = require("./amount_in_words.js");
var fails = 0;
function t(raw, opts, expected) {
    var got = aiw.convert(raw, opts);
    var ok = got === expected;
    if (!ok) { fails++; }
    console.log((ok ? "PASS " : "FAIL ") + JSON.stringify(raw) + " " + (opts.currency || "") + (opts.system ? "/" + opts.system : "") + "\n     -> " + got + (ok ? "" : "\n     expected: " + expected));
}
var BDT = { currency: "BDT", suffix: "Only" }, USD = { currency: "USD", suffix: "Only" };
t("0", BDT, "Zero Taka Only");
t("1", BDT, "One Taka Only");
t("0.5", BDT, "Fifty Paisa Only");
t("0.01", BDT, "One Paisa Only");
t("1.5", BDT, "One Taka and Fifty Paisa Only");
t("100", BDT, "One Hundred Taka Only");
t("1000", BDT, "One Thousand Taka Only");
t("100000", BDT, "One Lakh Taka Only");
t("10000000", BDT, "One Crore Taka Only");
t("123456.78", BDT, "One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Taka and Seventy-Eight Paisa Only");
t("12,34,567.50", BDT, "Twelve Lakh Thirty-Four Thousand Five Hundred Sixty-Seven Taka and Fifty Paisa Only");
t("1000000000", BDT, "One Hundred Crore Taka Only");
t("123456789012", BDT, "Twelve Thousand Three Hundred Forty-Five Crore Sixty-Seven Lakh Eighty-Nine Thousand Twelve Taka Only");
t("123456.78", USD, "One Hundred Twenty-Three Thousand Four Hundred Fifty-Six Dollars and Seventy-Eight Cents Only");
t("1", USD, "One Dollar Only");
t("1.01", USD, "One Dollar and One Cent Only");
t("2.05", USD, "Two Dollars and Five Cents Only");
t("1000000", USD, "One Million Dollars Only");
t("1000000000", USD, "One Billion Dollars Only");
t("1,234,567,890.99", USD, "One Billion Two Hundred Thirty-Four Million Five Hundred Sixty-Seven Thousand Eight Hundred Ninety Dollars and Ninety-Nine Cents Only");
t("100.999", USD, "One Hundred One Dollars Only");          // rounds up and carries
t("0.995", USD, "One Dollar Only");                        // carry into the integer part
t("99.994", USD, "Ninety-Nine Dollars and Ninety-Nine Cents Only");
t("-25.40", USD, "Minus Twenty-Five Dollars and Forty Cents Only");
t("-0.001", USD, "Zero Dollars Only");
t("Tk 1,250.00", BDT, "One Thousand Two Hundred Fifty Taka Only");
t("$ 19.99", USD, "Nineteen Dollars and Ninety-Nine Cents Only");
t("1", { currency: "GBP", suffix: "Only" }, "One Pound Only");
t("0.02", { currency: "GBP", suffix: "Only" }, "Two Pence Only");
t("0.01", { currency: "GBP", suffix: "Only" }, "One Penny Only");
t("5", { currency: "EUR", suffix: "Only" }, "Five Euros Only");
t("250000", { currency: "INR", suffix: "Only" }, "Two Lakh Fifty Thousand Rupees Only");
t("250000", { currency: "USD", system: "SOUTH_ASIAN", suffix: "Only" }, "Two Lakh Fifty Thousand Dollars Only");
t("250000", { currency: "BDT", system: "INTERNATIONAL", suffix: "Only" }, "Two Hundred Fifty Thousand Taka Only");
t("12.5", { currency: "CUSTOM", major1: "Dirham", major2: "Dirhams", minor1: "Fils", minor2: "Fils", suffix: "" }, "Twelve Dirhams and Fifty Fils");
t("1", { currency: "CUSTOM", major1: "Riyal", major2: "Riyals", minor1: "Halala" }, "One Riyal");
t("15", { currency: "BDT", suffix: "" }, "Fifteen Taka");
t("", BDT, "");
t("abc", BDT, "");
t("1.2.3", BDT, "");
console.log(fails ? ("\n" + fails + " FAILED") : "\nALL PASSED");
process.exit(fails ? 1 : 0);
