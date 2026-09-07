import http.server,base64,json,os,urllib.parse
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        n=int(self.headers['Content-Length']); body=json.loads(self.rfile.read(n))
        name=os.path.basename(body['name']); data=body['data'].split(',',1)[1]
        open(os.path.join('shots',name),'wb').write(base64.b64decode(data))
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',8765),H).serve_forever()
