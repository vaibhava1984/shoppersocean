import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "User not authenticated" }, { status: 401 });

    const ordersSnap = await firestore.collection("orders")
      .where("user_id", "==", user.uid)
      .get();

    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => String(b.order_date ?? "").localeCompare(String(a.order_date ?? "")));
    const productIds = [...new Set(orders.map(o => String(o.product_id || "")).filter(Boolean))];
    const orderIds = orders.map(o => o.id);

    const [bookDocs, ...paymentSnaps] = await Promise.all([
      Promise.all(productIds.map(id => firestore.collection("books").doc(id).get())),
      ...Array.from({ length: Math.ceil(orderIds.length / 30) }, (_, i) =>
        orderIds.length
          ? firestore.collection("payments").where("order_id", "in", orderIds.slice(i * 30, i * 30 + 30)).get()
          : Promise.resolve({ docs: [] } as any)
      ),
    ]);

    const booksById = new Map(
      bookDocs.filter(d => d.exists).map(d => {
        const b: any = d.data();
        return [d.id, { id: d.id, title: b?.title || "", price: Number(b?.price || 0) }];
      })
    );
    const payments = paymentSnaps.flatMap((snap: any) => snap.docs).map((d: any) => ({ id: d.id, ...d.data() }));
    const purchases = orders.map(order => ({
      ...order,
      books: booksById.get(String(order.product_id)) || null,
      payment: payments.find(p => p.order_id === order.id) || null,
    }));

    return NextResponse.json({ purchases }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error loading purchase history:", error);
    return NextResponse.json({ error: "Unable to load purchase history" }, { status: 500 });
  }
}
