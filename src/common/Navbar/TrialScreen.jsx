import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrialScreen() {

    const navigete = useNavigate()
    return (
        <div className="relative w-full h-[320px] md:h-[250px] flex items-center justify-center overflow-hidden pb-10">
        <img
            src="https://connectedplatforms.com.au/wp-content/uploads/2021/09/bigstock-Cloud-Technology-Background-C-368415913.jpg"
            alt="Cloud Storage Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2027]/90 to-[#2c5364]/90 flex flex-col md:flex-row items-center justify-between px-4 md:px-16 py-8 z-10">
            <div className="flex-1 flex flex-col items-center md:items-start">
                <h2 className="text-white font-bold mb-3 text-2xl md:text-3xl text-center md:text-left">
                    Start your free cloud storage today!
                </h2>
                <p className="text-white mb-4 md:mb-0 text-center md:text-left max-w-xl">
                    Get 15GB of free secure cloud storage to store, access, and share your files from anywhere.
                </p>
            </div>
            <button 
                onClick={() => navigete("/subscription")} 
                style={{
                    background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                    boxShadow: "0 4px 15px rgba(79, 172, 254, 0.3)"
                }} 
                className="hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow mt-4 md:mt-0 md:ml-8 transition-all duration-200 hover:scale-105" 
            >
                Get Started
            </button>
        </div>
    </div>
    );
}