
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

export const getCurrencyCode = (countryCode: string): string => {
    const currencyMap: { [key: string]: string } = {
        'AF': 'AFN', // Afghanistan Afghani
        'AL': 'ALL', // Albania Lek
        'DZ': 'DZD', // Algeria Dinar
        'AD': 'EUR', // Andorra Euro
        'AO': 'AOA', // Angola Kwanza
        'AG': 'XCD', // Antigua and Barbuda East Caribbean Dollar
        'AR': 'ARS', // Argentina Peso
        'AM': 'AMD', // Armenia Dram
        'AU': 'AUD', // Australia Dollar
        'AT': 'EUR', // Austria Euro
        'AZ': 'AZN', // Azerbaijan New Manat
        'BS': 'BSD', // Bahamas Dollar
        'BH': 'BHD', // Bahrain Dinar
        'BD': 'BDT', // Bangladesh Taka
        'BB': 'BBD', // Barbados Dollar
        'BY': 'BYN', // Belarus Ruble
        'BE': 'EUR', // Belgium Euro
        'BZ': 'BZD', // Belize Dollar
        'BJ': 'XOF', // Benin CFA Franc BCEAO
        'BT': 'BTN', // Bhutan Ngultrum
        'BO': 'BOB', // Bolivia Boliviano
        'BA': 'BAM', // Bosnia and Herzegovina Convertible Marka
        'BW': 'BWP', // Botswana Pula
        'BR': 'BRL', // Brazil Real
        'BN': 'BND', // Brunei Darussalam Dollar
        'BG': 'BGN', // Bulgaria Lev
        'BF': 'XOF', // Burkina Faso CFA Franc BCEAO
        'BI': 'BIF', // Burundi Franc
        'KH': 'KHR', // Cambodia Riel
        'CM': 'XAF', // Cameroon CFA Franc BEAC
        'CA': 'CAD', // Canada Dollar
        'CV': 'CVE', // Cape Verde Escudo
        'CF': 'XAF', // Central African Republic CFA Franc BEAC
        'TD': 'XAF', // Chad CFA Franc BEAC
        'CL': 'CLP', // Chile Peso
        'CN': 'CNY', // China Yuan Renminbi
        'CO': 'COP', // Colombia Peso
        'KM': 'KMF', // Comoros Franc
        'CG': 'XAF', // Congo CFA Franc BEAC
        'CR': 'CRC', // Costa Rica Colon
        'HR': 'HRK', // Croatia Kuna
        'CU': 'CUP', // Cuba Peso
        'CY': 'EUR', // Cyprus Euro
        'CZ': 'CZK', // Czech Republic Koruna
        'DK': 'DKK', // Denmark Krone
        'DJ': 'DJF', // Djibouti Franc
        'DM': 'XCD', // Dominica East Caribbean Dollar
        'DO': 'DOP', // Dominican Republic Peso
        'EC': 'USD', // Ecuador Dollar
        'EG': 'EGP', // Egypt Pound
        'SV': 'USD', // El Salvador Dollar
        'GQ': 'XAF', // Equatorial Guinea CFA Franc BEAC
        'ER': 'ERN', // Eritrea Nakfa
        'EE': 'EUR', // Estonia Euro
        'ET': 'ETB', // Ethiopia Birr
        'FJ': 'FJD', // Fiji Dollar
        'FI': 'EUR', // Finland Euro
        'FR': 'EUR', // France Euro
        'GA': 'XAF', // Gabon CFA Franc BEAC
        'GM': 'GMD', // Gambia Dalasi
        'GE': 'GEL', // Georgia Lari
        'DE': 'EUR', // Germany Euro
        'GH': 'GHS', // Ghana Cedi
        'GR': 'EUR', // Greece Euro
        'GD': 'XCD', // Grenada East Caribbean Dollar
        'GT': 'GTQ', // Guatemala Quetzal
        'GN': 'GNF', // Guinea Franc
        'GW': 'XOF', // Guinea-Bissau CFA Franc BCEAO
        'GY': 'GYD', // Guyana Dollar
        'HT': 'HTG', // Haiti Gourde
        'HN': 'HNL', // Honduras Lempira
        'HU': 'HUF', // Hungary Forint
        'IS': 'ISK', // Iceland Krona
        'IN': 'INR', // India Rupee
        'ID': 'IDR', // Indonesia Rupiah
        'IR': 'IRR', // Iran Rial
        'IQ': 'IQD', // Iraq Dinar
        'IE': 'EUR', // Ireland Euro
        'IL': 'ILS', // Israel Shekel
        'IT': 'EUR', // Italy Euro
        'JM': 'JMD', // Jamaica Dollar
        'JP': 'JPY', // Japan Yen
        'JO': 'JOD', // Jordan Dinar
        'KZ': 'KZT', // Kazakhstan Tenge
        'KE': 'KES', // Kenya Shilling
        'KI': 'AUD', // Kiribati Dollar
        'KP': 'KPW', // Korea (North) Won
        'KR': 'KRW', // Korea (South) Won
        'KW': 'KWD', // Kuwait Dinar
        'KG': 'KGS', // Kyrgyzstan Som
        'LA': 'LAK', // Laos Kip
        'LV': 'EUR', // Latvia Euro
        'LB': 'LBP', // Lebanon Pound
        'LS': 'LSL', // Lesotho Loti
        'LR': 'LRD', // Liberia Dollar
        'LY': 'LYD', // Libya Dinar
        'LI': 'CHF', // Liechtenstein Franc
        'LT': 'EUR', // Lithuania Euro
        'LU': 'EUR', // Luxembourg Euro
        'MG': 'MGA', // Madagascar Ariary
        'MW': 'MWK', // Malawi Kwacha
        'MY': 'MYR', // Malaysia Ringgit
        'MV': 'MVR', // Maldives Rufiyaa
        'ML': 'XOF', // Mali CFA Franc BCEAO
        'MT': 'EUR', // Malta Euro
        'MH': 'USD', // Marshall Islands Dollar
        'MR': 'MRU', // Mauritania Ouguiya
        'MU': 'MUR', // Mauritius Rupee
        'MX': 'MXN', // Mexico Peso
        'FM': 'USD', // Micronesia Dollar
        'MD': 'MDL', // Moldova Leu
        'MC': 'EUR', // Monaco Euro
        'MN': 'MNT', // Mongolia Tughrik
        'ME': 'EUR', // Montenegro Euro
        'MA': 'MAD', // Morocco Dirham
        'MZ': 'MZN', // Mozambique Metical
        'MM': 'MMK', // Myanmar Kyat
        'NA': 'NAD', // Namibia Dollar
        'NR': 'AUD', // Nauru Dollar
        'NP': 'NPR', // Nepal Rupee
        'NL': 'EUR', // Netherlands Euro
        'NZ': 'NZD', // New Zealand Dollar
        'NI': 'NIO', // Nicaragua Cordoba
        'NE': 'XOF', // Niger CFA Franc BCEAO
        'NG': 'NGN', // Nigeria Naira
        'NO': 'NOK', // Norway Krone
        'OM': 'OMR', // Oman Rial
        'PK': 'PKR', // Pakistan Rupee
        'PW': 'USD', // Palau Dollar
        'PA': 'PAB', // Panama Balboa
        'PG': 'PGK', // Papua New Guinea Kina
        'PY': 'PYG', // Paraguay Guarani
        'PE': 'PEN', // Peru Sol
        'PH': 'PHP', // Philippines Peso
        'PL': 'PLN', // Poland Zloty
        'PT': 'EUR', // Portugal Euro
        'QA': 'QAR', // Qatar Riyal
        'RO': 'RON', // Romania Leu
        'RU': 'RUB', // Russia Ruble
        'RW': 'RWF', // Rwanda Franc
        'KN': 'XCD', // Saint Kitts and Nevis East Caribbean Dollar
        'LC': 'XCD', // Saint Lucia East Caribbean Dollar
        'VC': 'XCD', // Saint Vincent and the Grenadines East Caribbean Dollar
        'WS': 'WST', // Samoa Tala
        'SM': 'EUR', // San Marino Euro
        'ST': 'STN', // Sao Tome and Principe Dobra
        'SA': 'SAR', // Saudi Arabia Riyal
        'SN': 'XOF', // Senegal CFA Franc BCEAO
        'RS': 'RSD', // Serbia Dinar
        'SC': 'SCR', // Seychelles Rupee
        'SL': 'SLL', // Sierra Leone Leone
        'SG': 'SGD', // Singapore Dollar
        'SK': 'EUR', // Slovakia Euro
        'SI': 'EUR', // Slovenia Euro
        'SB': 'SBD', // Solomon Islands Dollar
        'SO': 'SOS', // Somalia Shilling
        'ZA': 'ZAR', // South Africa Rand
        'SS': 'SSP', // South Sudan Pound
        'ES': 'EUR', // Spain Euro
        'LK': 'LKR', // Sri Lanka Rupee
        'SD': 'SDG', // Sudan Pound
        'SR': 'SRD', // Suriname Dollar
        'SZ': 'SZL', // Swaziland Lilangeni
        'SE': 'SEK', // Sweden Krona
        'CH': 'CHF', // Switzerland Franc
        'SY': 'SYP', // Syria Pound
        'TW': 'TWD', // Taiwan New Dollar
        'TJ': 'TJS', // Tajikistan Somoni
        'TZ': 'TZS', // Tanzania Shilling
        'TH': 'THB', // Thailand Baht
        'TL': 'USD', // Timor-Leste Dollar
        'TG': 'XOF', // Togo CFA Franc BCEAO
        'TO': 'TOP', // Tonga Pa'anga
        'TT': 'TTD', // Trinidad and Tobago Dollar
        'TN': 'TND', // Tunisia Dinar
        'TR': 'TRY', // Turkey Lira
        'TM': 'TMT', // Turkmenistan Manat
        'TV': 'AUD', // Tuvalu Dollar
        'UG': 'UGX', // Uganda Shilling
        'UA': 'UAH', // Ukraine Hryvnia
        'AE': 'AED', // United Arab Emirates Dirham
        'GB': 'GBP', // United Kingdom Pound
        'US': 'USD', // United States Dollar
        'UY': 'UYU', // Uruguay Peso
        'UZ': 'UZS', // Uzbekistan Som
        'VU': 'VUV', // Vanuatu Vatu
        'VA': 'EUR', // Vatican City Euro
        'VE': 'VES', // Venezuela Bolivar
        'VN': 'VND', // Vietnam Dong
        'YE': 'YER', // Yemen Rial
        'ZM': 'ZMW', // Zambia Kwacha
        'ZW': 'ZWL'  // Zimbabwe Dollar
    };

    return currencyMap[countryCode] || 'Unknown';
};