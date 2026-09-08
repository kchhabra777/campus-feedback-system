import csv
import re
import json

COURSE_NAMES = {
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
    "ULC301": "Analog Integrated Circuits",
    "ULC303": "Digital Logic & Computer Organization",
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
    "UTA025": "Innovation & Entrepreneurship"
}

ROOM_PREFIXES = ("LT", "LP", "T1", "B", "C", "D", "E", "F", "H", "L", "W")

def is_room_or_noise(val):
    val = val.strip()
    if not val:
        return True
    if val in ["LAB", "LAB2", "FIRST FLOOR", "STEP", "VENTURE", "HOURS", "DAY", "TOTAL", "SIGNATURE"]:
        return True
    if val.startswith("---") or val == "N/A":
        return True
    if "(" in val and ")" in val and any(rp in val for rp in ["L", "C", "H", "B", "D", "E", "W", "F"]):
        # Room like SE1(L104), PDC(C220), etc.
        return True
    # If room code like LT102, LP105, B302, C221, E102, F107, L002
    if re.match(r'^(LT\d+|LP\d+|T10\d+|[B-L]\d{3}[A-Z]?|W\d{3}[A-Z]?)$', val, re.I):
        return True
    return False

def clean_teacher_name(code):
    code = code.strip().replace("Prof.", "").replace("Dr.", "").strip()
    # Format nicely
    return code

def parse_sheet(filename, is_year_b=True):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        rows = list(csv.reader(f))

    branch_row = rows[2]
    lec_row = rows[3]
    tut_row = rows[4]
    prac_row = rows[5]

    # Fill forward branch
    cur_b = "COMPUTER ENGG" if is_year_b else "ELECTRONICS INSTRUMENTATION ENGG"
    branches = []
    for val in branch_row:
        if val.strip() and val.strip() not in ["BRANCH", "DAY"]:
            cur_b = val.strip()
        branches.append(cur_b)

    # Fill forward lecture
    cur_l = ""
    lectures = []
    for val in lec_row:
        if val.strip() and val.strip() not in ["LECTURE", "DAY"]:
            cur_l = val.strip()
        lectures.append(cur_l)

    results = []
    course_pattern = re.compile(r'^[A-Z]{3}[0-9]{3}[A-Z]?')

    # Step through slot pairs
    r = 6
    while r < len(rows):
        row_c = rows[r]
        row_d = rows[r+1] if r+1 < len(rows) else []
        row_sub_c = rows[r+2] if r+2 < len(rows) else []
        row_sub_d = rows[r+3] if r+3 < len(rows) else []

        # Find day/time
        time_slot = ""
        for cell in [row_c[3] if len(row_c)>3 else "", row_c[1] if len(row_c)>1 else ""]:
            if "AM" in cell or "PM" in cell:
                time_slot = cell.strip()
                break

        for c in range(3, min(len(row_c), len(prac_row))):
            course_cell = row_c[c].strip()
            if not course_cell:
                continue

            # Check if this cell has course codes
            parts = [p.strip() for p in course_cell.split('/')]
            matched_courses = [p for p in parts if course_pattern.match(p)]
            if not matched_courses:
                continue

            # Determine teacher candidates
            teachers = []
            
            # 1. From row_sub_d if row_sub_c has LAB
            if row_sub_c and c < len(row_sub_c) and row_sub_c[c].strip() == "LAB":
                if row_sub_d and c < len(row_sub_d):
                    cand = row_sub_d[c].strip()
                    if cand and not is_room_or_noise(cand):
                        for sub_t in cand.split('/'):
                            if sub_t.strip() and not is_room_or_noise(sub_t):
                                teachers.append(sub_t.strip())

            # 2. From row_d[c]
            if not teachers and row_d and c < len(row_d):
                cand = row_d[c].strip()
                if cand and not is_room_or_noise(cand):
                    for sub_t in cand.split('/'):
                        if sub_t.strip() and not is_room_or_noise(sub_t):
                            teachers.append(sub_t.strip())

            # 3. If still empty, for Lectures check the end of the lecture block span
            if not teachers and row_d:
                # Find end of lecture span
                lec_grp = lectures[c]
                if lec_grp:
                    last_c = c
                    while last_c + 1 < len(lectures) and lectures[last_c + 1] == lec_grp:
                        last_c += 1
                    if last_c < len(row_d):
                        cand = row_d[last_c].strip()
                        if cand and not is_room_or_noise(cand):
                            for sub_t in cand.split('/'):
                                if sub_t.strip() and not is_room_or_noise(sub_t):
                                    teachers.append(sub_t.strip())

            if not teachers:
                continue

            # Batch designation
            lec_name = lectures[c] if c < len(lectures) else ""
            tut_name = tut_row[c].strip() if c < len(tut_row) else ""
            prac_name = prac_row[c].strip() if c < len(prac_row) else ""
            branch_name = branches[c] if c < len(branches) else "COE"

            for crs in matched_courses:
                ltp = crs[-1] if crs[-1] in ["L", "T", "P"] else "L"
                base_code = crs[:-1] if crs[-1] in ["L", "T", "P"] else crs
                course_name = COURSE_NAMES.get(base_code, f"{base_code} Course")

                # If Lecture: it teaches all subgroups in that lecture group (e.g. 3Q1 -> 3Q11, 3Q12, 3Q13, 3Q14, 3Q15)
                # If Tutorial: it teaches that tut subgroup
                # If Practical: it teaches that practical subgroup
                if ltp == "L":
                    batch_list = [lec_name] if lec_name else [tut_name]
                elif ltp == "T":
                    batch_list = [tut_name] if tut_name else [lec_name]
                else:
                    batch_list = [tut_name, prac_name] if tut_name else [lec_name]

                for t_raw in teachers:
                    t_clean = clean_teacher_name(t_raw)
                    if not t_clean or len(t_clean) < 2:
                        continue

                    for b_code in batch_list:
                        if not b_code:
                            continue
                        results.append({
                            "teacherCode": t_clean,
                            "courseCode": base_code,
                            "courseName": course_name,
                            "batchTaught": b_code,
                            "branchTaught": branch_name,
                            "ltp": ltp
                        })

        r += 2

    return results

all_results = []
all_results.extend(parse_sheet("timetable_3rd_year_b.csv", is_year_b=True))
all_results.extend(parse_sheet("timetable_raw.csv", is_year_b=False))

# Deduplicate
unique_map = {}
for item in all_results:
    key = f"{item['teacherCode']}|{item['courseCode']}|{item['batchTaught']}|{item['ltp']}"
    if key not in unique_map:
        unique_map[key] = item

deduped = list(unique_map.values())
unique_teachers = sorted(list(set(item['teacherCode'] for item in deduped)))
unique_batches = sorted(list(set(item['batchTaught'] for item in deduped)))
unique_courses = sorted(list(set(item['courseCode'] for item in deduped)))

print(f"Total Unique Course Offerings Extracted: {len(deduped)}")
print(f"Total Unique Faculty / Instructors: {len(unique_teachers)}")
print(f"Total Batches Covered: {len(unique_batches)}")
print(f"Total Courses Covered: {len(unique_courses)}")

with open("thapar_parsed_offerings.json", "w") as f:
    json.dump({
        "summary": {
            "offeringsCount": len(deduped),
            "teachersCount": len(unique_teachers),
            "batchesCount": len(unique_batches),
            "coursesCount": len(unique_courses)
        },
        "teachers": unique_teachers,
        "offerings": deduped
    }, f, indent=2)

print("Saved to thapar_parsed_offerings.json successfully!")
