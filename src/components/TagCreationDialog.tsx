"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface TagCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, category: string, floorId?: string) => void;
  currentFloorId?: string; // Add currentFloorId prop
}

const categories = [
  'Entrance',
  'Exit',
  'Store',
  'Room',
  'Restroom',
  'Information',
  'Restaurant',
  'Office',
  'Meeting Room',
  'Other'
];

export const TagCreationDialog: React.FC<TagCreationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentFloorId
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (name.trim() && category) {
      onSave(name.trim(), category, currentFloorId);
      setName('');
      setCategory('');
      onClose();
    }
  };

  const handleCancel = () => {
    setName('');
    setCategory('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tag New Location</DialogTitle>
          {currentFloorId && (
            <p className="text-sm text-gray-600">
              This tag will be associated with the current floor
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tag-name">Location Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name (e.g., Main Entrance)"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div>
            <Label htmlFor="tag-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !category}>
              Create Tag
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
