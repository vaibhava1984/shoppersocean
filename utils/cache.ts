const EXCHANGE_RATES_CACHE_KEY = 'exchange_rates_cache';

interface Cache<T> {
    data: T | null;
    expirationTime: number | null;
}

export interface ExchangeRates {
    [key: string]: number;
}

class CacheManager<T> {
    private cacheExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

    get(): T | null {
        const cachedData = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
        if (cachedData) {
            const { data, expirationTime } = JSON.parse(cachedData) as Cache<T>;
            if (expirationTime && expirationTime > Date.now()) {
                return data;
            }
        }
        return null;
    }

    set(data: T): void {
        const cache: Cache<T> = {
            data,
            expirationTime: Date.now() + this.cacheExpirationTime,
        };
        localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify(cache));
    }
}

export const exchangeRatesCache = new CacheManager<ExchangeRates>();