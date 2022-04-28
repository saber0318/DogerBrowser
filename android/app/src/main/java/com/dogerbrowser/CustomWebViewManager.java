package com.dogerbrowser;

import android.content.Context;
import android.os.Build;
import android.os.Environment;
import android.os.SystemClock;
import android.webkit.WebView;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceResponse;
import android.webkit.WebResourceRequest;
import android.app.DownloadManager;
import android.util.Log;
import android.net.Uri;
import android.graphics.Bitmap;
import android.text.TextUtils;

import androidx.annotation.Nullable;
import androidx.core.util.Pair;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.module.annotations.ReactModule;

import com.reactnativecommunity.webview.RNCWebViewManager;
import com.reactnativecommunity.webview.RNCWebViewModule;

import java.lang.IllegalArgumentException;
import java.text.DecimalFormat;
import java.net.URL;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

@ReactModule(name = CustomWebViewManager.REACT_CLASS)
public class CustomWebViewManager extends RNCWebViewManager {
  /* This name must match what we're referring to in JS */
  protected static final String REACT_CLASS = "RCTCustomWebView";
  private static final String TAG = "CustomWebViewManager";

  private static final Pattern PATTERN1 =
  Pattern.compile("attachment;\\s*filename\\s*=\\s*(\"?)([^\"]*)\\1\\s*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern PATTERN2 =
  Pattern.compile("attachment;\\s*filename\\*=UTF-8''(\"?)([^\"]*)\\1\\s*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern PATTERN3 =
  Pattern.compile("attachment;filename=\"(\"?)([^\"]*)\\1\\s*\";filename\\*\\=(\"?)([^\"]*)\\1\\s*$", Pattern.CASE_INSENSITIVE);

  ReactApplicationContext reactContext;

  protected static boolean isRedirect = false;
  protected static boolean isPageOk = false;

  protected static boolean enableSniffingResources = false;
  protected static List<String> resources = new ArrayList<String>();
  protected static List<String> VIDEO_EXTENSION_LIST = Arrays.asList("avi", "mov", "rmvb", "rm", "flv", "mp4", "3gp", "wmv", "mpg", "mpeg", "ram", "swf", "vob", "mov", "m3u8", "m4a", "m4p", "m4u", "m4v");

  protected static final int COMMAND_CLEAR_COOKIE = 1003;

  protected static final int COMMAND_ON_SHOULD_START_DOWNLOAD_WITH_REQUEST_CALLBACK = 9001;
  protected static final int COMMAND_UPDATE_SNIFF_RESOURCES = 9002;
  protected static final int COMMAND_DOWNLOAD_FILE = 9003;

  protected static final int SHOULD_DOWNLOAD_FILE_WAITING_TIMEOUT = 60000;

  protected static final ShouldDownloadFileLock shouldDownloadFileLock = new ShouldDownloadFileLock();

  public CustomWebViewManager(ReactApplicationContext reactContext) {
    this.reactContext = reactContext;
  }

  protected static class ShouldDownloadFileLock {
    private int nextLockIdentifier = 1;
    private final HashMap<Integer, WritableMap> shouldDownloadLocks = new HashMap<>();

    public int getNewIdentifier() {
      final int lockIdentifier = nextLockIdentifier++;
      return nextLockIdentifier;
    }

    @Nullable
    public WritableMap getLock(
        Integer lockIdentifier) {
      return shouldDownloadLocks.get(lockIdentifier);
    }

    public void putLock(Integer lockIdentifier, WritableMap map) {
      shouldDownloadLocks.put(lockIdentifier, map);
    }

    public void removeLock(Integer lockIdentifier) {
      shouldDownloadLocks.remove(lockIdentifier);
    }
  }

  @Override
  protected WebView createViewInstance(ThemedReactContext reactContext) {
    // RNCWebView
    WebView webView = super.createViewInstance(reactContext);
    webView.setDownloadListener(new DownloadListener() {
      public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype,
          long contentLength) {

        ((RNCWebView) webView).setIgnoreErrFailedForThisURL(url);

        int identifier = shouldDownloadFileLock.getNewIdentifier();

        String mimeType = "";
        if (!TextUtils.isEmpty(mimetype)) {
          mimeType = mimetype;
        } else {
          mimeType = MimeTypeMap.getFileExtensionFromUrl(url);
        }

        String fileName = guessFileName(url, contentDisposition, mimetype);
        // String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);

        String mimeTypeFromFileName = getMimeFromFileName(sanitizeFileName(Uri.encode(fileName)));

        if (mimeType.equals(new String("application/octet-stream")) && mimeTypeFromFileName != null) {
          mimeType = mimeTypeFromFileName;
        }

        WritableMap params = Arguments.createMap();
        params.putString("fileName", fileName);
        params.putString("url", url);
        params.putString("userAgent", userAgent);
        params.putString("contentDisposition", contentDisposition);
        params.putString("mimetype", mimetype);
        params.putDouble("contentLength", contentLength);
        params.putInt("identifier", identifier);

        shouldDownloadFileLock.putLock(identifier, params);

        DecimalFormat decimalFormat = new DecimalFormat("0.00");
        String fileSize = "";
        float size = contentLength;
        if (size < 1024){
          fileSize = size + "B";
        } else if (size < 1048576){
          String dirSizeStringKB = decimalFormat.format(size / 1024);
          fileSize = dirSizeStringKB + "kB";
        } else if (size < 1073741824){
          String dirSizeStringM = decimalFormat.format(size / 1048576);
          fileSize = dirSizeStringM + "MB";
        } else {
          String dirStringG = decimalFormat.format(size / 1073741824);
          fileSize = dirStringG + "GB";
        }

        WritableNativeArray nativeArray = new WritableNativeArray();
        nativeArray.pushInt(identifier);
        nativeArray.pushString(url);
        nativeArray.pushString(fileName);
        nativeArray.pushString(fileSize);
        nativeArray.pushString(mimetype);
        nativeArray.pushDouble((double)size);
        nativeArray.pushString(contentDisposition);

        // 不使用事件的方式实现
        CatalystInstance catalystInstance = reactContext.getCatalystInstance();
        catalystInstance.callFunction("JavaScriptVisibleToJava", "onShouldStartDownloadWithRequest",
            nativeArray);

        // 设置超时时间
        new Timer().schedule(new TimerTask() {
          public void run() {
            Log.w(TAG, "download file timeout");
            WritableMap param = shouldDownloadFileLock.getLock(identifier);
            if (param != null) {
              shouldDownloadFileLock.removeLock(identifier);
              onShouldStartDownloadWithRequestError("timeout", identifier);
            }
          }
        }, SHOULD_DOWNLOAD_FILE_WAITING_TIMEOUT);

      }
    });
    return webView;
  }

  public static final String guessFileName(String url, String disposition, String mimeType) {
    String filename = null;
    // try to get from content disposition
    if (disposition != null) {
        filename=getFilenameFromDispo(disposition);
    }

    // If all the other http-related approaches failed, use the plain uri
    if (filename == null||TextUtils.isEmpty(filename)) {
        String decodedUrl = Uri.decode(url);
        if (decodedUrl != null) {
            int queryIndex = decodedUrl.indexOf('?');
            // If there is a query string strip it, same as desktop browsers
            if (queryIndex > 0) {
                decodedUrl = decodedUrl.substring(0, queryIndex);
            }
            if(decodedUrl.endsWith("/")) {
              decodedUrl = decodedUrl.substring(0, decodedUrl.length() - 1);
            }
            int index = decodedUrl.lastIndexOf('/') + 1;
            if (index > 0) {
                filename = decodedUrl.substring(index);
            }
        }
    }
    // Finally, if couldn't get filename from URI, get a generic filename
    if (filename == null) {
        filename = "unknown";
    }
    // Split filename between base and extension
    // Add an extension if filename does not have one
    int dotIndex = filename.indexOf('.'+1);
    if (dotIndex==0){
        String fn = filename;
        String extension = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            extension = MimeType.get(mimeType);
        }
        filename=fn+"."+extension;
    }

    return filename;
  }

  public static String getFilenameFromDispo(String dispo){
    Matcher matcher = PATTERN1.matcher(dispo);
    if (matcher.find()){
      return matcher.group(2);
    }else {
      matcher = PATTERN2.matcher(dispo);
      if (matcher.find()){
        return matcher.group(2);
      }else {
        matcher = PATTERN3.matcher(dispo);
        if (matcher.find()){
          return matcher.group(2);
        }
      }
    }
    return null;
  }

  public void downloadFile(String url, String fileName, String userAgent, String mimetype, long contentLength) {
    RNCWebViewModule module = getModule(reactContext);

    DownloadManager.Request request;
    try {
      request = new DownloadManager.Request(Uri.parse(url));
    } catch (IllegalArgumentException e) {
      return;
    }

    if (TextUtils.isEmpty(fileName)) {
      fileName = guessFileName(url, null, null); 
    }

    String downloadMessage = "Downloading " + fileName;

    // Attempt to add cookie, if it exists
    URL urlObj = null;
    try {
      urlObj = new URL(url);
      String baseUrl = urlObj.getProtocol() + "://" + urlObj.getHost();
      String cookie = CookieManager.getInstance().getCookie(baseUrl);
      request.addRequestHeader("Cookie", cookie);
    } catch (MalformedURLException e) {
    }
  
    // Finish setting up request
    if (TextUtils.isEmpty(userAgent)) {
      userAgent = "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Mobile Safari/537.36"; 
    }
    request.addRequestHeader("User-Agent", userAgent);
    request.setTitle(fileName);
    if (TextUtils.isEmpty(mimetype)) {
      mimetype = getMimeFromFileName(sanitizeFileName(Uri.encode(fileName)));
    }
    request.setMimeType(mimetype);
    request.setDescription(downloadMessage);
    request.allowScanningByMediaScanner();
    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_ONLY_COMPLETION); // VISIBILITY_HIDDEN
    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

    if (module.grantFileDownloaderPermissions()) {
      DownloadManager downloadManager = (DownloadManager) reactContext.getSystemService(Context.DOWNLOAD_SERVICE);
      long downloadId = downloadManager.enqueue(request);

      CatalystInstance catalystInstance = reactContext.getCatalystInstance();
      WritableNativeArray params = new WritableNativeArray();
      params.pushDouble((float)downloadId);
      params.pushString(url);
      params.pushString(fileName);
      params.pushDouble((float)contentLength);
      catalystInstance.callFunction("JavaScriptVisibleToJava", "onStartDownload", params);
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

  @Override
  public @Nullable Map<String, Integer> getCommandsMap() {
    return MapBuilder.<String, Integer>builder()
      .put("goBack", COMMAND_GO_BACK)
      .put("goForward", COMMAND_GO_FORWARD)
      .put("reload", COMMAND_RELOAD)
      .put("stopLoading", COMMAND_STOP_LOADING)
      .put("postMessage", COMMAND_POST_MESSAGE)
      .put("injectJavaScript", COMMAND_INJECT_JAVASCRIPT)
      .put("loadUrl", COMMAND_LOAD_URL)
      .put("requestFocus", COMMAND_FOCUS)
      .put("clearFormData", COMMAND_CLEAR_FORM_DATA)
      .put("clearCache", COMMAND_CLEAR_CACHE)
      .put("clearHistory", COMMAND_CLEAR_HISTORY)
      .put("clearCookie", COMMAND_CLEAR_COOKIE)
      .put("onShouldStartDownloadWithRequestCallback", COMMAND_ON_SHOULD_START_DOWNLOAD_WITH_REQUEST_CALLBACK)
      .put("updateSniffResources", COMMAND_UPDATE_SNIFF_RESOURCES)
      .put("downloadFile", COMMAND_DOWNLOAD_FILE)
      .build();
  }

  @Override
  public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
    super.receiveCommand(root, commandId, args);
    switch (commandId) {
      case COMMAND_CLEAR_COOKIE:
        CookieManager.getInstance().removeAllCookies(null);
        CookieManager.getInstance().removeSessionCookies(null);
        break;
      case COMMAND_ON_SHOULD_START_DOWNLOAD_WITH_REQUEST_CALLBACK:
        assert args != null;
        onShouldStartDownloadWithRequestCallback(args.getBoolean(0), args.getInt(1));
        break;
      case COMMAND_UPDATE_SNIFF_RESOURCES:
        updateSniffResources();
        break;
      case COMMAND_DOWNLOAD_FILE:
        downloadFile(args.getString(0), args.getString(1), null, null, 0);
        break;
    }
  }

  public void updateSniffResources() {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();
    WritableNativeArray params = new WritableNativeArray();
    if (resources.size() > 0) {
      for (int i = 0; i < resources.size(); i++) {
        params.pushString((String)resources.get(i));
        Log.w("TAG", "updateSniffResources -> " + (String)resources.get(i));
      }
    }
    catalystInstance.callFunction("JavaScriptVisibleToJava", "updateResources", params);
  }

  public void onShouldStartDownloadWithRequestCallback(final boolean shouldDownload, final int identifier) {
    // Log.w(TAG, " -> onShouldStartDownloadWithRequestCallback-> shouldDownload " + String.valueOf(shouldDownload));
    // Log.w(TAG, " -> onShouldStartDownloadWithRequestCallback -> identifier " + String.valueOf(identifier));

    if (shouldDownload) {
      WritableMap param = shouldDownloadFileLock.getLock(identifier);

      if (param != null) {
        String url = param.getString("url");
        String fileName = param.getString("fileName");
        String userAgent = param.getString("userAgent");
        String contentDisposition = param.getString("contentDisposition");
        String mimetype = param.getString("mimetype");
        double contentLength = param.getDouble("contentLength");
        try {
          downloadFile(url, fileName, userAgent, mimetype, (long) contentLength);
        } catch (Exception e) {
          onShouldStartDownloadWithRequestError("error", identifier);
        }
      } else {
        onShouldStartDownloadWithRequestError("error", identifier);
      }
    }
    shouldDownloadFileLock.removeLock(identifier);
  }

  public void onShouldStartDownloadWithRequestError(String type, Integer identifier) {
    CatalystInstance catalystInstance = reactContext.getCatalystInstance();
    WritableNativeArray params = new WritableNativeArray();
    params.pushString(type);
    params.pushInt(identifier);
    catalystInstance.callFunction("JavaScriptVisibleToJava", "onShouldStartDownloadWithRequestError", params);
  }

  protected static class CustomWebViewClient extends RNCWebViewClient {
    @Override
    public void onPageStarted(WebView webView, String url, Bitmap favicon) {
      super.onPageStarted(webView, url, favicon);
      resources.clear();
      isRedirect = true;
      isPageOk = false;
    }

    @Override
    public void onPageFinished(WebView webView, String url) {
      super.onPageFinished(webView, url);
      isPageOk = isRedirect;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView webView, String url) {
      isRedirect = false;
      if (isPageOk) {
        return super.shouldOverrideUrlLoading(webView, url);
      }
      // 重定向过程中非http的请求让webView去判断
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return super.shouldOverrideUrlLoading(webView, url);
      }
      return false;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest (WebView view,  WebResourceRequest request) {
      WebResourceResponse response = super.shouldInterceptRequest(view, request);
      if (enableSniffingResources) {
        String url = request.getUrl().toString();
        Log.w("TAG", "url -> " + url.toString());
        String name = guessFileName(url, null, null);
        int extensionIndex = name.lastIndexOf('.');
        if (extensionIndex > 0) {
          String extension = name.substring(extensionIndex + 1);
          Log.w("TAG", "extension -> " + extension);
          if (VIDEO_EXTENSION_LIST.contains(extension.toLowerCase())) {
            Log.w("TAG", "add -> " + url.toString());
            resources.add(url.toString());
          }
        }
      }
      return response;
    }

    @Override
    public void onReceivedError(WebView webView, int errorCode, String description, String failingUrl) {
      try {
        webView.stopLoading();
      } catch (Exception e) {
        e.printStackTrace();
      }
      try {
        webView.clearView();
      } catch (Exception e) {
        e.printStackTrace();
      }
      super.onReceivedError(webView, errorCode, description, failingUrl);
    }
  }

  protected static class CustomWebView extends RNCWebView {
    public CustomWebView(ThemedReactContext reactContext) {
      super(reactContext);
    }
  }

  @ReactProp(name = "enableSniffingResources", defaultBoolean = false)
  public void setEnableSniffResources(WebView webView, boolean enable) {
    enableSniffingResources = enable;
  }

  @Override
  protected RNCWebView createRNCWebViewInstance(ThemedReactContext reactContext) {
    return new CustomWebView(reactContext);
  }

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  protected void addEventEmitters(ThemedReactContext reactContext, WebView webView) {
    webView.setWebViewClient(new CustomWebViewClient());
  }
}