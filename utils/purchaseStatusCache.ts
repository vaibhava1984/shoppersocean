type PurchaseStatusMap = Record<string, { hasPurchased: boolean }>

type PendingRequest = {
    resolve: (hasPurchased: boolean) => void
    reject: (error: unknown) => void
}

const statusCache = new Map<string, boolean>()
const pending = new Map<string, PendingRequest[]>()
const queuedByUser = new Map<string, Set<string>>()
const scheduledUsers = new Set<string>()

function cacheKey(userId: string, productId: string) {
    return `${userId}:${productId}`
}

async function flush(userId: string) {
    scheduledUsers.delete(userId)
    const productIds = [...(queuedByUser.get(userId) ?? [])]
    queuedByUser.delete(userId)

    if (!productIds.length) return

    try {
        const response = await fetch('/api/check-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
        })

        if (!response.ok) throw new Error(`Purchase status request failed (${response.status})`)

        const data = (await response.json()) as PurchaseStatusMap

        productIds.forEach(productId => {
            const hasPurchased = Boolean(data?.[productId]?.hasPurchased)
            statusCache.set(cacheKey(userId, productId), hasPurchased)
            pending.get(cacheKey(userId, productId))?.forEach(({ resolve }) => resolve(hasPurchased))
            pending.delete(cacheKey(userId, productId))
        })
    } catch (error) {
        productIds.forEach(productId => {
            const key = cacheKey(userId, productId)
            pending.get(key)?.forEach(({ reject }) => reject(error))
            pending.delete(key)
        })
    }
}

export function getPurchaseStatus(userId: string, productId: string): Promise<boolean> {
    const key = cacheKey(userId, productId)
    const cached = statusCache.get(key)
    if (cached !== undefined) return Promise.resolve(cached)

    const promise = new Promise<boolean>((resolve, reject) => {
        const requests = pending.get(key) ?? []
        requests.push({ resolve, reject })
        pending.set(key, requests)
    })

    const productIds = queuedByUser.get(userId) ?? new Set<string>()
    productIds.add(productId)
    queuedByUser.set(userId, productIds)

    if (!scheduledUsers.has(userId)) {
        scheduledUsers.add(userId)
        setTimeout(() => { void flush(userId) }, 0)
    }

    return promise
}

export function setPurchaseStatus(userId: string, productId: string, hasPurchased: boolean) {
    statusCache.set(cacheKey(userId, productId), hasPurchased)
}
