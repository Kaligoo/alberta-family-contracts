'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, Settings, Trash2, Download, Eye, Plus, Users, Edit, Mail } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Template {
  id: string;
  name: string;
  filename: string;
  description: string;
  uploadedAt: string;
  size: number;
  isActive: boolean;
}

interface Lawyer {
  id: number;
  name: string;
  email: string;
  firm: string;
  phone?: string;
  address?: string;
  website?: string;
  party: 'user' | 'partner' | 'both';
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sampleDataStatus, setSampleDataStatus] = useState('');
  const [isInitializingSampleData, setIsInitializingSampleData] = useState(false);
  const [isPopulatingSampleData, setIsPopulatingSampleData] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isRunningMigration, setIsRunningMigration] = useState(false);
  
  // Lawyer management state
  const [showLawyerForm, setShowLawyerForm] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerFormData, setLawyerFormData] = useState({
    name: '',
    email: '',
    firm: '',
    phone: '',
    address: '',
    website: '',
    party: 'user' as 'user' | 'partner' | 'both',
    isActive: 'true'
  });
  const [lawyerError, setLawyerError] = useState('');
  const [lawyerSuccess, setLawyerSuccess] = useState('');
  const [isSavingLawyer, setIsSavingLawyer] = useState(false);

  const { data: templatesData, error, mutate } = useSWR('/api/admin/templates', fetcher);
  const { data: lawyersData, error: lawyersError, mutate: mutateLawyers } = useSWR('/api/admin/lawyers', fetcher);
  
  const templates: Template[] = templatesData?.templates || [];
  const lawyers: Lawyer[] = lawyersData?.lawyers || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.docx')) {
        setUploadError('Please select a .docx file');
        return;
      }
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('template', uploadFile);
      formData.append('name', uploadFile.name.replace('.docx', ''));
      formData.append('description', 'Uploaded via admin dashboard');

      const response = await fetch('/api/admin/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess('Template uploaded successfully');
        setUploadFile(null);
        mutate(); // Refresh templates list
        // Reset file input
        const fileInput = document.getElementById('template-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        setUploadError(error.error || error.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetActive = async (templateId: string) => {
    try {
      await fetch(`/api/admin/templates/${templateId}/activate`, {
        method: 'POST',
      });
      mutate(); // Refresh templates list
    } catch (error) {
      console.error('Failed to activate template:', error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      });
      mutate(); // Refresh templates list
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleInitializeSampleData = async () => {
    if (!confirm('This will add sample contracts to your account. Continue?')) return;

    setIsInitializingSampleData(true);
    setSampleDataStatus('');

    try {
      const response = await fetch('/api/admin/init-sample-data', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setSampleDataStatus(`Success: Added ${result.count} sample contracts`);
      } else {
        const error = await response.json();
        const errorDetails = error.details ? ` - ${error.details}` : '';
        setSampleDataStatus(`Error: ${error.error || 'Failed to initialize sample data'}${errorDetails}`);
      }
    } catch (error) {
      setSampleDataStatus('Network error occurred while initializing sample data');
    } finally {
      setIsInitializingSampleData(false);
    }
  };

  const handleRunMigration = async () => {
    if (!confirm('This will apply missing database schema changes. This is a one-time operation. Continue?')) return;

    setIsRunningMigration(true);
    setMigrationStatus('');

    try {
      const response = await fetch('/api/admin/force-migration', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMigrationStatus(`Success: Migration applied. Applied migrations: ${result.appliedMigrations.join(', ')}`);
        } else {
          setMigrationStatus(`Error: ${result.error}`);
        }
      } else {
        const error = await response.json();
        setMigrationStatus(`Error: ${error.error || 'Failed to run migration'}`);
      }
    } catch (error) {
      setMigrationStatus('Network error occurred while running migration');
    } finally {
      setIsRunningMigration(false);
    }
  };

  const handlePopulateSampleData = async () => {
    if (!confirm('This will populate empty fields in existing contracts with sample data. Continue?')) return;

    setIsPopulatingSampleData(true);
    setSampleDataStatus('');

    try {
      const response = await fetch('/api/admin/populate-sample-data', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setSampleDataStatus(`Success: Updated ${result.contractsUpdated} contracts with sample data`);
      } else {
        const error = await response.json();
        const errorDetails = error.details ? ` - ${error.details}` : '';
        setSampleDataStatus(`Error: ${error.error || 'Failed to populate sample data'}${errorDetails}`);
      }
    } catch (error) {
      setSampleDataStatus('Network error occurred while populating sample data');
    } finally {
      setIsPopulatingSampleData(false);
    }
  };

  // Lawyer management functions
  const resetLawyerForm = () => {
    setLawyerFormData({
      name: '',
      email: '',
      firm: '',
      phone: '',
      address: '',
      website: '',
      party: 'user',
      isActive: 'true'
    });
    setEditingLawyer(null);
    setShowLawyerForm(false);
    setLawyerError('');
    setLawyerSuccess('');
  };

  const handleAddLawyer = () => {
    resetLawyerForm();
    setShowLawyerForm(true);
  };

  const handleEditLawyer = (lawyer: Lawyer) => {
    setLawyerFormData({
      name: lawyer.name,
      email: lawyer.email,
      firm: lawyer.firm,
      phone: lawyer.phone || '',
      address: lawyer.address || '',
      website: lawyer.website || '',
      party: lawyer.party,
      isActive: lawyer.isActive
    });
    setEditingLawyer(lawyer);
    setShowLawyerForm(true);
    setLawyerError('');
    setLawyerSuccess('');
  };

  const handleSaveLawyer = async () => {
    if (!lawyerFormData.name || !lawyerFormData.email || !lawyerFormData.firm) {
      setLawyerError('Name, email, and firm are required');
      return;
    }

    setIsSavingLawyer(true);
    setLawyerError('');
    setLawyerSuccess('');

    try {
      const url = editingLawyer 
        ? `/api/admin/lawyers/${editingLawyer.id}`
        : '/api/admin/lawyers';
      
      const method = editingLawyer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lawyerFormData),
      });

      if (response.ok) {
        setLawyerSuccess(editingLawyer ? 'Lawyer updated successfully!' : 'Lawyer created successfully!');
        mutateLawyers(); // Refresh the lawyers list
        setTimeout(() => {
          resetLawyerForm();
        }, 1500);
      } else {
        const error = await response.json();
        setLawyerError(error.error || 'Failed to save lawyer');
      }
    } catch (error) {
      setLawyerError('Network error occurred while saving lawyer');
    } finally {
      setIsSavingLawyer(false);
    }
  };

  const handleDeleteLawyer = async (lawyerId: number) => {
    if (!confirm('Are you sure you want to delete this lawyer?')) return;

    try {
      const response = await fetch(`/api/admin/lawyers/${lawyerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLawyerSuccess('Lawyer deleted successfully!');
        mutateLawyers(); // Refresh the lawyers list
        setTimeout(() => setLawyerSuccess(''), 3000);
      } else {
        const error = await response.json();
        setLawyerError(error.error || 'Failed to delete lawyer');
      }
    } catch (error) {
      setLawyerError('Network error occurred while deleting lawyer');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load admin dashboard. Please check your permissions.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage document templates and system settings.
          </p>
        </div>

        {/* Upload New Template */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload New Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="template-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Word Document Template (.docx)
                </label>
                <input
                  id="template-upload"
                  type="file"
                  accept=".docx"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
              
              {uploadFile && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Selected:</strong> {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isUploading ? 'Uploading...' : 'Upload Template'}
                </Button>
              </div>

              {uploadError && (
                <p className="text-red-600 text-sm">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="text-green-600 text-sm">{uploadSuccess}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Document Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!templatesData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No templates uploaded yet.</p>
                <p className="text-sm text-gray-500 mt-2">Upload your first Word document template above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isActive && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>File: {template.filename}</span>
                          <span>Size: {formatFileSize(template.size)}</span>
                          <span>Uploaded: {formatDate(template.uploadedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!template.isActive && (
                          <Button
                            onClick={() => handleSetActive(template.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Set Active
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => window.open(`/api/admin/templates/${template.id}/download`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDelete(template.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lawyer Management */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Lawyer Management
              </CardTitle>
              <Button
                onClick={handleAddLawyer}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lawyer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Lawyer Form */}
            {showLawyerForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={lawyerFormData.name}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Lawyer's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={lawyerFormData.email}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="lawyer@firm.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Law Firm *
                    </label>
                    <input
                      type="text"
                      value={lawyerFormData.firm}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, firm: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Law firm name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={lawyerFormData.phone}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Type *
                    </label>
                    <select
                      value={lawyerFormData.party}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, party: e.target.value as 'user' | 'partner' | 'both'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="user">User Only</option>
                      <option value="partner">Partner Only</option>
                      <option value="both">Both Parties</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={lawyerFormData.isActive}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, isActive: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={lawyerFormData.address}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={2}
                      placeholder="Office address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Law Firm Website
                    </label>
                    <input
                      type="url"
                      value={lawyerFormData.website}
                      onChange={(e) => setLawyerFormData({...lawyerFormData, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://www.lawfirm.com"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={handleSaveLawyer}
                    disabled={isSavingLawyer}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isSavingLawyer ? 'Saving...' : (editingLawyer ? 'Update Lawyer' : 'Add Lawyer')}
                  </Button>
                  <Button
                    onClick={resetLawyerForm}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>

                {lawyerError && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                    {lawyerError}
                  </div>
                )}
                {lawyerSuccess && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                    {lawyerSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Lawyers List */}
            {!lawyersData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading lawyers...</span>
              </div>
            ) : lawyers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No lawyers added yet.</p>
                <p className="text-sm text-gray-500 mt-2">Add your first lawyer using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lawyers.map((lawyer) => (
                  <div key={lawyer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{lawyer.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            lawyer.isActive === 'true' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lawyer.isActive === 'true' ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            lawyer.party === 'user' ? 'bg-blue-100 text-blue-800' :
                            lawyer.party === 'partner' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {lawyer.party === 'user' ? 'User' : lawyer.party === 'partner' ? 'Partner' : 'Both'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {lawyer.email}
                            </span>
                            <span>{lawyer.firm}</span>
                            {lawyer.phone && <span>{lawyer.phone}</span>}
                          </div>
                        </div>
                        {lawyer.website && (
                          <div className="text-xs text-gray-500 mb-2">
                            <strong>Website:</strong> <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{lawyer.website}</a>
                          </div>
                        )}
                        {lawyer.address && (
                          <div className="text-xs text-gray-500">
                            <strong>Address:</strong> {lawyer.address}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          Added: {formatDate(lawyer.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditLawyer(lawyer)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteLawyer(lawyer.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Global success/error messages for lawyers */}
            {!showLawyerForm && lawyerError && (
              <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                {lawyerError}
              </div>
            )}
            {!showLawyerForm && lawyerSuccess && (
              <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                {lawyerSuccess}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Template Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Template Field Format</h4>
                <p>Use curly braces for dynamic fields: <code className="bg-gray-100 px-1 rounded">{`{userFullName}`}</code>, <code className="bg-gray-100 px-1 rounded">{`{partnerFullName}`}</code>, etc.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{userFullName}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{partnerFullName}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{userJobTitle}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{partnerJobTitle}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{userIncome}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{partnerIncome}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{residenceAddress}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{currentDate}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{userEmail}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{partnerEmail}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{userPhone}`}</code>
                  <code className="bg-gray-100 px-2 py-1 rounded">{`{partnerPhone}`}</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">File Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>File must be in .docx format (Microsoft Word)</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Only one template can be active at a time</li>
                  <li>Templates should include proper legal language and formatting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Migration */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Database Migration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Apply missing database schema changes. Run this if sample data isn't working.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleRunMigration}
                  disabled={isRunningMigration}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isRunningMigration ? 'Running Migration...' : 'Apply Schema Changes'}
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/create-lawyers-table', { method: 'POST' });
                      const result = await response.json();
                      setMigrationStatus(result.success ? `Success: ${result.message}. Lawyers: ${result.lawyerCount}` : `Error: ${result.message}`);
                    } catch (error) {
                      setMigrationStatus('Error: Failed to create lawyers table');
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Create Lawyers Table
                </Button>
              </div>

              {migrationStatus && (
                <div className={`p-3 rounded-md text-sm ${
                  migrationStatus.startsWith('Success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {migrationStatus}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sample Data Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Sample Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Initialize sample contract data for testing and demonstration purposes, or populate empty fields with sample data.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleInitializeSampleData}
                  disabled={isInitializingSampleData}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isInitializingSampleData ? 'Initializing...' : 'Initialize Sample Data'}
                </Button>
                
                <Button 
                  onClick={handlePopulateSampleData}
                  disabled={isPopulatingSampleData}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isPopulatingSampleData ? 'Populating...' : 'Populate Empty Fields'}
                </Button>
              </div>

              {sampleDataStatus && (
                <div className={`p-3 rounded-md text-sm ${
                  sampleDataStatus.startsWith('Success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {sampleDataStatus}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}