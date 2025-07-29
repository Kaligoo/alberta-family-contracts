'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Users, DollarSign, Home, Save } from 'lucide-react';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChildInfo {
  name: string;
  age?: number;
  relationship: 'biological' | 'step' | 'adopted';
  parentage: 'user' | 'partner' | 'both';
}

function PersonalInfoCard({ formData, updateFormData, isReadOnly }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void;
  isReadOnly?: boolean; 
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
              readOnly={isReadOnly}
              className={isReadOnly ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <Label htmlFor="partnerFullName">Partner's Full Name</Label>
            <Input
              id="partnerFullName"
              value={formData.partnerFullName}
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
              type="number"
              value={formData.userIncome}
              onChange={(e) => updateFormData('userIncome', e.target.value)}
              placeholder="Enter annual income"
            />
          </div>
          <div>
            <Label htmlFor="partnerIncome">Partner's Annual Income</Label>
            <Input
              id="partnerIncome"
              type="number"
              value={formData.partnerIncome}
              onChange={(e) => updateFormData('partnerIncome', e.target.value)}
              placeholder="Enter partner's annual income"
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
      age: undefined,
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
                    <Label>Age (optional)</Label>
                    <Input
                      type="number"
                      value={child.age || ''}
                      onChange={(e) => updateChild(index, 'age', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Age"
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



export default function DashboardPage() {
  const [formData, setFormData] = useState({
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
    children: [] as ChildInfo[]
  });

  const [saveState, setSaveState] = useState<ActionState>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved contract data
  const { data: contractData, error: contractError } = useSWR('/api/contract', fetcher);
  
  // Check if current contract is paid and thus locked
  const isContractPaid = contractData?.contract?.isPaid === 'true';

  // Load saved data into form when component mounts or data changes
  useEffect(() => {
    if (contractData?.contract) {
      const contract = contractData.contract;
      setFormData({
        userFullName: contract.userFullName || '',
        partnerFullName: contract.partnerFullName || '',
        userFirstName: contract.userFirstName || '',
        partnerFirstName: contract.partnerFirstName || '',
        userPronouns: contract.userPronouns || '',
        partnerPronouns: contract.partnerPronouns || '',
        userAge: contract.userAge?.toString() || '',
        partnerAge: contract.partnerAge?.toString() || '',
        cohabDate: contract.cohabDate || '',
        proposedMarriageDate: contract.proposedMarriageDate || '',
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
        children: contract.children || []
      });
    }
  }, [contractData]);

  const handleSave = async () => {
    // Prevent saving if contract is paid
    if (isContractPaid) {
      setSaveState({ error: 'Cannot edit contract after payment. Contract is locked.' });
      return;
    }

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
          // Refresh the contract data
          window.location.reload();
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
          // Refresh the page to load the new contract
          window.location.reload();
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


  // Show loading state while fetching contract data
  if (!contractData && !contractError) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Loading your contract...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create Your Cohabitation Agreement</h1>
          <p className="text-gray-600">
            Let's gather some basic information to create your personalized family contract.
          </p>
          {contractData?.contract && !isContractPaid && (
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
        
        <div className="max-w-4xl mx-auto space-y-6">
          <PersonalInfoCard formData={formData} updateFormData={updateFormData} isReadOnly={isContractPaid} />
          
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
