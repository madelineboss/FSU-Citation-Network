# Citation Network Visualization in FSU (mab22bb, Madeline Boss)

A small full-stack app that draws FSU's internal paper citation network (OpenAlex, 2021-2026) as an interactive D3 force-directed graph.

- **Backend** (`backend/`): Flask API. `GET /api/network` reads `data/paper_citation_links_within_fsu.csv` and returns `{nodes, links}`. Self-citations are removed and duplicate edges are counted as `value`.
- **Frontend** (`frontend/`): Vite page that fetches the API and draws the graph with D3 (zoom, pan, drag, zoom-to-fit, FSU red nodes).

## Run it

Terminal 1 (backend, port 5001):
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Terminal 2 (frontend, port 5173):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.