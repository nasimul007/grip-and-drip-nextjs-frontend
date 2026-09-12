"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import AddressModal from "./AddressModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Orders from "../Orders";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setUser } from "@/redux/features/auth-slice";
import {
  createAddress,
  deleteAddress,
  setDefaultShipping,
  fetchAddresses,
} from "@/redux/features/address-slice";
import { api } from "@/lib/api";
import type { User, Address, AddressFormData } from "@/lib/types";
import { useLogout } from "@/lib/useLogout";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("account-details");
  const [addressModal, setAddressModal] = useState(false);
  const user = useAppSelector((state) => state.authReducer.user);
  const addresses = useAppSelector((state) => {
    const val = state.addressReducer?.addresses;
    return Array.isArray(val) ? val : [];
  });
  const addressesLoading = useAppSelector(
    (state) => typeof state.addressReducer?.loading === "boolean" ? state.addressReducer.loading : false
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api
      .get<User>("/api/auth/profile/")
      .then((u) => {
        dispatch(setUser(u));
        setForm({
          full_name: u.full_name || "",
          email: u.email || "",
          phone_number: u.phone_number || "",
        });
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const updated = await api.patch<User>("/api/auth/profile/", {
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
      });
      dispatch(setUser(updated));
      setStatus("saved");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Update failed");
      setStatus("error");
    }
  };

  const [pw, setPw] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwStatus, setPwStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pwError, setPwError] = useState("");

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPw((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmNewPassword) {
      setPwError("New passwords do not match");
      setPwStatus("error");
      return;
    }
    if (!pw.oldPassword || !pw.newPassword) {
      setPwError("All fields are required");
      setPwStatus("error");
      return;
    }
    setPwStatus("saving");
    try {
      await api.post("/api/auth/password/change/", {
        old_password: pw.oldPassword,
        new_password: pw.newPassword,
        confirm_new_password: pw.confirmNewPassword,
      });
      setPwStatus("saved");
      setPw({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
      setPwStatus("error");
    }
  };

  const openAddressModal = () => {
    setEditAddress(null);
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
    setEditAddress(null);
  };

  const handleAddressSubmit = async (data: AddressFormData) => {
    try {
      await dispatch(createAddress(data)).unwrap();
      setAddressModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditAddress(address);
    setAddressModal(true);
  };

  const handleDeleteAddress = (id: number) => {
    setDeleteAddressId(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (deleteAddressId !== null) {
      try {
        await dispatch(deleteAddress(deleteAddressId)).unwrap();
        setDeleteModalOpen(false);
        setDeleteAddressId(null);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to delete address");
      }
    }
  };

  const handleSetDefaultShipping = async (id: number) => {
    try {
      await dispatch(setDefaultShipping(id)).unwrap();
      await dispatch(fetchAddresses());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to set default address");
    }
  };

  const handleLogout = useLogout();

  const handleLogoutClick = () => {
    handleLogout();
    router.push("/signin");
  };

  return (
    <>
      <section className="overflow-hidden pt-[200px] sm:pt-[130px] md:pt-[130px] lg:pt-[72px] xl:pt-[115px] pb-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image
                      src="/images/users/user-04.jpg"
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {user?.full_name || user?.username || "User"}
                    </p>
                    <p className="text-custom-xs">Member</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "account-details"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 11.2291C8.87872 11.2291 6.92482 11.7112 5.47697 12.5256C4.05066 13.3279 2.97864 14.5439 2.97864 16.0416L2.97858 16.1351C2.97754 17.2001 2.97624 18.5368 4.14868 19.4916C4.7257 19.9614 5.53291 20.2956 6.6235 20.5163C7.71713 20.7377 9.14251 20.8541 10.9995 20.8541C12.8564 20.8541 14.2818 20.7377 15.3754 20.5163C16.466 20.2956 17.2732 19.9614 17.8503 19.4916C19.0227 18.5368 19.0214 17.2001 19.0204 16.1351L19.0203 16.0416C19.0203 14.5439 17.9483 13.3279 16.522 12.5256C15.0741 11.7112 13.1202 11.2291 10.9995 11.2291ZM4.35364 16.0416C4.35364 15.2612 4.92324 14.4147 6.15108 13.724C7.35737 13.0455 9.07014 12.6041 10.9995 12.6041C12.9288 12.6041 14.6416 13.0455 15.8479 13.724C17.0757 14.4147 17.6453 15.2612 17.6453 16.0416C17.6453 17.2405 17.6084 17.9153 16.982 18.4254C16.6424 18.702 16.0746 18.9719 15.1027 19.1686C14.1338 19.3648 12.8092 19.4791 10.9995 19.4791C9.18977 19.4791 7.86515 19.3648 6.89628 19.1686C5.92437 18.9719 5.35658 18.702 5.01693 18.4254C4.39059 17.9153 4.35364 17.2405 4.35364 16.0416Z"
                          fill=""
                        />
                      </svg>
                      Account Details
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                          fill=""
                        />
                        <path
                          d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                          fill=""
                        />
                      </svg>
                      Orders
                    </button>

                    

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "addresses"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.25065 15.8125C7.87096 15.8125 7.56315 16.1203 7.56315 16.5C7.56315 16.8797 7.87096 17.1875 8.25065 17.1875H13.7507C14.1303 17.1875 14.4382 16.8797 14.4382 16.5C14.4382 16.1203 14.1303 15.8125 13.7507 15.8125H8.25065Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.0007 1.14581C10.3515 1.14581 9.7618 1.33173 9.12199 1.64287C8.50351 1.94363 7.78904 2.38706 6.8966 2.94094L5.00225 4.11664C4.15781 4.6407 3.48164 5.06035 2.96048 5.45947C2.42079 5.87278 2.00627 6.29371 1.70685 6.84072C1.40806 7.38659 1.2735 7.96741 1.20899 8.65396C1.14647 9.31931 1.14648 10.1329 1.14648 11.1533V12.6315C1.14647 14.3767 1.14646 15.7543 1.28646 16.8315C1.43008 17.9364 1.73183 18.8284 2.41365 19.5336C3.0986 20.2421 3.97024 20.5587 5.04929 20.7087C6.0951 20.8542 7.43075 20.8542 9.11401 20.8541H12.8872C14.5705 20.8542 15.9062 20.8542 16.952 20.7087C18.0311 20.5587 18.9027 20.2421 19.5877 19.5336C20.2695 18.8284 20.5712 17.9364 20.7148 16.8315C20.8548 15.7543 20.8548 14.3768 20.8548 12.6315V11.1533C20.8548 10.1329 20.8548 9.31929 20.7923 8.65396C20.7278 7.96741 20.5932 7.38659 20.2944 6.84072C19.995 6.29371 19.5805 5.87278 19.0408 5.45947C18.5197 5.06035 17.8435 4.64071 16.9991 4.11665L15.1047 2.94093C14.2123 2.38706 13.4978 1.94363 12.8793 1.64287C12.2395 1.33173 11.6498 1.14581 11.0007 1.14581ZM7.59022 4.12875C8.52133 3.55088 9.17602 3.14555 9.72332 2.87941C10.2565 2.62011 10.6342 2.52081 11.0007 2.52081C11.3672 2.52081 11.7448 2.62011 12.278 2.87941C12.8253 3.14555 13.48 3.55088 14.4111 4.12875L16.2444 5.26657C17.1252 5.8132 17.7436 6.19788 18.2048 6.55112C18.6536 6.89482 18.9118 7.17845 19.0883 7.50093C19.2655 7.82455 19.3689 8.20291 19.4233 8.7826C19.4791 9.37619 19.4798 10.1253 19.4798 11.1869V12.5812C19.4798 14.3879 19.4785 15.676 19.3513 16.6542C19.2264 17.6149 18.9912 18.1723 18.5991 18.5779C18.2101 18.9803 17.6805 19.2192 16.7626 19.3468C15.8225 19.4776 14.5826 19.4791 12.834 19.4791H9.16732C7.41875 19.4791 6.17883 19.4776 5.23869 19.3468C4.32077 19.2192 3.79119 18.9803 3.40221 18.5779C3.01008 18.1723 2.77486 17.6149 2.64999 16.6542C2.52285 15.676 2.52148 14.3879 2.52148 12.5812V11.1869C2.52148 10.1253 2.52218 9.37619 2.57796 8.7826C2.63243 8.20291 2.73584 7.82455 2.91299 7.50093C3.0895 7.17845 3.3477 6.89482 3.79649 6.55112C4.25774 6.19788 4.87612 5.8132 5.75689 5.26657L7.59022 4.12875Z"
                          fill=""
                        />
                      </svg>
                      Addresses
                    </button>

                    

                    <button
                      onClick={handleLogoutClick}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "logout"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==-->

            
          <!--== user dashboard content start ==--> */}
            {/* <!-- orders tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>
            {/* <!-- orders tab content end -->

          <!-- downloads tab content start --> */}

            {/* <!-- downloads tab content end -->

          {/* addresses tab content start */}
            <div
              className={"flex-col sm:flex-row gap-7.5 " + (activeTab === "addresses" ? "flex" : "hidden")}
            >
              <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                  <p className="font-medium text-xl text-dark">
                    Shipping Address
                  </p>

                  <button
                    className="text-dark ease-out duration-200 hover:text-blue"
                    onClick={openAddressModal}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.95349 1.04163L11.2513 1.04163C11.5965 1.04163 11.8763 1.32145 11.8763 1.66663C11.8763 2.0118 11.5965 2.29163 11.2513 2.29163H10.0013C8.01945 2.29163 6.59593 2.29295 5.51262 2.4386C4.44728 2.58183 3.80501 2.85424 3.3303 3.32896C2.85559 3.80367 2.58318 4.44594 2.43994 5.51127C2.2943 6.59459 2.29297 8.01811 2.29297 9.99996C2.29297 11.9818 2.2943 13.4053 2.43994 14.4886C2.58318 15.554 2.85559 16.1962 3.3303 16.671C3.80501 17.1457 4.44728 17.4181 5.51262 17.5613C6.59593 17.707 8.01945 17.7083 10.0013 17.7083C11.9832 17.7083 13.4067 17.707 14.49 17.5613C15.5553 17.4181 16.1976 17.1457 16.6723 16.671C17.147 16.1962 17.4194 15.554 17.5627 14.4886C17.7083 13.4053 17.7096 11.9818 17.7096 9.99996V8.74996C17.7096 8.40478 17.9895 8.12496 18.3346 8.12496C18.6798 8.12496 18.9596 8.40478 18.9596 8.74996V10.0478C18.9596 11.9714 18.9597 13.479 18.8015 14.6552C18.6396 15.8592 18.3019 16.8092 17.5562 17.5548C16.8105 18.3005 15.8605 18.6383 14.6565 18.8002C13.4803 18.9583 11.9728 18.9583 10.0491 18.9583H9.95349C8.02983 18.9583 6.5223 18.9583 5.34606 18.8002C4.14211 18.6383 3.19209 18.3005 2.44642 17.5548C1.70074 16.8092 1.36296 15.8592 1.20109 14.6552C1.04295 13.479 1.04296 11.9714 1.04297 10.0478V9.95214C1.04296 8.02848 1.04295 6.52095 1.20109 5.34471C1.36296 4.14077 1.70074 3.19075 2.44642 2.44507C3.19209 1.6994 4.14211 1.36161 5.34606 1.19975C6.5223 1.04161 8.02983 1.04162 9.95349 1.04163ZM13.9767 1.89656C15.1167 0.75665 16.9648 0.75665 18.1047 1.89656C19.2446 3.03646 19.2446 4.88461 18.1047 6.02452L12.5646 11.5646C12.2552 11.874 12.0614 12.0679 11.8451 12.2366C11.5904 12.4353 11.3147 12.6056 11.0231 12.7446C10.7755 12.8626 10.5154 12.9493 10.1003 13.0876L7.67985 13.8945C7.23298 14.0434 6.74031 13.9271 6.40723 13.594C6.07415 13.261 5.95785 12.7683 6.1068 12.3214L6.91361 9.90098C7.05196 9.48584 7.13862 9.22579 7.25663 8.97817C7.39563 8.68652 7.56598 8.41089 7.76467 8.15614C7.93338 7.93985 8.12722 7.74603 8.43667 7.43662L13.9767 1.89656ZM17.2208 2.78044C16.5691 2.12869 15.5124 2.12869 14.8606 2.78044L14.5468 3.09429C14.5657 3.17417 14.5922 3.26935 14.629 3.37551C14.7484 3.71973 14.9744 4.17305 15.4013 4.59995C15.8282 5.02685 16.2815 5.25285 16.6257 5.37227C16.7319 5.4091 16.8271 5.43556 16.907 5.45448L17.2208 5.14063C17.8726 4.48888 17.8726 3.43219 17.2208 2.78044ZM15.9223 6.4392C15.4923 6.25429 14.9914 5.95784 14.5174 5.48384C14.0434 5.00983 13.747 4.50898 13.5621 4.07901L9.34922 8.29184C9.00213 8.63894 8.866 8.77659 8.75031 8.92492C8.60745 9.10808 8.48497 9.30625 8.38504 9.51594C8.30411 9.68576 8.24187 9.86907 8.08664 10.3347L7.72673 11.4145L8.58678 12.2745L9.66651 11.9146C10.1322 11.7594 10.3155 11.6972 10.4853 11.6162C10.695 11.5163 10.8932 11.3938 11.0763 11.2509C11.2247 11.1353 11.3623 10.9991 11.7094 10.652L15.9223 6.4392Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4 sm:p-7.5">
                  {addressesLoading ? (
                    <div className="flex flex-col gap-3">
                      <div className="h-6 w-full rounded bg-gray-200 animate-pulse" />
                      <div className="h-6 w-2/3 rounded bg-gray-200 animate-pulse" />
                      <div className="h-6 w-full rounded bg-gray-200 animate-pulse" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center text-custom-sm text-gray-6 py-6">
                      No addresses saved. Click + to add a new address.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-gray-3 rounded-xl p-4 sm:p-5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-dark">
                              {address.address_name}
                            </span>
                            {address.is_default_shipping && (
                              <span className="text-blue-600 text-xs font-medium">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.address}
                            <br />
                            <span className="text-custom-xs text-gray-5">
                              {address.division_name} / {address.city_name} / {address.area_name}
                            </span>
                          </p>
                          <div className="flex gap-3 mt-3">
                            {!address.is_default_shipping && (
                              <button
                                className="text-blue-600 text-xs underline hover:text-blue-800"
                                onClick={() => handleSetDefaultShipping(address.id)}
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              className="text-gray-600 text-xs underline hover:text-gray-800"
                              onClick={() => handleEditAddress(address)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 text-xs underline hover:text-red-800"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* addresses tab content end */}


            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              <form onSubmit={handleProfileSubmit}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="fullName" className="block mb-2.5">
                        Full Name <span className="text-red">*</span>
                      </label>

                      <input
                        type="text"
                        name="full_name"
                        id="fullName"
                        placeholder="Your full name"
                        value={form.full_name}
                        onChange={handleProfileChange}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="email" className="block mb-2.5">
                        Email <span className="text-red">*</span>
                      </label>

                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleProfileChange}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="phone" className="block mb-2.5">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone_number"
                      id="phone"
                        placeholder="+880 17XX-XXXXXX"
                      value={form.phone_number}
                      onChange={handleProfileChange}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  {status === "saved" && (
                    <p className="text-green-600 text-custom-sm mb-4">
                      Profile updated successfully.
                    </p>
                  )}

                  {status === "error" && (
                    <p className="text-red text-custom-sm mb-4">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "saving"}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                  >
                    {status === "saving" ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

                <p className="text-custom-sm mt-5 mb-9">
                  This will be how your name will be displayed in the account
                  section and in reviews
                </p>

                <p className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Password Change
                </p>

                <form onSubmit={handlePasswordSubmit}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5">
                    <PasswordInput
                      id="oldPassword"
                      name="oldPassword"
                      label="Old Password"
                      placeholder="Enter your current password"
                      value={pw.oldPassword}
                      onChange={handlePasswordChange}
                      variant="account"
                    />
                  </div>

                  <div className="mb-5">
                    <PasswordInput
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      placeholder="Enter new password"
                      value={pw.newPassword}
                      onChange={handlePasswordChange}
                      variant="account"
                    />
                  </div>

                  <div className="mb-5">
                    <PasswordInput
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      value={pw.confirmNewPassword}
                      onChange={handlePasswordChange}
                      variant="account"
                    />
                  </div>

                  {pwStatus === "saved" && (
                    <p className="text-green-600 text-custom-sm mb-4">
                      Password changed successfully.
                    </p>
                  )}

                  {pwStatus === "error" && (
                    <p className="text-red text-custom-sm mb-4">{pwError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={pwStatus === "saving"}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                  >
                    {pwStatus === "saving" ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
            {/* <!-- details tab content end -->
          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>

      <AddressModal
        isOpen={addressModal}
        onClose={closeAddressModal}
        mode={editAddress ? "edit" : "add"}
        initialData={editAddress ?? undefined}
        onSubmit={handleAddressSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAddress}
        loading={addressesLoading}
      />
    </>
  );
};

export default MyAccount;
