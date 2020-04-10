package com.kuangshanjavaedu_mobile.fileviewer;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
//import android.support.annotation.NonNull;
//import android.support.v7.widget.LinearLayoutManager;
//import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

import pub.devrel.easypermissions.EasyPermissions;

//import static android.support.v4.content.ContextCompat.startActivity;

/**
 * Created by LQ0611 on 2019/2/14.
 */

public class RNActivity extends ReactContextBaseJavaModule{
    private ReactApplicationContext mContext;
    private int studyTime;
    private Promise mPromise;
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(
                final Activity activity,
                final int requestCode,
                final int resultCode,
                final Intent data) {
            try {
                int result = data.getExtras().getInt("result");//得到新Activity 关闭后返回的数据
                studyTime = result;
                mPromise.resolve(studyTime);
                Log.i("onActivityResult", String.valueOf(studyTime));
            } catch (Exception e) {
                //打印输出异常
                e.printStackTrace();
            }


        }
    };
    public RNActivity(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext=reactContext;
        mContext.addActivityEventListener(mActivityEventListener);
    }
    @Override
    public String getName() {
        return "RNActivity";
    }

    @ReactMethod
    public void show(String filePath, Promise promise){
        try {
            Activity currentActivity = getCurrentActivity();
            //String filePath = "/storage/emulated/0/test.docx";
            if(null!=currentActivity){
                //Class aimActivity = Class.forName(name);
//            FileDisplayActivity.show(currentActivity, filePath);
                Intent intent = new Intent(currentActivity,FileDisplayActivity.class);
                Bundle bundle = new Bundle();
                bundle.putSerializable("path", filePath);
                intent.putExtras(bundle);
                currentActivity.startActivityForResult(intent,1);
                mPromise = promise;
            }
        } catch (IllegalViewOperationException e) {
            promise.reject("E_LAYOUT_ERROR", e);
        }
        //Toast.makeText(mContext, "RNActivity", Toast.LENGTH_SHORT).show();

    }

/*
    @ReactMethod
    public void showVideo(String videoUrl){
        Activity currentActivity = getCurrentActivity();
        if(null!=currentActivity){
            //Class aimActivity = Class.forName(name);

            Intent intent = new Intent(currentActivity,FullScreenActivity.class);
            intent.putExtra("videoUrl",videoUrl);
            currentActivity.startActivity(intent);
            //Toast.makeText(mContext, "RNActivity", Toast.LENGTH_SHORT).show();

        }
    }
*/


}
