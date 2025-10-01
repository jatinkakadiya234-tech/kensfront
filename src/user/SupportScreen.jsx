import React, { useState } from 'react';
import axios from 'axios'; // Make sure to install axios if not already installed
import { Apihelper } from '../common/service/ApiHelper';


const faqData = [
  { id: 1, title: 'What is StreamVibe?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 2, title: 'How much does StreamVibe cost?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 3, title: 'What content is available on StreamVibe?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 4, title: 'How can I watch StreamVibe?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 5, title: 'How do I sign up for StreamVibe?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 6, title: 'What is the StreamVibe free trial?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 7, title: 'How do I contact StreamVibe customer support?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' },
  { id: 8, title: 'What are the StreamVibe payment methods?', desc: 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.' }
];

export default function SupportScreen() {
  const [active, setActive] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggle = (id) => {
    setActive(prev => (prev === id ? null : id));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data to match your schema
      const submissionData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        subject: 'Support Request',
        message: formData.message,
        phone: formData.phone
      };
      console.log(submissionData)
      // Replace with your actual API endpoint
      const response = await  Apihelper.support(submissionData)
      
      if (response.status === 200 || response.status === 201) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
          agreeTerms: false
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: 'Failed to submit form. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181b]">
      <div className="max-w-7xl mx-auto my-12 pt-16 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-2/5 w-full mb-8 lg:mb-0">
            <h3 className="font-bold text-3xl md:text-4xl text-white mb-4">Welcome to our <br />support page!</h3>
            <p className="text-[#f0f8ff9d] mb-6">We're here to help you with any problems you may be having with our product.</p>
            <img src="./assets/support-page-img.png" className="rounded-lg object-cover w-full h-[340px]" alt="Support Illustration" />
          </div>

          <div className="lg:w-3/5 w-full">
            <form onSubmit={handleSubmit}>
              <div className="bg-black text-white p-6 md:p-8 rounded-2xl shadow-lg">
                {submitSuccess && (
                  <div className="bg-green-600/90 text-white px-4 py-2 rounded mb-4 text-center">
                    Your message has been sent successfully! We'll get back to you soon.
                  </div>
                )}
                {errors.submit && (
                  <div className="bg-red-600/90 text-white px-4 py-2 rounded mb-4 text-center">
                    {errors.submit}
                  </div>
                )}
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-[48%] my-2">
                    <label className="block mb-1 text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className={`w-full px-3 py-2 rounded bg-zinc-900 text-white border ${errors.firstName ? 'border-red-500' : 'border-zinc-700'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="Enter First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                  </div>
                  <div className="w-full md:w-[48%] my-2">
                    <label className="block mb-1 text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`w-full px-3 py-2 rounded bg-zinc-900 text-white border ${errors.lastName ? 'border-red-500' : 'border-zinc-700'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="Enter Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                  </div>
                  <div className="w-full md:w-[48%] my-2">
                    <label className="block mb-1 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      className={`w-full px-3 py-2 rounded bg-zinc-900 text-white border ${errors.email ? 'border-red-500' : 'border-zinc-700'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                  </div>
                  <div className="w-full md:w-[48%] my-2">
                    <label className="block mb-1 text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-3 py-2 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter Phone Number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full my-2">
                    <label className="block mb-1 text-sm font-medium">Message</label>
                    <textarea
                      name="message"
                      className={`w-full px-3 py-2 rounded bg-zinc-900 text-white border ${errors.message ? 'border-red-500' : 'border-zinc-700'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                      rows="4"
                      placeholder="Enter your Message"
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                    {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                  </div>
                  <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="appearance-none w-4 h-4 border-2 border-red-600 rounded-sm cursor-pointer bg-transparent checked:bg-red-600 checked:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <label
                        className={`ml-2 text-sm cursor-pointer ${errors.agreeTerms ? 'text-red-500' : 'text-zinc-400'}`}
                        htmlFor="agreeTerms"
                      >
                        I agree with Terms of Use and Privacy Policy
                      </label>
                    </div>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                  {errors.agreeTerms && <div className="text-red-500 text-xs mt-1 w-full">{errors.agreeTerms}</div>}
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="my-12"></div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h4 className="font-bold text-2xl text-white mb-1">Frequently Asked Questions</h4>
            <p className="text-zinc-400 m-0">Got questions? We've got answers! Check out our FAQ section to find answers to the most common questions about StreamVibe.</p>
          </div>
          <button className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition">Ask a Question</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqData.map((item) => (
            <div key={item.id} className="w-full">
              <div
                className={`border-b pb-4 cursor-pointer transition-colors ${active === item.id ? 'border-red-600' : 'border-zinc-700'}`}
                onClick={() => toggle(item.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-zinc-900 text-white rounded px-4 py-2 font-bold text-lg">{String(item.id).padStart(2, '0')}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h6 className="m-0 text-white text-base font-semibold">{item.title}</h6>
                      <div className="text-2xl text-white select-none">
                        {active === item.id ? '−' : '+'}
                      </div>
                    </div>
                    {active === item.id && item.desc && (
                      <p className="text-zinc-400 mt-2">{item.desc}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
