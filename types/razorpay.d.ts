declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface PaymentDetails {
    orderId: string;
    amount: number;
    currency: string;
    notes?: object;
}

export interface ExchangeRates {
    [key: string]: number;
}