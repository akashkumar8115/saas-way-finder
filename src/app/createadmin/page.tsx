"use client";

import { Button } from "@/components/ui/Button";
import LogoManager from "@/components/LogoManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Plus,
  Search,
  User,
  UserCog,
  AlertCircle,
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
import { CreateOrganization, CreateUserOrAdmin } from "./create/create";
import {
  DeleteConfirmationDialog,
  deleteOrganization,
  deleteUserOrAdmin,
} from "./delete/delete";
import { DeleteUserConfirmationDialog } from "../createsuperadmin/delete/delete";
import {
  fetchOrganizations as fetchOrgsAPI,
  addOrganization as addOrg,
  addUserOrAdmin as addUserOrAdminToOrg,
  fetchAllUsers as fetchUser,
  fetchAllRole as fetchRole,
  getOrgOfSuperAdmin as OrgOfSuperAdmin,
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
  entity_type?: string;
  maxLimit?: {
    organization: number;
    content: number;
    playlist: number;
    screen: number;
    group: number;
  };
  currentLimit?: {
    organization: number;
    content: number;
    playlist: number;
    screen: number;
    group: number;
  };
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

interface SuperAdminOrg {
  parentOrg?: Organization[];
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
  userName: string;
  userEmail: string;
  userRole: string;
  orgId: string | null;
  index: number | null;
}

interface OrgUsers {
  entity_uuid: string;
  admin_users?: User[];
  maintainer_users?: User[];
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
  const [orgOfSuperAdmin, setOrgOfSuperrAdmin] = useState<
    SuperAdminOrg | undefined
  >(undefined);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      organizationId: null,
      organizationName: null,
    });
  const [deleteUserConfirmation, setDeleteUserConfirmation] =
    useState<DeleteUserConfirmation>({
      isOpen: false,
      userId: null,
      userName: "",
      userEmail: "",
      userRole: "",
      orgId: null,
      index: null,
    });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logoManagerOpen, setLogoManagerOpen] = useState<boolean>(false);
  const [selectedOrgForLogo, setSelectedOrgForLogo] =
    useState<Organization | null>(null);

  const fetchOrganizations = async () => {
    try {
      const orgs = await fetchOrgsAPI();
      setOrganizations(orgs as Organization[]);
    } catch (error) {
      setError("Failed to fetch organizations");
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchOrgOfSuperAdmin = async () => {
    try {
      const orgs = await OrgOfSuperAdmin();
      setOrgOfSuperrAdmin(orgs as SuperAdminOrg);
    } catch (error) {
      console.error("Error fetching super admin organization:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await fetchUser();
      setAllUsers(users as OrgUsers[]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllRole = async () => {
    try {
      const roles = await fetchRole();
      setAllRole(roles as Role[]);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOrganizations(),
        fetchAllUsers(),
        fetchAllRole(),
        fetchOrgOfSuperAdmin(),
      ]);
    } catch (error) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
    if (!deleteConfirmation.organizationId) return;

    const success = await deleteOrganization(deleteConfirmation.organizationId);
    if (success) {
      setOrganizations((prev) =>
        prev.filter(
          (org) => org.entity_uuid !== deleteConfirmation.organizationId
        )
      );
      toast.success("Organization deleted successfully");
    }
    setDeleteConfirmation({
      isOpen: false,
      organizationId: null,
      organizationName: null,
    });
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
    userName: string,
    userEmail: string
  ) => {
    e.stopPropagation();
    setDeleteUserConfirmation({
      isOpen: true,
      userId: user_uuid,
      userName,
      userEmail,
      userRole: role,
      orgId,
      index,
    });
  };

  const confirmDeleteUserOrAdmin = async () => {
    const { userId, orgId, userRole, index } = deleteUserConfirmation;

    if (!userId || !orgId || index === null) return;

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

    setDeleteUserConfirmation({
      isOpen: false,
      userId: null,
      userName: "",
      userEmail: "",
      userRole: "",
      orgId: null,
      index: null,
    });
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
        throw new Error(
          errorData.message || "Failed to send password reset email"
        );
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
        throw new Error(
          errorData.message || "Failed to upload organization logo"
        );
      }

      const data = await response.json();

      setOrganizations((prev) =>
        prev.map((org) =>
          org.entity_uuid === selectedOrgForLogo.entity_uuid
            ? { ...org, logo_url: data.logo_url }
            : org
        )
      );

      if (
        orgOfSuperAdmin?.parentOrg?.[0]?.entity_uuid ===
        selectedOrgForLogo.entity_uuid
      ) {
        setOrgOfSuperrAdmin((prev) => ({
          ...prev,
          parentOrg: prev?.parentOrg?.map((org) =>
            org.entity_uuid === selectedOrgForLogo.entity_uuid
              ? { ...org, logo_url: data.logo_url }
              : org
          ),
        }));
      }

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
        throw new Error(
          errorData.message || "Failed to remove organization logo"
        );
      }

      setOrganizations((prev) =>
        prev.map((org) =>
          org.entity_uuid === selectedOrgForLogo.entity_uuid
            ? { ...org, logo_url: null }
            : org
        )
      );

      if (
        orgOfSuperAdmin?.parentOrg?.[0]?.entity_uuid ===
        selectedOrgForLogo.entity_uuid
      ) {
        setOrgOfSuperrAdmin((prev) => ({
          ...prev,
          parentOrg: prev?.parentOrg?.map((org) =>
            org.entity_uuid === selectedOrgForLogo.entity_uuid
              ? { ...org, logo_url: null }
              : org
          ),
        }));
      }

      toast.dismiss();
      toast.success("Logo removed successfully");
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to remove logo");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center mb-4">
          <AlertCircle className="h-6 w-6 mr-2" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchAllData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-black text-center">
        Organization Management
      </h1>

      <div className="w-full max-w-5xl">
        <Button
          onClick={() =>
            setModalState((prev) => ({ ...prev, createOrg: true }))
          }
          className="flex items-center gap-2 w-full sm:w-auto mb-4"
        >
          <Plus size={16} />
          <span>Create Organization</span>
        </Button>

        <div className="grid grid-cols-1 gap-4 mt-2">
          {orgOfSuperAdmin?.parentOrg?.[0] && (
            <div className="w-full mb-6 p-4 sm:p-6 bg-white shadow-md rounded-lg flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={(e) =>
                      openLogoManager(e, orgOfSuperAdmin.parentOrg[0])
                    }
                  >
                    {orgOfSuperAdmin.parentOrg[0].logo_url ? (
                      <Image
                        src={orgOfSuperAdmin.parentOrg[0].logo_url}
                        alt={`${orgOfSuperAdmin.parentOrg[0].name} logo`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {orgOfSuperAdmin.parentOrg[0].name}
                  </CardTitle>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">
                    {orgOfSuperAdmin.parentOrg[0].description ||
                      "No description available"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Domain</p>
                  <p className="text-gray-700">
                    {orgOfSuperAdmin.parentOrg[0].domain ||
                      "No domain specified"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].entity_type || "Unknown"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">
                    Remaining Organizations
                  </p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].maxLimit?.organization -
                      orgOfSuperAdmin.parentOrg[0].currentLimit
                        ?.organization}{" "}
                    / {orgOfSuperAdmin.parentOrg[0].maxLimit?.organization}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">
                    Remaining Contents
                  </p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].maxLimit?.content -
                      orgOfSuperAdmin.parentOrg[0].currentLimit?.content}{" "}
                    / {orgOfSuperAdmin.parentOrg[0].maxLimit?.content}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">
                    Remaining Playlists
                  </p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].maxLimit?.playlist -
                      orgOfSuperAdmin.parentOrg[0].currentLimit?.playlist}{" "}
                    / {orgOfSuperAdmin.parentOrg[0].maxLimit?.playlist}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">
                    Remaining Screens
                  </p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].maxLimit?.screen -
                      orgOfSuperAdmin.parentOrg[0].currentLimit?.screen}{" "}
                    / {orgOfSuperAdmin.parentOrg[0].maxLimit?.screen}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Remaining Groups</p>
                  <p className="text-gray-700 capitalize">
                    {orgOfSuperAdmin.parentOrg[0].maxLimit?.group -
                      orgOfSuperAdmin.parentOrg[0].currentLimit?.group}{" "}
                    / {orgOfSuperAdmin.parentOrg[0].maxLimit?.group}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((key) => (
                <div key={key}>
                  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : organizations.length > 0 ? (
            organizations.map((org) => (
              <Card
                key={org.entity_uuid}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader
                  className="p-3 sm:p-4 pb-2"
                  onClick={() => toggleExpand(org.entity_uuid)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-semibold break-words">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={(e) => openLogoManager(e, org)}
                        >
                          {org.logo_url ? (
                            <Image
                              src={org.logo_url}
                              alt={`${org.name} logo`}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                              onError={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                              ) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.classList.add(
                                    "flex",
                                    "items-center",
                                    "justify-center",
                                    "bg-blue-100"
                                  );
                                  const initialsElement =
                                    document.createElement("span");
                                  initialsElement.className =
                                    "text-blue-600 font-medium text-sm";
                                  initialsElement.textContent = org.name
                                    .substring(0, 2)
                                    .toUpperCase();
                                  parent.appendChild(initialsElement);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {org.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {org.name}
                      </div>
                    </CardTitle>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div
                        className="p-1 hover:bg-gray-100 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(org.entity_uuid);
                        }}
                      >
                        {expandedOrg === org.entity_uuid ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      <button
                        className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit Organization"
                        onClick={(e) => handleEditOrg(e, org)}
                      >
                        <Edit
                          size={18}
                          className="text-blue-500 hover:text-blue-700"
                        />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete Organization"
                        onClick={(e) =>
                          handleDeleteOrganization(e, org.entity_uuid, org.name)
                        }
                      >
                        <Trash2
                          size={18}
                          className="text-red-500 hover:text-red-700"
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">
                    {org.description || "No description"}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Address ID: {org.address_id ?? "N/A"}
                  </p>
                </CardHeader>

                {expandedOrg === org.entity_uuid && (
                  <CardContent className="p-3 sm:p-4 pt-2">
                    <div className="mt-2 sm:mt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="flex items-center gap-2 w-full sm:w-auto">
                              <Plus size={16} />
                              <span>Create</span>
                              <ChevronDown size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
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
                        <div className="relative w-full sm:w-64">
                          <Input
                            type="text"
                            placeholder="Search users or admins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full"
                          />
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
                          <UserCog size={18} className="mr-2 text-blue-600" />
                          Admins
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed border-collapse min-w-[600px]">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[30%]">
                                    Name
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[35%]">
                                    Email
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[20%]">
                                    Role
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[15%]">
                                    Reset Password
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[15%]">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {getAdmins(org.entity_uuid).length > 0 ? (
                                  getAdmins(org.entity_uuid).map(
                                    (admin, index) => (
                                      <tr
                                        key={index}
                                        className="border-t hover:bg-gray-50"
                                      >
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 truncate">
                                          {admin.name}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 truncate">
                                          {admin.email}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                                          {admin.role_name || "Admin"}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                                          <BadgeHelp
                                            title="Request Reset Password"
                                            size={16}
                                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                                            onClick={() =>
                                              handleResetPassword(
                                                admin.user_uuid,
                                                admin.email
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="p-2 sm:p-3">
                                          <div className="flex gap-2 justify-center sm:justify-start">
                                            <button
                                              className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                              title="Delete Admin"
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
                                            >
                                              <Trash2
                                                size={16}
                                                className="text-red-500 hover:text-red-700"
                                              />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="p-3 text-center text-gray-500 text-sm"
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
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center">
                          <User size={18} className="mr-2 text-blue-600" />
                          Maintainers
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed border-collapse min-w-[600px]">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[30%]">
                                    Name
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[35%]">
                                    Email
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[20%]">
                                    Role
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[15%]">
                                    Reset Password
                                  </th>
                                  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[15%]">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {getMaintainers(org.entity_uuid).length > 0 ? (
                                  getMaintainers(org.entity_uuid).map(
                                    (user, index) => (
                                      <tr
                                        key={index}
                                        className="border-t hover:bg-gray-50"
                                      >
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 truncate">
                                          {user.name}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 truncate">
                                          {user.email}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                                          {user.role_name || "Maintainer"}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                                          <BadgeHelp
                                            title="Request Reset Password"
                                            size={16}
                                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                                            onClick={() =>
                                              handleResetPassword(
                                                user.user_uuid,
                                                user.email
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="p-2 sm:p-3">
                                          <div className="flex gap-2 justify-center sm:justify-start">
                                            <button
                                              className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                              title="Delete Maintainer"
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
                                            >
                                              <Trash2
                                                size={16}
                                                className="text-red-500 hover:text-red-700"
                                              />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="p-3 text-center text-gray-500 text-sm"
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
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <AlertCircle size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">No organizations found</p>
              <Button
                onClick={() =>
                  setModalState((prev) => ({ ...prev, createOrg: true }))
                }
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Create Your First Organization
              </Button>
            </div>
          )}
        </div>
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
          parentOrg={orgOfSuperAdmin?.parentOrg?.[0]}
          fetchOrganizations={fetchOrganizations}
          fetchOrgOfSuperAdmin={fetchOrgOfSuperAdmin}
        />
      )}

      {modalState.createUserOrAdmin && selectedOrg && (
        <CreateUserOrAdmin
          onClose={() =>
            setModalState((prev) => ({ ...prev, createUserOrAdmin: null }))
          }
          addUserOrAdmin={addUserOrAdmin}
          orgId={selectedOrg}
          role={modalState.createUserOrAdmin}
        />
      )}

      {modalState.editOrg && orgToEdit && (
        <EditOrganization
          organization={orgToEdit}
          onClose={() => {
            setModalState((prev) => ({ ...prev, editOrg: false }));
            setOrgToEdit(null);
          }}
          updateOrganization={updateOrganization}
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
        isOpen={deleteUserConfirmation.isOpen}
        userId={deleteUserConfirmation.userId}
        userName={deleteUserConfirmation.userName}
        userEmail={deleteUserConfirmation.userEmail}
        userRole={deleteUserConfirmation.userRole}
        onClose={() =>
          setDeleteUserConfirmation({
            isOpen: false,
            userId: null,
            userName: "",
            userEmail: "",
            userRole: "",
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
