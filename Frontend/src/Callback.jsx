import React, { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    if (window.name === "github-oauth") {
      console.log("sending success message to tab!");
      (async function () {
        window.opener.postMessage({ message: "success" });
        window.close();
      })();
    }
  }, []);
  return <div>Callback</div>;
}
