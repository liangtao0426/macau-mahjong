package com.mahjong.score;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 设置系统状态栏与底部导航栏为深色字体与图标，背景为麻雀记专属暖黄色 #F8F3EB
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
        }
        getWindow().setStatusBarColor(Color.parseColor("#F8F3EB"));
        getWindow().setNavigationBarColor(Color.parseColor("#F8F3EB"));
    }
}
