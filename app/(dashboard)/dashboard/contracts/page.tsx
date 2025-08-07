'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, FileText, Trash2, Eye, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contract {
  id: number;
  userFullName: string;
  partnerFullName: string;
  status: string;
  contractType: string;
  isCurrentContract?: string;
  isPaid?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractsPage() {
  const { data: contractsData, error, mutate } = useSWR('/api/contracts', fetcher);

  const contracts: Contract[] = contractsData?.contracts || [];

  const handleSetCurrentContract = async (contractId: number) => {
    try {
      console.log('Attempting to set current contract:', contractId);
      
      const response = await fetch(`/api/contracts/${contractId}/set-current`, {
        method: 'POST',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        console.log('Success! Redirecting to edit page...');
        // Redirect to edit-contract page to edit the now-current contract
        window.location.href = '/dashboard/edit-contract';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        alert(`Failed to set current contract. Error: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Network/JS Error setting current contract:', error);
      alert(`Failed to set current contract. Network error: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleDeleteContract = async (contractId: number) => {
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate(); // Refresh the contracts list
      } else {
        alert('Failed to delete contract. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract. Please try again.');
    }
  };

  const getStatusColor = (status: string, isPaid: string) => {
    if (isPaid === 'true') {
      return 'bg-green-100 text-green-800';
    }
    switch (status) {
      case 'preview':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string, isPaid: string) => {
    if (isPaid === 'true') {
      return 'Paid';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContractType = (contractType: string) => {
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

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Your Contracts</h1>
            <p className="text-gray-600">
              Manage all your family agreements including cohabitation, prenuptial, and postnuptial contracts.
            </p>
          </div>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load contracts. Please refresh the page.</p>
            </CardContent>
          </Card>
        )}

        {!contractsData && !error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading contracts...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {contracts.length === 0 && contractsData && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first family agreement.
                </p>
                <Link href="/dashboard/contracts/new">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Contract
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {contract.userFullName && contract.partnerFullName
                        ? `${contract.userFullName} & ${contract.partnerFullName}`
                        : 'Untitled Contract'}
                      {/* TODO: Re-enable once column exists */}
                      {false && (contract.isCurrentContract === 'true') && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status, contract.isPaid || 'false')}`}>
                      {getStatusLabel(contract.status, contract.isPaid || 'false')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>Type:</strong> {formatContractType(contract.contractType)}</p>
                      <p><strong>Created:</strong> {formatDate(contract.createdAt)}</p>
                      <p><strong>Updated:</strong> {formatDate(contract.updatedAt)}</p>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      {/* Disable editing if contract is paid */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrentContract(contract.id)}
                        disabled={contract.isPaid === 'true'}
                        className="flex-1"
                        title={contract.isPaid === 'true' ? 'Contract is locked after payment' : 'Edit this contract'}
                      >
                        <ArrowRight className="mr-2 h-3 w-3" />
                        {contract.isPaid === 'true' ? 'Locked' : 'Edit'}
                      </Button>
                      <Link href={`/dashboard/contracts/${contract.id}/preview`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContract(contract.id)}
                        disabled={contract.isPaid === 'true'}
                        className={`${contract.isPaid === 'true' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700 hover:border-red-300'}`}
                        title={contract.isPaid === 'true' ? 'Cannot delete paid contracts' : 'Delete contract'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}