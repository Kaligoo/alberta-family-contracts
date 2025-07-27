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

export default function NewContractPage() {
  const [formData, setFormData] = useState({
    userFullName: '',
    partnerFullName: '',
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
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create New Contract</h1>
          <p className="text-gray-600">
            Start a new cohabitation agreement by providing basic information.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <p>You can add more details like children and specific clauses after creating the contract.</p>
        </div>
      </div>
    </section>
  );
}