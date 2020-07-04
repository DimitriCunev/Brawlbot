const { app, BrowserWindow } = require('electron')
require('electron-reload')(__dirname);
function createWindow () {
  // Создаем окно браузера.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    transparent:true,
    frame:false,
    fullscreen:true,
  })
  win.setIgnoreMouseEvents(true)
  // и загрузить index.html приложения.
  win.loadFile('index.html')
  win.setAlwaysOnTop(true,'floating')

}

app.whenReady().then(createWindow)

var apps = require('express')();
var http = require('http').createServer(apps);
var io = require('socket.io')(http);
