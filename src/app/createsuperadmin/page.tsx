
"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Plus,
  Search,
  User,
  UserCog,
  Shield,
  BadgeHelp,
  ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import LogoManager from "@/components/LogoManager";
import { CreateOrganization, CreateSuperAdmin } from "./create/create";
import {
  DeleteConfirmationDialog,
  DeleteUserConfirmationDialog,
  deleteOrganization,
  deleteUserOrAdmin,
} from "./delete/delete";
import {
  fetchOrganizations as fetchOrgsAPI,
  addOrganization as addOrg,
  addUserOrAdmin as addUserOrAdminToOrg,
  fetchAllUsers as fetchUser,
  fetchAllRole as fetchRole,
} from "./read/read";
import {
  EditOrganization,
  updateOrganization as updateOrg,
} from "./update/update";

// Define interfaces for data structures
interface Organization {
  entity_uuid: string;
  name: string;
  description?: string | null;
  address_id?: number | null;
  logo_url?: string | null;
}

interface User {
  user_uuid: string;
  name: string;
  email: string;
  username?: string;
  role_name?: string;
}

interface Role {
  id: number;
  name: string;
}

interface OrgUsers {
  entity_uuid: string;
  superadmin_user?: User[];
  admin_users?: User[];
  maintainer_users?: User[];
}

interface ModalState {
  createOrg: boolean;
  editOrg: boolean;
  createUserOrAdmin: string | null;
}

interface DeleteConfirmation {
  isOpen: boolean;
  organizationId: string | null;
  organizationName: string | null;
}

interface DeleteUserConfirmation {
  isOpen: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  orgId: string | null;
  index: number | null;
}

const Page: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({
    createOrg: false,
    editOrg: false,
    createUserOrAdmin: null,
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<OrgUsers[]>([]);
  const [allRole, setAllRole] = useState<Role[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    organizationId: null,
    organizationName: null,
  });
  const [userDeleteConfirmation, setUserDeleteConfirmation] = useState<DeleteUserConfirmation>({
    isOpen: false,
    userId: null,
    userName: null,
    userEmail: null,
    userRole: null,
    orgId: null,
    index: null,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logoManagerOpen, setLogoManagerOpen] = useState<boolean>(false);
  const [selectedOrgForLogo, setSelectedOrgForLogo] = useState<Organization | null>(null);
  // Removed unused uploadingLogo state
  // const [uploadingLogo, setUploadingLogo] = useState(null);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const orgs = await fetchOrgsAPI();
      setOrganizations(orgs as Organization[]);
    } catch (error) {
      toast.error("Failed to fetch organizations");
      console.error("Error fetching organizations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await fetchUser();
      setAllUsers(users as OrgUsers[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchAllRole = async () => {
    try {
      const roles = await fetchRole();
      setAllRole(roles as Role[]);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchOrganizations(), fetchAllUsers(), fetchAllRole()]);
    };
    void fetchAllData();
  }, []);

  const addOrganization = (organization: Organization) => {
    addOrg(organizations, setOrganizations, organization);
  };

  const updateOrganization = (updatedOrg: Organization) => {
    updateOrg(organizations, setOrganizations, updatedOrg);
  };

  const handleDeleteOrganization = (
    e: React.MouseEvent,
    orgId: string,
    orgName: string
  ) => {
    e.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      organizationId: orgId,
      organizationName: orgName,
    });
  };

  const confirmDeleteOrganization = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const success = await deleteOrganization(deleteConfirmation.organizationId!);
      if (success) {
        setOrganizations((prev) =>
          prev.filter((org) => org.entity_uuid !== deleteConfirmation.organizationId)
        );
        toast.success("Organization deleted successfully");
      }
    } catch (error: any) {
      toast.error(`Failed to delete organization: ${error.message}`);
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({
        isOpen: false,
        organizationId: null,
        organizationName: null,
      });
    }
  };

  const addUserOrAdmin = (orgId: string, user: User) => {
    addUserOrAdminToOrg(organizations, setOrganizations, orgId, user);
    void fetchAllUsers();
  };

  const toggleExpand = (uuid: string) => {
    setExpandedOrg(expandedOrg === uuid ? null : uuid);
  };

  const handleDeleteUserOrAdmin = (
    e: React.MouseEvent,
    user_uuid: string,
    orgId: string,
    role: string,
    index: number,
    name: string,
    email: string
  ) => {
    e.stopPropagation();
    setUserDeleteConfirmation({
      isOpen: true,
      userId: user_uuid,
      userName: name,
      userEmail: email,
      userRole: role,
      orgId,
      index,
    });
  };

  const confirmDeleteUserOrAdmin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const { userId, userRole, orgId, index } = userDeleteConfirmation;
      if (!userId || !orgId || !userRole || index === null) {
        throw new Error("Invalid deletion parameters");
      }
      const success = await deleteUserOrAdmin(
        userId,
        setOrganizations,
        orgId,
        userRole,
        index
      );
      if (success) {
        toast.success(`${userRole} deleted successfully`);
        await fetchAllUsers();
      }
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
      setUserDeleteConfirmation({
        isOpen: false,
        userId: null,
        userName: null,
        userEmail: null,
        userRole: null,
        orgId: null,
        index: null,
      });
    }
  };

  const handleEditOrg = (e: React.MouseEvent, org: Organization) => {
    e.stopPropagation();
    setOrgToEdit(org);
    setModalState((prev) => ({ ...prev, editOrg: true }));
  };

  const getAdmins = (orgId: string): User[] => {
    const org = allUsers.find((o) => o.entity_uuid === orgId);
    if (!org || !org.admin_users) return [];

    const admins = org.admin_users;
    if (!searchQuery.trim()) return admins;

    return admins.filter(
      (person) =>
        person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getSuperAdmin = (orgId: string): User[] => {
    const org = allUsers.find((o) => o.entity_uuid === orgId);
    if (!org || !org.superadmin_user) return [];

    const superadmins = org.superadmin_user;
    if (!searchQuery.trim()) return superadmins;

    return superadmins.filter(
      (person) =>
        person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getMaintainers = (orgId: string): User[] => {
    const org = allUsers.find((o) => o.entity_uuid === orgId);
    if (!org || !org.maintainer_users) return [];

    const maintainers = org.maintainer_users;
    if (!searchQuery.trim()) return maintainers;

    return maintainers.filter(
      (person) =>
        person.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleResetPassword = async (user_uuid: string, email: string) => {
    try {
      toast.loading("Sending password reset email...");
      const response = await fetch("/api/otp_handling/requestPasswordReset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send password reset email");
      }

      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    }
  };

  const openLogoManager = (e: React.MouseEvent, org: Organization) => {
    e.stopPropagation();
    setSelectedOrgForLogo(org);
    setLogoManagerOpen(true);
  };

  const closeLogoManager = () => {
    setLogoManagerOpen(false);
    setSelectedOrgForLogo(null);
  };

  const handleLogoUpload = async (file: File) => {
    if (!selectedOrgForLogo || !file) return;

    try {
      toast.loading("Uploading logo...");
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(
        `/api/logo/uploadLogo?entity_uuid=${selectedOrgForLogo.entity_uuid}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload organization logo");
      }

      const data = await response.json();
      setOrganizations((prev) =>
        prev.map((org) =>
          org.entity_uuid === selectedOrgForLogo.entity_uuid
            ? { ...org, logo_url: data.logo_url }
            : org
        )
      );
      setSelectedOrgForLogo((prev) =>
        prev ? { ...prev, logo_url: data.logo_url } : null
      );

      toast.dismiss();
      toast.success("Logo uploaded successfully");
      closeLogoManager();
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to upload logo");
    }
  };

  const handleRemoveLogo = async () => {
    if (!selectedOrgForLogo || !selectedOrgForLogo.logo_url) return;

    try {
      toast.loading("Removing logo...");
      const response = await fetch(
        `/api/logo/removeLogo?entity_uuid=${selectedOrgForLogo.entity_uuid}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove organization logo");
      }

      setOrganizations((prev) =>
        prev.map((org) =>
          org.entity_uuid === selectedOrgForLogo.entity_uuid
            ? { ...org, logo_url: null }
            : org
        )
      );
      setSelectedOrgForLogo((prev) =>
        prev ? { ...prev, logo_url: null } : null
      );

      toast.dismiss();
      toast.success("Logo removed successfully");
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to remove logo");
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-2 md:px-4 py-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-black">
        xPi Team
      </h1>
      <div className="w-full max-w-5xl">
        <Button
          onClick={() =>
            setModalState((prev) => ({ ...prev, createOrg: true }))
          }
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus size={16} />
          Create Organization
        </Button>

        {isLoading && organizations.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-8">
            {organizations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No organizations found. Create your first organization to get started.
                </p>
              </Card>
            ) : (
              organizations.map((org) => (
                <Card
                  key={org.entity_uuid}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader
                    className="p-4 pb-2"
                    onClick={() => toggleExpand(org.entity_uuid)}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={(e) => openLogoManager(e, org)}
                        >
                          {org.logo_url ? (
                            <Image
                              src={org.logo_url}
                              alt={`${org.name} logo`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                parent?.classList.add(
                                  "flex",
                                  "items-center",
                                  "justify-center",
                                  "bg-blue-100"
                                );
                                const initialsElement = document.createElement("span");
                                initialsElement.className =
                                  "text-blue-600 font-medium text-sm";
                                initialsElement.textContent = org.name
                                  .substring(0, 2)
                                  .toUpperCase();
                                parent?.appendChild(initialsElement);
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {org.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold">
                          {org.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                          onClick={() => toggleExpand(org.entity_uuid)}
                        >
                          {expandedOrg === org.entity_uuid ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                        <Edit
                          size={18}
                          className="cursor-pointer text-blue-500 hover:text-blue-700"
                          onClick={(e) => handleEditOrg(e, org)}
                        />
                        <Trash2
                          size={18}
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={(e) =>
                            handleDeleteOrganization(e, org.entity_uuid, org.name)
                          }
                        />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {org.description || "No description"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Address ID: {org.address_id ?? "N/A"}
                    </p>
                  </CardHeader>

                  {expandedOrg === org.entity_uuid && (
                    <CardContent className="p-4 pt-2">
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="flex items-center gap-2"
                                type="button"
                                variant="primary"
                              >
                                <Plus size={16} />
                                Create
                                <ChevronDown size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalState((prev) => ({
                                    ...prev,
                                    createUserOrAdmin: "Superadmin",
                                  }));
                                  setSelectedOrg(org.entity_uuid);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Shield size={16} />
                                <span>Create Superadmin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalState((prev) => ({
                                    ...prev,
                                    createUserOrAdmin: "Admin",
                                  }));
                                  setSelectedOrg(org.entity_uuid);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <UserCog size={16} />
                                <span>Create Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalState((prev) => ({
                                    ...prev,
                                    createUserOrAdmin: "Maintainer",
                                  }));
                                  setSelectedOrg(org.entity_uuid);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <User size={16} />
                                <span>Create Maintainer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <div className="relative w-full sm:w-auto">
                            <Input
                              type="text"
                              placeholder="Search users or admins..."
                              value={searchQuery}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearchQuery(e.target.value)
                              }
                              className="pl-9 w-full"
                            />
                            <Search
                              size={16}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                          </div>
                        </div>

                        <h4 className="font-semibold text-lg mb-2 flex items-center">
                          <Shield size={18} className="mr-2 text-blue-600" />
                          SuperAdmins
                        </h4>
                        <div className="border rounded-md overflow-hidden mb-4 overflow-x-auto">
                          <table className="w-full table-fixed border-collapse min-w-[600px]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[25%]">
                                  Name
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[30%]">
                                  Email
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[20%]">
                                  Role
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[15%]">
                                  Reset Password
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[10%]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSuperAdmin(org.entity_uuid).length > 0 ? (
                                getSuperAdmin(org.entity_uuid).map((admin, index) => (
                                  <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {admin.name}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {admin.email}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      {admin.role_name || "Superadmin"}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      <div className="flex justify-center">
                                        <BadgeHelp
                                          title="Request Reset Password"
                                          size={16}
                                          className="cursor-pointer text-blue-500 hover:text-blue-700"
                                          onClick={() =>
                                            handleResetPassword(admin.user_uuid, admin.email)
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex justify-center">
                                        <Trash2
                                          size={16}
                                          className="cursor-pointer text-red-500 hover:text-red-700"
                                          onClick={(e) =>
                                            handleDeleteUserOrAdmin(
                                              e,
                                              admin.user_uuid,
                                              org.entity_uuid,
                                              "Superadmin",
                                              index,
                                              admin.name,
                                              admin.email
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="p-2 text-center text-gray-500 text-sm"
                                  >
                                    {searchQuery
                                      ? "No matching superadmins found"
                                      : "No superadmins found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <h4 className="font-semibold text-lg mb-2 flex items-center">
                          <UserCog size={18} className="mr-2 text-blue-600" />
                          Admins
                        </h4>
                        <div className="border rounded-md overflow-hidden mb-4 overflow-x-auto">
                          <table className="w-full table-fixed border-collapse min-w-[600px]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[25%]">
                                  Name
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[30%]">
                                  Email
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[20%]">
                                  Role
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[15%]">
                                  Reset Password
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[10%]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAdmins(org.entity_uuid).length > 0 ? (
                                getAdmins(org.entity_uuid).map((admin, index) => (
                                  <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {admin.name}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {admin.email}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      {admin.role_name || "Admin"}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      <div className="flex justify-center">
                                        <BadgeHelp
                                          title="Request Reset Password"
                                          size={16}
                                          className="cursor-pointer text-blue-500 hover:text-blue-700"
                                          onClick={() =>
                                            handleResetPassword(admin.user_uuid, admin.email)
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex justify-center">
                                        <Trash2
                                          size={16}
                                          className="cursor-pointer text-red-500 hover:text-red-700"
                                          onClick={(e) =>
                                            handleDeleteUserOrAdmin(
                                              e,
                                              admin.user_uuid,
                                              org.entity_uuid,
                                              "Admin",
                                              index,
                                              admin.name,
                                              admin.email
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="p-2 text-center text-gray-500 text-sm"
                                  >
                                    {searchQuery
                                      ? "No matching admins found"
                                      : "No admins found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <h4 className="font-semibold text-lg mb-2 flex items-center">
                          <User size={18} className="mr-2 text-blue-600" />
                          Maintainers
                        </h4>
                        <div className="border rounded-md overflow-hidden overflow-x-auto">
                          <table className="w-full table-fixed border-collapse min-w-[600px]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[25%]">
                                  Name
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[30%]">
                                  Email
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[20%]">
                                  Role
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[15%]">
                                  Reset Password
                                </th>
                                <th className="p-2 text-left text-sm font-semibold text-gray-700 w-[10%]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getMaintainers(org.entity_uuid).length > 0 ? (
                                getMaintainers(org.entity_uuid).map((user, index) => (
                                  <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {user.name}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700 truncate">
                                      {user.email}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      {user.role_name || "Maintainer"}
                                    </td>
                                    <td className="p-2 text-sm text-gray-700">
                                      <div className="flex justify-center">
                                        <BadgeHelp
                                          title="Request Reset Password"
                                          size={16}
                                          className="cursor-pointer text-blue-500 hover:text-blue-700"
                                          onClick={() =>
                                            handleResetPassword(user.user_uuid, user.email)
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <div className="flex justify-center">
                                        <Trash2
                                          size={16}
                                          className="cursor-pointer text-red-500 hover:text-red-700"
                                          onClick={(e) =>
                                            handleDeleteUserOrAdmin(
                                              e,
                                              user.user_uuid,
                                              org.entity_uuid,
                                              "Maintainer",
                                              index,
                                              user.name,
                                              user.email
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="p-2 text-center text-gray-500 text-sm"
                                  >
                                    {searchQuery
                                      ? "No matching maintainers found"
                                      : "No maintainers found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {logoManagerOpen && selectedOrgForLogo && (
        <LogoManager
          organization={selectedOrgForLogo}
          onClose={closeLogoManager}
          onUploadLogo={handleLogoUpload}
          onRemoveLogo={handleRemoveLogo}
        />
      )}

      {modalState.createOrg && (
        <CreateOrganization
          onClose={() =>
            setModalState((prev) => ({ ...prev, createOrg: false }))
          }
          addOrganization={addOrganization}
          fetchOrganizations={fetchOrganizations}
        />
      )}
      {modalState.editOrg && orgToEdit && (
        <EditOrganization
          onClose={() =>
            setModalState((prev) => ({ ...prev, editOrg: false }))
          }
          organization={orgToEdit}
          updateOrganization={updateOrganization}
        />
      )}
      {modalState.createUserOrAdmin && selectedOrg && (
        <CreateSuperAdmin
          onClose={() =>
            setModalState((prev) => ({ ...prev, createUserOrAdmin: null }))
          }
          orgId={selectedOrg}
          role={modalState.createUserOrAdmin}
          addUserOrAdmin={addUserOrAdmin}
          allRole={allRole}
        />
      )}

      
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        organizationId={deleteConfirmation.organizationId}
        organizationName={deleteConfirmation.organizationName}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            organizationId: null,
            organizationName: null,
          })
        }
        onConfirm={confirmDeleteOrganization}
      />
      <DeleteUserConfirmationDialog
        isOpen={userDeleteConfirmation.isOpen}
        userId={userDeleteConfirmation.userId}
        userName={userDeleteConfirmation.userName}
        userEmail={userDeleteConfirmation.userEmail}
        userRole={userDeleteConfirmation.userRole}
        onClose={() =>
          setUserDeleteConfirmation({
            isOpen: false,
            userId: null,
            userName: null,
            userEmail: null,
            userRole: null,
            orgId: null,
            index: null,
          })
        }
        onConfirm={confirmDeleteUserOrAdmin}
      />
    </div>
  );
};

export default Page;