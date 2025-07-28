const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

class DocumentGenerator {
  constructor() {
    this.templatePath = null;
    this.outputDir = path.join(__dirname, '../generated-documents');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Convert template from <field> format to {field} format
   * This reads a docx file and converts angle brackets to curly brackets
   */
  async convertTemplate(inputPath, outputPath) {
    try {
      console.log('Converting template from angle brackets to curly brackets...');
      
      const content = fs.readFileSync(inputPath, 'binary');
      const zip = new PizZip(content);
      
      // Get the main document content
      const doc = zip.file('word/document.xml');
      if (!doc) {
        throw new Error('Invalid docx file - no document.xml found');
      }
      
      let xmlContent = doc.asText();
      
      // Convert angle brackets to curly brackets
      // This regex looks for <fieldname> patterns and converts them to {fieldname}
      xmlContent = xmlContent.replace(/<([^<>]+)>/g, '{$1}');
      
      // Update the document content
      zip.file('word/document.xml', xmlContent);
      
      // Generate the new file
      const newBuffer = zip.generate({ type: 'nodebuffer' });
      fs.writeFileSync(outputPath, newBuffer);
      
      console.log(`✅ Template converted successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Error converting template:', error.message);
      throw error;
    }
  }

  /**
   * Generate a contract document from template and data
   */
  async generateContract(templatePath, contractData, outputFilename) {
    try {
      console.log('Generating contract document...');
      
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{',
          end: '}'
        }
      });

      // Prepare the data for the template
      const templateData = this.prepareTemplateData(contractData);
      
      console.log('Template data prepared:', Object.keys(templateData));
      
      // Render the document
      doc.render(templateData);
      
      // Generate output
      const outputPath = path.join(this.outputDir, outputFilename);
      const buf = doc.getZip().generate({ type: 'nodebuffer' });
      fs.writeFileSync(outputPath, buf);
      
      console.log(`✅ Contract generated successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ Error generating contract:', error);
      
      // More detailed error information
      if (error.properties && error.properties.errors) {
        console.error('Template errors:');
        error.properties.errors.forEach(err => {
          console.error(`  - ${err.message} at line ${err.line}`);
        });
      }
      
      throw error;
    }
  }

  /**
   * Prepare contract data for template consumption
   */
  prepareTemplateData(contractData) {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return {
      // Basic Information
      userFullName: contractData.userFullName || '[Your Name]',
      partnerFullName: contractData.partnerFullName || '[Partner Name]',
      userJobTitle: contractData.userJobTitle || '',
      partnerJobTitle: contractData.partnerJobTitle || '',
      userIncome: contractData.userIncome ? `$${parseInt(contractData.userIncome).toLocaleString()}` : '',
      partnerIncome: contractData.partnerIncome ? `$${parseInt(contractData.partnerIncome).toLocaleString()}` : '',
      
      // Contact Information
      userEmail: contractData.userEmail || '',
      partnerEmail: contractData.partnerEmail || '',
      userPhone: contractData.userPhone || '',
      partnerPhone: contractData.partnerPhone || '',
      userAddress: contractData.userAddress || '',
      partnerAddress: contractData.partnerAddress || '',
      
      // Residence Information
      residenceAddress: contractData.residenceAddress || '',
      residenceOwnership: contractData.residenceOwnership || '',
      
      // Financial Information
      expenseSplitType: contractData.expenseSplitType || '',
      
      // Document Information
      currentDate: currentDate,
      contractDate: currentDate,
      
      // Conditional Sections
      hasChildren: contractData.children && contractData.children.length > 0,
      childrenCount: contractData.children ? contractData.children.length : 0,
      children: contractData.children || [],
      
      // Legal Clauses (these would be determined by user selections)
      waiverSpousalSupport: contractData.waiverSpousalSupport || false,
      includePropertyDivision: contractData.includePropertyDivision !== false,
      includeDebtResponsibility: contractData.includeDebtResponsibility !== false,
      
      // Additional Content
      additionalClauses: contractData.additionalClauses || '',
      notes: contractData.notes || '',
      
      // Province/Location
      province: 'Alberta',
      country: 'Canada'
    };
  }

  /**
   * Extract template fields from a docx file
   * Useful for debugging what fields are expected
   */
  async extractTemplateFields(templatePath) {
    try {
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = zip.file('word/document.xml');
      
      if (!doc) {
        throw new Error('Invalid docx file');
      }
      
      const xmlContent = doc.asText();
      
      // Extract fields in both formats
      const angleFields = xmlContent.match(/<[^<>]+>/g) || [];
      const curlyFields = xmlContent.match(/{[^{}]+}/g) || [];
      
      const uniqueFields = [...new Set([...angleFields, ...curlyFields])];
      
      console.log('Template fields found:', uniqueFields);
      return uniqueFields;
      
    } catch (error) {
      console.error('Error extracting fields:', error.message);
      throw error;
    }
  }
}

module.exports = DocumentGenerator;