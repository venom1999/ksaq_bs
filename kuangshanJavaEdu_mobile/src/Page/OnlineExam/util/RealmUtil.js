import Realm from 'realm';

/***表定义区**/
export const wrongQuestionTableName = 'wrong_question_t';

const WrongQuestionSchema = {
    name: wrongQuestionTableName,
    properties: {
        edu_category_id: 'int',
        test_name: 'string',
        question_content: 'string',
        choose_a: 'string',
        choose_b: 'string',
        choose_c: 'string',
        choose_d: 'string',
        answer: 'string',
        wrong_answer: 'string',
        //answer_time: 'string',
        question_type: 'string',
        explanation: 'string',
    }
};


const instance = new Realm({
    schema: [
        WrongQuestionSchema,
    ],
    deleteRealmIfMigrationNeeded: true,
    inMemory: false,
});


/***表使用区**/
export function writeToRealm(obj,tabName) {
    return new Promise((resolve, reject) => {
        instance.write(() => {
            instance.create(tabName, obj, true)
            resolve(true)
        })
    })
}


export function queryAllFromRealm(tabName) {
    return new Promise((resolve, reject) => {
        let obj = instance.objects(tabName);
        let objStr = JSON.stringify(obj);
        resolve(JSON.parse(objStr))
    })
}

export function clearAllFromRealm(tabName) {
    return new Promise((resolve, reject) => {
        instance.write(() => {
            let arrays = instance.objects(tabName);
            instance.delete(arrays);
            resolve(true)
        })
    })
}


export function clearRowFromRealm(wrong_question_id,tabName) {
    return new Promise((resolve, reject) => {
        instance.write(() => {
            let arrays = instance.objects(tabName);
            let row = arrays.filtered('wrong_question_id==' + wrong_question_id);
            instance.delete(row);
            resolve(true)
        })
    })
}