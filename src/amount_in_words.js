/*!
 * Amount In Words - Oracle APEX Dynamic Action plug-in (client side)
 * Converts an amount into English words, e.g.
 *   123456.78 (BDT) -> "One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Taka and Seventy-Eight Paisa Only"
 *   123456.78 (USD) -> "One Hundred Twenty-Three Thousand Four Hundred Fifty-Six Dollars and Seventy-Eight Cents Only"
 * Plain ES5, no dependencies except apex / jQuery (already loaded by APEX).
 * License: MIT
 */
var amountInWords = (function () {
    "use strict";

    var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
                "Eighteen", "Nineteen"];
    var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    var SCALES = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
                  "Sextillion", "Septillion"];

    // [singular, plural] for the main unit and the sub unit
    var CURRENCIES = {
        BDT: { major: ["Taka", "Taka"],       minor: ["Paisa", "Paisa"],  system: "SOUTH_ASIAN" },
        USD: { major: ["Dollar", "Dollars"],  minor: ["Cent", "Cents"],   system: "INTERNATIONAL" },
        EUR: { major: ["Euro", "Euros"],      minor: ["Cent", "Cents"],   system: "INTERNATIONAL" },
        GBP: { major: ["Pound", "Pounds"],    minor: ["Penny", "Pence"],  system: "INTERNATIONAL" },
        INR: { major: ["Rupee", "Rupees"],    minor: ["Paisa", "Paise"],  system: "SOUTH_ASIAN" }
    };

    function stripZeros(d) {
        return d.replace(/^0+/, "") || "0";
    }

    // add 1 to a string of digits
    function increment(d) {
        var out = "", carry = 1, i, n;
        for (i = d.length - 1; i >= 0; i--) {
            n = parseInt(d.charAt(i), 10) + carry;
            carry = n > 9 ? 1 : 0;
            out = (n % 10) + out;
        }
        return carry ? "1" + out : out;
    }

    // 0..999 -> words (empty string for 0)
    function below1000(n) {
        var s = [], h = Math.floor(n / 100), r = n % 100;
        if (h) { s.push(ONES[h] + " Hundred"); }
        if (r) {
            if (r < 20) { s.push(ONES[r]); }
            else { s.push(TENS[Math.floor(r / 10)] + (r % 10 ? "-" + ONES[r % 10] : "")); }
        }
        return s.join(" ");
    }

    // Million / Billion ...
    function internationalWords(digits) {
        var groups = [], i, parts = [], g;
        digits = stripZeros(digits);
        if (digits === "0") { return "Zero"; }
        for (i = digits.length; i > 0; i -= 3) {
            groups.push(parseInt(digits.substring(Math.max(0, i - 3), i), 10));
        }
        if (groups.length > SCALES.length) { throw new Error("Amount too large"); }
        for (i = groups.length - 1; i >= 0; i--) {
            g = groups[i];
            if (g) { parts.push(below1000(g) + (SCALES[i] ? " " + SCALES[i] : "")); }
        }
        return parts.join(" ");
    }

    // Lakh / Crore
    function southAsianWords(digits) {
        var n, lakh, thousand, parts = [], head, tail, text;
        digits = stripZeros(digits);
        if (digits === "0") { return "Zero"; }
        if (digits.length > 7) {
            head = digits.substring(0, digits.length - 7);
            tail = stripZeros(digits.substring(digits.length - 7));
            text = southAsianWords(head) + " Crore";
            return tail === "0" ? text : text + " " + southAsianWords(tail);
        }
        n = parseInt(digits, 10);
        lakh = Math.floor(n / 100000);       n = n % 100000;
        thousand = Math.floor(n / 1000);     n = n % 1000;
        if (lakh)     { parts.push(below1000(lakh) + " Lakh"); }
        if (thousand) { parts.push(below1000(thousand) + " Thousand"); }
        if (n)        { parts.push(below1000(n)); }
        return parts.join(" ");
    }

    // "1,234.567" -> { negative, int:"1234", cents:57 } (rounded half up to 2 decimals)
    function parse(raw) {
        var s = String(raw === null || raw === undefined ? "" : raw).replace(/[^0-9.\-]/g, "");
        var negative = s.indexOf("-") === 0, parts, intPart, frac, f, cents;
        s = s.replace(/-/g, "");
        if (!/[0-9]/.test(s)) { return null; }
        parts = s.split(".");
        if (parts.length > 2) { return null; }
        intPart = stripZeros(parts[0] || "0");
        frac = parts.length > 1 ? parts[1] : "";
        f = (frac + "000").substring(0, 3);
        cents = parseInt(f.substring(0, 2), 10);
        if (parseInt(f.charAt(2), 10) >= 5) { cents += 1; }
        if (cents >= 100) { cents -= 100; intPart = increment(intPart); }
        return { negative: negative && (intPart !== "0" || cents > 0), intPart: intPart, cents: cents };
    }

    /**
     * @param raw   amount, e.g. "1,234.50"
     * @param opts  { currency: BDT|USD|EUR|GBP|INR|CUSTOM, system: AUTO|INTERNATIONAL|SOUTH_ASIAN,
     *                major1, major2, minor1, minor2 (CUSTOM only), suffix }
     * @returns words, or "" when the amount is empty / not a number
     */
    function convert(raw, opts) {
        var o = opts || {}, code = (o.currency || "BDT").toUpperCase(), cur, major, minor, system;
        var p = parse(raw), words, majorText = "", minorText = "", result;

        if (p === null) { return ""; }

        if (code === "CUSTOM") {
            cur = {
                major: [o.major1 || "", o.major2 || o.major1 || ""],
                minor: [o.minor1 || "", o.minor2 || o.minor1 || ""],
                system: "INTERNATIONAL"
            };
        } else {
            cur = CURRENCIES[code] || CURRENCIES.BDT;
        }
        major = cur.major;
        minor = cur.minor;
        system = (!o.system || o.system === "AUTO") ? cur.system : o.system;
        words = system === "SOUTH_ASIAN" ? southAsianWords : internationalWords;

        if (p.intPart !== "0") {
            majorText = words(p.intPart) + (major[0] ? " " + (p.intPart === "1" ? major[0] : major[1]) : "");
        }
        if (p.cents > 0) {
            minorText = below1000(p.cents) + (minor[0] ? " " + (p.cents === 1 ? minor[0] : minor[1]) : "");
        }

        if (majorText && minorText) { result = majorText + " and " + minorText; }
        else if (majorText || minorText) { result = majorText || minorText; }
        else { result = "Zero" + (major[1] ? " " + major[1] : ""); }

        if (p.negative) { result = "Minus " + result; }
        if (o.suffix) { result += " " + o.suffix; }
        return result;
    }

    // Called by the dynamic action: this = DA context, o = attributes from the render function
    function run(da, o) {
        var raw = apex.item(o.source).getValue();
        var text = convert(raw, o);
        da.affectedElements.each(function () {
            var $e = $(this);
            if ($e.is("input, textarea, select")) {
                if (this.id) { apex.item(this.id).setValue(text); } else { $e.val(text); }
            } else {
                $e.text(text);
            }
        });
    }

    return { convert: convert, run: run };
}());

if (typeof module !== "undefined" && module.exports) {
    module.exports = amountInWords;
}
