'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useActionState, useState, useTransition, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Users, DollarSign, Home, Save } from 'lucide-react';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { saveFamilyContract } from '@/app/(login)/actions';

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

function PersonalInfoCard({ formData, updateFormData }: { 
  formData: any; 
  updateFormData: (field: string, value: any) => void; 
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

function ContractPreview({ onGeneratePreview, formData }: { 
  onGeneratePreview: () => void; 
  formData: any; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Your Cohabitation Agreement Will Include:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Personal information and financial details
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Property ownership and division terms
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Financial responsibilities and expense sharing
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Children and custody arrangements
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Termination and separation procedures
            </li>
          </ul>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Professional Legal Document</span>
            <span className="text-2xl font-bold text-orange-600">$700</span>
          </div>
          
          <Button 
            onClick={onGeneratePreview}
            className="w-full bg-orange-500 hover:bg-orange-600" 
            size="lg"
            disabled={!formData.userFullName || !formData.partnerFullName}
          >
            Generate Your Agreement Preview
          </Button>
          
          <p className="text-sm text-gray-500 text-center mt-2">
            Review your complete agreement before purchasing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractPreviewDocument({ formData, onClose }: { 
  formData: any; 
  onClose: () => void; 
}) {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handlePayment = async () => {
    console.log('🎉 Dashboard payment button clicked!');
    alert('🎉 DASHBOARD PAYMENT BUTTON CLICKED! About to process payment...');
    setIsPaymentLoading(true);
    setPaymentError('');

    try {
      console.log('Making payment request with form data...');
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Payment response status:', response.status);
      const data = await response.json();
      console.log('Payment response data:', data);

      if (response.ok && data.checkout_url) {
        console.log('Redirecting to Stripe checkout:', data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        console.error('Payment error:', data);
        setPaymentError(data.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Failed to initiate payment. Please try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agreement Preview</h1>
          <Button onClick={onClose} variant="outline">
            ← Back to Edit
          </Button>
        </div>
        
        <div className="bg-white border rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold mb-2">COHABITATION AGREEMENT</h1>
            <p className="text-gray-600">Province of Alberta, Canada</p>
            <p className="text-sm text-gray-500 mt-2">Date: {currentDate}</p>
          </div>

          {/* Parties */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">PARTIES TO THIS AGREEMENT</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Party 1:</h3>
                <p><strong>Name:</strong> {formData.userFullName || '[Your Name]'}</p>
                {formData.userJobTitle && <p><strong>Occupation:</strong> {formData.userJobTitle}</p>}
                {formData.userIncome && <p><strong>Annual Income:</strong> ${parseInt(formData.userIncome).toLocaleString()}</p>}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Party 2:</h3>
                <p><strong>Name:</strong> {formData.partnerFullName || '[Partner Name]'}</p>
                {formData.partnerJobTitle && <p><strong>Occupation:</strong> {formData.partnerJobTitle}</p>}
                {formData.partnerIncome && <p><strong>Annual Income:</strong> ${parseInt(formData.partnerIncome).toLocaleString()}</p>}
              </div>
            </div>
          </div>

          {/* Children Section */}
          {formData.children && formData.children.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">CHILDREN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.children.map((child: ChildInfo, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <p><strong>Name:</strong> {child.name}</p>
                    {child.age && <p><strong>Age:</strong> {child.age}</p>}
                    <p><strong>Relationship:</strong> {child.relationship}</p>
                    <p><strong>Child of:</strong> {
                      child.parentage === 'both' ? 'Both parties' :
                      child.parentage === 'user' ? formData.userFullName :
                      formData.partnerFullName
                    }</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreement Terms Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">AGREEMENT TERMS</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p><strong>1. Property Rights:</strong> Each party shall retain ownership of property acquired before cohabitation and property acquired individually during cohabitation.</p>
              
              <p><strong>2. Joint Property:</strong> Property purchased jointly during cohabitation shall be owned equally by both parties unless otherwise specified.</p>
              
              <p><strong>3. Financial Responsibilities:</strong> Living expenses shall be shared proportionally based on income levels as disclosed in this agreement.</p>
              
              <p><strong>4. Support Obligations:</strong> Neither party shall be obligated to provide spousal support to the other upon termination of cohabitation.</p>
              
              {formData.children && formData.children.length > 0 && (
                <p><strong>5. Child Support:</strong> Child support obligations shall be determined according to the Alberta Child Support Guidelines.</p>
              )}
              
              <p><strong>6. Termination:</strong> This agreement may be terminated by either party with 30 days written notice.</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold">SIGNATURES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="border-b border-gray-400 pb-1">
                  <p className="text-sm text-gray-600 mb-8">Signature</p>
                </div>
                <p className="font-medium">{formData.userFullName}</p>
                <div className="border-b border-gray-400 pb-1">
                  <p className="text-sm text-gray-600 mb-8">Date</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-400 pb-1">
                  <p className="text-sm text-gray-600 mb-8">Signature</p>
                </div>
                <p className="font-medium">{formData.partnerFullName}</p>
                <div className="border-b border-gray-400 pb-1">
                  <p className="text-sm text-gray-600 mb-8">Date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
            <p className="font-medium text-yellow-800 mb-2">Legal Notice:</p>
            <p className="text-yellow-700">
              This is a preview of your cohabitation agreement. The final document will include additional 
              legal clauses and should be reviewed by independent legal counsel before signing.
            </p>
          </div>

          {/* Purchase Section */}
          <div className="bg-orange-50 border border-orange-200 rounded p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Purchase?</h3>
            <p className="text-gray-600 mb-4">Get your complete, legally formatted agreement for $700</p>
            <p className="text-xs text-gray-500 mb-2">🔧 Debug: Dashboard Preview Payment Button</p>
            <Button 
              onClick={handlePayment}
              disabled={isPaymentLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2"
              style={{ border: '3px solid blue' }} // Make it obvious this is the dashboard button
            >
              {isPaymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Purchase Complete Agreement'
              )}
            </Button>
            {paymentError && (
              <p className="text-red-600 text-sm mt-2">{paymentError}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Secure payment via Stripe</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [formData, setFormData] = useState({
    userFullName: '',
    partnerFullName: '',
    userJobTitle: '',
    partnerJobTitle: '',
    userIncome: '',
    partnerIncome: '',
    children: [] as ChildInfo[]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [saveState, saveAction, isSaving] = useActionState<ActionState, FormData>(saveFamilyContract, {});
  const [isPending, startTransition] = useTransition();
  
  // Load saved contract data
  const { data: contractData, error: contractError } = useSWR('/api/contract', fetcher);

  // Load saved data into form when component mounts or data changes
  useEffect(() => {
    if (contractData?.contract) {
      const contract = contractData.contract;
      setFormData({
        userFullName: contract.userFullName || '',
        partnerFullName: contract.partnerFullName || '',
        userJobTitle: contract.userJobTitle || '',
        partnerJobTitle: contract.partnerJobTitle || '',
        userIncome: contract.userIncome || '',
        partnerIncome: contract.partnerIncome || '',
        children: contract.children || []
      });
    }
  }, [contractData]);

  const handleSave = () => {
    const form = new FormData();
    form.append('userFullName', formData.userFullName);
    form.append('partnerFullName', formData.partnerFullName);
    form.append('userJobTitle', formData.userJobTitle);
    form.append('partnerJobTitle', formData.partnerJobTitle);
    form.append('userIncome', formData.userIncome);
    form.append('partnerIncome', formData.partnerIncome);
    form.append('children', JSON.stringify(formData.children));
    
    startTransition(() => {
      saveAction(form);
    });
  };

  const generatePreview = () => {
    setShowPreview(true);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showPreview) {
    return <ContractPreviewDocument formData={formData} onClose={() => setShowPreview(false)} />;
  }

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
          {contractData?.contract && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Your previously saved contract data has been loaded.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoCard formData={formData} updateFormData={updateFormData} />
            <IncomeCard formData={formData} updateFormData={updateFormData} />
            <ChildrenCard formData={formData} updateFormData={updateFormData} />
            
            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {(isSaving || isPending) ? (
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
                {saveState?.success && (
                  <p className="text-green-600 text-sm mt-2">{saveState.success}</p>
                )}
                {saveState?.error && (
                  <p className="text-red-600 text-sm mt-2">{saveState.error}</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <ContractPreview onGeneratePreview={generatePreview} formData={formData} />
          </div>
        </div>
      </div>
    </section>
  );
}
