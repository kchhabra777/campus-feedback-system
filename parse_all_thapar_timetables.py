import csv
import re
import json
import os

COURSE_NAMES = {
    # 1st Year
    "UES101": "Engineering Drawing & Design",
    "UES102": "Manufacturing Processes",
    "UES103": "Programming for Problem Solving",
    "UMA022": "Mathematics - I",
    "UMA023": "Mathematics - II",
    "UPH013": "Physics",
    "UPH014": "Modern Physics",
    "UPH015": "Applied Physics",
    "UHU003": "Professional Communication",
    "UEN008": "Environmental Science",
    "UCB009": "Chemistry",
    "UCT101": "Business Computing Systems",
    "UCT104": "Principles of Economics",
    "UBM001": "Introduction to Biomedical Engineering",
    "UEE002": "Electrical Engineering Fundamentals",

    # 2nd Year
    "UCS301": "Data Structures & Algorithms",
    "UCS303": "Operating Systems",
    "UCS320": "Computer Architecture & Organization",
    "UCS321": "Object Oriented Programming",
    "UCS405": "Discrete Mathematical Structures",
    "UMA021": "Numerical Analysis",
    "UMA028": "Linear Algebra",
    "UMA301": "Discrete Mathematics",
    "UMA302": "Probability & Statistics",
    "UTA016": "Engineering Design Project - I",
    "UTA018": "Object Oriented Programming Laboratory",
    "UTA030": "Experiential Learning",
    "UTA036": "Design Thinking & Innovation",
    "UEI301": "Analog Electronic Circuits",
    "UEI408": "Linear Integrated Circuits",
    "UEE301": "Direct Current Machines & Transformers",
    "UEE307": "Electrical Measurements & Instruments",
    "ULC301": "Digital Electronics",
    "ULC302": "Signals and Systems",
    "ULC303": "Network Analysis & Synthesis",
    "UME309": "Machine Drawing & CAD",
    "UME517": "Fluid Mechanics & Machinery",
    "UMT404": "Kinematics of Machines",
    "UMT306": "Dynamics of Machinery",
    "URA301": "Robotic Sensors",
    "URA302": "Actuators & Drives",
    "UCH301": "Material & Energy Balances",
    "UCH302": "Fluid Flow Operations",
    "UCH306": "Heat Transfer Operations",
    "UCH307": "Chemical Engineering Thermodynamics",
    "UBT307": "Microbiology & Cell Biology",
    "UBT308": "Biochemistry",
    "UBT309": "Molecular Biology",
    "UBT310": "Biophysics & Structural Biology",
    "UCE306": "Surveying & Geomatics",
    "UCE308": "Fluid Mechanics",
    "UCE310": "Strength of Materials",
    "UCE312": "Building Materials & Construction",
    "UCC302": "Infrastructure Planning & Management",
    "UCC305": "Surveying & Spatial Informatics",
    "UCC306": "Structural Mechanics",
    "UEC304": "Digital Logic Design",
    "UEC311": "Electronic Circuit Analysis",
    "UEC612": "Communication Systems",
    "UVD301": "Semiconductor Physics & Devices",
    "UVD302": "Analog CMOS IC Design",
    "UNC302": "Microprocessors & Microcontrollers",
    "UNC305": "Computer Networks",
    "UNC401": "Embedded Systems",
    "UNC501": "Wireless Communications",
    "UAI301": "Foundations of AI & Expert Systems",
    "UAI302": "Data Science & Analytics",
    "UCT203": "Business Economics & Strategy",
    "UCT301": "Software Engineering for Business",

    # 3rd Year
    "UCS503": "Software Engineering",
    "UCS615": "Advanced Computer Networks",
    "UCS510": "Database Management Systems",
    "UCS421": "Artificial Intelligence",
    "UCS553": "Information Security & Technologies",
    "UML501": "Machine Learning",
    "UCS420": "Computer Graphics",
    "UCS539": "Cloud Computing",
    "UCS531": "Cloud Infrastructure & Virtualization",
    "UCS532": "Cyber Forensics & Incident Handling",
    "UCS548": "Blockchain Technologies",
    "UMC513": "Mobile Application Development",
    "UCS534": "Big Data Analytics",
    "UCS537": "Natural Language Processing",
    "UCS542": "Deep Learning Architectures",
    "UCS668": "Quantum Computing",
    "UCS550": "Internet of Things & Embedded Systems",
    "UCS551": "Software Quality & Testing",
    "UAI501": "Foundations of AI",
    "UAI502": "Deep Learning Applications",
    "UAI503": "Computer Vision",
    "UAI504": "Reinforcement Learning",
    "UCI502": "Smart Connected Systems",
    "UEI601": "Process Dynamics & Control",
    "UEI604": "Microprocessors & Microcontrollers",
    "UEI608": "Industrial Instrumentation",
    "UEI306": "Transducers & Signal Conditioning",
    "UEI501": "Measurement & Instrumentation",
    "UEI831": "Biomedical Instrumentation",
    "UEI614": "Industrial Automation & Control",
    "UEE504": "Power Systems Analysis",
    "UEE508": "Electrical Power Transmission",
    "UEE510": "Control Systems Engineering",
    "UEE512": "Electrical Machines & Drives",
    "UEE514": "Power Electronics & Energy Systems",
    "UEE527": "Renewable Energy Technologies",
    "UME718": "Heat Transfer & Thermal Power",
    "UME404": "Mechanics of Deformable Bodies",
    "UME408": "Kinematics & Dynamics of Machines",
    "UME511": "Advanced Manufacturing Processes",
    "UME633": "Refrigeration & Air Conditioning",
    "UME720": "Design of Mechanical Elements",
    "UME725": "CAD/CAM & Digital Manufacturing",
    "UMT403": "Sensors, Actuators & Signal Conditioning",
    "UMT503": "Microcontroller Based System Design",
    "UMT504": "Robotics & Automation",
    "UMT521": "Mechatronics System Design",
    "UMT802": "Intelligent Mechatronic Systems",
    "URA521": "Robotic Kinematics & Autonomous Systems",
    "UCH501": "Chemical Reaction Engineering",
    "UCH506": "Chemical Process Technology",
    "UCH509": "Mass Transfer Operations",
    "UCH401": "Fluid Mechanics in Chemical Engg",
    "UCH405": "Chemical Engineering Thermodynamics",
    "UBT513": "Molecular Biology & Genetics",
    "UBT514": "Immunotechnology",
    "UBT515": "Biochemical Reaction Engineering",
    "UBT516": "Animal & Plant Biotechnology",
    "UBT517": "Bioprocess Engineering",
    "UBT518": "Applied Molecular Biology",
    "UBT521": "Recombinant DNA Technology",
    "UCE401": "Surveying & Geomatics",
    "UCE501": "Structural Analysis",
    "UCE511": "Geotechnical Engineering",
    "UCE512": "Design of Concrete Structures",
    "UCE513": "Environmental Engineering",
    "UCE521": "Transportation Infrastructure",
    "UCE693": "Civil Engineering Design Project",
    "UCC501": "Structural Analysis & Computing",
    "UCC502": "Data Structures in Infrastructure",
    "UCC503": "Geotechnical & Spatial Systems",
    "UCC504": "Transportation Systems & Simulation",
    "UCC505": "Environmental Modeling & GIS",
    "UCC521": "Civil & Computing Project",
    "ULC501": "Electronic Devices & Semiconductor Circuits",
    "ULC502": "Signals & Systems Analysis",
    "ULC511": "Microprocessors & Embedded Hardware",
    "ULC512": "Communication Systems & Modulation",
    "ULC513": "Power Electronics in Computing",
    "ULC601": "Digital Communication & Networks",
    "UBM504": "Physiological Control Systems",
    "UBM505": "Biomedical Signal Processing",
    "UBM605": "Biomaterials & Tissue Engineering",
    "UCT501": "Business Strategy & Analytics",
    "UCT502": "Object Oriented Computing for Business",
    "UCT512": "Financial & Market Engineering",
    "UCT513": "Enterprise Resource Systems",
    "UNC501": "Microprocessor Systems & Architecture",
    "UNC503": "Computer Architecture & Organization",
    "UNC514": "Computer Networks & Protocols",
    "UEC310": "Analog Electronic Circuits",
    "UEC502": "Digital Signal Processing",
    "UEC512": "Analog Communication Systems",
    "UEC513": "Electromagnetic Field Theory",
    "UEC518": "Embedded System Architecture",
    "UEC519": "VLSI Design & Technology",
    "UEC520": "Optical Fiber Communications",
    "UEC521": "Wireless Networks & Mobile Systems",
    "UEC523": "Radar & Satellite Communications",
    "UEC610": "Digital Image Processing",
    "UEC716": "Wireless & Cellular Communications",
    "UEC750": "Microwave Engineering & Antennas",
    "UEC867": "Advanced Wireless Networks",
    "UVD501": "Digital VLSI Design",
    "UVD515": "Semiconductor Device Physics",
    "UTA024": "Engineering Design Project",
    "UTA025": "Innovation & Entrepreneurship",

    # 4th Year Electives & Capstone
    "UCS802": "Capstone Project",
    "UCS701": "High Performance Computing",
    "UCS742": "Deep Learning Systems",
    "UCS743": "Advanced Computer Vision",
    "UCS745": "Big Data Analytics",
    "UCS748": "Information Security Engineering",
    "UCS750": "Computer Vision",
    "UCS751": "Simulation and Modeling",
    "UCS752": "Natural Language Processing",
    "UCS754": "Blockchain Technologies",
    "UCS758": "Cloud Computing Systems",
    "UCS760": "Deep Learning Architectures",
    "UCS762": "Reinforcement Learning",
    "UCS772": "Quantum Computing",
    "UMC743": "Mobile Application Development",
    "UHU005": "Humanities for Engineers",
    "UHU006": "Ethics & Professional Values",
    "UHU007": "Indian Constitution & Society",
    "UHU047": "Emotional Intelligence & Interpersonal Skills",
    "UHU048": "Professional Ethics & Law",
    "UHU049": "Foreign Language & Cross-Cultural Communication",
    "URA731": "Robotics Capstone Project",
    "URA751": "Mechatronics & Mobile Robotics",
    "URA753": "Autonomous Mobile Robotics",
    "ULC603": "Industrial Electronics & Applications",
    "ULC701": "Optical Communication Systems",
    "ULC703": "Satellite & Wireless Systems",
    "UEE801": "Electric Vehicles & Power Drives",
    "UME801": "Product Design & Development",
    "UME741": "Computational Fluid Dynamics",
    "UME742": "Composite Materials",
    "UME743": "Finite Element Methods",
    "UME744": "Renewable Energy Systems",
    "UME751": "Advanced Manufacturing Processes",
    "UME752": "Supply Chain Management",
    "UME754": "Total Quality Management",
    "UEE743": "Smart Grids & Energy Systems",
    "UEE744": "Power System Operation & Control",
    "UCT701": "Business Analytics",
    "UCT703": "Financial Computing",
    "UCT721": "E-Business Systems",
    "UCT723": "Cloud Infrastructure for Business",
    "UCT732": "Enterprise Architecture & Design",
    "UBT610": "Gene Therapy & Genomics",
    "UBT802": "Environmental Biotechnology",
    "UBT832": "Biosensors & Bioinstrumentation",
    "UBT837": "Stem Cell Biology",
    "UBT839": "Cancer Biology",
    "UBT844": "Marine Biotechnology",
    "UBT846": "Vaccine Technology",
    "UEC630": "Cryptography & Network Security",
    "UEC634": "Image Processing & Computer Vision",
    "UEC640": "VLSI Design",
    "UEC642": "Embedded System Design",
    "UEC719": "Wireless Cellular Communications",
    "UEC720": "Microwave & Radar Engineering",
    "UEC752": "IoT Architectures & Protocols",
    "UEC823": "Software Defined Radio",
    "UVD701": "Analog & Mixed Signal CMOS Design",
    "UVD714": "Low Power VLSI Design",
    "UEI712": "Modern Control Systems",
    "UEI733": "Analytical Instrumentation",
    "UEI735": "Virtual Instrumentation",
    "UEI743": "Biomedical Signal Processing",
    "UEI744": "Industrial Process Automation",
    "UEI801": "Instrumentation Capstone Project",
    "UEI831": "Advanced Medical Imaging",
    "UMA601": "Advanced Numerical Methods",
    "UTD004": "Design Thinking & Innovation",
    "UCS002": "Employability Skills",
    "UHU016": "Indian Constitution & Society",
    "UHU018": "Organizational Behavior",
    "UMA069": "Optimization Techniques"
}

def is_room_or_noise(val):
    val = val.strip().upper()
    if not val:
        return True
    if val in [
        "LAB", "LAB-1", "LAB-2", "LAB-3", "LAB2", "FIRST FLOOR", "STEP", "VENTURE",
        "HOURS", "DAY", "TOTAL", "SIGNATURE", "W/SHOP", "WORK/SHOP", "M", "O", "N",
        "D", "A", "Y", "T", "U", "E", "S", "W", "H", "F", "R", "I", "SR NO", "SR.NO"
    ]:
        return True
    if val.startswith("---") or val in ["N/A", "(---)", "NIL"]:
        return True
    if re.match(r'^\d{1,2}:\d{2}', val):
        return True
    if re.match(r'^(LT\d+|LP\d+|T10\d+|T20\d+|T30\d+|[B-L]\d{3}[A-Z]?|W\d{3}[A-Z]?|G\d{3}[A-Z]?|E\d{3}|F\d{3})$', val):
        return True
    if "(" in val and ")" in val and any(rp in val for rp in ["L0", "L1", "L2", "L3", "G1", "G2", "B2", "C1", "E1", "F3", "B3"]):
        return True
    return False

def expand_batches(batch_code):
    batch_code = batch_code.strip().upper()
    if not batch_code:
        return []
    
    # E.g. 1A1, 2C1, 3Q1, 4C1
    m = re.match(r'^(\d[A-Z]\d)$', batch_code)
    if m:
        prefix = m.group(1)
        subgroups = [f"{prefix}{i}" for i in range(1, 9)]
        return [batch_code] + subgroups
    
    # E.g. practical '1A1A' -> '1A11', '3Q1B' -> '3Q12'
    m_prac = re.match(r'^(\d[A-Z]\d)([A-H])$', batch_code)
    if m_prac:
        prefix = m_prac.group(1)
        letter = m_prac.group(2)
        idx = ord(letter) - ord('A') + 1
        tut_code = f"{prefix}{idx}"
        return [batch_code, tut_code]
        
    return [batch_code]

def parse_ug_file(filename):
    if not os.path.exists(filename):
        return []

    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        rows = list(csv.reader(f))

    if len(rows) < 8:
        return []

    # Dynamic header detection
    lec_idx, tut_idx, prac_idx, branch_idx = -1, -1, -1, -1
    for i, r in enumerate(rows[:10]):
        line = " ".join(r).upper()
        if "BRANCH" in line and branch_idx == -1:
            branch_idx = i
        if "LECTURE" in line and lec_idx == -1:
            lec_idx = i
        if "TUTORIAL" in line and tut_idx == -1:
            tut_idx = i
        if "PRACTICAL" in line and prac_idx == -1:
            prac_idx = i

    branch_row = rows[branch_idx] if branch_idx != -1 else []
    lec_row = rows[lec_idx] if lec_idx != -1 else []
    tut_row = rows[tut_idx] if tut_idx != -1 else []
    prac_row = rows[prac_idx] if prac_idx != -1 else []

    # Fill forward branch
    cur_b = "ENGINEERING"
    branches = []
    for val in branch_row:
        if val.strip() and val.strip().upper() not in ["BRANCH", "DAY", "SR NO", "SR.NO"]:
            cur_b = val.strip()
        branches.append(cur_b)

    # Fill forward lecture
    cur_l = ""
    lectures = []
    for val in lec_row:
        if val.strip() and val.strip().upper() not in ["LECTURE", "DAY", "SR NO", "SR.NO", "HOURS"]:
            cur_l = val.strip()
        lectures.append(cur_l)

    results = []
    course_pattern = re.compile(r'^[A-Z]{3}[0-9]{3}[A-Z]?')

    start_r = (prac_idx + 1) if prac_idx != -1 else 6
    for r in range(start_r, len(rows)):
        row_c = rows[r]
        has_course = any(course_pattern.match(c.strip().split('/')[0]) for c in row_c)
        if not has_course:
            continue

        row_d = rows[r+1] if r+1 < len(rows) else []
        row_sub_c = rows[r+2] if r+2 < len(rows) else []
        row_sub_d = rows[r+3] if r+3 < len(rows) else []

        for c in range(len(row_c)):
            cell_c = row_c[c].strip()
            if not cell_c:
                continue

            parts = [p.strip() for p in cell_c.split('/') if p.strip()]
            matched_courses = [p for p in parts if course_pattern.match(p)]
            if not matched_courses:
                continue

            teachers = []

            # 1. Check cell below
            if row_d and c < len(row_d):
                cand = row_d[c].strip()
                if cand and not is_room_or_noise(cand):
                    for st in cand.split('/'):
                        if st.strip() and not is_room_or_noise(st):
                            teachers.append(st.strip())

            # 2. Check cell below + 1 (adjacent subcolumn)
            if not teachers and row_d and c+1 < len(row_d):
                cand = row_d[c+1].strip()
                if cand and not is_room_or_noise(cand):
                    for st in cand.split('/'):
                        if st.strip() and not is_room_or_noise(st):
                            teachers.append(st.strip())

            # 3. Lab in row_sub_c
            if not teachers and row_sub_c and c < len(row_sub_c) and "LAB" in row_sub_c[c].strip().upper():
                if row_sub_d and c < len(row_sub_d):
                    cand = row_sub_d[c].strip()
                    if cand and not is_room_or_noise(cand):
                        for st in cand.split('/'):
                            if st.strip() and not is_room_or_noise(st):
                                teachers.append(st.strip())
                if not teachers and row_sub_d and c+1 < len(row_sub_d):
                    cand = row_sub_d[c+1].strip()
                    if cand and not is_room_or_noise(cand):
                        for st in cand.split('/'):
                            if st.strip() and not is_room_or_noise(st):
                                teachers.append(st.strip())

            # 4. Lecture span check
            if not teachers and row_d:
                lec_grp = lectures[c] if c < len(lectures) else ""
                if lec_grp:
                    last_c = c
                    while last_c + 1 < len(lectures) and lectures[last_c + 1] == lec_grp:
                        last_c += 1
                    for scan_c in range(c, min(last_c + 2, len(row_d))):
                        cand = row_d[scan_c].strip()
                        if cand and not is_room_or_noise(cand):
                            for st in cand.split('/'):
                                if st.strip() and not is_room_or_noise(st):
                                    teachers.append(st.strip())
                            if teachers:
                                break

            if not teachers:
                continue

            lec_name = lectures[c] if c < len(lectures) else ""
            tut_name = tut_row[c].strip() if c < len(tut_row) else ""
            prac_name = prac_row[c].strip() if c < len(prac_row) else ""
            branch_name = branches[c] if c < len(branches) else "ENGINEERING"

            clean_teachers = []
            for t_raw in teachers:
                t_c = t_raw.strip().replace("Prof.", "").replace("Dr.", "").strip()
                if t_c and len(t_c) >= 2 and not is_room_or_noise(t_c):
                    clean_teachers.append(t_c)

            if not clean_teachers:
                continue

            if len(matched_courses) > 1 and len(matched_courses) == len(clean_teachers):
                pairs = list(zip(matched_courses, clean_teachers))
            else:
                pairs = [(crs, t) for crs in matched_courses for t in clean_teachers]

            for crs, t_clean in pairs:
                ltp = crs[-1] if crs[-1] in ["L", "T", "P"] else "L"
                base_code = crs[:-1] if crs[-1] in ["L", "T", "P"] else crs
                course_name = COURSE_NAMES.get(base_code, f"{base_code} Course")

                if ltp == "L":
                    batch_candidates = [lec_name] if lec_name else [tut_name]
                elif ltp == "T":
                    batch_candidates = [tut_name] if tut_name else [lec_name]
                else:
                    batch_candidates = [tut_name, prac_name] if tut_name else [lec_name]

                expanded_batch_set = set()
                for b in batch_candidates:
                    if b:
                        for exp_b in expand_batches(b):
                            expanded_batch_set.add(exp_b)

                for b_code in expanded_batch_set:
                    results.append({
                        "teacherCode": t_clean,
                        "courseCode": base_code,
                        "courseName": course_name,
                        "batchTaught": b_code,
                        "branchTaught": branch_name,
                        "ltp": ltp
                    })

    return results

def parse_pg_file(filename):
    if not os.path.exists(filename):
        return []

    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        rows = list(csv.reader(f))

    if len(rows) < 8:
        return []

    deg_row = rows[2] if len(rows) > 2 else []
    prog_row = rows[3] if len(rows) > 3 else []

    cur_deg = "PG"
    degs = []
    for d in deg_row:
        if d.strip() and d.strip().upper() not in ["DAY", "SR.NO", "HOUR", "HOURS"]:
            cur_deg = d.strip()
        degs.append(cur_deg)

    cur_prog = ""
    progs = []
    for p in prog_row:
        if p.strip():
            cur_prog = p.strip()
        progs.append(cur_prog or cur_deg)

    course_pattern = re.compile(r'^[A-Z]{3}[0-9]{3}[A-Z]?')
    results = []

    for r in range(4, len(rows)):
        row_c = rows[r]
        has_course = any(course_pattern.match(c.strip().split('/')[0]) for c in row_c)
        if not has_course:
            continue

        for c in range(len(row_c)):
            cell_c = row_c[c].strip()
            if not cell_c:
                continue

            parts = [p.strip() for p in cell_c.split('/') if p.strip()]
            matched_courses = [p for p in parts if course_pattern.match(p)]
            if not matched_courses:
                continue

            teachers = []
            for delta in [1, 2, 3]:
                if r+delta < len(rows) and c < len(rows[r+delta]):
                    cand = rows[r+delta][c].strip()
                    if cand and not is_room_or_noise(cand):
                        teachers.append(cand)
                if not teachers and r+delta < len(rows) and c+1 < len(rows[r+delta]):
                    cand = rows[r+delta][c+1].strip()
                    if cand and not is_room_or_noise(cand):
                        teachers.append(cand)
                if not teachers and r+delta < len(rows) and c+2 < len(rows[r+delta]):
                    cand = rows[r+delta][c+2].strip()
                    if cand and not is_room_or_noise(cand):
                        teachers.append(cand)
                if teachers:
                    break

            if not teachers:
                continue

            deg_name = degs[c] if c < len(degs) else "PG"
            prog_name = progs[c] if c < len(progs) else deg_name
            batch_code = re.sub(r'[^A-Z0-9]', '', prog_name.upper()) or "PG"

            for crs in matched_courses:
                ltp = crs[-1] if crs[-1] in ["L", "T", "P"] else "L"
                base_code = crs[:-1] if crs[-1] in ["L", "T", "P"] else crs
                course_name = COURSE_NAMES.get(base_code, f"{base_code} Course")

                for t_raw in teachers:
                    t_clean = t_raw.strip().replace("Prof.", "").replace("Dr.", "").strip()
                    if not t_clean or len(t_clean) < 2 or is_room_or_noise(t_clean):
                        continue

                    results.append({
                        "teacherCode": t_clean,
                        "courseCode": base_code,
                        "courseName": course_name,
                        "batchTaught": batch_code,
                        "branchTaught": deg_name,
                        "ltp": ltp
                    })

    return results

all_results = []
files_to_parse = [
    ("timetable_1st_year_a.csv", "ug"),
    ("timetable_1st_year_b.csv", "ug"),
    ("timetable_2nd_year_a.csv", "ug"),
    ("timetable_2nd_year_b.csv", "ug"),
    ("timetable_3rd_year_a.csv", "ug"),
    ("timetable_3rd_year_b.csv", "ug"),
    ("timetable_4th_year_a.csv", "ug"),
    ("timetable_4th_year_b.csv", "ug"),
    ("timetable_pg.csv", "pg")
]

for fpath, ftype in files_to_parse:
    if not os.path.exists(fpath):
        print(f"Skipping {fpath} (not found)")
        continue
    if ftype == "ug":
        res = parse_ug_file(fpath)
    else:
        res = parse_pg_file(fpath)
    print(f"Parsed {fpath}: {len(res)} offerings")
    all_results.extend(res)

print(f"\nTotal raw offerings extracted across ALL years: {len(all_results)}")

# Group by (teacherCode, courseCode, ltp)
grouped = {}
unique_batches = set()
teachers_map = {}

for o in all_results:
    t = o['teacherCode']
    if t == '(---)' or len(t) < 2:
        continue
    
    unique_batches.add(o['batchTaught'])
    
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
        unique_batches.add(b)

print(f"Grouped unique course offerings: {len(grouped)}")

offerings_list = []

for k, val in grouped.items():
    t_code = val['teacherCode']
    if t_code not in teachers_map:
        clean_email = re.sub(r'[^a-z0-9]', '', t_code.lower())
        
        if t_code.endswith('-RA') or t_code.endswith('-TA') or t_code.endswith('-RF'):
            f_name = f"Instructor {t_code}"
            dept = "Computer Science & Engineering" if "COMP" in val['branchTaught'] else "Engineering Department"
            desig = "Teaching Associate / Research Scholar"
        else:
            f_name = f"Prof. {t_code}"
            dept = "Computer Science & Engineering" if "COMP" in val['branchTaught'] else "Engineering Department"
            desig = "Assistant Professor"

        teachers_map[t_code] = {
            "code": t_code,
            "fullName": f_name,
            "email": f"{clean_email}@thapar.edu",
            "department": dept,
            "designation": desig
        }

    sorted_batches = sorted(list(val['batches']))
    offerings_list.append({
        "teacherCode": t_code,
        "courseCode": val['courseCode'],
        "courseName": val['courseName'],
        "batchTaught": ", ".join(sorted_batches),
        "branchTaught": val['branchTaught'],
        "academicYear": "2026-2027 ODD",
        "ltp": val['ltp']
    })

output_data = {
    "teachers": list(teachers_map.values()),
    "offerings": offerings_list
}

with open('auth-service/src/scripts/timetable_data.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2)

with open('auth-service/src/scripts/all_batches.json', 'w', encoding='utf-8') as f:
    json.dump(sorted(list(unique_batches)), f, indent=2)

print("\n=======================================================")
print(f"SUCCESS: Generated timetable_data.json for ENTIRE UNIVERSITY!")
print(f"   Total Unique Faculty Members: {len(teachers_map)}")
print(f"   Total Course Offerings Across All Years: {len(offerings_list)}")
print(f"   Total Unique Batches: {len(unique_batches)}")
print("=======================================================\n")

