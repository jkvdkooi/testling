#!/usr/bin/env python3
"""
Testling — development server
Start met: python3 dev.py

Serveert altijd verse bestanden (no-cache headers) zodat
browser-caching nooit verouderde JS/CSS toont.
Bereikbaar op http://localhost:3001
"""
import http.server
import os

PORT = 3001
BIND = '0.0.0.0'


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f'  {self.address_string()} — {fmt % args}')


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'Testling dev server → http://localhost:{PORT}')
    print(f'Unit tests          → http://localhost:{PORT}/tests/')
    print('Ctrl+C om te stoppen\n')
    http.server.test(HandlerClass=NoCacheHandler, port=PORT, bind=BIND)
