/*
 * Copyright (C) 2012 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.example.android.common.logger

import kotlin.jvm.JvmOverloads
import android.widget.TextView
import android.app.Activity
import android.widget.ScrollView
import android.view.ViewGroup
import android.graphics.Typeface
import android.view.Gravity
import android.view.LayoutInflater
import android.os.Bundle
import android.text.TextWatcher
import android.text.Editable
import android.util.Log
import androidx.fragment.app.FragmentActivity

/**
 * Helper class which wraps Android's native Log utility in the Logger interface.  This way
 * normal DDMS output can be one of the many targets receiving and outputting logs simultaneously.
 */
class LogWrapper : LogNode {
    /**
     * Returns the next LogNode in the linked list.
     */
    /**
     * Sets the LogNode data will be sent to..
     */
    // For piping:  The next node to receive Log data after this one has done its work.
    var next: LogNode? = null

    /**
     * Prints data out to the console using Android's native log mechanism.
     *
     * @param priority Log level of the data being logged.  Verbose, Error, etc.
     * @param tag      Tag for for the log data.  Can be used to organize log statements.
     * @param msg      The actual message to be logged. The actual message to be logged.
     * @param tr       If an exception was thrown, this can be sent along for the logging facilities
     * to extract and print useful information.
     */
    override fun println(priority: Int, tag: String?, msg: String?, tr: Throwable?) {
        // There actually are log methods that don't take a msg parameter.  For now,
        // if that's the case, just convert null to the empty string and move on.
        var msg = msg
        var useMsg = msg
        if (useMsg == null) {
            useMsg = ""
        }

        // If an exeption was provided, convert that exception to a usable string and attach
        // it to the end of the msg method.
        if (tr != null) {
            msg += """
                
                ${Log.getStackTraceString(tr)}
                """.trimIndent()
        }

        // This is functionally identical to Log.x(tag, useMsg);
        // For instance, if priority were Log.VERBOSE, this would be the same as Log.v(tag, useMsg)
        Log.println(priority, tag, useMsg)

        // If this isn't the last node in the chain, move things along.
        if (next != null) {
            next!!.println(priority, tag, msg, tr)
        }
    }
}