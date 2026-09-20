import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = `1 Dr. Aashima Sharma Assistant Professor (C-II) (Research) aashima.sharma@thapar.edu 616 6
2 Dr. Abdul Kadir Assistant Professor (3C) abdul.kadir@thapar.edu 643 6
3 Dr. Abhishek Kesarwani Assistant Professor (3C) abhishek.kesarwani@thapar.edu 124 1
4 Dr. Aditi Sharma Assistant Professor-I Aditi.sharma@thapar.edu 512 5
5 Dr. Ajay Kumar Professor ajaykumar@thapar.edu 535 5
6 Dr. Amit Kumar Trivedi Assistant Professor-I amitkumar.trivedi@thapar.edu 548 5
7 Dr. Amrita Assistant Professor (C-II) amrita@thapar.edu 428 4
8 Dr. Amrita Dahiya Assistant Professor-I amrita.dahiya@thapar.edu 435 4
9 Dr. Anamika Sharma Assistant Professor-I anamika.sharma@thapar.edu 539 5
10 Dr. Ananya Pandey Assistant Professor-I ananya.pandey@thapar.edu 736 7
11 Dr. Anil Kumar Verma Professor akverma@thapar.edu 414 4
12 Dr. Anil Singh Assistant Professor-I anil.singh@thapar.edu 310 3
13 Dr. Anju Bala Professor anjubala@thapar.edu 419 4
14 Dr. Anjula Mehto Assistant Professor (Term) anjula.mehto@thapar.edu 502 5
15 Dr. Anu Bajaj Assistant Professor-II anu.bajaj@thapar.edu 424 4
16 Dr. Anurag Tiwari Assistant Professor (Term) anurag.tiwari@thapar.edu 737 7
17 Dr. Arun Singh Pundir Assistant Professor-I arun.pundir@thapar.edu 719 7
18 Dr. Arzoo Miglani Assistant Professor (C-II) (Research) arzoo.miglani@thapar.edu 736 7
19 Dr. Ashima Anand Assistant Professor-III ashima.anand@thapar.edu 540 5
20 Dr. Ashima Khosla Assistant Professor (T) ashima.khosla@thapar.edu 634 6
21 Dr. Ashima Singh Associate Professor ashima@thapar.edu 423 4
22 Dr. Ashish Bajaj Assistant Professor (T) ashish.bajaj@thapar.edu 608 6
23 Dr. Ashutosh Aggarwal Assistant Professor-III ashutosh.aggarwal@thapar.edu 523 5
24 Dr. Ashutosh Mishra Associate Professor ashutosh.mishra@thapar.edu 537 5
25 Dr. Chinmaya Panigrahy Assistant Professor-III chinmaya.panigrahy@thapar.edu 521 5
26 Dr. Chinu Assistant Professor (C-II) (Research) chinu@thapar.edu 743 7
27 Dr. Deep Mann Assistant Professor (C-II) deep.mann@thapar.edu 411 4
28 Dr. Deepshikha Tiwari Assistant Professor-II deepshikha.tiwari@thapar.edu 517 5
29 Dr. G.V. Eswara Rao Assistant Professor (3C) gveswara.rao@thapar.edu 737 7
30 Dr. Garima Singh Assistant Professor-I garima.singh@thapar.edu 522 5
31 Dr. Geeta Kasana Associate Professor-1 gkasana@thapar.edu 513 5
32 Dr. Gurpal Singh Chhabra Assistant Professor (T) gurpal.singh@thapar.edu 527 5
33 Ms. Gursimran Kaur Assistant Professor JR gursimran.kaur@thapar.edu 649 6
34 Dr. Harkiran Kaur Assistant Professor (C-II) harkiran.kaur@thapar.edu 525 5
35 Dr. Harpreet Singh Assistant Professor-I harpreet.singh1@thapar.edu 124 1
36 Dr. Harpreet Singh Assistant Professor (C-II) harpreet.s@thapar.edu 309 3
37 Dr. Himanshu Gauttam Assistant Professor-I himanshu.gauttam@thapar.edu 720 7
38 Dr. Himika Sharma Assistant Professor (T) himika.sharma@Thapar.edu 304 3
39 Dr. Husanbir Singh Pannu Assistant Professor-III hspannu@thapar.edu 554 5
40 Dr. Inderveer Chana Professor inderveer@thapar.edu 425 4
41 Dr. Jaskirat Singh Assistant Professor-I jaskirat.singh@thapar.edu 431 4
42 Dr. Jasleen Kaur Assistant Professor (C-II) (Research) jasleen.kaur@thapar.edu 612 6
43 Dr. Jasmeet Singh Assistant Professor-III jasmeet.singh@thapar.edu 526 5
44 Dr. Jasmine Kaur Assistant Professor (C-II) (Research) jasmine.kaur1@thapar.edu 740 7
45 Dr. Jaspinder Kaur Assistant Professor-I jaspinder.kaur@thapar.edu 610 6
46 Dr. Jatin Bedi Associate Professor jatin.bedi@thapar.edu 552 5
47 Dr. Javed Imran Assistant Professor-I Javed.imran@thapar.edu 532 5
48 Dr. Jayendra Barua Assistant Professor (C-II) jayendra.barua@thapar.edu 547 5
49 Dr. Jhilik Bhattacharya Associate Professor jhilik@thapar.edu 516 5
50 Dr. Jinee Goyal Assistant Professor-I jinee.goyal@thapar.edu 412 4
51 Dr. Jyoti Assistant Professor-I jyoti.maggu@thapar.edu 541 5
52 Dr. Jyoti Assistant Professor-I jyoti@thapar.edu 652 6
53 Dr. Kapil Rana Assistant Professor-I kapil.rana@thapar.edu 639 6
54 Dr. Kapil Tomar Assistant Professor (3C) kapil.tomar@thapar.edu 735 7
55 Dr. Karamjeet Singh Assistant Professor-III karamjeet.singh@thapar.edu 538 5
56 Dr. Karun Verma Associate Professor karun.verma@thapar.edu 546 5
57 Dr. Kashish Goyal Assistant Professor (C-II) (Research) kashish.goyal@thapar.edu 614 6
58 Dr. Komal Bharti Assistant Professor (3C) komal.bharti@thapar.edu 650 6
59 Dr. Kuntal Chowdhury Assistant Professor-I kuntal.chowdhury@thapar.edu 437 4
60 Dr. Lovi Dhamija Assistant Professor-I lovi.dhamija@thapar.edu 712 7
61 Dr. Mahak Gambhir Assistant Professor (T) mahak.gambhir@Thapar.edu 502 5
62 Dr. Mandeep Kaur Assistant Professor-I mandeep.bajwa@thapar.edu 718 7
63 Dr. Maninder Kaur Associate Professor manindersohal@thapar.edu 542 5
64 Dr. Maninder Singh Professor msingh@thapar.edu 426 4
65 Dr. Manish Kumar Assistant Professor (T) manish.kumar1@thapar.edu 561 5
66 Dr. Manisha Malik Assistant Professor-I manisha.malik@thapar.edu 611 6
67 Dr. Manisha Panjeta Assistant Professor-I manisha.panjeta@thapar.edu 438 4
68 Dr. Manju Assistant Professor-III manju.khurana@thapar.edu 510 5
69 Dr. Manpreet Singh Assistant Professor-I manpreet.singh1@thapar.edu 717 7
70 Dr. Mansi Sharma Assistant Professor-II mansi.sharma@thapar.edu 12 0
71 Dr. Neenu Garg Assistant Professor (C-II) neenu.garg@thapar.edu 549 5
72 Dr. Neeraj Kumar Professor neeraj.kumar@thapar.edu 534 5
73 Dr. Nidhi Chakravarty Assistant Professor (3C) nidhi.chakravarty@thapar.edu 739 7
74 Dr. Nidhi Kalra Associate Professor nidhi.kalra@thapar.edu 543 5
75 Dr. Nitigya Sambyal Assistant Professor-I nitigya.sambyal@thapar.edu 420 4
76 Dr. Nitin Arora Assistant Professor-I nitin.arora@thapar.edu 529 5
77 Dr. Nitin Saxena Assistant Professor-III nitin.saxena@thapar.edu 518 5
78 Dr. Palika Chopra Assistant Professor-I palika.chopra@thapar.edu 553 5
79 Dr. Paluck Arora Assistant Professor (C-II) (Research) paluck.arora@thapar.edu 613 6
80 Dr. Prashant S. Rana Associate Professor prashant.singh@thapar.edu 551 5
81 Ms. Priya Raina Assistant Professor JR priya.raina@Thapar.edu 649 6
82 Dr. Raghav B. Venkataramaiyer Assistant Professor-I bv.raghav@thapar.edu 734 7
83 Dr. Rahul Nijhawan Assistant Professor-I rahul.nijhawan@Thapar.Edu 708 7
84 Dr. Rajendra Kumar Roul Associate Professor-1 raj.roul@thapar.edu 508 5
85 Dr. Rajesh Kumar Professor rakumar@thapar.edu 416 4
86 Dr. Rajesh Mehta Associate Professor rajesh.mehta@thapar.edu 507 5
87 Dr. Rajiv Kumar Associate Professor rkumar@thapar.edu 533 5
88 Dr. RajKumar Tekchandani Associate Professor-1 rtekchandani@thapar.edu 504 5
89 Dr. Raman Kumar Goyal Assistant Professor-III ramankumar.goyal@thapar.edu 506 5
90 Dr. Ravi kant Assistant Professor (3C) ravi.kant1@thapar.edu 735 7
91 Dr. Ravinder Kumar Associate Professor ravinder@thapar.edu 415 4
92 Dr. Ravneet Kaur Assistant Professor-I ravneet.kaur1@thapar.edu 524 5
93 Dr. Ravneet Kaur Assistant Professor (C-II) (Research) ravneet@thapar.edu 711 7
94 Dr. Ravneet Kaur Assistant Professor (C-II) (Research) ravneet.kaur@thapar.edu 651 6
95 Dr. Rinkle Rani Professor raggarwal@thapar.edu 544 5
96 Dr. Ritesh Sharma Assistant Professor-I ritesh.sharma1@Thapar.edu 607 6
97 Dr. Rohan Sharma Assistant Professor-I rohan.sharma@thapar.edu 536 5
98 Dr. Rohit Ahuja Assistant Professor-III rohit.ahuja@thapar.edu 555 5
99 Dr. Rupali Bhardwaj Associate Professor rupali.bhardwaj@thapar.edu 515 5
100 Dr. Sachin Kansal Associate Professor sachin.kansal@thapar.edu 305 3
101 Dr. Saif Dilavar Nalband Assistant Professor-I saif.nalband@thapar.edu 710 7
102 Dr. Samya Muhuri Assistant Professor-II samya.muhuri@thapar.edu 434 4
103 Dr. Sandeep Verma Assistant Professor (C-II) (Research) sandeep.verma@thapar.edu 417 4
104 Dr. Sangita Roy Assistant Professor-III sangita.roy@thapar.edu 514 5
105 Dr. Sanju Kumari Singh Assistant Professor (C-II) (Research) Sanju.singh@thapar.edu 654 6
106 Dr. Satbir Singh Assistant Professor (C-II) (Research) satbir.singh@Thapar.edu 647 6
107 Dr. Saurabh Arora Assistant Professor (3C) saurabh.arora@thapar.edu 738 7
108 Dr. Seema Bawa Professor seema@thapar.edu 427 4
109 Dr. Seema Wazarkar Assistant Professor-I seema.wazarkar@thapar.edu 556 5
110 Dr. Seemu Sharma Assistant Professor (C-II) seemu.sharma@thapar.edu 123 1
111 Dr. Shabnam Bawa Assistant Professor (C-II) (Research) shabnam.bawa@thapar.edu 615 6
112 Dr. Shaheen Usmani Assistant Professor-I shaheen@thapar.edu 721 7
113 Dr. Shailendra Tiwari Associate Professor-1 shailendra@thapar.edu 519 5
114 Dr. Shalini Batra Professor sbatra@thapar.edu 545 5
115 Dr. Sharad Saxena Associate Professor sharad.saxena@thapar.edu 122 1
116 Dr. Shashank Singh Assistant Professor-I shashank.singh@thapar.edu 557 5
117 Dr. Shivani Sharma Assistant Professor-II shivani.sharma@thapar.edu 558 5
118 Ms. Shivani Goswami Assistant Professor (3C) shivani.goswami@thapar.edu 617 6
119 Dr. Shivendra Shivani Associate Professor-1 shivendra.shivani@thapar.edu 520 5
120 Dr. Shubhra Dwivedi Assistant Professor (Term) shubhra.dwivedi@thapar.edu 125 1
121 Dr. Simran Setia Assistant Professor-I simran.setia@thapar.edu 716 7
122 Dr. Simranjit Kaur Assistant Professor-II simranjit.kaur@thapar.edu 509 5
123 Dr. Smita Agarwal Assistant Professor-I smita.agrawal@thapar.edu 560 5
124 Dr. Sourav Roy Assistant Professor-I sourav.roy@thapar.edu 738 7
125 Dr. Stuti Chug Assistant Professor (3C) stuti.chug@thapar.edu 411 4
126 Dr. Subhrendu Chattopadhyay Assistant Professor-I subhrendu.chattopadhyay@thapar.edu 707 7
127 Dr. Sujata Rani Assistant Professor (C-II) sujata.singla@thapar.edu 123 1
128 Dr. Sumit Bansal Assistant Professor (C-II) (Research) sumit.bansal@thapar.edu 641 6
129 Dr. Sumit Kumar Assistant Professor-I kumar.sumit@thapar.edu 433 4
130 Dr. Sumit Kumar Varshney Assistant Professor-I sumit.kumar2@thapar.edu 713 7
131 Mr. Sumit Miglani Assistant Professor-I smiglani@thapar.edu 503 5
132 Dr. Sumit Sharma Assistant Professor-I sumit.sharma@thapar.edu 125 1
133 Dr. Sunita Garhwal Associate Professor sgarhwal@thapar.edu 559 5
134 Dr. Surabhi Sharma Assistant Professor (C-II) surabhi.sharma@thapar.edu 304 3
135 Dr. Suresh Chandra Raikwar Assistant Professor-III suresh.raikwar@thapar.edu 550 5
136 Dr. Suresh Kumar Assistant Professor-I suresh.kumar1@thapar.edu 733 7
137 Dr. Surjit Singh Assistant Professor-II surjit.singh@thapar.edu 528 5
138 Dr. Sushma Jain Associate Professor sjain@thapar.edu 422 4
139 Dr. Swati Sharma Assistant Professor (Term) Swati.sharma@thapar.edu 438 4
140 Dr. Tanya Garg Assistant Professor (C-I) tanya.garg@thapar.edu 435 4
141 Mr. Tushar Semwal Assistant Professor JR tushar.semwal@thapar.edu 734 7
142 Dr. Tarunpreet Bhatia Associate Professor tarunpreet@thapar.edu 421 4
143 Dr. V.P. Singh Associate Professor vpsingh@thapar.edu 432 4
144 Dr. Vaibhav Agarwal Assistant Professor (C-II) vaibhav.agarwal@thapar.edu 309 3
145 Dr. Vaibhav Pandey Assistant Professor-I vaibhav.pandey@thapar.edu 511 5
146 Dr. Vaishali Kansal Assistant Professor-I vaishali.kansal@thapar.edu 653 6
147 Dr. Vibha Jain Assistant Professor-I vibha.jain@thapar.edu 618 6
148 Dr. Vijay Kumari Assistant Professor (3C) vijay.kumari@thapar.edu 428 4
149 Dr. Vikramjit Singh Assistant Professor-I vikramjit.bhathal@thapar.edu 709 7
150 Dr. Vinay Arora Associate Professor vinay.arora@thapar.edu 418 4
151 Dr. Vinod K. Bhalla Associate Professor vkbhalla@thapar.edu 436 4
152 Dr. Vishal Mehra Assistant Professor (3C) vishal.mehra@thapar.edu 643 6
153 Dr. Yadwinder Singh Assistant Professor (C-II) yadwinder@thapar.edu 547 5`;

async function main() {
  try {
    console.log("Parsing teacher data...");
    const lines = rawData.split('\n').filter(l => l.trim() !== '');
    const newTeachers = [];
    
    // Parse the lines
    // Example line: 1 Dr. Aashima Sharma Assistant Professor (C-II) (Research) aashima.sharma@thapar.edu 616 6
    for (const line of lines) {
      // Find the email address using regex
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@thapar\.edu/i);
      if (!emailMatch) {
        console.log("Could not find email in line:", line);
        continue;
      }
      
      const email = emailMatch[0].toLowerCase();
      
      // Split the line before the email
      const preEmail = line.substring(0, emailMatch.index).trim();
      
      // The format starts with a number. Remove it.
      const matchStart = preEmail.match(/^\d+\s+(.*)/);
      let textWithoutNum = matchStart ? matchStart[1] : preEmail;
      
      // We need to separate Name and Designation.
      // E.g., "Dr. Aashima Sharma Assistant Professor (C-II) (Research)"
      // E.g., "Ms. Gursimran Kaur Assistant Professor JR"
      // E.g., "Dr. Ajay Kumar Professor"
      
      // Known designations to split on
      const designations = [
        "Assistant Professor (C-II) (Research)",
        "Assistant Professor (C-II)",
        "Assistant Professor (C-I)",
        "Assistant Professor (3C)",
        "Assistant Professor-I",
        "Assistant Professor-II",
        "Assistant Professor-III",
        "Assistant Professor (Term)",
        "Assistant Professor (T)",
        "Assistant Professor JR",
        "Associate Professor-1",
        "Associate Professor",
        "Professor"
      ];
      
      let name = "";
      let designation = "Faculty";
      
      for (const des of designations) {
        const idx = textWithoutNum.indexOf(des);
        if (idx !== -1) {
          name = textWithoutNum.substring(0, idx).trim();
          designation = textWithoutNum.substring(idx).trim();
          break;
        }
      }
      
      if (!name) {
        console.log("Could not parse name/designation:", textWithoutNum);
        continue;
      }
      
      const postEmail = line.substring(emailMatch.index + emailMatch[0].length).trim();
      let roomNumber = null;
      if (postEmail) {
        // usually format is "616 6" (room floor)
        // just take the first part as room number
        const parts = postEmail.split(/\s+/);
        if (parts.length > 0 && parts[0]) {
          roomNumber = parts[0];
        }
      }
      
      newTeachers.push({
        fullName: name,
        email: email,
        designation: designation,
        department: "CSED",
        roomNumber: roomNumber
      });
    }
    
    console.log("Parsed " + newTeachers.length + " teachers from the list.");
    
    // Now, get all teachers from the database
    console.log("Fetching existing teachers...");
    const existingTeachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: { teacherProfile: true }
    });
    
    console.log("Found " + existingTeachers.length + " existing teachers in the database.");
    
    // We want to KEEP Anjula Mehto and B V Raghav
    const emailsToKeep = [
      "anjula.mehto@thapar.edu", 
      "bv.raghav@thapar.edu",
      "bvraghav@thapar.edu" // just in case
    ];
    
    const teachersToDelete = existingTeachers.filter(t => {
      // Don't delete if their email is in the keep list, or their name matches
      const profile = t.teacherProfile;
      if (profile && (
        profile.fullName.toLowerCase().includes("anjula mehto") || 
        profile.fullName.toLowerCase().includes("anjula metho") ||
        profile.fullName.toLowerCase().includes("raghav") ||
        profile.fullName.toLowerCase().includes("bv raghav")
      )) {
        return false; // KEEP
      }
      if (emailsToKeep.includes(t.email.toLowerCase())) {
        return false; // KEEP
      }
      return true; // DELETE
    });
    
    console.log("Deleting " + teachersToDelete.length + " teachers...");
    const idsToDelete = teachersToDelete.map(t => t.id);
    
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
    console.log("Deleted " + deleteResult.count + " users.");
    
    // Now seed the new teachers
    console.log("Seeding new teachers...");
    let addedCount = 0;
    
    for (const t of newTeachers) {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: t.email }
      });
      
      if (!existing) {
        await prisma.user.create({
          data: {
            email: t.email,
            passwordHash: "PENDING",
            role: "TEACHER",
            isEmailVerified: true,
            isProfileComplete: true,
            teacherProfile: {
              create: {
                fullName: t.fullName,
                department: t.department,
                designation: t.designation,
                roomNumber: t.roomNumber
              }
            }
          }
        });
        addedCount++;
      } else {
        // Just update their profile if they already exist
        await prisma.teacherProfile.upsert({
          where: { userId: existing.id },
          update: {
            fullName: t.fullName,
            department: t.department,
            designation: t.designation,
            roomNumber: t.roomNumber
          },
          create: {
            userId: existing.id,
            fullName: t.fullName,
            department: t.department,
            designation: t.designation,
            roomNumber: t.roomNumber
          }
        });
      }
    }
    
    console.log("Successfully added/updated " + addedCount + " new teachers.");
    
  } catch (err) {
    console.error("Error updating teachers:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
