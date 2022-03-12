## Canvas Grader
This is an extension I wrote to quickly at a glance analyze my grades for classes that have their grades hidden.

### Installation
1. Download from the releases and unzip to `./build` or whatever you desire to name it. 
2. Go to `chrome://extensions` and enable developer mode
3. Load the folder you unpacked the `build.zip` into.
4. Ready to use via extension bar.

It is being uploaded to the Chrome Store for convenience, but is still being processed.

### Features
✅ - Implemented

🐣 - Partially implemented

❌ - Not implemented (and planned)
| Description  | Status |
| ------------- | ------------- |
| Arithmetic Mean | ✅ |
| Geometric Mean | ❌ |
| What If Scores | ✅ |
| Show Category Grades | 🐣 |
| Custom Weighting | ❌ |
| Calculate Needed Scores | ❌ |
| Complex Arithmetic/Geometric Grading Scales | ❌ | 


### Preview
![Preview of Canvas Grade Calculator](docs/preview1.PNG)

### Contributing
Contributing is welcome whether through issues or PRs.

Basically the only commands you'll need is
```
yarn start //for previewing in browser any components
yarn build //for running the extension
```
Load the `./build` folder (after building) on the `chrome://extensions` page

Otherwise you should verify it passes lint/tsc tests:
`yarn lint` and `yarn tsc --noEmit`