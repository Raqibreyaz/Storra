import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../api/auth.js";
import { toast } from "../store/uiStore";

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={async function ({ credential }) {
          try {
            await loginWithGoogle(credential);
            navigate("/app");
          } catch (err) {
            toast.error(err.message || "Google login failed");
          }
        }}
        onError={function () {
          toast.error("Some Error Occured!");
        }}
        text="continue_with"
        size="large"
        theme="filled_blue"
        useOneTap
      />
    </div>
  );
}
