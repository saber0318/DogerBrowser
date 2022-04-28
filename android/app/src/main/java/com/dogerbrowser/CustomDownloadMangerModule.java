package com.dogerbrowser;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.core.content.FileProvider;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class CustomDownloadMangerModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  private static DownloadManager downloadManager;

  private static final String TAG = "CustomDownloadMangerModule";
  public static final Uri CONTENT_URI = Uri.parse("content://downloads/my_downloads");

  public static final int CONSTANTS_STATUS_PAUSED = 4;
  public static final int CONSTANTS_STATUS_PENDING = 1;
  public static final int CONSTANTS_STATUS_RUNNING = 2;
  public static final int CONSTANTS_STATUS_SUCCESSFUL = 8;
  public static final int CONSTANTS_STATUS_FAILED = 16;
  public static final int CONSTANTS_STATUS_CANCELED = 20;

  public CustomDownloadMangerModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
    downloadManager = (DownloadManager) reactContext.getSystemService(Context.DOWNLOAD_SERVICE);
  }

  @ReactMethod
  public void queryStatusByDownloadId(Integer downloadId, Callback callback) {
    if (callback != null) {
      callback.invoke(queryStatus(downloadId));
    }
  }

  public WritableMap queryStatus(Integer downloadId) {
    DownloadManager.Query query = new DownloadManager.Query();
    query.setFilterById(downloadId);
    Cursor cursor = downloadManager.query(query);
    WritableMap params = Arguments.createMap();
    if (cursor.moveToFirst()) {
      int status = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_STATUS));
      String downloadPath = cursor.getString(cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI));
      String url = cursor.getString(cursor.getColumnIndex(DownloadManager.COLUMN_URI));
      String description = cursor.getString(cursor.getColumnIndex(DownloadManager.COLUMN_DESCRIPTION));
      int reason = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_REASON));

      boolean fileExists = isFileExist(downloadPath);
      params.putBoolean("fileExists", fileExists);

      // if (status == CONSTANTS_STATUS_SUCCESSFUL && !fileExists) {
      //   status = CONSTANTS_STATUS_CANCELED;
      // }

      params.putInt("status", status);
      params.putString("downloadPath", downloadPath);
      params.putString("url", url);
      params.putString("description", description);
      params.putInt("reason", reason);

      if (TextUtils.isEmpty(downloadPath)) {
        params.putString("fileName", "");
        params.putString("mimeType", "");
      } else if (!downloadPath.contains("/")) {
        params.putString("fileName", "");
        params.putString("mimeType", "");
      } else {
        String temp[] = downloadPath.split("\\/");
        String fileName = temp[temp.length - 1];
        params.putString("fileName", fileName);

        String mimeType = getMimeFromFileName(sanitizeFileName(Uri.encode(downloadPath)));
        params.putString("mimeType", mimeType);
      }

      long downloadBytes = cursor.getLong(cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
      long totalBytes = cursor.getLong(cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
      params.putDouble("downloadBytes", (double) downloadBytes);
      params.putDouble("totalBytes", (double) totalBytes);
    }
    return params;
  }

  public static boolean isFileExist(String url) {
    try {
      if (url == null) {
        return false;
      }
      if (url.equals("")) {
        return false;
      }
      url = Uri.parse(url).getPath();
      return (new File(url).exists());
    } catch (Exception e) {
      return false;
    }
  }

  @ReactMethod
  public void remove(Integer downloadId, Callback callback) {
    if (callback != null) {
      callback.invoke(removeDownload((long) downloadId));
    }
  }

  public int removeDownload(long downloadId) {
    try {
      downloadManager.remove(downloadId);
      return 1;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return -1;
  }

  @ReactMethod
  private void openFile(String path) {
    Uri contentUri = null;
    Boolean showOpenWithDialog = true;
    Boolean showStoreSuggestions = true;

    if(path.startsWith("content://")) {
      contentUri = Uri.parse(path);
    } else {
      File newFile = new File(path);

      Activity currentActivity = getCurrentActivity();
      if(currentActivity == null) {
        // sendEvent(OPEN_EVENT, currentId, "Activity doesn't exist");
        Log.e(TAG, " -> openFile -> Activity doesn't exist ");
        return;
      }
      try {
        final String packageName = currentActivity.getPackageName();
        final String authority = new StringBuilder(packageName).append(".provider").toString();
        contentUri = FileProvider.getUriForFile(currentActivity, authority, newFile);
      }
      catch(Exception e) {
        Log.e(TAG, " -> openFile -> error " + e.getMessage());
        e.printStackTrace();
        return;
      }
    }

    if(contentUri == null) {
      return;
    }

    String extension = MimeTypeMap.getFileExtensionFromUrl(path).toLowerCase();
    // String mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
    String mimeType = getMimeFromFileName(sanitizeFileName(Uri.encode(path)));

    // Log.w(TAG, " -> openFile -> extension " + extension);
    // Log.w(TAG, " -> openFile -> mimeType " + mimeType);
    // Log.w(TAG, " -> contentUri -> contentUri " + contentUri.getPath());

    Intent shareIntent = new Intent();

    shareIntent.setAction(Intent.ACTION_VIEW);
    shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
    shareIntent.setDataAndType(contentUri, mimeType);
    shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
    Intent intentActivity;

    if (showOpenWithDialog) {
      intentActivity = Intent.createChooser(shareIntent, "Open with");
    } else {
      intentActivity = shareIntent;
    }

    try {
      getCurrentActivity().startActivity(intentActivity);
    }
    catch(Exception e) {
      Log.e(TAG, " -> openFile -> error " + e.getMessage());
      e.printStackTrace();
    }
  }

  // https://stackoverflow.com/questions/14320527/android-should-i-use-mimetypemap-getfileextensionfromurl-bugs/14321470
  private String getMimeFromFileName(String fileName) {
    MimeTypeMap map = MimeTypeMap.getSingleton();
    String ext = MimeTypeMap.getFileExtensionFromUrl(fileName);
    return map.getMimeTypeFromExtension(ext);
  }

  public static String sanitizeFileName(String name) {
    byte[] invalidChars = new byte[]{34, 60, 62, 124, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 58, 42, 63, 92, 47};
    for(byte i : invalidChars)
    {
      name = name.replace((char)i,'_');
    }
    return name;
  }

  @ReactMethod
  public void resume(Integer downloadId, Callback callback) {
    if (callback != null) {
      callback.invoke(resumeDownload((long) downloadId));
    }
  }
  private static int resumeDownload(long downloadId) {
    if (downloadId >= 0) {
      try {
        ContentResolver mResolver = reactContext.getContentResolver();
        ContentValues values = new ContentValues();
        // values.put(Downloads.Impl.COLUMN_CONTROL, Downloads.Impl.CONTROL_RUN);
        // values.put(Downloads.Impl.COLUMN_STATUS, Downloads.Impl.STATUS_RUNNING);
        values.put("control", 0);
        values.put("status", 192);
        return mResolver.update(ContentUris.withAppendedId(CONTENT_URI, downloadId), values,
            null, null);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return -1;
  }

  @ReactMethod
  public void pause(Integer downloadId, Callback callback) {
    if (callback != null) {
      callback.invoke(pauseDownload((long) downloadId));
    }
  }
  private static int pauseDownload(long downloadId) {
    if (downloadId >= 0) {
      try {
        ContentResolver mResolver = reactContext.getContentResolver();
        ContentValues values = new ContentValues();
        // values.put(Downloads.Impl.COLUMN_CONTROL, Downloads.Impl.CONTROL_PAUSED);
        // values.put(Downloads.Impl.COLUMN_STATUS, Downloads.Impl.STATUS_PAUSED_BY_APP);
        values.put("control", 1);
        values.put("status", 193);
        return mResolver.update(ContentUris
            .withAppendedId(CONTENT_URI, downloadId), values,
            null, null);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return -1;
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    // https://docs.microsoft.com/zh-cn/dotnet/api/android.app.downloadstatus?view=xamarin-android-sdk-12
    constants.put("STATUS_PAUSED", CONSTANTS_STATUS_PAUSED); // 暂停
    constants.put("STATUS_PENDING", CONSTANTS_STATUS_PENDING); // 延迟
    constants.put("STATUS_RUNNING", CONSTANTS_STATUS_RUNNING); // 正在下载
    constants.put("STATUS_SUCCESSFUL", CONSTANTS_STATUS_SUCCESSFUL); // 完成
    constants.put("STATUS_FAILED", CONSTANTS_STATUS_FAILED); // 失败
    constants.put("STATUS_CANCELED", CONSTANTS_STATUS_CANCELED); // 取消
  
    return constants;
  }

  @Override
  public String getName() {
    return "CustomDownloadManger";
  }
}
