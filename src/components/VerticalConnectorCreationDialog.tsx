"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Building, ArrowUp, AlertTriangle } from 'lucide-react';
import { VerticalConnectorType } from './VerticalConnectorTagger';

interface VerticalConnectorCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: VerticalConnectorType, sharedId: string) => void;
}

export const VerticalConnectorCreationDialog: React.FC<VerticalConnectorCreationDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<VerticalConnectorType>('elevator');
  const [sharedId, setSharedId] = useState('');

  const handleSave = () => {
    if (name.trim() && sharedId.trim()) {
      onSave(name.trim(), type, sharedId.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setType('elevator');
    setSharedId('');
    onClose();
  };

  const getTypeIcon = (connectorType: VerticalConnectorType) => {
    switch (connectorType) {
      case 'elevator':
        return <Building className="h-4 w-4" />;
      case 'stairs':
        return <Building className="h-4 w-4" />;
      case 'escalator':
        return <ArrowUp className="h-4 w-4" />;
      case 'emergency-exit':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(type)}
            Create Vertical Connector
          </DialogTitle>
          <DialogDescription>
            Add a vertical navigation element that connects multiple floors.
            The Shared ID must be the same across all floors for the same physical connector.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="connector-name">Name</Label>
            <Input
              id="connector-name"
              placeholder="e.g., Elevator A, Main Stairs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="connector-type">Type</Label>
            <Select value={type} onValueChange={(value: VerticalConnectorType) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevator">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Elevator
                  </div>
                </SelectItem>
                <SelectItem value="stairs">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Stairs
                  </div>
                </SelectItem>
                <SelectItem value="escalator">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Escalator
                  </div>
                </SelectItem>
                <SelectItem value="emergency-exit">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Emergency Exit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shared-id">Shared ID</Label>
            <Input
              id="shared-id"
              placeholder="e.g., ELV-A, STAIR-1, ESC-1, EXIT-1"
              value={sharedId}
              onChange={(e) => setSharedId(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This ID must be identical for the same connector on different floors
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || !sharedId.trim()}
          >
            Create Connector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
