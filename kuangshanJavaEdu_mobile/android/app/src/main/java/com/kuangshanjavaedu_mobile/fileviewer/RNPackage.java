package com.kuangshanjavaedu_mobile.fileviewer;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.kuangshanjavaedu_mobile.fileviewer.RNActivity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


/**
 * Created by LQ0611 on 2019/2/14.
 */

public class RNPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new RNActivity(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
