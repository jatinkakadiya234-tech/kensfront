import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Apihelper } from '../../common/service/ApiHelper';

const PremiumPlans = () => {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationInDays: '',
    features: {
      fullMovieAccess: false,
      adFree: false,
      hdStreaming: false,
      earlyAccess: false,
      downloadsAllowed: false,
      maxDevices: 1,
    },
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await Apihelper.Listplan();
        setPlans(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch premium plans:', error);
      }
    }
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('features.')) {
      const featureName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,  
        features: {
          ...prev.features,
          [featureName]: type === 'checkbox' ? checked : parseInt(value) || 0
        }
      }));
    } else {
      let updatedData = {
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-set duration based on plan selection
      if (name === 'name') {
        if (value === 'monthly') {
          updatedData.durationInDays = '30';
        } else if (value === 'unlimited') {
          updatedData.durationInDays = 'unlimited';
        }
      }
      
      setFormData(updatedData);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Plan name is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.durationInDays || (formData.durationInDays !== 'unlimited' && formData.durationInDays <= 0)) {
      newErrors.durationInDays = 'Valid duration is required';
    }
    if (formData.features.maxDevices <= 0) {
      newErrors.maxDevices = 'At least 1 device must be allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingPlan) {
      // Log the data and _id being sent to the API
      console.log('Editing plan:', editingPlan._id, formData);
      // Update existing plan via API
      try {
        await Apihelper.editPlan(editingPlan._id, formData);
        // Refresh plans from API
        const res = await Apihelper.Listplan();
        setPlans(res.data.data || []);
      } catch (error) {
        console.error('Failed to update premium plan:', error);
      }
      setEditingPlan(null);
    } else {
      // Add new plan via API
      try {
        await Apihelper.createplan(formData);
        // Refresh plans from API
        const res = await Apihelper.Listplan();
        setPlans(res.data.data || []);
      } catch (error) {
        console.error('Failed to create premium plan:', error);
      }
    }

    // Reset form
    setFormData({
      name: '',
      price: '',
      durationInDays: '',
      features: {
        fullMovieAccess: false,
        adFree: false,
        hdStreaming: false,
        earlyAccess: false,
        downloadsAllowed: false,
        maxDevices: 1,
      },
      isActive: true
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      durationInDays: plan.durationInDays,
      features: { ...plan.features },
      isActive: plan.isActive,
      _id:plan._id
    });
  };

  const handleToggleActive = async (planId) => {
    try {
      await Apihelper.togalplan(planId);
      // Refresh plans from API
      const res = await Apihelper.Listplan();
      setPlans(res.data.data || []);
    } catch (error) {
      console.error('Failed to toggle plan status:', error);
      toast.error( error.response.data.message||"An error occurred during registration");
    }
  };

  const handleDelete = async (planId) => {
    const confirmed = window.confirm('Are you sure you want to delete this plan?');
    if (!confirmed) return;
    try {
      await Apihelper.deleteplan(planId);
      const res = await Apihelper.Listplan();
      setPlans(res.data.data || []);
    } catch (error) {
      toast.error( error.response.data.message||"An error occurred during registration");
      console.error('Failed to delete premium plan:', error);
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8" style={{ background: 'transparent' }}>
      <ToastContainer autoClose={1000} />
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Form Section */}
        <div className="rounded-lg shadow-xl p-6 text-white mb-8" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {editingPlan ? 'Edit Premium Plan' : 'Add Premium Plan'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Plan Name <span className="text-blue-400">*</span>
                </label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md text-white focus:outline-none`}
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${errors.name ? '#ef4444' : 'rgba(79, 172, 254, 0.4)'}` }}
                >
                  <option value="" className="bg-black text-white">Select Plan</option>
                  <option value="monthly" className="bg-black text-white">Monthly</option>
                  <option value="unlimited" className="bg-black text-white">Unlimited</option>
                </select>
                {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Price (₹) <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md text-white focus:outline-none`}
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${errors.price ? '#ef4444' : 'rgba(79, 172, 254, 0.4)'}` }}
                  placeholder="Enter price"
                />
                {errors.price && <p className="mt-1 text-red-400 text-sm">{errors.price}</p>}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Duration (Days) <span className="text-blue-400">*</span>
                </label>
                <input
                  type={formData.name === 'unlimited' ? 'text' : 'number'}
                  name="durationInDays"
                  value={formData.durationInDays}
                  onChange={handleChange}
                  readOnly={formData.name === 'monthly' || formData.name === 'unlimited'}
                  className={`w-full px-4 py-2 rounded-md text-white focus:outline-none ${(formData.name === 'monthly' || formData.name === 'unlimited') ? 'cursor-not-allowed opacity-70' : ''}`}
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${errors.durationInDays ? '#ef4444' : 'rgba(79, 172, 254, 0.4)'}` }}
                  placeholder={formData.name === 'unlimited' ? 'Unlimited' : 'Enter duration in days'}
                />
                {errors.durationInDays && <p className="mt-1 text-red-400 text-sm">{errors.durationInDays}</p>}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.fullMovieAccess"
                    checked={formData.features.fullMovieAccess}
                    onChange={handleChange}
                    className="h-5 w-5 border rounded bg-black/50"
                  />
                  <span className="text-white">Full Movie Access</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.adFree"
                    checked={formData.features.adFree}
                    onChange={handleChange}
                    className="h-5 w-5 border rounded bg-black/50"
                  />
                  <span className="text-white">Ad Free</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.hdStreaming"
                    checked={formData.features.hdStreaming}
                    onChange={handleChange}
                    className="h-5 w-5 border rounded bg-black/50"
                  />
                  <span className="text-white">HD Streaming</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.earlyAccess"
                    checked={formData.features.earlyAccess}
                    onChange={handleChange}
                    className="h-5 w-5 border rounded bg-black/50"
                  />
                  <span className="text-white">Early Access</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="features.downloadsAllowed"
                    checked={formData.features.downloadsAllowed}
                    onChange={handleChange}
                    className="h-5 w-5 border rounded bg-black/50"
                  />
                  <span className="text-white">Downloads Allowed</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Max Devices
                  </label>
                  <input
                    type="number"
                    name="features.maxDevices"
                    value={formData.features.maxDevices}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2 rounded-md text-white focus:outline-none`}
                    style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${errors.maxDevices ? '#ef4444' : 'rgba(79, 172, 254, 0.4)'}` }}
                  />
                  {errors.maxDevices && <p className="mt-1 text-red-400 text-sm">{errors.maxDevices}</p>}
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 border rounded bg-black/50"
                />
                <span className="text-white">Active Plan</span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full text-white py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] focus:outline-none"
                style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)', boxShadow: '0 4px 15px rgba(79,172,254,0.3)' }}
              >
                {editingPlan ? 'Update Plan' : 'Add Plan'}
              </button>
            </div>
          </form>
        </div>

        {/* Plans List */}
        <div className="rounded-lg shadow-xl p-6 text-white" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6" style={{
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Premium Plans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div
                key={plan._id}
                className={`relative rounded-lg overflow-hidden transition-all duration-300 ${plan.isActive ? 'bg-white/10' : 'bg-white/5'}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-xl md:text-2xl font-bold" style={{ color: '#4facfe' }}>₹{plan.price}</p>
                      <p className="text-sm text-gray-400">
                        {plan.durationInDays === 'unlimited' ? 'Unlimited' : `${plan.durationInDays} days`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(plan._id)}
                        className={`p-2 ${plan.isActive ? 'bg-green-500/20 hover:bg-green-500/40' : 'bg-white/10 hover:bg-white/20'} rounded-full`}
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.fullMovieAccess && (
                      <p className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Full Movie Access
                      </p>
                    )}
                    {plan.features.adFree && (
                      <p className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Ad Free
                      </p>
                    )}
                    {plan.features.hdStreaming && (
                      <p className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        HD Streaming
                      </p>
                    )}
                    {plan.features.earlyAccess && (
                      <p className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Early Access
                      </p>
                    )}
                    {plan.features.downloadsAllowed && (
                      <p className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Downloads Allowed
                      </p>
                    )}
                    <p className="text-sm text-gray-300 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4facfe' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {plan.features.maxDevices} {plan.features.maxDevices === 1 ? 'Device' : 'Devices'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${plan.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                      Status: {plan.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans; 