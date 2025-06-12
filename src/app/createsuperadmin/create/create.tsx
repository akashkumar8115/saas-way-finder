"use client";

import { Button } from "@/components/ui/Button";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EyeClosed, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import OtpVerification from "@/components/OtpVerification";

// Define interfaces for data structures
interface Organization {
  entity_uuid: string;
  name: string;
  description?: string | null;
  domain?: string | null;
  entity_type: string;
  address_id?: number | null;
  admin_users?: any[];
  maintainer_users?: any[];
}

interface User {
  user_uuid: string;
  name: string;
  email: string;
  role_name: string;
  role_id: number;
}

interface OrgData {
  entity_type: string;
  name: string;
  description: string;
  headcount: string | number | null;
  domain: string;
  parent_uuid: string | null;
  address_id: string | number | null;
  numberOfScreen: {
    screen: string | number;
    content: string | number;
    playlist: string | number;
    group: string | number;
    organization: string | number;
  };
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

// Define props interfaces
interface CreateOrganizationProps {
  onClose: () => void;
  onCreate: (organization: Organization) => void;
  fetchOrganizations: () => Promise<void>;
  parentOrgId?: string | null; // Made optional to match usage
}

interface CreateSuperAdminProps {
  onClose: () => void;
  addUserOrAdmin: (orgId: string, user: User) => void;
  orgId: string;
  role: string;
  allRole?: any[]; // Optional since not used in component
}

export const CreateOrganization: React.FC<CreateOrganizationProps> = ({
  onClose,
  onCreate,
  fetchOrganizations,
  parentOrgId,
}) => {
  const [orgData, setOrgData] = useState<OrgData>({
    entity_type: "parent",
    name: "",
    description: "",
    headcount: "",
    domain: "",
    parent_uuid: parentOrgId || null,
    address_id: "",
    numberOfScreen: {
      screen: "",
      content: "",
      playlist: "",
      group: "",
      organization: "",
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parentEntities, setParentEntities] = useState<Organization[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Commented-out fetch logic for parent entities
  /*
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await fetch("/api/organization/getAllOrganization", {
          credentials: "include",
        });
        const data = await response.json();
        setParentEntities(data as Organization[]);
      } catch (error) {
        console.error("Error fetching parent entities:", error);
      }
    };
    void fetchParents();
  }, []);
  */

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!orgData.name.trim()) {
      newErrors.name = "Organization name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLimitChange =
    (key: keyof OrgData["numberOfScreen"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
      setOrgData((prev) => ({
        ...prev,
        numberOfScreen: {
          ...prev.numberOfScreen,
          [key]: value,
        },
      }));
      if (errors[`limit_${key}`]) {
        setErrors((prev) => ({ ...prev, [`limit_${key}`]: null }));
      }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = ["headcount", "address_id"].includes(name)
      ? value === ""
        ? ""
        : parseInt(value)
      : value;
    setOrgData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating organization...");

    try {
      const payload = {
        ...orgData,
        headcount:
          orgData.entity_type === "parent" && orgData.headcount
            ? parseInt(orgData.headcount as string)
            : null,
        domain: orgData.entity_type === "parent" ? orgData.domain : null,
        parent_uuid:
          orgData.entity_type === "organization" ? orgData.parent_uuid : null,
        address_id: orgData.address_id
          ? parseInt(orgData.address_id as string)
          : null,
        numberOfScreen: {
          screen: orgData.numberOfScreen.screen
            ? parseInt(orgData.numberOfScreen.screen as string)
            : 0,
          content: orgData.numberOfScreen.content
            ? parseInt(orgData.numberOfScreen.content as string)
            : 0,
          playlist: orgData.numberOfScreen.playlist
            ? parseInt(orgData.numberOfScreen.playlist as string)
            : 0,
          group: orgData.numberOfScreen.group
            ? parseInt(orgData.numberOfScreen.group as string)
            : 0,
          organization: orgData.numberOfScreen.organization
            ? parseInt(orgData.numberOfScreen.organization as string)
            : 0,
        },
      };

      const response = await fetch("/api/organization/createOrganization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        if (
          response.status === 400 &&
          data.detail?.includes("Integrity error")
        ) {
          throw new Error(
            "Organization may already exist or there's a conflict with existing data"
          );
        }
        throw new Error(
          data.message || data.detail || "Failed to create organization"
        );
      }

      const newOrg: Organization = {
        entity_uuid: data.entity_uuid,
        name: data.name,
        description: orgData.description || null,
        domain: orgData.domain || null,
        entity_type: orgData.entity_type,
        address_id: orgData.address_id
          ? parseInt(orgData.address_id as string)
          : null,
        admin_users: [],
        maintainer_users: [],
      };

      toast.success(`Organization ${data.name || "created"} successfully`, {
        id: loadingToast,
      });
      onCreate(newOrg);
      await fetchOrganizations();
      onClose();
    } catch (error: any) {
      console.error("Error creating organization:", error);
      if (
        error.message.includes("duplicate") ||
        error.message.includes("Integrity error")
      ) {
        toast.error(
          "This organization may already exist or there's a conflict with existing data",
          { id: loadingToast }
        );
      } else {
        toast.error(`Failed to create organization: ${error.message}`, {
          id: loadingToast,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrganization}>
            <div className="space-y-4">
              <div>
                <Input
                  label="Entity Type"
                  type="text"
                  value="parent"
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Organization Name"
                  type="text"
                  id="OrganizationName"
                  name="name"
                  value={orgData.name}
                  onChange={handleChange}
                  placeholder="Organization Name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Input
                  label="Domain"
                  type="text"
                  name="domain"
                  value={orgData.domain}
                  onChange={handleChange}
                  placeholder="Domain (Optional)"
                />
              </div>
              <div>
                <Input
                  label="Description"
                  type="text"
                  name="description"
                  id="description"
                  value={orgData.description}
                  onChange={handleChange}
                  placeholder="Description (Optional)"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Resource Limits</h3>
                <div className="mb-3 p-3 bg-blue-50 rounded-md text-xs text-blue-700 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Set resource limits for this Parent Entity.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      "screen",
                      "content",
                      "playlist",
                      "group",
                      "organization",
                    ] as const
                  ).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key} limit
                      </label>
                      <Input
                        type="number"
                        name={key}
                        value={orgData.numberOfScreen[key]}
                        onChange={handleLimitChange(key)}
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Organization"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const CreateSuperAdmin: React.FC<CreateSuperAdminProps> = ({
  onClose,
  addUserOrAdmin,
  orgId,
  role,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    role_id:
      role === "Maintainer"
        ? 3
        : role === "Admin"
        ? 2
        : role === "Superadmin"
        ? 1
        : 3,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showEmailVerification, setShowEmailVerification] =
    useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!userData.password) newErrors.password = "Password is required";
    else if (userData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!isEmailVerified) newErrors.username = "Email must be verified";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    if (!isEmailVerified) {
      toast.error("Please verify your email first");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(`Creating ${role.toLowerCase()}...`);
    try {
      const name = `${userData.firstName} ${userData.lastName}`;
      const userPayload = {
        password: userData.password,
        email: userData.username,
        first_name: userData.firstName,
        role_id: userData.role_id,
        last_name: userData.lastName,
        entity_uuid: orgId,
        provider: "local",
      };

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
        credentials: "include",
      });

      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse response as JSON");
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("User with this email already exists");
        }
        throw new Error(
          data.message ||
            data.detail ||
            `Failed to create ${role.toLowerCase()}`
        );
      }

      const newUser: User = {
        user_uuid: data.user_uuid || Date.now().toString(),
        name,
        email: userData.username,
        role_name: role,
        role_id: userData.role_id,
      };

      toast.success(`${role} created successfully`, { id: loadingToast });
      addUserOrAdmin(orgId, newUser);
      setUserData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        role_id: role === "Maintainer" ? 3 : role === "Admin" ? 2 : 1,
      });
      onClose();
    } catch (error: any) {
      console.error(`Error creating ${role.toLowerCase()}:`, error);
      toast.error(`Failed to create ${role.toLowerCase()}: ${error.message}`, {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create {role}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                placeholder="First Name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
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
                  placeholder="Email"
                  disabled={isEmailVerified || showEmailVerification}
                  className={`${
                    isEmailVerified ? "pr-10 border-green-500" : ""
                  } ${showEmailVerification ? "pr-10 border-blue-400" : ""}`}
                />
                {isEmailVerified && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
                {!isEmailVerified && !showEmailVerification && (
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
            </div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[38px] transform -translate-y-1/2"
              >
                {showPassword ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeClosed size={20} className="text-gray-500" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div className="cursor-not-allowed">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Role
              </label>
              <Input
                type="text"
                value={role}
                disabled
                className="cursor-not-allowed"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                type="button"
                className="bg-gray-200"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isLoading} type="button">
                {isLoading ? "Creating..." : `Create ${role}`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
