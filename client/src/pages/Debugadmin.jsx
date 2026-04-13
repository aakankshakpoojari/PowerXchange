import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function DebugAdmin() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [adminRow, setAdminRow] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function run() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        setUid("NO SESSION");
        setLoaded(true);
        return;
      }

      setUid(session.user.id);
      setEmail(session.user.email);

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("id, email, role, status")
        .eq("id", session.user.id)
        .single();

      if (pErr) {
        setProfileErr(pErr.message);
      } else {
        setRole(profile?.role ?? "NULL");
        setStatus(profile?.status ?? "NULL");
      }

      const { data: ar, error: aErr } = await supabase
        .from("admin_roles")
        .select("id, email")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (aErr) {
        setAdminErr(aErr.message);
      } else {
        setAdminRow(ar ? JSON.stringify(ar) : "NULL - not in admin_roles table");
      }

      setLoaded(true);
    }
    run();
  }, []);

  if (!loaded) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#000",
      color: "#00ff00",
      fontFamily: "monospace",
      fontSize: "13px",
      padding: "16px",
      zIndex: 99999,
      borderTop: "3px solid yellow"
    }}>
      <div style={{ color: "yellow", fontWeight: "bold", marginBottom: 8 }}>
        DEBUG PANEL
      </div>
      <div>UID: {uid}</div>
      <div>EMAIL: {email}</div>
      <div style={{ color: role === "admin" ? "#00ff00" : "#ff4444" }}>
        profiles.role = "{role}" {role === "admin" ? "OK" : "THIS IS THE PROBLEM"}
      </div>
      <div>profiles.status = "{status}"</div>
      <div>admin_roles row = {adminRow}</div>
      {profileErr && <div style={{ color: "#ff4444" }}>profileError: {profileErr}</div>}
      {adminErr && <div style={{ color: "#ff4444" }}>adminRoleError: {adminErr}</div>}
    </div>
  );
}

export default DebugAdmin;