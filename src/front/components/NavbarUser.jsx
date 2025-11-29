import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export const NavbarUser = () => {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState("U");
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    try {
      const user = raw ? JSON.parse(raw) : null;
      const name = user?.name || localStorage.getItem("user_name") || "";
      const i = (name && name.trim()[0]?.toUpperCase()) || String(localStorage.getItem("user_id") || "U")[0];
      setInitial(i);
    } catch {
      setInitial(String(localStorage.getItem("user_id") || "U")[0]);
    }
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "linear-gradient(90deg,#2c5aa0,#325fad)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1200,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 20px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo.jpg"
            style={{
              height: 44,
              width: 44,
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
          />
          {!isMobile && (
            <Link
              to="/home"
              style={{
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: -0.6,
                marginLeft: 2,
              }}
            >
              setameal
            </Link>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={open}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 12,
                color: "#fff",
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#F0E5CF",
                  color: "#4B6587",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.06)",
                }}
              >
                {initial}
              </div>

              {!isMobile && (
                <div style={{ marginLeft: 6, color: "#FFFFFF", fontWeight: 700, fontSize: 15 }}>
                  Perfil
                </div>
              )}

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 160ms cubic-bezier(.2,.9,.2,1)",
                  marginLeft: 6,
                  opacity: 0.95,
                }}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 10px)",
                  minWidth: 200,
                  background: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 14px 40px rgba(15,23,42,0.12)",
                  overflow: "hidden",
                  zIndex: 1400,
                  display: "flex",
                  flexDirection: "column",
                  transformOrigin: "top right",
                  animation: "fadeInDown 160ms ease",
                }}
              >
                <Link
                  to="/profile"
                  style={{
                    padding: "12px 16px",
                    color: "#21334a",
                    textDecoration: "none",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  Ver perfil
                </Link>

                <Link
                  to="/settings"
                  style={{
                    padding: "12px 16px",
                    color: "#21334a",
                    textDecoration: "none",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  Ajustes
                </Link>

                <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

                <button
                  onClick={handleLogout}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#b00020",
                    fontWeight: 800,
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
};

export default NavbarUser;
