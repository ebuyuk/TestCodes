cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-android-fingerprint-auth/www/FingerprintAuth.js",
        "id": "cordova-plugin-android-fingerprint-auth.FingerprintAuth",
        "clobbers": [
            "FingerprintAuth"
        ]
    },
    {
        "file": "plugins/cordova-plugin-android-permissions/www/permissions.js",
        "id": "cordova-plugin-android-permissions.Permissions",
        "clobbers": [
            "cordova.plugins.permissions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-badge/www/badge.js",
        "id": "cordova-plugin-badge.Badge",
        "clobbers": [
            "plugin.notification.badge",
            "cordova.plugins.notification.badge"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
        "id": "cordova-plugin-camera.Camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
        "id": "cordova-plugin-camera.CameraPopoverOptions",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/Camera.js",
        "id": "cordova-plugin-camera.camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverHandle.js",
        "id": "cordova-plugin-camera.CameraPopoverHandle",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dbcopy/www/sqlDB.js",
        "id": "cordova-plugin-dbcopy.sqlDB",
        "clobbers": [
            "window.plugins.sqlDB"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "id": "cordova-plugin-dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/android/notification.js",
        "id": "cordova-plugin-dialogs.notification_android",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-document-viewer/www/sitewaertsdocumentviewer.js",
        "id": "cordova-plugin-document-viewer.SitewaertsDocumentViewer",
        "clobbers": [
            "cordova.plugins.SitewaertsDocumentViewer",
            "SitewaertsDocumentViewer"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/DirectoryEntry.js",
        "id": "cordova-plugin-file.DirectoryEntry",
        "clobbers": [
            "window.DirectoryEntry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/DirectoryReader.js",
        "id": "cordova-plugin-file.DirectoryReader",
        "clobbers": [
            "window.DirectoryReader"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Entry.js",
        "id": "cordova-plugin-file.Entry",
        "clobbers": [
            "window.Entry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/File.js",
        "id": "cordova-plugin-file.File",
        "clobbers": [
            "window.File"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileEntry.js",
        "id": "cordova-plugin-file.FileEntry",
        "clobbers": [
            "window.FileEntry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileError.js",
        "id": "cordova-plugin-file.FileError",
        "clobbers": [
            "window.FileError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileReader.js",
        "id": "cordova-plugin-file.FileReader",
        "clobbers": [
            "window.FileReader"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileSystem.js",
        "id": "cordova-plugin-file.FileSystem",
        "clobbers": [
            "window.FileSystem"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileUploadOptions.js",
        "id": "cordova-plugin-file.FileUploadOptions",
        "clobbers": [
            "window.FileUploadOptions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileUploadResult.js",
        "id": "cordova-plugin-file.FileUploadResult",
        "clobbers": [
            "window.FileUploadResult"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileWriter.js",
        "id": "cordova-plugin-file.FileWriter",
        "clobbers": [
            "window.FileWriter"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Flags.js",
        "id": "cordova-plugin-file.Flags",
        "clobbers": [
            "window.Flags"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/LocalFileSystem.js",
        "id": "cordova-plugin-file.LocalFileSystem",
        "clobbers": [
            "window.LocalFileSystem"
        ],
        "merges": [
            "window"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Metadata.js",
        "id": "cordova-plugin-file.Metadata",
        "clobbers": [
            "window.Metadata"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/ProgressEvent.js",
        "id": "cordova-plugin-file.ProgressEvent",
        "clobbers": [
            "window.ProgressEvent"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystems.js",
        "id": "cordova-plugin-file.fileSystems"
    },
    {
        "file": "plugins/cordova-plugin-file/www/requestFileSystem.js",
        "id": "cordova-plugin-file.requestFileSystem",
        "clobbers": [
            "window.requestFileSystem"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
        "id": "cordova-plugin-file.resolveLocalFileSystemURI",
        "merges": [
            "window"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/browser/isChrome.js",
        "id": "cordova-plugin-file.isChrome",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-file/www/android/FileSystem.js",
        "id": "cordova-plugin-file.androidFileSystem",
        "merges": [
            "FileSystem"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystems-roots.js",
        "id": "cordova-plugin-file.fileSystems-roots",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystemPaths.js",
        "id": "cordova-plugin-file.fileSystemPaths",
        "merges": [
            "cordova"
        ],
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransferError.js",
        "id": "cordova-plugin-file-transfer.FileTransferError",
        "clobbers": [
            "window.FileTransferError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransfer.js",
        "id": "cordova-plugin-file-transfer.FileTransfer",
        "clobbers": [
            "window.FileTransfer"
        ]
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "id": "cordova-plugin-geolocation.geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "id": "cordova-plugin-geolocation.PositionError",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-image-picker/www/imagepicker.js",
        "id": "cordova-plugin-image-picker.ImagePicker",
        "clobbers": [
            "plugins.imagePicker"
        ]
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "id": "cordova-plugin-network-information.network",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "id": "cordova-plugin-network-information.Connection",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "file": "plugins/cordova-plugin-networkinterface/www/networkinterface.js",
        "id": "cordova-plugin-networkinterface.networkinterface",
        "clobbers": [
            "window.networkinterface"
        ]
    },
    {
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "id": "cordova-plugin-statusbar.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/cordova-plugin-touch-id/www/TouchID.js",
        "id": "cordova-plugin-touch-id.TouchID",
        "clobbers": [
            "window.plugins.touchid"
        ]
    },
    {
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "id": "cordova-plugin-vibration.notification",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    },
    {
        "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
        "id": "cordova-sqlite-storage.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.local-notification/www/local-notification.js",
        "id": "de.appplant.cordova.plugin.local-notification.LocalNotification",
        "clobbers": [
            "cordova.plugins.notification.local",
            "plugin.notification.local"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.local-notification/www/local-notification-core.js",
        "id": "de.appplant.cordova.plugin.local-notification.LocalNotification.Core",
        "clobbers": [
            "cordova.plugins.notification.local.core",
            "plugin.notification.local.core"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.local-notification/www/local-notification-util.js",
        "id": "de.appplant.cordova.plugin.local-notification.LocalNotification.Util",
        "merges": [
            "cordova.plugins.notification.local.core",
            "plugin.notification.local.core"
        ]
    },
    {
        "file": "plugins/ionic-plugin-deploy/www/ionicdeploy.js",
        "id": "ionic-plugin-deploy.IonicDeploy",
        "clobbers": [
            "IonicDeploy"
        ]
    },
    {
        "file": "plugins/ionic-plugin-keyboard/www/android/keyboard.js",
        "id": "ionic-plugin-keyboard.keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
        "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
        "clobbers": [
            "cordova.plugins.barcodeScanner"
        ]
    },
    {
        "file": "plugins/uk.co.workingedge.cordova.plugin.sqliteporter/www/sqlitePorter.js",
        "id": "uk.co.workingedge.cordova.plugin.sqliteporter.sqlitePorter",
        "clobbers": [
            "cordova.plugins.sqlitePorter"
        ]
    },
    {
        "file": "plugins/cordova-plugin-ionic/www/common.js",
        "id": "cordova-plugin-ionic.common",
        "clobbers": [
            "IonicCordova"
        ],
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-android-fingerprint-auth": "1.4.3",
    "cordova-plugin-android-permissions": "0.10.0",
    "cordova-plugin-app-event": "1.2.1",
    "cordova-plugin-badge": "0.7.4",
    "cordova-plugin-compat": "1.2.0",
    "cordova-plugin-camera": "2.2.0",
    "cordova-plugin-console": "1.0.7",
    "cordova-plugin-dbcopy": "2.0.0",
    "cordova-plugin-device": "1.1.7",
    "cordova-plugin-dialogs": "1.3.4",
    "cordova-plugin-document-viewer": "0.5.0",
    "cordova-plugin-file": "4.2.0",
    "cordova-plugin-file-transfer": "1.5.1",
    "cordova-plugin-geolocation": "2.4.3",
    "cordova-plugin-image-picker": "1.1.1",
    "cordova-plugin-network-information": "1.2.1",
    "cordova-plugin-networkinterface": "1.0.8",
    "cordova-plugin-splashscreen": "3.2.2",
    "cordova-plugin-statusbar": "2.1.3",
    "cordova-plugin-touch-id": "3.3.1",
    "cordova-plugin-vibration": "2.1.5",
    "cordova-plugin-whitelist": "1.2.2",
    "cordova-sqlite-storage": "1.4.9",
    "de.appplant.cordova.plugin.local-notification": "0.8.4",
    "ionic-plugin-deploy": "0.6.7",
    "ionic-plugin-keyboard": "2.2.1",
    "phonegap-plugin-barcodescanner": "4.0.1",
    "uk.co.workingedge.cordova.plugin.sqliteporter": "0.1.7",
    "cordova-plugin-add-swift-support": "1.7.2",
    "cordova-plugin-ionic": "2.0.3"
};
// BOTTOM OF METADATA
});