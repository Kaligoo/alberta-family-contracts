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
  createdAt: string;
  updatedAt: string;
}

export default function ContractsPage() {
  const { data: contractsData, error, mutate } = useSWR('/api/contracts', fetcher);

  const contracts: Contract[] = contractsData?.contracts || [];

  const handleSetCurrentContract = async (contractId: number) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/set-current`, {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to dashboard to edit the now-current contract
        window.location.href = '/dashboard';
      } else {
        alert('Failed to set current contract. Please try again.');
      }
    } catch (error) {
      console.error('Error setting current contract:', error);
      alert('Failed to set current contract. Please try again.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'preview':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Your Contracts</h1>
            <p className="text-gray-600">
              Manage all your family contracts and cohabitation agreements.
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
                  Get started by creating your first cohabitation agreement.
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>Type:</strong> {contract.contractType}</p>
                      <p><strong>Created:</strong> {formatDate(contract.createdAt)}</p>
                      <p><strong>Updated:</strong> {formatDate(contract.updatedAt)}</p>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      {/* For now, just show Set as Current for all contracts */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrentContract(contract.id)}
                        className="flex-1"
                      >
                        <ArrowRight className="mr-2 h-3 w-3" />
                        Edit This Contract
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
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
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