"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react'

const TestimonialSection: React.FC = () => {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTestimonialsAndUser = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/testimonials', { cache: 'no-store' });
                const data = await response.json();
                if (!response.ok) throw new Error(data?.error || 'Failed to fetch testimonials');
                setTestimonials(data?.testimonials || []);
            } catch (err) {
                setError('Failed to fetch testimonials');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonialsAndUser();
    }, []);



    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-white border-blue-100">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-400"}`}
                                            fill="currentColor"
                                        />
                                    ))}
                                </div>
                                <p className="italic mb-4 text-slate-600">"{testimonial.description}"</p>
                                <p className="font-semibold text-slate-800">- {testimonial.users}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default TestimonialSection;
