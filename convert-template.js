const DocumentGenerator = require('./lib/document-generator');
const path = require('path');

async function convertAndTestTemplate() {
  const generator = new DocumentGenerator();
  
  const originalTemplatePath = "C:\\Users\\Gnymede\\Dropbox\\Work\\Reporting Project\\templates\\CohabandprenupTemplate.docx";
  const convertedTemplatePath = "./lib/templates/cohabitation-template.docx";
  const testOutputPath = "test-contract.docx";

  try {
    console.log('🔄 Starting template conversion process...\n');

    // Step 1: Extract fields from original template to see what we're working with
    console.log('1. Analyzing original template fields...');
    try {
      const fields = await generator.extractTemplateFields(originalTemplatePath);
      console.log('Found template fields:', fields.slice(0, 10)); // Show first 10
      console.log(`Total fields found: ${fields.length}\n`);
    } catch (error) {
      console.log('Could not analyze original template fields (this is OK if file has complex structure)\n');
    }

    // Step 2: Convert the template
    console.log('2. Converting template from <field> to {field} format...');
    
    // Ensure templates directory exists
    const templatesDir = './lib/templates';
    const fs = require('fs');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    await generator.convertTemplate(originalTemplatePath, convertedTemplatePath);
    console.log('✅ Template conversion completed\n');

    // Step 3: Extract fields from converted template
    console.log('3. Analyzing converted template fields...');
    const convertedFields = await generator.extractTemplateFields(convertedTemplatePath);
    console.log('Converted fields (first 10):', convertedFields.slice(0, 10));
    console.log(`Total converted fields: ${convertedFields.length}\n`);

    // Step 4: Test with sample contract data
    console.log('4. Testing document generation with sample data...');
    
    const sampleContractData = {
      userFullName: "John Smith",
      partnerFullName: "Jane Doe", 
      userJobTitle: "Software Engineer",
      partnerJobTitle: "Teacher",
      userIncome: "75000",
      partnerIncome: "55000",
      userEmail: "john@example.com",
      partnerEmail: "jane@example.com",
      userPhone: "(403) 555-0123",
      partnerPhone: "(403) 555-0456",
      userAddress: "123 Main St, Calgary, AB",
      partnerAddress: "456 Oak Ave, Calgary, AB",
      residenceAddress: "789 Pine St, Calgary, AB",
      residenceOwnership: "joint",
      expenseSplitType: "proportional",
      children: [
        {
          name: "Emma Smith",
          age: 8,
          relationship: "biological",
          parentage: "user"
        }
      ],
      waiverSpousalSupport: false,
      additionalClauses: "Additional terms to be negotiated.",
      notes: "This is a test generation."
    };

    const outputPath = await generator.generateContract(
      convertedTemplatePath,
      sampleContractData,
      testOutputPath
    );

    console.log('✅ Document generation test completed successfully!');
    console.log(`\n📄 Generated document: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Open the generated document to review the output');
    console.log('2. Check if all fields were populated correctly');
    console.log('3. Look for any missing fields or formatting issues');
    console.log('4. Update template as needed for conditional sections');

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

// Run the conversion
convertAndTestTemplate();