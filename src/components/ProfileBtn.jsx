import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ProfileMenu } from "./index.js";

function ProfileBtn() {
  const [open, setOpen] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  if (!userData) return null;

   const menuRef = useRef(null);

   useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        className="bg-gray-300 rounded-full w-10 h-10
                   flex items-center justify-center "
        onClick={() => setOpen((prev) => !prev)}
      >
        {userData.name?.[0]?.toUpperCase()}
      </button>

      <div ref={menuRef}>
      <ProfileMenu
        open={open}
        username={userData.name}
      />
      </div>
    </div>
  );
}

export default ProfileBtn;
