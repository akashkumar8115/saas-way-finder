"use client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { toast } from "react-hot-toast";

// TypeScript Interfaces
interface Organization {
    entity_uuid: string;
    name: string;
    description?: string;
    domain?: string;
    address_id: string;
    entity_type: string;
    logo_url?: string;
    maxLimit?: ResourceLimits;
    currentLimit?: ResourceLimits;
    parent_uuid?: string;
    headcount?: number;
}

interface ResourceLimits {
    screen: number;
    content: number;
    playlist: number;
    group: number;
    organization: number;
}

interface OrganizationUpdateData {
    entity_type: string;
    name: string;
    description: string;
    headcount: string | number;
    domain: string;
    parent_uuid: string;
    address_id: string | number;
}

interface EditOrganizationProps {
    organization: Organization;
    onClose: () => void;
    updateOrganization: (updatedOrg: Organization) => void;
}

interface UpdateOrganizationPayload {
    id: string;
    entity_type: string;
    name: string;
    description: string | null;
    headcount: number | null;
    domain: string | null;
    parent_uuid: string | null;
    address_id: number | null;
}

export const EditOrganization: React.FC<EditOrganizationProps> = ({ 
    organization, 
    onClose, 
    updateOrganization 
}) => {
    const [orgData, setOrgData] = useState<OrganizationUpdateData>({
        entity_type: organization.entity_type || "organization",
        name: organization.name || "",
        description: organization.description || "",
        headcount: organization.headcount !== null && organization.headcount !== undefined ? organization.headcount : "",
        domain: organization.domain || "",
        parent_uuid: organization.parent_uuid || "",
        address_id: organization.address_id !== null && organization.address_id !== undefined ? organization.address_id : "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setOrgData({ ...orgData, [name]: value });
    };

    const handleUpdateOrganization = async (): Promise<void> => {
        if (!orgData.name.trim()) {
            toast.error("Organization name is required");
            return;
        }

        setIsLoading(true);
        try {
            console.log("Updating organization with data:", orgData);

            // Prepare payload according to the backend model
            const payload: UpdateOrganizationPayload = {
                id: organization.entity_uuid, // This is for our API route to know which entity to update
                entity_type: orgData.entity_type,
                name: orgData.name.trim(),
                description: orgData.description || null,
                // Convert string numbers to actual numbers or null
                headcount: orgData.headcount ? parseInt(orgData.headcount.toString()) : null,
                domain: orgData.domain || null,
                parent_uuid: orgData.parent_uuid || null,
                address_id: orgData.address_id ? parseInt(orgData.address_id.toString()) : null,
            };

            console.log("Sending update payload:", JSON.stringify(payload, null, 2));

            const response = await fetch(`/api/organization/updateOrganization`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error("Failed to parse response as JSON:", e);
                throw new Error("Invalid response from server");
            }

            if (!response.ok) {
                console.error("Update failed with status:", response.status, "Response:", data);

                if (response.status === 422) {
                    // Handle validation errors specifically
                    const errorMessage = data.detail
                        ? Array.isArray(data.detail)
                            ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ')
                            : data.detail
                        : "Validation error: Please check your input data";

                    throw new Error(errorMessage);
                }

                throw new Error(data.message || data.detail || "Failed to update organization");
            }

            // Create the updated organization object with proper types
            const updatedOrg: Organization = {
                ...organization,
                entity_type: data.entity_type || orgData.entity_type,
                name: data.name || orgData.name,
                description: data.description || orgData.description,
                headcount: data.headcount !== undefined ? data.headcount : (typeof orgData.headcount === 'string' ? parseInt(orgData.headcount) : orgData.headcount),
                domain: data.domain || orgData.domain,
                parent_uuid: data.parent_uuid || orgData.parent_uuid,
                address_id: data.address_id !== undefined ? data.address_id.toString() : (typeof orgData.address_id === 'string' ? orgData.address_id : orgData.address_id.toString()),
            };

            toast.success("Organization updated successfully");
            updateOrganization(updatedOrg);
            onClose();

        } catch (error) {
            console.error("Error updating organization:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to update organization";
            toast.error(`Failed to update organization: ${errorMessage}`);
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
                    <form>
                        <div className="space-y-4 scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-w-2 h-96 overflow-y-auto">
                            <div className="group">
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
                                    placeholder="Organization Name"
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
                            <div>
                                <Input
                                    label="Parent UUID"
                                    type="text"
                                    name="parent_uuid"
                                    value={orgData.parent_uuid}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-2 pt-4">
                            <Button variant="secondary" onClick={onClose} className="bg-gray-200" disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateOrganization} disabled={isLoading}>
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
        organizations.map((org) => (org.entity_uuid === updatedOrg.entity_uuid ? updatedOrg : org))
    );
};
