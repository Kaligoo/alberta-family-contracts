import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Styles for the PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 72, // 1 inch margins
    fontFamily: 'Times-Roman',
  },
  container: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Times-Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Times-Bold',
  },
  section: {
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Times-Roman',
  },
  boldText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Times-Bold',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  notice: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 20,
    fontFamily: 'Times-Roman',
  },
  footerInfo: {
    fontSize: 10,
    marginBottom: 2,
    fontFamily: 'Times-Roman',
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    const resolvedParams = await params;
    const contractId = parseInt(resolvedParams.id);
    
    if (!userWithTeam?.teamId || isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get the contract to verify ownership
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Generate PDF using @react-pdf/renderer
    const pdfBytes = await generateContractPDF(contract, user);
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cohabitation-agreement-${contractId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generateContractPDF(contract: any, user: any): Promise<Uint8Array> {
  try {
    const templateData = prepareTemplateData(contract, user);
    
    // Create the PDF document
    const MyDocument = React.createElement(
      Document,
      {},
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        React.createElement(
          View,
          { style: styles.container },
          [
            // Title
            React.createElement(Text, { style: styles.title, key: 'title' }, 'ALBERTA COHABITATION AGREEMENT'),
            
            // Parties Section
            React.createElement(
              View,
              { style: styles.section, key: 'parties' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'parties-title' }, 'PARTIES TO THIS AGREEMENT'),
                React.createElement(Text, { style: styles.boldText, key: 'party-a' }, `Party A: ${templateData.userFullName}`),
                contract.userAddress ? React.createElement(Text, { style: styles.text, key: 'user-address' }, `Address: ${contract.userAddress}`) : null,
                contract.userEmail ? React.createElement(Text, { style: styles.text, key: 'user-email' }, `Email: ${contract.userEmail}`) : null,
                contract.userPhone ? React.createElement(Text, { style: styles.text, key: 'user-phone' }, `Phone: ${contract.userPhone}`) : null,
                React.createElement(Text, { style: [styles.boldText, { marginTop: 15 }], key: 'party-b' }, `Party B: ${templateData.partnerFullName}`),
                contract.partnerAddress ? React.createElement(Text, { style: styles.text, key: 'partner-address' }, `Address: ${contract.partnerAddress}`) : null,
                contract.partnerEmail ? React.createElement(Text, { style: styles.text, key: 'partner-email' }, `Email: ${contract.partnerEmail}`) : null,
                contract.partnerPhone ? React.createElement(Text, { style: styles.text, key: 'partner-phone' }, `Phone: ${contract.partnerPhone}`) : null,
              ].filter(Boolean)
            ),
            
            // Agreement Details Section
            React.createElement(
              View,
              { style: styles.section, key: 'agreement' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'agreement-title' }, 'AGREEMENT DETAILS'),
                React.createElement(Text, { style: styles.text, key: 'date' }, `Date of Agreement: ${templateData.currentDate}`),
                contract.cohabDate ? React.createElement(Text, { style: styles.text, key: 'cohab-date' }, `Date Cohabitation Began: ${templateData.cohabDate}`) : null,
                contract.residenceAddress ? React.createElement(Text, { style: styles.text, key: 'residence' }, `Residence Address: ${contract.residenceAddress}`) : null,
              ].filter(Boolean)
            ),
            
            // Financial Information Section
            (contract.userIncome || contract.partnerIncome) ? React.createElement(
              View,
              { style: styles.section, key: 'financial' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'financial-title' }, 'FINANCIAL INFORMATION'),
                contract.userIncome ? React.createElement(Text, { style: styles.text, key: 'user-income' }, `Party A Annual Income: ${templateData.userIncome}`) : null,
                contract.partnerIncome ? React.createElement(Text, { style: styles.text, key: 'partner-income' }, `Party B Annual Income: ${templateData.partnerIncome}`) : null,
              ].filter(Boolean)
            ) : null,
            
            // Employment Information Section
            (contract.userJobTitle || contract.partnerJobTitle) ? React.createElement(
              View,
              { style: styles.section, key: 'employment' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'employment-title' }, 'EMPLOYMENT INFORMATION'),
                contract.userJobTitle ? React.createElement(Text, { style: styles.text, key: 'user-job' }, `Party A Occupation: ${contract.userJobTitle}`) : null,
                contract.partnerJobTitle ? React.createElement(Text, { style: styles.text, key: 'partner-job' }, `Party B Occupation: ${contract.partnerJobTitle}`) : null,
              ].filter(Boolean)
            ) : null,
            
            // Children Section
            (contract.children && contract.children.length > 0) ? React.createElement(
              View,
              { style: styles.section, key: 'children' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'children-title' }, 'CHILDREN'),
                ...contract.children.map((child: any, index: number) => 
                  React.createElement(Text, { style: styles.text, key: `child-${index}` }, 
                    `Child ${index + 1}: ${child.name}${child.age ? ` (Age ${child.age})` : ''}`
                  )
                )
              ]
            ) : null,
            
            // Additional Clauses Section
            contract.additionalClauses ? React.createElement(
              View,
              { style: styles.section, key: 'clauses' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'clauses-title' }, 'ADDITIONAL CLAUSES'),
                React.createElement(Text, { style: styles.text, key: 'clauses-content' }, contract.additionalClauses),
              ]
            ) : null,
            
            // Notes Section
            contract.notes ? React.createElement(
              View,
              { style: styles.section, key: 'notes' },
              [
                React.createElement(Text, { style: styles.sectionTitle, key: 'notes-title' }, 'NOTES'),
                React.createElement(Text, { style: styles.text, key: 'notes-content' }, contract.notes),
              ]
            ) : null,
            
            // Footer
            React.createElement(
              View,
              { style: styles.footer, key: 'footer' },
              [
                React.createElement(Text, { style: styles.boldText, key: 'notice-title' }, 'IMPORTANT NOTICE'),
                React.createElement(Text, { style: styles.notice, key: 'notice' }, 
                  'This document is a draft cohabitation agreement generated for informational purposes only. It should be reviewed by qualified legal counsel before signing. Alberta Family Contracts does not provide legal advice.'
                ),
                React.createElement(Text, { style: styles.footerInfo, key: 'gen-date' }, `Generated on: ${templateData.currentDate}`),
                React.createElement(Text, { style: styles.footerInfo, key: 'contract-id' }, `Contract ID: #${contract.id}`),
              ]
            )
          ].filter(Boolean)
        )
      )
    );

    // Generate the PDF
    const pdfStream = await pdf(MyDocument).toBlob();
    const pdfArrayBuffer = await pdfStream.arrayBuffer();
    
    console.log('Successfully generated PDF using @react-pdf/renderer');
    return new Uint8Array(pdfArrayBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF using @react-pdf/renderer:', error);
    throw error;
  }
}

function prepareTemplateData(contract: any, user: any) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getUserFirstName = () => {
    if (contract.userFirstName) return contract.userFirstName;
    if (contract.userFullName) return contract.userFullName.split(' ')[0];
    return '[Your First Name]';
  };

  const getPartnerFirstName = () => {
    if (contract.partnerFirstName) return contract.partnerFirstName;
    if (contract.partnerFullName) return contract.partnerFullName.split(' ')[0];
    return '[Partner First Name]';
  };

  return {
    userFullName: contract.userFullName || '[Your Name]',
    partnerFullName: contract.partnerFullName || '[Partner Name]',
    userFirstName: getUserFirstName(),
    partnerFirstName: getPartnerFirstName(),
    userIncome: contract.userIncome ? `$${parseInt(contract.userIncome).toLocaleString()} CAD` : '[Your Income]',
    partnerIncome: contract.partnerIncome ? `$${parseInt(contract.partnerIncome).toLocaleString()} CAD` : '[Partner Income]',
    currentDate: currentDate,
    cohabDate: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : currentDate,
  };
}