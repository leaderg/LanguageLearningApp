# SRT to JSON Conversion Guide

## Installation
```bash
npm install srt-convert-json
```

## Usage
```javascript
const convert = require('srt-convert-json')

convert.process("INPUT_FILE_PATH", "OUTPUT_FILE_PATH")
// Example: convert.process("./data.srt", "./subtitle.json")
```

## Input Format (SRT)
```
1
00:02:38,910 --> 00:02:40,161
English! I'm English!

2
00:05:40,049 --> 00:05:41,801
It's grenadiers, mate.
```

## Output Format (JSON)
```json
[
    {
        "position": 1,
        "start": "00:02:38",
        "timer1": "910",
        "end": "00:02:40",
        "timer2": "161",
        "text": "English! I'm English!"
    },
    {
        "position": 2,
        "start": "00:05:40",
        "timer1": "049",
        "end": "00:05:41",
        "timer2": "801",
        "text": "It's grenadiers, mate."
    }
]
```

## Note
The package splits the timestamps into separate fields:
- `start`: Main start time (HH:MM:SS)
- `timer1`: Milliseconds for start time
- `end`: Main end time (HH:MM:SS)
- `timer2`: Milliseconds for end time
