import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Eye, EyeOff } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const idCardInputRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const uploadImage = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handlePhotoChange = (file) => {
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleIdCardChange = (file) => {
    if (file) setIdCardPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!name || !email || !college || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Images are optional - no validation required

    try {
      setUploadingImages(true);

      // Upload person photo (optional)
      const photoFile = photoInputRef.current?.files?.[0];
      const photoUrl = photoFile ? await uploadImage(photoFile, 'person_photos') : null;

      // Upload ID card (optional)
      const idCardFile = idCardInputRef.current?.files?.[0];
      const idCardUrl = idCardFile ? await uploadImage(idCardFile, 'id_cards') : null;

      // If no images uploaded, skip upload step
      if (!photoFile && !idCardFile) {
        setUploadingImages(false);
      }

      setUploadingImages(false);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, college, usn: '' }
        }
      });

      if (authError) {
        if (authError.message.includes("User already registered") || authError.message.includes("already been registered")) {
          setError("This email is already registered. Please login instead.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // Create profile with images
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: name,
            email: email,
            college: college,
            role: 'user',
            status: 'pending',
            photo_url: photoUrl,
            id_card_url: idCardUrl,
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          if (profileError.message.includes("foreign key")) {
            setError("This email is already registered. Please login instead.");
          } else {
            setError('Database error: ' + profileError.message);
          }
          setLoading(false);
        } else {
          setSuccess(true);
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Upload error: ' + err.message);
      setUploadingImages(false);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar isLoggedIn={false} />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Check your email!</h2>
            <p className="text-gray-500 text-sm mb-6">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account then login.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">College Email</label>
            <input
              type="email"
              placeholder="yourname@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">College Name</label>
            <input
              type="text"
              placeholder="Enter your college name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Person Photo Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Your Photo</label>
            <div
              onClick={() => photoInputRef.current.click()}
              className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl mx-auto mb-1">
                    👤
                  </div>
                  <p className="text-xs font-medium text-gray-600">Click to upload your photo</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="mt-2 text-xs text-red-500 hover:text-red-700 transition"
              >
                Remove photo
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e.target.files[0])}
            />
          </div>

          {/* ID Card Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">College ID Card</label>
            <div
              onClick={() => idCardInputRef.current.click()}
              className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
            >
              {idCardPreview ? (
                <img src={idCardPreview} alt="ID Card" className="h-full w-full object-contain rounded-xl p-2" />
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl mx-auto mb-1">
                    🪪
                  </div>
                  <p className="text-xs font-medium text-gray-600">Click to upload your ID card</p>
                  <p className="text-xs text-gray-400">PNG, JPG, PDF up to 2MB</p>
                </div>
              )}
            </div>
            {idCardPreview && (
              <button
                type="button"
                onClick={() => setIdCardPreview(null)}
                className="mt-2 text-xs text-red-500 hover:text-red-700 transition"
              >
                Remove ID card
              </button>
            )}
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleIdCardChange(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadingImages ? "Uploading images..." : loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;