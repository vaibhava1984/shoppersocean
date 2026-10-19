export interface BookType {
    id: string;
    title: string;
    description: string;
    published_date: string;
    isbn: string;
    price: number;
    price_usd?: number | null;
    price_eur?: number | null;
    price_cny?: number | null;
    ratings: number;
    cover_images: string[];
    binding: string;
    language: string;
    genre: string;
    publisher: string;
    pages: number;
    author_id: string;
    author_name: string;
    updated_at: string;
}