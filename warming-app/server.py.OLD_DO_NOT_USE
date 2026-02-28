#!/usr/bin/env python3
"""DA Warming Dashboard — Python Server (no dependencies)"""
import http.server
import json
import os
import uuid
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
import re

PORT = 3847
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'prospects.json')
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

def load_data():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump({"prospects": []}, f)
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def extract_username(url):
    if not url: return ''
    m = re.search(r'linkedin\.com/in/([^/\?]+)', url)
    return m.group(1) if m else ''

def calc_next_checkin(last_date, interval_days):
    d = datetime.strptime(last_date, '%Y-%m-%d') if last_date else datetime.now()
    d += timedelta(days=interval_days)
    return d.strftime('%Y-%m-%d')

def today_str():
    return datetime.now().strftime('%Y-%m-%d')

def week_start_str():
    d = datetime.now()
    d -= timedelta(days=d.weekday())
    return d.strftime('%Y-%m-%d')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/prospects':
            data = load_data()
            self._json_response(data['prospects'])

        elif path == '/api/queue':
            data = load_data()
            t = today_str()
            queue = [p for p in data['prospects'] if p.get('status') == 'warming' and p.get('next_check_in', '') <= t]
            queue.sort(key=lambda p: p.get('warmth_score', 0), reverse=True)
            self._json_response(queue)

        elif path == '/api/stats':
            data = load_data()
            t = today_str()
            ws = week_start_str()
            prospects = data['prospects']
            stats = {
                'total': len(prospects),
                'byStatus': {}, 'bySegment': {}, 'byTier': {},
                'commentsToday': 0, 'commentsThisWeek': 0, 'dmsToday': 0,
                'dueToday': 0, 'readyForSnapshot': 0,
                'warmthDistribution': {'cold': 0, 'warming': 0, 'warm': 0, 'hot': 0}
            }
            for p in prospects:
                s = p.get('status', 'new')
                stats['byStatus'][s] = stats['byStatus'].get(s, 0) + 1
                seg = p.get('segment', '')
                stats['bySegment'][seg] = stats['bySegment'].get(seg, 0) + 1
                tier = str(p.get('tier', ''))
                stats['byTier'][tier] = stats['byTier'].get(tier, 0) + 1
                if s == 'warming' and p.get('next_check_in', '') <= t:
                    stats['dueToday'] += 1
                wscore = p.get('warmth_score', 0)
                if wscore >= 5: stats['readyForSnapshot'] += 1
                if wscore == 0: stats['warmthDistribution']['cold'] += 1
                elif wscore < 3: stats['warmthDistribution']['warming'] += 1
                elif wscore < 5: stats['warmthDistribution']['warm'] += 1
                else: stats['warmthDistribution']['hot'] += 1
                for e in p.get('engagements', []):
                    if e.get('date') == t and e.get('type') == 'comment': stats['commentsToday'] += 1
                    if e.get('date', '') >= ws and e.get('type') == 'comment': stats['commentsThisWeek'] += 1
                    if e.get('date') == t and e.get('type') == 'dm': stats['dmsToday'] += 1
            self._json_response(stats)

        elif path == '/api/export/csv':
            data = load_data()
            headers = ['name','linkedin_url','company','title','segment','tier','icp_score','status','connected','warmth_score','check_in_days','next_check_in','last_engagement_date','engagements_count','notes','source','tags','batch','created_at']
            lines = [','.join(headers)]
            for p in data['prospects']:
                row = []
                for h in headers:
                    if h == 'connected': val = 'yes' if p.get('connected') else 'no'
                    elif h == 'engagements_count': val = str(len(p.get('engagements', [])))
                    elif h == 'tags': val = ';'.join(p.get('tags', []))
                    else: val = str(p.get(h, ''))
                    row.append('"' + val.replace('"', '""') + '"')
                lines.append(','.join(row))
            csv_text = '\n'.join(lines)
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv')
            self.send_header('Content-Disposition', 'attachment; filename=da_prospects_export.csv')
            self.end_headers()
            self.wfile.write(csv_text.encode())

        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_body()

        if path == '/api/import/urls':
            data = load_data()
            urls = body.get('urls', [])
            segment = body.get('segment', 'cyber')
            tier = body.get('tier', 1)
            tags = body.get('tags', [])
            check_in_days = body.get('check_in_days', 3)
            added, skipped, skipped_urls = 0, 0, []

            for url in urls:
                url = url.strip()
                if not url: continue
                if 'linkedin.com/in/' not in url:
                    skipped += 1
                    skipped_urls.append(url)
                    continue
                username = extract_username(url)
                normalized = f'https://www.linkedin.com/in/{username}'
                if any(extract_username(p.get('linkedin_url', '')) == username for p in data['prospects']):
                    skipped += 1
                    skipped_urls.append(url + ' (duplicate)')
                    continue
                data['prospects'].append({
                    'id': str(uuid.uuid4()),
                    'name': '', 'linkedin_url': normalized, 'linkedin_username': username,
                    'company': '', 'title': '', 'segment': segment, 'tier': tier,
                    'icp_score': 0, 'tags': tags, 'status': 'warming', 'connected': False,
                    'check_in_days': check_in_days, 'warmth_score': 0, 'engagements': [],
                    'next_check_in': today_str(), 'notes': '', 'source': 'sales_nav',
                    'batch': '', 'created_at': today_str()
                })
                added += 1

            save_data(data)
            self._json_response({'added': added, 'skipped': skipped, 'skippedUrls': skipped_urls})

        elif path == '/api/import/csv':
            data = load_data()
            rows = body.get('rows', [])
            added, skipped = 0, 0
            for row in rows:
                username = extract_username(row.get('linkedin_url', ''))
                name = row.get('name', '').strip()
                # Allow import by name even without LinkedIn URL
                if not username and not name:
                    skipped += 1; continue
                # Dedup by LinkedIn username if available, otherwise by name+company
                if username:
                    if any(p.get('linkedin_username') == username for p in data['prospects']):
                        skipped += 1; continue
                elif name:
                    company = row.get('company', '').strip()
                    if any(p.get('name','').lower() == name.lower() and p.get('company','').lower() == company.lower() for p in data['prospects']):
                        skipped += 1; continue
                data['prospects'].append({
                    'id': str(uuid.uuid4()),
                    'name': name, 'linkedin_url': row.get('linkedin_url', ''),
                    'linkedin_username': username,
                    'company': row.get('company', ''), 'title': row.get('title', ''),
                    'segment': row.get('segment', 'cyber'),
                    'tier': int(row.get('tier', 2) or 2),
                    'icp_score': float(row.get('icp_score', 0) or 0),
                    'tags': [t.strip() for t in row.get('tags', '').split(',') if t.strip()] if row.get('tags') else [],
                    'status': row.get('status', 'warming'), 'connected': row.get('connected') in ('yes', 'true', True),
                    'check_in_days': int(row.get('check_in_days', 3) or 3),
                    'warmth_score': int(row.get('warmth_score', 0) or 0), 'engagements': [],
                    'next_check_in': today_str(), 'notes': row.get('notes', ''),
                    'source': row.get('source', 'csv_import'), 'batch': row.get('batch', ''),
                    'created_at': today_str()
                })
                added += 1
            save_data(data)
            self._json_response({'added': added, 'skipped': skipped})

        elif path.startswith('/api/prospects/') and path.endswith('/engage'):
            pid = path.split('/')[3]
            data = load_data()
            p = next((x for x in data['prospects'] if x['id'] == pid), None)
            if not p: self._json_response({'error': 'Not found'}, 404); return
            etype = body.get('type', 'comment')
            note = body.get('note', '')
            t = today_str()
            p.setdefault('engagements', []).append({'type': etype, 'date': t, 'note': note})
            if etype == 'comment':
                p['warmth_score'] = p.get('warmth_score', 0) + 1
            elif etype == 'dm':
                p['warmth_score'] = p.get('warmth_score', 0) + 2
                p['status'] = 'outreach_sent'
                p['last_action'] = note or 'Sent DM'
                p['last_action_date'] = t
            p['next_check_in'] = calc_next_checkin(t, p.get('check_in_days', 3))
            p['last_engagement_date'] = t
            if p.get('warmth_score', 0) >= 5 and p.get('status') == 'warming':
                p['status'] = 'warm'
            save_data(data)
            self._json_response(p)

        elif path.startswith('/api/prospects/') and path.endswith('/skip'):
            pid = path.split('/')[3]
            data = load_data()
            p = next((x for x in data['prospects'] if x['id'] == pid), None)
            if not p: self._json_response({'error': 'Not found'}, 404); return
            p['next_check_in'] = calc_next_checkin(today_str(), p.get('check_in_days', 3))
            save_data(data)
            self._json_response(p)

        else:
            self._json_response({'error': 'Not found'}, 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/prospects/'):
            pid = path.split('/')[3]
            body = self._read_body()
            data = load_data()
            idx = next((i for i, p in enumerate(data['prospects']) if p['id'] == pid), None)
            if idx is None: self._json_response({'error': 'Not found'}, 404); return
            data['prospects'][idx].update(body)
            save_data(data)
            self._json_response(data['prospects'][idx])
        else:
            self._json_response({'error': 'Not found'}, 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/prospects/'):
            pid = path.split('/')[3]
            data = load_data()
            data['prospects'] = [p for p in data['prospects'] if p['id'] != pid]
            save_data(data)
            self._json_response({'ok': True})
        else:
            self._json_response({'error': 'Not found'}, 404)

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0: return {}
        return json.loads(self.rfile.read(length))

    def _json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass  # suppress request logs

if __name__ == '__main__':
    print(f'\n  DA Warming Dashboard running at http://localhost:{PORT}\n')
    server = http.server.HTTPServer(('', PORT), Handler)
    server.serve_forever()
