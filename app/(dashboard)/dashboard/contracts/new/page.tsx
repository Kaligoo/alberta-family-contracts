'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/ui/step-indicator';

export default function NewContractPage() {
  const [formData, setFormData] = useState({
    contractType: 'cohabitation',
    propertySeparationType: '',
    userFullName: '',
    partnerFullName: '',
    userFirstName: '',
    partnerFirstName: '',
    userAge: '',
    partnerAge: '',
    cohabDate: '',
    userJobTitle: '',
    partnerJobTitle: '',
    userIncome: '',
    partnerIncome: '',
  });
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If user selected "complicated", redirect to explanation page
    if (formData.propertySeparationType === 'complicated') {
      router.push('/dashboard/contracts/complicated');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            children: []
          }),
        });

        if (response.ok) {
          const { contract } = await response.json();
          router.push(`/dashboard/contracts/${contract.id}`);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to create contract');
        }
      } catch (error) {
        console.error('Error creating contract:', error);
        setError('Failed to create contract. Please try again.');
      }
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/contracts" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
          
          {/* Step Indicator */}
          <StepIndicator
            steps={[
              { id: 'edit', name: 'Fill Out Form' },
              { id: 'preview', name: 'Preview Contract' },
              { id: 'purchase', name: 'Purchase & Download' },
            ]}
            currentStep="edit"
            completedSteps={[]}
          />
          
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Step 1: Create New Agreement</h1>
          <p className="text-gray-600">
            Start a new family agreement by selecting the type and providing basic information.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contract Type & Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-6">
                <Label htmlFor="contractType">Agreement Type *</Label>
                <select
                  id="contractType"
                  value={formData.contractType}
                  onChange={(e) => updateFormData('contractType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cohabitation">Cohabitation Agreement</option>
                  <option value="prenuptial">Prenuptial Agreement</option>
                  <option value="postnuptial">Postnuptial Agreement</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.contractType === 'cohabitation' && 'Legal agreement for unmarried couples living together'}
                  {formData.contractType === 'prenuptial' && 'Legal agreement made before marriage'}
                  {formData.contractType === 'postnuptial' && 'Legal agreement made after marriage'}
                </p>
              </div>

              {/* Property Separation Options */}
              <div className="mb-6">
                <Label htmlFor="propertySeparationType">Property Arrangement *</Label>
                <div className="mt-2 space-y-3">
                  <div className="space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="propertySeparationType"
                        value="separate_always"
                        checked={formData.propertySeparationType === 'separate_always'}
                        onChange={(e) => updateFormData('propertySeparationType', e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
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
                      />
                      <div>
                        <div className="font-medium">It's complicated</div>
                        <div className="text-sm text-gray-600">I need a custom agreement with more complex arrangements</div>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This information can be changed later during the contract editing process.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userFullName">Your Full Name *</Label>
                  <Input
                    id="userFullName"
                    value={formData.userFullName}
                    onChange={(e) => updateFormData('userFullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partnerFullName">Partner's Full Name *</Label>
                  <Input
                    id="partnerFullName"
                    value={formData.partnerFullName}
                    onChange={(e) => updateFormData('partnerFullName', e.target.value)}
                    placeholder="Enter partner's full name"
                    required
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Relationship Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cohabDate">
                  {formData.contractType === 'cohabitation' && 'Date Started Living Together'}
                  {formData.contractType === 'prenuptial' && 'Proposed Marriage Date'}
                  {formData.contractType === 'postnuptial' && 'Marriage Date'}
                </Label>
                <Input
                  id="cohabDate"
                  type="date"
                  value={formData.cohabDate}
                  onChange={(e) => updateFormData('cohabDate', e.target.value)}
                  placeholder={
                    formData.contractType === 'cohabitation' ? 'When did you start living together?' :
                    formData.contractType === 'prenuptial' ? 'When do you plan to marry?' :
                    'When did you get married?'
                  }
                />
              </div>
            </CardContent>
          </Card>

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

          <div className="flex gap-4">
            <Link href="/dashboard/contracts" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isPending || !formData.userFullName || !formData.partnerFullName}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Contract'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You can add more details like children and specific clauses after creating the agreement.</p>
        </div>
      </div>
    </section>
  );
}