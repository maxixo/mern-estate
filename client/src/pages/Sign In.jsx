import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInFailure, signInSuccess } from "../redux/user/userSlice";

    const SignIn = () => {
      const [formData, setFormData] = useState({});
      const { loading, error } = useSelector((state) => state.user);
      const navigate = useNavigate();
      const dispatch = useDispatch();

      const handleChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [e.target.id]: e.target.value,
        }));
      };

      const handleSubmit = async (e) => {
      e.preventDefault();
      dispatch(signInStart());

      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        console.log("Response status:", res.status);

        let data;
        try {
          data = await res.json();
        } catch {
          dispatch(signInFailure("Something went wrong. Please try again."));
          return;
        }

        if (!res.ok || data.success === false) {
          dispatch(signInFailure(data.message || "Sign in failed"));
          return;
        }

        dispatch(signInSuccess(data));
        navigate("/");
      } catch (error) {
        console.log("Error signing in:", error);
        dispatch(signInFailure(error.message || "Network error"));
      }
    };

      return (
        <div className="p-3 max-w-lg mx-auto">
          <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="email"
              className="border p-3 rounded-lg"
              id="email"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="password"
              className="border p-3 rounded-lg"
              id="password"
              onChange={handleChange}
            />
            <button
              disabled={loading}
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>

          <div className="flex ml-5 pt-10 gap-2 mt-5">
            <p>Don't have an account?</p>
            <Link to="/sign-up">
              <span className="text-blue-700">Sign Up</span>
            </Link>
          </div>

          {error && <p className="text-red-500 mt-5">{error}</p>}
        </div>
      );
    };

    export default SignIn;
