package com.leaveapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "LeaveApp"

    override fun onCreate(savedInstanceState: Bundle?) {
        // Switch from SplashTheme → AppTheme before React Native renders.
        // This makes the splash disappear the moment the JS UI is ready,
        // with no white flash in between.
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
