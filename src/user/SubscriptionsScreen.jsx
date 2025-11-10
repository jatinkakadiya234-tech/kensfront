import React, { useEffect, useRef, useState } from 'react';
import { Apihelper } from '../common/service/ApiHelper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function SubscriptionsScreen() {
    const [planType, setPlanType] = useState('monthly');
    const [Plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const handlePlanTypeChange = (type) => {
        setPlanType(type);
    };

    async function listplan() {
        try {
            setLoading(true);
            const res = await Apihelper.Activeplan();
            setPlans(res.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        listplan();
    }, []);

    // Razorpay payment handler
    const handleRazorpay = async (plan) => {
        let user = null;
        let token = null;
        try {
            user = JSON.parse(localStorage.getItem("userinfo"));
            token = localStorage.getItem("token");
        } catch {
            user = null;
            token = null;
        }
      
        if (!token) {
            navigate("/login");
            return;
        }
      
        try {
            // ✅ Step 1: Create order from backend
            const orderRes = await Apihelper.crearteorder({
                userid: user?._id,
                premiumType: plan.name,
                price: plan.price,
                days: plan.durationInDays,
            });
      
            const order = orderRes.data.data.razorpayDetails;
      
            // ✅ Step 2: Razorpay checkout options
            const options = {
                key: "rzp_live_RQ5RTynNmBshtz",
                amount: order.amount,
                currency: order.currency,
                name: "CloudDrive",
                description: `Subscribe to ${plan.name} plan`,
                order_id: order.id, // Razorpay Order ID
                handler: async function (response) {
                    try {
                        // ✅ Step 3: Call upgrade API
                        await Apihelper.upgradplan({
                            type: plan.name,
                            orderId: orderRes.data.data._id, // MongoDB doc ID
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            user: user,
                        });
                        toast.success("Payment and upgrade successful! Please login again to access premium features.");
                        
                        // Logout user after successful payment verification
                        localStorage.removeItem('token');
                        localStorage.removeItem('userinfo');
                        localStorage.removeItem('videoHistory');
                        
                        // Navigate to login page
                        navigate('/login');
                    } catch (err) {
                        toast.error("Payment succeeded but backend failed: " + (err?.response?.data?.message || err.message));
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || "",
                },
                theme: { color: "#4facfe" },
            };
      
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Order creation failed: " + (error?.response?.data?.message || error.message));
        }
    };

    // Square loader component
    const SquareLoader = () => (
        <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 animate-loader"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 animate-loader animation-delay-200"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 animate-loader animation-delay-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 animate-loader animation-delay-600"></div>
            </div>
        </div>
    );

    // No Plans Available Poster Component
    const NoPlansPoster = () => (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="max-w-md mx-auto">
                {/* You can replace this with your actual poster/image */}
                <div className="bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-2xl p-8 mb-6 shadow-2xl border border-[#4facfe]">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Coming Soon!</h3>
                    <p className="text-[#d3dad9] mb-4">We're working on exciting new plans for you.</p>
                </div>
                
                {/* Alternative: If you have an actual image */}
                {/* <img 
                    src="/path-to-your-poster-image.jpg" 
                    alt="Plans Coming Soon"
                    className="w-full max-w-sm rounded-2xl shadow-2xl mb-6 mx-auto"
                /> */}
                
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">No Plans Available</h2>
                    <p className="text-[#d3dad9] text-lg mb-6">
                        We're currently preparing some amazing subscription plans for you. 
                        Check back soon for exciting offers!
                    </p>
                    <button 
                        onClick={listplan}
                        className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#3a8dcf] hover:to-[#00c9e0] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Refresh Plans
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center py-6 px-2 sm:px-4 md:px-0 gap-6 mt-14"
            style={{
                background: "rgba(15, 32, 39, 0.95)", 
            }}
        >
            <div className="max-w-7xl mx-auto pt-10 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#0f2027] to-[#203a43] rounded-xl p-6 mb-6 gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className='text-2xl font-bold mb-0 text-white'>Choose the plan that's right for you</div>
                        <p className='mt-0 text-[#d3dad9]'>Join CloudDrive and select from our flexible storage plans tailored to suit your needs. Get secure cloud storage for all your files!</p>
                    </div>
                </div>
                
                {loading ? (
                    <SquareLoader />
                ) : Plans.length === 0 ? (
                    <NoPlansPoster />
                ) : (
                    <>
                        <div className="mt-6">
                            <div className="flex flex-col md:flex-row md:space-x-6 gap-6">
                                {Plans.map((plan, index) => (
                                    <div className="flex-1 mb-4 md:mb-0" key={index}>
                                        <div className={`relative bg-gradient-to-b from-[#0f2027] to-[#2c5364] rounded-2xl p-6 h-full flex flex-col shadow-lg border border-[#2a4a5e] ${plan._id ? 'ring-2 ring-[#4facfe]' : ''}`}>
                                            {plan.tag && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="bg-[#4facfe] text-white px-3 py-1 rounded-full text-xs font-bold shadow">Most Popular</span>
                                                </div>
                                            )}
                                            <div className="mb-4">
                                                <div className='text-white text-xl font-semibold mb-3 flex justify-between items-center'>
                                                    <span>{plan.name === "monthly" ? "monthly" : "Unlimited"}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <h2 className="text-3xl font-bold text-white mb-0 flex items-end">
                                                        <span className="mr-1">₹</span>
                                                        <span>{plan.price}</span>
                                                        <span className="ml-1 text-base font-medium">/{plan.name === "monthly" ? "monthly" : "Unlimited"}</span>
                                                    </h2>
                                                </div>
                                                <p className="text-[#d3dad9] text-sm">{plan.features.Content}</p>
                                            </div>
                                            <div className="mb-4 space-y-2">
                                                {plan.features && Object.entries(plan.features).length > 0 ? (
                                                    Object.entries(plan.features).map(([key, value], i) => (
                                                        <div className="flex items-center" key={i}>
                                                            <svg className={`w-5 h-5 mr-2 ${value === true ? 'text-[#4facfe]' : value === false ? 'text-[#44444E]' : 'text-[#d3dad9]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                {value === true ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                ) : value === false ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                ) : (
                                                                    <circle cx="12" cy="12" r="10" />
                                                                )}
                                                            </svg>
                                                            <span className="text-white font-semibold mr-2">{key}:</span>
                                                            <span className="text-[#d3dad9]">{String(value)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-[#d3dad9]">No features available</div>
                                                )}
                                            </div>
                                            <div className="mt-auto">
                                                <button 
                                                    className='bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white w-full py-3 rounded-lg font-semibold hover:from-[#3a8dcf] hover:to-[#00c9e0] transition-all duration-200 shadow-md hover:shadow-lg'
                                                    onClick={() => handleRazorpay(plan)}
                                                >
                                                    <span className="block">Choose {plan.name === "monthly" ? "monthly" : "Unlimited"} Plan</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="my-10"></div>
                    </>
                )}

                {/* Add CSS for the square loader animation */}
                <style jsx>{`
                    @keyframes loader {
                        0% { transform: scale(1); }
                        50% { transform: scale(0.5); }
                        100% { transform: scale(1); }
                    }
                    .animate-loader {
                        animation: loader 1.4s infinite ease-in-out;
                    }
                    .animation-delay-200 {
                        animation-delay: 0.2s;
                    }
                    .animation-delay-400 {
                        animation-delay: 0.4s;
                    }
                    .animation-delay-600 {
                        animation-delay: 0.6s;
                    }
                `}</style>
            </div>
        </div>
    );
}