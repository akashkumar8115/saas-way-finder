import React from 'react';
import { Route, Building, Upload, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MapUpload } from '@/components/MapUpload';

interface EmptyMapStateProps {
    onImageUpload: (imageUrl: string) => void;
    onToggleBuildingMode: () => void;
}

export const EmptyMapState: React.FC<EmptyMapStateProps> = ({
    onImageUpload,
    onToggleBuildingMode,
}) => {
    return (
        <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
                {/* Icon */}
                <div className="bg-blue-100 p-6 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <Route className="h-12 w-12 text-blue-600" />
                </div>

                {/* Heading */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to Way Finder
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Create interactive wayfinding maps for buildings, campuses, and venues
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Upload Maps</h3>
                        <p className="text-sm text-gray-600">
                            Upload floor plans, site maps, or any image to start creating paths
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                            <Building className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Multi-Floor Buildings</h3>
                        <p className="text-sm text-gray-600">
                            Manage complex buildings with multiple floors and vertical connectors
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                            <Route className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Interactive Paths</h3>
                        <p className="text-sm text-gray-600">
                            Create step-by-step navigation paths with location tagging
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <MapUpload onImageUpload={onImageUpload} />
                    <Button
                        onClick={onToggleBuildingMode}
                        variant="outline"
                        size="lg"
                    >
                        <Building className="h-5 w-5 mr-2" />
                        Create Multi-Floor Building
                    </Button>
                </div>

                {/* Quick Start Guide */}
                <div className="mt-16 bg-gray-50 rounded-xl p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Start Guide</h3>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">For Single Maps:</h4>
                            <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                                    Upload your map image (floor plan, site map, etc.)
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                                    Use Tag Mode to mark important locations
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                                    Switch to Design Mode to create navigation paths
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                                    Publish your map for public use
                                </li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">For Multi-Floor Buildings:</h4>
                            <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                                    Create a new building and add floors
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                                    Upload floor plans for each level
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                                    Add vertical connectors (stairs, elevators)
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                                    Create multi-floor navigation paths
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-sm text-gray-500">
                    Need help? Check out our{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        documentation
                    </a>{' '}
                    or{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                        watch tutorial videos
                    </a>
                </div>
            </div>
        </div>
    );
};

export default EmptyMapState;
