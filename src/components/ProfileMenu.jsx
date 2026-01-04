import React, { useState, useEffect } from "react";
import { LogoutBtn } from "./index.js";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../store/authSlice.js";
import authService from "../appwrite/auth.js";
import appwriteService from "../appwrite/config.js";

function ProfileMenu({ open}) {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  const userData = useSelector(state => state.auth.userData)

  const [newUsername, setNewUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);

  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u) {
        dispatch(login(u));
        setNewUsername(u.name || ""); 
      }
    });
  }, [dispatch]);

  if (!open) return null;

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) return;

    try {
      await authService.updateUserName(user.$id, newUsername);
await appwriteService.updateUsernameEverywhere(user.$id, newUsername);

      await authService.updateUserName(newUsername); // ✅ correct call

      const updatedUser = await authService.getCurrentUser();
      dispatch(login(updatedUser));

      setEditingUsername(false);
    } catch (error) {
      setError("Something Went Wrong")
      console.error("Error updating username:", error);
    }
  };

  const handleChangePassword = async () => {
  if (!oldPassword || !newPassword) {
    setPasswordError("Both fields are required");
    return;
  }

  try {
    // Call Appwrite service
    await authService.updatePassword(newPassword, oldPassword);

    // Reset
    setEditingPassword(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordError("");

    alert("Password changed successfully!");
  } catch (err) {
    console.error("Password update failed:", err);

    // Show actual Appwrite error message
    const msg = err?.message || err?.$message || "Failed to update password";
    setPasswordError(msg);
  }
};



  return (
    <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl p-4 z-50">
      <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center ml-20">
          {userData.name?.[0]?.toUpperCase()}
        </div>
      <p className="text-sm text-gray-500 mb-3">
        Signed in as{" "}
        <span className="font-semibold">
          {user?.name || user?.email || "Loading..."}
        </span>
      </p>

      {editingUsername ? (
        <form
    onSubmit={(e) => {
      e.preventDefault();
      handleChangeUsername();
    }}
  >
    <input
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
      className="w-full border px-2 py-1 rounded"
      autoFocus
    />

    <button
      type="submit"
      className="bg-blue-600 rounded-xl text-white px-4 mt-2"
    >
      Save
    </button>
  </form>
) : (
  <button
    onClick={() => setEditingUsername(true)}
    className="block w-full text-left py-2 px-2 duration-200 hover:bg-blue-100 rounded-full"
  >
    Change Username
  </button>
)}


      {editingPassword ? (
  <div className="mt-2">
    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
    <input
      type="password"
      placeholder="Old Password"
      value={oldPassword}
      onChange={(e) => setOldPassword(e.target.value)}
      className="w-full border px-2 py-1 rounded mb-1"
    />
    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full border px-2 py-1 rounded mb-1"
    />
    <button
      onClick={handleChangePassword}
      className="bg-blue-600 rounded-xl text-white pl-4 pr-4 mt-2"
    >
      Save Password
    </button>
  </div>
) : (
  <button
    onClick={() => setEditingPassword(true)}
    className="block w-full text-left py-2 px-2 duration-200 hover:bg-blue-100 rounded-full"
  >
    Change Password
  </button>
)}
      <LogoutBtn className="mt-2 text-red-500" />
    </div>
  );
}

export default ProfileMenu;
