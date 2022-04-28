package com.dogerbrowser;

import android.widget.Toast;

import android.app.Activity;
// import android.app.Application;
import android.content.Intent;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;

import java.util.Set;
import java.util.Map;
import java.util.HashMap;

public class ReceiveWebSearchIntentModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  public ReceiveWebSearchIntentModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  private static void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
    try {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    } catch (Exception e) {

    }
  }

  public static void sendIntentEvent(Intent intent) {
    try {
      if (intent != null) {
        String action = intent.getAction();
        if (action.equals(Intent.ACTION_WEB_SEARCH)) {
          WritableMap params = Arguments.createMap();
          params.putString("action", intent.getAction());
          Set<String> categories = intent.getCategories();
          params.putArray("categories", Arguments.makeNativeArray(categories));
          params.putString("type", intent.getType());
          params.putString("data", intent.getDataString());
          params.putMap("extras", Arguments.fromBundle(intent.getExtras()));
          sendEvent(reactContext, "WebSearch", params);
        }
      }
    } catch (Exception e) {

    }
  }

  @ReactMethod
  public void getWebSearchIntent(Promise promise) {
    try {
      Activity mActivity = getCurrentActivity();
      WritableMap params = Arguments.createMap();
      if(mActivity == null) { 
        promise.resolve(null);
        return;
      }

      Intent intent = mActivity.getIntent();
      if(intent == null) {
        promise.resolve(null);
        return;
      }

      String action = intent.getAction();
      if (action == null || !action.equals(Intent.ACTION_WEB_SEARCH)) {
        promise.resolve(null);
        return;
      }

      params.putString("action", action);
      Set<String> categories = intent.getCategories();
      params.putArray("categories", Arguments.makeNativeArray(categories));
      params.putString("type", intent.getType());
      params.putString("data", intent.getDataString());
      params.putMap("extras", Arguments.fromBundle(intent.getExtras()));
      promise.resolve(params);

    } catch (Exception e) {
      promise.reject(new JSApplicationIllegalArgumentException("Could not get Intent: " + e.getMessage()));
    }
  }

  // @Override
  // public Map<String, Object> getConstants() {
  //   final Map<String, Object> constants = new HashMap<>();
  //   constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
  //   constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
  //   return constants;
  // }

  @Override
  public String getName() {
    return "ReceiveWebSearchIntent";
  }
}
