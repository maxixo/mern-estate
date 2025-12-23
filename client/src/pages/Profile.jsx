import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect} from "react";
import { storage, ID } from "../lib/appwrite";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  clearUpdateSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess, // Make sure this is imported
} from "../redux/user/userSlice";
import { Permission, Role } from "appwrite";
import { useNavigate , Link} from "react-router-dom";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error, updateSuccess } = useSelector(
    (state) => state.user
  );
  const navigate = useNavigate();
  const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState("");
  const [formData, setFormData] = useState({});
  const [deleteError, setDeleteError] = useState(null);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();
  const avatarSrcCandidate = formData.avatar || avatarPreview;
  const avatarSrc =
    typeof avatarSrcCandidate === "string" && avatarSrcCandidate.trim()
      ? avatarSrcCandidate
      : null;
  const hasUpdates = Object.keys(formData).length > 0;

  const clearLocalErrors = () => {
    setUploadError(null);
    setDeleteError(null);
    setShowListingsError(false);
  };


  useEffect(() => {
    if (!updateSuccess) return;
    const timeoutId = setTimeout(() => {
      dispatch(clearUpdateSuccess());
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [updateSuccess, dispatch]);

  const handleFileChange = (e) => {
    clearLocalErrors();
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

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  useEffect(() => {
    if (!selectedFile) return;

    const uploadImage = async () => {
      setUploadError(null);
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
    clearLocalErrors();
    if (!hasUpdates) return;

    try {
      setIsUpdating(true);
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
        dispatch(updateUserFailure(data.message));
        return;
      }

      if (!res.ok) {
        dispatch(updateUserFailure(data.message || "Update failed"));
        return;
      }

      dispatch(updateUserSuccess(data));
    } catch (error) {
      dispatch(updateUserFailure(error.message || "Network error occurred"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (!confirmed) return;

    try {
      clearLocalErrors();
      dispatch(deleteUserStart());
      
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || "Delete failed";
        dispatch(deleteUserFailure(errorMsg));
        setDeleteError(errorMsg);
        return;
      }

      // Successful deletion
      try {
        await fetch("/api/auth/signout", {
          method: "GET",
          credentials: "include",
        });
      } catch {
        // ignore network errors; user is already deleted
      }
      dispatch(deleteUserSuccess());
      navigate("/sign-in");
      
      // Optional: You might want to redirect or show a message
      // window.location.href = '/sign-in';
      
    } catch (error) {
      const errorMsg = error.message || "Network error occurred";
      dispatch(deleteUserFailure(errorMsg));
      setDeleteError(errorMsg);
    }
  };

  const handleSignOut = async () => {
    try {
      clearLocalErrors();
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.success === false){
        dispatch(signOutUserFailure(data.message || "Sign out failed"));
        return;
      }

      dispatch(signOutUserSuccess());
      navigate("/sign-in");
    } catch (error) {
      dispatch(signOutUserFailure(error.message || "Network error occurred"));
    }
  };


  const handleShowListings = async () => {
      try {
        clearLocalErrors();
        const res = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) {

          setShowListingsError(true);
          return;
        }
        setUserListings(data);
       
        
      } catch (error) {
        setShowListingsError(true);
      }
  };

  const handleListingDelete = async (listingId) => {
     try {
       const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if(data.success === false) {
      console.log(data.message);
      return;
    }
      setUserListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== listingId)
      );
     } catch (error) {
        console.error("Error deleting listing:", error);
     }
  }



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
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="profile"
              onClick={() => fileRef.current.click()}
              className="rounded-full h-24 w-24 object-cover cursor-pointer"
            />
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              className="rounded-full h-24 w-24 bg-slate-400 text-white flex items-center justify-center text-3xl font-semibold cursor-pointer select-none"
              aria-label="profile"
            >
              {(currentUser?.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}

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
          disabled={uploading || isUpdating}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase disabled:opacity-60"
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
        <Link className="bg-green-700 text-white p-3
         rounded-lg uppercase text-center hover:opacity-95" to={"/create-listing"}>
        Create Listing 
        </Link>
      </form>


      {deleteError && <p className="text-red-600 text-sm text-center mt-4">{deleteError}</p>}
      {updateSuccess && (
        <p className="text-green-700 text-sm text-center mt-4">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-between mt-5">
        <button 
          onClick={handleSignOut}
          type="button" 
          className="text-red-700 font-medium hover:underline"
        >
          Sign out
        </button>
        <button 
          onClick={handleDeleteUser} 
          type="button" 
          className="text-red-700 font-medium hover:underline"
          disabled={loading}
        >
          Delete account
        </button>
      </div>
      <button className="text-green-700 w-full" onClick={handleShowListings}>Show Listings </button>
      <p>{showListingsError ? "Error fetching listings" : ""}</p>
       {userListings && userListings.length > 0 &&
       <div className="flex flex-col gap-4">

         <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>

         {userListings.map((listing) => (
         <div key={listing._id} className="border gap-4 flex justify-between items-center p-3 rounded-lg my-2">
          <Link to={`/listing/${listing._id}`}>
             <img src={listing.imageUrls[0]} alt="listing cover"
             className="h-16 w-16 object-contain" />          
          </Link>
          <Link className="flex-1 text-slate-700 font-semibold hover:underline truncate" to={`/listing/${listing._id}`}>
            <p>{listing.name}</p>
          </Link>

          <div className="flex flex-col items-center">
            <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
           <button className="text-green-700 uppercase">Edit</button>


          </div>
        </div>
      ))}
       
       </div>
}
    </main>

  );
};

export default Profile;
