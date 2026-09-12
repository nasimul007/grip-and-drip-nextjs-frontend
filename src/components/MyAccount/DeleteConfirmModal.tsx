"use client";
import React, { useEffect } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Address",
  message = "Are you sure you want to delete this address? This action cannot be undone.",
  loading = false,
}: DeleteConfirmModalProps) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 z-99999 block">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-gray-1 text-dark-2 hover:text-dark hover:bg-gray-2"
            disabled={loading}
          >
            <svg className="fill-current" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z" fill="" />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="font-medium text-xl text-dark mb-2">{title}</h3>
            <p className="text-dark-2 text-custom-sm mb-6">{message}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                disabled={loading}
                className="inline-flex font-medium text-dark bg-gray-1 py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex font-medium text-white bg-red py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-red/90 disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;