import { FaShieldAlt, FaSyncAlt } from "react-icons/fa";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 transition-colors">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800">
        
        {/* Left Side: Brand/Visual */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 lg:p-16 relative overflow-hidden bg-gray-950">
          {/* Decorative Mesh / Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 opacity-90"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl tracking-tighter">S</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Storra</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Your digital life,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                secured.
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Store, sync, and share your files effortlessly with military-grade encryption and lightning-fast speeds.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-6 mt-12">
             <div className="flex items-center gap-4 text-gray-300 group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm shrink-0 group-hover:bg-white/10 transition-colors">
                  <FaShieldAlt className="text-blue-400 text-xl" />
               </div>
               <div>
                 <h3 className="font-semibold text-white">Bank-level Security</h3>
                 <p className="text-sm text-gray-500">End-to-end encryption for all your files.</p>
               </div>
             </div>
             <div className="flex items-center gap-4 text-gray-300 group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm shrink-0 group-hover:bg-white/10 transition-colors">
                  <FaSyncAlt className="text-violet-400 text-xl" />
               </div>
               <div>
                 <h3 className="font-semibold text-white">Real-time Sync</h3>
                 <p className="text-sm text-gray-500">Access your files seamlessly across all devices.</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-gray-900 relative">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden flex items-center gap-2.5 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg tracking-tighter">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Storra</span>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
}
