import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FaEnvelope, FaLock, FaKey, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import AuthLayout from "./components/AuthLayout";
import { sendUpdatePasswordOtp, updateUserPassword } from "./api/auth.js";
import useOtpTimer from "./hooks/useOtpTimer.js";

const UpdatePassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [customError, setCustomError] = useState("");

  const { secondsLeft, startTimer } = useOtpTimer();

  const otpMutation = useMutation({
    mutationFn: () => sendUpdatePasswordOtp(email),
    onSuccess: () => {
      setOtpMsg("OTP sent to your email!");
      setTimeout(() => setOtpMsg(""), 5000);
      startTimer();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateUserPassword(email, otp, newPassword),
    onSuccess: () => setSuccessMsg("Password updated successfully!"),
  });

  const handleSendOtp = () => {
    if (!email) { setCustomError("Please enter your email first."); return; }
    setCustomError("");
    otpMutation.mutate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const serverError = otpMutation.error?.message || updateMutation.error?.message || customError;
  const otpLoading = otpMutation.isPending;
  const submitLoading = updateMutation.isPending;
  const hasError = Boolean(serverError);

  const inputClass = (isError) => `
    w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-xl text-sm
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    transition-all duration-200 outline-none
    ${isError 
      ? "border-red-300 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
      : "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500"
    }
  `;

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a secure recovery code.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        
        {/* Email & Send OTP Group */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email address</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
              <input
                className={inputClass(hasError)}
                type="email"
                value={email}
                onChange={(e) => { 
                  setCustomError("");
                  otpMutation.reset();
                  updateMutation.reset();
                  setEmail(e.target.value); 
                }}
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading || secondsLeft > 0}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {otpLoading ? "Sending..." : secondsLeft > 0 ? `Wait ${secondsLeft}s` : "Get Code"}
            </button>
          </div>
          {otpMsg && <p className="text-green-600 dark:text-green-400 text-xs mt-2 ml-1 font-medium">{otpMsg}</p>}
        </div>

        {/* OTP Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Verification Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaKey />
            </div>
            <input
              className={inputClass(hasError)}
              type="text"
              value={otp}
              onChange={(e) => { 
                  setCustomError("");
                  otpMutation.reset();
                  updateMutation.reset();
                  setOtp(e.target.value); 
              }}
              placeholder="6-digit code"
              required
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              className={inputClass(hasError)}
              type="password"
              value={newPassword}
              onChange={(e) => { 
                  setCustomError("");
                  otpMutation.reset();
                  updateMutation.reset();
                  setNewPassword(e.target.value); 
              }}
              placeholder="Create a new strong password"
              minLength={6}
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* Errors & Success Messages */}
        {serverError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-xs font-medium text-center">{serverError}</p>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium text-center">{successMsg}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {submitLoading ? (
            "Updating Password..."
          ) : (
            <>
              Update Password
              <FaArrowRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 flex justify-center">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default UpdatePassword;
