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
        if (!cachedData) return null;

        const parsed = JSON.parse(cachedData) as Cache<T>;
        if (
            parsed.data &&
            typeof parsed.expirationTime === 'number' &&
            Number.isFinite(parsed.expirationTime) &&
            parsed.expirationTime > Date.now()
        ) {
            return parsed.data;
        }
        return null;
    }

    // Used only if the live/shared endpoint fails. The timestamp is reconstructed
    // from the existing cache format, so previously saved browser entries still work.
    getStale(maxAgeMs: number): T | null {
        const cachedData = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
        if (!cachedData) return null;

        const parsed = JSON.parse(cachedData) as Cache<T>;
        if (!parsed.data || typeof parsed.expirationTime !== 'number' || !Number.isFinite(parsed.expirationTime)) {
            return null;
        }

        const savedAt = parsed.expirationTime - this.cacheExpirationTime;
        const ageMs = Date.now() - savedAt;
        return ageMs >= 0 && ageMs <= maxAgeMs ? parsed.data : null;
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
