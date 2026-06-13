import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FaUser, FaEnvelope, FaLock, FaKey, FaArrowRight } from "react-icons/fa";
import { toast } from "./store/uiStore";
import GoogleLoginButton from "./components/GoogleLoginButton";
import GithubLoginButton from "./components/GithubLoginButton";
import AuthLayout from "./components/AuthLayout";
import { sendRegisterOtp, registerWithOtp } from "./api/auth.js";
import useOtpTimer from "./hooks/useOtpTimer.js";
import { sanitizeText } from "./utils/sanitize.js";

const Register = () => {
  const navigate = useNavigate();
  const { secondsLeft, startTimer } = useOtpTimer();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const otpMutation = useMutation({
    mutationFn: () => sendRegisterOtp(formData.email),
    onSuccess: () => {
      setOtpMsg("OTP sent to your email!");
      setTimeout(() => setOtpMsg(""), 5000);
      startTimer();
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => registerWithOtp({ ...formData, name: sanitizeText(formData.name) }, otp),
    onSuccess: () => navigate("/app"),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = () => {
    otpMutation.reset();
    registerMutation.reset();

    if (!formData.email) {
      toast.error("Email is required to send OTP.");
      return;
    }

    otpMutation.mutate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !otp) {
      toast.error("Name, Email, Password, and OTP are all required to register.");
      return;
    }

    otpMutation.reset();
    registerMutation.reset();
    registerMutation.mutate();
  };

  const serverError = otpMutation.error?.message || registerMutation.error?.message;
  const hasSendOtpError = Boolean(otpMutation.error);
  const hasRegisterError = Boolean(registerMutation.error);

  const inputClass = (hasError) => `
    w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border rounded-xl text-sm
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    transition-all duration-200 outline-none
    ${hasError 
      ? "border-red-300 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
      : "border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500"
    }
  `;

  return (
    <AuthLayout title="Create an account" subtitle="Join Storra and secure your digital life">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaUser />
            </div>
            <input
              className={inputClass(hasRegisterError)}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
            <input
              className={inputClass(hasSendOtpError || hasRegisterError)}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              className={inputClass(hasRegisterError)}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </div>
        </div>

        {/* OTP Group */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Verification Code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaKey />
              </div>
              <input
                className={inputClass(hasSendOtpError || hasRegisterError)}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpMutation.isPending || secondsLeft > 0}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {otpMutation.isPending
                ? "Sending..."
                : secondsLeft > 0
                  ? `Wait ${secondsLeft}s`
                  : "Get Code"}
            </button>
          </div>
          {otpMsg && <p className="text-green-600 dark:text-green-400 text-xs mt-2 ml-1 font-medium">{otpMsg}</p>}
        </div>

        {/* Errors */}
        {serverError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-xs font-medium text-center">{serverError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {registerMutation.isPending ? (
            "Creating account..."
          ) : (
            <>
              Create Account
              <FaArrowRight className="text-white/70 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3">
        <GoogleLoginButton />
        <GithubLoginButton />
      </div>

      {/* Login Link */}
      <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
