"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

type AuthHtmlFrameProps = {
  html: string;
  variant: "sign-in" | "sign-up";
};

const AUTH_COOKIE = "nc_auth";
const AUTH_MESSAGE = "nc-auth-login";

function prepareHtml(html: string, variant: AuthHtmlFrameProps["variant"]) {
  let nextHtml = html.replace(/^\uFEFF/, "");

  nextHtml = nextHtml.replace(
    "<head>",
    '<head><base target="_parent">',
  );

  if (variant === "sign-in") {
    nextHtml = nextHtml
      .replace(/<p class="register-link">Chưa có tài khoản\? <a href="#">Đăng ký miễn phí<\/a><\/p>/, '<p class="register-link">Chưa có tài khoản? <a href="/sign-up">Đăng ký miễn phí</a></p>')
      .replace("window.location.href='dashboard.html';", `parent.postMessage({type:'${AUTH_MESSAGE}'},'*');`);
  }

  if (variant === "sign-up") {
    nextHtml = nextHtml.replace('href="login.html"', 'href="/sign-in"');
  }

  return nextHtml;
}

export function AuthHtmlFrame({ html, variant }: AuthHtmlFrameProps) {
  const router = useRouter();
  const srcDoc = useMemo(() => prepareHtml(html, variant), [html, variant]);

  useEffect(() => {
    if (document.cookie.split("; ").some((item) => item === `${AUTH_COOKIE}=1`)) {
      router.replace("/dashboard");
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.data?.type !== AUTH_MESSAGE) {
        return;
      }

      document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Lax`;
      router.replace("/dashboard");
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <iframe
      srcDoc={srcDoc}
      title={variant === "sign-in" ? "Đăng nhập – Webico" : "Đăng ký – Webico"}
      style={{
        width: "100vw",
        height: "100vh",
        border: 0,
        display: "block",
        background: "#fff",
      }}
    />
  );
}
