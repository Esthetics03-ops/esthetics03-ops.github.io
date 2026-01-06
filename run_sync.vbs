Set WinScriptHost = CreateObject("WScript.Shell")
WinScriptHost.Run Chr(34) & "pythonw.exe" & Chr(34) & " " & Chr(34) & "C:\path\to\your\sync_engine.py" & Chr(34), 0
Set WinScriptHost = Nothing
