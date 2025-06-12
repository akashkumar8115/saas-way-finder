"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
// Define interfaces
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  userName: string | null;
  userId: string | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export const deleteUser = async (user_uuid: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/organization/deleteUsers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_uuid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }

    toast.success("User deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(
      `Failed to delete user: ${
        error.message || "An unexpected error occurred"
      }`
    );
    return false;
  }
};

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ isOpen, userName, userId, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2 text-red-600">
            <AlertTriangle size={24} />
            Confirm Deletion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Are you sure you want to delete the user{" "}
            <span className="font-semibold">{userName || "this user"}</span>?
            This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (userId) {
                onConfirm(userId);
                onClose();
              }
            }}
            disabled={!userId}
          >
            Delete User
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
