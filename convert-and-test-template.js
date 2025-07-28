const ProperTemplateConverter = require('./lib/proper-template-converter');
const DocumentGenerator = require('./lib/document-generator');
const path = require('path');
const fs = require('fs');

async function convertAndTestProperTemplate() {
  const converter = new ProperTemplateConverter();
  const generator = new DocumentGenerator();
  
  const originalTemplatePath = "C:\\Users\\Gnymede\\Dropbox\\Work\\Reporting Project\\templates\\CohabandprenupTemplate.docx";
  const convertedTemplatePath = "./lib/templates/cohabitation-template-proper.docx";
  const testOutputPath = "professional-contract.docx";

  try {
    console.log('🔄 Starting proper template conversion process...\n');

    // Ensure templates directory exists
    const templatesDir = './lib/templates';
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Step 1: Extract original fields for preview
    console.log('1. Extracting fields from original template...');
    const originalFields = converter.extractTemplateFields(originalTemplatePath);
    console.log(`   Found ${originalFields.length} template fields:`);
    originalFields.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });
    console.log('');

    // Step 2: Convert the template properly
    console.log('2. Converting template with proper field mapping...');
    await converter.convertTemplate(originalTemplatePath, convertedTemplatePath);
    console.log('');

    // Step 3: Test with comprehensive contract data
    console.log('3. Testing document generation with comprehensive contract data...');
    
    const comprehensiveContractData = {
      userFullName: "Sarah Michelle Johnson",
      partnerFullName: "Michael David Thompson", 
      userJobTitle: "Senior Software Engineer",
      partnerJobTitle: "Family Medicine Physician",
      userIncome: "95000",
      partnerIncome: "180000",
      userEmail: "sarah.johnson@email.com",
      partnerEmail: "michael.thompson@clinic.com",
      userPhone: "(403) 555-7890",
      partnerPhone: "(403) 555-3456",
      userAddress: "1234 Maple Street, Calgary, AB T2N 4X5",
      partnerAddress: "5678 Oak Avenue, Calgary, AB T2P 2M8",
      residenceAddress: "9012 Pine Ridge Drive, Calgary, AB T3B 1L9",
      residenceOwnership: "joint",
      expenseSplitType: "proportional",
      children: [
        {
          name: "Emma Rose Thompson",
          age: 10,
          relationship: "biological",
          parentage: "partner"
        },
        {
          name: "Lucas James Johnson-Thompson",
          age: 3,
          relationship: "biological", 
          parentage: "both"
        }
      ],
      waiverSpousalSupport: false,
      includePropertyDivision: true,
      includeDebtResponsibility: true,
      additionalClauses: "The parties agree to maintain separate investment accounts while sharing household expenses proportionally based on income. Any assets acquired during cohabitation will be documented and classified as either separate or joint property at the time of acquisition.",
      notes: "Both parties have received independent legal advice from qualified family lawyers in Alberta.",
      province: "Alberta",
      country: "Canada"
    };

    const outputPath = await generator.generateContract(
      convertedTemplatePath,
      comprehensiveContractData,
      testOutputPath
    );

    console.log('\n✅ Professional document generation completed successfully!');
    console.log(`\n📄 Generated document: ${outputPath}`);
    console.log('\n🎯 What to check in the generated document:');
    console.log('1. All names are properly filled in');
    console.log('2. Income amounts are formatted correctly');
    console.log('3. Dates are current');
    console.log('4. Contact information is populated');
    console.log('5. Legal formatting and structure is maintained');
    console.log('6. Children information (if applicable) is included');
    console.log('\n💡 Next steps:');
    console.log('1. Open and review the generated document');
    console.log('2. Check for any fields that need manual mapping');
    console.log('3. Test with different data scenarios');
    console.log('4. Add conditional sections for complex legal clauses');
    console.log('5. Integrate with your web application');

  } catch (error) {
    console.error('❌ Error during conversion/testing:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('\n📁 File not found. Please check that the template path is correct:');
      console.error(originalTemplatePath);
      console.error('\nMake sure the file exists and you have read permissions.');
    }
    
    process.exit(1);
  }
}

// Run the proper conversion
convertAndTestProperTemplate();