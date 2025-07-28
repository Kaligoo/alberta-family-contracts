const PizZip = require('pizzip');
const fs = require('fs');

async function deepAnalyzeTemplate() {
  const originalTemplatePath = "C:\\Users\\Gnymede\\Dropbox\\Work\\Reporting Project\\templates\\CohabandprenupTemplate.docx";
  
  console.log('🔍 Deep analysis of your Word template...\n');
  
  try {
    const content = fs.readFileSync(originalTemplatePath, 'binary');
    const zip = new PizZip(content);
    
    console.log('📁 Files in the DOCX archive:');
    Object.keys(zip.files).forEach(filename => {
      console.log(`   - ${filename}`);
    });
    
    // Analyze main document
    const doc = zip.file('word/document.xml');
    if (doc) {
      const xmlContent = doc.asText();
      
      console.log('\n📄 Document XML analysis:');
      console.log(`   - Document length: ${xmlContent.length} characters`);
      
      // Look for any text content
      const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      console.log(`   - Found ${textMatches.length} text elements`);
      
      if (textMatches.length > 0) {
        console.log('\n📝 Text content found:');
        
        const allText = [];
        textMatches.forEach((match, index) => {
          const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
          if (textContent.trim().length > 0) {
            allText.push(textContent);
            if (index < 20) { // Show first 20 text elements
              console.log(`   ${index + 1}. "${textContent}"`);
            }
          }
        });
        
        if (textMatches.length > 20) {
          console.log(`   ... and ${textMatches.length - 20} more text elements`);
        }
        
        // Look for various bracket patterns in the text
        const fullText = allText.join(' ');
        
        console.log('\n🔍 Searching for template patterns:');
        
        // Different bracket styles
        const patterns = [
          { name: 'Angle brackets', regex: /<[^<>]+>/g, example: '<FieldName>' },
          { name: 'Curly brackets', regex: /{[^{}]+}/g, example: '{FieldName}' },
          { name: 'Square brackets', regex: /\[[^\[\]]+\]/g, example: '[FieldName]' },
          { name: 'Double angle', regex: /<<[^<>]+>>/g, example: '<<FieldName>>' },
          { name: 'Percentage signs', regex: /%[^%]+%/g, example: '%FieldName%' },
          { name: 'Dollar signs', regex: /\$[A-Za-z][A-Za-z0-9_]*\$/g, example: '$FieldName$' }
        ];
        
        let foundAny = false;
        
        patterns.forEach(pattern => {
          const matches = fullText.match(pattern.regex) || [];
          if (matches.length > 0) {
            foundAny = true;
            console.log(`\n   ✅ ${pattern.name} (${pattern.example}): ${matches.length} found`);
            matches.forEach((match, i) => {
              if (i < 10) console.log(`      ${i + 1}. ${match}`);
            });
            if (matches.length > 10) {
              console.log(`      ... and ${matches.length - 10} more`);
            }
          } else {
            console.log(`   ❌ ${pattern.name} (${pattern.example}): none found`);
          }
        });
        
        if (!foundAny) {
          console.log('\n⚠️  No standard template field patterns found.');
          console.log('\n💡 The template might:');
          console.log('   - Use plain text that needs to be manually replaced');
          console.log('   - Use Word content controls or form fields');
          console.log('   - Be designed for a different templating system');
          console.log('   - Need to be manually updated with template fields');
        }
        
        // Show some sample text to help identify what to replace
        console.log('\n📝 Sample text content (first 500 characters):');
        console.log(`"${fullText.substring(0, 500)}..."`);
        
      } else {
        console.log('\n⚠️  No readable text content found in the document.');
      }
      
    } else {
      console.log('\n❌ Could not find main document content.');
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Template file not found at:');
      console.error(originalTemplatePath);
    } else {
      console.error('❌ Error analyzing template:', error.message);
    }
  }
}

deepAnalyzeTemplate();