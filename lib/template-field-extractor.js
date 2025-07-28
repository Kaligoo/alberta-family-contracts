const PizZip = require('pizzip');
const fs = require('fs');

/**
 * Extract actual template fields from a Word document
 * This looks for user-defined field patterns vs system XML
 */
class TemplateFieldExtractor {
  
  /**
   * Extract template fields that look like user-defined placeholders
   * vs system XML tags
   */
  extractUserFields(docxPath) {
    try {
      const content = fs.readFileSync(docxPath, 'binary');
      const zip = new PizZip(content);
      const doc = zip.file('word/document.xml');
      
      if (!doc) {
        throw new Error('Invalid docx file');
      }
      
      const xmlContent = doc.asText();
      
      // Look for text content within Word text tags
      // This regex finds content between <w:t> and </w:t> tags
      const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      
      const userFields = new Set();
      
      textMatches.forEach(match => {
        // Extract the text content
        const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        
        // Look for field patterns like <FieldName> in the text content
        const fieldMatches = textContent.match(/<[A-Za-z][A-Za-z0-9_\s]*>/g) || [];
        
        fieldMatches.forEach(field => {
          // Filter out obvious XML/system tags
          const fieldName = field.slice(1, -1).trim();
          
          // Skip if it looks like XML namespace or system tag
          if (!fieldName.includes(':') && 
              !fieldName.startsWith('w:') && 
              !fieldName.startsWith('xml') &&
              !fieldName.includes('http') &&
              fieldName.length > 0 &&
              fieldName.length < 50) { // Reasonable field name length
            userFields.add(field);
          }
        });
      });
      
      return Array.from(userFields).sort();
      
    } catch (error) {
      console.error('Error extracting user fields:', error.message);
      return [];
    }
  }

  /**
   * Show template analysis
   */
  analyzeTemplate(docxPath) {
    console.log(`\n📋 Analyzing template: ${docxPath}`);
    
    const userFields = this.extractUserFields(docxPath);
    
    console.log(`\n🔍 Found ${userFields.length} potential template fields:`);
    userFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field}`);
    });
    
    if (userFields.length === 0) {
      console.log('\n⚠️  No template fields found. This could mean:');
      console.log('   - The template uses a different bracket style');
      console.log('   - The fields are in a different format');
      console.log('   - The template needs manual inspection');
    } else {
      console.log('\n✅ Template analysis complete!');
      console.log('\n📝 Suggested field mappings:');
      userFields.forEach(field => {
        const fieldName = field.slice(1, -1).trim();
        const suggestion = this.suggestFieldMapping(fieldName);
        console.log(`   ${field} → {${suggestion}}`);
      });
    }
    
    return userFields;
  }

  /**
   * Suggest appropriate field mapping based on field name
   */
  suggestFieldMapping(fieldName) {
    const lowercaseName = fieldName.toLowerCase();
    
    // Common field mappings
    const mappings = {
      'client name': 'userFullName',
      'client': 'userFullName',
      'partner name': 'partnerFullName',
      'partner': 'partnerFullName',
      'date': 'currentDate',
      'income': 'userIncome',
      'partner income': 'partnerIncome',
      'address': 'residenceAddress',
      'email': 'userEmail',
      'phone': 'userPhone'
    };
    
    // Check exact matches first
    if (mappings[lowercaseName]) {
      return mappings[lowercaseName];
    }
    
    // Check partial matches
    for (const [key, value] of Object.entries(mappings)) {
      if (lowercaseName.includes(key) || key.includes(lowercaseName)) {
        return value;
      }
    }
    
    // Default: convert to camelCase
    return fieldName
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }
}

module.exports = TemplateFieldExtractor;