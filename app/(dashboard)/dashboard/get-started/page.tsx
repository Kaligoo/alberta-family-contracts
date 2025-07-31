'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Users, Gem, UserCheck, Info, ArrowRight, Clock } from 'lucide-react';

const agreementTypes = [
  {
    id: 'cohabitation',
    title: 'Cohabitation Agreement',
    description: 'For couples living together',
    icon: Users,
    available: true,
    detailedDescription: 'A cohabitation agreement is for unmarried couples who are living together or planning to live together. It helps establish financial responsibilities, property rights, and other important matters while maintaining your relationship.',
    bestFor: 'Couples who are living together but not married',
    timeline: 'Can be created at any time during your relationship'
  },
  {
    id: 'prenuptial',
    title: 'Prenuptial Agreement',
    description: 'For engaged couples before marriage',
    icon: Gem,
    available: true,
    detailedDescription: 'A prenuptial agreement is created before marriage to establish how assets, debts, and other financial matters will be handled during the marriage and in the event of divorce.',
    bestFor: 'Engaged couples who want to plan their financial future',
    timeline: 'Must be signed before your wedding ceremony'
  },
  {
    id: 'postnuptial',
    title: 'Postnuptial Agreement',
    description: 'For married couples',
    icon: Heart,
    available: false,
    detailedDescription: 'A postnuptial agreement is similar to a prenuptial agreement but is created after marriage. It helps married couples establish or modify their financial arrangements.',
    bestFor: 'Married couples who want to establish financial agreements',
    timeline: 'Can be created at any time during your marriage'
  },
  {
    id: 'separation',
    title: 'Separation Agreement',
    description: 'For couples separating',
    icon: UserCheck,
    available: false,
    detailedDescription: 'A separation agreement outlines the terms of separation including child custody, support payments, property division, and other important matters when couples decide to separate.',
    bestFor: 'Couples who are separating or divorcing',
    timeline: 'Created when couples decide to separate'
  }
];

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelectAgreement = async (agreementId: string) => {
    if (agreementId === 'cohabitation' || agreementId === 'prenuptial') {
      // Create a new contract and redirect to editing
      try {
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userFullName: '',
            partnerFullName: '',
            contractType: agreementId, // Track the agreement type - use contractType to match API
            // Add other default fields as needed
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/dashboard/edit-contract`);
        } else {
          console.error('Failed to create contract');
        }
      } catch (error) {
        console.error('Error creating contract:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get Started with Your Legal Agreement
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the type of agreement that best fits your situation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {agreementTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card 
              key={type.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col h-full ${
                selectedType === type.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
              } ${
                !type.available ? 'opacity-75' : ''
              }`}
              onClick={() => type.available && setSelectedType(type.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      type.available ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        type.available ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {type.title}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm p-4">
                              <div className="space-y-2">
                                <p className="font-medium">{type.detailedDescription}</p>
                                <div className="text-sm text-gray-600">
                                  <p><strong>Best for:</strong> {type.bestFor}</p>
                                  <p><strong>Timeline:</strong> {type.timeline}</p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {type.description}
                      </CardDescription>
                    </div>
                  </div>
                  {!type.available && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 mb-4">
                  {type.detailedDescription}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <p><strong>Best for:</strong> {type.bestFor}</p>
                  <p><strong>Timeline:</strong> {type.timeline}</p>
                </div>

                <div className="mt-auto">
                  {type.available && (
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAgreement(type.id);
                      }}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {!type.available && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Your Journey to a Professional Legal Agreement
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-blue-800">
          <span className="bg-blue-100 px-3 py-1 rounded-full">1. Choose Agreement Type</span>
          <ArrowRight className="h-4 w-4" />
          <span className="bg-white px-3 py-1 rounded-full border">2. Fill Out Details</span>
          <ArrowRight className="h-4 w-4" />
          <span className="bg-white px-3 py-1 rounded-full border">3. Preview & Edit</span>
          <ArrowRight className="h-4 w-4" />
          <span className="bg-white px-3 py-1 rounded-full border">4. Purchase</span>
          <ArrowRight className="h-4 w-4" />
          <span className="bg-white px-3 py-1 rounded-full border">5. Download & Send to Lawyer</span>
        </div>
        <p className="text-blue-700 mt-3">
          We'll guide you through each step to create a comprehensive legal agreement that protects your interests.
        </p>
      </div>
    </div>
  );
}