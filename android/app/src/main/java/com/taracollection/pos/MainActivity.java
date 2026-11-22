package com.taracollection.pos;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintJob;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private WebView printWebView; // Hold strong reference to avoid GC during printing

    @Override
    protected void load() {
        super.load();
        setupAndroidPrint();
    }

    @Override
    public void onResume() {
        super.onResume();
        setupAndroidPrint();
    }

    private void setupAndroidPrint() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new AndroidPrintInterface(this), "AndroidPrint");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class AndroidPrintInterface {
        private final Activity activity;

        public AndroidPrintInterface(Activity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return true;
        }

        @JavascriptInterface
        public boolean isRawBTInstalled() {
            try {
                activity.getPackageManager().getPackageInfo("ru.a402d.rawbtprinter", 0);
                return true;
            } catch (PackageManager.NameNotFoundException e) {
                return false;
            }
        }

        /**
         * Android System Print Spooler (Works with USB OTG, Bluetooth, WiFi, Mopria, & Save as PDF)
         */
        @JavascriptInterface
        public void printHTML(final String html, final String jobName) {
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    try {
                        printWebView = new WebView(activity);
                        printWebView.getSettings().setJavaScriptEnabled(false);
                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                                return false;
                            }

                            @Override
                            public void onPageFinished(WebView view, String url) {
                                try {
                                    PrintManager printManager = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
                                    if (printManager != null) {
                                        String name = (jobName != null && !jobName.trim().isEmpty()) ? jobName : "Receipt";
                                        PrintDocumentAdapter printAdapter = printWebView.createPrintDocumentAdapter(name);
                                        PrintAttributes.Builder builder = new PrintAttributes.Builder();
                                        builder.setColorMode(PrintAttributes.COLOR_MODE_MONOCHROME);
                                        printManager.print(name, printAdapter, builder.build());
                                    }
                                } catch (Exception ex) {
                                    ex.printStackTrace();
                                    Toast.makeText(activity, "Print error: " + ex.getMessage(), Toast.LENGTH_SHORT).show();
                                }
                            }
                        });
                        printWebView.loadDataWithBaseURL("file:///android_asset/", html, "text/html", "UTF-8", null);
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(activity, "Print setup error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        /**
         * Direct 1-Tap OTG USB / Bluetooth Thermal Print via RawBT
         */
        @JavascriptInterface
        public boolean printRawBT(final String base64Html) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse("rawbt:data:text/html;base64," + base64Html));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                PackageManager pm = activity.getPackageManager();
                if (intent.resolveActivity(pm) != null) {
                    activity.startActivity(intent);
                    return true;
                } else {
                    new Handler(Looper.getMainLooper()).post(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(activity, "OTG Thermal Printer के लिए RawBT ऐप आवश्यक है (Play Store खुल रहा है)...", Toast.LENGTH_LONG).show();
                            try {
                                Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=ru.a402d.rawbtprinter"));
                                marketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                activity.startActivity(marketIntent);
                            } catch (Exception ex) {
                                Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter"));
                                webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                activity.startActivity(webIntent);
                            }
                        }
                    });
                    return false;
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
    }
}
