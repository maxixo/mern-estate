import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      console.log("Sign in with google:", result.user);

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      // ✅ If backend failed, stop here and show only message
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        dispatch(signInFailure("Google sign-in failed."));
        console.log("Non-JSON response:", text);
        return;
      }

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(signInFailure(data.message || "Google sign-in failed."));
        return;
      } 
      dispatch(signInSuccess(data));
      console.log("Before navigate, currentUser:", data);

        navigate('/');
    
    } catch (error) {
      console.log("could not sign in with google", error);
      dispatch(signInFailure(error.message || "Google sign-in failed."));
    }
  };

  return (
   <button onClick={handleGoogleClick} type='button'
    className='bg-red-700 text-white p-3 rounded-lg 
   uppercase hover:opacity-95 '>
    Continue with Google
   </button> 
  )
}

export default OAuth
