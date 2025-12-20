import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { storage, ID } from "../lib/appwrite";
import { updateUserStart, updateUserSuccess, updateUserFailure } from "../redux/user/userSlice";
import { Permission, Role } from "appwrite";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error, updateSuccess } = useSelector(
    (state) => state.user
  );

  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState("");
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

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
    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

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
          [Permission.read(Role.any())],
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

        setFormData((prev) => ({
          ...prev,
          avatar: fileUrl,
        }));

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success && data.message) {
        // Backend sent structured error
        dispatch(updateUserFailure(data.message));
        return;
      }

      if (!res.ok) {
        // Fallback for non-JSON errors
        dispatch(updateUserFailure(data.message || "Update failed"));
        return;
      }

      dispatch(updateUserSuccess(data));
    } catch (error) {
      dispatch(updateUserFailure(error.message || "Network error occurred"));
    }
  };

  return (
    <main className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="self-center mt-2 relative">
          <img
            src={formData.avatar || avatarPreview}
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

        <input
          className="border p-3 rounded-lg"
          onChange={handleChange}
          id="username"
          defaultValue={currentUser.username}
          placeholder="username"
        />
        <input
          className="border p-3 rounded-lg"
          onChange={handleChange}
          id="email"
          defaultValue={currentUser.email}
          placeholder="email"
        />
        <input
          type="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
          id="password"
          placeholder="password"
        />

        <button
          type="submit"
          disabled={uploading || loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}
      {updateSuccess && (
        <p className="text-green-700 text-sm text-center mt-4">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-between mt-5">
        <button type="button" className="text-red-700 font-medium hover:underline">
          Sign out
        </button>
        <button type="button" className="text-red-700 font-medium hover:underline">
          Delete account
        </button>
      </div>
    </main>
  );
};

export default Profile;
