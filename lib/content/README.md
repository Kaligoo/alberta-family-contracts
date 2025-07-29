# Dynamic Content Generation System

This system allows for dynamic generation of contract content based on user selections, making contracts more tailored and accurate.

## How It Works

### Word Template Integration

The dynamic content system generates different paragraphs based on user form selections and integrates seamlessly with docxtemplater. 

**Available Template Fields:**

For residence ownership, you can now use these fields in your Word template:

```
{propertyDescription}         - Main property description paragraph
{ownershipStructure}         - 2-3 paragraphs about ownership structure  
{financialResponsibility}    - 2-3 paragraphs about financial obligations
{maintenanceObligations}     - 1-2 paragraphs about maintenance duties
{terminationProvisions}      - 2-3 paragraphs about separation handling
{insuranceLiability}        - 1 paragraph about insurance requirements
{taxImplications}           - 1 paragraph about tax handling
{residenceSection}          - All above combined into one field
```

### Content Variations by Residence Ownership

#### Joint Ownership (`joint`)
- Equal ownership and responsibilities
- Joint decision making for improvements
- Equal sharing of proceeds on sale
- Both parties named on insurance

#### User's Property (`user`) 
- User has sole ownership and decision authority
- Partner has no ownership claims or equity rights
- User responsible for mortgage/taxes, shared household expenses
- 30-day notice period for partner to vacate

#### Partner's Property (`partner`)
- Partner has sole ownership and decision authority  
- User has no ownership claims or equity rights
- Partner responsible for mortgage/taxes, shared household expenses
- 30-day notice period for user to vacate

#### Rental Property (`rental`)
- Both parties are joint tenants
- Shared rental obligations and liability
- No ownership interests for either party
- Cooperation required for lease modifications

## Usage in Word Template

### Option 1: Individual Sections
Place specific fields where you want targeted content:

```
PROPERTY DESCRIPTION
{propertyDescription}

OWNERSHIP STRUCTURE  
{ownershipStructure}

FINANCIAL RESPONSIBILITIES
{financialResponsibility}
```

### Option 2: Combined Section
Use the combined field for all residence content:

```
RESIDENCE PROVISIONS
{residenceSection}
```

## Extending the System

To add dynamic content for other fields:

1. Create a new content generator class in this directory
2. Follow the pattern established in `residence-content.ts`
3. Import and integrate into the API routes
4. Add template fields to Word document

### Example Structure:
```typescript
export class NewFieldContentGenerator {
  generateContent() {
    return {
      field1: this.getField1Content(),
      field2: this.getField2Content(),
      combinedSection: this.getCombinedContent()
    };
  }
}
```

## Testing

The system automatically generates appropriate content based on:
- `contract.residenceOwnership` value
- `contract.expenseSplitType` value  
- Other contract fields as needed

Content is generated when:
- Word documents are downloaded
- PDF documents are generated
- Any template data is prepared