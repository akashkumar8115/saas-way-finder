"use client";

import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";

interface MapUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

// Standardized map dimensions info
const MAP_RECOMMENDATIONS = {
  aspectRatio: "16:9",
  minResolution: "800x450",
  maxResolution: "1920x1080",
  recommendedResolution: "1200x675",
  maxFileSize: "10MB",
};

export const MapUpload: React.FC<MapUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<string | null>(null);

  const validateImage = (file: File): string | null => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB";
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please upload a valid image file (JPG, PNG, GIF, etc.)";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    setImageInfo(null);

    const error = validateImage(file);
    if (error) {
      setUploadError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Create an image to check dimensions
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const expectedAspectRatio = 16 / 9;

          // Provide feedback about image dimensions
          const info = `Image loaded: ${img.width}x${
            img.height
          } (${aspectRatio.toFixed(2)}:1 ratio)`;
          setImageInfo(info);

          // Warn if aspect ratio is significantly different
          if (Math.abs(aspectRatio - expectedAspectRatio) > 0.2) {
            setUploadError(
              `Image aspect ratio (${aspectRatio.toFixed(
                2
              )}:1) differs significantly from recommended 16:9 ratio. The map may appear stretched or compressed.`
            );
          }

          if (e.target?.result) {
            onImageUpload(e.target.result as string);
          }
        };
        img.onerror = () => {
          setUploadError("Failed to load image. Please try a different file.");
        };
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`p-4 rounded-full transition-colors ${
              isDragging ? "bg-blue-200" : "bg-gray-100"
            }`}
          >
            <ImageIcon
              className={`h-8 w-8 ${
                isDragging ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Map Image
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your map image here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isDragging}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      </div>

      {/* Image Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Image Requirements & Recommendations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
              <div>
                <strong>Aspect Ratio:</strong> {MAP_RECOMMENDATIONS.aspectRatio}{" "}
                (recommended)
              </div>
              <div>
                <strong>File Size:</strong> Max{" "}
                {MAP_RECOMMENDATIONS.maxFileSize}
              </div>
              <div>
                <strong>Min Resolution:</strong>{" "}
                {MAP_RECOMMENDATIONS.minResolution}
              </div>
              <div>
                <strong>Recommended:</strong>{" "}
                {MAP_RECOMMENDATIONS.recommendedResolution}
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              For best results, use high-quality images with clear details and
              good contrast. Maps will be automatically scaled to fit the
              standardized display area.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Success Info */}
      {imageInfo && !uploadError && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{imageInfo}</AlertDescription>
        </Alert>
      )}

      {/* Supported Formats */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF, WebP, SVG
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
