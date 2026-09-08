import json

with open('thapar_parsed_offerings.json') as f:
    d = json.load(f)

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
    grouped[key]['batches'].add(o['batchTaught'])

print('Grouped unique course offerings:', len(grouped))
sample_keys = list(grouped.keys())[:15]
for k in sample_keys:
    item = grouped[k]
    b_str = ', '.join(sorted(list(item['batches']))[:5])
    print(f"{item['teacherCode']:8s} | {item['courseCode']:8s} ({item['ltp']}) | Batches: {b_str}")
