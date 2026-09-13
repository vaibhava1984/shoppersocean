import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata = {
    title: 'BookShelf - Debug',
    description: 'Debug page for troubleshooting',
}

// No caching for debug page
export const revalidate = 0;

export default async function DebugPage() {
    const supabase = createClient();
    
    const debugInfo: any = {
        environment: {
            supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
            supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
            node_env: process.env.NODE_ENV,
        },
        database: {
            total_books: 0,
            tables_accessible: false,
            error: null as string | null,
            sample_books: [] as any[],
            column_info: null as any,
        }
    };

    try {
        // Test 1: Can we connect to Supabase at all?
        const { data: testData, error: testError } = await supabase
            .from('books')
            .select('count', { count: 'exact' });
        
        if (testError) {
            debugInfo.database.error = `Connection Error: ${testError.message}`;
            debugInfo.database.tables_accessible = false;
        } else {
            debugInfo.database.tables_accessible = true;
            debugInfo.database.total_books = testData?.length || 0;
        }

        // Test 2: Try to fetch raw data
        const { data: rawBooks, error: booksError } = await supabase
            .from('books')
            .select('*')
            .limit(5);
        
        if (!booksError && rawBooks) {
            debugInfo.database.sample_books = rawBooks;
            if (rawBooks.length > 0) {
                debugInfo.database.column_info = Object.keys(rawBooks[0]);
            }
        }

        // Test 3: Check what columns exist
        const { data: tableInfo, error: tableError } = await supabase
            .from('books')
            .select()
            .limit(0);
        
    } catch (error: any) {
        debugInfo.database.error = `Fatal Error: ${error.message}`;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-8 text-slate-800">🔍 BookShelf Debug Information</h1>
                    
                    {/* Environment Settings */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-slate-800">📋 Environment Configuration</h2>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span>Supabase URL:</span>
                                    <span>{debugInfo.environment.supabase_url}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Supabase Key:</span>
                                    <span>{debugInfo.environment.supabase_key}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Node Environment:</span>
                                    <span>{debugInfo.environment.node_env}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Database Connection */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-slate-800">🗄️ Database Connection</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tables Accessible:</span>
                                    <span>
                                        {debugInfo.database.tables_accessible ? (
                                            <span className="text-green-600 font-bold">✅ YES</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">❌ NO</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Books Found:</span>
                                    <span className="font-bold">{debugInfo.database.total_books}</span>
                                </div>
                                {debugInfo.database.error && (
                                    <div className="mt-4 p-4 bg-red-100 rounded">
                                        <p className="text-red-800 font-mono text-sm break-words">
                                            {debugInfo.database.error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sample Books */}
                    {debugInfo.database.sample_books.length > 0 && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-4 text-slate-800">📚 Sample Books (First 5)</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-200">
                                            <tr>
                                                <th className="p-2 text-left">ID</th>
                                                <th className="p-2 text-left">Title</th>
                                                <th className="p-2 text-left">Language</th>
                                                <th className="p-2 text-left">Author</th>
                                                <th className="p-2 text-left">Complete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {debugInfo.database.sample_books.map((book: any, idx: number) => (
                                                <tr key={idx} className="border-t">
                                                    <td className="p-2">{book.id}</td>
                                                    <td className="p-2">{book.title?.substring(0, 30)}...</td>
                                                    <td className="p-2">{book.language}</td>
                                                    <td className="p-2">{book.author}</td>
                                                    <td className="p-2">{book.isCompletelyFilled ? '✅' : '❌'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Column Information */}
                    {debugInfo.database.column_info && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-4 text-slate-800">🔑 Database Columns</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {debugInfo.database.column_info.map((col: string, idx: number) => (
                                        <div key={idx} className="p-2 bg-slate-100 rounded text-sm font-mono">
                                            {col}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Next Steps */}
                    <Card className="mb-6 bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-blue-900">📝 Next Steps</h2>
                            <div className="space-y-2 text-slate-700">
                                {!debugInfo.environment.supabase_url && (
                                    <p>❌ <strong>Supabase URL missing:</strong> Add NEXT_PUBLIC_SUPABASE_URL to .env.local</p>
                                )}
                                {!debugInfo.environment.supabase_key && (
                                    <p>❌ <strong>Supabase Key missing:</strong> Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local</p>
                                )}
                                {debugInfo.database.error && (
                                    <p>❌ <strong>Database connection failed:</strong> {debugInfo.database.error}</p>
                                )}
                                {debugInfo.database.tables_accessible && debugInfo.database.total_books === 0 && (
                                    <p>⚠️ <strong>No books in database:</strong> Add sample books to the books table in Supabase</p>
                                )}
                                {debugInfo.database.tables_accessible && debugInfo.database.total_books > 0 && debugInfo.database.sample_books.length === 0 && (
                                    <p>⚠️ <strong>Books exist but can't fetch:</strong> Check Supabase row-level security policies</p>
                                )}
                                {debugInfo.database.tables_accessible && debugInfo.database.sample_books.length > 0 && (
                                    <p>✅ <strong>Database is working!</strong> Books are being fetched successfully. Check /bookShelf page.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Raw Debug JSON */}
                    <Card className="bg-gray-900 text-white">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4">🔧 Raw Debug JSON</h2>
                            <pre className="overflow-x-auto text-xs">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </section>
            
            <Footer />
        </div>
    )
}
