const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// We'll use raw SQL since we can't easily import the schema in this context
async function addSampleData() {
  try {
    console.log('Adding sample contract data...');
    
    // Find the admin user
    const adminResult = await sql`
      SELECT id FROM users WHERE email = 'garrett.horvath@gmail.com' LIMIT 1
    `;
    
    if (adminResult.length === 0) {
      console.log('Admin user not found');
      return;
    }
    
    const adminUserId = adminResult[0].id;
    
    // Find or create a team for the admin
    let teamResult = await sql`
      SELECT id FROM teams WHERE name = 'Garrett Horvath''s Team' LIMIT 1
    `;
    
    if (teamResult.length === 0) {
      teamResult = await sql`
        INSERT INTO teams (name, created_at, updated_at)
        VALUES ('Garrett Horvath''s Team', NOW(), NOW())
        RETURNING id
      `;
    }
    
    const teamId = teamResult[0].id;
    
    // Ensure admin is in the team
    await sql`
      INSERT INTO team_members (user_id, team_id, role, created_at, updated_at)
      VALUES (${adminUserId}, ${teamId}, 'owner', NOW(), NOW())
      ON CONFLICT (user_id, team_id) DO NOTHING
    `;
    
    // Sample contracts
    const sampleContracts = [
      {
        userFullName: 'Sarah Johnson',
        partnerFullName: 'Michael Chen',
        userJobTitle: 'Software Engineer',
        partnerJobTitle: 'Marketing Manager',
        userIncome: '95000',
        partnerIncome: '78000',
        userEmail: 'sarah.johnson@email.com',
        partnerEmail: 'michael.chen@email.com',
        userPhone: '(403) 555-0123',
        partnerPhone: '(403) 555-0124',
        userAddress: '1234 Maple Street NW, Calgary, AB T2N 1N4',
        partnerAddress: '5678 Oak Avenue SW, Calgary, AB T2S 2S8',
        residenceAddress: '9012 Pine Road NE, Calgary, AB T1Y 7A5',
        residenceOwnership: 'joint',
        expenseSplitType: 'proportional',
        additionalClauses: 'Both parties agree to maintain separate bank accounts while contributing to a joint household account for shared expenses. Property acquired during cohabitation will be owned jointly unless otherwise specified in writing.',
        notes: 'Review annually or upon significant life changes',
        contractType: 'cohabitation',
        status: 'draft'
      },
      {
        userFullName: 'Emma Rodriguez',
        partnerFullName: 'David Kim',
        userJobTitle: 'Registered Nurse',
        partnerJobTitle: 'Accountant',
        userIncome: '82000',
        partnerIncome: '89000',
        userEmail: 'emma.rodriguez@email.com',
        partnerEmail: 'david.kim@email.com',
        userPhone: '(780) 555-0234',
        partnerPhone: '(780) 555-0235',
        userAddress: '2468 Cedar Lane, Edmonton, AB T5K 2M4',
        partnerAddress: '1357 Birch Street, Edmonton, AB T6G 1B7',
        residenceAddress: '3691 Spruce Court, Edmonton, AB T5T 4C2',
        residenceOwnership: 'user',
        expenseSplitType: 'equal',
        additionalClauses: 'Pet ownership responsibilities: Emma will retain ownership of her cat, Whiskers. David will retain ownership of his dog, Max. Veterinary expenses for each pet will be the responsibility of the respective owner.',
        notes: 'Both parties are first-time homebuyers',
        contractType: 'cohabitation',
        status: 'completed'
      },
      {
        userFullName: 'Jessica Thompson',
        partnerFullName: 'Robert Wilson',
        userJobTitle: 'Elementary School Teacher',
        partnerJobTitle: 'Electrician',
        userIncome: '67000',
        partnerIncome: '74000',
        userEmail: 'jessica.thompson@email.com',
        partnerEmail: 'robert.wilson@email.com',
        userPhone: '(403) 555-0345',
        partnerPhone: '(403) 555-0346',
        userAddress: '7890 Willow Drive SW, Calgary, AB T3E 7H1',
        partnerAddress: '4567 Aspen Close NW, Calgary, AB T2K 5V3',
        residenceAddress: '1122 Elm Street SE, Calgary, AB T2G 3J8',
        residenceOwnership: 'partner',
        expenseSplitType: 'custom',
        additionalClauses: 'Child support arrangements: Jessica has one child from a previous relationship (Sophie, age 8). Robert agrees to contribute to household expenses but is not financially responsible for child-specific costs such as daycare, extracurricular activities, or medical expenses for Sophie.',
        notes: 'Blended family considerations included',
        contractType: 'cohabitation',
        status: 'draft'
      }
    ];
    
    // Insert sample contracts
    for (const contract of sampleContracts) {
      await sql`
        INSERT INTO family_contracts (
          user_id, team_id, user_full_name, partner_full_name,
          user_job_title, partner_job_title, user_income, partner_income,
          user_email, partner_email, user_phone, partner_phone,
          user_address, partner_address, residence_address, residence_ownership,
          expense_split_type, additional_clauses, notes, contract_type, status,
          created_at, updated_at
        ) VALUES (
          ${adminUserId}, ${teamId}, ${contract.userFullName}, ${contract.partnerFullName},
          ${contract.userJobTitle}, ${contract.partnerJobTitle}, ${contract.userIncome}, ${contract.partnerIncome},
          ${contract.userEmail}, ${contract.partnerEmail}, ${contract.userPhone}, ${contract.partnerPhone},
          ${contract.userAddress}, ${contract.partnerAddress}, ${contract.residenceAddress}, ${contract.residenceOwnership},
          ${contract.expenseSplitType}, ${contract.additionalClauses}, ${contract.notes}, ${contract.contractType}, ${contract.status},
          NOW(), NOW()
        )
      `;
      console.log(`Added contract: ${contract.userFullName} & ${contract.partnerFullName}`);
    }
    
    console.log('Sample data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();