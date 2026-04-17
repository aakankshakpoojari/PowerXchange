import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Eye, EyeOff } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const photoInputRef  = useRef(null);
  const idCardInputRef = useRef(null);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [college,  setCollege]  = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [photoPreview,  setPhotoPreview]  = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);

  const uploadImage = async (file, folder) => {
    const fileExt  = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !college || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const idCardFile = idCardInputRef.current?.files?.[0];
    if (!idCardFile) {
      setError("Please upload your college ID card");
      setLoading(false);
      return;
    }

    try {
      // ── Step 1: Create the auth user ─────────────────────────────────────
      // The handle_new_user trigger will auto-create a profiles row immediately.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, full_name: name, college, phone, location } },
      });

      if (authError) {
        setError(
          authError.message.includes("already registered") || authError.message.includes("already been registered")
            ? "This email is already registered. Please login instead."
            : authError.message
        );
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("User registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const uid = authData.user.id;

      // ── Step 2: Upload images (authenticated now) ─────────────────────────
      let photoUrl  = null;
      let idCardUrl = null;
      const photoFile  = photoInputRef.current?.files?.[0];
      const idCardFile = idCardInputRef.current?.files?.[0];

      if (photoFile || idCardFile) {
        setUploadingImages(true);
        try {
          if (photoFile)  photoUrl  = await uploadImage(photoFile,  "person_photos");
          if (idCardFile) idCardUrl = await uploadImage(idCardFile, "id_cards");
        } catch (uploadErr) {
          // Non-fatal — continue without the photo
          console.warn("Image upload failed:", uploadErr.message);
        }
        setUploadingImages(false);
      }

      // ── Step 3: Update the profile row the trigger already created ────────
      // Wait briefly for the DB trigger to create the profiles row first.
      await new Promise((r) => setTimeout(r, 1000));

      const profilePayload = {
        full_name: name,   // profiles table uses full_name, not name
        email,
        college,
        phone,
        location,
        role: "user",
        status: "pending",
        ...(photoUrl  && { photo_url:   photoUrl  }),
        ...(idCardUrl && { id_card_url: idCardUrl }),
      };

      // Try UPDATE first (row should exist from trigger)
      const { error: profileError, count } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", uid)
        .select();

      if (profileError || !count) {
        // Trigger row not yet created — use upsert as safe fallback
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(
            { id: uid, ...profilePayload },
            { onConflict: "id", ignoreDuplicates: false }
          );
        if (upsertError) {
          console.error("Profile upsert failed:", upsertError.message);
        }
      }

      // Redirect to login after successful signup
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Signup error: " + err.message);
      setUploadingImages(false);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isLoggedIn={false} />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

          <h1 className="text-2xl font-bold text-indigo-600 mb-2">PowerXchange</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-6">Join thousands of students exchanging books</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" placeholder="Enter your full name" value={name}
                onChange={(e) => setName(e.target.value)} required
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">College Email</label>
              <input type="email" placeholder="yourname@college.edu" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">College Name</label>
              <input type="text" placeholder="Enter your college name" value={college}
                onChange={(e) => setCollege(e.target.value)} required
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" placeholder="Your phone number" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" placeholder="City, State" value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input type={showPassword ? "text" : "password"} placeholder="Create a password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Photo <span className="text-gray-400 font-normal">(optional)</span></label>
              <div onClick={() => photoInputRef.current.click()}
                className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  : <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl mx-auto mb-1">👤</div>
                      <p className="text-xs font-medium text-gray-600">Click to upload your photo</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </div>}
              </div>
              {photoPreview && (
                <button type="button" onClick={() => { setPhotoPreview(null); photoInputRef.current.value = ""; }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 transition">Remove photo</button>
              )}
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handlePhotoChange(e.target.files[0])} />
            </div>

            {/* ID Card Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">College ID Card <span className="text-red-500">*</span></label>
              <div onClick={() => idCardInputRef.current.click()}
                className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
                style={{ borderColor: error?.includes("ID card") ? "#ef4444" : undefined }}>
                {idCardPreview
                  ? <img src={idCardPreview} alt="ID Card" className="h-full w-full object-contain rounded-xl p-2" />
                  : <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl mx-auto mb-1">🪪</div>
                      <p className="text-xs font-medium text-gray-600">Click to upload your ID card</p>
                      <p className="text-xs text-gray-400">PNG, JPG, PDF up to 2MB</p>
                    </div>}
              </div>
              {idCardPreview && (
                <button type="button" onClick={() => { setIdCardPreview(null); idCardInputRef.current.value = ""; }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 transition">Remove ID card</button>
              )}
              <input ref={idCardInputRef} type="file" accept="image/*,application/pdf" className="hidden"
                onChange={(e) => handleIdCardChange(e.target.files[0])} />
            </div>

            <button type="submit" disabled={loading || uploadingImages}
              className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {uploadingImages ? "Uploading images..." : loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline">Sign in</span>
          </p>

        </div>
      </div>
      <Footer />
    </div>
  );

  function handlePhotoChange(file) { if (file) setPhotoPreview(URL.createObjectURL(file)); }
  function handleIdCardChange(file) { if (file) setIdCardPreview(URL.createObjectURL(file)); }
}

export default Signup;