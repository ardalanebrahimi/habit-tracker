package com.ardiland.habittracker;

import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Handle system UI and insets
        setupWindowInsets();
    }
    
    private void setupWindowInsets() {
        View decorView = getWindow().getDecorView();
        
        // Set up window insets listener
        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
            // Get system window insets
            WindowInsetsCompat systemInsets = ViewCompat.getRootWindowInsets(v);
            if (systemInsets != null) {
                int top = systemInsets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
                int bottom = systemInsets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
                
                // Apply padding to avoid system UI overlap
                v.setPadding(0, top, 0, bottom);
            }
            return insets;
        });
        
        // Request layout
        decorView.requestApplyInsets();
    }
}
