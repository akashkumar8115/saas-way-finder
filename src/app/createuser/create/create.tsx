"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeClosed, CheckCircle } from "lucide-react";
import React, { useState } from "react";
// import { toast } from "@/components/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import OtpVerification from "@/components/OtpVerification";
import toast from "react-hot-toast";
// Define interfaces
interface User {
  user_uuid: string;
  name: string;
  email: string;
  role_name: string;
  role_id: number;
}

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role_id: number;
}

interface Errors {
  [key: string]: string | null;
}

interface CreateUserOrAdminProps {
  orgId: string;
  onAddUser: (user: Partial<UserData>) => void;
  onUpdateUser: (
    orgId: string,
    oldEmail: string,
    user: Partial<UserData>
  ) => void;
  onClose: () => void;
  editUserData?: User;
  fetchOrganizationsData: () => Promise<void>;
}

export const CreateUserOrAdmin: React.FC<CreateUserOrAdminProps> = ({
  orgId,
  onAddUser,
  onUpdateUser,
  onClose,
  editUserData,
  fetchOrganizationsData,
}) => {
  const isEditMode = !!editUserData;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>(
    editUserData
      ? {
          firstName: editUserData.name?.split(" ")[0] || "",
          lastName: editUserData.name?.split(" ").slice(1).join(" ") || "",
          username: editUserData.email || "",
          password: "",
          role_id: editUserData.role_id || 3,
        }
      : {
          firstName: "",
          lastName: "",
          username: "",
          password: "",
          role_id: 3,
        }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showEmailVerification, setShowEmailVerification] =
    useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (name === "username" && isEmailVerified) {
      setIsEmailVerified(false);
      setShowEmailVerification(false);
    }
  };

  const handleInitiateEmailVerification = () => {
    if (!userData.username.trim() || !/\S+@\S+\.\S+/.test(userData.username)) {
      setErrors((prev) => ({
        ...prev,
        username: "Please enter a valid email address",
      }));
      return;
    }
    setShowEmailVerification(true);
  };

  const handleEmailVerified = () => {
    toast.success("Email verified successfully!");
    setIsEmailVerified(true);
    setShowEmailVerification(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!userData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!userData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!userData.username.trim()) newErrors.username = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(userData.username))
      newErrors.username = "Please enter a valid email";
    if (!isEditMode) {
      if (!userData.password) newErrors.password = "Password is required";
      else if (userData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (!isEmailVerified) newErrors.username = "Email must be verified";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      const userPayload = {
        first_name: userData.firstName.trim(),
        last_name: userData.lastName.trim(),
        email: userData.username.trim(),
        password: userData.password || undefined,
        role_id: userData.role_id,
        entity_uuid: orgId,
        provider: "local",
      };

      if (isEditMode) {
        const response = await fetch(`/api/organization/updateUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update user");
        }

        const data = await response.json();
        onUpdateUser(orgId, editUserData!.email, userPayload);
        toast.success("User updated successfully");
      } else {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create user");
        }

        const data = await response.json();
        onAddUser(userPayload);
        toast.success("User created successfully");
      }

      await fetchOrganizationsData();
      onClose();
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} user: ${
          error.message || "An unexpected error occurred"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {isEditMode ? "Edit User" : "Create User"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  disabled={isLoading}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  disabled={isLoading}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-blue-500 text-xs mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Input
                    type="email"
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    placeholder="Email address"
                    disabled={
                      isLoading ||
                      isEmailVerified ||
                      showEmailVerification ||
                      isEditMode
                    }
                    className={`w-full ${
                      isEmailVerified ? "border-green-500 pr-10" : ""
                    } ${showEmailVerification ? "border-blue-500 pr-10" : ""} ${
                      errors.username ? "border-red-500" : ""
                    }`}
                  />
                  {isEmailVerified && (
                    <div className="absolute right-0 top-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  )}

                  {showEmailVerification && !isEmailVerified && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {!isEditMode && !isEmailVerified && !showEmailVerification && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleInitiateEmailVerification}
                    className="w-full sm:w-auto text-xs h-10 flex items-center justify-center gap-2"
                    disabled={
                      !userData.username ||
                      !/\S+@\S+\.\S+/.test(userData.username) ||
                      isLoading
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Verify Email
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Email verification is required to create an account
                  </p>
                </div>
              )}

              {isEmailVerified && (
                <div className="mt-1 flex items-center text-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email verified successfully
                </div>
              )}

              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {showEmailVerification && !isEmailVerified && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Verify your email
                  </h4>
                  <button
                    onClick={() => setShowEmailVerification(false)}
                    className="text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  We've sent a verification code to{" "}
                  <span className="font-medium">{userData.username}</span>
                </p>
                <OtpVerification
                  type="email"
                  value={userData.username}
                  onVerified={handleEmailVerified}
                  onCancel={() => setShowEmailVerification(false)}
                  isOptional={false}
                />
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Password {isEditMode && "(leave blank to keep current)"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder={
                    isEditMode ? "New password (optional)" : "Password"
                  }
                  disabled={isLoading}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role_id"
                value={userData.role_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-not-allowed"
                disabled
              >
                <option value={3}>Maintainer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Users have limited permissions within the organization
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : isEditMode ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default CreateUserOrAdmin;
