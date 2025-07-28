'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contract {
  id: number;
  userFullName: string;
  partnerFullName: string;
  userFirstName: string;
  partnerFirstName: string;
  userAge: number;
  partnerAge: number;
  cohabDate: string;
  userJobTitle: string;
  partnerJobTitle: string;
  userIncome: string;
  partnerIncome: string;
  userEmail: string;
  partnerEmail: string;
  userPhone: string;
  partnerPhone: string;
  userAddress: string;
  partnerAddress: string;
  children: Array<{
    name: string;
    age?: number;
    relationship: 'biological' | 'step' | 'adopted';
    parentage: 'user' | 'partner' | 'both';
  }>;
  contractType: string;
  status: string;
  residenceAddress: string;
  residenceOwnership: string;
  expenseSplitType: string;
  additionalClauses: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  
  const { data: contractData, error, mutate } = useSWR(
    `/api/contracts/${contractId}`,
    fetcher
  );

  const [formData, setFormData] = useState<Partial<Contract>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const contract: Contract = contractData?.contract;

  useEffect(() => {
    if (contract) {
      setFormData({
        userFullName: contract.userFullName || '',
        partnerFullName: contract.partnerFullName || '',
        userFirstName: contract.userFirstName || '',
        partnerFirstName: contract.partnerFirstName || '',
        userAge: contract.userAge?.toString() || '',
        partnerAge: contract.partnerAge?.toString() || '',
        cohabDate: contract.cohabDate || '',
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
        residenceAddress: contract.residenceAddress || '',
        residenceOwnership: contract.residenceOwnership || '',
        expenseSplitType: contract.expenseSplitType || '',
        additionalClauses: contract.additionalClauses || '',
        notes: contract.notes || '',
      });
    }
  }, [contract]);

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        mutate(); // Refresh the contract data
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || 'Failed to save contract');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      setSaveError('Failed to save contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load contract. Please try again.</p>
              <Link href="/dashboard/contracts" className="inline-block mt-4">
                <Button variant="outline">Back to Contracts</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!contractData) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading contract...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/contracts" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {contract.userFullName && contract.partnerFullName
                  ? `${contract.userFullName} & ${contract.partnerFullName}`
                  : 'Edit Contract'}
              </h1>
              <p className="text-gray-600">
                Edit your cohabitation agreement details.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/contracts/${contractId}/preview`}>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Progress
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {(saveError || saveSuccess) && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveSuccess 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={saveSuccess ? 'text-green-600' : 'text-red-600'}>
              {saveSuccess ? 'Contract saved successfully!' : saveError}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userFullName">Your Full Name</Label>
                  <Input
                    id="userFullName"
                    value={formData.userFullName || ''}
                    onChange={(e) => updateFormData('userFullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerFullName">Partner's Full Name</Label>
                  <Input
                    id="partnerFullName"
                    value={formData.partnerFullName || ''}
                    onChange={(e) => updateFormData('partnerFullName', e.target.value)}
                    placeholder="Enter partner's full name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userFirstName">Your First Name</Label>
                  <Input
                    id="userFirstName"
                    value={formData.userFirstName || ''}
                    onChange={(e) => updateFormData('userFirstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerFirstName">Partner's First Name</Label>
                  <Input
                    id="partnerFirstName"
                    value={formData.partnerFirstName || ''}
                    onChange={(e) => updateFormData('partnerFirstName', e.target.value)}
                    placeholder="Enter partner's first name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="userAge">Your Age</Label>
                  <Input
                    id="userAge"
                    type="number"
                    min="18"
                    max="120"
                    value={formData.userAge || ''}
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
                    value={formData.partnerAge || ''}
                    onChange={(e) => updateFormData('partnerAge', e.target.value)}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label htmlFor="cohabDate">Date Started Living Together</Label>
                  <Input
                    id="cohabDate"
                    type="date"
                    value={formData.cohabDate ? new Date(formData.cohabDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormData('cohabDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userJobTitle">Your Job Title</Label>
                  <Input
                    id="userJobTitle"
                    value={formData.userJobTitle || ''}
                    onChange={(e) => updateFormData('userJobTitle', e.target.value)}
                    placeholder="Enter your job title"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerJobTitle">Partner's Job Title</Label>
                  <Input
                    id="partnerJobTitle"
                    value={formData.partnerJobTitle || ''}
                    onChange={(e) => updateFormData('partnerJobTitle', e.target.value)}
                    placeholder="Enter partner's job title"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userIncome">Your Annual Income</Label>
                  <Input
                    id="userIncome"
                    type="number"
                    value={formData.userIncome || ''}
                    onChange={(e) => updateFormData('userIncome', e.target.value)}
                    placeholder="Enter annual income"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerIncome">Partner's Annual Income</Label>
                  <Input
                    id="partnerIncome"
                    type="number"
                    value={formData.partnerIncome || ''}
                    onChange={(e) => updateFormData('partnerIncome', e.target.value)}
                    placeholder="Enter partner's annual income"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userEmail">Your Email Address</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail || ''}
                    onChange={(e) => updateFormData('userEmail', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerEmail">Partner's Email Address</Label>
                  <Input
                    id="partnerEmail"
                    type="email"
                    value={formData.partnerEmail || ''}
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
                    value={formData.userPhone || ''}
                    onChange={(e) => updateFormData('userPhone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerPhone">Partner's Phone Number</Label>
                  <Input
                    id="partnerPhone"
                    type="tel"
                    value={formData.partnerPhone || ''}
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
                    value={formData.userAddress || ''}
                    onChange={(e) => updateFormData('userAddress', e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerAddress">Partner's Address</Label>
                  <Input
                    id="partnerAddress"
                    value={formData.partnerAddress || ''}
                    onChange={(e) => updateFormData('partnerAddress', e.target.value)}
                    placeholder="Enter partner's address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Residence Information */}
          <Card>
            <CardHeader>
              <CardTitle>Residence Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="residenceAddress">Residence Address</Label>
                <Input
                  id="residenceAddress"
                  value={formData.residenceAddress || ''}
                  onChange={(e) => updateFormData('residenceAddress', e.target.value)}
                  placeholder="Enter your residence address"
                />
              </div>
              <div>
                <Label htmlFor="residenceOwnership">Residence Ownership</Label>
                <select
                  id="residenceOwnership"
                  value={formData.residenceOwnership || ''}
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

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Arrangements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expenseSplitType">Expense Split Type</Label>
                <select
                  id="expenseSplitType"
                  value={formData.expenseSplitType || ''}
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

          {/* Children Information */}
          <Card>
            <CardHeader>
              <CardTitle>Children Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!contract.children || contract.children.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No children added yet</p>
                  <p className="text-sm">Click the button below to add children to your agreement</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contract.children.map((child: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Child {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newChildren = contract.children.filter((_: any, i: number) => i !== index);
                            updateFormData('children', newChildren);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={child.name || ''}
                            onChange={(e) => {
                              const updated = [...(contract.children || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              updateFormData('children', updated);
                            }}
                            placeholder="Child's name"
                          />
                        </div>
                        <div>
                          <Label>Age (optional)</Label>
                          <Input
                            type="number"
                            value={child.age || ''}
                            onChange={(e) => {
                              const updated = [...(contract.children || [])];
                              updated[index] = { ...updated[index], age: e.target.value ? parseInt(e.target.value) : undefined };
                              updateFormData('children', updated);
                            }}
                            placeholder="Age"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Relationship</Label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={child.relationship || 'biological'}
                            onChange={(e) => {
                              const updated = [...(contract.children || [])];
                              updated[index] = { ...updated[index], relationship: e.target.value };
                              updateFormData('children', updated);
                            }}
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
                            value={child.parentage || 'both'}
                            onChange={(e) => {
                              const updated = [...(contract.children || [])];
                              updated[index] = { ...updated[index], parentage: e.target.value };
                              updateFormData('children', updated);
                            }}
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
                onClick={() => {
                  const newChild = {
                    name: '',
                    age: undefined,
                    relationship: 'biological',
                    parentage: 'both'
                  };
                  const newChildren = [...(contract.children || []), newChild];
                  updateFormData('children', newChildren);
                }}
                variant="outline"
                className="w-full"
              >
                Add Child
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="additionalClauses">Additional Clauses</Label>
                <textarea
                  id="additionalClauses"
                  value={formData.additionalClauses || ''}
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
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Enter any personal notes or reminders"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/dashboard/contracts" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Contracts
            </Button>
          </Link>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Progress
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}