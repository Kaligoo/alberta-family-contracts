'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Users, DollarSign, Home, Save, ChevronDown, ChevronUp, Calculator, TestTube } from 'lucide-react';
import { SpousalSupportSelector } from '@/components/ui/spousal-support-selector';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import Link from 'next/link';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChildInfo {
  name: string;
  birthdate?: string;
  relationship: 'biological' | 'step' | 'adopted';
  parentage: 'user' | 'partner' | 'both';
}

function PersonalInfoCard({ formData, updateFormData, isContractPaid }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void;
  isContractPaid?: boolean; 
}) {

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userFullName">Your Full Name</Label>
            <Input
              id="userFullName"
              value={formData.userFullName}
              onChange={(e) => updateFormData('userFullName', e.target.value)}
              placeholder="Enter your full name"
              readOnly={isContractPaid}
              className={isContractPaid ? 'bg-gray-100' : ''}
            />
            {isContractPaid && (
              <p className="text-xs text-gray-500 mt-1">
                Party names cannot be changed after payment
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="partnerFullName">Partner's Full Name</Label>
            <Input
              id="partnerFullName"
              value={formData.partnerFullName}
              onChange={(e) => updateFormData('partnerFullName', e.target.value)}
              placeholder="Enter partner's full name"
              readOnly={isContractPaid}
              className={isContractPaid ? 'bg-gray-100' : ''}
            />
            {isContractPaid && (
              <p className="text-xs text-gray-500 mt-1">
                Party names cannot be changed after payment
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userFirstName">Your First Name</Label>
            <Input
              id="userFirstName"
              value={formData.userFirstName}
              onChange={(e) => updateFormData('userFirstName', e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="partnerFirstName">Partner's First Name</Label>
            <Input
              id="partnerFirstName"
              value={formData.partnerFirstName}
              onChange={(e) => updateFormData('partnerFirstName', e.target.value)}
              placeholder="Enter partner's first name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userPronouns">Your Pronouns</Label>
            <select
              id="userPronouns"
              value={formData.userPronouns}
              onChange={(e) => updateFormData('userPronouns', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select pronouns</option>
              <option value="he/him/his">he/him/his</option>
              <option value="she/her/hers">she/her/hers</option>
              <option value="they/them/theirs">they/them/theirs</option>
            </select>
          </div>
          <div>
            <Label htmlFor="partnerPronouns">Partner's Pronouns</Label>
            <select
              id="partnerPronouns"
              value={formData.partnerPronouns}
              onChange={(e) => updateFormData('partnerPronouns', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select pronouns</option>
              <option value="he/him/his">he/him/his</option>
              <option value="she/her/hers">she/her/hers</option>
              <option value="they/them/theirs">they/them/theirs</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userAge">Your Age</Label>
            <Input
              id="userAge"
              type="number"
              min="18"
              max="120"
              value={formData.userAge}
              onChange={(e) => updateFormData('userAge', e.target.value)}
              placeholder="Age"
            />
          </div>
          <div>
            <Label htmlFor="partnerAge">Partner's Age</Label>
            <Input
              id="partnerAge"
              type="number"
              min="18"
              max="120"
              value={formData.partnerAge}
              onChange={(e) => updateFormData('partnerAge', e.target.value)}
              placeholder="Age"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userJobTitle">Your Job Title</Label>
            <Input
              id="userJobTitle"
              value={formData.userJobTitle}
              onChange={(e) => updateFormData('userJobTitle', e.target.value)}
              placeholder="Enter your job title"
            />
          </div>
          <div>
            <Label htmlFor="partnerJobTitle">Partner's Job Title</Label>
            <Input
              id="partnerJobTitle"
              value={formData.partnerJobTitle}
              onChange={(e) => updateFormData('partnerJobTitle', e.target.value)}
              placeholder="Enter partner's job title"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userEmail">Your Email Address</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => updateFormData('userEmail', e.target.value)}
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <Label htmlFor="partnerEmail">Partner's Email Address</Label>
            <Input
              id="partnerEmail"
              type="email"
              value={formData.partnerEmail}
              onChange={(e) => updateFormData('partnerEmail', e.target.value)}
              placeholder="Enter partner's email address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userPhone">Your Phone Number</Label>
            <Input
              id="userPhone"
              type="tel"
              value={formData.userPhone}
              onChange={(e) => updateFormData('userPhone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <Label htmlFor="partnerPhone">Partner's Phone Number</Label>
            <Input
              id="partnerPhone"
              type="tel"
              value={formData.partnerPhone}
              onChange={(e) => updateFormData('partnerPhone', e.target.value)}
              placeholder="Enter partner's phone number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userAddress">Your Address</Label>
            <Input
              id="userAddress"
              value={formData.userAddress}
              onChange={(e) => updateFormData('userAddress', e.target.value)}
              placeholder="Enter your address"
            />
          </div>
          <div>
            <Label htmlFor="partnerAddress">Partner's Address</Label>
            <Input
              id="partnerAddress"
              value={formData.partnerAddress}
              onChange={(e) => updateFormData('partnerAddress', e.target.value)}
              placeholder="Enter partner's address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userLawyer">Your Lawyer</Label>
            <Input
              id="userLawyer"
              value={formData.userLawyer}
              onChange={(e) => updateFormData('userLawyer', e.target.value)}
              placeholder="Enter your lawyer's information"
            />
          </div>
          <div>
            <Label htmlFor="partnerLawyer">Partner's Lawyer</Label>
            <Input
              id="partnerLawyer"
              value={formData.partnerLawyer}
              onChange={(e) => updateFormData('partnerLawyer', e.target.value)}
              placeholder="Enter partner's lawyer's information"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IncomeCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {

  // Format number as currency for display
  const formatCurrency = (value: string) => {
    if (!value) return '';
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    
    // Convert to number and format with commas
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Handle currency input changes
  const handleCurrencyChange = (field: string, value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    // Store the clean numeric value
    updateFormData(field, numericValue);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Income Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userIncome">Your Annual Income</Label>
            <Input
              id="userIncome"
              type="text"
              value={formatCurrency(formData.userIncome)}
              onChange={(e) => handleCurrencyChange('userIncome', e.target.value)}
              placeholder="$75,000"
            />
          </div>
          <div>
            <Label htmlFor="partnerIncome">Partner's Annual Income</Label>
            <Input
              id="partnerIncome"
              type="text"
              value={formatCurrency(formData.partnerIncome)}
              onChange={(e) => handleCurrencyChange('partnerIncome', e.target.value)}
              placeholder="$75,000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResidenceCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Residence Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="residenceAddress">Residence Address</Label>
          <Input
            id="residenceAddress"
            value={formData.residenceAddress}
            onChange={(e) => updateFormData('residenceAddress', e.target.value)}
            placeholder="Enter your residence address"
          />
        </div>
        <div>
          <Label htmlFor="residenceOwnership">Residence Ownership</Label>
          <select
            id="residenceOwnership"
            value={formData.residenceOwnership}
            onChange={(e) => updateFormData('residenceOwnership', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select ownership type</option>
            <option value="joint">Joint ownership</option>
            <option value="user">Your property</option>
            <option value="partner">Partner's property</option>
            <option value="rental">Rental property</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Arrangements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="expenseSplitType">Expense Split Type</Label>
          <select
            id="expenseSplitType"
            value={formData.expenseSplitType}
            onChange={(e) => updateFormData('expenseSplitType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select expense split</option>
            <option value="equal">Equal split (50/50)</option>
            <option value="proportional">Proportional to income</option>
            <option value="custom">Custom arrangement</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function AdditionalInfoCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="additionalClauses">Additional Clauses</Label>
          <textarea
            id="additionalClauses"
            value={formData.additionalClauses}
            onChange={(e) => updateFormData('additionalClauses', e.target.value)}
            placeholder="Enter any additional clauses or specific terms"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <Label htmlFor="notes">Personal Notes</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            placeholder="Enter any personal notes or reminders"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ChildrenCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  const children = formData.children;

  const addChild = () => {
    const newChildren = [...children, {
      name: '',
      birthdate: undefined,
      relationship: 'biological',
      parentage: 'both'
    }];
    updateFormData('children', newChildren);
  };

  const updateChild = (index: number, field: keyof ChildInfo, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('children', updated);
  };

  const removeChild = (index: number) => {
    const newChildren = children.filter((_: any, i: number) => i !== index);
    updateFormData('children', newChildren);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Children Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No children added yet</p>
            <p className="text-sm">Click the button below to add children to your agreement</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child: ChildInfo, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Child {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeChild(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={child.name}
                      onChange={(e) => updateChild(index, 'name', e.target.value)}
                      placeholder="Child's name"
                    />
                  </div>
                  <div>
                    <Label>Birthdate (optional)</Label>
                    <Input
                      type="date"
                      value={child.birthdate || ''}
                      onChange={(e) => updateChild(index, 'birthdate', e.target.value || undefined)}
                      placeholder="Select birthdate"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Relationship</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={child.relationship}
                      onChange={(e) => updateChild(index, 'relationship', e.target.value)}
                    >
                      <option value="biological">Biological</option>
                      <option value="step">Step-child</option>
                      <option value="adopted">Adopted</option>
                    </select>
                  </div>
                  <div>
                    <Label>Parentage</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={child.parentage}
                      onChange={(e) => updateChild(index, 'parentage', e.target.value)}
                    >
                      <option value="both">Both partners</option>
                      <option value="user">Your child</option>
                      <option value="partner">Partner's child</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button
          onClick={addChild}
          variant="outline"
          className="w-full"
        >
          Add Child
        </Button>
      </CardContent>
    </Card>
  );
}

function ScheduleACard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: string | number) => {
    if (!value) return '';
    const numericValue = typeof value === 'string' ? value.replace(/[^\d.]/g, '') : value.toString();
    if (!numericValue) return '';
    
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    updateFormData(field, numericValue);
  };

  const addAssetItem = (category: string) => {
    const currentItems = formData[category] || [];
    const newItems = [...currentItems, {
      particulars: '',
      dateAcquired: '',
      estimatedValue: 0
    }];
    updateFormData(category, newItems);
  };

  const updateAssetItem = (category: string, index: number, field: string, value: any) => {
    const currentItems = formData[category] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateFormData(category, updatedItems);
  };

  const removeAssetItem = (category: string, index: number) => {
    const currentItems = formData[category] || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateFormData(category, newItems);
  };

  const addDebtItem = (category: string) => {
    const currentItems = formData[category] || [];
    const newItems = [...currentItems, {
      particulars: '',
      dateIncurred: '',
      balanceOwing: 0,
      monthlyPayment: 0
    }];
    updateFormData(category, newItems);
  };

  const updateDebtItem = (category: string, index: number, field: string, value: any) => {
    const currentItems = formData[category] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateFormData(category, updatedItems);
  };

  const removeDebtItem = (category: string, index: number) => {
    const currentItems = formData[category] || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateFormData(category, newItems);
  };

  const AssetSection = ({ title, category }: { title: string; category: string }) => {
    const items = formData[category] || [];
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addAssetItem(category)}
          >
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items added</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssetItem(category, index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Particulars</Label>
                    <Input
                      value={item.particulars}
                      onChange={(e) => updateAssetItem(category, index, 'particulars', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date Acquired</Label>
                    <Input
                      type="date"
                      value={item.dateAcquired}
                      onChange={(e) => updateAssetItem(category, index, 'dateAcquired', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Estimated Value</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.estimatedValue)}
                      onChange={(e) => updateAssetItem(category, index, 'estimatedValue', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const DebtSection = ({ title, category }: { title: string; category: string }) => {
    const items = formData[category] || [];
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addDebtItem(category)}
          >
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items added</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDebtItem(category, index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">Particulars</Label>
                    <Input
                      value={item.particulars}
                      onChange={(e) => updateDebtItem(category, index, 'particulars', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date Incurred</Label>
                    <Input
                      type="date"
                      value={item.dateIncurred}
                      onChange={(e) => updateDebtItem(category, index, 'dateIncurred', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Balance Owing</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.balanceOwing)}
                      onChange={(e) => updateDebtItem(category, index, 'balanceOwing', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly Payment</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.monthlyPayment)}
                      onChange={(e) => updateDebtItem(category, index, 'monthlyPayment', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Schedule A - Statement of Income, Assets and Liabilities
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <p className="text-sm text-gray-600">
          Complete financial disclosure required for your {formData.contractType} agreement
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-8">
          {/* A. INCOME Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A. INCOME</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleIncomeEmployment">Employment Income</Label>
                <Input
                  id="scheduleIncomeEmployment"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeEmployment)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeEmployment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeEI">Employment Insurance</Label>
                <Input
                  id="scheduleIncomeEI"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeEI)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeEI', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeWorkersComp">Workers' Compensation</Label>
                <Input
                  id="scheduleIncomeWorkersComp"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeWorkersComp)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeWorkersComp', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeInvestment">Investment Income</Label>
                <Input
                  id="scheduleIncomeInvestment"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeInvestment)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeInvestment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomePension">Pension Income</Label>
                <Input
                  id="scheduleIncomePension"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomePension)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomePension', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeGovernmentAssistance">Government Assistance</Label>
                <Input
                  id="scheduleIncomeGovernmentAssistance"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeGovernmentAssistance)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeGovernmentAssistance', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeSelfEmployment">Self-Employment Income</Label>
                <Input
                  id="scheduleIncomeSelfEmployment"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeSelfEmployment)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeSelfEmployment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleIncomeOther">Other Income</Label>
                <Input
                  id="scheduleIncomeOther"
                  type="text"
                  value={formatCurrency(formData.scheduleIncomeOther)}
                  onChange={(e) => handleCurrencyChange('scheduleIncomeOther', e.target.value)}
                  placeholder="$0"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="scheduleIncomeTotalTaxReturn">Total Income from Last Tax Return</Label>
              <Input
                id="scheduleIncomeTotalTaxReturn"
                type="text"
                value={formatCurrency(formData.scheduleIncomeTotalTaxReturn)}
                onChange={(e) => handleCurrencyChange('scheduleIncomeTotalTaxReturn', e.target.value)}
                placeholder="$0"
                className="font-semibold"
              />
            </div>
          </div>

          {/* B. ASSETS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">B. ASSETS</h3>
            <div className="space-y-6">
              <AssetSection title="Real Estate" category="scheduleAssetsRealEstate" />
              <AssetSection title="Vehicles" category="scheduleAssetsVehicles" />
              <AssetSection title="Financial Assets (Bank accounts, investments, etc.)" category="scheduleAssetsFinancial" />
              <AssetSection title="Pensions/RRSPs" category="scheduleAssetsPensions" />
              <AssetSection title="Corporate/Business Interests" category="scheduleAssetsBusiness" />
              <AssetSection title="Other Assets" category="scheduleAssetsOther" />
            </div>
          </div>

          {/* C. DEBTS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">C. DEBTS</h3>
            <div className="space-y-6">
              <DebtSection title="Secured Debts (Mortgages, car loans, etc.)" category="scheduleDebtsSecured" />
              <DebtSection title="Unsecured Debts (Credit cards, personal loans, etc.)" category="scheduleDebtsUnsecured" />
              <DebtSection title="Other Debts" category="scheduleDebtsOther" />
            </div>
          </div>

          {/* Solemn Declaration Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Solemn Declaration</h4>
            <p className="text-sm text-blue-800">
              This Schedule A requires a solemn declaration that all information provided is true and complete. 
              You will need to sign this declaration before a Commissioner for Oaths or other authorized person 
              when your agreement is finalized.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ScheduleBCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: string | number) => {
    if (!value) return '';
    const numericValue = typeof value === 'string' ? value.replace(/[^\d.]/g, '') : value.toString();
    if (!numericValue) return '';
    
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    updateFormData(field, numericValue);
  };

  const addAssetItem = (category: string) => {
    const currentItems = formData[category] || [];
    const newItems = [...currentItems, {
      particulars: '',
      dateAcquired: '',
      estimatedValue: 0
    }];
    updateFormData(category, newItems);
  };

  const updateAssetItem = (category: string, index: number, field: string, value: any) => {
    const currentItems = formData[category] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateFormData(category, updatedItems);
  };

  const removeAssetItem = (category: string, index: number) => {
    const currentItems = formData[category] || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateFormData(category, newItems);
  };

  const addDebtItem = (category: string) => {
    const currentItems = formData[category] || [];
    const newItems = [...currentItems, {
      particulars: '',
      dateIncurred: '',
      balanceOwing: 0,
      monthlyPayment: 0
    }];
    updateFormData(category, newItems);
  };

  const updateDebtItem = (category: string, index: number, field: string, value: any) => {
    const currentItems = formData[category] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateFormData(category, updatedItems);
  };

  const removeDebtItem = (category: string, index: number) => {
    const currentItems = formData[category] || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateFormData(category, newItems);
  };

  const AssetSection = ({ title, category }: { title: string; category: string }) => {
    const items = formData[category] || [];
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addAssetItem(category)}
          >
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items added</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAssetItem(category, index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Particulars</Label>
                    <Input
                      value={item.particulars}
                      onChange={(e) => updateAssetItem(category, index, 'particulars', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date Acquired</Label>
                    <Input
                      type="date"
                      value={item.dateAcquired}
                      onChange={(e) => updateAssetItem(category, index, 'dateAcquired', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Estimated Value</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.estimatedValue)}
                      onChange={(e) => updateAssetItem(category, index, 'estimatedValue', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const DebtSection = ({ title, category }: { title: string; category: string }) => {
    const items = formData[category] || [];
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addDebtItem(category)}
          >
            Add Item
          </Button>
        </div>
        
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items added</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDebtItem(category, index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">Particulars</Label>
                    <Input
                      value={item.particulars}
                      onChange={(e) => updateDebtItem(category, index, 'particulars', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date Incurred</Label>
                    <Input
                      type="date"
                      value={item.dateIncurred}
                      onChange={(e) => updateDebtItem(category, index, 'dateIncurred', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Balance Owing</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.balanceOwing)}
                      onChange={(e) => updateDebtItem(category, index, 'balanceOwing', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly Payment</Label>
                    <Input
                      type="text"
                      value={formatCurrency(item.monthlyPayment)}
                      onChange={(e) => updateDebtItem(category, index, 'monthlyPayment', e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="$0"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Schedule B - Partner's Statement of Income, Assets and Liabilities
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <p className="text-sm text-gray-600">
          Complete financial disclosure for your partner required for your {formData.contractType} agreement
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-8">
          {/* A. INCOME Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A. INCOME</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduleBIncomeEmployment">Employment Income</Label>
                <Input
                  id="scheduleBIncomeEmployment"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeEmployment)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeEmployment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeEI">Employment Insurance</Label>
                <Input
                  id="scheduleBIncomeEI"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeEI)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeEI', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeWorkersComp">Workers' Compensation</Label>
                <Input
                  id="scheduleBIncomeWorkersComp"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeWorkersComp)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeWorkersComp', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeInvestment">Investment Income</Label>
                <Input
                  id="scheduleBIncomeInvestment"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeInvestment)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeInvestment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomePension">Pension Income</Label>
                <Input
                  id="scheduleBIncomePension"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomePension)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomePension', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeGovernmentAssistance">Government Assistance</Label>
                <Input
                  id="scheduleBIncomeGovernmentAssistance"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeGovernmentAssistance)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeGovernmentAssistance', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeSelfEmployment">Self-Employment Income</Label>
                <Input
                  id="scheduleBIncomeSelfEmployment"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeSelfEmployment)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeSelfEmployment', e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="scheduleBIncomeOther">Other Income</Label>
                <Input
                  id="scheduleBIncomeOther"
                  type="text"
                  value={formatCurrency(formData.scheduleBIncomeOther)}
                  onChange={(e) => handleCurrencyChange('scheduleBIncomeOther', e.target.value)}
                  placeholder="$0"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="scheduleBIncomeTotalTaxReturn">Total Income from Last Tax Return</Label>
              <Input
                id="scheduleBIncomeTotalTaxReturn"
                type="text"
                value={formatCurrency(formData.scheduleBIncomeTotalTaxReturn)}
                onChange={(e) => handleCurrencyChange('scheduleBIncomeTotalTaxReturn', e.target.value)}
                placeholder="$0"
                className="font-semibold"
              />
            </div>
          </div>

          {/* B. ASSETS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">B. ASSETS</h3>
            <div className="space-y-6">
              <AssetSection title="Real Estate" category="scheduleBAssetsRealEstate" />
              <AssetSection title="Vehicles" category="scheduleBAssetsVehicles" />
              <AssetSection title="Financial Assets (Bank accounts, investments, etc.)" category="scheduleBAssetsFinancial" />
              <AssetSection title="Pensions/RRSPs" category="scheduleBAssetsPensions" />
              <AssetSection title="Corporate/Business Interests" category="scheduleBAssetsBusiness" />
              <AssetSection title="Other Assets" category="scheduleBAssetsOther" />
            </div>
          </div>

          {/* C. DEBTS Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">C. DEBTS</h3>
            <div className="space-y-6">
              <DebtSection title="Secured Debts (Mortgages, car loans, etc.)" category="scheduleBDebtsSecured" />
              <DebtSection title="Unsecured Debts (Credit cards, personal loans, etc.)" category="scheduleBDebtsUnsecured" />
              <DebtSection title="Other Debts" category="scheduleBDebtsOther" />
            </div>
          </div>

          {/* Solemn Declaration Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Solemn Declaration</h4>
            <p className="text-sm text-blue-800">
              This Schedule B requires a solemn declaration that all information provided is true and complete. 
              Your partner will need to sign this declaration before a Commissioner for Oaths or other authorized person 
              when your agreement is finalized.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PropertyOptionsCard({ formData, updateFormData, isReadOnly }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void;
  isReadOnly?: boolean; 
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Property Arrangement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="propertySeparationType"
                value="separate_always"
                checked={formData.propertySeparationType === 'separate_always'}
                onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isReadOnly}
              />
              <div>
                <div className="font-medium">What's mine is mine, and what's yours is yours</div>
                <div className="text-sm text-gray-600">All property remains separate throughout the relationship</div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="propertySeparationType"
                value="separate_until_marriage"
                checked={formData.propertySeparationType === 'separate_until_marriage'}
                onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isReadOnly}
              />
              <div>
                <div className="font-medium">What's mine is mine, and what's yours is yours, until our marriage date</div>
                <div className="text-sm text-gray-600">Property becomes joint after marriage</div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="propertySeparationType"
                value="separate_until_children"
                checked={formData.propertySeparationType === 'separate_until_children'}
                onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isReadOnly}
              />
              <div>
                <div className="font-medium">What's mine is mine and what's yours is yours, until we have children</div>
                <div className="text-sm text-gray-600">Property becomes joint after having children together</div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="propertySeparationType"
                value="joint_except_specific"
                checked={formData.propertySeparationType === 'joint_except_specific'}
                onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isReadOnly}
              />
              <div>
                <div className="font-medium">I'd like to protect specific asset(s) like a gift from my parents or my home</div>
                <div className="text-sm text-gray-600">Most property is joint except for specific protected assets</div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="propertySeparationType"
                value="complicated"
                checked={formData.propertySeparationType === 'complicated'}
                onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isReadOnly}
              />
              <div>
                <div className="font-medium">It's complicated</div>
                <div className="text-sm text-gray-600">I need a custom agreement with more complex arrangements</div>
              </div>
            </label>
          </div>
        </div>
        
        {formData.propertySeparationType === 'complicated' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> For complex property arrangements, consider working directly with a lawyer 
              for a fully customized agreement. Contact{' '}
              <a href="mailto:ghorvath@kahanelaw.com" className="text-orange-600 hover:underline">
                ghorvath@kahanelaw.com
              </a>{' '}
              for assistance.
            </p>
          </div>
        )}
        
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can change these property arrangement settings at any time before completing your agreement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const formatContractTypeName = (contractType: string) => {
  switch (contractType) {
    case 'cohabitation':
      return 'Cohabitation Agreement';
    case 'prenuptial':
      return 'Prenuptial Agreement';
    case 'postnuptial':
      return 'Postnuptial Agreement';
    default:
      return 'Family Agreement';
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contractType: 'cohabitation',
    propertySeparationType: '',
    spousalSupportType: '',
    userFullName: '',
    partnerFullName: '',
    userFirstName: '',
    partnerFirstName: '',
    userPronouns: '',
    partnerPronouns: '',
    userAge: '',
    partnerAge: '',
    cohabDate: '',
    proposedMarriageDate: '',
    userJobTitle: '',
    partnerJobTitle: '',
    userIncome: '',
    partnerIncome: '',
    userEmail: '',
    partnerEmail: '',
    userPhone: '',
    partnerPhone: '',
    userAddress: '',
    partnerAddress: '',
    userLawyer: '',
    partnerLawyer: '',
    residenceAddress: '',
    residenceOwnership: '',
    expenseSplitType: '',
    additionalClauses: '',
    notes: '',
    children: [] as ChildInfo[],
    // Schedule A fields
    scheduleIncomeEmployment: '',
    scheduleIncomeEI: '',
    scheduleIncomeWorkersComp: '',
    scheduleIncomeInvestment: '',
    scheduleIncomePension: '',
    scheduleIncomeGovernmentAssistance: '',
    scheduleIncomeSelfEmployment: '',
    scheduleIncomeOther: '',
    scheduleIncomeTotalTaxReturn: '',
    scheduleAssetsRealEstate: [],
    scheduleAssetsVehicles: [],
    scheduleAssetsFinancial: [],
    scheduleAssetsPensions: [],
    scheduleAssetsBusiness: [],
    scheduleAssetsOther: [],
    scheduleDebtsSecured: [],
    scheduleDebtsUnsecured: [],
    scheduleDebtsOther: [],
    // Schedule B fields (Partner's information)
    scheduleBIncomeEmployment: '',
    scheduleBIncomeEI: '',
    scheduleBIncomeWorkersComp: '',
    scheduleBIncomeInvestment: '',
    scheduleBIncomePension: '',
    scheduleBIncomeGovernmentAssistance: '',
    scheduleBIncomeSelfEmployment: '',
    scheduleBIncomeOther: '',
    scheduleBIncomeTotalTaxReturn: '',
    scheduleBAssetsRealEstate: [],
    scheduleBAssetsVehicles: [],
    scheduleBAssetsFinancial: [],
    scheduleBAssetsPensions: [],
    scheduleBAssetsBusiness: [],
    scheduleBAssetsOther: [],
    scheduleBDebtsSecured: [],
    scheduleBDebtsUnsecured: [],
    scheduleBDebtsOther: []
  });

  const [saveState, setSaveState] = useState<ActionState>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved contract data
  const { data: contractData, error: contractError } = useSWR('/api/contract', fetcher);
  
  // Load first contract for testing purposes
  const { data: allContractsData } = useSWR('/api/contracts', fetcher);
  
  // Get the first contract for testing when no current contract exists
  const firstContract = allContractsData?.contracts?.[0];
  const isUsingTestData = !contractData?.contract && firstContract;
  
  // Check if current contract is paid and thus locked
  const isContractPaid = contractData?.contract?.isPaid === 'true';

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Load saved data into form when component mounts or data changes
  useEffect(() => {
    // Use current contract if it exists, otherwise use first contract for testing
    const contract = contractData?.contract || firstContract;
    
    if (contract) {
      setFormData({
        contractType: contract.contractType || 'cohabitation',
        propertySeparationType: contract.propertySeparationType || '',
        spousalSupportType: contract.spousalSupportType || '',
        userFullName: contract.userFullName || '',
        partnerFullName: contract.partnerFullName || '',
        userFirstName: contract.userFirstName || '',
        partnerFirstName: contract.partnerFirstName || '',
        userPronouns: contract.userPronouns || '',
        partnerPronouns: contract.partnerPronouns || '',
        userAge: contract.userAge?.toString() || '',
        partnerAge: contract.partnerAge?.toString() || '',
        cohabDate: formatDateForInput(contract.cohabDate),
        proposedMarriageDate: formatDateForInput(contract.proposedMarriageDate),
        userJobTitle: contract.userJobTitle || '',
        partnerJobTitle: contract.partnerJobTitle || '',
        userIncome: contract.userIncome || '',
        partnerIncome: contract.partnerIncome || '',
        userEmail: contract.userEmail || '',
        partnerEmail: contract.partnerEmail || '',
        userPhone: contract.userPhone || '',
        partnerPhone: contract.partnerPhone || '',
        userAddress: contract.userAddress || '',
        partnerAddress: contract.partnerAddress || '',
        userLawyer: contract.userLawyer || '',
        partnerLawyer: contract.partnerLawyer || '',
        residenceAddress: contract.residenceAddress || '',
        residenceOwnership: contract.residenceOwnership || '',
        expenseSplitType: contract.expenseSplitType || '',
        additionalClauses: contract.additionalClauses || '',
        notes: contract.notes || '',
        children: contract.children || [],
        // Schedule A fields
        scheduleIncomeEmployment: contract.scheduleIncomeEmployment || '',
        scheduleIncomeEI: contract.scheduleIncomeEI || '',
        scheduleIncomeWorkersComp: contract.scheduleIncomeWorkersComp || '',
        scheduleIncomeInvestment: contract.scheduleIncomeInvestment || '',
        scheduleIncomePension: contract.scheduleIncomePension || '',
        scheduleIncomeGovernmentAssistance: contract.scheduleIncomeGovernmentAssistance || '',
        scheduleIncomeSelfEmployment: contract.scheduleIncomeSelfEmployment || '',
        scheduleIncomeOther: contract.scheduleIncomeOther || '',
        scheduleIncomeTotalTaxReturn: contract.scheduleIncomeTotalTaxReturn || '',
        scheduleAssetsRealEstate: contract.scheduleAssetsRealEstate || [],
        scheduleAssetsVehicles: contract.scheduleAssetsVehicles || [],
        scheduleAssetsFinancial: contract.scheduleAssetsFinancial || [],
        scheduleAssetsPensions: contract.scheduleAssetsPensions || [],
        scheduleAssetsBusiness: contract.scheduleAssetsBusiness || [],
        scheduleAssetsOther: contract.scheduleAssetsOther || [],
        scheduleDebtsSecured: contract.scheduleDebtsSecured || [],
        scheduleDebtsUnsecured: contract.scheduleDebtsUnsecured || [],
        scheduleDebtsOther: contract.scheduleDebtsOther || [],
        // Schedule B fields (Partner's information)
        scheduleBIncomeEmployment: contract.scheduleBIncomeEmployment || '',
        scheduleBIncomeEI: contract.scheduleBIncomeEI || '',
        scheduleBIncomeWorkersComp: contract.scheduleBIncomeWorkersComp || '',
        scheduleBIncomeInvestment: contract.scheduleBIncomeInvestment || '',
        scheduleBIncomePension: contract.scheduleBIncomePension || '',
        scheduleBIncomeGovernmentAssistance: contract.scheduleBIncomeGovernmentAssistance || '',
        scheduleBIncomeSelfEmployment: contract.scheduleBIncomeSelfEmployment || '',
        scheduleBIncomeOther: contract.scheduleBIncomeOther || '',
        scheduleBIncomeTotalTaxReturn: contract.scheduleBIncomeTotalTaxReturn || '',
        scheduleBAssetsRealEstate: contract.scheduleBAssetsRealEstate || [],
        scheduleBAssetsVehicles: contract.scheduleBAssetsVehicles || [],
        scheduleBAssetsFinancial: contract.scheduleBAssetsFinancial || [],
        scheduleBAssetsPensions: contract.scheduleBAssetsPensions || [],
        scheduleBAssetsBusiness: contract.scheduleBAssetsBusiness || [],
        scheduleBAssetsOther: contract.scheduleBAssetsOther || [],
        scheduleBDebtsSecured: contract.scheduleBDebtsSecured || [],
        scheduleBDebtsUnsecured: contract.scheduleBDebtsUnsecured || [],
        scheduleBDebtsOther: contract.scheduleBDebtsOther || []
      });
    }
  }, [contractData, firstContract]);

  const handleSave = async () => {
    // Allow saving of paid contracts (only party names are restricted via form fields)

    setIsSaving(true);
    setSaveState({});

    try {
      // If there's an existing contract, update it, otherwise the API will create a new one
      const contractId = contractData?.contract?.id;
      
      if (contractId) {
        // Update existing current contract
        const response = await fetch(`/api/contracts/${contractId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSaveState({ success: 'Contract saved successfully!' });
          
          // Check if there's a pending step navigation
          const pendingStep = sessionStorage.getItem('pendingStepNavigation');
          if (pendingStep) {
            sessionStorage.removeItem('pendingStepNavigation');
            // Redirect to the intended step after a short delay
            setTimeout(() => {
              switch (pendingStep) {
                case 'preview':
                  router.push(`/dashboard/contracts/${contractId}/preview`);
                  break;
                case 'purchase':
                  router.push(`/dashboard/contracts/${contractId}/preview#purchase`);
                  break;
                case 'download':
                  router.push(`/dashboard/contracts/${contractId}/download`);
                  break;
              }
            }, 1000);
          } else {
            // Refresh the contract data
            window.location.reload();
          }
        } else {
          const errorData = await response.json();
          setSaveState({ error: errorData.error || 'Failed to save contract' });
        }
      } else {
        // Create new contract via the contracts API
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            children: formData.children || []
          }),
        });

        if (response.ok) {
          const { contract } = await response.json();
          // Set the new contract as current
          await fetch(`/api/contracts/${contract.id}/set-current`, {
            method: 'POST',
          });
          setSaveState({ success: 'Contract created and saved successfully!' });
          
          // Check if there's a pending step navigation
          const pendingStep = sessionStorage.getItem('pendingStepNavigation');
          if (pendingStep) {
            sessionStorage.removeItem('pendingStepNavigation');
            // Redirect to the intended step after a short delay
            setTimeout(() => {
              switch (pendingStep) {
                case 'preview':
                  router.push(`/dashboard/contracts/${contract.id}/preview`);
                  break;
                case 'purchase':
                  router.push(`/dashboard/contracts/${contract.id}/preview#purchase`);
                  break;
                case 'download':
                  router.push(`/dashboard/contracts/${contract.id}/download`);
                  break;
              }
            }, 1000);
          } else {
            // Refresh the page to load the new contract
            window.location.reload();
          }
        } else {
          const errorData = await response.json();
          setSaveState({ error: errorData.error || 'Failed to create contract' });
        }
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      setSaveState({ error: 'Failed to save contract. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };


  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const populateTestData = () => {
    // Basic information
    updateFormData('userFullName', 'David Kim');
    updateFormData('partnerFullName', 'Emma Rodriguez');
    updateFormData('userFirstName', 'David');
    updateFormData('partnerFirstName', 'Emma');
    updateFormData('userPronouns', 'he/him');
    updateFormData('partnerPronouns', 'she/her');
    updateFormData('userAge', '32');
    updateFormData('partnerAge', '29');
    updateFormData('cohabDate', '2023-06-15');
    updateFormData('proposedMarriageDate', '2024-08-20');
    updateFormData('userJobTitle', 'Software Engineer');
    updateFormData('partnerJobTitle', 'Marketing Manager');
    updateFormData('userIncome', '95000');
    updateFormData('partnerIncome', '72000');
    updateFormData('userEmail', 'david.kim@email.com');
    updateFormData('partnerEmail', 'emma.rodriguez@email.com');
    updateFormData('userPhone', '403-555-0123');
    updateFormData('partnerPhone', '403-555-0456');
    updateFormData('userAddress', '123 Main St, Calgary, AB T2P 1A1');
    updateFormData('partnerAddress', '456 Oak Ave, Calgary, AB T2P 2B2');
    updateFormData('residenceAddress', '789 Pine St, Calgary, AB T2P 3C3');
    updateFormData('residenceOwnership', 'joint');
    updateFormData('expenseSplitType', 'proportional');
    updateFormData('propertySeparationType', 'separate');
    updateFormData('spousalSupportType', 'waive');

    // Children
    updateFormData('children', [
      {
        name: 'Sophie Kim',
        birthdate: '2015-03-10',
        relationship: 'biological',
        parentage: 'user'
      },
      {
        name: 'Max Rodriguez',
        birthdate: '2017-11-22',
        relationship: 'biological', 
        parentage: 'partner'
      }
    ]);

    // Schedule income
    updateFormData('scheduleIncomeEmployment', '95000');
    updateFormData('scheduleIncomeInvestment', '5000');
    updateFormData('scheduleIncomeTotalTaxReturn', '100000');

    // Additional clauses
    updateFormData('additionalClauses', 'Both parties agree to review this agreement annually and make adjustments as necessary.');
    updateFormData('notes', 'Test data populated for development and testing purposes.');
  };


  // Show loading state while fetching contract data
  if ((!contractData && !contractError) || (!allContractsData && !contractData)) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading your contract...</span>
          </div>
        </div>
      </section>
    );
  }

  // Redirect to get-started if no contract exists and no test data available
  if (contractData && !contractData.contract && !firstContract) {
    router.push('/dashboard/get-started');
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Redirecting to get started...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create Your {formatContractTypeName(formData.contractType)}</h1>
              <p className="text-gray-600">
                Let's gather some basic information to create your personalized family contract.
              </p>
            </div>
            <Button
              onClick={populateTestData}
              variant="outline"
              className="shrink-0 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Fill Test Data
            </Button>
          </div>
          {isUsingTestData && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <strong>Note: This is test data</strong> - The form has been pre-filled with data from your first contract for testing purposes.
              </p>
            </div>
          )}
          {contractData?.contract && !isContractPaid && (contractData.contract.userFullName || contractData.contract.partnerFullName || contractData.contract.userEmail) && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your previously saved contract data has been loaded.
              </p>
            </div>
          )}
          {isContractPaid && (
            <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 flex items-center font-medium">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                🔒 This contract is locked because payment has been completed. No changes can be made.
              </p>
            </div>
          )}
        </div>
        
        {/* Privacy Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-0">
            <div className="flex items-start space-x-2 p-4">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p className="mb-1">
                  We collect and store your personal information solely to create your personalized family agreement.
                </p>
                <p>
                  By continuing, you consent to our collection and use of this information. You can withdraw consent at any time. 
                  Learn more in our <Link href="/privacy" className="underline hover:text-blue-900">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto space-y-6">
          <PersonalInfoCard formData={formData} updateFormData={updateFormData} isContractPaid={isContractPaid} />
          
          <PropertyOptionsCard formData={formData} updateFormData={updateFormData} isReadOnly={false} />
          
          <SpousalSupportSelector 
            value={formData.spousalSupportType} 
            onChange={(value) => updateFormData('spousalSupportType', value)} 
          />
          
          {/* Relationship Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Relationship Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cohabDate">Date Started Living Together</Label>
                <Input
                  id="cohabDate"
                  type="date"
                  value={formData.cohabDate}
                  onChange={(e) => updateFormData('cohabDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="proposedMarriageDate">Proposed Marriage Date (Optional)</Label>
                <Input
                  id="proposedMarriageDate"
                  type="date"
                  value={formData.proposedMarriageDate}
                  onChange={(e) => updateFormData('proposedMarriageDate', e.target.value)}
                  placeholder="Select your proposed marriage date"
                />
              </div>
            </CardContent>
          </Card>
          
          <IncomeCard formData={formData} updateFormData={updateFormData} />
          <ResidenceCard formData={formData} updateFormData={updateFormData} />
          <FinancialCard formData={formData} updateFormData={updateFormData} />
          <ChildrenCard formData={formData} updateFormData={updateFormData} />
          <ScheduleACard formData={formData} updateFormData={updateFormData} />
          <ScheduleBCard formData={formData} updateFormData={updateFormData} />
          <AdditionalInfoCard formData={formData} updateFormData={updateFormData} />
          
          {/* Save Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || isContractPaid}
                  className={`flex-1 ${isContractPaid ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  title={isContractPaid ? 'Contract is locked after payment' : ''}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isContractPaid ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Contract Locked (Paid)
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Progress
                    </>
                  )}
                </Button>
              </div>
              {saveState?.success && (
                <p className="text-green-600 text-sm mt-2">{saveState.success}</p>
              )}
              {saveState?.error && (
                <p className="text-red-600 text-sm mt-2">{saveState.error}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
