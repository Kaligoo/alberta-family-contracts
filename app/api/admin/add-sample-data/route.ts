import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'User not in team' }, { status: 400 });
    }

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
    const results = [];
    for (const contract of sampleContracts) {
      const result = await db
        .insert(familyContracts)
        .values({
          userId: user.id,
          teamId: userWithTeam.teamId,
          userFullName: contract.userFullName,
          partnerFullName: contract.partnerFullName,
          userJobTitle: contract.userJobTitle,
          partnerJobTitle: contract.partnerJobTitle,
          userIncome: contract.userIncome,
          partnerIncome: contract.partnerIncome,
          userEmail: contract.userEmail,
          partnerEmail: contract.partnerEmail,
          userPhone: contract.userPhone,
          partnerPhone: contract.partnerPhone,
          userAddress: contract.userAddress,
          partnerAddress: contract.partnerAddress,
          residenceAddress: contract.residenceAddress,
          residenceOwnership: contract.residenceOwnership,
          expenseSplitType: contract.expenseSplitType,
          additionalClauses: contract.additionalClauses,
          notes: contract.notes,
          contractType: contract.contractType,
          status: contract.status
        })
        .returning();
      
      results.push(result[0]);
    }

    return NextResponse.json({ 
      message: 'Sample data added successfully',
      contracts: results
    });

  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json(
      { error: 'Failed to add sample data' },
      { status: 500 }
    );
  }
}