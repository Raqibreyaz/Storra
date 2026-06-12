import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FaEnvelope, FaLock, FaKey, FaArrowRight } from "react-icons/fa";
import GoogleLoginButton from "./components/GoogleLoginButton";
import GithubLoginButton from "./components/GithubLoginButton";
import AuthLayout from "./components/AuthLayout";
import { sendLoginOtp, loginWithOtp } from "./api/auth.js";
import useOtpTimer from "./hooks/useOtpTimer.js";

const Login = () => {
  const navigate = useNavigate();
  const { secondsLeft, startTimer } = useOtpTimer();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const otpMutation = useMutation({
    mutationFn: () => sendLoginOtp(formData.email, formData.password),
    onSuccess: () => {
      setOtpMsg("OTP sent to your email!");
      setTimeout(() => setOtpMsg(""), 5000);
      startTimer();
    },
  });

  const loginMutation = useMutation({
    mutationFn: () => loginWithOtp(formData.email, otp),
    onSuccess: () => navigate("/app"),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = () => {
    otpMutation.reset();
    loginMutation.reset();
    
    if (!formData.email || !formData.password) {
      otpMutation.mutate(); 
      return;
    }
    
    otpMutation.mutate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    otpMutation.reset();
    loginMutation.reset();
    loginMutation.mutate();
  };

  const serverError = otpMutation.error?.message || loginMutation.error?.message;
  const hasSendOtpError = Boolean(otpMutation.error);
  const hasLoginError = Boolean(loginMutation.error);

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
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
            <input
              className={inputClass(hasSendOtpError || hasLoginError)}
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
          <div className="flex justify-between items-center mb-1.5 ml-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link to="/update-password" className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              className={inputClass(hasSendOtpError)}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
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
                className={inputClass(hasSendOtpError || hasLoginError)}
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
          disabled={loginMutation.isPending}
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {loginMutation.isPending ? (
            "Verifying..."
          ) : (
            <>
              Sign In
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
      <div className="grid grid-cols-2 gap-3">
        <GoogleLoginButton />
        <GithubLoginButton />
      </div>

      {/* Register Link */}
      <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Create one now
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
