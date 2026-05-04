import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Blog = () => {
  const [posts] = useState([
    {
      id: 1,
      title: "10 Tips for Choosing the Perfect Wedding Venue",
      excerpt: "Choosing the right venue is one of the most important decisions for your wedding. Here are 10 tips to help you make the perfect choice...",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "March 15, 2025",
      author: "Sarah Ahmed",
      category: "Planning Tips",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Top 5 Wedding Trends for 2025",
      excerpt: "Stay ahead of the curve with these emerging wedding trends that will make your special day unforgettable...",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "March 10, 2025",
      author: "Fatima Zafar",
      category: "Trends",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Budget-Friendly Wedding Ideas That Don't Compromise on Style",
      excerpt: "Planning a wedding on a budget? Here are creative ways to have a beautiful wedding without breaking the bank...",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "March 5, 2025",
      author: "Ali Khan",
      category: "Budget Tips",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "How to Choose the Perfect Wedding Date",
      excerpt: "From seasonal considerations to venue availability, learn how to pick the ideal date for your wedding...",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 28, 2025",
      author: "Sarah Ahmed",
      category: "Planning",
      readTime: "3 min read"
    },
    {
      id: 5,
      title: "The Ultimate Wedding Planning Checklist",
      excerpt: "Stay organized with our comprehensive wedding planning checklist covering everything from 12 months out to the big day...",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Fixed URL
      date: "February 20, 2025",
      author: "Fatima Zafar",
      category: "Checklists",
      readTime: "8 min read"
    },
    {
      id: 6,
      title: "Outdoor vs Indoor Weddings: Pros and Cons",
      excerpt: "Both options have their advantages. We break down the pros and cons to help you decide...",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "February 15, 2025",
      author: "Ali Khan",
      category: "Venue Guide",
      readTime: "4 min read"
    }
  ]);

  const categories = ["All", "Planning Tips", "Trends", "Budget Tips", "Checklists", "Venue Guide"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">
            Wedding Planning Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, trends, and inspiration for your perfect wedding
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gold-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {post.author}
                  </span>
                </div>
                <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs rounded-full mb-3">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{post.readTime}</span>
                  <button className="text-gold-500 hover:text-gold-600 font-semibold flex items-center gap-1">
                    Read More
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-primary-900 rounded-2xl p-8 mt-12 text-center">
          <h3 className="text-2xl font-heading font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-cream mb-6">
            Get the latest wedding tips and trends delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="input-field bg-white"
            />
            <button className="btn-gold whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;