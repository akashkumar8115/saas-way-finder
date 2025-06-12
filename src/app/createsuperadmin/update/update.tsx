"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
// import { toast } from "@/lib/toastUtils";
import toast from "react-hot-toast";
// Define interfaces for organization
interface Organization {
  entity_uuid: string;
  name: string;
  description?: string | null;
  headcount?: number | null;
  domain?: string | null;
  entity_type: string;
  parent_uuid?: string | null;
  address_id?: number | null;
  superadmin_user?: User[];
  admin_users?: User[];
  maintainer_users?: User[];
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
  headcount: string | number;
  domain: string;
  parent_uuid: string;
  address_id: string | number;
}

// Define props interface
interface EditOrganizationProps {
  organization: Organization;
  onClose: () => void;
  updateOrganization: (
    organizations: Organization[],
    setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>,
    updatedOrg: Organization
  ) => void;
}

export const EditOrganization: React.FC<EditOrganizationProps> = ({
  organization,
  onClose,
  updateOrganization,
}) => {
  const [orgData, setOrgData] = useState<OrgData>({
    entity_type: organization.entity_type || "parent",
    name: organization.name || "",
    description: organization.description || "",
    headcount:
      organization.headcount !== null && organization.headcount !== undefined
        ? organization.headcount
        : "",
    domain: organization.domain || "",
    parent_uuid: organization.parent_uuid || "",
    address_id:
      organization.address_id !== null && organization.address_id !== undefined
        ? organization.address_id
        : "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        id: organization.entity_uuid,
        entity_type: orgData.entity_type,
        name: orgData.name.trim(),
        description: orgData.description || null,
        headcount: orgData.headcount
          ? parseInt(orgData.headcount as string)
          : null,
        domain: orgData.domain || null,
        parent_uuid: orgData.parent_uuid || null,
        address_id: orgData.address_id
          ? parseInt(orgData.address_id as string)
          : null,
      };

      const response = await fetch(`/api/organization/updateOrganization`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        if (response.status === 422) {
          const errorMessage = data.detail
            ? Array.isArray(data.detail)
              ? data.detail
                  .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
                  .join(", ")
              : data.detail
            : "Validation error: Please check your input data";
          throw new Error(errorMessage);
        }
        throw new Error(
          data.message || data.detail || "Failed to update organization"
        );
      }

      const updatedOrg: Organization = {
        ...organization,
        entity_type: data.entity_type || orgData.entity_type,
        name: data.name || orgData.name,
        description: data.description || orgData.description || null,
        headcount:
          data.headcount !== undefined
            ? data.headcount
            : orgData.headcount
            ? parseInt(orgData.headcount as string)
            : null,
        domain: data.domain || orgData.domain || null,
        parent_uuid: data.parent_uuid || orgData.parent_uuid || null,
        address_id:
          data.address_id !== undefined
            ? data.address_id
            : orgData.address_id
            ? parseInt(orgData.address_id as string)
            : null,
        superadmin_user: organization.superadmin_user || [],
        admin_users: organization.admin_users || [],
        maintainer_users: organization.maintainer_users || [],
      };

      toast.success("Organization updated successfully");
      updateOrganization([], organization, updatedOrg);
      onClose();
    } catch (error: any) {
      console.error("Error updating organization:", error);
      toast.error(`Failed to update organization: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateOrganization}>
            <div className="space-y-4 scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-w-2 h-96 overflow-y-auto">
              <div>
                <Input
                  label="Entity Type"
                  type="text"
                  name="entity_type"
                  value={orgData.entity_type}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Organization Name"
                  type="text"
                  name="name"
                  value={orgData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  label="Description"
                  type="text"
                  name="description"
                  value={orgData.description}
                  onChange={handleChange}
                  placeholder="Description (Optional)"
                />
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
            </div>
            <div className="flex justify-between space-x-2 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-gray-200"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Organization"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const updateOrganization = (
  organizations: Organization[],
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>,
  updatedOrg: Organization
): void => {
  setOrganizations(
    organizations.map((org) =>
      org.entity_uuid === updatedOrg.entity_uuid ? updatedOrg : org
    )
  );
};
