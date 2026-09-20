"""Replay the edits printed in Project articles; optionally typecheck each state on macOS.

python3 scripts/check-project-swift.py
python3 scripts/check-project-swift.py --typecheck --model /path/to/SleepCalculator.swift
Only temporary build artifacts are written. Xcode / iOS SDK is required for --typecheck.
"""
from pathlib import Path
import argparse
import concurrent.futures
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CODE = r'```swift\n([\s\S]*?)```'
parser = argparse.ArgumentParser()
parser.add_argument('--typecheck', action='store_true')
parser.add_argument('--model', type=Path)
args = parser.parse_args()

def norm(code):
    # Indentation does not affect Swift semantics; retain all tokens and line boundaries.
    return ''.join(re.findall(r'"(?:\\.|[^"\\])*"|[^\s]', code))

def app(name):
    return f'import SwiftUI\n\n@main\nstruct {name}App: App {{\n    var body: some Scene {{\n        WindowGroup {{ ContentView() }}\n    }}\n}}\n'

def references(article):
    ref = article.split('## Reference: полный код')[1]
    return dict(re.findall(r'### ([\w+.-]+\.swift)\n\n'+CODE, ref))

def wesplit(article):
    sections = re.split(r'^### Шаг \d+\.', article, flags=re.M)[1:]
    blocks = [re.findall(CODE, section.split('</details>')[0]) for section in sections]
    file = blocks[0][0]
    states = [{'ContentView.swift': file, 'WeSplitApp.swift': app('WeSplit')}]
    def wrap(body, props):
        return 'import SwiftUI\nstruct ContentView: View {\n'+props+'\n'+body+'\n}\n#Preview { ContentView() }\n'
    property2,body2=blocks[1][0].split('var body:',1)
    body2='var body:'+body2
    file=wrap(body2,property2)
    states.append({'ContentView.swift':file,'WeSplitApp.swift':app('WeSplit')})
    properties3,pickers=blocks[2][0].split('Picker(',1)
    body3=body2.replace('.keyboardType(.decimalPad)', '.keyboardType(.decimalPad)\nPicker('+pickers.strip())
    properties=property2+properties3
    states.append({'ContentView.swift':wrap(body3,properties),'WeSplitApp.swift':app('WeSplit')})
    file=wrap(blocks[3][0],properties)
    states.append({'ContentView.swift':file,'WeSplitApp.swift':app('WeSplit')})
    properties5,field,result,toolbar=blocks[4]
    file=file.replace('private var totalPerPerson:',properties5+'\nprivate var totalPerPerson:')
    file=re.sub(r'TextField\("Сумма"[^\n]*\n\s*\.keyboardType\(\.decimalPad\)',lambda _:field.strip(),file)
    file=file.replace('Text(totalPerPerson, format: .number)',result.strip())
    file=file.replace('.navigationTitle("WeSplit")','.navigationTitle("WeSplit")\n'+toolbar)
    states.append({'ContentView.swift':file,'WeSplitApp.swift':app('WeSplit')})
    return states

jobs=[]
for path in sorted((ROOT/'docs/projects').glob('project-*.md')):
    article=path.read_text()
    ref=references(article)
    assert 'ContentView.swift' in ref, f'{path.name}: missing ContentView reference'
    if path.name.startswith('project-01-'):
        states=wesplit(article)
    else:
        name=re.search(r'с именем \*\*(\w+)\*\*', article).group(1)
        files={'ContentView.swift':re.search(CODE,article).group(1),name+'App.swift':app(name)}
        states=[]
        sections=re.split(r'^### Шаг \d+\.',article,flags=re.M)[1:]
        for section in sections:
            answer=section.split('<details>')[1].split('</details>')[0]
            pattern=(
                r'(?P<replace>В \*\*(?P<rfile>[\w+.-]+\.swift)\*\* найди этот блок:\n\n```swift\n(?P<old>[\s\S]*?)```\n\nЗамени[^\n]*\n\n```swift\n(?P<new>[\s\S]*?)```)'
                r'|(?P<insert>В \*\*(?P<ifile>[\w+.-]+\.swift)\*\* добавь код (?P<where>перед|сразу после) строкой `(?P<anchor>[^`]+)`:\n\n```swift\n(?P<added>[\s\S]*?)```)'
                r'|(?P<file>\*\*(?P<fname>[\w+.-]+\.swift)\*\* — [^\n]*\n\n```swift\n(?P<whole>[\s\S]*?)```)'
            )
            edits=list(re.finditer(pattern,answer))
            for edit in edits:
                if edit['replace']:
                    old,new=edit['old'].rstrip('\n'),edit['new'].rstrip('\n')
                    file=edit['rfile']
                    if files[file].count(old)==1:
                        files[file]=files[file].replace(old,new)
                    else:
                        # Blank lines / indentation around a pasted fragment are immaterial.
                        tokens=re.findall(r'"(?:\\.|[^"\\])*"|[^\s]',old)
                        expression=r'\s*'.join(map(re.escape,tokens))
                        assert len(re.findall(expression,files[file]))==1,(path.name,file,old)
                        files[file]=re.sub(expression,lambda _:new,files[file],count=1)
                elif edit['insert']:
                    file=edit['ifile']; lines=files[file].splitlines(keepends=True)
                    matches=[i for i,line in enumerate(lines) if line.strip()==edit['anchor'].strip()]
                    assert len(matches)==1,(path.name,edit['anchor'],matches)
                    index=matches[0]+(edit['where']=='сразу после')
                    lines.insert(index,edit['added']+'\n')
                    files[file]=''.join(lines)
                else: files[edit['fname']]=edit['whole']
            assert edits or '.mlmodel' in answer, f'{path.name}: step has no replayable edits'
            states.append(files.copy())
    for file,code in ref.items():
        assert file in states[-1] and norm(code)==norm(states[-1][file]), f'{path.name}: Reference differs from accumulated steps: {file}'
    assert set(ref)==set(states[-1]), f'{path.name}: missing final files'
    for n,state in enumerate(states,1): jobs.append((path.stem,n,state))
    print(f'{path.stem}: {len(states)} steps replayed; Reference matches')

if args.typecheck:
    sdk=subprocess.check_output(['xcrun','--sdk','iphoneos','--show-sdk-path'],text=True).strip()
    with tempfile.TemporaryDirectory(prefix='swift-project-steps-') as temporary:
        temp=Path(temporary)
        def compile_step(job):
            slug,n,files=job
            folder=temp/slug/str(n);folder.mkdir(parents=True)
            for file,code in files.items(): (folder/file).write_text(code)
            sources=list(map(str,folder.glob('*.swift')))
            if slug.startswith('project-04-') and n==6:
                assert args.model and args.model.exists(), 'Provide --model generated from the course CSV for BetterRest'
                sources.append(str(args.model.resolve()))
            result=subprocess.run(['xcrun','swiftc','-typecheck','-parse-as-library','-swift-version','6','-target','arm64-apple-ios17.0','-sdk',sdk,'-module-cache-path',str(temp/'cache'),*sources],capture_output=True,text=True)
            assert result.returncode==0,f'{slug} step {n}:\n{result.stderr}'
            return f'{slug} step {n}: Swift typecheck passed'
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            for result in pool.map(compile_step,jobs): print(result,flush=True)
print(f'PASS: {len(jobs)} project steps')
