export interface BookType {
    id: string;
    title: string;
    description: string;
    published_date: string;
    isbn: string;
    price: number;
    ratings: number;
    cover_images: string[];
    binding: string;
    language: string;
    publisher: string;
    pages: number;
    author_id: string;
    author_name: string;
    updated_at: string;
}