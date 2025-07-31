// Helper function to check if contract is paid - handles various possible values
export function isContractPaid(contract: any): boolean {
  if (!contract) return false;
  
  const isPaid = contract.isPaid;
  
  // Handle various possible values that could indicate "paid"
  return isPaid === true ||
         isPaid === 'true' ||
         isPaid === 1 ||
         isPaid === '1' ||
         isPaid === 'paid' ||
         (typeof isPaid === 'string' && isPaid.toLowerCase() === 'true');
}

// Debug helper to log payment status values
export function debugPaymentStatus(contract: any, componentName: string = 'Unknown') {
  if (!contract) return;
  
  console.log(`${componentName} Payment Debug:`, {
    contractId: contract.id,
    isPaid: contract.isPaid,
    isPaidType: typeof contract.isPaid,
    isPaidValue: JSON.stringify(contract.isPaid),
    isContractPaidResult: isContractPaid(contract)
  });
}