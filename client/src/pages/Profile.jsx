import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { storage, ID } from "../lib/appwrite";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

  const [selectedFile, setSelectedFile] = useState(null); // 👈 NEW
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState("");
  const [formData, setFormData] = useState({});

  /* ----------------------------------
    1. File selection ONLY
  -----------------------------------*/
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image too large. Max 5MB.");
      return;
    }

    setUploadError("");
    setSelectedFile(file); // 👈 triggers useEffect
    setAvatarPreview(URL.createObjectURL(file)); // instant preview
    e.target.value = "";
  };

  /* ----------------------------------
    2. Upload runs automatically
  -----------------------------------*/
  useEffect(() => {
    if (!selectedFile) return;

    const uploadImage = async () => {
      setUploading(true);
      setProgress(0);
      setUploadedFileId("");

      try {
        const res = await storage.createFile(
          bucketId,
          ID.unique(),
          selectedFile,
          ['read("any")'] ,// ✅ permissions must be array or null (fixes 400)
          (event) => {
            if (event.total) {
              const pct = Math.round((event.loaded / event.total) * 100);
              setProgress(pct);
            }
          }
        );

        setUploadedFileId(res.$id);

        const fileUrl = storage.getFileView(bucketId, res.$id).toString();

        setAvatarPreview(fileUrl);

        // 👇 NEW: Update formData with the new avatar URL
        setFormData((prev) => ({
          ...prev,
          avatar: fileUrl, // 👈 Save the URL to form state
        }));

        console.log(fileUrl); // ✅ was `avatar` (undefined)
        setProgress(100);
      } catch (err) {
        console.error(err);
        setUploadError(err.message || "Upload failed");
        setAvatarPreview(currentUser.avatar);
      } finally {
        setUploading(false);
        setSelectedFile(null);
      }
    };
    uploadImage();
  }, [selectedFile, bucketId, currentUser.avatar]);

  return (
    <main className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Avatar */}
        <div className="self-center mt-2 relative">
          <img
            src={avatarPreview}
            alt="profile"
            onClick={() => fileRef.current.click()}
            className="rounded-full h-24 w-24 object-cover cursor-pointer"
          />

          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs">
              {progress}%
            </div>
          )}
        </div>

        {/* Progress bar */}
        {uploading && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-700 h-2 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadError && (
          <p className="text-red-600 text-sm text-center">{uploadError}</p>
        )}

        {uploadedFileId && !uploading && (
          <p className="text-green-700 text-sm">Upload complete ✅</p>
        )}

        <input className="border p-3 rounded-lg" placeholder="username" />
        <input className="border p-3 rounded-lg" placeholder="email" />
        <input className="border p-3 rounded-lg" placeholder="password" />

        <button
          type="button"
          disabled={uploading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase disabled:opacity-60"
        >
          Update
        </button>
      </form>
    </main>
  );
};

export default Profile;
