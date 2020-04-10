package com.kuangshanjavaedu_mobile.fileviewer;

import android.Manifest;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.Environment;


import android.text.TextUtils;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;

import com.kuangshanjavaedu_mobile.R;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.annotation.Nullable;

import okhttp3.ResponseBody;
import pub.devrel.easypermissions.EasyPermissions;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import android.widget.TextView;

public class FileDisplayActivity extends AppCompatActivity implements EasyPermissions.PermissionCallbacks, Screensaver.OnTimeOutListener{


    private String TAG = "FileDisplayActivity";
    SuperFileView2 mSuperFileView;

    String filePath;

    RecyclerView mRecyclerView;

    private long actStartTime;
    private AlertDialog.Builder mAlterDiaglog;
    private Dialog cleanDialog;
    private Screensaver mScreensaver;
    private long pauseTime=0;
    //毫秒
    private boolean inDialog=false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        Log.i(TAG, "onCreate: ");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_file_display);
        String[] perms = new String[]{Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE};
        if (!EasyPermissions.hasPermissions(FileDisplayActivity.this, perms)) {
            EasyPermissions.requestPermissions(FileDisplayActivity.this, "此功能需要手机存储权限才能正常运行，请选择允许", 10086, perms);
        } else {
            init();
        }


        actStartTime = System.currentTimeMillis();
        mScreensaver = new Screensaver(30000); //定时30S
        mScreensaver.setOnTimeOutListener(this); //监听
        mScreensaver.start(); //开始计时
    }
    public void onBack(View v){
        Intent intent = new Intent();
        //把返回数据存入Intent
        intent.putExtra("result", computeStudyTime());
        //设置返回数据
        setResult(RESULT_OK, intent);
        finish();
    }
    @Override
    protected void onStop() {
        Log.i(TAG, "onStop: ");
        super.onStop();
    }
    @Override
    protected void onRestart() {
        Log.i(TAG, "onRestart: ");
        super.onRestart();
    }
    @Override
    public void onPermissionsGranted(int requestCode, List<String> list) {
        // 允许的回调函数
        // ...
        init();
    }
    @Override
    public void onPermissionsDenied(int requestCode, List<String> list) {
        // 拒绝的回调函数
        // ...
        Toast.makeText(FileDisplayActivity.this, "此功能需要存储权限，请设置", Toast.LENGTH_SHORT).show();
    }
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // 将处理结果托管给EasyPermissions进行处理
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    public void init() {
        mSuperFileView = (SuperFileView2) findViewById(R.id.mSuperFileView);
        mSuperFileView.setOnGetFilePathListener(new SuperFileView2.OnGetFilePathListener() {
            @Override
            public void onGetFilePath(SuperFileView2 mSuperFileView2) {
                getFilePathAndShowFile(mSuperFileView2);
            }
        });

        Intent intent = this.getIntent();
        String path = (String) intent.getSerializableExtra("path");

        if (!TextUtils.isEmpty(path)) {
            TLog.d(TAG, "文件path:" + path);
            setFilePath(path);
            TextView file_tittle = findViewById(R.id.file_title);
            String fileN=path.substring(path.lastIndexOf("/")+1,path.lastIndexOf("."));
            file_tittle.setText(fileN);
        }
        mSuperFileView.show();

    }


    private void getFilePathAndShowFile(SuperFileView2 mSuperFileView2) {


        if (getFilePath().contains("http")) {//网络地址要先下载

            downLoadFromNet(getFilePath(),mSuperFileView2);

        } else {
            mSuperFileView2.displayFile(new File(getFilePath()));
        }
    }

    @Override
    public void onBackPressed()
    {
        Intent intent = new Intent();
        //把返回数据存入Intent
        intent.putExtra("result", computeStudyTime());
        //设置返回数据
        setResult(RESULT_OK, intent);
        super.onBackPressed();
    }
    @Override
    public void onDestroy() {

        super.onDestroy();
        mScreensaver.stop();
        TLog.d("FileDisplayActivity-->onDestroy");
        if (mSuperFileView != null) {
            mSuperFileView.onStopDisplay();
        }
    }


    public static void show(Context context, String url) {
        Intent intent = new Intent(context, FileDisplayActivity.class);
        Bundle bundle = new Bundle();
        bundle.putSerializable("path", url);
        intent.putExtras(bundle);
        context.startActivity(intent);

    }

    public void setFilePath(String fileUrl) {
        this.filePath = fileUrl;
    }

    private String getFilePath() {
        return filePath;
    }

    private void downLoadFromNet(final String url,final SuperFileView2 mSuperFileView2) {

        //1.网络下载、存储路径、
        File cacheFile = getCacheFile(url);
        if (cacheFile.exists()) {
            if (cacheFile.length() <= 0) {
                TLog.d(TAG, "删除空文件！！");
                cacheFile.delete();
                return;
            }
        }
        LoadFileModel.loadPdfFile(url, new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                TLog.d(TAG, "下载文件-->onResponse");
                boolean flag;
                InputStream is = null;
                byte[] buf = new byte[2048];
                int len = 0;
                FileOutputStream fos = null;
                try {
                    ResponseBody responseBody = response.body();
                    is = responseBody.byteStream();
                    long total = responseBody.contentLength();

                    File file1 = getCacheDir(url);
                    if (!file1.exists()) {
                        file1.mkdirs();
                        TLog.d(TAG, "创建缓存目录： " + file1.toString());
                    }


                    //fileN : /storage/emulated/0/pdf/kauibao20170821040512.pdf
                    File fileN = getCacheFile(url);//new File(getCacheDir(url), getFileName(url))

                    TLog.d(TAG, "创建缓存文件： " + fileN.toString());
                    if (!fileN.exists()) {
                        boolean mkdir = fileN.createNewFile();
                    }
                    fos = new FileOutputStream(fileN);
                    long sum = 0;
                    while ((len = is.read(buf)) != -1) {
                        fos.write(buf, 0, len);
                        sum += len;
                        int progress = (int) (sum * 1.0f / total * 100);
                        TLog.d(TAG, "写入缓存文件" + fileN.getName() + "进度: " + progress);
                    }
                    fos.flush();
                    TLog.d(TAG, "文件下载成功,准备展示文件。");
                    //2.ACache记录文件的有效期
                    mSuperFileView2.displayFile(fileN);
                } catch (Exception e) {
                    TLog.d(TAG, "文件下载异常 = " + e.toString());
                } finally {
                    try {
                        if (is != null)
                            is.close();
                    } catch (IOException e) {
                    }
                    try {
                        if (fos != null)
                            fos.close();
                    } catch (IOException e) {
                    }
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                TLog.d(TAG, "文件下载失败");
                File file = getCacheFile(url);
                if (!file.exists()) {
                    TLog.d(TAG, "删除下载失败文件");
                    file.delete();
                }
            }
        });


    }

    /***
     * 获取缓存目录
     *
     * @param url
     * @return
     */
    private File getCacheDir(String url) {

        return new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/007/");

    }
    /***
     * 绝对路径获取缓存文件
     *
     * @param url
     * @return
     */
    private File getCacheFile(String url) {
        File cacheFile = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/007/"
                + getFileName(url));
        TLog.d(TAG, "缓存文件 = " + cacheFile.toString());
        return cacheFile;
    }

    /***
     * 根据链接获取文件名（带类型的），具有唯一性
     *
     * @param url
     * @return
     */
    private String getFileName(String url) {
        String fileName = Md5Tool.hashKey(url) + "." + getFileType(url);
        return fileName;
    }

    /***
     * 获取文件类型
     *
     * @param paramString
     * @return
     */
    private String getFileType(String paramString) {
        String str = "";

        if (TextUtils.isEmpty(paramString)) {
            TLog.d(TAG, "paramString---->null");
            return str;
        }
        TLog.d(TAG,"paramString:"+paramString);
        int i = paramString.lastIndexOf('.');
        if (i <= -1) {
            TLog.d(TAG,"i <= -1");
            return str;
        }


        str = paramString.substring(i + 1);
        TLog.d(TAG,"paramString.substring(i + 1)------>"+str);
        return str;
    }


    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        mScreensaver.resetTime(); //重置时间
        return super.dispatchTouchEvent(ev);
    }

    /**
     * 当使用键盘就会执行此方法
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        mScreensaver.resetTime(); //重置时间
        return super.dispatchKeyEvent(event);
    }

    /**
     * 时间到就会执行此方法
     */
    @Override
    public void onTimeOut(Screensaver screensaver) {

        if (!inDialog) {
            //onTimeOut方法会不断执行，如果已经弹框就跳出
            Log.i("inDialog", "inDialog: ");
            mScreensaver.stop();
            long pauseStartTime=System.currentTimeMillis();
            showAlterDiaglog(pauseStartTime);

        }
    }

    public void showAlterDiaglog(long pauseStartTime){
        mScreensaver.stop();
        mAlterDiaglog = new AlertDialog.Builder(FileDisplayActivity.this);
        mAlterDiaglog.setCancelable(false);
        inDialog=true;
        mAlterDiaglog.setTitle("提示");//文字
        mAlterDiaglog.setMessage("请勿挂机");//提示消息
        //积极的选择
        mAlterDiaglog.setPositiveButton("确定", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                mScreensaver.resetTime();
                inDialog=false;
                long pauseEndTime=System.currentTimeMillis();
                pauseTime+=(pauseEndTime-pauseStartTime);
//                ToastUtil.getInstance().showToast("暂停了"+(pauseEndTime-pauseStartTime)/1000+"秒");
//                Log.i(TAG, "共暂停 "+pauseTime/1000+"秒");
            }
        });
        cleanDialog=mAlterDiaglog.show();
    }
    public void cleanAlterDiaglog(){
        if (inDialog) {
            cleanDialog.dismiss();
            inDialog=false;
        }
    }

    public int computeStudyTime() {
        int actTime = (int) ((System.currentTimeMillis() - actStartTime) / 1000);
        int studyTime = actTime - (int) pauseTime / 1000;
        Log.i(TAG, String.valueOf(studyTime));
        return studyTime;
    }
}
