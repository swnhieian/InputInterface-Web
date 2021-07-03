import imeData from './imeData';

let imeMaxLength = 67;


class pinyinIME {
    constructor() {
        this.imeData = imeData.split('	');
        this.imeDataSize = this.imeData.length;
        this.FindEntries('jintian');
        this.FetchCandidatesList();
        console.log("====================");
        console.log(this.candidatesChinese);
        console.log(this.candidatesInput);
        console.log("====================");
    }

    clearCandidatesList() {
        this.candidatesChinese = new Array();
        this.candidatesInput = new Array();
    }

    FindEntries(input) {
        this.candidatesOffset = 0;
        this.findInput = input;
        this.findFound = false;
        this.findStartIndex = 0;
        this.findEndIndex = 0;
        this.findSize = 0;
        if (input !== "") {
            let find = -1;
            let low = 0, mid = 0;
            let high = this.imeDataSize;
            let entry = "";
            while (low < high) {
                mid = (low + high) / 2;
                mid = Math.floor(mid);
                entry = this.imeData[mid];
                if (entry.indexOf(input, 0) ===0) {
                    find = mid;
                    this.findFound = true;
                    break;
                }
                if (entry < input) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }

            if (this.findFound === true) {
                this.findEndIndex = find;
                let imeDataLastIndex = this.imeDataSize - 1;
                while (this.findEndIndex < imeDataLastIndex) {
                    entry = this.imeData[this.findEndIndex + 1];
                    if (entry.indexOf(input, 0) ===  0) {
                        this.findEndIndex ++;
                    } else {
                        break;
                    }
                }

                this.findStartIndex = find;
                while (this.findStartIndex > 0) {
                    entry = this.imeData[this.findStartIndex - 1];
                    if (entry.indexOf(input, 0) === 0) {
                        this.findStartIndex --;
                    } else {
                        break;
                    }
                }
                this.findSize = this.findEndIndex - this.findStartIndex + 1;
            }
        }
    }

    FetchCandidatesList() {
        this.clearCandidatesList();
        
        let entry = "";
        for (let idx = 0; idx <= 9; idx ++) {
            if (this.candidatesOffset + idx >= this.findSize) {
                break;
            }
            entry = this.imeData[this.findStartIndex + this.candidatesOffset + idx];
            this.candidatesChinese[idx] = entry.substr(entry.lastIndexOf(" ") + 1);
            this.candidatesInput[idx] = entry.substring(0, entry.indexOf(" "));
        }

    }


}

export default pinyinIME;