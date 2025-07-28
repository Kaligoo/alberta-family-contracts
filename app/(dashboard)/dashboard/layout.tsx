'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, List, Settings, Shield, Activity, Menu, CogIcon, Eye, Download, ShoppingCart, Send, Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const { data: authData } = useSWR('/api/auth/me', fetcher);
  const user = authData?.user;
  const isAdmin = user?.role === 'admin';
  
  // Get current contract data
  const { data: contractData } = useSWR('/api/contract', fetcher);
  const contract = contractData?.contract;

  // Contract action handlers
  const handlePreviewContract = async () => {
    if (!contract?.id) return;
    setLoadingAction('preview');
    try {
      router.push(`/dashboard/contracts/${contract.id}/preview`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contract?.id) return;
    setLoadingAction('pdf');
    try {
      const response = await fetch(`/api/contracts/${contract.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cohabitation-agreement-${contract.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadWord = async () => {
    if (!contract?.id) return;
    setLoadingAction('word');
    try {
      const response = await fetch(`/api/contracts/${contract.id}/generate-professional`, {
        method: 'POST'
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cohabitation-agreement-${contract.id}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading Word document:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePurchaseContract = async () => {
    if (!contract?.id) return;
    setLoadingAction('purchase');
    try {
      const response = await fetch(`/api/contracts/${contract.id}/payment`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendToLawyer = () => {
    if (!contract?.id) return;
    router.push(`/dashboard/send-to-lawyer?contractId=${contract.id}`);
  };

  const navItems = [
    { href: '/dashboard', icon: FileText, label: 'Current Contract' },
    { href: '/dashboard/contracts', icon: List, label: 'Other Contracts' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' }
  ];

  // Contract action buttons (only show on dashboard page)
  const contractActions = pathname === '/dashboard' && contract ? [
    {
      id: 'preview',
      label: 'Preview Contract',
      icon: Eye,
      onClick: handlePreviewContract,
      disabled: !contract?.userFullName || !contract?.partnerFullName
    },
    {
      id: 'pdf',
      label: 'Download PDF',
      icon: Download,
      onClick: handleDownloadPDF,
      disabled: false
    },
    {
      id: 'word',
      label: 'Download Word',
      icon: Download,
      onClick: handleDownloadWord,
      disabled: false
    },
    {
      id: 'purchase',
      label: 'Purchase Contract',
      icon: ShoppingCart,
      onClick: handlePurchaseContract,
      disabled: !contract?.userFullName || !contract?.partnerFullName
    },
    {
      id: 'lawyer',
      label: 'Send to Lawyer',
      icon: Send,
      onClick: handleSendToLawyer,
      disabled: false
    }
  ] : [];

  // Add admin nav item if user is admin
  if (isAdmin) {
    navItems.push({ href: '/dashboard/admin', icon: CogIcon, label: 'Admin' });
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Contract Actions Section */}
            {contractActions.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3">
                    Contract Actions
                  </h3>
                </div>
                {contractActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className="shadow-none my-1 w-full justify-start text-left"
                    onClick={() => {
                      action.onClick();
                      setIsSidebarOpen(false);
                    }}
                    disabled={action.disabled || loadingAction === action.id}
                  >
                    {loadingAction === action.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <action.icon className="h-4 w-4" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
