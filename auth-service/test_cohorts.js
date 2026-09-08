import { getEligibleTeachersForStudent } from './src/services/courseService.js';

async function test() {
  const testBatches = [
    { batch: '1A11', branch: 'ENGINEERING' },
    { batch: '1B11', branch: 'ENGINEERING' },
    { batch: '2C11', branch: 'COE' },
    { batch: '2Q11', branch: 'CSE' },
    { batch: '3C11', branch: 'COE' },
    { batch: '3Q11', branch: 'CSE' },
    { batch: '4C11', branch: 'COE' },
    { batch: '1MCA1', branch: 'MCA' }
  ];

  for (const t of testBatches) {
    const teachers = await getEligibleTeachersForStudent({ batch: t.batch, branch: t.branch });
    console.log('Cohort ' + t.batch + ' (' + t.branch + '): ' + teachers.length + ' eligible teachers found.');
    if (teachers.length > 0) {
      const sample = teachers.slice(0, 3).map(x => x.fullName + ' (' + x.courses.map(c => c.courseCode + '-' + c.ltp).join(', ') + ')').join(' | ');
      console.log('   Sample: ' + sample);
    }
  }
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
