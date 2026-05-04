import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book a venue on SmartWed 360?",
      answer: "Simply browse through our venues, select your favorite, choose your event date and number of guests, then send a booking request. The vendor will review and confirm your booking."
    },
    {
      question: "Is there any fee for using SmartWed 360?",
      answer: "Creating an account and browsing venues is completely free. Booking fees are determined by the venue vendors directly."
    },
    {
      question: "How long does it take to get a booking confirmation?",
      answer: "Most vendors respond within 24-48 hours. You'll receive a notification once they respond to your request."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel pending bookings. For approved bookings, please contact the vendor directly for cancellation policies."
    },
    {
      question: "How do I become a vendor?",
      answer: "Click on 'Become a Vendor' in the footer, register with your business details, and wait for admin approval. Once approved, you can start listing your venues."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Payment methods vary by vendor. Most accept bank transfers, cash, and some accept online payments. Contact the vendor directly for details."
    },
    {
      question: "Are all venues verified?",
      answer: "Yes, all vendors go through an admin approval process before they can list their venues on our platform."
    },
    {
      question: "Can I get a refund?",
      answer: "Refund policies vary by vendor. Please review the cancellation policy of the specific venue before booking."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about SmartWed 360
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gold-50 transition-colors"
              >
                <span className="text-lg font-semibold text-primary-900 text-left">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUpIcon className="w-5 h-5 text-gold-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gold-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;