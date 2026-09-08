import json
import re

with open('thapar_parsed_offerings.json') as f:
    d = json.load(f)

def expand_batches(batch_code):
    # E.g. 3Q1, 3C1, 3E1
    m = re.match(r'^(\d[A-Z]\d)$', batch_code)
    if m:
        prefix = m.group(1)
        subgroups = [f"{prefix}{i}" for i in range(1, 9)]
        return [batch_code] + subgroups
    
    # E.g. practical '3Q1A' -> '3Q11'
    m_prac = re.match(r'^(\d[A-Z]\d)([A-H])$', batch_code)
    if m_prac:
        prefix = m_prac.group(1)
        letter = m_prac.group(2)
        idx = ord(letter) - ord('A') + 1
        tut_code = f"{prefix}{idx}"
        return [batch_code, tut_code]
        
    return [batch_code]

# Group by (teacherCode, courseCode, ltp)
grouped = {}
for o in d['offerings']:
    t = o['teacherCode']
    if t == '(---)' or len(t) < 2:
        continue
    key = (t, o['courseCode'], o['ltp'])
    if key not in grouped:
        grouped[key] = {
            'teacherCode': t,
            'courseCode': o['courseCode'],
            'courseName': o['courseName'],
            'ltp': o['ltp'],
            'branchTaught': o['branchTaught'],
            'batches': set()
        }
    for b in expand_batches(o['batchTaught']):
        grouped[key]['batches'].add(b)

# Build teachers dictionary with departments
TEACHER_DEPT = {
    # CSED
    'ASB': ('Prof. Ashima Singh', 'Computer Science & Engineering', 'Professor'),
    'TAG': ('Prof. Tarun Agrawal', 'Computer Science & Engineering', 'Associate Professor'),
    'RKG': ('Prof. Rajesh Kumar Goel', 'Computer Science & Engineering', 'Professor'),
    'ABK': ('Prof. Abhishek Kumar', 'Computer Science & Engineering', 'Assistant Professor'),
    'ANP': ('Prof. Anupam Sharma', 'Computer Science & Engineering', 'Associate Professor'),
    'SMR': ('Prof. Seema Bawa', 'Computer Science & Engineering', 'Professor'),
    'YAS': ('Prof. Yashwant Singh', 'Computer Science & Engineering', 'Associate Professor'),
    'YAD': ('Prof. Yadwinder Singh', 'Computer Science & Engineering', 'Assistant Professor'),
    'KML': ('Prof. Karminder Singh', 'Computer Science & Engineering', 'Assistant Professor'),
    'JAB': ('Prof. Jasmeet Singh', 'Computer Science & Engineering', 'Assistant Professor'),
    'AAS': ('Prof. Aastha', 'Computer Science & Engineering', 'Assistant Professor'),
    'SOR': ('Prof. Sorabh', 'Computer Science & Engineering', 'Assistant Professor'),
    'GVR': ('Prof. Gaurav', 'Computer Science & Engineering', 'Assistant Professor'),
    'DBD': ('Prof. Debaldatta', 'Computer Science & Engineering', 'Assistant Professor'),
    'SKK': ('Prof. Sukhminder', 'Computer Science & Engineering', 'Assistant Professor'),
    'MJU': ('Prof. Maninder', 'Computer Science & Engineering', 'Assistant Professor'),
    'DSH': ('Prof. Disha', 'Computer Science & Engineering', 'Assistant Professor'),
    'MHK': ('Prof. Meenakshi', 'Computer Science & Engineering', 'Assistant Professor'),
    'MKB': ('Prof. Mukesh', 'Computer Science & Engineering', 'Assistant Professor'),
    'NIS': ('Prof. Nishu', 'Computer Science & Engineering', 'Assistant Professor'),
    'SUR': ('Prof. Suresh', 'Computer Science & Engineering', 'Assistant Professor'),
    'MJS': ('Prof. Manjot Singh', 'Computer Science & Engineering', 'Assistant Professor'),
    'JBD': ('Prof. J.B. Dahiya', 'Computer Science & Engineering', 'Assistant Professor'),
    'SHI': ('Prof. Shikha', 'Computer Science & Engineering', 'Assistant Professor'),
    'AMO': ('Prof. Amit Ojha', 'Computer Science & Engineering', 'Assistant Professor'),
    'AA': ('Prof. Anshul Agarwal', 'Computer Science & Engineering', 'Assistant Professor'),
    'NF1': ('Faculty NF-1', 'Computer Science & Engineering', 'Assistant Professor'),
    'NF2': ('Faculty NF-2', 'Computer Science & Engineering', 'Assistant Professor'),
    'SAU': ('Prof. Saurabh', 'Computer Science & Engineering', 'Assistant Professor'),
    'MCL': ('Prof. M.C. Lohani', 'Computer Science & Engineering', 'Assistant Professor'),
    'MMK': ('Prof. M.M. Kundu', 'Computer Science & Engineering', 'Assistant Professor'),
    'RGB': ('Prof. R.G. Babbar', 'Computer Science & Engineering', 'Assistant Professor'),
    'SJ': ('Prof. Sanjeev Jain', 'Computer Science & Engineering', 'Assistant Professor'),
    'ASA': ('Prof. A.S. Arora', 'Computer Science & Engineering', 'Assistant Professor'),
    'SR': ('Prof. S. Rattan', 'Computer Science & Engineering', 'Assistant Professor'),
    'ABD': ('Prof. Abid', 'Computer Science & Engineering', 'Assistant Professor'),
    # ECE / EED
    'GK': ('Prof. Gagan Kaur', 'Electronics & Communication Engg', 'Assistant Professor'),
    'RPN': ('Prof. R.P. Narwaria', 'Electronics & Communication Engg', 'Assistant Professor'),
    'ABP': ('Prof. Abhay Pal', 'Electronics & Communication Engg', 'Assistant Professor'),
    'MBK': ('Prof. M.B. Kalsi', 'Electrical & Instrumentation Engg', 'Associate Professor'),
    'PBK': ('Prof. P.B. Kumar', 'Electrical & Instrumentation Engg', 'Assistant Professor'),
    'MDL': ('Prof. M.D. Lahiri', 'Electrical & Instrumentation Engg', 'Assistant Professor'),
    'KL': ('Prof. Kundan Lal', 'Mechanical Engineering', 'Assistant Professor'),
    'SKM': ('Prof. S.K. Mohapatra', 'Mechanical Engineering', 'Professor'),
    'GB': ('Prof. Gagan Bansal', 'Mechanical Engineering', 'Assistant Professor'),
    'RSJ': ('Prof. R.S. Joshi', 'Mechanical Engineering', 'Associate Professor'),
    'DK': ('Prof. Deepak Kumar', 'Mechatronics Engineering', 'Assistant Professor'),
    'BJS': ('Prof. B.J. Singh', 'Robotics & AI', 'Assistant Professor'),
    'SPP': ('Prof. S.P. Pandey', 'Robotics & AI', 'Assistant Professor'),
    'VPR': ('Prof. V.P. Roy', 'Robotics & AI', 'Assistant Professor'),
    'SKA': ('Prof. S.K. Ahuja', 'Chemical Engineering', 'Associate Professor'),
    'BB': ('Prof. B. Bhushan', 'Biotechnology', 'Professor'),
    'VKH': ('Prof. V.K. Hans', 'Biotechnology', 'Assistant Professor'),
    'DNR': ('Prof. D.N. Rai', 'Civil Engineering', 'Associate Professor'),
    'TNC': ('Prof. T.N. Choudhury', 'Civil Engineering', 'Assistant Professor'),
    'HS': ('Prof. Harpreet Singh', 'Civil & Computer Engg', 'Assistant Professor'),
    'SAH': ('Prof. Sahil Sharma', 'Electrical & Computer Engg', 'Assistant Professor'),
    'DM': ('Prof. D. Mukherjee', 'Biomedical Engineering', 'Assistant Professor'),
    'RAJ': ('Prof. Raj Kumar', 'Computer Science & Business', 'Assistant Professor'),
    'SUG': ('Prof. Sugandha', 'Electronics & Computer Engg', 'Assistant Professor'),
    'SUS': ('Prof. Sushil', 'Electronics & Communication Engg', 'Assistant Professor'),
    'SP': ('Prof. S. Pathak', 'VLSI Design', 'Assistant Professor'),
    'MA': ('Prof. M. Aggarwal', 'VLSI Design', 'Assistant Professor')
}

offerings_list = []
teachers_map = {}

for k, val in grouped.items():
    t_code = val['teacherCode']
    
    # Format Teacher Profile
    if t_code not in teachers_map:
        if t_code in TEACHER_DEPT:
            f_name, dept, desig = TEACHER_DEPT[t_code]
        elif t_code.endswith('-RA') or t_code.endswith('-TA') or t_code.endswith('-RF'):
            f_name = f"Instructor {t_code}"
            dept = "Computer Science & Engineering" if "COMP" in val['branchTaught'] else "Engineering Department"
            desig = "Teaching Associate / Research Scholar"
        else:
            f_name = f"Prof. {t_code}"
            dept = "Computer Science & Engineering" if "COMP" in val['branchTaught'] else "Engineering Department"
            desig = "Assistant Professor"

        clean_email = re.sub(r'[^a-z0-9]', '', t_code.lower())
        teachers_map[t_code] = {
            "code": t_code,
            "fullName": f_name,
            "email": f"{clean_email}@thapar.edu",
            "department": dept,
            "designation": desig
        }

    # Format offering
    sorted_batches = sorted(list(val['batches']))
    batch_str = ", ".join(sorted_batches)
    offerings_list.append({
        "teacherCode": t_code,
        "courseCode": val['courseCode'],
        "courseName": val['courseName'],
        "batchTaught": batch_str,
        "branchTaught": val['branchTaught'],
        "academicYear": "2026-2027 ODD",
        "ltp": val['ltp']
    })

output_data = {
    "teachers": list(teachers_map.values()),
    "offerings": offerings_list
}

with open('auth-service/src/scripts/timetable_data.json', 'w') as f:
    json.dump(output_data, f, indent=2)

print(f"Generated timetable_data.json with {len(teachers_map)} teachers and {len(offerings_list)} course offerings!")
