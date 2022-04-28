package com.dogerbrowser;

import android.widget.Toast;
import android.content.Intent;

import com.facebook.react.ReactActivity;

import com.dogerbrowser.ReceiveWebSearchIntentModule;

import android.os.Bundle;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this); // rn splash screen
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    // 改为ReceiveWebSearchIntentModule 接受广播 ?
    ReceiveWebSearchIntentModule.sendIntentEvent(intent);
  }

  @Override
  protected String getMainComponentName() {
    return "DogerBrowser";
  }
}
