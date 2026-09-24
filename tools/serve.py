#!/usr/bin/env python3
"""Static dev server with clean URLs, Range support and a 404 page.

    python3 tools/serve.py [port]      # default 8100
"""
import io, os, sys, gzip, http.server, socketserver, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8100

MIME = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.riv': 'application/octet-stream',
        '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json'}


# Text assets are gzipped on the fly so local testing matches what a real host
# (or CDN) does. Without this, CSS/JS/HTML transfer at full size and any
# performance measurement taken here is pessimistic by roughly 3x.
COMPRESSIBLE = ('.html', '.css', '.js', '.json', '.svg', '.txt', '.webmanifest')
MIN_GZIP = 1024


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        path = urllib.parse.urlparse(path).path
        local = super().translate_path(path)
        if os.path.isdir(local):
            for name in ('index.html',):
                idx = os.path.join(local, name)
                if os.path.exists(idx):
                    return idx
        if not os.path.exists(local) and not os.path.splitext(local)[1]:
            alt = local + '.html'
            if os.path.exists(alt):
                return alt
        return local

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return MIME.get(ext) or super().guess_type(path)

    def send_response(self, code, message=None):
        code = getattr(self, '_force_status', None) or code
        super().send_response(code, message)

    def send_head(self):
        if self.command in ('GET', 'HEAD'):
            local = self.translate_path(self.path)
            if not os.path.exists(local):
                self.path = '/404.html'
                self._force_status = 404
        self._gzipped = False
        local = self.translate_path(self.path)
        ext = os.path.splitext(local)[1].lower()
        if ('gzip' in self.headers.get('Accept-Encoding', '')
                and ext in COMPRESSIBLE and os.path.isfile(local)
                and os.path.getsize(local) >= MIN_GZIP):
            try:
                with open(local, 'rb') as f:
                    body = gzip.compress(f.read(), 6)
            except OSError:
                pass
            else:
                self.send_response(getattr(self, '_force_status', None) or 200)
                self.send_header('Content-Type', self.guess_type(local))
                self.send_header('Content-Length', str(len(body)))
                self._gzipped = True
                self.end_headers()
                return io.BytesIO(body)
        return super().send_head()

    def end_headers(self):
        if getattr(self, '_gzipped', False):
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Vary', 'Accept-Encoding')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s\n" % (fmt % args))


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with Server(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Netso site -> http://localhost:{PORT}  (serving {ROOT})')
        httpd.serve_forever()
