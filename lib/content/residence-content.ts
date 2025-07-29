/**
 * Dynamic content generation for residence-related sections
 * Generates different paragraphs based on residence ownership type
 */

interface ContractData {
  userFirstName: string;
  partnerFirstName: string;
  residenceAddress: string;
  residenceOwnership: 'joint' | 'user' | 'partner' | 'rental';
  expenseSplitType?: string;
  userFullName: string;
  partnerFullName: string;
}

export class ResidenceContentGenerator {
  private contract: ContractData;

  constructor(contract: ContractData) {
    this.contract = contract;
  }

  /**
   * Generate all residence-related content sections
   */
  generateResidenceContent() {
    return {
      // Main property description paragraph
      propertyDescription: this.getPropertyDescription(),
      
      // Ownership structure paragraphs (2-3 paragraphs)
      ownershipStructure: this.getOwnershipStructure(),
      
      // Financial responsibility paragraphs (2-3 paragraphs)
      financialResponsibility: this.getFinancialResponsibility(),
      
      // Maintenance obligations (1-2 paragraphs)
      maintenanceObligations: this.getMaintenanceObligations(),
      
      // Termination provisions (2-3 paragraphs)
      terminationProvisions: this.getTerminationProvisions(),
      
      // Insurance and liability (1 paragraph)
      insuranceLiability: this.getInsuranceLiability(),
      
      // Tax implications (1 paragraph)  
      taxImplications: this.getTaxImplications(),
      
      // Combined single field for simple template replacement
      residenceSection: this.getCombinedResidenceSection()
    };
  }

  private getPropertyDescription(): string {
    const { userFirstName, partnerFirstName, residenceAddress } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `${userFirstName} and ${partnerFirstName} are joint owners of the property located at ${residenceAddress} (the "Property"). The parties have resided together at this property and acknowledge their shared ownership interest.`;
      
      case 'user':
        return `${userFirstName} is the sole owner of the property located at ${residenceAddress} (the "Property"). ${partnerFirstName} resides at the Property with ${userFirstName}'s consent but does not hold any ownership interest in the Property.`;
      
      case 'partner':
        return `${partnerFirstName} is the sole owner of the property located at ${residenceAddress} (the "Property"). ${userFirstName} resides at the Property with ${partnerFirstName}'s consent but does not hold any ownership interest in the Property.`;
      
      case 'rental':
        return `${userFirstName} and ${partnerFirstName} jointly rent the property located at ${residenceAddress} (the "Property"). Neither party holds any ownership interest in the Property, and both parties are tenants under the rental agreement.`;
      
      default:
        return `The parties reside at the property located at ${residenceAddress || '[Property Address]'} (the "Property").`;
    }
  }

  private getOwnershipStructure(): string {
    const { userFirstName, partnerFirstName } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `The parties acknowledge that they hold the Property as joint tenants with rights of survivorship. Each party has an equal interest in the Property regardless of their respective financial contributions. In the event of separation, the Property shall be sold and the net proceeds divided equally between the parties, unless otherwise agreed to in writing.`;
      
      case 'user':
        return `${userFirstName} acknowledges sole ownership of the Property and all equity therein. ${partnerFirstName} acknowledges that they have no ownership interest, equity claim, or right to compensation for any improvements made to the Property during the relationship. ${partnerFirstName}'s residence at the Property does not create any proprietary interest or tenancy rights.`;
      
      case 'partner':
        return `${partnerFirstName} acknowledges sole ownership of the Property and all equity therein. ${userFirstName} acknowledges that they have no ownership interest, equity claim, or right to compensation for any improvements made to the Property during the relationship. ${userFirstName}'s residence at the Property does not create any proprietary interest or tenancy rights.`;
      
      case 'rental':
        return `The parties acknowledge that they are joint tenants under the rental agreement for the Property. Neither party has any ownership interest in the Property. Both parties are equally responsible for the rental obligations and neither party can terminate the rental agreement without the other's consent, except as otherwise provided in this Agreement.`;
      
      default:
        return `The ownership structure of the Property shall be as determined by the legal title and documentation.`;
    }
  }

  private getFinancialResponsibility(): string {
    const { userFirstName, partnerFirstName, expenseSplitType } = this.contract;
    const splitDescription = this.getExpenseSplitDescription();
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `As joint owners, ${userFirstName} and ${partnerFirstName} agree to share all Property-related expenses ${splitDescription}. This includes but is not limited to mortgage payments, property taxes, insurance premiums, utilities, maintenance costs, and major repairs. Each party shall contribute their agreed-upon share promptly when expenses are incurred.`;
      
      case 'user':
        return `${userFirstName}, as the sole owner, shall be responsible for all mortgage payments, property taxes, and insurance premiums related to the Property. ${userFirstName} and ${partnerFirstName} agree to share household expenses such as utilities, maintenance, and minor repairs ${splitDescription}. ${partnerFirstName} acknowledges that contributions to household expenses do not create any ownership interest in the Property.`;
      
      case 'partner':
        return `${partnerFirstName}, as the sole owner, shall be responsible for all mortgage payments, property taxes, and insurance premiums related to the Property. ${userFirstName} and ${partnerFirstName} agree to share household expenses such as utilities, maintenance, and minor repairs ${splitDescription}. ${userFirstName} acknowledges that contributions to household expenses do not create any ownership interest in the Property.`;
      
      case 'rental':
        return `${userFirstName} and ${partnerFirstName} agree to share all rental payments and Property-related expenses ${splitDescription}. This includes rent, utilities, renter's insurance, and any other costs associated with their tenancy. Both parties are jointly and severally liable to the landlord for all rental obligations.`;
      
      default:
        return `The parties agree to share Property-related expenses as mutually agreed upon.`;
    }
  }

  private getMaintenanceObligations(): string {
    const { userFirstName, partnerFirstName } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `Both parties shall maintain the Property in good condition and shall consult with each other before undertaking any major repairs or improvements costing more than $1,000. Any improvements made with mutual consent shall increase the value of the Property for both parties equally.`;
      
      case 'user':
        return `${userFirstName} shall have the sole authority to make decisions regarding maintenance, repairs, and improvements to the Property. ${partnerFirstName} agrees to maintain the Property in good condition during their residence and shall not make any alterations without ${userFirstName}'s written consent.`;
      
      case 'partner':
        return `${partnerFirstName} shall have the sole authority to make decisions regarding maintenance, repairs, and improvements to the Property. ${userFirstName} agrees to maintain the Property in good condition during their residence and shall not make any alterations without ${partnerFirstName}'s written consent.`;
      
      case 'rental':
        return `Both parties shall comply with all maintenance obligations under their rental agreement and shall share responsibility for any damages beyond normal wear and tear. Neither party may make alterations to the Property without landlord consent and mutual agreement.`;
      
      default:
        return `The parties shall maintain the Property according to their respective responsibilities and legal obligations.`;
    }
  }

  private getTerminationProvisions(): string {
    const { userFirstName, partnerFirstName } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `Upon separation or termination of the relationship, the parties agree that the Property shall be listed for sale within 60 days unless both parties agree otherwise in writing. The net proceeds from the sale shall be divided equally between the parties after payment of all debts, costs, and expenses related to the sale. If one party wishes to purchase the other's interest, they may do so at fair market value as determined by a qualified appraiser.`;
      
      case 'user':
        return `Upon separation or termination of the relationship, ${partnerFirstName} agrees to vacate the Property within 30 days of written notice from ${userFirstName} or termination of the relationship, whichever occurs first. ${partnerFirstName} shall have no claim to any portion of the Property's value or any compensation for improvements made during the relationship.`;
      
      case 'partner':
        return `Upon separation or termination of the relationship, ${userFirstName} agrees to vacate the Property within 30 days of written notice from ${partnerFirstName} or termination of the relationship, whichever occurs first. ${userFirstName} shall have no claim to any portion of the Property's value or any compensation for improvements made during the relationship.`;
      
      case 'rental':
        return `Upon separation or termination of the relationship, both parties remain jointly liable for the rental agreement until its natural expiration or until a replacement tenant approved by the landlord is found. The parties agree to cooperate in good faith to minimize their ongoing rental obligations and to divide any security deposit return equally.`;
      
      default:
        return `Upon separation, the parties shall handle Property matters according to applicable law and their respective legal rights.`;
    }
  }

  private getInsuranceLiability(): string {
    const { userFirstName, partnerFirstName } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `Both parties shall maintain adequate property insurance on the Property and shall be named as insureds under the policy. Each party shall be responsible for their personal property and liability insurance.`;
      
      case 'user':
        return `${userFirstName} shall maintain adequate property insurance on the Property. ${partnerFirstName} shall maintain renter's insurance to cover their personal property and personal liability while residing at the Property.`;
      
      case 'partner':
        return `${partnerFirstName} shall maintain adequate property insurance on the Property. ${userFirstName} shall maintain renter's insurance to cover their personal property and personal liability while residing at the Property.`;
      
      case 'rental':
        return `Both parties shall maintain renter's insurance to cover their respective personal property and liability. Each party shall be responsible for ensuring their personal property is adequately insured.`;
      
      default:
        return `The parties shall maintain appropriate insurance coverage for the Property and their personal property as legally required.`;
    }
  }

  private getTaxImplications(): string {
    const { userFirstName, partnerFirstName } = this.contract;
    
    switch (this.contract.residenceOwnership) {
      case 'joint':
        return `Each party shall be entitled to claim their proportionate share of any tax deductions related to the Property, including mortgage interest and property taxes, based on their actual financial contributions.`;
      
      case 'user':
        return `${userFirstName}, as the sole owner, shall be entitled to all tax deductions related to the Property, including mortgage interest and property taxes. ${partnerFirstName} acknowledges they have no right to claim any Property-related tax deductions.`;
      
      case 'partner':
        return `${partnerFirstName}, as the sole owner, shall be entitled to all tax deductions related to the Property, including mortgage interest and property taxes. ${userFirstName} acknowledges they have no right to claim any Property-related tax deductions.`;
      
      case 'rental':
        return `Each party may claim their proportionate share of rental payments as a tax deduction only to the extent permitted by applicable tax laws and based on their actual contributions to rent payments.`;
      
      default:
        return `Tax implications related to the Property shall be handled according to applicable tax laws and each party's legal obligations.`;
    }
  }

  private getCombinedResidenceSection(): string {
    return [
      this.getPropertyDescription(),
      this.getOwnershipStructure(),
      this.getFinancialResponsibility(),
      this.getMaintenanceObligations(),
      this.getTerminationProvisions(),
      this.getInsuranceLiability(),
      this.getTaxImplications()
    ].join('\n\n');
  }

  private getExpenseSplitDescription(): string {
    switch (this.contract.expenseSplitType) {
      case 'equal':
        return 'equally (50/50)';
      case 'proportional':
        return 'proportionally based on their respective incomes';
      case 'custom':
        return 'according to their custom arrangement as specified elsewhere in this Agreement';
      default:
        return 'as mutually agreed upon';
    }
  }
}

/**
 * Helper function to generate residence content for template data
 */
export function generateResidenceContent(contract: any): Record<string, string> {
  if (!contract.residenceAddress || !contract.residenceOwnership) {
    return {
      propertyDescription: '',
      ownershipStructure: '',
      financialResponsibility: '',
      maintenanceObligations: '', 
      terminationProvisions: '',
      insuranceLiability: '',
      taxImplications: '',
      residenceSection: ''
    };
  }

  const generator = new ResidenceContentGenerator({
    userFirstName: contract.userFirstName || '[Your First Name]',
    partnerFirstName: contract.partnerFirstName || '[Partner First Name]',
    userFullName: contract.userFullName || '[Your Name]',
    partnerFullName: contract.partnerFullName || '[Partner Name]',
    residenceAddress: contract.residenceAddress,
    residenceOwnership: contract.residenceOwnership,
    expenseSplitType: contract.expenseSplitType
  });

  return generator.generateResidenceContent();
}