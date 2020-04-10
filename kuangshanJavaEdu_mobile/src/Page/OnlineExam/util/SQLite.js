//SQLite.js
import React, { Component } from 'react';
import {
    ToastAndroid,
} from 'react-native';
import SQLiteStorage from 'react-native-sqlite-storage';

SQLiteStorage.DEBUG(true);
var database_name = "wrongQuestion.db";//数据库文件
var database_version = "1.0";//版本号
var database_displayname = "wrongQuestion";
var database_size = -1;
var db;

export default class SQLite extends Component {
    componentWillUnmount(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
    }
    open(){
        db = SQLiteStorage.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
            ()=>{
                this._successCB('open');
            },
            (err)=>{
                this._errorCB('open',err);
            });
        return db;
    }
    createTable(){
        if (!db) {
            this.open();
        }
        //创建错题表
        db.transaction((tx)=> {
            tx.executeSql('CREATE TABLE IF NOT EXISTS wrong_question_t(' +
                'wrong_question_id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
                'edu_category_id INTEGER,'+
                'test_name VARCHAR,' +
                'question_content VARCHAR,' +
                'choose_a VARCHAR,' +
                'choose_b VARCHAR,' +
                'choose_c VARCHAR,' +
                'choose_d VARCHAR,' +
                'answer VARCHAR,' +
                'wrong_answer VARCHAR,' +
                'answer_time DATE,' +
                'question_type VARCHAR,' +
                'explanation VARCHAR,'+
                'edu_category_name VARCHAR)'
                , [], ()=> {
                    this._successCB('executeSql');
                }, (err)=> {
                    this._errorCB('executeSql', err);
                });
        }, (err)=> {//所有的 transaction都应该有错误的回调方法，在方法里面打印异常信息，不然你可能不会知道哪里出错了。
            this._errorCB('transaction', err);
        }, ()=> {
            this._successCB('transaction');
        })
    }
    // deleteData(){
    //     if (!db) {
    //         this.open();
    //     }
    //     db.transaction((tx)=>{
    //         tx.executeSql('delete from wrong_question_t',[],()=>{
    //
    //         });
    //     });
    // }
    // dropTable(){
    //     db.transaction((tx)=>{
    //         tx.executeSql('drop table wrong_question_t',[],()=>{
    //
    //         });
    //     },(err)=>{
    //         this._errorCB('transaction', err);
    //     },()=>{
    //         this._successCB('transaction');
    //     });
    // }
    insertwrongQuestionData(wrongQuestionData){
        let len = wrongQuestionData.length;
        if (!db) {
            this.open();
        }
        this.createTable();
        db.transaction((tx)=>{
            for(let i=0; i<len; i++){
                var wrong_question_t = wrongQuestionData[i];
                let edu_category_id= wrong_question_t.edu_category_id;
                let test_name = wrong_question_t.test_name;
                let question_content = wrong_question_t.question_content;
                let choose_a = wrong_question_t.choose_a;
                let choose_b = wrong_question_t.choose_b;
                let choose_c = wrong_question_t.choose_c;
                let choose_d = wrong_question_t.choose_d;
                let answer = wrong_question_t.answer;
                let wrong_answer = wrong_question_t.wrong_answer;
                let answer_time = wrong_question_t.answer_time;
                let question_type = wrong_question_t.question_type;
                let explanation = wrong_question_t.explanation;
                let edu_category_name = wrong_question_t.edu_category_name;
                let sql = "INSERT INTO wrong_question_t(edu_category_id,test_name,question_content,choose_a,choose_b,choose_c,choose_d,answer,wrong_answer,answer_time,question_type,explanation,edu_category_name)"+
                    "values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
                tx.executeSql(sql,[edu_category_id,test_name,question_content,choose_a,choose_b,choose_c,choose_d,
                    answer,wrong_answer,answer_time,question_type,explanation,edu_category_name],()=>{
                    },(err)=>{
                        console.log(err);
                    }
                );
            }
        },(error)=>{
            this._errorCB('transaction', error);
        },()=>{
            this._successCB('transaction insert data');
        });
    }

    QueryData(sql,argument,callback){
        if (!db) {
            this.open();
        }

        //查询
        db.transaction((tx)=>{
            tx.executeSql(sql, argument===null?[]:[argument],(tx,results)=>{
                var len = results.rows.length;
                let result=[]
                //遍历处理返回数组的格式，方便界面上渲染处理
                for(let i=0; i<len; i++){
                    result.push(results.rows.item(i))
                }
                callback&&callback(result)
            });
        },(error)=>{
            console.log(error);
        });
    }
    close(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.log("SQLiteStorage not open");
        }
        db = null;
    }
    _successCB(name){
        console.log("SQLiteStorage "+name+" success");
    }
    _errorCB(name, err){
        console.log("SQLiteStorage "+name);
        console.log(err);
    }


    render(){
        return null;
    }
}
