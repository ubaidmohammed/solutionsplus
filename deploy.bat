del "publish\*.*" /s /q

cd publish
mkdir frontend
mkdir backend
mkdir TM
cd..
xcopy "frontend\*.*" "publish\frontend" /Y /S  /D:08-17-2022
xcopy "D:\Personal\Reflections\Products\selfridgesoc\backend\Reflections.Soc.Services\bin\Debug\net5.0\*.*" "publish\backend" /Y /S  /D:08-17-2022
xcopy "D:\Personal\Reflections\Products\selfridgesoc\soc-tm\bin\Debug\net5.0\*.*" "publish\TM" /Y /S  /D:08-17-2022
del "D:\Personal\Reflections\Products\selfridgesoc\publish\frontend\app-assets\js\scripts\custom\config.js"
del "D:\Personal\Reflections\Products\selfridgesoc\publish\TM\appsettings.json"