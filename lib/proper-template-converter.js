const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

class ProperTemplateConverter {
  
  /**
   * Convert template from HTML-encoded angle brackets to docxtemplater format
   */
  async convertTemplate(inputPath, outputPath) {
    try {
      console.log('🔄 Converting template with proper field detection...');
      
      const content = fs.readFileSync(inputPath, 'binary');
      const zip = new PizZip(content);
      
      // Get the main document content
      const doc = zip.file('word/document.xml');
      if (!doc) {
        throw new Error('Invalid docx file - no document.xml found');
      }
      
      let xmlContent = doc.asText();
      
      // Extract text content and identify fields
      const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      
      console.log(`Found ${textMatches.length} text elements`);
      
      // Build field mapping
      const fieldMappings = this.buildFieldMappings();
      
      // Process each text element
      textMatches.forEach(match => {
        const originalMatch = match;
        let textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        
        // Decode HTML entities and convert to template fields
        let modifiedText = textContent;
        
        // Look for encoded angle bracket patterns: &lt;fieldname&gt;
        const encodedFields = modifiedText.match(/&lt;[^&]*&gt;/g) || [];
        
        encodedFields.forEach(encodedField => {
          // Decode the field: &lt;mom&gt; becomes <mom>
          const decodedField = encodedField.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          const fieldName = decodedField.slice(1, -1).trim(); // Remove < >
          
          // Map to appropriate template field
          const templateField = this.mapFieldName(fieldName, fieldMappings);
          
          console.log(`  Converting: ${encodedField} → {${templateField}}`);
          
          // Replace in the text
          modifiedText = modifiedText.replace(encodedField, `{${templateField}}`);
        });
        
        // If we made changes, update the XML
        if (modifiedText !== textContent) {
          const openTag = originalMatch.match(/<w:t[^>]*>/)[0];
          const newMatch = openTag + modifiedText + '</w:t>';
          xmlContent = xmlContent.replace(originalMatch, newMatch);
        }
      });
      
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
   * Build field mappings from template field names to our data structure
   */
  buildFieldMappings() {
    return {
      // Parent/Partner names
      'mom': 'userFullName',
      'dad': 'partnerFullName', 
      'client': 'userFullName',
      'partner': 'partnerFullName',
      
      // Full names variations
      'mom fn': 'userFullName',
      'dad fn': 'partnerFullName',
      'client full name': 'userFullName',
      'partner full name': 'partnerFullName',
      
      // Dates
      'date': 'currentDate',
      'contract date': 'currentDate',
      'today': 'currentDate',
      
      // Contact information
      'mom email': 'userEmail',
      'dad email': 'partnerEmail',
      'mom phone': 'userPhone', 
      'dad phone': 'partnerPhone',
      'mom address': 'userAddress',
      'dad address': 'partnerAddress',
      
      // Employment/Income
      'mom job': 'userJobTitle',
      'dad job': 'partnerJobTitle',
      'mom income': 'userIncome',
      'dad income': 'partnerIncome',
      'mom occupation': 'userJobTitle',
      'dad occupation': 'partnerJobTitle',
      
      // Residence
      'residence': 'residenceAddress',
      'address': 'residenceAddress',
      'home address': 'residenceAddress',
      
      // Legal/Location
      'province': 'province',
      'country': 'country',
      'jurisdiction': 'province'
    };
  }
  
  /**
   * Map a field name to our template system
   */
  mapFieldName(fieldName, mappings) {
    const lowercaseName = fieldName.toLowerCase().trim();
    
    // Direct mapping
    if (mappings[lowercaseName]) {
      return mappings[lowercaseName];
    }
    
    // Partial matches
    for (const [key, value] of Object.entries(mappings)) {
      if (lowercaseName.includes(key) || key.includes(lowercaseName)) {
        return value;
      }
    }
    
    // Default: convert to camelCase for unknown fields
    const camelCase = fieldName
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
      
    console.log(`  ⚠️  Unknown field "${fieldName}" mapped to "${camelCase}"`);
    return camelCase;
  }
  
  /**
   * Extract all template fields from the document for preview
   */
  extractTemplateFields(docxPath) {
    try {
      const content = fs.readFileSync(docxPath, 'binary');
      const zip = new PizZip(content);
      const doc = zip.file('word/document.xml');
      
      if (!doc) {
        throw new Error('Invalid docx file');
      }
      
      const xmlContent = doc.asText();
      const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      
      const fields = new Set();
      
      textMatches.forEach(match => {
        const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        const encodedFields = textContent.match(/&lt;[^&]*&gt;/g) || [];
        
        encodedFields.forEach(encodedField => {
          const decodedField = encodedField.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          fields.add(decodedField);
        });
      });
      
      return Array.from(fields).sort();
      
    } catch (error) {
      console.error('Error extracting template fields:', error.message);
      return [];
    }
  }
}

module.exports = ProperTemplateConverter;