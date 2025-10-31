import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apihelper } from "../service/ApiHelper";
import { toast, ToastContainer } from "react-toastify";

export default function UserProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [walletPoints, setWalletPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phonenumber: "",
    userimage: "",
  });
  const [copied, setCopied] = useState(false);

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [pointsToWithdraw, setPointsToWithdraw] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [withdrawErrors, setWithdrawErrors] = useState({});
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const token = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("token"));
    } catch {
      return null;
    }
  }, []);

  const loadUser = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await Apihelper.userInfo(token);
      console.log(res);
      const decode = res.data.userInfo || {};
      console.log(decode);
      setUserData(decode);
      setWalletPoints(decode.walletPoints || 0);
      setTransactions(
        (decode.walletTransactions || []).map((t, idx) => ({
          id: t._id || idx,
          date: new Date(t.createdAt).toISOString().slice(0, 10),
          description: t.reason,
          amount: t.points,
          type: t.type,
        }))
      );
      setPage(1);
      setForm({
        name: decode.name || "",
        email: decode.email || "",
        phonenumber: decode.phonenumber ? String(decode.phonenumber) : "",
        userimage: decode.userimage || "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((transactions?.length || 0) / pageSize)),
    [transactions]
  );
  const pageStart = (page - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const currentTransactions = useMemo(
    () => (transactions || []).slice(pageStart, pageEnd),
    [transactions, pageStart, pageEnd]
  );

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateWithdraw = () => {
    const errors = {};
    const pointsNum = Number(pointsToWithdraw);
    if (!pointsToWithdraw || Number.isNaN(pointsNum)) {
      errors.pointsToWithdraw = "Enter valid points";
    } else {
      if (pointsNum < 150) errors.pointsToWithdraw = "Minimum 150 points";
      if (pointsNum > walletPoints)
        errors.pointsToWithdraw = "Cannot exceed wallet balance";
    }
    if (!bankName || bankName.trim().length < 3)
      errors.bankName = "Enter valid bank name";
    const acct = String(accountNumber).replace(/\s+/g, "");
    if (!acct || !/^\d{9,18}$/.test(acct))
      errors.accountNumber = "Account number must be 9-18 digits";
    const ifsc = String(ifscCode).toUpperCase();
    if (!/^([A-Z]{4}0[A-Z0-9]{6})$/.test(ifsc))
      errors.ifscCode = "Enter valid IFSC (e.g., HDFC0ABC123)";
    setWithdrawErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateReferenceId = () => {
    return (
      "wd_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    );
  };

  const submitWithdraw = async () => {
    try {
      if (!userData?._id) return;
      if (!validateWithdraw()) return;
      if (submittingWithdraw) return;
      setSubmittingWithdraw(true);
      const payload = {
        userId: userData._id,
        points: Number(pointsToWithdraw),
        bankName: bankName.trim(),
        accountNumber: String(accountNumber).replace(/\s+/g, ""),
        ifscCode: String(ifscCode).toUpperCase(),
        referenceId: generateReferenceId(),
      };
      await Apihelper.createWithdrawalRequest(payload);
      setShowWithdraw(false);
      setPointsToWithdraw("");
      setBankName("");
      setAccountNumber("");
      setIfscCode("");
      setWithdrawErrors({});
      await loadUser();
      toast.success("Withdrawal request submitted. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("userinfo");
      toast.success("Withdrawal request submitted. Please log in again.");
      navigate("/login");
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const saveProfile = async () => {
    try {
      if (!userData?._id) return;
      setSaving(true);
      const payload = {
        name: form.name,
        email: form.email,
        phonenumber: Number(form.phonenumber) || form.phonenumber,
        userimage: form.userimage,
      };
      await Apihelper.editUser(payload, userData._id);
      // Force logout after profile update
      localStorage.removeItem("token");
      localStorage.removeItem("userinfo");
      toast.success("Profile updated. Please log in again.");
      navigate("/login");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const referralUrl =
    userData?.referralLink ||
    (userData?.referralCode
      ? `http://localhost:5173/register?ref=${userData.referralCode}`
      : "");
  const shareMessage = `Join me on KensDrive! Use my referral link: ${referralUrl}`;

  const legacyCopyToClipboard = (text) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const copyText = async (text) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return legacyCopyToClipboard(text);
    } catch {
      return false;
    }
  };

  const copyReferral = async () => {
    try {
      if (!referralUrl) return;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralUrl);
      } else {
        const ok = legacyCopyToClipboard(referralUrl);
        if (!ok) throw new Error("Copy failed");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
      toast.error("Copy failed. Long-press the link and select Copy.");
    }
  };

  const shareTo = (platform) => {
    const url = encodeURIComponent(referralUrl);
    const text = encodeURIComponent(shareMessage);
    let shareUrl = "";
    if (navigator.share) {
      navigator
        .share({ title: "KensDrive", text: shareMessage, url: referralUrl })
        .catch(() => { });
      return;
    }
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "instagram":
        // No official web share for Instagram; copy text and open Direct compose
        copyText(shareMessage)
          .then((ok) => {
            if (ok) toast.info("Text copied. Paste in Instagram Direct.");
            window.open("https://www.instagram.com/direct/new/", "_blank");
          })
          .catch(() => {
            window.open("https://www.instagram.com/direct/new/", "_blank");
          });
        return;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      default:
        shareUrl = `mailto:?subject=${encodeURIComponent(
          "Join KensDrive"
        )}&body=${text}`;
    }
    window.open(shareUrl, "_blank");
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: "rgba(15, 32, 39, 0.95)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-10">
            User Profile
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          {/* User Info Section */}
          <div className="px-6 py-8 md:flex md:items-start md:space-x-8 bg-gradient-to-b from-[#346275] to-[#2c5364]">
            <div className="md:w-1/3 mb-6 md:mb-0 text-center">
              <img
                className="h-32 w-32 rounded-full mx-auto border-4 border-white shadow-md"
                src={
                  editMode
                    ? form.userimage || userData?.userimage
                    : userData?.userimage
                }
                alt="Profile"
              />
            </div>

            <div className="md:w-1/3 mb-6 md:mb-0 bg-gradient-to-b p-10 from-[#346275] to-[#2c5364]">
              {!editMode ? (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {userData?.name || "-"}
                </h2>
              ) : (
                <input
                  className="w-full mb-3 px-3 py-2 rounded border"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                />
              )}
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-900 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {!editMode ? (
                    <span className="text-gray-900">
                      {userData?.email || "-"}
                    </span>
                  ) : (
                    <input
                      className="w-full px-3 py-2 rounded border"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Email"
                      type="email"
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-900 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {!editMode ? (
                    <span className="text-gray-900">
                      {userData?.phonenumber || "-"}
                    </span>
                  ) : (
                    <input
                      className="w-full px-3 py-2 rounded border"
                      value={form.phonenumber}
                      onChange={(e) =>
                        setForm({ ...form, phonenumber: e.target.value })
                      }
                      placeholder="Phone (10 digits)"
                      inputMode="numeric"
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-900 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">
                    Member since{" "}
                    {userData
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                {editMode && (
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-900 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                    </svg>
                    <input
                      className="w-full px-3 py-2 rounded border"
                      value={form.userimage}
                      onChange={(e) =>
                        setForm({ ...form, userimage: e.target.value })
                      }
                      placeholder="Profile image URL"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Balance - NOW WITH PREMIUM STATUS FIRST */}
            <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg bg-gradient-to-b from-[#346275] to-[#2c5364]">
              {/* Premium Status - Displayed First */}
              {userData?.isPremium ? (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg">
                    <svg
                      className="w-5 h-5 mr-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white font-bold text-sm">
                      PREMIUM USER
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 mt-2">Active Plan</p>
                </div>
              ) : (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-300 shadow-lg">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600 font-bold text-sm">
                      FREE USER
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 mt-2">
                    Upgrade to Premium
                  </p>
                  <button
                    onClick={() => navigate("/subscription")}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
                  >
                    Upgrade
                  </button>
                </div>
              )}

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Wallet Balance
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-4">
                {walletPoints} points
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          {referralUrl && (
            <div className="px-6 pb-8 bg-gradient-to-b from-[#346275] to-[#2c5364]">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Invite & Earn
              </h3>
              {/* Referral incentive details */}
              <div
                className="mb-4 rounded-lg border border-cyan-300/40 bg-cyan-500/10 p-4 shadow"
                style={{ boxShadow: "0 10px 25px rgba(79,172,254,0.18)" }}
              >
                <p className="text-sm text-white">
                  Invite a friend and earn{" "}
                  <span className="font-bold">10 points</span> when they sign
                  up. Each point is worth{" "}
                  <span className="font-bold">₹20.00</span> — that's
                  <span className="font-bold"> ₹20.00</span> per successful
                  invite.
                </p>
                <p className="text-xs text-cyan-100 mt-1">
                  Your friend also gets{" "}
                  <span className="font-semibold">2 points</span> as a welcome
                  bonus.
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 flex items-center bg-white/80 rounded border px-3 py-2">
                  <input
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 p-1"
                    value={referralUrl}
                    readOnly
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={copyReferral}
                    aria-label={copied ? "Copied" : "Copy referral link"}
                    title={copied ? "Copied" : "Copy referral link"}
                    className="px-3 py-2 rounded bg-blue-600 text-white w-full sm:w-auto flex items-center justify-center"
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 2a2 2 0 00-2 2v8a2 2 0 002 2h5a2 2 0 002-2V9a1 1 0 112 0v3a4 4 0 01-4 4H8a4 4 0 01-4-4V4a4 4 0 014-4h3a1 1 0 010 2H8z" />
                        <path d="M10 6a2 2 0 012-2h3a2 2 0 012 2v8a2 2 0 01-2 2h-3a2 2 0 01-2-2V6z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => shareTo("whatsapp")}
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                    className="px-3 py-2 rounded bg-green-600 text-white w-full sm:w-auto flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M20.52 3.48A11.78 11.78 0 0012.04 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.18 1.6 6.02L0 24l6.18-1.62a11.96 11.96 0 005.86 1.54h.01c6.58 0 11.95-5.36 11.95-11.95 0-3.2-1.25-6.21-3.48-8.49zM12.05 22.03h-.01a9.96 9.96 0 01-5.08-1.39l-.36-.21-3.67.96.98-3.58-.23-.37a9.96 9.96 0 01-1.53-5.31c0-5.5 4.48-9.97 9.98-9.97 2.67 0 5.18 1.04 7.07 2.92a9.93 9.93 0 012.92 7.07c0 5.5-4.48 9.96-9.97 9.96zm5.47-7.45c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.5l-.58-.01c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48 0 1.46 1.08 2.87 1.24 3.07.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.28-.2-.58-.35z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => shareTo("telegram")}
                    aria-label="Share on Telegram"
                    title="Share on Telegram"
                    className="px-3 py-2 rounded bg-sky-600 text-white w-full sm:w-auto flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M9.036 15.803l-.376 5.3c.539 0 .772-.231 1.05-.508l2.522-2.415 5.223 3.83c.958.528 1.637.253 1.9-.887l3.44-16.118.001-.001c.306-1.423-.514-1.979-1.46-1.63L1.28 9.67c-1.39.54-1.37 1.315-.237 1.666l5.34 1.666 12.41-7.83c.584-.355 1.118-.158.68.197" />
                    </svg>
                  </button>
                  <button
                    onClick={() => shareTo("instagram")}
                    aria-label="Share on Instagram"
                    title="Share on Instagram"
                    className="px-3 py-2 rounded bg-pink-600 text-white w-full sm:w-auto flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.324 3.608.059 1.266.071 1.646.071 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.324-1.266.059-1.646.071-4.85.071s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.324-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608C4.533 2.567 5.8 2.279 7.166 2.218 8.432 2.159 8.812 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 5.775.13 4.638.428 3.678 1.388c-.96.96-1.258 2.097-1.316 3.375C2.304 6.042 2.29 6.45 2.29 9.709v4.582c0 3.259.014 3.667.072 4.947.058 1.278.356 2.415 1.316 3.375.96.96 2.097 1.258 3.375 1.316 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.278-.058 2.415-.356 3.375-1.316.96-.96 1.258-2.097 1.316-3.375.058-1.28.072-1.688.072-4.947V9.709c0-3.259-.014-3.667-.072-4.947-.058-1.278-.356-2.415-1.316-3.375-.96-.96-2.097-1.258-3.375-1.316C15.667.014 15.259 0 12 0z" />
                      <path d="M12 5.838A6.162 6.162 0 005.838 12 6.162 6.162 0 0012 18.162 6.162 6.162 0 0018.162 12 6.162 6.162 0 0012 5.838zm0 10.162A4 4 0 118 12a4 4 0 014 4z" />
                      <circle cx="18.406" cy="5.594" r="1.44" />
                    </svg>
                  </button>
                  <button
                    onClick={() => shareTo("facebook")}
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                    className="px-3 py-2 rounded bg-blue-700 text-white w-full sm:w-auto flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                    >
                      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.406.593 24 1.325 24H12.82v-9.294H9.692V11.08h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.764v2.312h3.591l-.467 3.626h-3.124V24h6.127C23.406 24 24 23.406 24 22.674V1.326C24 .593 23.406 0 22.675 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="px-6 py-8 border-t  bg-gradient-to-b from-[#346275] to-[#2c5364]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Transaction History
            </h2>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-[640px] md:min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50  bg-gradient-to-b from-[#346275] to-[#2c5364]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200   bg-gradient-to-b from-[#346275] to-[#2c5364]">
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === "referral_reward"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {transaction.type === "referral_reward" ? "+" : "-"}
                        {Number(transaction.amount).toLocaleString("en-IN", {
                          style: "currency",
                         
                          minimumFractionDigits: 0,
                        })}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-800">
                Showing {transactions.length === 0 ? 0 : pageStart + 1}–
                {Math.min(pageEnd, transactions.length)} of{" "}
                {transactions.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-800">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Button */}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50"
          style={{ background: "rgba(0, 0, 0, 0.35)" }}
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="w-full max-w-md rounded-2xl shadow-xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.82) 100%)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <div className="p-6 flex flex-col max-h-[80vh]">
                <h3 className="text-lg font-semibold mb-1">
                  Request Withdrawal
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Available:{" "}
                  <span className="font-semibold text-green-700">
                    {walletPoints} points
                  </span>
                </p>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.5-12a.5.5 0 00-1 0v.535A2.75 2.75 0 009 9.25H8a.75.75 0 000 1.5h1a1.25 1.25 0 010 2.5H8.5a.5.5 0 000 1H9v.5a.5.5 0 001 0v-.53a2.75 2.75 0 001.5-2.47c0-.992-.592-1.86-1.5-2.258V6z" />
                      </svg>
                    </span>
                    <input
                      value={pointsToWithdraw}
                      onChange={(e) => setPointsToWithdraw(e.target.value)}
                      type="number"
                      min="150"
                      placeholder="Points (min 150)"
                      className={`w-full h-11 border pl-10 pr-3 rounded ${withdrawErrors.pointsToWithdraw ? "border-red-500" : ""
                        }`}
                    />
                    <div className="min-h-5">
                      {withdrawErrors.pointsToWithdraw && (
                        <p className="text-xs text-red-600 mt-1">
                          {withdrawErrors.pointsToWithdraw}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2L2 6v2h16V6l-8-4zM2 10h16v6H2v-6zm3 1v2h2v-2H5z" />
                      </svg>
                    </span>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank Name"
                      className={`w-full h-11 border pl-10 pr-3 rounded ${withdrawErrors.bankName ? "border-red-500" : ""
                        }`}
                    />
                    <div className="min-h-5">
                      {withdrawErrors.bankName && (
                        <p className="text-xs text-red-600 mt-1">
                          {withdrawErrors.bankName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v1H2V5zm16 3H2v7a2 2 0 002 2h12a2 2 0 002-2V8zM5 13h4v2H5v-2z" />
                      </svg>
                    </span>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      className={`w-full h-11 border pl-10 pr-3 rounded ${withdrawErrors.accountNumber ? "border-red-500" : ""
                        }`}
                    />
                    <div className="min-h-5">
                      {withdrawErrors.accountNumber && (
                        <p className="text-xs text-red-600 mt-1">
                          {withdrawErrors.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 3h12a1 1 0 110 2H4a1 1 0 110-2zm0 6h12a1 1 0 110 2H4a1 1 0 110-2zm0 6h12a1 1 0 110 2H4a1 1 0 110-2z" />
                      </svg>
                    </span>
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="IFSC Code (e.g., HDFC0ABC123)"
                      className={`w-full h-11 border pl-10 pr-3 rounded ${withdrawErrors.ifscCode ? "border-red-500" : ""
                        }`}
                    />
                    <div className="min-h-5">
                      {withdrawErrors.ifscCode && (
                        <p className="text-xs text-red-600 mt-1">
                          {withdrawErrors.ifscCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setShowWithdraw(false)}
                    className="px-4 py-2 rounded bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submittingWithdraw}
                    onClick={submitWithdraw}
                    className={`px-4 py-2 rounded text-white ${submittingWithdraw
                        ? "bg-blue-300"
                        : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {submittingWithdraw ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer autoClose={600} />
    </div>
  );
}
