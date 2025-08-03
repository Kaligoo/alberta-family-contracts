'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, Settings, Trash2, Download, Eye, Plus, Users, Edit, Mail, Link as LinkIcon, Tag, ExternalLink, Copy, BarChart3, TrendingUp, Calendar } from 'lucide-react';
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

interface AffiliateLink {
  id: number;
  code: string;
  name: string;
  description?: string;
  commissionRate: string;
  totalClicks: number;
  totalSignups: number;
  totalPurchases: number;
  totalCommission: string;
  isActive: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface CouponCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minimumAmount?: string;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo?: string;
  isActive: string;
  createdBy: number;
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

  // Affiliate link management state
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateLink | null>(null);
  const [affiliateFormData, setAffiliateFormData] = useState({
    code: '',
    name: '',
    description: '',
    commissionRate: '10.00'
  });
  const [affiliateError, setAffiliateError] = useState('');
  const [affiliateSuccess, setAffiliateSuccess] = useState('');
  const [isSavingAffiliate, setIsSavingAffiliate] = useState(false);

  // Coupon code management state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '10.00',
    minimumAmount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: ''
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Reports state
  const [selectedReportType, setSelectedReportType] = useState('summary');
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportDateMode, setReportDateMode] = useState<'month' | 'range'>('month');
  
  // Fetch reports data
  const reportParams = new URLSearchParams({
    type: selectedReportType,
    ...(reportDateMode === 'month' ? { month: reportMonth } : {}),
    ...(reportDateMode === 'range' && reportStartDate ? { startDate: reportStartDate } : {}),
    ...(reportDateMode === 'range' && reportEndDate ? { endDate: reportEndDate } : {}),
  });
  
  const { data: reportsData, error: reportsError, mutate: mutateReports } = useSWR(
    `/api/admin/reports?${reportParams.toString()}`,
    fetcher
  );

  const { data: templatesData, error, mutate } = useSWR('/api/admin/templates', fetcher);
  const { data: lawyersData, error: lawyersError, mutate: mutateLawyers } = useSWR('/api/admin/lawyers', fetcher);
  const { data: affiliatesData, error: affiliatesError, mutate: mutateAffiliates } = useSWR('/api/admin/affiliate-links', fetcher);
  const { data: couponsData, error: couponsError, mutate: mutateCoupons } = useSWR('/api/admin/coupon-codes', fetcher);
  
  const templates: Template[] = templatesData?.templates || [];
  const lawyers: Lawyer[] = lawyersData?.lawyers || [];
  const affiliateLinks: AffiliateLink[] = affiliatesData?.affiliateLinks || [];
  const couponCodes: CouponCode[] = couponsData?.couponCodes || [];

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

  // Affiliate link management functions
  const resetAffiliateForm = () => {
    setAffiliateFormData({
      code: '',
      name: '',
      description: '',
      commissionRate: '10.00'
    });
    setEditingAffiliate(null);
    setShowAffiliateForm(false);
    setAffiliateError('');
    setAffiliateSuccess('');
  };

  const handleAddAffiliate = () => {
    resetAffiliateForm();
    setShowAffiliateForm(true);
  };

  const handleEditAffiliate = (affiliate: AffiliateLink) => {
    setAffiliateFormData({
      code: affiliate.code,
      name: affiliate.name,
      description: affiliate.description || '',
      commissionRate: affiliate.commissionRate
    });
    setEditingAffiliate(affiliate);
    setShowAffiliateForm(true);
    setAffiliateError('');
    setAffiliateSuccess('');
  };

  const handleSaveAffiliate = async () => {
    if (!affiliateFormData.code || !affiliateFormData.name || !affiliateFormData.commissionRate) {
      setAffiliateError('Code, name, and commission rate are required');
      return;
    }

    setIsSavingAffiliate(true);
    setAffiliateError('');
    setAffiliateSuccess('');

    try {
      const url = editingAffiliate 
        ? `/api/admin/affiliate-links/${editingAffiliate.id}`
        : '/api/admin/affiliate-links';
      
      const method = editingAffiliate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(affiliateFormData),
      });

      if (response.ok) {
        setAffiliateSuccess(editingAffiliate ? 'Affiliate link updated successfully!' : 'Affiliate link created successfully!');
        mutateAffiliates(); // Refresh the affiliate links list
        setTimeout(() => {
          resetAffiliateForm();
        }, 1500);
      } else {
        const error = await response.json();
        setAffiliateError(error.error || 'Failed to save affiliate link');
      }
    } catch (error) {
      setAffiliateError('Network error occurred while saving affiliate link');
    } finally {
      setIsSavingAffiliate(false);
    }
  };

  const handleDeleteAffiliate = async (affiliateId: number) => {
    if (!confirm('Are you sure you want to delete this affiliate link?')) return;

    try {
      const response = await fetch(`/api/admin/affiliate-links/${affiliateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAffiliateSuccess('Affiliate link deleted successfully!');
        mutateAffiliates(); // Refresh the affiliate links list
        setTimeout(() => setAffiliateSuccess(''), 3000);
      } else {
        const error = await response.json();
        setAffiliateError(error.error || 'Failed to delete affiliate link');
      }
    } catch (error) {
      setAffiliateError('Network error occurred while deleting affiliate link');
    }
  };

  // Coupon code management functions
  const resetCouponForm = () => {
    setCouponFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '10.00',
      minimumAmount: '',
      usageLimit: '',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: ''
    });
    setEditingCoupon(null);
    setShowCouponForm(false);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleAddCoupon = () => {
    resetCouponForm();
    setShowCouponForm(true);
  };

  const handleEditCoupon = (coupon: CouponCode) => {
    setCouponFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumAmount: coupon.minimumAmount || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().split('T')[0] : ''
    });
    setEditingCoupon(coupon);
    setShowCouponForm(true);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleSaveCoupon = async () => {
    if (!couponFormData.code || !couponFormData.name || !couponFormData.discountValue) {
      setCouponError('Code, name, and discount value are required');
      return;
    }

    setIsSavingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const url = editingCoupon 
        ? `/api/admin/coupon-codes/${editingCoupon.id}`
        : '/api/admin/coupon-codes';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponFormData),
      });

      if (response.ok) {
        setCouponSuccess(editingCoupon ? 'Coupon code updated successfully!' : 'Coupon code created successfully!');
        mutateCoupons(); // Refresh the coupon codes list
        setTimeout(() => {
          resetCouponForm();
        }, 1500);
      } else {
        const error = await response.json();
        setCouponError(error.error || 'Failed to save coupon code');
      }
    } catch (error) {
      setCouponError('Network error occurred while saving coupon code');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('Are you sure you want to delete this coupon code?')) return;

    try {
      const response = await fetch(`/api/admin/coupon-codes/${couponId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCouponSuccess('Coupon code deleted successfully!');
        mutateCoupons(); // Refresh the coupon codes list
        setTimeout(() => setCouponSuccess(''), 3000);
      } else {
        const error = await response.json();
        setCouponError(error.error || 'Failed to delete coupon code');
      }
    } catch (error) {
      setCouponError('Network error occurred while deleting coupon code');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return false;
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
            Manage document templates, system settings, and view reports.
          </p>
        </div>

        {/* Reports Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Report Controls */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="summary">Summary Overview</option>
                    <option value="user-registrations">User Registrations</option>
                    <option value="sales">Sales & Revenue</option>
                    <option value="affiliate-usage">Affiliate Performance</option>
                  </select>
                </div>

                {/* Date Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={reportDateMode}
                    onChange={(e) => setReportDateMode(e.target.value as 'month' | 'range')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="month">By Month</option>
                    <option value="range">Custom Range</option>
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  {reportDateMode === 'month' ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month
                      </label>
                      <input
                        type="month"
                        value={reportMonth}
                        onChange={(e) => setReportMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => mutateReports()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Refresh Report
                </Button>
              </div>
            </div>

            {/* Report Content */}
            {!reportsData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading report...</span>
              </div>
            ) : reportsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load report data</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Report */}
                {selectedReportType === 'summary' && reportsData.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-2xl font-bold text-blue-900">{reportsData.data.totalUsers}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-xs text-blue-600 mt-2">+{reportsData.data.newUsers} this period</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-900">${reportsData.data.totalRevenue}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">+${reportsData.data.periodRevenue} this period</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Paid Contracts</p>
                          <p className="text-2xl font-bold text-purple-900">{reportsData.data.totalPaidContracts}</p>
                        </div>
                        <FileText className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-xs text-purple-600 mt-2">+{reportsData.data.periodPaidContracts} this period</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Active Affiliates</p>
                          <p className="text-2xl font-bold text-orange-900">{reportsData.data.activeAffiliateLinks}</p>
                        </div>
                        <LinkIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <p className="text-xs text-orange-600 mt-2">{reportsData.data.activeCouponCodes} active coupons</p>
                    </div>
                  </div>
                )}

                {/* User Registrations Report */}
                {selectedReportType === 'user-registrations' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Registration Trends</h3>
                        {reportsData.data && reportsData.data.length > 0 ? (
                          <div className="space-y-2">
                            {reportsData.data.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">
                                  {new Date(item.period).toLocaleDateString()}
                                </span>
                                <span className="font-medium">{item.count} users</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No registration data for selected period</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recent Registrations</h3>
                        {reportsData.recentRegistrations && reportsData.recentRegistrations.length > 0 ? (
                          <div className="space-y-2">
                            {reportsData.recentRegistrations.slice(0, 5).map((user: any) => (
                              <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium text-sm">{user.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No recent registrations</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sales Report */}
                {selectedReportType === 'sales' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Sales Performance</h3>
                      {reportsData.data && reportsData.data.length > 0 ? (
                        <div className="space-y-2">
                          {reportsData.data.map((item: any, index: number) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded">
                              <span className="text-sm text-gray-600">
                                {new Date(item.period).toLocaleDateString()}
                              </span>
                              <span className="font-medium">{item.totalSales} sales</span>
                              <span className="text-green-600">${item.totalRevenue}</span>
                              <span className="text-purple-600">{item.withCoupons} w/ coupons</span>
                              <span className="text-orange-600">{item.withAffiliates} w/ affiliates</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No sales data for selected period</p>
                      )}
                    </div>

                    {reportsData.topCoupons && reportsData.topCoupons.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Top Performing Coupons</h3>
                        <div className="space-y-2">
                          {reportsData.topCoupons.slice(0, 5).map((coupon: any, index: number) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                              <span className="font-medium">{coupon.code}</span>
                              <span className="text-sm">{coupon.usageCount} uses</span>
                              <span className="text-red-600">-${coupon.totalDiscount} discount</span>
                              <span className="text-green-600">${coupon.totalRevenue} revenue</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reportsData.recentSales && reportsData.recentSales.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recent Sales</h3>
                        <div className="space-y-2">
                          {reportsData.recentSales.slice(0, 5).map((sale: any, index: number) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{sale.userFullName}</p>
                                {sale.partnerFullName && (
                                  <p className="text-xs text-gray-500">& {sale.partnerFullName}</p>
                                )}
                              </div>
                              <span className="text-green-600">${sale.finalPrice}</span>
                              <span className="text-sm">
                                {sale.couponCode && <span className="text-purple-600">{sale.couponCode}</span>}
                                {sale.affiliateCode && <span className="text-orange-600">{sale.affiliateCode}</span>}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Affiliate Usage Report */}
                {selectedReportType === 'affiliate-usage' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Affiliate Performance</h3>
                      {reportsData.data && reportsData.data.length > 0 ? (
                        <div className="space-y-2">
                          {reportsData.data.map((affiliate: any, index: number) => (
                            <div key={index} className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{affiliate.affiliateName}</p>
                                <p className="text-xs text-gray-500">{affiliate.affiliateCode}</p>
                              </div>
                              <span className="text-sm">{affiliate.totalClicks} clicks</span>
                              <span className="text-sm">{affiliate.totalSignups} signups</span>
                              <span className="text-sm">{affiliate.totalPurchases} purchases</span>
                              <span className="text-green-600">${affiliate.totalCommission}</span>
                              <span className="text-blue-600">${affiliate.totalRevenue}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No affiliate data for selected period</p>
                      )}
                    </div>

                    {reportsData.recentActivity && reportsData.recentActivity.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recent Affiliate Activity</h3>
                        <div className="space-y-2">
                          {reportsData.recentActivity.slice(0, 10).map((activity: any, index: number) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                              <span className="font-medium text-sm">{activity.affiliateName}</span>
                              <span className={`text-sm px-2 py-1 rounded text-xs ${
                                activity.action === 'purchase' ? 'bg-green-100 text-green-800' :
                                activity.action === 'signup' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.action}
                              </span>
                              <span className="text-green-600">
                                {activity.commissionAmount ? `$${activity.commissionAmount}` : '-'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Affiliate Links Management */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <LinkIcon className="mr-2 h-5 w-5" />
                Affiliate Links Management
              </CardTitle>
              <Button
                onClick={handleAddAffiliate}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Affiliate Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Affiliate Form */}
            {showAffiliateForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingAffiliate ? 'Edit Affiliate Link' : 'Create New Affiliate Link'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Affiliate Code *
                    </label>
                    <input
                      type="text"
                      value={affiliateFormData.code}
                      onChange={(e) => setAffiliateFormData({...affiliateFormData, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="PARTNER2024"
                      disabled={!!editingAffiliate}
                    />
                    {editingAffiliate && (
                      <p className="text-xs text-gray-500 mt-1">Affiliate codes cannot be changed after creation</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Affiliate Name *
                    </label>
                    <input
                      type="text"
                      value={affiliateFormData.name}
                      onChange={(e) => setAffiliateFormData({...affiliateFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Partner Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={affiliateFormData.commissionRate}
                      onChange={(e) => setAffiliateFormData({...affiliateFormData, commissionRate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10.00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={affiliateFormData.description}
                      onChange={(e) => setAffiliateFormData({...affiliateFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={2}
                      placeholder="Optional description of this affiliate partnership"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={handleSaveAffiliate}
                    disabled={isSavingAffiliate}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isSavingAffiliate ? 'Saving...' : (editingAffiliate ? 'Update Affiliate Link' : 'Create Affiliate Link')}
                  </Button>
                  <Button
                    onClick={resetAffiliateForm}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>

                {affiliateError && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                    {affiliateError}
                  </div>
                )}
                {affiliateSuccess && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                    {affiliateSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Affiliate Links List */}
            {!affiliatesData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading affiliate links...</span>
              </div>
            ) : affiliateLinks.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No affiliate links created yet.</p>
                <p className="text-sm text-gray-500 mt-2">Create your first affiliate link using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {affiliateLinks.map((affiliate) => (
                  <div key={affiliate.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{affiliate.name}</h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {affiliate.code}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            affiliate.isActive === 'true' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {affiliate.isActive === 'true' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {affiliate.description && (
                          <p className="text-sm text-gray-600 mb-2">{affiliate.description}</p>
                        )}
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-4">
                            <span>Commission: {affiliate.commissionRate}%</span>
                            <span>Clicks: {affiliate.totalClicks}</span>
                            <span>Signups: {affiliate.totalSignups}</span>
                            <span>Purchases: {affiliate.totalPurchases}</span>
                            <span>Earned: ${affiliate.totalCommission}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          <strong>Affiliate URL:</strong> 
                          <code className="bg-gray-100 px-2 py-1 rounded ml-1 text-xs">
                            {typeof window !== 'undefined' ? window.location.origin : 'https://agreeable.ca'}/?ref={affiliate.code}
                          </code>
                          <Button
                            onClick={async () => {
                              const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://agreeable.ca'}/?ref=${affiliate.code}`;
                              const success = await copyToClipboard(url);
                              if (success) {
                                setAffiliateSuccess('Affiliate URL copied to clipboard!');
                                setTimeout(() => setAffiliateSuccess(''), 2000);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {formatDate(affiliate.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditAffiliate(affiliate)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteAffiliate(affiliate.id)}
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

            {/* Global success/error messages for affiliates */}
            {!showAffiliateForm && affiliateError && (
              <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                {affiliateError}
              </div>
            )}
            {!showAffiliateForm && affiliateSuccess && (
              <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                {affiliateSuccess}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coupon Codes Management */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Coupon Codes Management
              </CardTitle>
              <Button
                onClick={handleAddCoupon}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Coupon Form */}
            {showCouponForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-4">
                  {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon Code'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="FAMILY20"
                      style={{ textTransform: 'uppercase' }}
                      disabled={!!editingCoupon}
                    />
                    {editingCoupon && (
                      <p className="text-xs text-gray-500 mt-1">Coupon codes cannot be changed after creation</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Name *
                    </label>
                    <input
                      type="text"
                      value={couponFormData.name}
                      onChange={(e) => setCouponFormData({...couponFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Family & Friends 20%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={couponFormData.discountType}
                      onChange={(e) => setCouponFormData({...couponFormData, discountType: e.target.value as 'percentage' | 'fixed'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={couponFormData.discountValue}
                      onChange={(e) => setCouponFormData({...couponFormData, discountValue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={couponFormData.discountType === 'percentage' ? '20.00' : '100.00'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {couponFormData.discountType === 'percentage' ? 'Percentage discount (0-100)' : 'Dollar amount discount'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Purchase Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={couponFormData.minimumAmount}
                      onChange={(e) => setCouponFormData({...couponFormData, minimumAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional minimum purchase requirement</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={couponFormData.usageLimit}
                      onChange={(e) => setCouponFormData({...couponFormData, usageLimit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={couponFormData.validFrom}
                      onChange={(e) => setCouponFormData({...couponFormData, validFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={couponFormData.validTo}
                      onChange={(e) => setCouponFormData({...couponFormData, validTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={couponFormData.description}
                      onChange={(e) => setCouponFormData({...couponFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={2}
                      placeholder="Optional description of this coupon code"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={handleSaveCoupon}
                    disabled={isSavingCoupon}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {isSavingCoupon ? 'Saving...' : (editingCoupon ? 'Update Coupon Code' : 'Create Coupon Code')}
                  </Button>
                  <Button
                    onClick={resetCouponForm}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>

                {couponError && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                    {couponSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Coupon Codes List */}
            {!couponsData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading coupon codes...</span>
              </div>
            ) : couponCodes.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No coupon codes created yet.</p>
                <p className="text-sm text-gray-500 mt-2">Create your first coupon code using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {couponCodes.map((coupon) => (
                  <div key={coupon.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{coupon.name}</h3>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            coupon.isActive === 'true' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {coupon.isActive === 'true' ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            coupon.discountType === 'percentage' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        )}
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-4">
                            <span>Used: {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                            {coupon.minimumAmount && <span>Min: ${coupon.minimumAmount}</span>}
                            <span>Valid: {formatDate(coupon.validFrom)} - {coupon.validTo ? formatDate(coupon.validTo) : 'No expiry'}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {formatDate(coupon.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditCoupon(coupon)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteCoupon(coupon.id)}
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

            {/* Global success/error messages for coupons */}
            {!showCouponForm && couponError && (
              <div className="mt-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                {couponError}
              </div>
            )}
            {!showCouponForm && couponSuccess && (
              <div className="mt-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                {couponSuccess}
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