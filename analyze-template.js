const TemplateFieldExtractor = require('./lib/template-field-extractor');

async function analyzeOriginalTemplate() {
  const extractor = new TemplateFieldExtractor();
  
  const originalTemplatePath = "C:\\Users\\Gnymede\\Dropbox\\Work\\Reporting Project\\templates\\CohabandprenupTemplate.docx";
  
  console.log('🔍 Analyzing your original Word template...\n');
  
  try {
    const userFields = extractor.analyzeTemplate(originalTemplatePath);
    
    if (userFields.length > 0) {
      console.log('\n📋 Next Steps:');
      console.log('1. Review the field mappings above');
      console.log('2. Manually edit your Word template to replace:');
      userFields.forEach(field => {
        const fieldName = field.slice(1, -1).trim();
        const suggestion = extractor.suggestFieldMapping(fieldName);
        console.log(`   ${field} with {${suggestion}}`);
      });
      console.log('3. Save the updated template');
      console.log('4. Test document generation with the new template');
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Template file not found at:');
      console.error(originalTemplatePath);
      console.error('\nPlease check the file path and try again.');
    } else {
      console.error('❌ Error analyzing template:', error.message);
    }
  }
}

analyzeOriginalTemplate();