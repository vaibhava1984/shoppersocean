type SendResult = { data?: any; error: any | null };
export class Resend {
  private apiKey: string;
  public emails: { send: (payload: Record<string, any>) => Promise<SendResult> };
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.emails = { send: async (payload) => {
      if (!this.apiKey) return { error: new Error("RESEND_API_KEY is not configured.") };
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + this.apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        return response.ok ? { data, error: null } : { data, error: data };
      } catch (error) { return { error }; }
    }};
  }
}
