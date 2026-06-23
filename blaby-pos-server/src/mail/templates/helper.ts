function numberToWords(amount:any) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertBelow100(num:any) {
        if (num < 10) {
            return ones[num];
        } else if (num >= 11 && num <= 19) {
            return teens[num - 11];
        } else {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
        }
    }

    function convertBelow1000(num:any) {
        if (num < 100) {
            return convertBelow100(num);
        } else {
            return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + convertBelow100(num % 100) : "");
        }
    }

    function convert(amount:any) {
        if (amount === 0) {
            return "Zero";
        } else {
            const millions = Math.floor(amount / 1000000);
            const thousands = Math.floor((amount % 1000000) / 1000);
            const remainder = amount % 1000;

            let result = "";

            if (millions > 0) {
                result += convertBelow1000(millions) + " Million";
                if (thousands > 0 || remainder > 0) {
                    result += " ";
                }
            }

            if (thousands > 0) {
                result += convertBelow1000(thousands) + " Thousand";
                if (remainder > 0) {
                    result += " ";
                }
            }

            if (remainder > 0) {
                result += convertBelow1000(remainder);
            }

            return result;
        }
    }

    return convert(amount);
}

export {numberToWords}