package com.beimi.mahjongai;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class MainActivity extends Activity {
    private WebView gameView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        gameView = new WebView(this);
        WebSettings settings = gameView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportZoom(false);
        WebView.setWebContentsDebuggingEnabled(false);
        gameView.setBackgroundColor(0xff020b0f);
        gameView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openExternalUrl(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternalUrl(Uri.parse(url));
            }
        });
        Uri gameUri = Uri.parse("file:///android_asset/web/client/index.html")
            .buildUpon()
            .appendQueryParameter("serviceUrl", getString(R.string.service_url))
            .build();
        gameView.loadUrl(gameUri.toString());
        setContentView(gameView);
    }

    private boolean openExternalUrl(Uri uri) {
        if ("file".equals(uri.getScheme())) {
            return !"/android_asset/web/client/index.html".equals(uri.getPath());
        }
        if (!"https".equals(uri.getScheme()) && !"http".equals(uri.getScheme())) {
            return true;
        }
        startActivity(new Intent(Intent.ACTION_VIEW, uri));
        return true;
    }

    @Override
    protected void onDestroy() {
        gameView.destroy();
        super.onDestroy();
    }
}
