export default class judgeUtil {
    static  wrongEmptyValue(examTime, examTotalGrade, chooseCount, chooseGrade, judgeCount, judgeGrade, multiChooseCount, multiChooseGrade) {

        console.log('examTime:'+examTime)
        console.log('examTotalGrade:'+examTotalGrade)
        console.log('chooseCount:'+chooseCount)
        console.log('chooseGrade:'+chooseGrade)
        console.log('judgeCount:'+judgeCount)
        console.log('judgeGrade:'+judgeGrade)
        console.log('multiChooseCount:'+multiChooseCount)
        console.log('multiChooseGrade:'+multiChooseGrade)
        if (examTime === null || examTime ===''){
            return "请输入考试时间";
        }else if (examTotalGrade === null || examTotalGrade ===''){
            return "请输入考试总分"
        }else if (chooseCount === null || chooseCount === ''){
            return "请输入单选题题数"
        }else if (chooseGrade === null || chooseGrade === ''){
            return "请输入单选题小分";
        }else if (multiChooseCount === null || multiChooseCount === ''){
            return "请输入多选题题数";
        }else if (multiChooseGrade === null || multiChooseGrade === ''){
            return "请输入多选题小分";
        }else if (judgeCount === null || judgeCount === ''){
            return "请输入判断题题数";
        }else if (judgeGrade === null || judgeGrade === ''){
            return "请输入判断题小分";
        }else if ( parseFloat(examTotalGrade) !== ( parseFloat(multiChooseCount) * parseFloat(multiChooseGrade) + parseFloat(chooseCount)*parseFloat(chooseGrade) + parseFloat(judgeCount) * parseFloat(judgeGrade))){
            return "所有题目小分的总和应该等于考试总分";
        }
        return "";
    }
}