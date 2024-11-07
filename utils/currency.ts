
export interface ExchangeRates {
    [key: string]: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    try {
        // You can replace this with your preferred exchange rate API
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/INR`
        );
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Return an empty object if the fetch fails
        // The component will fallback to showing INR
        return {};
    }
}

export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: ExchangeRates
): number {
    if (fromCurrency === toCurrency) return amount;

    // If rates are empty or missing required currencies, return original amount
    if (!rates[fromCurrency] || !rates[toCurrency]) {
        console.warn('Missing exchange rates, using original amount');
        return amount;
    }

    // Convert to INR first if not already in INR
    const amountInINR = fromCurrency === 'INR'
        ? amount
        : amount / rates[fromCurrency];

    // Convert from INR to target currency
    return toCurrency === 'INR'
        ? amountInINR
        : amountInINR * rates[toCurrency];
}

// Optional: Add a function to format currency amounts
export function formatCurrency(
    amount: number,
    currency: string,
    locale: string = 'en-US'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `${currency} ${amount}`;
    }
}