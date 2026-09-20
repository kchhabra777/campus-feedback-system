import prisma from '../lib/prisma.js'; 

async function main() { 
  await prisma.teacherProfile.updateMany({ 
    data: { department: 'CSED' } 
  }); 

  const raghav = await prisma.teacherProfile.findFirst({ 
    where: { fullName: { contains: 'Raghav' } } 
  }); 

  if (raghav) { 
    await prisma.teacherProfile.update({ 
      where: { id: raghav.id }, 
      data: { designation: 'Assistant Professor-I', fullName: 'Dr. Raghav B. Venkataramaiyer' } 
    }); 
    console.log('Updated Raghav:', raghav.fullName); 
  } 

  console.log('All departments updated to CSED.'); 
  process.exit(0); 
} 

main();
