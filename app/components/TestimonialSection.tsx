"use client"
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react'

// TestimonialSection Component
const TestimonialSection: React.FC = () => {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('description, users, rating');

                if (error) {
                    throw error;
                }

                setTestimonials(data || []);
            } catch (err) {
                setError('Failed to fetch testimonials');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-400"
                                        }`}
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
    );
};

export default TestimonialSection;
