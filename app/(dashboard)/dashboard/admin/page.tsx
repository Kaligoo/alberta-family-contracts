'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, Settings, Trash2, Download, Eye, Plus } from 'lucide-react';
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

export default function AdminDashboardPage() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sampleDataStatus, setSampleDataStatus] = useState('');
  const [isInitializingSampleData, setIsInitializingSampleData] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isRunningMigration, setIsRunningMigration] = useState(false);

  const { data: templatesData, error, mutate } = useSWR('/api/admin/templates', fetcher);
  const templates: Template[] = templatesData?.templates || [];

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
        setUploadError(error.message || 'Upload failed');
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
          setMigrationStatus(`Success: Migration applied. Added columns: ${result.addedColumns.join(', ')}`);
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
                Initialize sample contract data for testing and demonstration purposes.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleInitializeSampleData}
                  disabled={isInitializingSampleData}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isInitializingSampleData ? 'Initializing...' : 'Initialize Sample Data'}
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