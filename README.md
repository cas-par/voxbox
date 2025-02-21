# VoxBox Prototyp

Ein einfacher Web-basierter Prototyp für das VoxBox-Projekt, der die Stimmverzerrungs-Funktionalität demonstriert.

## Funktionen

- Echtzeit-Audioaufnahme über das Mikrofon
- Stimmverzerrungs-Effekt durch Pitch-Shifting
- Einfache Benutzeroberfläche zur Steuerung der Tonhöhe
- Keine Installation erforderlich - läuft direkt im Browser

## Voraussetzungen

- Ein moderner Webbrowser (Chrome, Firefox, Edge oder Safari)
- Ein funktionierendes Mikrofon
- Lokaler Webserver (optional, für Entwicklung)

## Schnellstart

1. Laden Sie die Projektdateien herunter:
   - index.html
   - script.js
   - README.md

2. Öffnen Sie die `index.html` in einem modernen Webbrowser
   - **Hinweis**: Einige Browser erfordern einen Webserver für die Mikrofonnutzung
   - Für die lokale Entwicklung können Sie einen einfachen Webserver verwenden:
     ```bash
     # Mit Python 3
     python -m http.server 8000
     
     # Mit Node.js
     npx http-server
     ```

3. Erlauben Sie den Mikrofonzugriff, wenn Sie dazu aufgefordert werden

4. Verwenden Sie die Steuerelemente:
   - Klicken Sie auf "Start", um die Aufnahme zu beginnen
   - Verwenden Sie den Schieberegler, um die Tonhöhe anzupassen
   - Klicken Sie auf "Stop", um die Aufnahme zu beenden

## Technische Details

Der Prototyp verwendet folgende Web-APIs:
- Web Audio API für die Audioverarbeitung
- MediaDevices API für den Mikrofonzugriff
- JavaScript für die Benutzerinteraktion

## Bekannte Einschränkungen

- Die Audioqualität ist möglicherweise nicht optimal
- Der Pitch-Shifting-Algorithmus ist sehr einfach gehalten
- ScriptProcessor ist veraltet, wird aber für diesen Prototyp noch verwendet
- Keine Offline-Funktionalität

## Nächste Schritte

Dieser Prototyp dient als Proof-of-Concept für das vollständige VoxBox-Projekt. Die finale Version wird:
- Auf einem ESP32 laufen
- Bessere Audioqualität bieten
- Offline funktionieren
- Zusätzliche Features wie Sprachübersetzung enthalten

## Lizenz

MIT Lizenz - Siehe LICENSE Datei für Details 