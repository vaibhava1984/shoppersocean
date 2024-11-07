import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer"

export const metadata = {
    title: 'Terms and Conditions',
    description: 'Please read these terms carefully before using our services.',
}

export default function TermsAndConditionsPage() {

    const termsContent = [
        {
            title: "Introduction",
            content: "The use of our website is subject to the following terms and conditions of use, The Terms are to be read together by you with any terms, conditions or disclaimers provided in the pages of our website. Please review the Terms carefully. The Terms apply to all users of our website, including without limitation, users who are browsers, customers, merchants, vendors and/or contributors of content. If you access and use this website, you accept and agree to be bound by and comply with the Terms and our Privacy Policy. If you do not agree to the Terms or our Privacy Policy, you are not authorized to access our website, use any of our website's services or place an order on our website."
        },
        {
            title: "Return/Compensation Policy",
            content: "Any order once placed by a customer/client is subject to its own responsibility and any order placed willingly or mistakenly shall be taken as an order placed by you with your descretion and we shall not be liable to return any amount paid by you or replace it with any other services. Also, we dont hold any responsibility for any amount paid by you being stuck/lost due to technical errors belong to payment gateways, server down etc."
        },
        {
            title: "Policy for Our Authors/ Business Partners",
            content: "Authors/ business partners who are inclined to be associated with us to rendering their services through us, must communicate with us directly on the e-mail provided by us and must agree to the terms and conditions about their profit share on their products and about the duration/minimum threshold/way of being paid determined by us."
        },
        {
            title: "Use of Our Website",
            content: "You agree to use our website for legitimate purposes and not for any illegal or unauthorized purpose, You agree not to attempt to interfere with our website's network or security features or to gain unauthorized access to our systems. You agree to provide us with accurate personal information, such as your email address, mailing address and other contact details in order to complete your order or contact you as needed. You agree to promptly update your account and information. You authorize us to collect and use this information to contact you in accordance with our Privacy Policy."
        },
        {
            title: "General Conditions",
            content: "We reserve the right to refuse service to anyone, at any time, for any reason. We reserve the right to make any modifications to the website, including terminating, changing, suspending or discontinuing any aspect of the website at any time, without notice. We may impose additional rules or limits on the use of our website. You agree to review the Terms regularly and your continued access or use of our website will mean that you agree to any changes. You agree that we will not be liable to you or any third party for any modification, suspension or discontinuance of our website or for any service, content, feature or product offered through our website."
        },
        {
            title: "Products or Services",
            content: "All purchases through our website are subject to product availability. We may, in our sole discretion, limit or cancel the quantities offered on our website or limit the sales of our products or services to any person, household, geographic region or jurisdiction. Prices for our products are subject to change, without notice. We reserve the right, in our sole discretion, to refuse orders, including without limitation, orders that appear to be placed by distributors or resellers. If we believe that you have made a false or fraudulent order, we will be entitled to cancel the order and inform the relevant authorities. We do not guarantee the accuracy of the colour or design of the products on our website. We have made efforts to ensure the colour and design of our products are displayed as accurately as possible on our website."
        },
        {
            title: "Links to Third-Party Websites",
            content: "Links from or to websites outside our website are meant for convenience only. We do not review, endorse, approve or control, and are not responsible for any sites linked from or to our website, the content of those sites, the third parties named therein, or their products and services. Linking to any other site is at your sole risk and we will not be responsible or liable for any damages in connection with linking. Links to downloadable software sites are for convenience only and we are not responsible or liable for any difficulties or consequences associated with downloading the software. Use of any downloaded software is governed by the terms of the license agreement, if any, which accompanies or is provided with the software."
        },
        {
            title: "Use Comments, Feedback, and Other Submissions",
            content: "You acknowledge that you are responsible for the information, profiles, opinions, messages, comments and any other content (collectively, the \"Content\") that you post, distribute or share on or through our website or services available in connection with our website. You further acknowledge that you have full responsibility for the Content, including but limited to, with respect to its legality, and its trademark, copyright and other intellectual property ownership. We reserve the right to terminate your ability to post on our website and to remove and/or delete any Content that we deem objectionable. You consent to such removal and/or deletion and waive any claim against us for the removal and/or deletion of your Content."
        },
        {
            title: "Errors and Omissions",
            content: "Please note that our website may contain typographical errors or inaccuracies and may not be complete or current. We reserve the right to correct any errors, inaccuracies or omissions and to change or update information at any time, without prior notice (including after an order has been submitted). Such errors, inaccuracies or omissions may relate to product description, pricing, promotion and availability and we reserve the right to cancel or refuse any order placed based on incorrect pricing or availability information, to the extent permitted by applicable law."
        },
        {
            title: "Disclaimer and Limitation of Liability",
            content: "The use of our website is at your sole risk and you assume full responsibility for any costs associated with your use of our website. We will not be liable for any damages of any kind related to the use of our website. In no event will we, or our affiliates, our or their respective content or service providers, or any of our or their respective directors, officers, agents, contractors, suppliers or employees be liable to you for any direct, indirect, special, incidental, consequential, exemplary or punitive damages, losses or causes of action, or lost revenue, lost profits, lost business or sales, or any other type of damage, whether based in contract or tort (including negligence), strict liability or otherwise, arising from your use of, or the inability to use, or the performance of, our website or the content or material or functionality through our website, even if we are advised of the possibility of such damages."
        },
        {
            title: "Indemnification",
            content: "You agree to defend and indemnify us, and hold us and our affiliates harmless,, and our and their respective directors, officers, agents, contractors, and employees against any losses, liabilities, claims, expenses (including legal fees) in any way arising from, related to or in connection with your use of our website, your violation of the Terms, or the posting or transmission of any materials on or through the website by you, including but not limited to, any third party claim that any information or materials provided by you infringe upon any third party proprietary rights."
        },
        {
            title: "Governing Law",
            content: "Any disputes arising out of or relating to the Terms, the Privacy Policy, use of our website, or our products or services offered on our website will be resolved in accordance with the laws of the Province of Kerala, India without regard to its conflict of law rules. Any disputes, actions or proceedings relating to the Terms or your access to or use of our website must be brought before the courts of the Province of Kerala in the City of Trivandrum, and you irrevocably consent to the exclusive jurisdiction and venue of such courts."
        },
        {
            title: "Questions or Concerns",
            content: "Please send all questions, comments and feedback to us at kochimonu@gmail.com"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Terms and Conditions
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 italic">Please read these terms carefully before using our services</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="mb-8">
                            <CardContent className="p-6">
                                <p className="text-xl text-slate-600 mb-4">
                                    Welcome to shoppersocean. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before proceeding to use our website.
                                </p>
                                <p className="text-xl text-slate-600">
                                    If you disagree with any part of these terms and conditions, please do not use our website or services.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="w-full">
                            {termsContent.map((section, index) => (
                                <div key={index} className="mb-6">
                                    <h2 className="text-2xl font-semibold text-slate-800">{section.title}</h2>
                                    <p className="text-xl text-slate-600 mt-2 text-justify">{section.content}</p>
                                    {index < termsContent.length - 1 && (
                                        <hr className="my-4 border-gray-300" />
                                    )}
                                </div>
                            ))}
                        </div>


                        {/* <Accordion type="single" collapsible className="w-full">
                            {termsContent.map((section, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="text-2xl font-semibold text-slate-800">{section.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-xl text-slate-600">{section.content}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion> */}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-slate-800">Have Questions?</h2>
                    <p className="text-xl mb-8 text-slate-600">If you have any questions about our Terms and Conditions, please don't hesitate to contact us.</p>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg">
                        <Link href="/contact" >
                            Contact Us
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}