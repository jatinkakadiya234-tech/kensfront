import React, { useState, useRef, useEffect } from 'react';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import { Dialog } from '@headlessui/react';
import { Link } from "react-router-dom";
import Path from "../Path";

export default function Footer() {
    const [isOpen, setIsOpen] = useState(false);
    const closeButtonRef = useRef(null);
    const [privacyOpen, setPrivacyOpen] = useState(false);

    // Focus management for accessibility
    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    return (
        <footer
            className='text-white py-12'
            style={{
                background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
            }}
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Navigation Links */}
                    <div>
                        <h3
                            className="text-sm font-bold mb-4 h-[2px]"
                            style={{
                                background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Navigation
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <Link
                                    to={Path.home}
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    <CloudIcon className="mr-2 text-sm" />
                                    My Files
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={Path.movie}
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    <StorageIcon className="mr-2 text-sm" />
                                    Storage
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={Path.subscription}
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    <SecurityIcon className="mr-2 text-sm" />
                                    Plans
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3
                           className="text-sm font-bold mb-4 h-[2px]"
                            style={{
                                background: "linear-gradient(45deg, #00f2fe, #4facfe)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Support
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Subscription */}
                    <div>
                        <h3
                            className="text-sm font-bold mb-4 h-[2px]"
                            style={{
                                background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Plans
                        </h3>
                        <ul className='space-y-3'>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    Free Plan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    Pro Plan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#"
                                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                                >
                                    Business Plan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3
                           className="text-sm font-bold mb-4 h-[2px]"
                            style={{
                                background: "linear-gradient(45deg, #00f2fe, #4facfe)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Connect With Us
                        </h3>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(45deg, #1877f2, #4facfe)"
                                }}
                                aria-label="Facebook"
                            >
                                <FacebookOutlinedIcon className="text-white" />
                            </a>
                            <a
                                href="#"
                                className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(45deg, #1da1f2, #00f2fe)"
                                }}
                                aria-label="Twitter"
                            >
                                <TwitterIcon className="text-white" />
                            </a>
                            <a
                                href="#"
                                className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(45deg, #0077b5, #4facfe)"
                                }}
                                aria-label="LinkedIn"
                            >
                                <LinkedInIcon className="text-white" />
                            </a>
                        </div>
                        <div className="mt-4 text-gray-300 text-sm">
                            <p>Follow us for updates and cloud storage tips</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div
                    className="w-full h-px mb-8"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.5), transparent)"
                    }}
                />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h4
                             className="text-sm font-bold mb-4 h-[2px]"
                            style={{
                                background: "linear-gradient(45deg, #4facfe, #00f2fe, #4facfe)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            CloudDrive
                        </h4>
                        <p className="text-gray-400 text-sm">
                            Secure cloud storage for all your files and documents
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
                        <span>© 2024 CloudDrive. All rights reserved.</span>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPrivacyOpen(true)}
                                className="hover:text-white transition-colors duration-300"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="hover:text-white transition-colors duration-300"
                            >
                                Terms of Service
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50"
                initialFocus={closeButtonRef}
            >
                <div className="fixed inset-0 bg-primary-dark/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <Dialog.Title className="text-2xl font-bold text-gray-800">
                                Terms and Conditions
                            </Dialog.Title>
                            <button
                                ref={closeButtonRef}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 text-xl font-bold p-1 rounded transition-colors"
                                aria-label="Close terms dialog"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="text-base text-gray-700 space-y-4 pr-4">
                            <p><strong>Effective Date:</strong> 21/7/25</p>
                            <p>Welcome to CloudDrive! These Terms and Conditions ("Terms") govern your use of our cloud storage services, accessible at https://clouddrive.example.com. By using our platform, you agree to these Terms. If you do not agree, please do not use our services.</p>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">1. Acceptance of Terms</h2>
                                <p>By accessing or using CloudDrive, you confirm that you are at least 13 years old and have the legal capacity to enter into a binding agreement. If you are using the service on behalf of an organization, you represent that you have authority to bind that entity to these Terms.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">2. Services Provided</h2>
                                <p>CloudDrive offers secure file hosting, sharing, and cloud storage services. We reserve the right to update, modify, or discontinue any feature or service without prior notice.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">3. User Responsibilities</h2>
                                <p>When using our service, you agree that:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>You will not upload or share illegal, harmful, or copyrighted content without permission.</li>
                                    <li>You are solely responsible for the content you upload or share.</li>
                                    <li>You will not use our service to distribute viruses, malware, or any other harmful software.</li>
                                    <li>You will comply with all applicable local, national, and international laws and regulations.</li>
                                </ul>
                                <p className="mt-2">Violation of these terms may result in suspension or termination of your access.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">4. Account & Access</h2>
                                <p>You may be required to create an account to access certain features. You agree to:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>Provide accurate, up-to-date information.</li>
                                    <li>Keep your login credentials secure.</li>
                                    <li>Accept responsibility for all activity under your account.</li>
                                </ul>
                                <p className="mt-2">We may suspend or terminate your account if we believe it's being used in violation of these Terms.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">5. Content Ownership and License</h2>
                                <p>You retain ownership of any content you upload to CloudDrive.</p>
                                <p>By uploading content, you grant us a non-exclusive, royalty-free license to host and deliver your files for the purpose of providing the service.</p>
                                <p>We do not claim ownership of your content and will not use it for any purpose beyond service functionality.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">6. Limitation of Liability</h2>
                                <p>CloudDrive is provided "as is" and "as available." We do not guarantee uninterrupted or error-free service.</p>
                                <p>We are not liable for:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>Data loss or corruption</li>
                                    <li>Service interruptions</li>
                                    <li>Unauthorized access to user data</li>
                                    <li>Damages resulting from the use or inability to use the service</li>
                                </ul>
                                <p className="mt-2">Your use of the service is at your own risk.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">7. Termination</h2>
                                <p>We reserve the right to suspend or terminate your access at any time, without notice, for any reason, including violation of these Terms.</p>
                                <p>You may stop using the service at any time. Content may be deleted upon termination.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">8. Modifications to Terms</h2>
                                <p>We may update these Terms at any time. Changes will be posted here with an updated "Effective Date." Continued use of the service after changes means you accept the new Terms.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">9. Governing Law</h2>
                                <p>These Terms are governed by the laws of India. Any legal disputes must be filed in the courts of that jurisdiction.</p>
                            </section>

                            <section className="pt-2">
                                <h2 className="font-bold text-lg text-gray-800">10. Contact Information</h2>
                                <p>CloudDrive Support<br />Email: support@clouddrive.example.com</p>
                            </section>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
            {/* Privacy Policy Modal */}
            <Dialog
                open={privacyOpen}
                onClose={() => setPrivacyOpen(false)}
                className="relative z-50"
                initialFocus={closeButtonRef}
            >
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <Dialog.Title className="text-2xl font-bold text-gray-800">
                                Privacy Policy for KenshDrive
                            </Dialog.Title>
                            <button
                                ref={closeButtonRef}
                                onClick={() => setPrivacyOpen(false)}
                                className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 text-xl font-bold p-1 rounded transition-colors"
                                aria-label="Close privacy dialog"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="text-base text-gray-700 space-y-4 pr-4" style={{ whiteSpace: 'pre-line' }}>
                            {`
Effective Date: 21/7/25

At KenshDrive, accessible from https://kensdrive.co.in/, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines the types of information we collect, how we use it, and the choices you have regarding your information.

1. Information We Collect
We collect the following types of data when you use our services:

Personal Information: Such as name, email address, and contact details when voluntarily provided.

Device Information: Browser type, IP address, operating system, and device type.

Usage Data: Pages visited, features used, links clicked, time spent on the website, and referral source.

We do not collect or store sensitive personal data unless necessary and explicitly provided by you.

2. How We Use Your Information
Your information may be used to:

Provide, maintain, and improve our services.

Send notifications and updates.

Respond to customer service requests and technical support.

Monitor analytics and user behavior to enhance functionality.

Prevent fraud and ensure security.

We do not sell or share your personal information with third parties for marketing purposes.

3. Cookies & Tracking Technologies
We use cookies and similar technologies to:

Save your preferences.

Improve website performance.

Analyze traffic and user behavior.

You can disable cookies in your browser settings, but some features may not function properly.

4. Data Security
We use industry-standard security measures such as HTTPS, encryption, and access control to protect your information. While we strive to secure your data, no method of transmission over the internet is 100% secure.

5. Third-Party Services
Our website may use or link to third-party services like analytics, hosting providers, or cloud storage. These services have their own privacy policies, and we encourage you to review them.

6. Children's Privacy
Our service is not intended for children under 13. We do not knowingly collect information from anyone under that age. If you believe a child has provided us with data, contact us and we will remove it.

7. Your Rights
You have the right to:

Access, update, or delete your personal data.

Withdraw consent at any time.

Request a copy of the data we store.

To exercise these rights, please contact us.

8. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. Changes will be posted on this page with a new effective date. Continued use of the site indicates your agreement to the revised terms.

9. Contact Us
If you have questions about this Privacy Policy or your data, contact:

KenshDrive Support
Email: kensdrive@gmail.com
`}
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </footer>
    );
}